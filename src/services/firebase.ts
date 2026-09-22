import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  Firestore,
  doc,
  getDocFromServer,
  setDoc,
  collection,
  onSnapshot,
  query,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { ChapterProgress, UserProgressRecord, UserProgressMap, ChapterUserData, StudyStatus } from "../types";

// Initialize Firebase
const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

// CRITICAL: The app requires specifying the firestoreDatabaseId if configured
// Using experimentalForceLongPolling to prevent iframe proxy WebChannel streaming connection failures
const databaseId = (firebaseConfig as any).firestoreDatabaseId;
let dbInstance: Firestore;
try {
  dbInstance = databaseId
    ? initializeFirestore(app, { experimentalForceLongPolling: true }, databaseId)
    : initializeFirestore(app, { experimentalForceLongPolling: true });
} catch {
  dbInstance = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}

export const db = dbInstance;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection to Firestore
export async function testConnection(): Promise<void> {
  // If the browser is currently offline or running initial handshake, don't spam errors
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return;
  }
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    // When unauthenticated or testing empty collection, permission-denied is expected by security rules
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("the client is offline")) {
      console.warn("Firestore running in offline/local cache mode until network handshake succeeds.");
    }
  }
}

// Auth operations
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Automatically save or update user profile document
    if (result.user) {
      await saveUserProfile(result.user.uid, {
        userId: result.user.uid,
        email: result.user.email || "",
        displayName: result.user.displayName || "داوطلب کنکور",
        photoURL: result.user.photoURL || "",
        updatedAt: new Date().toISOString(),
      });
    }
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-Out Error:", error);
    throw error;
  }
}

// User Profile
export async function saveUserProfile(
  userId: string,
  profileData: Record<string, unknown>
): Promise<void> {
  const path = `users/${userId}`;
  try {
    const ref = doc(db, "users", userId);
    await setDoc(ref, profileData, { merge: true });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    if (
      errMessage.includes("insufficient permissions") ||
      errMessage.includes("permission-denied")
    ) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } else {
      console.warn("Firestore save user profile notice:", errMessage);
    }
  }
}

// Chapter Progress Firestore persistence
export async function saveChapterProgressToCloud(
  userId: string,
  chapterId: string,
  progress: Partial<ChapterProgress>
): Promise<void> {
  const path = `users/${userId}/progress/${chapterId}`;
  try {
    const ref = doc(db, "users", userId, "progress", chapterId);
    const payload = {
      ...progress,
      userId,
      chapterId,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(ref, payload, { merge: true });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    if (
      errMessage.includes("insufficient permissions") ||
      errMessage.includes("permission-denied")
    ) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } else {
      console.warn("Firestore save progress notice (offline mode active):", errMessage);
    }
  }
}

export interface ManualSyncResult {
  mergedCount: number;
  uploadedCount: number;
  downloadedCount: number;
  mergedProgress: UserProgressMap;
}

/**
 * Manually trigger bidirectional synchronization between localStorage userProgress and Firestore.
 * Merges local changes and cloud state, uploading missing/updated local chapters and pulling cloud data.
 */
export async function syncProgressBidirectional(
  userId: string,
  localProgress: UserProgressMap
): Promise<ManualSyncResult> {
  const path = `users/${userId}/progress`;
  try {
    const progressCol = collection(db, "users", userId, "progress");
    const snapshot = await getDocs(progressCol);

    const cloudMap: Record<string, ChapterProgress> = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as ChapterProgress;
      if (data.chapterId) {
        cloudMap[data.chapterId] = data;
      }
    });

    const merged: UserProgressMap = { ...localProgress };
    let uploadedCount = 0;
    let downloadedCount = 0;
    const batch = writeBatch(db);
    let batchOperations = 0;

    // 1. Process cloud items into local state
    Object.entries(cloudMap).forEach(([chapterId, cloudItem]) => {
      const localItem = localProgress[chapterId];
      if (!localItem) {
        // Exists in cloud but not local: download
        merged[chapterId] = {
          status: (cloudItem.status as StudyStatus) || 'not_started',
          notes: cloudItem.notes || '',
          readBookText: cloudItem.status === 'mastered',
          doneTrainingTests: false,
          doneReviewTests: false,
          lastStudiedDate: cloudItem.lastStudiedAt,
        };
        downloadedCount++;
      } else {
        // Exists in both: merge latest notes and status
        const cloudTime = cloudItem.lastStudiedAt ? new Date(cloudItem.lastStudiedAt).getTime() : 0;
        const localTime = localItem.lastStudiedDate ? new Date(localItem.lastStudiedDate).getTime() : 0;

        if (cloudTime > localTime) {
          merged[chapterId] = {
            ...localItem,
            status: cloudItem.status as StudyStatus,
            notes: cloudItem.notes || localItem.notes,
            lastStudiedDate: cloudItem.lastStudiedAt,
          };
          downloadedCount++;
        }
      }
    });

    // 2. Identify local items that need to be uploaded to cloud
    Object.entries(localProgress).forEach(([chapterId, localItem]) => {
      if (localItem.status === 'not_started' && !localItem.notes?.trim()) {
        return; // Don't upload blank chapters
      }

      const cloudItem = cloudMap[chapterId];
      const localTime = localItem.lastStudiedDate ? new Date(localItem.lastStudiedDate).getTime() : 0;
      const cloudTime = cloudItem?.lastStudiedAt ? new Date(cloudItem.lastStudiedAt).getTime() : 0;

      if (!cloudItem || localTime >= cloudTime) {
        const docRef = doc(db, "users", userId, "progress", chapterId);
        batch.set(
          docRef,
          {
            userId,
            chapterId,
            status: localItem.status,
            notes: localItem.notes || '',
            lastStudiedAt: localItem.lastStudiedDate || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        batchOperations++;
        uploadedCount++;
      }
    });

    if (batchOperations > 0) {
      await batch.commit();
    }

    return {
      mergedCount: Object.keys(merged).length,
      uploadedCount,
      downloadedCount,
      mergedProgress: merged,
    };
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    if (
      errMessage.includes("insufficient permissions") ||
      errMessage.includes("permission-denied")
    ) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    throw error;
  }
}

// Subscribe to all chapter progresses for a user
export function subscribeToUserProgress(
  userId: string,
  onUpdate: (progressMap: UserProgressRecord) => void,
  onError?: (err: unknown) => void
): () => void {
  const path = `users/${userId}/progress`;
  try {
    const progressCol = collection(db, "users", userId, "progress");
    const q = query(progressCol);

    return onSnapshot(
      q,
      (snapshot) => {
        const map: UserProgressRecord = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as ChapterProgress;
          if (data.chapterId) {
            map[data.chapterId] = {
              chapterId: data.chapterId,
              status: data.status || "not_started",
              notes: data.notes || "",
              rating: data.rating,
              testScore: data.testScore,
              lastStudiedAt: data.lastStudiedAt,
            };
          }
        });
        onUpdate(map);
      },
      (error) => {
        if (onError) onError(error);
        const errMessage = error instanceof Error ? error.message : String(error);
        if (
          errMessage.includes("insufficient permissions") ||
          errMessage.includes("permission-denied")
        ) {
          handleFirestoreError(error, OperationType.GET, path);
        } else {
          console.warn("Firestore progress subscription notice:", errMessage);
        }
      }
    );
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    if (
      errMessage.includes("insufficient permissions") ||
      errMessage.includes("permission-denied")
    ) {
      handleFirestoreError(error, OperationType.LIST, path);
    } else {
      console.warn("Firestore listen collection notice:", errMessage);
    }
    return () => {};
  }
}

// Grounded Research Persistence
export interface SavedResearchItem {
  id: string;
  userId: string;
  query: string;
  chapterId?: string;
  topic?: string;
  responseText: string;
  sources: Array<{ title: string; uri: string }>;
  createdAt: string;
}

export async function saveResearchToCloud(
  userId: string,
  research: Omit<SavedResearchItem, "userId">
): Promise<void> {
  const path = `users/${userId}/researches/${research.id}`;
  try {
    const ref = doc(db, "users", userId, "researches", research.id);
    await setDoc(ref, {
      ...research,
      userId,
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    if (
      errMessage.includes("insufficient permissions") ||
      errMessage.includes("permission-denied")
    ) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } else {
      console.warn("Firestore save research notice:", errMessage);
    }
  }
}

export function subscribeToUserResearches(
  userId: string,
  onUpdate: (items: SavedResearchItem[]) => void
): () => void {
  const path = `users/${userId}/researches`;
  try {
    const ref = collection(db, "users", userId, "researches");
    return onSnapshot(
      ref,
      (snapshot) => {
        const list: SavedResearchItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as SavedResearchItem);
        });
        // Sort descending by date
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(list);
      },
      (error) => {
        const errMessage = error instanceof Error ? error.message : String(error);
        if (
          errMessage.includes("insufficient permissions") ||
          errMessage.includes("permission-denied")
        ) {
          handleFirestoreError(error, OperationType.LIST, path);
        } else {
          console.warn("Firestore research subscription notice:", errMessage);
        }
      }
    );
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    if (
      errMessage.includes("insufficient permissions") ||
      errMessage.includes("permission-denied")
    ) {
      handleFirestoreError(error, OperationType.LIST, path);
    } else {
      console.warn("Firestore collection listen notice:", errMessage);
    }
    return () => {};
  }
}
