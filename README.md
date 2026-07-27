# CampusFlow

CampusFlow is a desktop-first portfolio web service developed for the Web
Service course project. One Spring Boot application serves the browser client
and REST API, manages accounts and authorization, stores user profiles and
portfolio media, and combines external weather and country data.

## Start here

The final Azure service is available at:

https://campusflow-final-0724-grbzdrczdqdyhyea.japanwest-01.azurewebsites.net

On Windows, double-click `OPEN_CAMPUSFLOW.url` to open the published service.

To run the compiled submission locally, install Java 17 or newer and
double-click `START_LOCAL.cmd`. This starts the supplied JAR with a local H2
database and opens:

```text
http://localhost:8080/index.html
```

Close the window titled `CampusFlow Server` to stop the local service.
Third-party sign-in is configured on the published Azure version; the local
launcher is intended for guest browsing, registration, profile editing, and
portfolio testing.

## Main functions

- **Today** is the default guest page. It combines a selected location,
  REST Countries information, Open-Meteo weather, and weather-based advice.
- **Portfolio** provides preset guest content. Signed-in users receive their
  own persistent page and can upload image, audio, or text works.
- Portfolio presentation controls support standard, wide, and tall cards plus
  complete-image or frame-filling image display.
- **Account** supports guest browsing, local registration and sign-in, and
  Google or GitHub sign-in.
- Signed-in users can edit their profile, choose a preset identity title, save
  a usual place, and manage only their own work.
- The complete interface is available in English, Japanese, and Simplified
  Chinese.

## Technology

| Layer | Implementation |
|---|---|
| Frontend | HTML, CSS, JavaScript, GSAP |
| Backend | Java 17, Spring Boot, Spring Security |
| Local database | MySQL 8 with Docker Compose or H2 with the classroom launcher |
| Cloud database | Persistent H2 file in Azure App Service storage |
| Media storage | Local volume or Azure `/home/campusflow/uploads` |
| External services | Open-Meteo, REST Countries, Google OAuth, GitHub OAuth |
| Delivery | Docker, Docker Hub, Azure App Service |

## Docker development

1. Copy `.env.example` to `.env`.
2. Add OAuth credentials only when local third-party sign-in is required.
3. Start the application and MySQL:

```powershell
docker compose up --build -d
```

Useful checks:

```powershell
docker compose ps
docker logs --tail 100 campus-flow-app
curl.exe http://localhost:8080/api/auth/me
curl.exe http://localhost:8080/api/profile
curl.exe http://localhost:8080/api/portfolio
```

Stop the service with `docker compose down`. Database and upload volumes remain
available until they are explicitly removed.

## Security

- Local passwords are stored as BCrypt hashes and never returned to the client.
- Authentication uses an HttpOnly `campusflow_session` cookie.
- State-changing requests require an `X-XSRF-TOKEN` CSRF header.
- Public registration can create only a normal `USER`.
- Profile, media, and portfolio writes are restricted to the signed-in owner.
- Administrator access is provisioned only through server environment variables.
- OAuth secrets, signing secrets, and administrator credentials are excluded
  from source control and the submission archive.

## Documentation

- [Personal project report](output/pdf/CampusFlow_Report.pdf)
- [Project structure](docs/architecture/PROJECT_STRUCTURE.md)
- [Course requirement checklist](docs/course/REQUIREMENTS.md)
- [Environment variables](docs/deployment/ENVIRONMENT_VARIABLES.md)
- [Azure deployment](docs/deployment/AZURE_PORTAL_DEPLOYMENT.md)
- [OAuth configuration](docs/deployment/OAUTH_SETUP.md)
- [OpenAPI document](backend/src/main/resources/static/openapi.yaml)
- [Release history](CHANGELOG.md)

## Release

- Runnable JAR: `output/submission/CampusFlow.jar`
- Docker image: `berhish/campus-flow:release-20260727-oauth`
- Azure Web App: `campusflow-final-0724`
