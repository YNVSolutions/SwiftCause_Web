# Contributing to SwiftCause

Thank you for contributing to SwiftCause. This guide explains how to set up the project locally, what standards to follow, and what to include when you open a pull request.

## How To Contribute

### Report Bugs

If you find a bug, [open an issue](https://github.com/YNVSolutions/SwiftCause_Web/issues/new) and include:

- A short, specific title
- Clear reproduction steps
- Expected behavior
- Actual behavior
- Your environment details such as browser, OS, and route

### Suggest Features

Before proposing a new feature:

1. Check existing issues and roadmap items first.
2. Open a feature request with the problem, proposed solution, and any constraints.

### Submit Pull Requests

Pull requests should stay focused. If a change mixes refactoring, product behavior, and tooling work, split it unless the pieces are tightly coupled.

## Prerequisites

Install the following locally:

- [Node.js](https://nodejs.org/) v20 or later for the frontend
- Node.js v22 for Firebase Functions compatibility
- [npm](https://www.npmjs.com/)
- [Firebase CLI](https://firebase.google.com/docs/cli)

You will also need access to:

- A Firebase project for client configuration and emulator usage
- Stripe test credentials for payment-related work

## Local Development Setup

### 1. Fork And Clone

```bash
git clone https://github.com/YNVSolutions/SwiftCause_Web.git
cd SwiftCause_Web
```

### 2. Install Frontend Dependencies

```bash
npm install
```

If you hit peer dependency conflicts, retry with:

```bash
npm install --legacy-peer-deps
```

### 3. Configure Frontend Environment Variables

Create `.env.local` in the repository root:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
```

These are client-side values. Do not commit server secrets, Firebase admin credentials, Stripe secret keys, or reCAPTCHA secret keys.

### 4. Install Firebase Functions Dependencies

```bash
cd backend/functions
npm install
cd ../..
```

## Firebase Emulator Setup

SwiftCause uses a separate Firebase backend under [backend](./backend). The Firebase config lives in [backend/firebase.json](./backend/firebase.json), and the Functions project lives in [backend/functions](./backend/functions).

### Start The Functions Emulator

Open a terminal in `backend` and run:

```bash
firebase emulators:start
```

If you only want the Functions emulator, you can run:

```bash
cd backend/functions
npm run serve
```

### Recommended Local Workflow

Use two terminals:

- Terminal 1:
  Run the Firebase emulator from `backend`
- Terminal 2:
  Run the Next.js app from the repository root with `npm run dev`

Then open `http://localhost:3000`.

### Emulator Notes

- Log in to Firebase CLI first with `firebase login` if needed.
- Make sure you are targeting the correct Firebase project before testing emulator-dependent flows.
- Payment and webhook flows may still depend on external Stripe test configuration even when Functions run locally.
- If you add new environment requirements for Functions, document them in your pull request.

## Architecture And Code Organization

SwiftCause follows Feature-Sliced Design. Read [docs/FSD_ARCHITECTURE.md](docs/FSD_ARCHITECTURE.md) before making structural changes.

### Core Rules

1. Follow one-way layer dependencies:
   `app -> pages -> widgets -> features -> entities -> shared`
2. Import through each slice's public API, typically its `index.ts`.
3. Keep shared utilities generic. Domain logic should stay in the appropriate feature or entity slice.

Example:

```ts
import { CampaignCard } from '@/entities/campaign';
```

Avoid importing from deep internal paths unless the slice intentionally exposes them.

## Coding Standards

### TypeScript

- Prefer explicit, narrow types over `any`.
- Reuse existing shared and domain types before adding new duplicates.
- Keep API contracts and UI state types aligned with the real backend behavior.

### React And Next.js

- Follow existing patterns in the touched area instead of mixing architectural styles.
- Keep components focused. Move cross-cutting logic into hooks, services, or slice-level utilities when needed.
- Avoid introducing client-side secrets or security assumptions in frontend code.

### Styling And UI

- Reuse the existing design system, components, and Tailwind conventions already present in the repo.
- Keep responsive behavior and accessibility in mind for form, donation, and admin flows.

### General Quality

- Run linting before opening a PR.
- Run formatting checks or format touched files before opening a PR.
- Do not commit generated build output such as `.next/` or `dist/`.
- Keep commits and pull requests scoped to one concern where practical.
- Update documentation when behavior, setup, or contributor workflow changes.

## Running Checks And Tests

Run these commands from the repository root unless noted otherwise.

### Frontend

```bash
npm run lint
npm run format:check
npm run build
npm run test:run
```

Notes:

- `npm run test:run` executes the Vitest suite with coverage reporting.
- `npm run build` is still important because it catches type and production build issues beyond the unit test suite.

### Firebase Functions

Run these from `backend/functions`:

```bash
npm run lint
```

If your change affects Cloud Functions behavior, test it against the local emulator before opening the PR.

## Commit Message Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

Preferred format:

```text
type(scope): short description
```

Examples:

```text
feat(auth): add forgot password confirmation flow
fix(payments): validate org ownership before onboarding
docs(contributing): add firebase emulator setup
chore(ci): tighten workflow checks
```

Common types:

- `feat`: new functionality
- `fix`: bug fix
- `docs`: documentation only
- `refactor`: code restructuring without behavior change
- `test`: test additions or updates
- `chore`: maintenance or tooling work
- `ci`: CI or workflow changes

Keep subject lines imperative and concise.

## Pull Request Expectations

Before opening a PR:

1. Branch from `main`.
2. Run the relevant checks locally.
3. Update docs if setup or behavior changed.
4. Confirm no secrets, generated files, or local artifacts were added.

When opening the PR:

- Explain what changed and why.
- List the checks you ran.
- Include screenshots or recordings for UI changes.
- Link related issues with `Closes #123` when applicable.
- Call out risks, migrations, or environment changes explicitly.

## Recommended Tooling

For VS Code, these extensions are useful:

- ESLint
- Tailwind CSS IntelliSense
- Prettier

## Questions

If anything in this guide is unclear, open a question issue or start from [ROADMAP.md](ROADMAP.md) and existing GitHub issues to find the right place to contribute.
