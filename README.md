Organization Management Service (Node.js)

A multi-tenant backend service built with Node.js, Express, and MongoDB for managing organizations and admin authentication.

🚀 Overview

This backend implements a multi-tenant architecture, where each organization gets its own dedicated MongoDB collection named:

org_<organization_name>


A Master Database stores:

Organization metadata

Admin users

Collection references

Includes:

Create Organization

Get Organization

Update Organization (rename + data migration)

Delete Organization

Admin Login (JWT)

Password hashing (bcrypt)

📁 Project Structure
.
├── controllers/
│   └── orgController.js
├── services/
│   └── orgService.js
├── routes/
│   └── orgRoutes.js
├── middleware/
├── examples/
├── auth.js
├── db.js
├── app.js
├── server.js
├── package.json
├── Dockerfile
└── README.md

✔ Clean, modular, class-based design

Controllers handle request/response

Services contain business logic

db.js manages Master DB + dynamic collection creation

auth.js handles JWT + bcrypt

⚙️ Tech Stack

Node.js

Express.js

MongoDB (Native driver)

bcrypt (Password hashing)

jsonwebtoken (JWT)

dotenv

▶️ How to Run the Application
1. Install dependencies
npm install

2. Create a .env file
MONGO_URI=mongodb://localhost:27017
MASTER_DB=master_db
JWT_SECRET=your_strong_secret_here
PORT=8000

3. Start the server
npm run dev

4. Test the API

Open in browser or Postman:

👉 http://localhost:8000

🧪 API Endpoints
1️⃣ Create Organization

POST /org/create
Creates:

Organization metadata

Admin user (bcrypt password)

Dynamic collection org_<name>

2️⃣ Get Organization

GET /org/get
Fetches org metadata from Master DB.

3️⃣ Update Organization (Rename)

PUT /org/update
Performs:

Rename validation

Creates new dynamic collection

Copies old data → new collection

Drops previous collection

4️⃣ Delete Organization

DELETE /org/delete
Requires JWT token.
Deletes:

Org metadata

Admin(s)

Dynamic collection

5️⃣ Admin Login

POST /admin/login
Returns JWT token with:

admin_id

org_id

🧩 High-Level Architecture Diagram (Mermaid)
flowchart TD

A[Client] --> B[Express Server (app.js)]
B --> C[Routes (orgRoutes.js)]
C --> D[Controllers (orgController.js)]
D --> E[OrgService Class (services/orgService.js)]
E --> F[Master Database (organizations, admins)]
E --> G[Dynamic Collections - org_<name>]

B --> H[JWT Middleware (auth.js)]
H --> C

🏗 Design Choices
1. Multi-Tenant via Dynamic Collections

Each organization lives in its own collection:

org_acme
org_google
org_tesla


✔ Clear data isolation
✔ No mixing tenant data
✔ Easy scaling

2. Service-Layer Architecture

Your service (OrgService) handles:

Creating orgs

Dynamic collection creation

Cloning/migrating collections

Deleting org data

This keeps controllers thin and clean.

3. MongoDB (Native Driver)

Chosen because:

Flexible schema

Easy programmatic collection creation

Ideal for document-based tenants

4. JWT Authentication

Stores:

admin_id

org_id

Stateless and easy to validate per request.

⚖️ Trade-Offs
Design	Pros	Cons
Collection-per-tenant	Strong isolation	Too many collections for thousands of orgs
Native Mongo driver	Full control	More code than ODMs like Mongoose
JWT	Stateless, fast	Hard to revoke tokens
Node.js	Lightweight	Single-threaded unless clustered
🔐 Security Notes (Important for Reviewers)

All passwords hashed using bcrypt

JWT_SECRET must be strong

No credentials stored in plain text

Could add validation (Joi / Zod) for production

Recommended rate limiting & HTTPS
