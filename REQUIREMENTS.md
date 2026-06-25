# Campus Flow Deployment Requirements

Student: ZHU FUXIN / シュフシン / M25W7195

## 1. Purpose

This document defines the deployment requirements for Campus Flow. The goal is to prepare the existing classroom web application as a containerized service, so it can run in a reproducible environment instead of depending only on my local machine setup.

The Lecture 11 topic is deployment. I understand deployment as more than "the app runs on my PC". For this task, the application should be packaged, configured, tested, and prepared for a cloud container platform.

## 2. Application Scope

Campus Flow is a Spring Boot web application with a browser frontend. The deployed version should keep the existing functions:

- Home page with country, city, weather, and daily information
- Resume/profile page with MySQL persistence
- JWT login and role-based test endpoints
- OAuth login preparation for Google and GitHub
- Static frontend resources served by Spring Boot

This deployment task should not redesign the frontend or rewrite the business logic. The main work is packaging and deployment preparation.

## 3. Functional Requirements

The deployed application should:

- Start from a Docker image.
- Serve the frontend from `http://localhost:8080/index.html` in local Docker testing.
- Provide API endpoints such as `/api/home`, `/api/profile`, and `/api/authenticate`.
- Connect to MySQL from a sidecar database container.
- Load initial profile and user data when the database container is created.
- Allow logging level configuration through an environment variable.

## 4. Deployment Requirements

The project should include:

- `backend/Dockerfile` for building the Spring Boot application image.
- `docker-compose.yml` for running the application with a MySQL sidecar container.
- `backend/.dockerignore` to keep the Docker build context clean.
- `backend/src/main/resources/application-docker.yml` for container-specific configuration.
- Database initialization SQL under `database/init/`.
- Documentation explaining how to build, run, test, tag, and push the image.

## 5. Container Design

The Docker setup uses two containers:

- `campus-flow-app`: Spring Boot application
- `campus-flow-mysql`: MySQL database

The app container connects to MySQL by service name:

```text
mysql:3306
```

This is different from local development, where the app previously used:

```text
localhost:3307
```

Inside Docker Compose, `localhost` would mean the application container itself, not the database container. This is why the Docker profile uses `mysql` as the database host.

## 6. Non-Functional Requirements

The containerized version should be:

- Reproducible: another machine with Docker Desktop can run it.
- Clear: configuration is separated into a Docker profile.
- Safe enough for class testing: secrets are passed as environment variables, not hard-coded into the Docker image.
- Observable: logs are available through `docker compose logs`.

## 7. External Services

The application still calls public APIs:

- REST Countries
- Open-Meteo
- Google OAuth / Google Calendar, when valid credentials are supplied
- GitHub OAuth / GitHub API, when valid credentials are supplied

For local Docker testing, the basic web app and APIs can be tested without completing OAuth login.

## 8. Cloud Deployment Direction

The lecture uses Azure as the example deployment platform. For this project, Google Cloud Run is also a reasonable target because it deploys container images directly and I already have a Google Cloud project from the OAuth setup.

If the instructor requires Azure exactly, the same Docker image can still be pushed to Docker Hub and used from Azure App Service for Containers. If Google Cloud is accepted, Cloud Run can deploy the same image with fewer new accounts and less duplicated setup.
