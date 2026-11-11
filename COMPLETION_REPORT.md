# NEX MARKET — implementation status

**Incomplete and not production-ready.**

The previous managed backend was replaced with standard PostgreSQL (`pg`) and self-hosted database sessions; no Supabase SDK, Auth, Storage or hosted database is used by the application. The schema includes users, hashed sessions and email tokens alongside marketplace tables. PostgreSQL is accessed only on the server, and authorization is checked in application code. This schema does not enable RLS and must not be exposed directly to clients.

Implemented code includes database-backed catalog, basic authentication with SMTP email confirmation and password reset, local cart, COD checkout function, favorites, orders, and a limited admin panel. Payments and media uploads remain unimplemented. Database and SMTP are unconfigured in a fresh deployment. There is no migration of existing customer data from the previous backend.

Verification in this environment: `npm run typecheck`, `npm run lint` (four image warnings), `npm test` (8 tests including PGlite migration/seed and three checkout checks). Real hosted PostgreSQL, SMTP, auth E2E, distributed rate limiting, browser behavior and concurrent checkout have not been verified. `npm run build` also passed with no database configured. Run a fresh production build after configuration. Review `npm audit` results before production.

Outstanding work and limitations are tracked in `DEVELOPMENT_CHECKLIST.md`.
