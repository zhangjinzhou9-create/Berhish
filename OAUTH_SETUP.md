# Campus Flow OAuth and HTTPS Setup

This project supports:

- TLS for local testing: `https://localhost:8443`
- GitHub OAuth API:
  - `/api/oauth/github/profile`
  - `/api/oauth/github/repos`
- Google Calendar OAuth API:
  - `/api/oauth/google/calendar`

## 1. GitHub OAuth App

Use these values in GitHub Developer Settings:

```text
Application name: Campus Flow GitHub OAuth
Homepage URL: https://localhost:8443
Authorization callback URL: https://localhost:8443/login/oauth2/code/github
```

For Docker local testing, also add:

```text
Homepage URL: http://localhost:8080
Authorization callback URL: http://localhost:8080/login/oauth2/code/github
```

The GitHub Client ID can be public. The Client Secret must stay private.

Important: a GitHub token beginning with `ghp_` is a Personal Access Token. It
is not the OAuth App Client Secret and should not be used as
`GITHUB_CLIENT_SECRET`.

If you only see "Update application", scroll the OAuth App page and find the
`Client secrets` area. Click `Generate a new client secret`. GitHub shows the
secret only once, so save it in a safe place.

Set the environment variables before running the app:

```powershell
$env:GITHUB_CLIENT_ID="Ov23lijramFcogVguZyA"
$env:GITHUB_CLIENT_SECRET="paste-your-github-client-secret-here"
```

## 2. Google Cloud OAuth App

First enable `Google Calendar API`.

Then create an OAuth Client ID:

```text
Application type: Web application
Name: Campus Flow Google OAuth
Authorized JavaScript origins: https://localhost:8443
Authorized redirect URIs: https://localhost:8443/login/oauth2/code/google
```

For Docker local testing, also add:

```text
Authorized JavaScript origins: http://localhost:8080
Authorized redirect URIs: http://localhost:8080/login/oauth2/code/google
```

Add your Gmail as a test user on the OAuth consent screen.

Set the environment variables after Google gives you the credentials:

```powershell
$env:GOOGLE_CLIENT_ID="paste-your-google-client-id-here"
$env:GOOGLE_CLIENT_SECRET="paste-your-google-client-secret-here"
```

## 3. Run Locally with HTTPS

Use the local Spring profile:

```powershell
cd backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

Open:

```text
https://localhost:8443/index.html
```

The browser may show a warning because the local certificate is self-signed.
Choose advanced/continue for local testing.

## 4. Test URLs

Open the site and use the small user card in the lower-left sidebar. Click
`Login`, choose Google or GitHub in the dialog, and then use the `API test`
area in the same sidebar card.

Direct URLs:

```text
https://localhost:8443/oauth2/authorization/github
https://localhost:8443/api/oauth/github/profile
https://localhost:8443/api/oauth/github/repos

https://localhost:8443/oauth2/authorization/google
https://localhost:8443/api/oauth/google/calendar
```

## 5. Production Deployment Note

For online deployment, do not use the local self-signed certificate. Most
platforms such as Render, Railway, Azure, or Google Cloud Run provide HTTPS on
the public domain automatically.

Set:

```text
APP_BASE_URL=https://your-production-domain
SPRING_PROFILES_ACTIVE=prod
```

Then add production callback URLs in Google/GitHub:

```text
https://your-production-domain/login/oauth2/code/google
https://your-production-domain/login/oauth2/code/github
```
