# Changelog

## 2026-07-24 — Formal course-presentation release

### Frontend

- Reworked the desktop-only experience into three distinct pages: Today,
  Portfolio, and Account.
- Preserved the Japanese editorial, paper-collage visual system while removing
  classroom/debug labels and competing decoration.
- Unified navigation and interface copy by active language (English or Chinese).
- Made Today the default page and connected its date, weather, location, and
  weather-dependent advice to live backend data.
- Replaced repeated portfolio images and speculative captions with four unique
  photographs and factual descriptions.
- Removed the duplicate Portfolio title rule and corrected title spacing.
- Restored sign-in as a focused modal opened from the Account primary action.
- Kept the account summary hidden for guests and visible only after sign-in.

### Backend and security

- Added local registration, sign-in, sign-out, session restoration, and roles.
- Added BCrypt password hashing and an HttpOnly session cookie.
- Added CSRF protection for state-changing browser requests.
- Added per-user profile, saved location, and portfolio persistence.
- Added administrator-only user listing and account enable/disable controls.
- Added GitHub and Google OAuth account linking with authorized avatar/name data.
- Added regression coverage for role restrictions, password hashing, cookies,
  CSRF, forged tokens, and Japan date/time behavior.

### Delivery

- Docker build runs the full Maven regression suite.
- Published Docker Hub tags:
  - `berhish/campus-flow:formal-20260724`
  - `berhish/campus-flow:latest`
- Published image digest:
  `sha256:4ec8359bb8d1026401b8601e950c155a5e1d21d884242267bd38f4c39525e511`
- Added an Azure App Service portal configuration checklist.
