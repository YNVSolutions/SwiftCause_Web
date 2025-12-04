# SwiftCause Web - Feature-Sliced Design (FSD) Architecture


## 1\. Introduction

This document outlines the official **Feature-Sliced Design (FSD)** architecture for the SwiftCause Web project. The primary goal of this architecture is to improve code organization, scalability, and developer experience by establishing clear, enforceable boundaries between different parts of the application.

Adhering to this architecture is mandatory for all new development and refactoring efforts.

### Why FSD?

The migration to FSD addresses several issues in our previous component-centric architecture, including a monolithic `App.tsx`, scattered business logic, and a lack of enforced import rules.

The benefits of FSD include:

  * ✅ **Better Organization:** A clear, predictable place for every piece of code.
  * ✅ **Easier Onboarding:** The standard structure makes it easier for new developers to get up to speed.
  * ✅ **Improved Reusability:** Code is broken down into self-contained, reusable "slices."
  * ✅ **Clear Dependencies:** Import rules prevent spaghetti code and circular dependencies.
  * ✅ **Enhanced Testability:** Isolated slices are easier to test.

## 2\. Core Principles

The FSD methodology is built on two core concepts: **Layers** and **Slices**.

  * **Layers:** The entire application is divided into a set of hierarchical layers.
  * **Slices:** Code within each layer is broken down into business-domain-specific modules called "slices."

### The Golden Rule: Layered Imports

The most important rule in FSD is that **lower layers cannot import from higher layers**. This creates a one-way dependency flow, ensuring that foundational code doesn't depend on high-level application logic.

The hierarchy is as follows:

`app` → `pages` → `widgets` → `features` → `entities` → `shared`

These import rules are automatically enforced by ESLint.

## 3\. Folder Structure

The target FSD folder structure is as follows:

```
src/
├── app/                  # App initialization, providers, routing
├── pages/                # Route pages (e.g., home, admin-dashboard)
├── widgets/              # Composite UI blocks (e.g., navigation-header)
├── features/             # User actions (e.g., auth-by-email, donate)
├── entities/             # Business entities (e.g., campaign, user)
└── shared/               # Shared resources (UI, libs, config)
```

## 4\. Layers Explained

### `shared` Layer

The lowest layer. It contains code that is completely independent of the application's business logic.

  * **`shared/ui`:** Reusable UI components like `Button`, `Input`, `Card`, etc..
  * **`shared/lib`:** Utility functions, helper libraries, and framework initializations (e.g., `firebase.ts`, `currencyFormatter.ts`).
  * **`shared/api`:** Base API configurations (e.g., base Axios instance, but not specific endpoints).
  * **`shared/config`:** Global constants and configuration values.
  * **`shared/types`:** Global TypeScript types used across the application.

### `entities` Layer

This layer contains core business entities. An entity is a self-contained module representing a real-world object from the business domain.

  * **Examples:** `campaign`, `user`, `donation`, `kiosk`, `organization`.
  * **Contents:** Each entity slice can contain its own UI components (`CampaignCard`), model/logic (`useCampaigns` hook, types), and API calls (`getCampaign`).

### `features` Layer

This layer contains user-driven actions or features. A feature orchestrates interactions with business entities to achieve a specific user goal.

  * **Examples:** `auth-by-email`, `donate-to-campaign`, `manage-users`.
  * **Rule:** Features can import from `entities` and `shared`, but not from other features, widgets, or pages.

### `widgets` Layer

This layer contains composite UI blocks that combine multiple features and entities into a single, cohesive unit.

  * **Examples:** `navigation-header`, `dashboard-metrics`, `campaign-showcase`.
  * **Rule:** Widgets are often used across multiple pages.

### `pages` Layer

This layer represents the different pages of the application, corresponding to specific routes.

  * **Examples:** `home`, `admin-dashboard`, `campaign-detail`.
  * **Rule:** Pages compose widgets and features to build a complete view. They should contain minimal logic and focus primarily on layout.

### `app` Layer

The highest layer. It initializes the application, sets up providers, and defines the routing structure.

  * **Contents:** Context providers (Auth, Theme, Stripe), routing configuration, and the main `App.tsx` entry point.
  * **Rule:** `App.tsx` should be a "thin" orchestrator, with fewer than 50 lines of code.

## 5\. Slice Structure & Public API

To maintain clear boundaries, each slice (e.g., a feature or an entity) must expose its contents through a **public API**. This is achieved by creating an `index.ts` file at the root of the slice that exports only what other parts of the app are allowed to use.

### Standard Slice Structure

```
entities/campaign/
├── ui/                 # React components for the campaign (e.g., CampaignCard)
├── model/              # Business logic, hooks (useCampaigns), types
├── api/                # API calls for campaigns (getCampaigns)
└── index.ts            # Public API (barrel export)
```

### Public API (Barrel Export) Pattern

**Always import from the slice's `index.ts`, never from internal files.**

**Example `entities/campaign/index.ts`:**

```typescript
// GOOD: Exporting the public API of the 'campaign' entity
export { CampaignCard } from './ui/CampaignCard';
export { useCampaigns } from './model/useCampaigns';
export { getCampaign } from './api/getCampaign';
export type { Campaign } from './model/types';
```

**Example of Correct vs. Incorrect Imports:**

```typescript
// ❌ BAD: Importing from an internal file
import { useCampaigns } from '@/entities/campaign/model/useCampaigns';

// ✅ GOOD: Importing from the public API
import { useCampaigns } from '@/entities/campaign';
```

