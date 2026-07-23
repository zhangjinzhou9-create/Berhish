# Azure App Service portal update

This checklist updates the existing Azure App Service named `CampusFlow`.

## 1. Container image

In **Deployment Center → Settings**, use:

| Field | Value |
|---|---|
| Source | Docker Hub |
| Access type | Public |
| Registry URL | `https://index.docker.io` |
| Image and tag | `berhish/campus-flow:formal-20260724` |
| Container port | `8080` |
| Startup command | Leave empty |

The fixed tag is recommended for the course presentation because it can be
rolled back. `berhish/campus-flow:latest` currently points to the same image.

Image digest:

```text
sha256:4ec8359bb8d1026401b8601e950c155a5e1d21d884242267bd38f4c39525e511
```

## 2. Application settings

In **Settings → Environment variables → App settings**, add or update:

```text
WEBSITES_PORT=8080
PORT=8080
SPRING_PROFILES_ACTIVE=prod
APP_BASE_URL=https://campusflow-dzh5b4fteeczf7ab.japanwest-01.azurewebsites.net
SECURE_COOKIE=true
WEBSITES_ENABLE_APP_SERVICE_STORAGE=true
JWT_SECRET=<a new random secret of at least 32 characters>
ADMIN_USERNAME=<the private administrator username>
ADMIN_PASSWORD=<a new administrator password of at least 12 characters>
```

Do not put secret values in GitHub or screenshots.

The current production profile uses an H2 file under `/home/campusflow`.
Keeping `WEBSITES_ENABLE_APP_SERVICE_STORAGE=true` makes that file survive
normal container restarts on Azure App Service.

## 3. OAuth settings

Only add these settings when the corresponding provider login should be active:

```text
GOOGLE_CLIENT_ID=<Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<Google OAuth client secret>
GITHUB_CLIENT_ID=<GitHub OAuth client ID>
GITHUB_CLIENT_SECRET=<GitHub OAuth client secret>
```

Provider consoles must contain these exact callbacks:

```text
https://campusflow-dzh5b4fteeczf7ab.japanwest-01.azurewebsites.net/login/oauth2/code/google
https://campusflow-dzh5b4fteeczf7ab.japanwest-01.azurewebsites.net/login/oauth2/code/github
```

Google should also use this authorized origin:

```text
https://campusflow-dzh5b4fteeczf7ab.japanwest-01.azurewebsites.net
```

## 4. Optional Azure Database for MySQL

If Azure MySQL is already available, replace the H2 settings with:

```text
SPRING_DATASOURCE_URL=jdbc:mysql://<server>.mysql.database.azure.com:3306/user_db2?sslMode=REQUIRED&serverTimezone=Asia/Tokyo&useUnicode=true&characterEncoding=utf8
SPRING_DATASOURCE_USERNAME=<Azure MySQL username>
SPRING_DATASOURCE_PASSWORD=<Azure MySQL password>
SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver
SPRING_SQL_INIT_MODE=never
```

The Azure MySQL firewall or private networking must allow the App Service.

## 5. Restart and verify

After saving Deployment Center and Environment variables:

1. Restart the App Service.
2. Open **Log stream** and wait for Spring Boot to report that it started.
3. Set **Health check** to `/api/auth/me`.
4. Verify:

```text
https://campusflow-dzh5b4fteeczf7ab.japanwest-01.azurewebsites.net/index.html
https://campusflow-dzh5b4fteeczf7ab.japanwest-01.azurewebsites.net/api/auth/me
https://campusflow-dzh5b4fteeczf7ab.japanwest-01.azurewebsites.net/api/profile
https://campusflow-dzh5b4fteeczf7ab.japanwest-01.azurewebsites.net/api/portfolio
```

Expected results:

- the home page returns HTTP 200;
- `/api/auth/me` returns guest JSON before sign-in;
- Today loads the current Japan date and weather;
- local registration/sign-in works;
- the Portfolio page returns four seeded works for the featured account.
