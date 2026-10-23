# Chattrix — Real-Time Chat Application

A full-stack, real-time one-to-one chat application built with **Node.js**, **Express 5**, **MongoDB (Mongoose)**, **EJS** and **Socket.IO**. It ships with cookie-based JWT authentication, an admin dashboard for user management, image attachments, conversation search and instant message delivery — no page reloads required.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [Routes Reference](#routes-reference)
- [Data Models](#data-models)
- [How Real-Time Messaging Works](#how-real-time-messaging-works)
- [Security Notes](#security-notes)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [License](#license)
- [Live Demo](#live-demo)

---

## Features

### Authentication & Accounts
- Email **or** mobile number + password login.
- Passwords hashed with **bcrypt** (10 salt rounds).
- Stateless sessions via **JWT stored in a signed, `httpOnly` cookie**.
- Public self-registration from the login page.
- Automatic redirect to the inbox for already-authenticated users.

### Messaging
- Real-time message delivery with **Socket.IO** (server broadcasts `new_message`, clients render instantly).
- Conversation list with the participant's avatar, name and last update time.
- Search any user by **name**, **email** or **Bangladeshi mobile number** (`+8801XXXXXXXXX`).
- Start a new conversation with any registered user.
- Send **text messages** and up to **5 image attachments** per message.
- Message history loaded on demand per conversation.
- Delete a conversation together with all of its messages and uploaded files.

### User Management (Admin)
- Role-based access control (`admin` / `user`).
- Admin-only **Users** page: list, create and delete users.
- Avatar upload with automatic cleanup when validation fails or the user is deleted.

### UI / UX
- Server-rendered **EJS** views with a responsive custom stylesheet.
- Toast notifications (**Toastify**) and human-friendly timestamps (**Moment.js**).
- Modal dialogs for registration, adding users and starting conversations.
- Custom 404 / error page with environment-aware error details.

### Uploads
- Disk storage via **Multer**, organized into `public/uploads/avatars` and `public/uploads/attachments`.
- MIME-type allow-list: `jpeg`, `jpg`, `png`, `webp`, `gif`.
- Avatars limited to **5 MB**; attachments limited to **10 MB each / 5 files**.
- Upload directories are created automatically on boot.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js (CommonJS) |
| Server | Express 5 |
| Database | MongoDB + Mongoose 9 |
| Views | EJS 6 |
| Real-time | Socket.IO 4 |
| Auth | JSON Web Token + bcrypt + cookie-parser |
| Validation | express-validator |
| File Uploads | Multer |
| Dates | Moment.js |
| Notifications | Toastify |
| Tooling | dotenv, nodemon, ESLint, jsconfig (type-checking via `checkJs`) |

---

## Project Structure

```
chat-Application/
├── app.js                      # Entry point: Express app, HTTP server, Socket.IO, DB connect
├── controller/
│   ├── loginController.js      # Login, logout
│   ├── inboxController.js      # Conversations, messages, search, send, delete
│   └── usersController.js      # Admin user CRUD + public registration
├── lib/
│   └── user/userCrud.js        # Thin data-access helpers for users
├── middlerwares/
│   ├── common/
│   │   ├── authenticationHandler.js  # JWT verify, already-logged-in, role check
│   │   ├── decorateHtmlResponse.js   # Per-page locals (title, html flag, cache headers)
│   │   └── errorHandler.js           # 404 + centralized error handling
│   ├── inbox/attachmentUpload.js     # Multer config for message attachments
│   ├── login/loginValidator.js       # Login field validation
│   └── users/
│       ├── avatarupload.js           # Multer config for avatars
│       └── userValidators.js         # Registration/user field validation
├── model/
│   ├── People.js               # User (name, email, mobile, password, avatar, role)
│   ├── Conversation.js         # Conversation (creator, participant, last_update)
│   └── Message.js              # Message (text, attachments, sender, receiver, conversation_id)
├── router/
│   ├── longinRouter.js         # "/"          → login, logout, register
│   ├── inboxRouter.js          # "/inbox"     → chat endpoints
│   └── usersRouter.js          # "/users"     → admin user management
├── utilites/
│   ├── escape.js               # Escapes regex special characters in search input
│   ├── singleUploaders.js      # Single-file Multer factory
│   └── multipleUploader.js     # Multi-file Multer factory
├── views/
│   ├── index.ejs               # Login page
│   ├── inbox.ejs               # Chat UI + client-side Socket.IO logic
│   ├── users.ejs               # Admin user list
│   ├── error.ejs               # Error page
│   └── partials/               # header, modals
├── public/
│   ├── images/                 # Static images & icons
│   ├── js/                     # Moment.js, Toastify
│   ├── stylesheets/            # Main stylesheet + Toastify CSS
│   └── uploads/                # avatars/ and attachments/ (runtime files)
├── jsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** 18 or newer
- **MongoDB** — a local instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **npm**
- *(optional)* `nodemon` installed globally for the dev script

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/tortoisejr/chat-application.git
cd chat-application

# 2. Install dependencies
npm install

# 3. Create your environment file (see below)
cp .env.example .env   # or create .env manually

# 4. Start the app
npm run production     # or: npm start (development, requires nodemon)
```

The app will be available at **http://localhost:5000** (or whichever `PORT` you configure).

### Environment Variables

Create a `.env` file in the project root. These keys are required:

| Variable | Description | Example |
| --- | --- | --- |
| `DB_STRING` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/chattrix` |
| `PORT` | HTTP port (defaults to `5000`) | `5000` |
| `COOKIE_SECRET` | Secret used to sign cookies | `a-long-random-string` |
| `JWT_SECRET` | Secret used to sign JWTs | `another-long-random-string` |
| `JWT_EXPIRY` | Token lifetime (also used as cookie `maxAge`) | `1d` |
| `COOKIE_NAME` | Name of the auth cookie | `token` |
| `APP_URL` | Public base URL of the deployment | `https://chattrix-c8i8.onrender.com` |

> **Never commit `.env`.** It is already listed in `.gitignore`.

Example `.env`:

```dotenv
DB_STRING=mongodb://127.0.0.1:27017/chattrix
PORT=5000
COOKIE_SECRET=replace-me-with-a-random-string
JWT_SECRET=replace-me-with-another-random-string
JWT_EXPIRY=1d
COOKIE_NAME=token
APP_URL=http://localhost:5000
```

### Running the App

```bash
npm start           # development: NODE_ENV=development nodemon app.js
npm run production  # production:  NODE_ENV=production node app.js
```

> `npm start` relies on a globally installed `nodemon`. If you don't have it, run `npm i -g nodemon` or use `npm run production` for local work too.

**Creating your first admin:** public registration always creates a `user`. To get an admin, sign up normally and then update that document's `role` to `"admin"` in MongoDB (e.g. with MongoDB Compass or `mongosh`):

```js
db.people.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

---

## Routes Reference

### Public (`/`)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Login page (redirects to `/inbox` if authenticated) |
| `POST` | `/` | Authenticate with email/mobile + password |
| `POST` | `/register` | Public registration (creates a `user`) |
| `DELETE` | `/` | Logout — clears the auth cookie |

### Inbox (`/inbox`) — requires authentication

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/inbox` | Render the chat UI with the user's conversations |
| `POST` | `/inbox/search` | Search users by name / email / mobile |
| `POST` | `/inbox/conversation` | Create a conversation with a participant |
| `DELETE` | `/inbox/conversation/:conversationId` | Delete conversation + messages + files |
| `GET` | `/inbox/messages/:conversationId` | Fetch message history for a conversation |
| `POST` | `/inbox/message` | Send a message (text and/or attachments) |

### Users (`/users`) — requires authentication **and** `admin` role

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/users` | List all users |
| `POST` | `/users` | Create a user (admin role) |
| `DELETE` | `/users/:id` | Delete a user and their avatar file |

All non-HTML endpoints respond with JSON in the shape `{ message }` or `{ errors: { field: { msg } } }`.

---

## Data Models

**People (User)**

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String | required, trimmed |
| `email` | String | required, unique in practice (validated), lowercase |
| `mobile` | String | required, validated as `bn-BD` |
| `password` | String | required, bcrypt hash |
| `avatar` | String | uploaded filename |
| `role` | String | `admin` \| `user` (default `user`) |

**Conversation**

| Field | Type | Notes |
| --- | --- | --- |
| `creator` | `{ id, name, avatar }` | denormalized snapshot |
| `participant` | `{ id, name, avatar }` | denormalized snapshot |
| `last_update` | Date | defaults to now |

**Message**

| Field | Type | Notes |
| --- | --- | --- |
| `text` | String | optional if attachments exist |
| `attachment` | `[String]` | uploaded filenames |
| `sender` | `{ id, name, avatar }` | denormalized snapshot |
| `receiver` | `{ id, name, avatar }` | denormalized snapshot |
| `date_time` | Date | defaults to now |
| `conversation_id` | ObjectId | required, references `Conversation` |

All three schemas use `timestamps: true` (`createdAt` / `updatedAt`).

---

## How Real-Time Messaging Works

1. `app.js` creates a single HTTP server and attaches a Socket.IO `Server` to it, so both Express and Socket.IO share the same port. The instance is exposed as `global.io` for controllers.
2. The client loads `/socket.io/socket.io.js` — served by the server itself, so the client version always matches the installed package.
3. When `POST /inbox/message` saves a message, the controller emits a `new_message` event:

   ```js
   global.io.emit("new_message", {
     message: { conversation_id, sender, message, attachment, date_time },
   });
   ```

4. Connected clients receive the event and append the message to the open conversation (or bump the conversation preview), without a refresh.
5. On connect/disconnect the server logs the socket id — handy when debugging.

---

## Security Notes

- Passwords are hashed with bcrypt and never returned in responses.
- The JWT lives in a signed, `httpOnly` cookie, so it is not readable from client-side JavaScript.
- `authenticationHandler` protects every `/inbox` and `/users` route; `authorizationHandler` additionally enforces the `admin` role.
- User creation builds the document from an allow-list (`name`, `email`, `mobile`, `password`, `avatar`), preventing privilege escalation through injected fields like `role`.
- Emails are normalized to lowercase before the duplicate check and before saving.
- Uploads are restricted by MIME type and size, and rejected files are deleted from disk.
- Search input is regex-escaped (`utilites/escape.js`) before being used in a query.
- HTML responses are sent with `Cache-Control: no-store` to avoid stale authenticated pages.

### Production hardening checklist

- Use long, random values for `COOKIE_SECRET` and `JWT_SECRET`.
- Set `secure: true` on the auth cookie when serving over HTTPS.
- Add rate limiting on `/` (login) and `/register` to slow brute-force attempts.
- Store uploads in object storage (S3, Cloudinary, etc.) — local disk is ephemeral on most PaaS hosts.

---

## Deployment

The app is deployed on **Render** and talks to a hosted MongoDB cluster.

**Render settings**

| Setting | Value |
| --- | --- |
| Build Command | `npm install` |
| Start Command | `npm run production` |
| Environment | Node |
| Env vars | All keys from the table above |

Notes:

- Bind to `process.env.PORT` — Render injects this automatically (already handled in `app.js`).
- Uploaded avatars/attachments live on the local filesystem, so they are **lost on redeploy/restart** unless you attach a persistent disk or move to object storage.
- Keep `NODE_ENV=production` so stack traces are not exposed to clients.

---

## Roadmap

- [ ] Group conversations
- [ ] Typing indicators and read receipts
- [ ] Online/offline presence
- [ ] Message editing and deletion
- [ ] Push notifications
- [ ] Persistent object storage for uploads
- [ ] Rate limiting and audit logging

---

## License

Released under the **ISC License**. See `package.json` for details.

---

## Live Demo

**Try it here:** [https://chattrix-c8i8.onrender.com/](https://chattrix-c8i8.onrender.com/)

> The app is hosted on Render's free tier, so the first request after a period of inactivity may take 30–60 seconds while the instance wakes up.
