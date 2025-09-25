# Fitflix Backend — current implementation

This repository contains the Fitflix backend application. The README below is intentionally minimal and describes the actual current implementation and how to run it.

## What this code runs

- Entry points: `server.js` (primary, includes clustering/memory controls) and `index.js` (simpler entry).
- The Express application is located at `src/app` and is required by the entry files.
- A blog scheduler (`src/features/blog/blog.scheduler`) is started automatically when the server boots.
- The project uses Prisma (`prisma/*`) for database migrations and seeding (see `package.json` scripts).

## Important scripts (from `package.json`)

- start: production optimized Node flags and loads `.env`
- start:memory-optimized: lower-memory Node flags and loads `.env`
- dev: development mode (loads `.env.dev`)
- build / db scripts: Prisma generate / migrate / seed helpers
- test: runs Jest (unit/integration tests configured)

See `package.json` for the exact commands.

## Environment variables used by the runtime

- NODE_ENV — environment (development | production | test)
- PORT — HTTP port (default 3000)
- DATABASE_URL — Prisma database connection string
- JWT_SECRET, COOKIE_SECRET — security keys (if used by app)
- ENABLE_CLUSTERING — set to "true" to enable clustering in production
- MAX_MEMORY_MB — numeric limit checked by `server.js` before enabling clustering
- DEBUG_LOGS — when set to "true" enables extra startup logs

The package scripts set dotenv via `dotenv_config_path` so the appropriate .env file is loaded when using the npm scripts.

## How to run (quick)

1. Install deps:

   npm install

2. Development:

   npm run dev

3. Production (example):

   npm run start:memory-optimized

The server logs include memory and scheduler startup status.

## Notes about clustering & memory

- `server.js` conditionally enables Node.js clustering when `ENABLE_CLUSTERING=true`, `NODE_ENV=production`, and `MAX_MEMORY_MB >= 1024`. Otherwise it runs a single process (memory-optimized mode).
- The start scripts include Node flags to limit heap size and optimize for small memory footprints.

## Minimal troubleshooting

- If the server does not start, check that the correct `.env` file is present and that `DATABASE_URL` (if required) is set.
- For local development ensure `NODE_ENV=development` or run `npm run dev` which loads `.env.dev`.

---

If you want a more detailed README (endpoints, schema, examples), tell me which parts you want included and I'll expand this minimal implementation README accordingly.
* **Discord:** [Join our community](https://discord.gg/your-invite)
* **Issues:** [GitHub Issues](https://github.com/Fitflix-org/fitflix-backend/issues)
* **Docs:** [docs.fitflix.example.com](https://docs.fitflix.example.com)
* **Sponsor:** [GitHub Sponsors](https://github.com/sponsors/Fitflix-org)

---

## 🙏 Acknowledgments

* **Design Inspiration:** Dribbble
* **Libraries:**

  * [Express](https://expressjs.com/)
  * [PostgreSQL](https://www.postgresql.org/)
  * [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
* **Contributors:** Thanks to all [contributors](https://github.com/Fitflix-org/fitflix-backend/contributors)
* **Special Thanks:** Open-source community for invaluable support
