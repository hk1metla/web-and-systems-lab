# Event Manager

Express/EJS interface with SQLite-backed event creation, editing and attendee views.

```bash
npm ci
npm run build-db
npm start
```

Open `http://localhost:3001`. The initializer seeds fictional demo events. If a database already exists it refuses replacement; use `npm run build-db -- --reset` only for disposable data. `SESSION_SECRET` may be supplied through your environment. The maintained server binds to loopback.

This recovered prototype has incomplete organizer authorization, and its “booked” flags are illustrative rather than a real reservation/payment system. Do not deploy publicly without rebuilding those controls. Original SQLite data and `.env` were excluded.

Verification: demo database initialization and six HTTP page/asset requests passed using a real SQLite database. Create/edit/delete and booking workflows were not exhaustively tested.
