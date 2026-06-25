# Campus Flow

Campus Flow is a Spring Boot web application with a browser frontend. It combines a student resume/profile page, country and weather APIs, JWT authentication, OAuth login, MySQL persistence, Docker, and cloud deployment preparation.

Student: `ZHU FUXIN / シュフシン / M25W7195`

## Main Features

- Home page search by country and city
- Resume/profile page with MySQL persistence
- REST Countries and Open-Meteo API integration
- JWT login and role-based API authorization
- HTTPS local profile for TLS testing
- OAuth 2.0 login with Google Calendar API and GitHub API
- Docker Compose setup with an app container and a MySQL sidecar container
- Classroom-friendly visual style and a compact login status area in the sidebar

## Project Structure

```text
backend/                                  Spring Boot application
backend/src/main/java/com/example/resumeapp/
  ResumeAppApplication.java               Application entry point
  config/SecurityConfig.java              Spring Security, OAuth, and logout flow
  controller/ProfileController.java       Profile and Home API route entry
  controller/AuthController.java          JWT login and role API route entry
  controller/OAuthApiController.java      Google Calendar and GitHub API route entry
  controller/JwtUtil.java                 Small classroom JWT helper
  service/ProfileService.java             Profile database read/write logic
  service/HomeService.java                Country, weather, and life-tip logic
backend/src/main/resources/static/        Frontend HTML, CSS, JavaScript, and images
database/init/                            MySQL initialization scripts for Docker
database/report_screenshots/              Screenshots used in report.md and PDF
docker-compose.yml                        App + MySQL sidecar container setup
OAUTH_SETUP.md                            OAuth setup notes
report.md                                 Project report
```

## Requirements

- Java 17 or newer
- MySQL running on port `3307` for normal local development
- Docker Desktop for Docker Compose testing
- Docker Hub account for image publishing

Default local database settings:

```text
Database: user_db2
User: root
Password: pass
```

The application can still open with fallback profile data if MySQL is not running, but database persistence tests need MySQL.

## Run with Docker Desktop

The Docker version runs the Spring Boot app and MySQL together.

```powershell
cd C:\Users\佩索阿\Documents\CampusFlow_Deployment
docker compose build
docker compose up -d
```

Open:

```text
http://localhost:8080/index.html
http://localhost:8080/api/home
http://localhost:8080/api/profile
```

Check containers and logs:

```powershell
docker compose ps
docker compose logs app
docker compose logs mysql
```

Stop containers:

```powershell
docker compose down
```

For a clean database restart:

```powershell
docker compose down -v
docker compose up -d
```

Local Docker OAuth callback URLs:

```text
http://localhost:8080/login/oauth2/code/github
http://localhost:8080/login/oauth2/code/google
```

For cloud deployment, add the deployed HTTPS URL to the GitHub OAuth App and Google Cloud Console.

## Run with HTTP

```powershell
cd C:\Users\佩索阿\Documents\CampusFlow_Deployment\backend
.\mvnw.cmd clean package -DskipTests
java -jar target\resumeapp-0.0.1-SNAPSHOT.jar
```

Open:

```text
http://localhost:8080/index.html
http://localhost:8080/api-docs.html
```

## Run with HTTPS for TLS and OAuth

```powershell
cd C:\Users\佩索阿\Documents\CampusFlow_Deployment\backend
.\mvnw.cmd clean package -DskipTests
java -jar target\resumeapp-0.0.1-SNAPSHOT.jar --spring.profiles.active=local
```

Open:

```text
https://localhost:8443/index.html
```

The local certificate is self-signed. If the browser shows a warning, choose the advanced option and continue for local testing.

## OAuth Setup

The full OAuth flow needs valid Google and GitHub OAuth credentials. Do not commit client secrets.

Set environment variables before running the HTTPS profile:

```powershell
$env:GITHUB_CLIENT_ID="your-github-client-id"
$env:GITHUB_CLIENT_SECRET="your-github-client-secret"
$env:GOOGLE_CLIENT_ID="your-google-client-id"
$env:GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Use these callback URLs when creating OAuth apps:

```text
https://localhost:8443/login/oauth2/code/github
https://localhost:8443/login/oauth2/code/google
```

For Google Cloud, enable Google Calendar API and add the testing Gmail account as an OAuth test user. More setup notes are in `OAUTH_SETUP.md`.

## Main API Endpoints

```text
GET  /api/home
GET  /api/home?country=Japan&city=Tokyo
GET  /api/profile
POST /api/profile
```

OAuth API endpoints:

```text
GET /api/oauth/status
GET /api/oauth/github/profile
GET /api/oauth/github/repos
GET /api/oauth/google/calendar
```

JWT authentication endpoints:

```text
POST /api/authenticate
POST /api/register
GET  /api/verify
GET  /api/student-area
GET  /api/teacher-area
GET  /api/admin-area
```

Default JWT test users:

```text
student / pass / STUDENT
teacher / pass / TEACHER
admin   / pass / ADMIN
```

## Docker Hub and Azure

```powershell
docker tag campus-flow:deployment berhish/campus-flow:latest
docker push berhish/campus-flow:latest
```

Docker Hub repository:

```text
https://hub.docker.com/r/berhish/campus-flow
```

Azure App Service should use:

```text
Registry URL: https://index.docker.io
Image: berhish/campus-flow:latest
Port: 8080
```

## Reproduction Checklist

1. Start the app with Docker Compose or the Spring Boot Maven command.
2. Open `http://localhost:8080/index.html`.
3. Test `/api/home` and `/api/profile` from browser, Postman, or Swagger UI.
4. Start the app with the `local` profile for HTTPS/OAuth tests.
5. Open `https://localhost:8443/index.html`.
6. Click Login in the sidebar user card.
7. Choose GitHub or Google and complete OAuth authorization.
8. Use the API test area or direct URLs to verify GitHub profile/repos and Google Calendar.
9. For deployment, capture Docker Desktop, Docker Hub, Azure overview, online page, and online API screenshots.

## Build Jar

```powershell
cd C:\Users\佩索阿\Documents\CampusFlow_Deployment\backend
.\mvnw.cmd package -DskipTests
java -jar target\resumeapp-0.0.1-SNAPSHOT.jar
```

Note: on this Windows environment, `.\mvnw.cmd spring-boot:run` can fail when Maven handles the Chinese user path. The packaged jar command above is the verified local run method.
