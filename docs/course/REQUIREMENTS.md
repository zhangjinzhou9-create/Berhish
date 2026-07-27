# CampusFlow Final Requirements

Student: ZHU FUXIN

Student ID: M25W7195

## 1. Project goal

CampusFlow is a complete browser client and Spring Boot web service for the
course assignment. It runs locally from a compiled JAR or Docker Compose and
online from one Azure App Service container.

The visual direction is fixed. The final release focuses on functional
correctness, security, persistent user content, reproducible deployment, and a
clear project structure.

## 2. User experience

The desktop client has three pages:

- **Today** is the default route. It shows Kyoto preset data immediately and
  can query current weather and country information.
- **Portfolio** shows a public guest profile and preset works. A signed-in user
  can maintain a profile and create, update, or remove owned work.
- **Account** provides local registration and sign-in as the primary path.
  Google and GitHub are optional third-party sign-in methods.

English, Japanese, and Simplified Chinese can be selected from the language
control in the upper-right area. A guest can browse without creating an account.

## 3. Functional requirements

- `GET /api/home` combines Open-Meteo and REST Countries data.
- `GET /api/profile` returns a public profile without private fields.
- An authenticated owner can update their profile and usual location.
- Profile identity titles are selected from the published preset list.
- `GET /api/portfolio` returns the public or current-owner portfolio.
- An authenticated owner can create, update, and delete owned portfolio items.
- Image, audio, and text uploads are stored persistently with item metadata.
- Portfolio card size and image fit choices are persisted.
- A local user can register, sign in, remain signed in with a secure session
  cookie, and sign out.
- Google and GitHub callbacks use the configured application URL.
- An administrator is created only from server-side environment variables and
  can manage account availability.

## 4. Security requirements

- Local passwords are stored as BCrypt hashes and never returned to the browser.
- Password inputs use the HTML password type.
- Public registration creates only the `USER` role.
- Administrator credentials, OAuth secrets, and signing secrets are supplied
  through environment variables.
- Session cookies are HttpOnly; the Azure version also uses the Secure flag.
- State-changing requests require CSRF protection.
- Profile, media, and portfolio writes check ownership on the server.
- Uploaded files are checked by category, extension, size, and file signature.

## 5. Deployment requirements

- `backend/Dockerfile` builds and tests the Spring Boot application.
- `docker-compose.yml` runs the application and a MySQL sidecar locally.
- `START_LOCAL.cmd` runs the compiled JAR with a persistent local H2 database.
- Local classroom URL: `http://localhost:8080/index.html`
- Docker Hub image: `berhish/campus-flow:release-20260727-oauth`
- Azure target: one Linux Web App, `campusflow-final-0724`
- Azure URL:
  `https://campusflow-final-0724-grbzdrczdqdyhyea.japanwest-01.azurewebsites.net`
- The container listens on port `8080`.

Azure deployment uses one immutable release image and one final public
acceptance pass. Repeated restarts are avoided because the Free F1 plan has a
strict daily CPU quota.

## 6. Acceptance checklist

- [x] Docker image build completes and all automated tests pass.
- [x] Today opens by default with a current local date and usable preset data.
- [x] Portfolio shows distinct guest works with no overlap.
- [x] Account is light themed, local sign-in is primary, and the password is
      masked.
- [x] English, Japanese, and Chinese switch correctly.
- [x] Registration, sign-in, profile save, location save, portfolio ownership,
      and sign-out work against the backend.
- [x] Image, audio, and text uploads persist with their portfolio records.
- [x] Portfolio card size and image fit choices persist after editing.
- [x] Google and GitHub authorization use the correct callback and account picker.
- [x] One Azure service serves the final image successfully over HTTPS.
