# CampusFlow project structure

## Architecture

```text
Desktop browser
  -> Spring Boot static frontend
  -> REST controllers
  -> session, CSRF, role, and ownership checks
  -> account, profile, portfolio, and home services
  -> MySQL (local) or persistent H2 file (Azure)
  -> JSON response
  -> frontend loading, success, or error state
```

## Repository map

```text
campusflow/
+-- backend/
|   +-- src/main/java/                 Controllers, services, security
|   +-- src/main/resources/static/     Today, Portfolio, Account, CSS, JS, images
|   +-- src/main/resources/            Local, Docker, production configuration
|   +-- src/test/                      Regression tests
|   `-- Dockerfile                     Java 17 multi-stage image
+-- database/init/                     MySQL initialization
+-- docs/
|   +-- architecture/                  This technical map
|   +-- course/                        Requirements and report source
|   `-- deployment/                    Azure and OAuth settings
+-- output/pdf/                         Generated course report
+-- scripts/report/                    Report generation utility
+-- docker-compose.yml                 Spring Boot and MySQL local runtime
+-- .env.example                       Non-secret configuration template
`-- README.md                          Project entry point
```

OpenDesign was used only as an external design reference. It is not part of the
runtime, Docker build, or submitted project directory.

## User boundaries

| Visitor | Read | Write |
|---|---|---|
| Guest | Featured public Today/Profile/Portfolio data | None |
| User | Own data plus public content | Own profile, saved place, own works |
| Administrator | Account list and service data | Enable or disable ordinary accounts |

Passwords are BCrypt hashes, cookies are HttpOnly, writes require CSRF, and
every editable record is scoped to its owner.
