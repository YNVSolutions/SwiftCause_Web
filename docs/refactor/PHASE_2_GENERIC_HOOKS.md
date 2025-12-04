# Phase 2: Generic Hook Abstraction - Implementation Guide

**Estimated Time:** 12 hours (1.5 days)  
**Risk Level:** Low  
**Expected Line Reduction:** ~300 lines

---

## Overview

This phase creates reusable generic hooks to eliminate boilerplate code in data fetching and mutation operations across the codebase.

---

## Pre-Implementation Checklist

- [ ] Phase 1 completed and tested
- [ ] Create feature branch: `refactor/phase-2-generic-hooks`
- [ ] Create git tag: `pre-refactor-phase-2`
- [ ] Document current hook patterns

---

## Step 1: Create Generic Data Fetching Hook

### 1.1 Create useAsyncData Hook

**File: `src/shared/lib/hooks/useAsyncData.ts`**

```typescript
import { useState, useEffect, useCallback } from 'react';

export interface UseAsyncDataOptions {
  errorMessage?: string;
  enabled?: boolean;
}

export interface UseAsyncDataReturn<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
  refresh: () => Promise<void>;
}

export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = [],
  options: UseAsyncDataOptions = {}
): UseAsyncDataReturn<T> {
  const { errorMessage = 'Failed to load data', enabled = true } = options;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      console.error('useAsyncData error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [...deps, enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, error, data, refresh };
}
```

### 1.2 Create useAsyncMutation Hook

**File: `src/shared/lib/hooks/useAsyncMutation.ts`**

```typescript
import { useState, useCallback } from 'react';

export interface UseAsyncMutationOptions {
  onSuccess?: () => void | Promise<void>;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export interface UseAsyncMutationReturn<TArgs extends any[], TResult> {
  loading: boolean;
  error: string | null;
  execute: (...args: TArgs) => Promise<TResult | null>;
  reset: () => void;
}

export function useAsyncMutation<TArgs extends any[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>,
  options: UseAsyncMutationOptions = {}
): UseAsyncMutationReturn<TArgs, TResult> {
  const { onSuccess, onError, errorMessage = 'Operation failed' } = options;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: TArgs): Promise<TResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutationFn(...args);
      await onSuccess?.();
      return result;
    } catch (err) {
      console.error('useAsyncMutation error:', err);
      setError(errorMessage);
      onError?.(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, onSuccess, onError, errorMessage]);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return { loading, error, execute, reset };
}
```

### 1.3 Update Barrel Export

**File: `src/shared/lib/hooks/index.ts`**

```typescript
export * from './useAsyncData';
export * from './useAsyncMutation';
export * from './useDashboardData';
export * from './useKiosks';
export * from './useUsers';
```

---

## Step 2: Refactor Campaign Hooks

### 2.1 Update useCampaigns

**File: `src/entities/campaign/model/hooks.ts`**

**Before (~50 lines):**
```typescript
export function useCampaigns(organizationId?: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await campaignApi.getCampaigns(organizationId);
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

**After (~10 lines):**
```typescript
import { useAsyncData } from '@/shared/lib/hooks';

export function useCampaigns(organizationId?: string) {
  const { data, ...rest } = useAsyncData(
    () => campaignApi.getCampaigns(organizationId),
    [organizationId],
    { errorMessage: 'Failed to load campaigns. Please try again.' }
  );
  
  return { campaigns: data || [], ...rest };
}
```

### 2.2 Add Campaign Mutation Hooks

**Add to `src/entities/campaign/model/hooks.ts`:**

```typescript
import { useAsyncMutation } from '@/shared/lib/hooks';

export function useCreateCampaign(onSuccess?: () => void) {
  return useAsyncMutation(
    (data: Partial<Campaign>) => campaignApi.createCampaign(data),
    {
      onSuccess,
      errorMessage: 'Failed to create campaign'
    }
  );
}

export function useUpdateCampaign(onSuccess?: () => void) {
  return useAsyncMutation(
    (id: string, data: Partial<Campaign>) => campaignApi.updateCampaign(id, data),
    {
      onSuccess,
      errorMessage: 'Failed to update campaign'
    }
  );
}

export function useDeleteCampaign(onSuccess?: () => void) {
  return useAsyncMutation(
    (id: string) => campaignApi.deleteCampaign(id),
    {
      onSuccess,
      errorMessage: 'Failed to delete campaign'
    }
  );
}
```

---

## Step 3: Refactor Kiosk Hooks

### 3.1 Update useKiosks

**File: `src/shared/lib/hooks/useKiosks.ts`**

**Before (~30 lines):**
```typescript
export function useKiosks(organizationId?: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await kioskApi.getKiosks(organizationId);
      setKiosks(list);
    } catch {
      setError('Failed to load kiosks');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, error, kiosks, refresh };
}
```

**After (~8 lines):**
```typescript
import { useAsyncData } from './useAsyncData';
import { kioskApi } from '@/entities/kiosk';

export function useKiosks(organizationId?: string) {
  const { data, ...rest } = useAsyncData(
    () => kioskApi.getKiosks(organizationId),
    [organizationId],
    { errorMessage: 'Failed to load kiosks' }
  );
  
  return { kiosks: data || [], ...rest };
}
```

---

## Step 4: Refactor User Hooks

### 4.1 Update useUsers

**File: `src/shared/lib/hooks/useUsers.ts`**

**Before (~80 lines):**
```typescript
export function useUsers(organizationId?: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const usersData = await userApi.getUsers(organizationId);
      setUsers(usersData);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const createUser = async (userData: Partial<User>) => {
    try {
      await userApi.createUser(userData);
      await refresh();
    } catch {
      throw new Error('Failed to create user');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await userApi.deleteUser(userId);
      await refresh();
    } catch {
      throw new Error('Failed to delete user');
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      await userApi.updateUser(userId, userData);
      await refresh();
    } catch {
      throw new Error('Failed to update user');
    }
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, error, users, refresh, createUser, deleteUser, updateUser };
}
```

**After (~15 lines):**
```typescript
import { useAsyncData } from './useAsyncData';
import { userApi } from '@/entities/user';

export function useUsers(organizationId?: string) {
  const { data, refresh, ...rest } = useAsyncData(
    () => userApi.getUsers(organizationId),
    [organizationId],
    { errorMessage: 'Failed to load users' }
  );

  return { 
    users: data || [], 
    refresh,
    ...rest 
  };
}

// Separate mutation hooks
export function useCreateUser(onSuccess?: () => void) {
  return useAsyncMutation(
    (userData: Partial<User>) => userApi.createUser(userData),
    { onSuccess, errorMessage: 'Failed to create user' }
  );
}

export function useUpdateUser(onSuccess?: () => void) {
  return useAsyncMutation(
    (userId: string, userData: Partial<User>) => userApi.updateUser(userId, userData),
    { onSuccess, errorMessage: 'Failed to update user' }
  );
}

export function useDeleteUser(onSuccess?: () => void) {
  return useAsyncMutation(
    (userId: string) => userApi.deleteUser(userId),
    { onSuccess, errorMessage: 'Failed to delete user' }
  );
}
```

---

## Step 5: Refactor Organization Hook

### 5.1 Update useOrganization

**File: `src/entities/organization/model/hooks.ts`**

**Before (~40 lines):**
```typescript
export function useOrganization(organizationId?: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  const refresh = useCallback(async () => {
    if (!organizationId) return;
    
    setLoading(true);
    setError(null);
    try {
      const org = await organizationApi.getOrganization(organizationId);
      setOrganization(org);
    } catch {
      setError('Failed to load organization');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, error, organization, refresh };
}
```

**After (~10 lines):**
```typescript
import { useAsyncData } from '@/shared/lib/hooks';

export function useOrganization(organizationId?: string) {
  const { data, ...rest } = useAsyncData(
    () => organizationApi.getOrganization(organizationId!),
    [organizationId],
    { 
      errorMessage: 'Failed to load organization',
      enabled: !!organizationId 
    }
  );
  
  return { organization: data, ...rest };
}
```

---

## Step 6: Update Component Usage

### 6.1 Update Components Using Mutation Hooks

**Example: CampaignManagement.tsx**

**Before:**
```typescript
const handleCreateCampaign = async (data: Partial<Campaign>) => {
  setLoading(true);
  try {
    await campaignApi.createCampaign(data);
    await refresh();
    setDialogOpen(false);
  } catch (error) {
    setError('Failed to create campaign');
  } finally {
    setLoading(false);
  }
};
```

**After:**
```typescript
const { execute: createCampaign, loading: creating } = useCreateCampaign(() => {
  refresh();
  setDialogOpen(false);
});

const handleCreateCampaign = async (data: Partial<Campaign>) => {
  await createCampaign(data);
};
```

---

## Step 7: Verify and Test

### 7.1 TypeScript Compilation

```bash
npm run build
```

### 7.2 Run Linter

```bash
npm run lint
```

### 7.3 Manual Testing Checklist

- [ ] Campaign list loads correctly
- [ ] Create campaign works
- [ ] Update campaign works
- [ ] Delete campaign works
- [ ] Kiosk list loads correctly
- [ ] User management works
- [ ] Organization data loads
- [ ] Error states display correctly
- [ ] Loading states work properly
- [ ] Refresh functionality works

---

## Step 8: Final Verification

### 8.1 Code Metrics

```bash
# Count lines saved
wc -l src/shared/lib/hooks/useAsyncData.ts
wc -l src/shared/lib/hooks/useAsyncMutation.ts
wc -l src/entities/campaign/model/hooks.ts
wc -l src/shared/lib/hooks/useKiosks.ts
wc -l src/shared/lib/hooks/useUsers.ts
```

---

## Completion Checklist

- [ ] Generic hooks created
- [ ] All entity hooks refactored
- [ ] Components updated to use new hooks
- [ ] TypeScript compiles without errors
- [ ] Linter passes
- [ ] All manual tests pass
- [ ] Code committed and pushed
- [ ] PR created and reviewed

---

## Expected Results

**Lines Added:**
- `useAsyncData.ts`: ~40 lines
- `useAsyncMutation.ts`: ~40 lines
- **Total: ~80 lines**

**Lines Removed:**
- Hook boilerplate: ~380 lines
- **Net Reduction: ~300 lines**

---

## Next Phase

After completing Phase 2, proceed to:
**Phase 3: Utility Consolidation**

---

**Phase Status:** Ready to Implement  
**Last Updated:** December 4, 2025
