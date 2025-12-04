# Code Refactoring Plan - SwiftCause Web
**Date:** December 4, 2025  
**Current Codebase:** ~23,181 lines  
**Target Reduction:** 30-40% (reduce to ~14,000-16,000 lines)  
**Status:** Planning Phase

---

## Executive Summary

This document outlines a comprehensive refactoring strategy to reduce code duplication, improve maintainability, and optimize the SwiftCause Web codebase while maintaining full end-to-end functionality.

### Key Findings:
- **Duplicate API Logic:** 60% overlap between `shared/api` and entity/feature APIs
- **Repeated Hooks Pattern:** 8+ hooks with identical loading/error state management
- **Inline Formatters:** 15+ duplicate `formatCurrency` implementations
- **Large Components:** AdminDashboard (1,497 lines), CampaignManagement (800+ lines)
- **Redundant Views Layer:** Should be renamed to `pages` per FSD standards

---

## Phase 1: API Layer Consolidation
**Impact:** ~2,000 lines reduction  
**Priority:** HIGH  
**Risk:** Medium

### 1.1 Remove Duplicate API Functions

**Current State:**
```
src/shared/api/firestoreService.ts (300+ lines)
├── getCampaigns()
├── updateCampaign()
├── createCampaign()
└── deleteCampaign()

src/entities/campaign/api/campaignApi.ts (100+ lines)
├── getCampaigns()          // DUPLICATE
├── updateCampaign()        // DUPLICATE
├── createCampaign()        // DUPLICATE
└── deleteCampaign()        // DUPLICATE
```

**Action Items:**
- [ ] Delete `src/shared/api/firestoreService.ts` (300 lines)
- [ ] Delete `src/shared/api/authService.ts` (20 lines)
- [ ] Delete `src/shared/api/userApi.ts` (100 lines)
- [ ] Update all imports to use entity/feature APIs
- [ ] Move `submitFeedback()` to `features/contact-form/api/`
- [ ] Move `createThankYouMail()` to `features/donate-to-campaign/api/`

**Files to Update (imports):**
- `src/entities/campaign/model/hooks.ts` - use `campaignApi` instead of `shared/api`
- `src/shared/lib/hooks/useDashboardData.ts` - use entity APIs
- `src/views/home/ContactPage.tsx` - use feature API
- All view components importing from `shared/api`

**Expected Reduction:** ~420 lines

---

## Phase 2: Generic Hook Abstraction
**Impact:** ~800 lines reduction  
**Priority:** HIGH  
**Risk:** Low


### 2.1 Create Generic Data Fetching Hook

**Current Pattern (repeated 8+ times):**
```typescript
export function useCampaigns(organizationId?: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getCampaigns(organizationId);
      setCampaigns(list);
    } catch {
      setError('Failed to load campaigns. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    refresh();
  }, [refresh, organizationId]);

  return { loading, error, campaigns, refresh };
}
```

**New Generic Hook:**
```typescript
// src/shared/lib/hooks/useAsyncData.ts
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = [],
  errorMessage = 'Failed to load data'
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch {
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, error, data, refresh };
}
```

**Refactored Usage:**
```typescript
export function useCampaigns(organizationId?: string) {
  const { data: campaigns, ...rest } = useAsyncData(
    () => campaignApi.getCampaigns(organizationId),
    [organizationId],
    'Failed to load campaigns'
  );
  return { campaigns: campaigns || [], ...rest };
}
```

**Action Items:**
- [ ] Create `src/shared/lib/hooks/useAsyncData.ts`
- [ ] Refactor `useCampaigns` (50 lines → 10 lines)
- [ ] Refactor `useKiosks` (30 lines → 8 lines)
- [ ] Refactor `useUsers` (80 lines → 15 lines)
- [ ] Refactor `useOrganization` (40 lines → 10 lines)
- [ ] Create `useAsyncMutation` for create/update/delete operations

**Expected Reduction:** ~300 lines

---

## Phase 3: Utility Consolidation
**Impact:** ~500 lines reduction  
**Priority:** MEDIUM  
**Risk:** Low

### 3.1 Centralize Currency Formatting

**Current State:**
- 15+ inline `formatCurrency` implementations
- Existing utility at `src/shared/lib/currencyFormatter.ts` (underutilized)
- Duplicate `formatLargeCurrency`, `formatShortCurrency` in AdminDashboard

**Action Items:**
- [ ] Enhance `src/shared/lib/currencyFormatter.ts`:
  ```typescript
  export const formatCurrency = (amount: number, currency = 'USD', options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    compact?: boolean;
  }) => {
    if (options?.compact) {
      return formatCompactCurrency(amount, currency);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: options?.minimumFractionDigits ?? 2,
      maximumFractionDigits: options?.maximumFractionDigits ?? 2,
    }).format(amount);
  };

  export const formatCompactCurrency = (amount: number, currency = 'USD') => {
    // K, M, B formatting logic
  };
  ```
- [ ] Remove inline formatters from:
  - `AdminDashboard.tsx` (3 functions, ~40 lines)
  - `KioskManagement.tsx` (1 function, ~5 lines)
  - `DonationManagement.tsx` (1 function, ~10 lines)
  - `DonationSelectionScreen.tsx` (1 function, ~5 lines)
  - `components/KioskCampaignAssignmentDialog.tsx` (1 function, ~5 lines)

**Expected Reduction:** ~70 lines

### 3.2 Create Shared Date/Time Utilities

**Current Issues:**
- `getTimeBucket()` function in `useDashboardData.ts` (80 lines)
- Duplicate timestamp handling logic

**Action Items:**
- [ ] Create `src/shared/lib/dateFormatter.ts`
- [ ] Extract time bucket logic
- [ ] Create reusable date formatting utilities

**Expected Reduction:** ~50 lines

---

## Phase 4: Component Decomposition
**Impact:** ~3,000 lines reduction  
**Priority:** HIGH  
**Risk:** Medium


### 4.1 Break Down AdminDashboard (1,497 lines)

**Current Structure:**
```
AdminDashboard.tsx (1,497 lines)
├── Stats Cards (inline)
├── Charts (inline)
├── Platform Features (inline, 150+ lines)
├── Getting Started Steps (inline, 100+ lines)
├── Quick Tips (inline, 50+ lines)
├── Stripe Onboarding Dialog (inline, 100+ lines)
├── Activity Feed (inline)
└── Alerts Section (inline)
```

**Refactored Structure:**
```
src/widgets/admin-dashboard/
├── ui/
│   ├── DashboardStats.tsx          (100 lines)
│   ├── DashboardCharts.tsx         (200 lines)
│   ├── PlatformFeatures.tsx        (150 lines)
│   ├── GettingStartedGuide.tsx     (120 lines)
│   ├── QuickTips.tsx               (60 lines)
│   ├── StripeStatusDialog.tsx      (120 lines)
│   ├── ActivityFeed.tsx            (100 lines)
│   └── AlertsPanel.tsx             (80 lines)
├── model/
│   └── useDashboardMetrics.ts      (50 lines)
└── index.ts

src/views/admin/AdminDashboard.tsx  (150 lines - orchestration only)
```

**Action Items:**
- [ ] Extract `DashboardStats` component (4 stat cards)
- [ ] Extract `DashboardCharts` component (bar, line, pie charts)
- [ ] Extract `PlatformFeatures` component (feature cards grid)
- [ ] Extract `GettingStartedGuide` component (onboarding steps)
- [ ] Extract `QuickTips` component (tips cards)
- [ ] Extract `StripeStatusDialog` component (Stripe onboarding)
- [ ] Extract `ActivityFeed` component (recent activities)
- [ ] Extract `AlertsPanel` component (alerts display)
- [ ] Create widget barrel export

**Expected Reduction:** ~500 lines (through better organization and reusability)

### 4.2 Break Down CampaignManagement (800+ lines)

**Current Structure:**
```
CampaignManagement.tsx (800+ lines)
├── CampaignDialog (inline, 400+ lines)
├── Campaign List View (inline)
├── Search/Filter Logic (inline)
└── Image Upload Logic (inline)
```

**Refactored Structure:**
```
src/features/campaigns/
├── ui/
│   ├── CampaignDialog.tsx          (250 lines)
│   ├── CampaignList.tsx            (150 lines)
│   ├── CampaignFilters.tsx         (80 lines)
│   └── CampaignImageUpload.tsx     (60 lines)
├── model/
│   └── useCampaignForm.ts          (100 lines)
└── index.ts

src/views/admin/CampaignManagement.tsx (150 lines)
```

**Action Items:**
- [ ] Extract `CampaignDialog` to feature
- [ ] Extract `CampaignList` component
- [ ] Extract `CampaignFilters` component
- [ ] Extract `CampaignImageUpload` component
- [ ] Create `useCampaignForm` hook for form logic

**Expected Reduction:** ~300 lines

### 4.3 Consolidate Dialog Components

**Current State:**
- Multiple similar dialog implementations
- Repeated dialog structure patterns

**Action Items:**
- [ ] Create `src/shared/ui/FormDialog.tsx` (generic form dialog wrapper)
- [ ] Create `src/shared/ui/ConfirmDialog.tsx` (generic confirmation dialog)
- [ ] Refactor all dialogs to use generic wrappers

**Expected Reduction:** ~200 lines

---

## Phase 5: Views → Pages Migration
**Impact:** ~100 lines reduction  
**Priority:** MEDIUM  
**Risk:** Low

### 5.1 Rename and Restructure

**Action Items:**
- [ ] Rename `src/views/` → `src/pages/`
- [ ] Update all imports
- [ ] Update ESLint config to reference `pages` instead of `views`
- [ ] Align with FSD architecture standards

**Files to Update:**
- All files importing from `src/views/`
- `eslint.config.js` (already has pages rules)
- Documentation references

**Expected Reduction:** 0 lines (structural improvement only)

---

## Phase 6: Type System Optimization
**Impact:** ~400 lines reduction  
**Priority:** LOW  
**Risk:** Low

### 6.1 Consolidate Type Definitions

**Current Issues:**
- Type re-exports in entity models
- Duplicate interface definitions
- Unused type definitions

**Action Items:**
- [ ] Audit `src/shared/types/` for unused types
- [ ] Remove type re-exports from entity models (use direct imports)
- [ ] Consolidate duplicate interfaces
- [ ] Create type utility helpers

**Expected Reduction:** ~200 lines

---

## Phase 7: Configuration Consolidation
**Impact:** ~200 lines reduction  
**Priority:** LOW  
**Risk:** Low

### 7.1 Merge Configuration Files

**Current State:**
```
src/shared/config/
├── campaign.ts
├── constants.ts
├── env.ts
├── ui.ts
└── user.ts
```

**Action Items:**
- [ ] Evaluate if all config files are necessary
- [ ] Merge related configurations
- [ ] Remove unused constants

**Expected Reduction:** ~100 lines

---

## Phase 8: Remove Dead Code
**Impact:** ~1,000 lines reduction  
**Priority:** MEDIUM  
**Risk:** Low

### 8.1 Identify and Remove Unused Code

**Action Items:**
- [ ] Run unused export detection
- [ ] Remove commented-out code
- [ ] Remove unused imports
- [ ] Remove legacy API folder (`src/shared/api/legacy/`)
- [ ] Remove unused components
- [ ] Remove unused hooks

**Expected Reduction:** ~1,000 lines

---

## Implementation Strategy

### Phase Order (Recommended):
1. **Phase 1** (API Consolidation) - Foundation for other changes
2. **Phase 2** (Generic Hooks) - Reduces boilerplate immediately
3. **Phase 3** (Utilities) - Quick wins, low risk
4. **Phase 8** (Dead Code) - Clean slate before refactoring
5. **Phase 4** (Component Decomposition) - Major refactor
6. **Phase 5** (Views → Pages) - Structural alignment
7. **Phase 6** (Type System) - Polish
8. **Phase 7** (Configuration) - Final cleanup

### Testing Strategy:
- [ ] Run full test suite after each phase
- [ ] Manual E2E testing of critical flows
- [ ] Verify no broken imports
- [ ] Check build succeeds
- [ ] Verify no console errors

### Rollback Plan:
- Create git tags before each phase
- Keep feature branches for each phase
- Document breaking changes

---

## Expected Results

### Code Metrics:
| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Total Lines | 23,181 | ~15,000 | 35% |
| API Files | 420 | 0 (moved) | 100% |
| Hook Boilerplate | 800 | 200 | 75% |
| Duplicate Utils | 200 | 50 | 75% |
| Component Size (avg) | 400 | 200 | 50% |
| Dead Code | 1,000 | 0 | 100% |

### Quality Improvements:
- ✅ Full FSD compliance
- ✅ Consistent API patterns
- ✅ Reusable hook abstractions
- ✅ Smaller, focused components
- ✅ Better type safety
- ✅ Improved maintainability

### Performance Impact:
- Bundle size reduction: ~15-20%
- Faster build times
- Better tree-shaking
- Improved code splitting

---

## Risk Assessment

### High Risk Areas:
1. **API Migration** - Many files depend on shared/api
   - Mitigation: Update incrementally, test thoroughly
2. **Component Decomposition** - May break existing functionality
   - Mitigation: Extract components one at a time, verify each

### Medium Risk Areas:
1. **Hook Refactoring** - Changes behavior patterns
   - Mitigation: Ensure generic hook matches all use cases
2. **Type Changes** - May cause TypeScript errors
   - Mitigation: Fix types incrementally

### Low Risk Areas:
1. **Utility Consolidation** - Pure functions, easy to test
2. **Dead Code Removal** - No functional impact
3. **Rename Operations** - IDE can handle automatically

---

## Timeline Estimate

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: API Consolidation | 16 hours | 2 days |
| Phase 2: Generic Hooks | 12 hours | 1.5 days |
| Phase 3: Utilities | 8 hours | 1 day |
| Phase 4: Components | 24 hours | 3 days |
| Phase 5: Views → Pages | 4 hours | 0.5 days |
| Phase 6: Type System | 8 hours | 1 day |
| Phase 7: Configuration | 4 hours | 0.5 days |
| Phase 8: Dead Code | 8 hours | 1 day |
| **Total** | **84 hours** | **~10.5 days** |

*Note: Timeline assumes 1 developer working full-time*

---

## Success Criteria

- [ ] Codebase reduced by 30-40%
- [ ] All tests passing
- [ ] No console errors
- [ ] Build succeeds
- [ ] Full E2E functionality maintained
- [ ] FSD architecture compliance
- [ ] Improved code maintainability score
- [ ] Faster build times
- [ ] Smaller bundle size

---

## Next Steps

1. **Review this plan** with the team
2. **Create GitHub issues** for each phase
3. **Set up feature branches** for each phase
4. **Begin with Phase 1** (API Consolidation)
5. **Document learnings** as you progress


