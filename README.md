# Arewa for Asiwaju (A4A)

Next.js App Router foundation for the Arewa for Asiwaju public website and future member and administration services. Public registration, card issuance, and verification remain unavailable until their verified Supabase workflows are implemented.

## Local development

Requirements: Node.js 22 and npm 10 or later.

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` (PowerShell: `Copy-Item .env.example .env.local`). The public site runs without Supabase credentials; leave both public Supabase variables blank in that case.
3. Start the app with `npm run dev` and visit `http://localhost:3000`.

Before submitting changes, run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

## Environments

Use a separate Supabase project and distinct credentials for local development, staging, and production. Set `APP_ENV` to `development`, `staging`, or `production`, and set `NEXT_PUBLIC_APP_URL` for each environment. For compatibility, `APP_ENV=preview` is normalized to `staging` on Vercel Preview deployments. In Vercel, configure environment variables separately for Development, Preview (staging), and Production; production secrets must not be copied into preview deployments. Store `SUPABASE_SERVICE_ROLE_KEY` only as a server-side environment variable. Never commit `.env.local`, provider credentials, or production data.

## Project structure

See [docs/development/project-structure.md](docs/development/project-structure.md) for the module map, environment policy, CI, and branch conventions. Supabase migrations live in `supabase/migrations/`; apply changes through reviewed, versioned migrations. The administration workspace, procedures, scope rules, and staging checklist are documented in [docs/development/administration.md](docs/development/administration.md).

## Current scope

The public shell, About page, registration preview, and card verification explanation are present. Registration and ID-card APIs intentionally return unavailable responses until server-side verification, database constraints, RLS, and idempotent issuance are completed. Do not use this foundation as a live membership system yet.
