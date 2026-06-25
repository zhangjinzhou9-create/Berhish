# Campus Flow Deployment Report

Student: ZHU FUXIN / シュフシン / M25W7195

## 1. Overview

Campus Flow is a Spring Boot web application that combines a student profile, country and weather APIs, JWT authorization, OAuth verification, MySQL persistence, and Docker deployment.

For this deployment task, I prepared the project so it can run with Docker Compose. The application container and MySQL container run together, which matches the sidecar-container idea from the deployment lecture.

## 2. Source Code Organization

The current backend is organized for classroom explanation:

```text
config/SecurityConfig.java              Spring Security, OAuth login, logout redirect
controller/ProfileController.java       /api/profile and /api/home route entry
controller/AuthController.java          JWT login, register, verify, role endpoints
controller/OAuthApiController.java      GitHub and Google Calendar API endpoints
controller/JwtUtil.java                 Small JWT helper for this homework
service/ProfileService.java             MySQL profile read/write logic
service/HomeService.java                Country, geocoding, weather, and life-tip logic
```

This keeps controllers short. When presenting the project, I can first explain the API routes, then explain how the service layer handles database and external API work.

## 3. Docker Image Design

The Dockerfile uses a multi-stage build:

```text
maven:3-eclipse-temurin-17
eclipse-temurin:17-jre
```

The Maven image builds the jar file. The final runtime image only needs Java to run the Spring Boot jar. This keeps the deployment image cleaner than putting the full Maven environment into the final container.

## 4. Sidecar Database

Campus Flow uses MySQL, so the local deployment uses two containers:

```text
campus-flow-app
campus-flow-mysql
```

The application connects to:

```text
jdbc:mysql://mysql:3306/user_db2
```

Inside Docker Compose, `mysql` is the service name of the database container. This is important because `localhost` would mean the application container itself, not the database container.

## 5. Local Test Steps

From the project folder:

```powershell
cd C:\Users\佩索阿\Documents\CampusFlow_Deployment
docker compose build
docker compose up -d
docker compose ps
```

Then open:

```text
http://localhost:8080/index.html
http://localhost:8080/api/home
http://localhost:8080/api/profile
```

Useful log commands:

```powershell
docker compose logs app
docker compose logs mysql
```

## 6. Docker Hub and Azure

The Docker Hub image target is:

```text
berhish/campus-flow:latest
```

Docker Hub repository:

```text
https://hub.docker.com/r/berhish/campus-flow
```

Azure App Service should use:

```text
Registry URL: https://index.docker.io
Image and tag: berhish/campus-flow:latest
Port: 8080
```

## 7. Current Result

The project currently has:

```text
backend/Dockerfile
backend/.dockerignore
backend/src/main/resources/application-docker.yml
docker-compose.yml
database/init/01-campus-flow-schema.sql
README.md
DEPLOYMENT_REPORT.md
```

Previous local Docker testing reached:

```text
docker compose build              success
docker compose up -d              success
docker push                       success, berhish/campus-flow:latest
campus-flow-app                   running on localhost:8080
campus-flow-mysql                 healthy, mapped to localhost:3308
http://localhost:8080/index.html  HTTP 200
http://localhost:8080/api/home    HTTP 200
http://localhost:8080/api/profile HTTP 200
```

The remaining work is to capture the final real-machine screenshots after Docker Desktop and Azure are both running correctly.

## 8. Screenshots Still Needed

- Docker Desktop showing `campus-flow-app` and `campus-flow-mysql`
- Docker Hub repository or image tag page
- Azure Web App overview page
- Online Campus Flow page loaded from Azure
- Online API response from Azure, for example `/api/home?country=Japan&city=Osaka`
