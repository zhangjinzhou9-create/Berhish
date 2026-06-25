# Campus Flow Project History

Student: ZHU FUXIN / シュフシン / M25W7195

This file keeps a simple project history for classroom explanation. The current
folder did not contain a Git repository when this review was done, so this file
records the main development stages in a readable way.

## Main Stages

### 1. Basic Campus Flow Web App

- Built a Spring Boot backend with static HTML, CSS, and JavaScript frontend.
- Added Home, Quick Access, and Me/Profile pages.
- Added `/api/home` and `/api/profile` endpoints.
- Connected public country, geocoding, and weather data to the Home page.
- Added fallback data so the class demo can still open when a public API fails.

### 2. Profile and MySQL Persistence

- Added MySQL tables for personal profile, education, skills, projects, and languages.
- Added profile read and update flow.
- Added `country` and `city` fields so the Home page and Profile page can share location data.
- Added Docker initialization SQL under `database/init`.

### 3. Authentication and OAuth

- Added classroom JWT login endpoints:
  - `/api/authenticate`
  - `/api/verify`
  - `/api/student-area`
  - `/api/teacher-area`
  - `/api/admin-area`
- Added Google and GitHub OAuth login.
- Added OAuth API checks for GitHub profile, GitHub repositories, and Google Calendar.
- Moved the OAuth login status into the sidebar so it does not take over the resume page.

### 4. Docker and Deployment Work

- Added `backend/Dockerfile`.
- Added `docker-compose.yml` with Spring Boot app and MySQL sidecar container.
- Added Docker profile configuration in `application-docker.yml`.
- Pushed Docker image target documented as `berhish/campus-flow`.
- Added Azure App Service deployment notes and screenshots.

### 5. Frontend Cleanup on 2026-06-25

- Removed the four-season theme switcher because the project is now treated mainly as a classroom assignment.
- Removed the unused `/images/*-anime.png` placeholder path.
- Kept the existing seasonal background assets under `static/assets`.
- Reduced GSAP animation strength to avoid page jank.
- Moved visual animation helpers into `ui-effects.js`.
- Kept the business logic in `script.js` focused on API calls, profile saving, OAuth status, and page navigation.
- Improved resume preview readability without changing the resume content or API behavior.

## Current Verification Snapshot

Checked on 2026-06-25:

- Maven package build: passed.
- Docker Compose app image rebuild: passed.
- `campus-flow-app` container: running on `localhost:8080`.
- `campus-flow-mysql` container: healthy.
- `http://localhost:8080/`: 200.
- `http://localhost:8080/index.html`: 200.
- `http://localhost:8080/api/profile`: 200.
- `http://localhost:8080/api/home?country=Japan&city=Kyoto`: 200.
- `http://localhost:8080/api-docs.html`: 200.

## GitHub Note

The local folder was not a Git repository during this cleanup, and GitHub CLI
was not installed on this machine. The project is ready to be initialized and
pushed after a repository URL or GitHub CLI login is available.
