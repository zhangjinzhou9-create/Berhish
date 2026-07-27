# Environment variables

CampusFlow reads deployment-specific values from environment variables. The
source repository contains only `.env.example`; the real `.env` file and Azure
secret values are not submitted or committed.

## Required production settings

| Variable | Purpose | Example or rule |
|---|---|---|
| `APP_BASE_URL` | Public origin used to build OAuth callbacks | Full HTTPS origin without a trailing slash |
| `PORT` | Spring Boot listening port | `8080` |
| `WEBSITES_PORT` | Azure container port | `8080` |
| `SPRING_PROFILES_ACTIVE` | Runtime configuration | `prod` on Azure |
| `WEBSITES_ENABLE_APP_SERVICE_STORAGE` | Preserve H2 and uploads | `true` |
| `SECURE_COOKIE` | Send the session only over HTTPS | `true` on Azure |
| `JWT_SECRET` | Signs the session token | Random value of at least 32 UTF-8 bytes |
| `ADMIN_USERNAME` | Provisions the administrator | Private value |
| `ADMIN_PASSWORD` | Administrator password | Private value, 12-72 UTF-8 bytes |

## OAuth settings

| Variable | Purpose |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth web client identifier |
| `GOOGLE_CLIENT_SECRET` | Google OAuth web client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth App identifier |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |

OAuth is optional for local development but configured for the published Azure
service. Provider callback values are documented in `OAUTH_SETUP.md`.

## Storage and logging

| Variable | Default | Purpose |
|---|---|---|
| `UPLOAD_DIR` | Profile-specific | Persistent portfolio media directory |
| `SPRING_DATASOURCE_URL` | Profile-specific | MySQL or H2 connection |
| `SPRING_DATASOURCE_USERNAME` | Profile-specific | Database account |
| `SPRING_DATASOURCE_PASSWORD` | Profile-specific | Database password |
| `LOG_LEVEL` | `INFO` | Root application log level |
| `MYSQL_ROOT_PASSWORD` | `campusflow-local` | Local Docker database only |

## Local configuration

For Docker Compose:

1. Copy `.env.example` to `.env`.
2. Replace every placeholder that will be used.
3. Run `docker compose up --build -d`.

For the supplied classroom launcher, no `.env` is required. `START_LOCAL.cmd`
uses the `classroom` profile, stores its H2 database and uploads under `data/`,
and leaves OAuth credentials unset. The published Azure service should be used
when third-party sign-in is part of the demonstration.

## Secret handling

- Do not commit `.env`.
- Do not place secret values in Markdown, screenshots, logs, or reports.
- Do not use a GitHub personal access token as an OAuth client secret.
- Rotate a credential if it has been copied into a public location.
