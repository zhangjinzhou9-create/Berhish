# CampusFlow

CampusFlow is a desktop-first Spring Boot portfolio site prepared for a course
presentation. Its three pages keep the same editorial visual language while the
content is backed by real accounts, profiles, saved locations, portfolio items,
OAuth identities, and MySQL data.

## Presentation flow

1. **Today** is the default guest page and shows the current date plus the
   featured user's saved country and city.
2. **Portfolio** presents photography, drawing, design, project, and note items.
3. **Account** supports guest browsing, local registration/sign-in, Google or
   GitHub sign-in, and a separate administrator account.

Registered users can edit only their own profile, save a daily location, and
manage their own portfolio. Public registration always creates a `USER`;
`ADMIN` is supplied only through server environment variables.

## Security model

- Password inputs use `type="password"` and never contain preset values.
- Local passwords are stored as BCrypt hashes.
- The browser receives an HttpOnly `campusflow_session` cookie.
- State-changing browser requests require an `X-XSRF-TOKEN` CSRF header.
- OAuth accounts save the provider identity, authorized display name, and
  avatar URL.
- Guests have read-only access to the featured public profile and portfolio.
- Administrators can list and enable or disable accounts; ordinary users
  receive `403` for administrator routes.

## Local structure

```text
backend/                                  Spring Boot application
backend/src/main/java/com/example/resumeapp/
  config/SecurityConfig.java              Browser security and OAuth flow
  controller/AuthController.java          Registration, sign-in, session, admin
  controller/ProfileController.java       Profile and Today APIs
  controller/PortfolioController.java     Portfolio CRUD API
  service/AccountService.java             Users, roles, OAuth linking, BCrypt
  service/ProfileService.java             Per-user profile persistence
  service/PortfolioService.java           Per-user portfolio persistence
backend/src/main/resources/static/        HTML, CSS, motion, images, OpenAPI
database/init/                            Existing MySQL initialization files
opendesign/                               Design-system and mockup source
backups/                                  Local database migration backups
```

## Current local presentation service

The verified presentation instance runs at:

```text
http://localhost:8081/index.html
```

MySQL is exposed only to the local machine on port `3308`. The active app
container is `campus-flow-local-link`, and the pre-migration app container is
kept stopped as `campus-flow-local-link-legacy-20260723`.

Useful checks:

```powershell
docker ps --filter name=campus-flow
docker logs --tail 100 campus-flow-local-link
curl.exe http://localhost:8081/api/profile
curl.exe http://localhost:8081/api/portfolio
curl.exe http://localhost:8081/openapi.yaml
```

## Build and test

The Docker build uses Java 17 and runs the regression suite:

```powershell
cd C:\ProgramData\campusflow\backend
docker build --tag campus-flow:formal-local .
```

The regression suite covers public registration restrictions, BCrypt login,
cookie authentication, CSRF-protected profile writes, forged-token rejection,
and Japan time/date behavior.

## OAuth callback URLs

For the current local service, the provider consoles must contain these exact
authorized redirect URIs:

```text
http://localhost:8081/login/oauth2/code/google
http://localhost:8081/login/oauth2/code/github
```

OAuth client IDs and secrets belong in the local `.env` file and must not be
committed. The application constructs provider callbacks from `APP_BASE_URL`.

## API documentation

The complete OpenAPI file is served at:

```text
http://localhost:8081/openapi.yaml
```

Primary endpoints:

```text
GET    /api/csrf
POST   /api/register
POST   /api/authenticate
GET    /api/auth/me
POST   /api/auth/logout
GET    /api/home
GET    /api/profile
POST   /api/profile
GET    /api/portfolio
POST   /api/portfolio
PUT    /api/portfolio/{id}
DELETE /api/portfolio/{id}
GET    /api/admin/users
PATCH  /api/admin/users/{id}
```

## Published container and Azure

The verified presentation image is available from Docker Hub:

```text
berhish/campus-flow:formal-20260724
sha256:4ec8359bb8d1026401b8601e950c155a5e1d21d884242267bd38f4c39525e511
```

The fixed tag and `latest` currently point to the same build. Azure App Service
portal values, environment variables, OAuth callbacks, and verification URLs
are documented in
[`docs/AZURE_PORTAL_DEPLOYMENT.md`](docs/AZURE_PORTAL_DEPLOYMENT.md).

Release details are recorded in [`CHANGELOG.md`](CHANGELOG.md).
