# Backend Deployment (Railway)

## Structure
```
backend/
├─ package.json
├─ railway.toml
├─ data/
│  └─ salon.db (generated at runtime)
└─ src/
   ├─ config/
   │  └─ env.js
   ├─ controllers/
   ├─ db/
   │  └─ index.js
   ├─ middleware/
   ├─ routes/
   ├─ services/
   ├─ utils/
   └─ server.js
```

## Railway Deployment Steps
1. `cd backend`
2. `railway init` (or link to existing project)
3. `railway up` (uploads code + installs deps via `npm install`)
4. Railway runs `npm run start` using `railway.toml`.
5. Create a persistent volume (automatically defined in `railway.toml`) and ensure the `DATABASE_PATH` env var is **not** set so the default `/data/salon.db` is used.

## Frontend → Backend Calls
- Vercel frontend should call the backend using the Railway-provided domain, e.g. `https://<railway-subdomain>.up.railway.app/api/...`.
- All REST routes are prefixed with `/api`.
- CORS is enabled globally in `server.js`, so cross-origin requests from Vercel are accepted by default.
