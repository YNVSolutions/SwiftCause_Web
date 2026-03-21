# Contributing to SwiftCause

First off, thank you for considering contributing to SwiftCause! We're excited to have your help in building a modern, scalable donation platform. Every contribution, from a bug report to a new feature, is valuable.

Please take a moment to review this document to make the contribution process easy and effective for everyone involved.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please [open an issue](https://github.com/YNVSolutions/SwiftCause_Web/issues/new) and provide the following:

* **A clear title** that describes the issue.
* **Steps to reproduce** the bug.
* **What you expected to happen** versus what actually happened.
* **Your environment**: Browser, OS, etc.

### Suggesting Enhancements or New Features

We'd love to hear your ideas! To suggest an enhancement:

1.  **Check existing issues** to see if your idea has already been discussed.
2.  If not, [open a new issue](https://github.com/YNVSolutions/SwiftCause_Web/issues/new) to start a discussion. Please be as detailed as possible about the feature and *why* it would be valuable.

### Submitting a Pull Request

If you're ready to write code, that's fantastic! Here’s how to get set up and submit your work.

## Prerequisites

Before you begin, you'll need the following installed on your local machine:
* [Node.js](https://nodejs.org/) (v18 or later is recommended; our backend functions use v22)
* [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
* [Firebase CLI](https://firebase.google.com/docs/cli) (for running backend functions)

You will also need:
* A **Firebase** account to get API keys.
* A **Stripe** account to get a publishable API key.

## Local Development Setup

This project is a Next.js app with a separate backend for Firebase Functions. You'll need to run both.

1.  **Fork & Clone**
    * Fork the repository to your own GitHub account.
    * Clone your fork locally:
        ```bash
        git clone https://github.com/YNVSolutions/SwiftCause_Web.git
        cd SwiftCause_Web
        ```

2.  **Install Frontend Dependencies**
    * Install the dependencies from the root directory.
        ```bash
        npm install
        ```
    * **Note:** Our `package.json` has specific `overrides` for React 19. If you encounter peer dependency issues, you might need to use `npm install --legacy-peer-deps` as seen in our CI workflow.

3.  **Set Up Environment Variables**
    * Create a `.env.local` file in the root of the project.
    * Copy the following keys into it and add your keys from your Firebase and Stripe dashboards:
        ```bash
        # Stripe
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

        # Firebase
        NEXT_PUBLIC_FIREBASE_API_KEY=...
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
        NEXT_PUBLIC_FIREBASE_APP_ID=...
        ```

4.  **Set Up Backend Functions**
    * The Firebase functions have their own `package.json`.
    * Navigate to the functions directory and install its dependencies:
        ```bash
        cd backend/functions
        npm install
        cd ../..  # Return to the root
        ```

5.  **Run the Project**
    * You'll need two terminals open.

    * **Terminal 1 (Backend):** Start the Firebase emulators for the backend:
        ```bash
        firebase emulators:start
        ```

    * **Terminal 2 (Frontend):** Run the Next.js development server:
        ```bash
        npm run dev
        ```

    * Open `http://localhost:3000` in your browser to see the app.

## Our Architectural Philosophy: Feature-Sliced Design (FSD)

**This is the most important rule.** All contributions **must** adhere to our Feature-Sliced Design (FSD) architecture.

Before writing any code, please read our **[Architecture Documentation](docs/FSD_ARCHITECTURE.md)**.

### The Golden Rules

1.  **Layered Imports:** You must follow the one-way dependency rule. Lower layers **cannot** import from higher layers.
    * `app` → `pages` → `widgets` → `features` → `entities` → `shared`
    * For example, a file in `entities` can **never** import from `features` or `widgets`.

2.  **Public API (Barrel Exports):** Every slice (e.g., `entities/campaign`) must have an `index.ts` file that exports its public API. You **must** import from this file, not from internal files.

    * **✅ GOOD:**
        ```typescript
        import { CampaignCard } from '@/entities/campaign';
        ```

    * **❌ BAD:**
        ```typescript
        import { CampaignCard } from '@/entities/campaign/ui/CampaignCard';
        ```

Our ESLint configuration is set up to enforce these rules.

## Submitting Your Contribution

1.  **Create a Branch:**
    * Start from the `main` branch.
    * Create a new branch for your feature or bugfix:
        ```bash
        git checkout -b feature/my-new-feature
        # or
        git checkout -b fix/correct-payment-bug
        ```

2.  **Make Your Changes:**
    * Write your code, following the FSD architecture.
    * Add or update documentation as needed.

3.  **Lint & Format:**
    * Before committing, run the linter and auto-fix any issues:
        ```bash
        npm run lint
        ```
    * We also use Prettier for formatting, which your editor should be configured to run on save.

4.  **Commit Your Changes:**
    * We recommend using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for clear and descriptive commit messages.
        ```bash
        git commit -m "feat(campaign): Add new donation button to CampaignCard"
        # or
        git commit -m "fix(auth): Resolve issue with admin login redirect"
        ```

5.  **Push to Your Fork:**
    * Push your new branch to your fork:
        ```bash
        git push origin feature/my-new-feature
        ```

6.  **Open a Pull Request:**
    * Go to the SwiftCause repository on GitHub and open a new Pull Request.
    * Provide a clear title and description. If your PR fixes an existing issue, link to it using `Closes #123`.
    * A project maintainer will review your code.

## Coding Standards

* **ESLint:** We use ESLint for code quality. Our CI will fail if the linting step doesn't pass.
* **TypeScript:** This is a TypeScript-first project. Avoid `any` as much as possible and use the types defined in the `shared/types` and entity layers.
* **VS Code Extensions:** For the best developer experience, we highly recommend installing:
    * [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
    * [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
    * [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

Thank you for your contribution!
