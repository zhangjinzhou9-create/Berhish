# CampusFlow

CampusFlow is a desktop-first personal portfolio web service built for the Web
Service course project. One Spring Boot application serves the designed
frontend and REST API, manages accounts and authorization, stores profile and
portfolio data, and integrates weather, country, Google, and GitHub services.

## What the application demonstrates

- **Today** is the default guest page. It shows the current Japan date, a
  selected location, country information, live weather, and weather-based advice.
- **Portfolio** shows a featured public profile and four distinct works. Signed-in
  users can turn their page into a resume, photography set, illustration
  collection, design archive, or mixed portfolio.
- **Account** supports guest browsing, local registration and sign-in, and
  optional Google or GitHub authorization. Signed-in users can edit their own
  profile, save a usual place, and manage their own works.
- The interface can be switched between English, Japanese, and Chinese.

## Technology

| Layer | Implementation |
|---|---|
| Frontend | HTML, CSS, JavaScript, GSAP |
| Backend | Java 17, Spring Boot, Spring Security |
| Local database | MySQL 8 in Docker Compose |
| Cloud database | Persistent H2 file under Azure App Service `/home` |
| API description | OpenAPI 3.0 |
| Delivery | Docker, Docker Hub, Azure App Service |

## Security

- Local passwords are never returned to the browser and are stored as BCrypt
  hashes.
- Authentication uses an HttpOnly `campusflow_session` cookie.
- State-changing browser requests require an `X-XSRF-TOKEN` CSRF header.
- Public registration always creates a normal `USER`.
- Profile and portfolio writes are restricted to the signed-in owner.
- Administrator routes require a separately configured server-side account.
- OAuth client secrets, the JWT secret, and administrator credentials are
  supplied through environment variables and are not committed.

## Run locally

1. Copy `.env.example` to `.env` and add OAuth credentials only if those two
   providers will be demonstrated.
2. Start the application and MySQL:

```powershell
cd C:\ProgramData\campusflow
docker compose up --build -d
```

3. Open:

```text
http://localhost:8080/index.html
```

Useful checks:

```powershell
docker compose ps
docker logs --tail 100 campus-flow-app
curl.exe http://localhost:8080/api/auth/me
curl.exe http://localhost:8080/api/profile
curl.exe http://localhost:8080/api/portfolio
```

Stop the local service with:

```powershell
docker compose down
```

The MySQL data volume is preserved unless it is explicitly removed.

## Build and tests

```powershell
cd C:\ProgramData\campusflow\backend
docker build --tag campus-flow:release .
```

The Docker build runs the regression suite. It covers registration restrictions,
BCrypt login, cookies, CSRF, ownership, administrator authorization, guest
content, multilingual production UI invariants, Japan date/time behavior, and
OAuth redirect generation.

## Main API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/home` | Country, city, weather, and daily advice |
| GET/POST | `/api/profile` | Read public/owner profile; save owner profile |
| GET/POST | `/api/portfolio` | Read works; create an owned work |
| PUT/DELETE | `/api/portfolio/{id}` | Update or remove an owned work |
| POST | `/api/register` | Create a normal local account |
| POST | `/api/authenticate` | Sign in with username and password |
| GET | `/api/auth/me` | Restore the current account or guest state |
| POST | `/api/auth/logout` | End the current session |
| GET/PATCH | `/api/admin/users...` | Administrator account management |

The complete OpenAPI document is available at
`http://localhost:8080/openapi.yaml`.

## Submission documents

- [Final presentation](output/presentation/CampusFlow_Final_Presentation.pptx)
- [Live demonstration script](output/presentation/CampusFlow_Live_Demo_Script.docx)
- [Runnable JAR](output/submission/CampusFlow.jar)
- [Project structure](docs/architecture/PROJECT_STRUCTURE.md)
- [Course report](output/pdf/CampusFlow_Report.pdf)
- [Assignment requirements](docs/course/REQUIREMENTS.md)
- [Azure configuration](docs/deployment/AZURE_PORTAL_DEPLOYMENT.md)
- [OAuth configuration](docs/deployment/OAUTH_SETUP.md)

## Published service

- Docker Hub: `berhish/campus-flow`
- Azure:
  `https://campusflow-final-0724-grbzdrczdqdyhyea.japanwest-01.azurewebsites.net`
