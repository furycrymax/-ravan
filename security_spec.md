# Security Specification: Psychology Master Exam Tracker

## 1. Data Invariants
1. **Identity Isolation**: A user can strictly only read, create, update, or list documents within their own document hierarchy (`/users/{userId}/**` where `request.auth.uid == userId`).
2. **Path Hardening**: Path parameters `{userId}`, `{chapterId}`, and `{researchId}` must be valid alphanumeric/hyphen/underscore identifiers under 128 characters.
3. **Data Integrity**: Every progress entry must bind `userId` to `request.auth.uid` and provide valid `chapterId` and allowable `status` ('not_started', 'in_progress', 'completed', 'review_needed').
4. **Field Boundaries**: Personal notes must not exceed 5000 characters to prevent wallet-exhaustion attacks.
5. **No Cross-User Leakage**: Blanket queries across `/users` are strictly forbidden. Users cannot inspect other candidates' study progress or notes.

## 2. The "Dirty Dozen" Threat Payloads
1. **Unauthenticated Read**: Attempting to fetch `/users/{user1}/progress/{ch1}` with no auth token. Expect: DENY.
2. **Cross-User Snooping**: User A authenticated attempting to read `/users/{userB}/progress/{ch1}`. Expect: DENY.
3. **Identity Spoofing**: User A attempting to write `/users/{userA}/progress/{ch1}` with payload `{ userId: 'userB' }`. Expect: DENY.
4. **ID Poisoning Attack**: User attempting to create `/users/$$$malicious#junk/progress/ch1`. Expect: DENY.
5. **Unbounded Notes Attack (Denial of Wallet)**: Progress update with 2MB string notes. Expect: DENY.
6. **Invalid Status Injection**: Status set to `'hacked_mastery'`. Expect: DENY.
7. **Cross-User Listing**: User A attempting to list `/users/{userB}/progress`. Expect: DENY.
8. **Global Catch-All Probe**: Probing arbitrary collection `/admin_secrets` or `/system_config`. Expect: DENY.
9. **Research Document Hijacking**: User A attempting to overwrite User B's research document. Expect: DENY.
10. **Ghost Key Injection**: Attempting to inject system fields like `isAdmin: true` into `UserProfile`. Expect: DENY.
11. **Negative Score Poisoning**: Attempting to save `testScore: -999` or `rating: 100`. Expect: DENY.
12. **Blanket Collection Group Scan**: Running an unconstrained collectionGroup query across all users' progress. Expect: DENY.
