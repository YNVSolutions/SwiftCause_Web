# Feature-Sliced Design (FSD) Migration Plan

**Project:** SwiftCause Web - Full FSD Refactoring  
**Project Board:** [FSD Architecture Migration](https://github.com/orgs/YNVSolutions/projects/5)  
**Roadmap:** [FSD_ROADMAP.md](./FSD_ROADMAP.md)  
**Milestone:** [Full FSD Refactoring](https://github.com/YNVSolutions/SwiftCause_Web/milestone/2)  
**Target Completion:** December 31, 2025  
**Total Issues:** 29 tickets across 8 phases

---

## 📋 Migration Overview

This migration will transform SwiftCause Web from a component-centric architecture to a fully compliant Feature-Sliced Design architecture, improving scalability, maintainability, and developer experience.

### Current Issues
- ❌ 690-line monolithic `App.tsx`
- ❌ No URL-based routing (SEO issues, no deep linking)
- ❌ Scattered business logic across `api/`, `hooks/`, and components
- ❌ Mixed architectural patterns
- ❌ Limited test coverage
- ❌ No enforced import rules

### Expected Benefits
- ✅ Clear separation of concerns
- ✅ Enforced architectural boundaries
- ✅ Easier onboarding for new developers
- ✅ Better code reusability
- ✅ Improved testability
- ✅ SEO-friendly routing
- ✅ Reduced coupling between modules

---

## 🎯 Phase Breakdown

### **Phase 1: Foundation & Setup** (3 tickets)
🏷️ `fsd-phase-1`

Establish the base structure and tooling for FSD.

- **#169** - Create FSD folder structure
- **#170** - Set up ESLint rules for FSD import restrictions
- **#171** - Document FSD architecture and migration plan

**Deliverables:**
- Complete FSD folder hierarchy
- ESLint boundaries configuration
- Architecture documentation

---

### **Phase 2: Shared Layer** (3 tickets)
🏷️ `fsd-phase-2`

Migrate foundational code that all other layers depend on.

- **#172** - Migrate UI components to `shared/ui`
- **#173** - Migrate utilities and libraries to `shared/lib`
- **#174** - Create shared types and constants

**Deliverables:**
- All 40+ UI components in `shared/ui/`
- Firebase, imageUpload, currencyFormatter in `shared/lib/`
- Global types and config in `shared/types/` and `shared/config/`

---

### **Phase 3: Entities Layer** (5 tickets)
🏷️ `fsd-phase-3`

Extract business entities with their own data, types, and UI.

- **#175** - Create Campaign entity
- **#176** - Create User entity
- **#177** - Create Donation entity
- **#178** - Create Kiosk entity
- **#179** - Create Organization entity

**Deliverables:**
- Entity structure: `ui/`, `model/`, `api/`, `index.ts`
- Real-time Firebase listeners (`onSnapshot`)
- Type-safe public APIs

**Key Change:** Replace one-time reads with real-time listeners for live updates.

---

### **Phase 4: Features Layer** (5 tickets)
🏷️ `fsd-phase-4`

Break down user actions into focused features.

- **#180** - Refactor authentication features (email, kiosk, signup)
- **#181** - Create campaign management features
- **#182** - Create donation and payment features
- **#183** - Create admin management features
- **#184** - Create kiosk management features

**Deliverables:**
- Each feature in its own directory
- Features compose entities
- Clear feature boundaries

**Examples:**
- `features/auth-by-email/`
- `features/donate-to-campaign/`
- `features/manage-users/`

---

### **Phase 5: Widgets Layer** (3 tickets)
🏷️ `fsd-phase-5`

Create composite UI blocks that combine features and entities.

- **#185** - Create navigation and layout widgets
- **#186** - Create admin dashboard widgets
- **#187** - Create campaign and donation widgets

**Deliverables:**
- Reusable composite blocks
- Widgets compose features and entities
- Used across multiple pages

**Examples:**
- `widgets/navigation-header/`
- `widgets/dashboard-metrics/`
- `widgets/campaign-showcase/`

---

### **Phase 6: Pages Layer** (4 tickets)
🏷️ `fsd-phase-6`

Migrate screens to pages with proper routing.

- **#188** - Create pages structure and public pages
- **#189** - Create authentication pages
- **#190** - Create campaign and donation pages
- **#191** - Create admin pages

**Deliverables:**
- All screens converted to pages
- Pages compose widgets and features
- Ready for routing integration

**Examples:**
- `pages/home/`
- `pages/admin-dashboard/`
- `pages/campaign-detail/`

---

### **Phase 7: App Layer** (3 tickets)
🏷️ `fsd-phase-7`

Create thin app initialization and routing.

- **#192** - Create app providers
- **#193** - Set up React Router with FSD pages
- **#194** - Refactor App.tsx to be thin orchestrator

**Deliverables:**
- Firebase, Stripe, Auth, Theme, Toast providers
- React Router with all pages
- App.tsx reduced to < 50 lines
- URL-based navigation with deep linking

**Key Change:** Replace screen state with React Router for SEO and bookmarking.

---

### **Phase 8: Cleanup & Testing** (3 tickets)
🏷️ `fsd-phase-8`

Finalize the migration and ensure quality.

- **#195** - Remove old folder structure
- **#196** - Add unit tests for FSD slices
- **#197** - Final documentation and verification

**Deliverables:**
- Old `components/`, `api/`, `hooks/` folders deleted
- > 70% test coverage
- Complete architecture documentation
- Performance verification

---

## 📊 Progress Tracking

**Project Board:** https://github.com/orgs/YNVSolutions/projects/5  
**Milestone:** https://github.com/YNVSolutions/SwiftCause_Web/milestone/2

### By Phase:
- **Phase 1:** 0/3 (Foundation)
- **Phase 2:** 0/3 (Shared)
- **Phase 3:** 0/5 (Entities)
- **Phase 4:** 0/5 (Features)
- **Phase 5:** 0/3 (Widgets)
- **Phase 6:** 0/4 (Pages)
- **Phase 7:** 0/3 (App)
- **Phase 8:** 0/3 (Cleanup)

**Overall:** 0/29 tickets completed

---

## 🔧 Technical Guidelines

### FSD Layer Import Rules

```
app      →  can import from: pages, widgets, features, entities, shared
pages    →  can import from: widgets, features, entities, shared
widgets  →  can import from: features, entities, shared
features →  can import from: entities, shared
entities →  can import from: shared
shared   →  can import from: other shared modules only
```

**Rule:** Lower layers cannot import from higher layers.

### Slice Structure

Every slice (feature, entity, widget, page) follows this structure:

```
slice-name/
├── ui/           # React components
├── model/        # Business logic, hooks, types
├── api/          # API calls (if needed)
├── lib/          # Helper functions (if needed)
└── index.ts      # Public API (barrel export)
```

### Public API Pattern

Each slice exports via `index.ts`:

```typescript
// entities/campaign/index.ts
export { CampaignCard } from './ui/CampaignCard';
export { useCampaigns } from './model/useCampaigns';
export { getCampaign } from './api/getCampaign';
export type { Campaign } from './model/types';
```

---

## 🚀 Getting Started

### For Developers

1. **Read the FSD documentation** (Issue #171)
2. **Follow the phase order** - Don't skip phases
3. **Always use public APIs** - Import from slice index, not internal files
4. **Keep slices isolated** - No cross-imports at same layer
5. **Write tests** - Add tests as you migrate

### Picking Up a Ticket

1. Assign yourself to an issue
2. Create a feature branch: `git checkout -b fsd-phase-X-ticket-number`
3. Follow the task checklist in the issue
4. Update imports across the codebase
5. Run tests and linter
6. Create PR with reference to issue number
7. Mark issue as complete when merged

---

## 📚 Resources

- **FSD Official Docs:** https://feature-sliced.design/
- **FSD Examples:** https://github.com/feature-sliced/examples
- **Project Board:** https://github.com/orgs/YNVSolutions/projects/5
- **Project Milestone:** https://github.com/YNVSolutions/SwiftCause_Web/milestone/2
- **Architecture Docs:** `docs/architecture/` (created in Phase 1)

---

## ⚠️ Important Notes

### Before Starting Any Phase:
- ✅ Ensure previous phase is complete
- ✅ Pull latest changes from main
- ✅ Create feature branch

### During Migration:
- ⚠️ Don't break existing functionality
- ⚠️ Update imports immediately after moving files
- ⚠️ Test thoroughly before PR
- ⚠️ Keep PRs focused on single phase/ticket

### Safety Measures:
- 🔒 Create git tags at phase boundaries
- 🔒 Never force push to main
- 🔒 Require code reviews for all PRs
- 🔒 Run full regression tests before merging phases

---

## 🎉 Success Criteria

The migration is complete when:

- ✅ All 29 tickets closed
- ✅ All old folders (`components/`, `api/`, `hooks/`) deleted
- ✅ ESLint boundaries enforced
- ✅ > 70% test coverage
- ✅ App runs without errors
- ✅ All pages accessible via URLs
- ✅ Performance metrics maintained or improved
- ✅ Documentation complete

---

## 👥 Team Coordination

### Recommended Approach:
1. **Phase 1-2:** One developer (foundation)
2. **Phase 3:** Parallelize entities (5 developers)
3. **Phase 4:** Parallelize features (5 developers)
4. **Phase 5-6:** 2-3 developers
5. **Phase 7-8:** One developer (integration)

### Communication:
- Daily standups during active phases
- Update milestone after each merge
- Pair programming for complex refactors
- Code reviews required for all PRs

---

**Last Updated:** October 5, 2025  
**Created By:** AI Assistant  
**Contact:** Team leads for questions
