# Phase 6: Type System Optimization - Implementation Guide

**Estimated Time:** 8 hours (1 day)  
**Risk Level:** Low  
**Expected Line Reduction:** ~200 lines

---

## Overview

This phase optimizes the TypeScript type system by removing duplicate type definitions, consolidating interfaces, and eliminating unnecessary type re-exports.

---

## Pre-Implementation Checklist

- [ ] Phase 5 completed and tested
- [ ] Create feature branch: `refactor/phase-6-type-system`
- [ ] Create git tag: `pre-refactor-phase-6`
- [ ] Audit current type usage

---

## Step 1: Audit Type Definitions

### 1.1 Find All Type Files

```bash
find src/ -name "types.ts" -o -name "*.types.ts"
```

### 1.2 Find Duplicate Type Definitions

```bash
# Find duplicate interface names
grep -rh "^export interface" src/ --include="*.ts" | sort | uniq -d
```

### 1.3 Find Type Re-exports

```bash
# Find files that just re-export types
grep -r "export.*from.*types" src/entities/ src/features/
```

---

## Step 2: Consolidate Entity Types

### 2.1 Remove Type Re-exports from Entity Models

**Current Pattern (to remove):**

**File: `src/entities/campaign/model/types.ts`**
```typescript
// Re-exporting from shared types (unnecessary)
export type { Campaign } from '@/shared/types';
```

**Action:** Delete these re-export files and use direct imports instead.

### 2.2 Update Imports to Use Direct Paths

**Before:**
```typescript
import { Campaign } from '@/entities/campaign/model/types';
```

**After:**
```typescript
import { Campaign } from '@/shared/types';
```

Or better, if the type truly belongs to the entity:

**Move type to entity:**
```typescript
// src/entities/campaign/model/types.ts
export interface Campaign {
  id: string;
  name: string;
  // ... campaign fields
}
```

**Then import from entity:**
```typescript
import { Campaign } from '@/entities/campaign';
```

---

## Step 3: Consolidate Shared Types

### 3.1 Audit Shared Types Directory

```bash
ls -la src/shared/types/
```

### 3.2 Identify Unused Types

Create a script to find unused type exports:

```bash
# For each type, check if it's imported anywhere
for type in $(grep -h "^export.*interface\|^export.*type" src/shared/types/*.ts | awk '{print $3}'); do
  count=$(grep -r "$type" src/ --include="*.ts" --include="*.tsx" | wc -l)
  if [ $count -eq 1 ]; then
    echo "Unused type: $type"
  fi
done
```

### 3.3 Remove Unused Types

Delete type definitions that are not imported anywhere.

### 3.4 Consolidate Related Types

**Before (multiple files):**
```
src/shared/types/
├── campaign.ts
├── donation.ts
├── kiosk.ts
├── user.ts
└── organization.ts
```

**After (if types are small, consider consolidating):**
```
src/shared/types/
├── index.ts (barrel export)
└── entities.ts (all entity types)
```

**Or keep separate but ensure each is necessary.**

---

## Step 4: Remove Duplicate Interfaces

### 4.1 Find Duplicate Definitions

Look for interfaces defined in multiple places:

```bash
# Example: Find all "User" interface definitions
grep -rn "interface User" src/ --include="*.ts"
```

### 4.2 Consolidate to Single Source of Truth

**Example: User type**

**Before:**
```typescript
// src/shared/types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
}

// src/entities/user/model/types.ts (duplicate!)
export interface User {
  id: string;
  email: string;
  name: string;
}
```

**After:**
```typescript
// Keep only in src/entities/user/model/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
}

// Delete from src/shared/types/user.ts
// Update all imports to use entity type
```

---

## Step 5: Create Type Utility Helpers

### 5.1 Create Common Type Utilities

**File: `src/shared/types/utils.ts`**

```typescript
// Utility types for common patterns
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string;
export type Timestamp = Date | string;

// API response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Form types
export type FormData<T> = Partial<T>;
export type FormErrors<T> = Partial<Record<keyof T, string>>;

// Loading states
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}
```

### 5.2 Use Utility Types Throughout Codebase

**Before:**
```typescript
interface UseCampaignsReturn {
  campaigns: Campaign[] | null;
  loading: boolean;
  error: string | null;
}
```

**After:**
```typescript
import { AsyncState } from '@/shared/types/utils';

interface UseCampaignsReturn extends AsyncState<Campaign[]> {
  refresh: () => void;
}
```

---

## Step 6: Optimize Entity Type Exports

### 6.1 Update Entity Barrel Exports

**File: `src/entities/campaign/index.ts`**

**Before:**
```typescript
export * from './api';
export * from './model';
export * from './ui';
export type { Campaign } from './model/types';
```

**After:**
```typescript
// Export API
export { campaignApi } from './api';

// Export hooks
export { useCampaigns } from './model/hooks';

// Export types
export type { Campaign } from './model/types';

// Export components (if any)
export { CampaignCard } from './ui';
```

This makes it clear what's being exported and prevents accidental exports.

---

## Step 7: Remove Unnecessary Type Assertions

### 7.1 Find Type Assertions

```bash
grep -rn " as " src/ --include="*.ts" --include="*.tsx" | wc -l
```

### 7.2 Replace with Proper Typing

**Before:**
```typescript
const campaign = data as Campaign;
```

**After:**
```typescript
// Add proper type to the function
const getCampaign = async (id: string): Promise<Campaign> => {
  const data = await fetchCampaign(id);
  return data; // TypeScript knows it's Campaign
};
```

---

## Step 8: Add Missing Type Definitions

### 8.1 Find Implicit Any Types

```bash
# Enable strict mode temporarily to find issues
npx tsc --noEmit --strict
```

### 8.2 Add Explicit Types

Add type definitions where TypeScript is inferring `any`.

---

## Step 9: Verify and Test

### 9.1 TypeScript Compilation (Strict Mode)

```bash
npm run build
```

### 9.2 Run Type Checker

```bash
npx tsc --noEmit
```

### 9.3 Run Linter

```bash
npm run lint
```

### 9.4 Run Tests

```bash
npm run test:run
```

---

## Step 10: Update Type Documentation

### 10.1 Document Type Structure

**File: `docs/TYPES.md`** (create if doesn't exist)

```markdown
# Type System Documentation

## Entity Types

Entity types are defined in their respective entity folders:
- `src/entities/campaign/model/types.ts` - Campaign types
- `src/entities/user/model/types.ts` - User types
- `src/entities/kiosk/model/types.ts` - Kiosk types

## Shared Types

Shared utility types are in `src/shared/types/`:
- `utils.ts` - Common utility types
- `api.ts` - API-related types

## Type Import Guidelines

1. Import entity types from entity barrel exports:
   ```typescript
   import { Campaign } from '@/entities/campaign';
   ```

2. Import shared types from shared barrel:
   ```typescript
   import { AsyncState, ApiResponse } from '@/shared/types';
   ```

3. Never re-export types unnecessarily
```

---

## Completion Checklist

- [ ] Type re-exports removed
- [ ] Duplicate types consolidated
- [ ] Unused types deleted
- [ ] Type utilities created
- [ ] Entity exports optimized
- [ ] Type assertions minimized
- [ ] Missing types added
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Code committed and pushed
- [ ] PR created and reviewed

---

## Expected Results

**Lines Removed:**
- Type re-exports: ~50 lines
- Duplicate interfaces: ~100 lines
- Unused types: ~50 lines
- **Total: ~200 lines**

**Lines Added:**
- Type utilities: ~40 lines
- Missing types: ~20 lines
- **Total: ~60 lines**

**Net Reduction: ~140 lines**

**Quality Improvements:**
- Single source of truth for types
- Better type safety
- Clearer type organization
- Reduced type confusion

---

## Next Phase

After completing Phase 6, proceed to:
**Phase 7: Configuration Consolidation**

---

**Phase Status:** Ready to Implement  
**Last Updated:** December 4, 2025
