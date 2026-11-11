# NEX MARKET — browser-only mode

This version deliberately has no database or server-side persistent storage. Products and photos are created by the user, stored only in the current browser, and are never a shared marketplace catalogue. Cart and favorites are also browser-local. A JSON backup can be exported and restored. The application does not create real orders, accept payments, authenticate users, enforce server-side prices, or provide a real admin panel. It must not be represented as a production store.

The previous database-backed implementation is preserved in Git history but is not used by this version. Browser storage can be cleared or unavailable, is not confidential from other users of the same device, has quota limits and does not synchronize between devices. The deployment does not require a database or secret keys. Test status and incomplete browser/security checks are in the final task response and `DEVELOPMENT_CHECKLIST.md`.

Verification: `npm run typecheck` passed, `npm run lint` passed with three image warnings, `npm test` passed 5 tests (local storage logic and product form), and `npm run build` passed. Full real-browser E2E and multi-tab testing were not performed.
