# Organization Management Service (Node.js)

This is a simple Organization Management backend implemented with Node.js, Express and MongoDB. It implements the following endpoints:


# Organization Management Service (Node.js)

This repository contains a small backend service to create and manage organizations in a multi-tenant style.

Core features
- Master DB storing `organizations` and `admins` collections
- Per-organization dynamic collections named `org_<organization_name>`
- Admin user creation with bcrypt-hashed passwords
- JWT-based admin authentication (token contains admin_id and org_id)

Quick start

1. Install dependencies

```powershell
npm install
```

2. (Optional) create a `.env` file in the project root and set the following values:

```
MONGO_URI=mongodb://localhost:27017
MASTER_DB=master_db
JWT_SECRET=your_strong_secret_here
PORT=8000
```

3. Start the server

```powershell
npm run dev
```

Health check

GET http://localhost:8000/

Sample API usage (PowerShell / curl)

- Create organization

```powershell
curl -Method POST http://localhost:8000/org/create -ContentType 'application/json' -Body '{"organization_name":"acme","email":"admin@acme.com","password":"secret123"}'
```

- Admin login

```powershell
curl -Method POST http://localhost:8000/admin/login -ContentType 'application/json' -Body '{"email":"admin@acme.com","password":"secret123"}'
```

- Delete organization (requires Authorization header with Bearer token returned from login)

```powershell
curl -Method DELETE http://localhost:8000/org/delete -ContentType 'application/json' -Headers @{ Authorization = 'Bearer <TOKEN>' } -Body '{"organization_name":"acme"}'
```

Files of interest
- `app.js` — application bootstrap and route mounting
- `routes/orgRoutes.js` — route definitions
- `controllers/orgController.js` — controller implementations for org operations
- `db.js` — MongoDB connection and dynamic collection helpers
- `auth.js` — bcrypt and JWT helpers

Assignment checklist (mapping to repo)

- Create Organization (POST /org/create) — implemented in `controllers/orgController.js` (createOrg). ✅
- Get Organization (GET /org/get) — implemented in `controllers/orgController.js` (getOrg). ✅
- Update Organization (PUT /org/update) — implemented in `controllers/orgController.js` (updateOrg). ✅
- Delete Organization (DELETE /org/delete) — implemented and protected by JWT middleware in `routes/orgRoutes.js` and `auth.js`. ✅
- Admin Login (POST /admin/login) — implemented in `controllers/orgController.js` (adminLogin) and `auth.js` for token creation. ✅
- Master DB & dynamic collections — `db.js` handles creation, copy and drop of per-org collections. ✅
- JWT auth and bcrypt password hashing — `auth.js`. ✅

Design notes
- Approach: single master DB containing metadata collections (`organizations`, `admins`) and dynamic per-org collections. This keeps metadata centralized and tenant data separated at collection level.
- Trade-offs: collection-per-tenant is easy to implement but can be harder to scale to a very large number of tenants; alternatives include tenant_id in shared collections or a database-per-tenant approach.

Security & production notes
- Set a strong `JWT_SECRET` in environment variables or a secrets manager — do not commit secrets.
- Add input validation (express-validator / Joi), rate limiting, CORS settings, and logging for production.
- Use TLS/HTTPS and place the service behind a reverse proxy.

How to push to GitHub (example)

1. Create a new empty repository on GitHub (e.g., `yourusername/NodeCRUD`).
2. In the project folder, if not already a git repo, run:

```powershell
git init
git add -A
git commit -m "feat: initial organization management service"
git branch -M main
git remote add origin https://github.com/<yourusername>/NodeCRUD.git
git push -u origin main
```

If your repo is already initialized locally and has a remote, simply run:

```powershell
git add -A
git commit -m "chore: update README and add .gitignore"
git push
```

Next recommended steps
- Add request validation and a Postman collection (or expand the `examples/` folder with sample requests). I can add those for you.

Contact / notes
-- If you want, I can also create a Dockerfile or push this repository to a GitHub repo if you provide the remote URL (I won't push without your consent).

Architecture (high level)

ASCII diagram:

```
+-----------------------------+
|        Client / UI         |
+-----------------------------+
			 |
			 v
+-----------------------------+
|     Express (app.js)       |
|  routes/orgRoutes.js       |
+-----------------------------+
			 |
			 v
+-----------------------------+
|   Controllers (orgController)  |
+-----------------------------+
			 |
			 v
+-----------------------------+
|   Services (services/orgService.js)  |
+-----------------------------+
			 |
			 v
+-----------------------------+
|   Data layer (db.js - MongoDB) |
+-----------------------------+
```

Design note: controllers are thin and delegate business logic to a class-based service (`OrgService`) which centralizes tenant lifecycle operations, making the code modular and easier to test.

