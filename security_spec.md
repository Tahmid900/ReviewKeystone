# Security Specification — ReviewKeystone

## 1. Data Invariants
- Every review document at `/reviews/{reviewId}` must have a valid alphanumeric/underscore/hyphen `reviewId` (`<= 128` chars).
- Only signed-in users with a verified email (`request.auth.token.email_verified == true`) may create a review, and `authorId` must strictly equal `request.auth.uid`.
- No PII fields (`email`, `phone`, `address`) are stored inside `/reviews/{reviewId}`.
- `rating` must be an integer between `1` and `5` inclusive.
- `authorName` must be a non-empty string (`1..80` chars); `businessName` (optional) `0..100` chars; `comment` `5..1500` chars.
- `imageUrls` must be a list of at most `2` strings, each capped at `250000` bytes and starting with `data:image/`.
- `status` must equal `'published'` on creation.
- `createdAt` must strictly equal `request.time` (server timestamp).
- Reviews are immutable once published (no client updates), and may only be deleted by their original author (`existing().authorId == request.auth.uid`) or the bootstrapped admin (`md.tahmidbhuyan009@gmail.com` with `email_verified == true`).
- Public `get` and `list` queries are only permitted where `resource.data.status == 'published'`.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Create**: Create `/reviews/rev1` with `request.auth == null`.
2. **Unverified Email Create**: Create `/reviews/rev1` with `email_verified: false`.
3. **Identity Spoofing**: Create `/reviews/rev1` with `authorId: "other_uid"` != `request.auth.uid`.
4. **Shadow / Ghost Field Injection**: Create `/reviews/rev1` with extra field `isVerified: true` or `email: "leak@example.com"`.
5. **Invalid ID Poisoning**: Create `/reviews/invalid..id!@#` or a 500-char document ID.
6. **Rating Out of Range**: Create `/reviews/rev1` with `rating: 6` or `rating: 0` or `rating: 4.5` (float).
7. **Timestamp Forgery**: Create `/reviews/rev1` with client-supplied `createdAt` != `request.time`.
8. **Oversized Comment**: Create `/reviews/rev1` with a 5,000-character `comment`.
9. **Array Overflow**: Create `/reviews/rev1` with 3 `imageUrls` items (exceeds max 2).
10. **Payload Size / Non-Image Injection**: Create `/reviews/rev1` with `imageUrls: ["javascript:alert(1)"]` or a 900KB string.
11. **Unauthorized Update**: Attempt `update` on `/reviews/rev1` by either author or another user.
12. **Unauthorized Delete**: Attempt `delete` on `/reviews/rev1` by a user whose `uid != authorId` and is not admin.
