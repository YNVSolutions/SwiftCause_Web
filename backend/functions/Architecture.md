# SwiftCause Backend

This directory contains all backend logic for the SwiftCause platform, implemented as Firebase Cloud Functions.

This codebase is written in **TypeScript** and follows a modular, scalable architecture to ensure a clear separation of concerns, easier debugging, and type-safe development.

-----

## Architecture Overview

The backend is built on a few core principles:

  * **TypeScript First:** The entire source code is in TypeScript (`.ts`), located in the `src/` directory. This provides type safety and better developer tooling.
  * **Modular by Domain:** Functions are not placed in a single file. Instead, they are grouped by their business domain (e.g., `payments`, `terminal`) inside the `src/functions/` directory.
  * **Centralized Exports:** A main `src/index.ts` file imports all individual functions from their respective modules and re-exports them. This is the single entry point that Firebase reads to discover all functions for deployment.
  * **Separate Configuration:** All service initializations (like `firebase-admin` and `stripe`) are kept in a dedicated `src/config/` directory. This prevents re-initializing services in every function file.
  * **Build & Deploy:** The TypeScript code in `src/` is **compiled** into plain JavaScript in a `lib/` directory. Firebase then deploys the compiled code from this `lib/` folder.

-----

## Folder Structure

The `backend/functions/` directory is organized as follows:

```
functions/
├── src/                    # <-- All development happens here (TypeScript source)
│   ├── config/             # Service initializations (Firebase, Stripe)
│   │   ├── firebase.ts
│   │   ├── stripe.ts
│   │   └── index.ts
│   │
│   ├── functions/          # Business logic, grouped by domain
│   │   ├── payments/
│   │   │   ├── createPaymentIntent.ts
│   │   │   ├── handleStripeWebhook.ts
│   │   │   └── index.ts        (Exports all payment functions)
│   │   │
│   │   ├── terminal/
│   │   │   ├── getConnectionToken.ts
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts            (Exports all domains)
│   │
│   ├── types/                # Shared TypeScript types and interfaces
│   │   ├── donation.ts
│   │   ├── payment.ts
│   │   └── index.ts
│   │
│   └── index.ts              # <-- The MAIN entry point for Firebase
│
├── lib/                      # <-- Compiled JavaScript output (Ignored by Git)
│   └── (auto-generated...)   # This folder is deployed to Firebase
│
├── .eslintrc.js            # ESLint configuration
├── .gitignore              # Ignores /lib, /node_modules, etc.
├── package.json            # Project scripts and dependencies
├── package-lock.json
└── tsconfig.json           # TypeScript compiler options (outputs to "lib")
```

-----

## Build & Deployment

The `package.json` file contains all necessary scripts for managing the project.

### Build

To compile your TypeScript code from `src/` to `lib/`, run:

```bash
npm run build
```

This is automatically triggered before deployment by a `predeploy` hook in `firebase.json`.

### Deployment

To deploy all functions to Firebase:

```bash
npm run deploy
```

This command is an alias for `firebase deploy --only functions`.

-----
