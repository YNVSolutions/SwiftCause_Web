# SwiftCause Architecture Diagrams

This document provides a visual overview of how the SwiftCause codebase is organized today.

Use it alongside [docs/FSD/FSD_ARCHITECTURE.md](./FSD/FSD_ARCHITECTURE.md) for the detailed architectural rules.

## 1. High-Level System View

```mermaid
flowchart LR
    U[Donor or Admin User]
    A[Next.js App Router<br/>app/]
    S[FSD Frontend Modules<br/>src/views, src/widgets, src/features,<br/>src/entities, src/shared]
    F[Firebase Services<br/>Auth, Firestore, Storage]
    CF[Firebase Cloud Functions<br/>backend/functions]
    ST[Stripe]

    U --> A
    A --> S
    S --> F
    S --> CF
    CF --> F
    CF --> ST
```

## 2. Frontend Layer Map

The active frontend is split between route entrypoints in `app/` and reusable FSD modules in `src/`.

```mermaid
flowchart TD
    APP[app/<br/>Next.js route entrypoints]
    VIEWS[src/views<br/>route-level screens]
    WIDGETS[src/widgets<br/>composed UI blocks]
    FEATURES[src/features<br/>user actions and workflows]
    ENTITIES[src/entities<br/>business domain slices]
    SHARED[src/shared<br/>ui, lib, config, api, types]

    APP --> VIEWS
    VIEWS --> WIDGETS
    VIEWS --> FEATURES
    VIEWS --> ENTITIES
    WIDGETS --> FEATURES
    WIDGETS --> ENTITIES
    FEATURES --> ENTITIES
    FEATURES --> SHARED
    ENTITIES --> SHARED
```

## 3. Dependency Rule

Lower-level code must not depend on higher-level code.

```mermaid
flowchart LR
    APP[app]
    VIEWS[views]
    WIDGETS[widgets]
    FEATURES[features]
    ENTITIES[entities]
    SHARED[shared]

    APP --> VIEWS
    VIEWS --> WIDGETS
    WIDGETS --> FEATURES
    FEATURES --> ENTITIES
    ENTITIES --> SHARED
```

Allowed imports flow from left to right only.

## 4. Runtime Request Flow

This is the common path for payment, auth, and admin actions.

```mermaid
sequenceDiagram
    participant User
    participant Route as app/ route
    participant Feature as src/features or src/views
    participant Shared as src/shared
    participant Func as Firebase Functions
    participant Stripe as Stripe
    participant Firebase as Firebase Auth/Firestore/Storage

    User->>Route: Open page or submit action
    Route->>Feature: Render screen and trigger workflow
    Feature->>Shared: Reuse API/config/auth helpers
    alt Direct Firebase client access
        Shared->>Firebase: Read or write client-accessible data
        Firebase-->>Shared: Return data
    else Privileged server workflow
        Shared->>Func: Call HTTPS function
        Func->>Stripe: Process payment or onboarding
        Func->>Firebase: Persist validated state
        Func-->>Shared: Return server result
    end
    Shared-->>Feature: Return normalized result
    Feature-->>Route: Update UI state
    Route-->>User: Show result
```

## 5. Codebase Ownership Areas

```mermaid
flowchart TB
    subgraph Frontend
        ROUTES[app/<br/>routing, layouts, page entrypoints]
        V[src/views<br/>screen composition]
        W[src/widgets<br/>dashboard and payment blocks]
        FE[src/features<br/>auth, payments, campaigns, onboarding]
        EN[src/entities<br/>campaign, donation, user, kiosk, giftAid]
        SH[src/shared<br/>ui, config, firebase, api helpers]
    end

    subgraph Backend
        BF[backend/functions<br/>HTTP functions, webhook handlers, triggers]
        BC[backend/firebase.json<br/>emulator and deploy config]
    end

    ROUTES --> V
    V --> W
    V --> FE
    FE --> EN
    EN --> SH
    FE --> SH
    FE --> BF
    BF --> BC
```

## 6. Where To Start As A Contributor

- Route or page behavior: start in `app/`, then trace into `src/views`.
- Business workflow changes: start in `src/features`.
- Domain model or reusable business UI: start in `src/entities`.
- Shared infrastructure, Firebase setup, or API helpers: start in `src/shared`.
- Server-side payment, webhook, or admin logic: start in `backend/functions`.
