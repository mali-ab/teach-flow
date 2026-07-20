# TeachFlow - Screen share & participant sync fixes

## Steps
1. Fix frontend participant identity so local participant uses the same `participantId` persisted in `localStorage`.
2. Ensure `isSelf`, filtering, and `activeScreenShareParticipantId` work reliably.
3. Improve screen-share indicator rendering so the correct user is highlighted as sharing.
4. Re-run TypeScript checks / build for frontend.
5. Manual verification: two browsers/tabs in same room; toggle screen share and confirm indicator sync.


