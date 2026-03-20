# SwiftCause - Project Context & Guidelines

## 🌟 Project Overview
SwiftCause is a modern, scalable donation platform designed for UK-based nonprofits. It enables organizations to manage fundraising campaigns, process secure payments via Stripe, and analyze donation data through a comprehensive dashboard.

- **Tech Stack:**
  - **Frontend:** Next.js (App Router), React 19, TypeScript, Tailwind CSS 4, Radix UI.
  - **Backend:** Firebase (Auth, Firestore, Cloud Functions, Storage).
  - **Payments:** Stripe integration.
  - **Testing:** Vitest.
  - **Linting:** ESLint with custom FSD rules.

## 🏛️ Architecture: Feature-Sliced Design (FSD)
The project strictly follows the **Feature-Sliced Design (FSD)** methodology. This ensures a modular, scalable, and maintainable codebase.

### Layers (Hierarchy: `app` → `pages`/`views` → `widgets` → `features` → `entities` → `shared`)
- **`app/`**: Next.js App Router entry points, global providers, and layouts.
- **`src/views/`** (Transitioning to `pages/`): Full pages composed of widgets and features.
- **`src/widgets/`**: Large, self-contained UI blocks (e.g., `NavigationHeader`, `AdminDashboard`).
- **`src/features/`**: User actions and business logic (e.g., `auth-by-email`, `donate-to-campaign`).
- **`src/entities/`**: Core business objects (e.g., `campaign`, `user`, `donation`, `kiosk`).
- **`src/shared/`**: Generic, reusable components, hooks, and libraries (e.g., `Button`, `firebase.ts`).
- **`src/components/`**: Legacy/Generic components (Note: In FSD, these should ideally move to `shared/ui`).

### The Golden Rule
**Lower layers cannot import from higher layers.** This one-way dependency flow is enforced by ESLint.
- `shared` can't import anything but other `shared` files.
- `entities` can only import from `shared`.
- `features` can import from `entities` and `shared`.
- And so on.

## 🚀 Key Commands

### Development
```bash
# Frontend development server
npm run dev

# Backend emulators (run in separate terminal or from backend/functions)
firebase emulators:start
```

### Build & Test
```bash
# Build for production
npm run build

# Run tests
npm run test
```

### Linting
```bash
# Run ESLint (checks FSD boundaries)
npm run lint
```

## 🛠️ Development Conventions
- **Public API (Barrel Exports):** Every slice (e.g., `entities/campaign`) must have an `index.ts` file that acts as its public API. Always import from the slice root (e.g., `@/entities/campaign`) rather than internal files.
- **Async Data:** Use generic hooks like `useAsyncData` (or similar abstractions identified in Phase 2 of refactoring) to handle loading and error states consistently.
- **Component Size:** Aim for small, focused components (under 300 lines). Break down monolithic components into widgets or features.
- **Styling:** Use Tailwind CSS 4 utility classes. Prefer Radix UI primitives for complex UI patterns.

## 📁 Key Directories & Files
- `app/`: Next.js routing and entry points.
- `src/`: Core application logic (FSD).
- `backend/`: Firebase configuration and Cloud Functions (`backend/functions`).
- `docs/`: Extensive documentation including:
  - `FSD/FSD_ARCHITECTURE.md`: Detailed architecture guide.
  - `refactor/REFACTORING_SUMMARY.md`: Current refactoring roadmap.
  - `PROJECT_WORKFLOW.md`: Development workflow.

## ⚠️ Important Notes
- **Environment Variables:** Required keys for Firebase and Stripe are listed in the `README.md` and should be placed in `.env.local`.
- **Firebase Functions:** Backend logic resides in `backend/functions`. It uses Node.js 22 and Stripe's Node SDK.
- **Refactoring Status:** The project is currently undergoing a refactoring phase to reduce code duplication and strictly align with FSD. Always check `docs/refactor/` before making major structural changes.
