# ebhoom-mcp-server

A standalone, **read-only** [Model Context Protocol](https://modelcontextprotocol.io) (MCP)
server that exposes EBHOOM EMS data to ChatGPT / MCP clients, with **per-user OAuth**.

## 1. What this server does

It bridges ChatGPT (via the MCP / OpenAI Apps SDK) to the existing EBHOOM EMS
backend. It does **not** touch MongoDB or S3 directly — it only calls the
secured, read-only `/api/ai/*` endpoints on the EMS backend. Each MCP tool maps
to exactly one fixed EMS API path.

**Auth model (Step 3 — OAuth).** Each ChatGPT user connects their own EBHOOM EMS
account. ChatGPT obtains an EMS access token via OAuth and sends it on every MCP
request as `Authorization: Bearer <token>`. This server strips `Bearer ` and
forwards the **raw** token to the EMS backend (whose `authenticate` middleware
expects the raw JWT). The backend then scopes `/api/ai/*` to that user. There is
**no** shared static `EMS_AUTH_TOKEN` anymore.

| Tool | EMS endpoint | Scope | Input |
|------|--------------|-------|-------|
| `get_today_exceedence` | `GET /api/ai/exceedence/today` | `ems.read.exceedence` | none |
| `get_last_days_exceedence` | `GET /api/ai/exceedence/last-days?days=N` | `ems.read.exceedence` | `days` (1–31, default 10) |
| `get_live_status` | `GET /api/ai/live-status` | `ems.read.live` | none |
| `get_daily_average_report` | `GET /api/ai/reports/daily-average?days=N` | `ems.read.reports` | `days` (1–31, default 10) |
| `get_gap_report` | `GET /api/ai/reports/gap?days=N` | `ems.read.gap` | `days` (1–31, default 10) |

All tools are `readOnlyHint: true`. The server holds **no** DB/S3 connection and
exposes no write/control tools.

## 2. OAuth flow (end to end)

```
ChatGPT user: "Do I have any exceedence today?"
   │
   ▼
ChatGPT ──(POST /mcp, no token)──▶ MCP server
   │                                  └─ tool returns OAuth challenge
   │                                     (_meta["mcp/www_authenticate"])
   │
   ├─ reads  MCP:  GET /.well-known/oauth-protected-resource
   │              → authorization_servers: [https://api.ocems.ebhoom.com]
   ├─ reads  EMS:  GET /.well-known/oauth-authorization-server
   │              → authorize/token endpoints, PKCE S256
   │
   ▼
EMS  GET /oauth/authorize  → EBHOOM EMS login page → user logs in
   │  (Authorization Code + PKCE)
   ▼
EMS  POST /oauth/token  (code + code_verifier) → { access_token (EMS JWT) }
   │
   ▼
ChatGPT ──(POST /mcp, Authorization: Bearer <jwt>)──▶ MCP server
   │   strips "Bearer ", forwards raw token
   ▼
EMS  GET /api/ai/...   (Authorization: <raw jwt>)
   authenticate middleware → req.rootUser → user-scoped data
```

The authorization server is the **EMS backend** itself (see
`Ems_Server_Backend/controllers/oauthController.js`). This MCP server is the
OAuth **resource**, advertised at `GET /.well-known/oauth-protected-resource`.

## 3. Install

```bash
cd ebhoom-mcp-server
npm install
```

Requires Node.js 18+ (developed on Node 22, which provides global `fetch`).

## 4. Configure `.env`

```bash
cp .env.example .env
```

Production `.env`:

```env
EMS_API_BASE_URL=https://api.ocems.ebhoom.com
MCP_RESOURCE_URL=https://mcp.ebhoom.com
OAUTH_ISSUER=https://api.ocems.ebhoom.com
PORT=8787
```

`MCP_RESOURCE_URL` and `OAUTH_ISSUER` default to the production URLs above if
unset; `EMS_API_BASE_URL` is required. **No `EMS_AUTH_TOKEN`** — remove any old
one from production `.env`.

## 5. Run locally

```bash
npm run dev          # TypeScript directly (tsx)
# or
npm run build && npm start
```

You should see:

```
ebhoom-ems-mcp-server v1.0.0 listening on port 8787
  MCP endpoint: POST http://localhost:8787/mcp
  Health:       GET  http://localhost:8787/health
  Resource meta: GET http://localhost:8787/.well-known/oauth-protected-resource
```

## 6. Endpoints exposed by this server

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/mcp` | MCP Streamable HTTP endpoint |
| `GET`  | `/health` | `{ ok: true, service: "ebhoom-mcp-server" }` |
| `GET`  | `/.well-known/oauth-protected-resource` | OAuth protected-resource metadata |

## 7. ChatGPT app configuration

- **Name:** EBHOOM EMS
- **Description:** Read-only EMS assistant for exceedence, live status, daily
  average reports, and gap reports.
- **Server URL:** `https://mcp.ebhoom.com/mcp`
- **Authentication:** OAuth
- **OAuth discovery:** `https://api.ocems.ebhoom.com/.well-known/oauth-authorization-server`
- **Protected resource metadata:** `https://mcp.ebhoom.com/.well-known/oauth-protected-resource`

## 8. Deployment & PM2

**MCP server** (this folder):

```bash
cd ebhoom-mcp-server
npm install
npm run build
# first time:
pm2 start dist/index.js --name ebhoom-mcp
# subsequent deploys:
pm2 restart ebhoom-mcp
pm2 save
pm2 logs ebhoom-mcp --lines 50
```

**EMS backend** (after pulling the OAuth changes):

```bash
cd Ems_Server_Backend
npm install
pm2 restart <ems-backend-process-name>   # e.g. ems-backend / app / index
pm2 save
pm2 logs <ems-backend-process-name> --lines 50
```

Make sure the reverse proxy (nginx) forwards, on the EMS host, the paths
`/.well-known/oauth-authorization-server`, `/oauth/authorize`, `/oauth/token`,
`/oauth/revoke` to the backend, and on the MCP host `/mcp`, `/health`,
`/.well-known/oauth-protected-resource` to this server. Both must be HTTPS.

## 9. Testing — curl

```bash
# 1) EMS OAuth metadata
curl https://api.ocems.ebhoom.com/.well-known/oauth-authorization-server

# 2) MCP protected-resource metadata
curl https://mcp.ebhoom.com/.well-known/oauth-protected-resource

# 3) Existing EMS API still works with a direct (raw) EMS token
curl -H "Authorization: <EMS_USER_TOKEN>" \
  https://api.ocems.ebhoom.com/api/ai/exceedence/today

# 4) MCP health
curl https://mcp.ebhoom.com/health
```

For MCP Inspector: `npx @modelcontextprotocol/inspector`, transport
**Streamable HTTP**, URL `http://localhost:8787/mcp`. Without a token the tools
return an authentication-required challenge; with a valid EMS JWT
(`Authorization: Bearer <jwt>`) they return that user's data.

## 10. Important notes

- The EMS backend `Authorization` header uses the **raw** token — this server
  strips `Bearer ` before forwarding. Do not change that unless the backend
  `authenticate` middleware is updated to accept `Bearer`.
- Tokens are **never logged**.
- If the EMS backend returns `401`, the tool returns the same OAuth challenge so
  ChatGPT prompts the user to reconnect.
