Arewa4Asiwaju

Arewa4Asiwaju is a web platform for supporter registration, membership
management, mobilisation, and organisational administration. It is
designed to help supporters register, access membership services, and
receive relevant updates, while authorised administrators manage records
and platform operations.

Project status: Under active development. The repository's dev
branch and staging Supabase environment are used for development and
preview testing. Confirm deployment and feature readiness before
treating the platform as production-ready.

Overview

The platform is intended to bring supporter-facing services and
administrative workflows into one place, including:

Supporter registration and account authentication

Membership profiles and membership records

<<<<<<< HEAD
Use a separate Supabase project and distinct credentials for local development, staging, and production. Set `APP_ENV` to `development`, `staging`, or `production`, and set `NEXT_PUBLIC_APP_URL` for each environment. For compatibility, `APP_ENV=preview` is normalized to `staging` on Vercel Preview deployments. In Vercel, configure environment variables separately for Development, Preview (staging), and Production; production secrets must not be copied into preview deployments. Store `SUPABASE_SERVICE_ROLE_KEY` only as a server-side environment variable. Never commit `.env.local`, provider credentials, or production data.
=======

Digital ID-card generation and administrative approval workflows

> > > > > > > df66ad66cfe5bf603dbe260f9d70503332dd5db9

Role-based access for authorised administrative users

Organisational units and role assignments

Events and event registrations

Announcements and media assets

Support requests and notification preferences

Administrative audit trails and data-request workflows

Database access controls using PostgreSQL Row Level Security (RLS)

Feature availability may vary while development is in progress.

Technology Stack

Framework: Next.js 16 with App Router

Language: TypeScript

UI: React, Tailwind CSS, and shadcn/ui components

Backend and database: Supabase (PostgreSQL, Auth, and Storage
where configured)

Validation: Zod

Testing: Unit tests, database tests, and Playwright end-to-end
checks as configured in the repository

CI: GitHub Actions

Deployment: Vercel

Source control: Git and GitHub

Check package.json and the project configuration files for the exact
versions and available commands.

Getting Started

Prerequisites

Install the following before starting:

Node.js version compatible with the project's package.json and CI
workflow

npm

Git

A Supabase project for the environment you are working in

Supabase CLI and Docker, if you intend to run the local Supabase
database test suite

1. Clone the repository

git clone https://github.com/AbubakarAbdulrahim/Arewa4Asiwaju.git
cd Arewa4Asiwaju

Switch to the development branch if that is the branch you have been
asked to work on:

git switch dev

2. Install dependencies

npm install

3. Configure environment variables

Create a local .env.local file in the project root. Use the
repository's .env.example or environment documentation as the source
of truth when available.

Typical Supabase client settings include:

APP_ENV=development
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

Fill in the values from the correct Supabase project. Do not commit
.env.local or credentials to Git.

The application validates APP_ENV and expects one of:

development

staging

production

Use development for local development. Use staging for a staging
deployment and production for a production deployment, according to
the deployment configuration. APP_ENV is an application setting; it
does not select a Supabase project by itself. The Supabase URL and
public client key determine which project the client connects to.

If server-side integrations require additional secrets, configure them
only in the appropriate local environment or deployment settings. Never
expose service-role keys or other privileged credentials through
NEXT_PUBLIC_* variables, browser code, source control, or public logs.

4. Run the development server

npm run dev

Open http://localhost:3000 in your browser.

Available Commands

The following commands are confirmed for this repository:

Command Purpose

npm run dev Start the Next.js development
server, if defined in
package.json.

npm run build Build the application for
production.

Other checks---such as linting, formatting, type checking, unit tests,
and end-to-end tests---are configured through the repository's scripts
and GitHub Actions workflow. Check package.json for their exact names
before running them.

Supabase and Database Development

The project uses Supabase for its backend and PostgreSQL database.

Recommended workflow:

Use a dedicated Supabase staging project for preview and integration
testing.

Keep schema changes in version-controlled migration files.

Test migrations and database policies against a local or
non-production database before deployment.

Run the database test suite where the local Supabase services are
available:

npm run db:test

Review Row Level Security (RLS) policies whenever tables, views,
functions, or access patterns change.

Apply migrations to production only after review, testing, and
explicit authorisation.

Do not use production data or production credentials for local testing.
Never disable security policies simply to make a test pass.

Environment Configuration and Deployment

Vercel

Connect the GitHub repository to Vercel and configure environment
variables separately for Development, Preview, and
Production as appropriate.

For a typical workflow:

Local development: APP_ENV=development and local development
credentials.

Preview/staging: APP_ENV=staging and staging Supabase
credentials.

Production: APP_ENV=production and production Supabase
credentials.

Make sure the environment variables are assigned to the Vercel
environment that is actually building the deployment. A deployment from
the dev branch is commonly a Preview deployment unless the Vercel
project is configured otherwise.

After changing environment variables, trigger a new deployment so the
build receives the updated values. Keep application environment labels
and Supabase project credentials consistent with the intended
deployment.

GitHub Actions

The repository has a GitHub Actions CI workflow at
.github/workflows/ci.yml. It runs automated verification and database
checks. The configured verification process includes checks such as
security auditing, formatting, linting, TypeScript, tests, and a
production build; the database job runs npm run db:test.

Run the relevant checks locally before pushing changes. Investigate and
fix the first failing CI step rather than removing or bypassing required
checks.

Project Structure

The application uses the Next.js App Router. Important locations
include:

src/
app/ # App Router routes, layouts, and pages
lib/ # Shared utilities and environment validation
supabase/
migrations/ # Version-controlled database migrations, if present
tests/ # Database tests, if present
.github/
workflows/
ci.yml # GitHub Actions CI workflow

The exact directory structure may evolve; consult the repository for the
current layout.

Security Guidelines

Never commit .env files containing real credentials.

Never expose Supabase service-role keys or other privileged secrets
in client-side code.

Keep authentication and authorisation checks on the server where
required.

Use least-privilege access and review RLS policies for every
database change.

Validate untrusted input at application and database boundaries.

Keep audit and data-request workflows intact when changing
administrative functionality.

Do not run destructive database operations against staging or
production without confirming the target environment and obtaining
authorisation.

Rotate any secret that has accidentally been committed or exposed.

Contributing

Create a focused feature branch from the appropriate base branch.

Keep changes small and explain their purpose in the commit message.

Update or add tests for changed behaviour.

Run the relevant checks and npm run build.

Test database migrations and RLS changes in a non-production
environment.

Open a pull request with a summary, testing notes, and any migration
or environment-variable changes.

Do not commit secrets, generated build output, or unrelated changes.

Troubleshooting

Build fails while validating APP_ENV

The environment validator expects development, staging, or
production. Check the actual value provided to the build and make sure
APP_ENV is configured for the correct Vercel environment. Do not
confuse APP_ENV with NODE_ENV, which Next.js manages.

Supabase is not connecting

Verify that NEXT_PUBLIC_SUPABASE_URL and
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are present and belong to the
intended Supabase project. Check the browser console and server logs
without printing secrets.

Database tests fail

Run npm run db:test in an environment with the required Supabase CLI
and local services. Inspect the first SQL or test assertion failure,
then review migrations, test fixtures, and RLS policies. Do not bypass
the test suite to make CI green.

Vercel shows no successful production deployment

Check the deployment status and build logs. Confirm that the correct Git
repository and branch are connected, the necessary environment variables
are configured for that deployment target, and the build completes
successfully.

License

No license has been specified in this README. Add the project's chosen
license and include a LICENSE file before distributing the code under
an open-source license.

Repository

github.com/AbubakarAbdulrahim/Arewa4Asiwaju
