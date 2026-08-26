---
name: render-deploy
description: Use when working with FutbolYa's Render.com deployment — checking status, triggering deploys, managing env vars, or resuming/creating the three services (futbolya web static site, futbolya-api backend, futbolya-db Postgres). Render has no MCP connector in this environment; this skill drives the REST API directly with curl.
---

# Render deploy — FutbolYa

FutbolYa runs on Render.com as three linked resources, all under owner
`tea-d9qf5sijobas7380bbe0` (region `oregon`), deployed from
`https://github.com/mardemza/FutbolYa`, branch `main`, autoDeploy on commit:

| Resource | Type | Notes |
|---|---|---|
| `futbolya` | static_site | Vite build of `apps/web`. Build: `npm install && npm run build -w web`. Publish path: `apps/web/dist`. Has a rewrite route `/*` → `/index.html` (SPA fallback) — required, don't remove it. |
| `futbolya-api` | web_service (node) | NestJS backend in `apps/api`. Build: `npm install && npm run build -w api`. Start: `npm run start:prod -w api`. Plan: free. |
| `futbolya-db` | Postgres | Plan: free. **Free Postgres on Render expires 30 days after creation and gets deleted** — before that date, either upgrade the plan or recreate it and update `DATABASE_URL` on `futbolya-api`. |

## Auth

The Render API token lives in `.env.render` at the repo root (gitignored,
never commit it). Load it before any call:

```bash
export RENDER_API_KEY=$(grep RENDER_API_KEY .env.render | cut -d= -f2)
```

All requests: `Authorization: Bearer $RENDER_API_KEY` against
`https://api.render.com/v1/...`. Full API reference: https://api-docs.render.com/reference

## Common operations

Get current service IDs (names may change if resources were recreated — always
resolve by name first, don't hardcode IDs across sessions):

```bash
curl -s "https://api.render.com/v1/services?limit=50" -H "Authorization: Bearer $RENDER_API_KEY" \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{JSON.parse(d).forEach(s=>console.log(s.service.id,s.service.name,s.service.type,s.service.suspended))})"
```

**Check deploy status / history** (`SERVICE_ID` from above):
```bash
curl -s "https://api.render.com/v1/services/$SERVICE_ID/deploys?limit=5" -H "Authorization: Bearer $RENDER_API_KEY"
```

**Trigger a new deploy** (picks up latest commit on `main`):
```bash
curl -s -X POST "https://api.render.com/v1/services/$SERVICE_ID/deploys" -H "Authorization: Bearer $RENDER_API_KEY"
```

**Resume a suspended service:**
```bash
curl -s -X POST "https://api.render.com/v1/services/$SERVICE_ID/resume" -H "Authorization: Bearer $RENDER_API_KEY"
```

**Suspend a service** (stop billing/usage without deleting):
```bash
curl -s -X POST "https://api.render.com/v1/services/$SERVICE_ID/suspend" -H "Authorization: Bearer $RENDER_API_KEY"
```

**List / set env vars:**
```bash
curl -s "https://api.render.com/v1/services/$SERVICE_ID/env-vars" -H "Authorization: Bearer $RENDER_API_KEY"

curl -s -X PUT "https://api.render.com/v1/services/$SERVICE_ID/env-vars/KEY_NAME" \
  -H "Authorization: Bearer $RENDER_API_KEY" -H "Content-Type: application/json" \
  -d '{"value":"new-value"}'
```

`futbolya-api` needs: `DATABASE_URL` (from `futbolya-db`'s internal connection
string), `JWT_SECRET`, `CORS_ORIGIN` (= the web static site's URL).
`futbolya` (web) needs: `VITE_API_URL` (= the API service's URL) — this is a
**build-time** var for a static site, so changing it requires a new deploy to
take effect.

**Check Postgres status / connection info:**
```bash
curl -s "https://api.render.com/v1/postgres/$POSTGRES_ID" -H "Authorization: Bearer $RENDER_API_KEY"
curl -s "https://api.render.com/v1/postgres/$POSTGRES_ID/connection-info" -H "Authorization: Bearer $RENDER_API_KEY"
```

## Creating resources from scratch

Only needed if the services were deleted. Order matters: Postgres first (need
its internal connection string for the API's env vars), then the API, then
the static site (needs the API's URL for `VITE_API_URL`).

1. `POST /v1/postgres` — `{"name":"futbolya-db","plan":"free","region":"oregon","ownerId":"tea-d9qf5sijobas7380bbe0","version":"17"}`
2. `POST /v1/services` — web_service, `serviceDetails.envSpecificDetails.buildCommand`/`startCommand` as in the table above, `plan":"free"`, `"region":"oregon"`, repo/branch as above.
3. Set `futbolya-api` env vars (`DATABASE_URL`, fresh `JWT_SECRET`, `CORS_ORIGIN`).
4. `POST /v1/services` — static_site, `buildCommand`/`publishPath` as above, plus a rewrite route `/*` → `/index.html` via `POST /v1/services/$ID/routes`.
5. Set `futbolya` env var `VITE_API_URL` to the API's URL, then trigger a deploy so the build picks it up.

Always confirm with the user before deleting an existing service or database
— deleting the Postgres instance is irreversible and destroys its data.
