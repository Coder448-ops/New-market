# NEX MARKET — development checklist

Status: **incomplete; do not deploy as a production marketplace**. This is a persistent handoff, not a claim of production readiness.

- [x] Foundation, dependencies, layout, basic responsive navigation
- [x] Initial schema, RLS declarations, seed data and Supabase client setup
- [x] Basic database-backed home, catalog, search, product page
- [x] Basic auth, profile, local cart, COD checkout and order history code
- [x] Admin authorization, dashboard, limited product/inventory/order/review management code
- [x] Typecheck, lint, unit/static tests, production build in unconfigured environment
- [ ] Apply and test migration and seed against a real Supabase project, test every RLS policy and concurrent checkout. SQL has not been executed here.
- [ ] Fully implement customer cart synchronization, addresses, comprehensive product gallery/specifications and search/category features
- [ ] Complete all admin CRUD, variants, uploads, order cancellation/restocking, reporting, filters, settings and banners
- [ ] Implement Payme and Click protocols and reconciliation against provider sandboxes; both deliberately disabled
- [ ] Complete storage uploads/deletion and image validation
- [ ] Replace provisional policies/contact content with merchant-approved legal and business information
- [ ] Add distributed rate limiting, body-size enforcement at edge, security review and production dependency audit remediation
- [ ] Add full integration and browser tests including permissions, auth and stock contention; test responsive breakpoints
- [ ] Production SEO, pagination at scale, accessible interactions and image optimization
