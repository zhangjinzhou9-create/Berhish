# Azure App Service configuration

CampusFlow uses one Linux Web App and one App Service plan.

## Resource

| Item | Value |
|---|---|
| Resource group | `Kcgi_c` |
| Web App | `campusflow-final-0724` |
| App Service plan | `ASP-CampusFlow-Final-F1` |
| Region | `Japan West` |
| Operating system | `Linux` |
| Public domain | `campusflow-final-0724-grbzdrczdqdyhyea.japanwest-01.azurewebsites.net` |

Public URL:

```text
https://campusflow-final-0724-grbzdrczdqdyhyea.japanwest-01.azurewebsites.net
```

## Container

Open **Deployment Center > Containers > main**.

| Portal field | Value |
|---|---|
| Type | `Primary` |
| Image source | `Other container registry` |
| Registry server URL | `https://index.docker.io` |
| Image | `berhish/campus-flow` |
| Tag | `release-20260724` |
| Port | `8080` |
| Startup command | leave empty |

## Application settings

Open **Settings > Environment variables > App settings**.

| Name | Value |
|---|---|
| `APP_BASE_URL` | `https://campusflow-final-0724-grbzdrczdqdyhyea.japanwest-01.azurewebsites.net` |
| `PORT` | `8080` |
| `WEBSITES_PORT` | `8080` |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `WEBSITES_ENABLE_APP_SERVICE_STORAGE` | `true` |
| `SECURE_COOKIE` | `true` |
| `LOG_LEVEL` | `INFO` |
| `JWT_SECRET` | private random value of at least 32 characters |
| `ADMIN_USERNAME` | private administrator username |
| `ADMIN_PASSWORD` | private administrator password of at least 12 characters |
| `GOOGLE_CLIENT_ID` | private application setting |
| `GOOGLE_CLIENT_SECRET` | private application setting |
| `GITHUB_CLIENT_ID` | private application setting |
| `GITHUB_CLIENT_SECRET` | private application setting |

The production profile stores its H2 file under `/home/campusflow`.
`WEBSITES_ENABLE_APP_SERVICE_STORAGE=true` preserves it across normal container
restarts. Secret values must not appear in GitHub, screenshots, or presentation
materials.

## OAuth callbacks

Google JavaScript origin:

```text
https://campusflow-final-0724-grbzdrczdqdyhyea.japanwest-01.azurewebsites.net
```

Google redirect URI:

```text
https://campusflow-final-0724-grbzdrczdqdyhyea.japanwest-01.azurewebsites.net/login/oauth2/code/google
```

GitHub callback URL:

```text
https://campusflow-final-0724-grbzdrczdqdyhyea.japanwest-01.azurewebsites.net/login/oauth2/code/github
```

## Final acceptance

After the immutable release image is deployed, make one public acceptance pass:

1. Open `/index.html`.
2. Confirm `/api/auth/me` returns the guest state.
3. Confirm `/api/profile` returns the featured profile.
4. Confirm `/api/portfolio` returns four public works.
5. Confirm Google and GitHub authorization requests contain the exact callback
   URLs above.

Do not use repeated restart or polling loops on the Free F1 plan.
