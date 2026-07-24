# CampusFlow Final Requirements

Student: ZHU FUXIN / シュフシン
Student ID: M25W7195

## 1. Project Goal

CampusFlow is a complete browser client and Spring Boot web service for the
course assignment. It must run locally with Docker and online from one Azure
App Service container.

The visual direction is already fixed. Final work focuses on functional
correctness, security, reproducible deployment, and a clear classroom
demonstration.

## 2. User Experience

The browser client has three desktop pages:

- **Today** is the default route. It shows Kyoto preset data immediately and
  can query current weather and country information.
- **Portfolio** shows a public guest profile and four preset works. A signed-in
  user can maintain a profile and add, update, or remove owned work.
- **Account** provides local registration and sign-in as the primary path.
  Google and GitHub are optional third-party sign-in methods.

English, Japanese, and Simplified Chinese can be selected from the language
control in the upper-right area. A guest can browse without creating an
account.

## 3. Functional Requirements

- `GET /api/home` combines Open-Meteo and REST Countries data.
- `GET /api/profile` returns a public profile without private fields.
- An authenticated owner can update their profile and usual location.
- `GET /api/portfolio` returns the public or current-owner portfolio.
- An authenticated owner can create, update, and delete owned portfolio items.
- A local user can register, sign in, remain signed in with a secure session
  cookie, and sign out.
- Google and GitHub OAuth callbacks use the configured public application URL.
- An administrator is created only from server-side environment variables and
  can manage account availability.

## 4. Security Requirements

- Local passwords are stored as BCrypt hashes and never returned to the
  browser.
- Password inputs use the HTML password type.
- Public registration creates only the `USER` role.
- Administrator credentials, OAuth secrets, and signing secrets are supplied
  through environment variables.
- Session cookies are HttpOnly; the Azure version also uses the Secure flag.
- State-changing requests require CSRF protection.
- Profile and portfolio writes check ownership on the server.

## 5. Deployment Requirements

- `backend/Dockerfile` builds and tests the Spring Boot application.
- `docker-compose.yml` runs the application and a MySQL sidecar locally.
- Local classroom URL: `http://localhost:8080/index.html`
- Docker Hub image: `berhish/campus-flow:release-20260724`
- Azure target: one Linux Web App, `campusflow-final-0724`
- Azure URL:
  `https://campusflow-final-0724-grbzdrczdqdyhyea.japanwest-01.azurewebsites.net`
- The container listens on port `8080`.

Azure deployment must update the existing target once and perform one final
public acceptance check. Repeated restarts are not part of the acceptance
process because the Free F1 plan has a strict daily CPU quota.

## 6. Acceptance Checklist

- [ ] Docker image build completes and all automated tests pass.
- [ ] Today opens by default with a current local date and usable preset data.
- [ ] Portfolio shows four distinct guest works with no overlap.
- [ ] Account is light themed, local sign-in is primary, and the password is
      masked.
- [ ] English, Japanese, and Chinese switch correctly.
- [ ] Registration, sign-in, profile save, location save, portfolio ownership,
      and sign-out work against the backend.
- [ ] Google and GitHub authorization redirects contain the correct callback.
- [ ] One Azure service serves the final image successfully over HTTPS.
