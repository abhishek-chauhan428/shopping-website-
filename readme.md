# ShopKart — Project Overview & Setup Guide

## 1. Project Overview

**ShopKart** is a full-stack **MERN shopping/e-commerce application** organized into separate frontend and backend applications.

### Tech stack

- **MongoDB** — database
- **Express.js** — backend API
- **React** — frontend application
- **Node.js** — backend runtime

### Architecture

```text
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │     frontend/       │
                    └──────────┬──────────┘
                               │
                         HTTP / API
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Express + Node.js   │
                    │      backend/       │
                    └──────┬──────┬───────┘
                           │      │
                    MongoDB│      │External services
                           │      │
                           ▼      ▼
                    ┌──────────┐  ┌───────────────┐
                    │ MongoDB  │  │ Payment/Email │
                    │  Atlas   │  │ integrations  │
                    └──────────┘  └───────────────┘
```

The frontend is responsible for the user interface and sending requests to the backend. The backend handles API routes, authentication, business logic, database operations, and integrations that require private credentials.

### Main areas of the project

The project includes application functionality around:

- User authentication
- Product/shopping flows
- Cart and order-related operations
- User/account functionality
- Payment integration
- Password-reset/email functionality
- MongoDB persistence
- Environment-based configuration

> This overview is based on the uploaded project structure/configuration. Do not assume a feature exists unless it is implemented in the source code.

---

# 2. Project Structure

At a high level:

```text
Shopping Website/
├── backend/
│   ├── package.json
│   ├── .env                 # local secrets — DO NOT COMMIT
│   └── ...
│
├── frontend/
│   ├── package.json
│   └── ...
│
├── package.json
├── package-lock.json
└── .gitignore
```

### Backend

`backend/` contains the Node.js/Express application.

It is responsible for:

- API endpoints
- Server-side business logic
- Database communication
- Authentication
- Payment/email integrations
- Server-side environment variables

### Frontend

`frontend/` contains the React application.

It is responsible for:

- UI
- Pages/components
- User interaction
- Calling backend APIs
- Displaying application data

### `.env`

The backend environment file contains sensitive configuration such as:

```text
MongoDB URI
JWT secret
Payment credentials
Email credentials
```

It must **never** be committed to GitHub.

---

# 3. Prerequisites

Install the following first.

### Node.js

Check your installation:

```bash
node -v
npm -v
```

Use a current Node.js LTS release.

### Git

```bash
git --version
```

### MongoDB

The backend requires MongoDB.

You can use **MongoDB Atlas** for a cloud database.

For Atlas you need:

- MongoDB Atlas account
- Cluster
- Database user
- Database password
- Connection URI
- Network/IP access configured

---

# 4. Get the Project

If the project is already on your computer, skip this section.

For a GitHub repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <PROJECT_FOLDER>
```

---

# 5. Install Dependencies

First install root dependencies:

```bash
npm install
```

Then check whether the backend has its own `package.json`.

```bash
cd backend
npm install
cd ..
```

Then install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

If a directory does not contain a `package.json`, do not run `npm install` there.

---

# 6. Environment Variables

Environment variables keep configuration and secrets outside your source code.

Create:

```text
backend/.env
```

Use the exact variable names expected by the backend source.

A typical setup looks like:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Payment variables, if required by the project:
# RAZORPAY_KEY_ID=your_key_id
# RAZORPAY_KEY_SECRET=your_secret

# Email variables, if required by the project:
# SMTP_HOST=...
# SMTP_PORT=...
# SMTP_USER=...
# SMTP_PASS=...
```

**Do not paste real credentials into this README.**

Also do not commit your real `.env`.

---

# 7. MongoDB Atlas Setup

If you are using MongoDB Atlas:

### Step 1 — Create a cluster

Create a cluster from MongoDB Atlas.

### Step 2 — Create a database user

Create a username and password for your application.

### Step 3 — Configure network access

Allow your development machine's IP address in Atlas.

### Step 4 — Get the connection string

Copy the connection string from Atlas and put it in:

```env
MONGO_URI=your_connection_string
```

Make sure the environment variable name exactly matches the name used by the backend.

For example:

```env
MONGO_URI=...
```

is not the same as:

```env
dbURL=...
```

---

# 8. Frontend Environment Variables

Check the frontend source for any environment variables it expects.

If the frontend uses Vite, browser-exposed environment variables normally use:

```text
VITE_
```

For example:

```env
VITE_API_URL=http://localhost:5000
```

Use the exact variable name required by the frontend code.

### Important

Never put private secrets such as these into frontend variables:

```text
MongoDB password
JWT signing secret
Payment secret key
SMTP password
```

Frontend environment variables can become visible to the browser.

---

# 9. Start the Backend

Open Terminal 1:

```bash
cd backend
npm run dev
```

If `npm run dev` does not exist, check:

```bash
npm run
```

or:

```bash
cat package.json
```

The backend should start on the port configured in `.env`, for example:

```text
http://localhost:5000
```

---

# 10. Start the Frontend

Open Terminal 2:

```bash
cd frontend
npm run dev
```

Vite commonly prints a URL similar to:

```text
http://localhost:5173
```

Always use the exact URL printed by your terminal.

---

# 11. Normal Development Setup

You will normally use two terminals.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Then open the frontend URL shown by the development server.

---

# 12. Authentication

Authentication should remain on the backend.

Important rules:

- Keep JWT secrets in `backend/.env`.
- Never expose JWT signing secrets to React.
- Keep private credentials server-side.
- Make sure frontend and backend API URLs match.
- Make sure CORS is configured for the frontend origin.
- If cookies are used for authentication, make sure cookie/CORS settings work for local development.

---

# 13. Payment Integration

If the project uses Razorpay or another payment provider, keep private credentials in:

```text
backend/.env
```

For example:

```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_secret
```

Use test credentials during development.

Never place a private payment secret in frontend code.

---

# 14. Email / Password Reset

If email or password-reset functionality is enabled, the backend may require SMTP configuration.

Example:

```env
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
```

Use the exact names expected by the backend implementation.

Keep these values in:

```text
backend/.env
```

---

# 15. GitHub Setup

The project should have a `.gitignore` at the **project root**.

Recommended entries:

```gitignore
node_modules/
dist/
dist-ssr/

.env
.env.*
!.env.example

.DS_Store
```

Because the `.gitignore` is at the project root, this:

```gitignore
.env
```

will ignore environment files inside subdirectories too.

For example:

```text
backend/.env
frontend/.env
```

will be ignored.

---

# 16. Check That Secrets Are Ignored

Run from the project root:

```bash
git status --ignored
```

You should see things such as:

```text
backend/.env
backend/node_modules/
frontend/.../node_modules/
node_modules/
```

under ignored files.

Your `.env` should **not** appear as a normal untracked file.

---

# 17. Push the Project to GitHub

If Git has not been initialized:

```bash
git init
```

Then:

```bash
git add .
```

Check what will be committed:

```bash
git status
```

Make sure you do **not** see:

```text
backend/.env
node_modules/
```

Then commit:

```bash
git commit -m "Initial commit"
```

Create a new repository on GitHub.

Then connect it:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

Rename the branch:

```bash
git branch -M main
```

Push:

```bash
git push -u origin main
```

---

# 18. Daily Git Workflow

After making changes:

```bash
git status
git add .
git commit -m "Describe the change"
git push
```

Examples:

```bash
git commit -m "Add product search"
```

```bash
git commit -m "Fix authentication flow"
```

```bash
git commit -m "Update shopping cart"
```

---

# 19. Important Security Rule

Never commit:

```text
.env
.env.local
.env.production
```

or files containing:

- MongoDB passwords
- JWT secrets
- Payment private keys
- SMTP passwords
- API private keys
- Access tokens

A safe `.env.example` can contain placeholders:

```env
PORT=5000
MONGO_URI=your_mongodb_uri_here
JWT_SECRET=your_jwt_secret_here
```

---

# 20. If a Secret Was Already Exposed

If a real password, API key, JWT secret, or database credential was accidentally committed or shared publicly:

1. Rotate/change the credential immediately.
2. Update your local `.env`.
3. Remove the secret from the repository/history if necessary.
4. Check the repository for other exposed credentials.

For a MongoDB credential, change the database user's password in MongoDB Atlas.

---

# 21. Troubleshooting

## MongoDB URI is undefined

If you get an error such as:

```text
The `uri` parameter to `openUri()` must be a string, got "undefined"
```

Check:

```bash
ls -la backend
```

Make sure:

```text
backend/.env
```

exists.

Then check that the variable name in `.env` exactly matches the backend code.

For example:

```env
MONGO_URI=...
```

must match code such as:

```js
process.env.MONGO_URI
```

---

## Frontend cannot connect to backend

Check:

1. Backend is running.
2. Backend port is correct.
3. Frontend API URL is correct.
4. CORS configuration is correct.
5. The browser Network tab for the failed request.
6. Backend terminal logs.

---

## `npm run dev` does not work

Check available scripts:

```bash
npm run
```

Then inspect:

```bash
cat package.json
```

Use the script that actually exists.

---

## Port already in use

On macOS/Linux:

```bash
lsof -i :5000
```

Replace `5000` with the port you are trying to use.

---

# 22. Fresh Computer Setup

For a completely fresh setup:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <PROJECT_FOLDER>

npm install
```

Backend:

```bash
cd backend
npm install
```

Create:

```text
backend/.env
```

Add the required environment variables.

Then:

```bash
npm run dev
```

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend URL printed by the terminal.

---

# 23. Final Setup Checklist

Before considering the project ready:

- [ ] Node.js installed
- [ ] Git installed
- [ ] MongoDB Atlas configured
- [ ] Database user created
- [ ] IP/network access configured
- [ ] `backend/.env` created
- [ ] Correct environment variable names used
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend starts successfully
- [ ] Frontend starts successfully
- [ ] Frontend can communicate with backend
- [ ] Authentication works
- [ ] Database connection works
- [ ] Payment/email configuration works if enabled
- [ ] `.env` is ignored by Git
- [ ] `node_modules` is ignored by Git
- [ ] No secrets are staged
- [ ] Initial Git commit created
- [ ] GitHub remote configured
- [ ] Project pushed successfully

---

## Quick Start

Once everything has been configured:

### Terminal 1

```bash
cd backend
npm run dev
```

### Terminal 2

```bash
cd frontend
npm run dev
```

Then open the frontend URL printed in Terminal 2.

