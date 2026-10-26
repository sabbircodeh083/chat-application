# AGENTS.md

Chattrix: one-to-one chat app built with Express 5, MongoDB/Mongoose, EJS and Socket.IO. CommonJS, server-rendered, no build step or bundler.

`README.md` is detailed and mostly accurate; when it disagrees with code, trust the code.

## Commands

- `npm install`
- `npm run production` — reliable local run (`NODE_ENV=production node app.js`); no extra tooling needed.
- `npm start` — dev mode, but requires **globally installed** `nodemon` (not a dependency). It fails on a clean checkout.
- No tests, no lint script, and no ESLint config despite the `eslint` dependency. Do not claim checks pass; verify by running the server.
- `jsconfig.json` only enables editor `checkJs`; there is no `tsc` and no typecheck command.
- App listens on `process.env.PORT` or `5000`. MongoDB must be reachable or `app.js` exits with code 1.

## Environment

`.env` is required (`dotenv.config()` at the top of `app.js`). Variables actually read by code:

`DB_STRING`, `PORT`, `COOKIE_SECRET`, `COOKIE_NAME`, `JWT_SECRET`, `JWT_EXPIRY`, `NODE_ENV`.

`APP_URL` appears in docs/`.env.example` but is unused by the app.

## Layout and naming traps

- Misspelled paths are canonical: `middlerwares/`, `utilites/`, `router/longinRouter.js`. Add code there; do not create correctly spelled duplicates.
- `app.js` is the only entrypoint. It connects Mongoose first, then calls `server.listen` (not `app.listen`) so Socket.IO shares the HTTP server. The instance is exposed as `global.io` for controllers.
- Flow: `router/*` → `controller/*` → `model/*`. `lib/user/userCrud.js` holds callback-style user persistence.
- Views are EJS with inline client JS. `public/js/moment.js` and `public/js/toastify.js` are vendored, not npm dependencies. Socket.IO's client is served by the server at `/socket.io/socket.io.js`.
- Use root-absolute asset paths (`/stylesheets/...`, `/images/...`) in views; relative paths break on nested URLs.

## Request/auth conventions

- HTML routes must be preceded by `decorateHtmlRespose(...)`. Auth and error middleware check `res.locals.html` to choose between redirect/HTML and JSON 401/error responses. JSON-only routes intentionally omit it.
- Auth is a JWT in a signed `httpOnly` cookie. `req.user` is `{ userid, username, email, avatar, role }`. Admin-only routes add `authorizationHandler`.
- Public `/register` always creates `role: "user"`; `POST /users` (admin only) creates admins. To bootstrap the first admin, register then update the user's `role` to `"admin"` in MongoDB.
- JSON error shape is `{ errors: { field: { msg } } }` or `{ errors: { common: ... } }`. `POST /inbox/search` returns **401** when no user matches.

## Behavior worth preserving

- `sendMessage` emits `global.io.emit("new_message", ...)` — a broadcast to every socket, not rooms. Clients ignore their own sender id and filter by `conversation_id`.
- Message history is sorted newest-first (`-date_time`), while `#chat-message-list` uses `flex-direction: column-reverse`, so the newest message appears at the visual bottom. Live messages are inserted before the first row to append at the bottom. Keep that order.
- `getInbox` attaches each conversation's latest message via aggregation and orders conversations by latest activity; `sendMessage` updates `Conversation.last_update` so the sidebar order stays correct.
- `Conversation` and `Message` store denormalized `{ id, name, avatar }` snapshots; later profile edits do not propagate to existing rows.
- Attachment limits are duplicated on purpose: server in `middlerwares/inbox/attachmentUpload.js`, client in `views/inbox.ejs`. Change both together (5 files, 10 MB each, JPEG/PNG/WebP/GIF).
- Uploads land in `public/uploads/avatars|attachments`; Multer creates the directories at boot. Local disk is ephemeral on Render — uploads disappear on redeploy.
- Deleting a conversation removes its attachment files; deleting a user removes their avatar.

## Verification

No automated suite exists. Smoke-test manually with MongoDB running: register/login → `/inbox` → start a conversation → send text and an image → confirm `new_message` arrives in a second browser session → delete the conversation and check its files are gone.

`NODE_ENV=development` renders full error objects on `views/error.ejs`; production renders only the message.
