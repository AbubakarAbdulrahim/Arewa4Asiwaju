# Development foundation

## Modules

```text
src/app/                  App Router pages, layouts, route handlers, and route boundaries
src/components/layout/    Shared public navigation and footer
src/components/admin/     Role-scoped administration shell, tables, and forms
src/components/ui/        Small accessible primitives, configured for shadcn/ui conventions
src/components/cards/     Membership-card presentation
src/lib/auth/             Role and authorization helpers
src/lib/admin/            Request-scoped administration identity checks
src/lib/cards/            Card generation domain code
src/lib/supabase/         Browser, request-scoped server, and privileged server clients
src/lib/validation/       Shared Zod schemas
src/types/                Database and application types
public/brand/             Approved public brand assets
supabase/migrations/      Version-controlled schema and policy changes
tests/                    Dependency-light foundation tests
docs/                     Architecture, product, and development decisions
```

Keep route handlers thin; validate at boundaries, call focused domain functions, and enforce access in both server code and database policies. Components in `src/components/ui` should remain small, keyboard-accessible, and consistent with the tokens in `src/app/globals.css`.

## Runtime configuration

Copy `.env.example` to `.env.local`. `src/lib/env.ts` validates `APP_ENV`, the public app URL, and paired Supabase public settings at module load. `APP_ENV` uses `development`, `staging`, or `production`; the Vercel Preview label `preview` is normalized to `staging`. Supabase configuration may stay unset while the application shell is developed. A Supabase client refuses to initialize until both URL and anon key are set. The admin client is server-only and requires `SUPABASE_SERVICE_ROLE_KEY`; it never falls back to an anon key. Do not put privileged secrets in variables prefixed with `NEXT_PUBLIC_`.

Set separate values in Vercel's Development, Preview, and Production scopes. Preview is the staging environment and must point to a non-production Supabase project. Use a separately managed production project and credentials. No deployed environment is configured by this repository alone.

## Quality checks

Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run db:test`, `npm run security:check`, and `npm run build`. CI runs the application checks on pull requests and pushes to `main` or `staging`; database pgTAP tests run with the Supabase CLI. Tests use Node's built-in test runner and TypeScript's erasable syntax support to keep the foundation dependency-light. The current runtime dependency audit reports zero known advisories. The full development dependency audit reports five high severity advisories through the existing Next ESLint dependency chain (`fast-glob` → `micromatch` → `braces`); npm's suggested forced fix would downgrade `eslint-config-next` to an incompatible major, so that forced downgrade was not applied. Review this tree as compatible upstream fixes become available.

## Git conventions

- Branches: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`, or `chore/<short-name>`.
- Commit messages: Conventional Commits, such as `feat: add member dashboard shell` or `fix: reject incomplete Supabase configuration`.
- Keep migrations and their tests with the feature that needs them; never edit an already-applied production migration.
- Pull requests should state user impact, security/data changes, verification commands and results, and any environment changes.
- Never commit secrets, real member data, local environment files, or generated build output.

## Phase 2 boundary

The initial CI, environment validation, logging helper, app boundaries, and shared shell are foundations. Supabase authentication flows, RLS, production content management, registration persistence, secure uploads, card issuance, monitoring integrations, deployment credentials, backups, and restoration checks remain for their relevant implementation phases. The current API routes intentionally do not claim those features are operational.
