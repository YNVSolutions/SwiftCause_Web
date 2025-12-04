# Phase 7: Configuration Consolidation - Implementation Guide

**Estimated Time:** 4 hours (0.5 days)  
**Risk Level:** Low  
**Expected Line Reduction:** ~100 lines

---

## Overview

This phase consolidates configuration files and removes unused constants to simplify the configuration layer.

---

## Pre-Implementation Checklist

- [ ] Phase 6 completed and tested
- [ ] Create feature branch: `refactor/phase-7-configuration`
- [ ] Create git tag: `pre-refactor-phase-7`
- [ ] Audit all config files

---

## Step 1: Audit Configuration Files

### 1.1 List All Config Files

```bash
ls -la src/shared/config/
```

Expected files:
- `campaign.ts`
- `constants.ts`
- `env.ts`
- `ui.ts`
- `user.ts`

### 1.2 Check Usage of Each Config

```bash
# For each config file, check where it's imported
grep -r "from.*config/campaign" src/
grep -r "from.*config/constants" src/
grep -r "from.*config/env" src/
grep -r "from.*config/ui" src/
grep -r "from.*config/user" src/
```

---

## Step 2: Consolidate Related Configurations

### 2.1 Evaluate Campaign Config

**File: `src/shared/config/campaign.ts`**

Check if this contains constants that could be merged elsewhere.

**Example content:**
```typescript
export const CAMPAIGN_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
} as const;

export const DEFAULT_CAMPAIGN_GOAL = 10000;
```

**Decision:** If these are entity-specific, move to entity config.

### 2.2 Evaluate User Config

**File: `src/shared/config/user.ts`**

**Example content:**
```typescript
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  VIEWER: 'viewer',
} as const;
```

**Decision:** Move to entity if entity-specific, or merge into constants.

### 2.3 Create Consolidated Constants File

**File: `src/shared/config/constants.ts`**

```typescript
// Application Constants
export const APP_NAME = 'SwiftCause';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_TIMEOUT = 30000; // 30 seconds
export const MAX_RETRY_ATTEMPTS = 3;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Campaign Constants
export const CAMPAIGN_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  DRAFT: 'draft',
} as const;

export const DEFAULT_CAMPAIGN_GOAL = 10000;
export const MIN_CAMPAIGN_GOAL = 100;
export const MAX_CAMPAIGN_GOAL = 1000000;

// User Constants
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  VIEWER: 'viewer',
} as const;

// Donation Constants
export const DONATION_AMOUNTS = [10, 25, 50, 100, 250, 500];
export const MIN_DONATION_AMOUNT = 1;
export const MAX_DONATION_AMOUNT = 100000;

// Kiosk Constants
export const KIOSK_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  MAINTENANCE: 'maintenance',
} as const;

// Type exports
export type CampaignStatus = typeof CAMPAIGN_STATUS[keyof typeof CAMPAIGN_STATUS];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type KioskStatus = typeof KIOSK_STATUS[keyof typeof KIOSK_STATUS];
```

---

## Step 3: Consolidate UI Configuration

### 3.1 Review UI Config

**File: `src/shared/config/ui.ts`**

**Example content:**
```typescript
export const THEME_COLORS = {
  primary: '#3b82f6',
  secondary: '#64748b',
  success: '#22c55e',
  error: '#ef4444',
};

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};
```

**Decision:** Keep if actively used, otherwise move to Tailwind config.

### 3.2 Check Tailwind Config

**File: `tailwind.config.js`**

If UI constants duplicate Tailwind config, remove them and use Tailwind directly.

---

## Step 4: Optimize Environment Configuration

### 4.1 Review Environment Config

**File: `src/shared/config/env.ts`**

```typescript
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
  firebaseConfig: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    // ... other firebase config
  },
  stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
```

**Keep this file** - it's essential for environment variable management.

### 4.2 Add Type Safety

```typescript
interface Env {
  apiUrl: string;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  stripePublicKey: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

const getEnv = (): Env => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ];

  // Validate required env vars in production
  if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.forEach((varName) => {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    });
  }

  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
    firebaseConfig: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    },
    stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  };
};

export const env = getEnv();
```

---

## Step 5: Remove Unused Constants

### 5.1 Find Unused Exports

For each constant, check if it's used:

```bash
# Example: Check if CAMPAIGN_STATUS is used
grep -r "CAMPAIGN_STATUS" src/ --include="*.ts" --include="*.tsx" | grep -v "export const CAMPAIGN_STATUS"
```

### 5.2 Remove Unused Constants

Delete constants that are defined but never imported/used.

---

## Step 6: Update Imports Throughout Codebase

### 6.1 Update Campaign Config Imports

**Before:**
```typescript
import { CAMPAIGN_STATUS } from '@/shared/config/campaign';
```

**After:**
```typescript
import { CAMPAIGN_STATUS } from '@/shared/config/constants';
```

### 6.2 Update User Config Imports

**Before:**
```typescript
import { USER_ROLES } from '@/shared/config/user';
```

**After:**
```typescript
import { USER_ROLES } from '@/shared/config/constants';
```

### 6.3 Automated Find and Replace

Use IDE find and replace:

**Find:** `from '@/shared/config/campaign'`  
**Replace:** `from '@/shared/config/constants'`

**Find:** `from '@/shared/config/user'`  
**Replace:** `from '@/shared/config/constants'`

---

## Step 7: Delete Redundant Config Files

### 7.1 Delete Merged Files

```bash
# Only delete after confirming all imports are updated
rm src/shared/config/campaign.ts
rm src/shared/config/user.ts
```

### 7.2 Update Config Barrel Export

**File: `src/shared/config/index.ts`**

```typescript
export * from './constants';
export * from './env';
// Remove exports for deleted files
```

---

## Step 8: Create Config Documentation

### 8.1 Document Configuration Structure

**File: `docs/CONFIGURATION.md`**

```markdown
# Configuration Guide

## Environment Variables

All environment variables are managed in `src/shared/config/env.ts`.

Required variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`

## Application Constants

Application-wide constants are in `src/shared/config/constants.ts`.

### Usage

```typescript
import { CAMPAIGN_STATUS, USER_ROLES } from '@/shared/config';

const status = CAMPAIGN_STATUS.ACTIVE;
const role = USER_ROLES.ADMIN;
```

## Adding New Constants

1. Add to appropriate section in `constants.ts`
2. Export type if needed
3. Document in this file
```

---

## Step 9: Verify and Test

### 9.1 Check for Broken Imports

```bash
# Should return 0 results
grep -r "from.*config/campaign" src/
grep -r "from.*config/user" src/
```

### 9.2 TypeScript Compilation

```bash
npm run build
```

### 9.3 Run Linter

```bash
npm run lint
```

### 9.4 Run Tests

```bash
npm run test:run
```

### 9.5 Manual Testing

- [ ] Application starts without errors
- [ ] Environment variables load correctly
- [ ] Constants are accessible
- [ ] No console errors

---

## Completion Checklist

- [ ] Configuration files consolidated
- [ ] Unused constants removed
- [ ] All imports updated
- [ ] Redundant files deleted
- [ ] Environment config optimized
- [ ] Documentation created
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Code committed and pushed
- [ ] PR created and reviewed

---

## Expected Results

**Files Before:**
- `campaign.ts` (~30 lines)
- `user.ts` (~20 lines)
- `ui.ts` (~30 lines) - if removed
- `constants.ts` (~50 lines)

**Files After:**
- `constants.ts` (~100 lines)
- `env.ts` (~50 lines)

**Lines Removed:**
- Duplicate constants: ~50 lines
- Unused constants: ~30 lines
- Redundant files: ~20 lines
- **Total: ~100 lines**

**Quality Improvements:**
- Single source for constants
- Better organization
- Type-safe environment config
- Clearer configuration structure

---

## Next Phase

After completing Phase 7, proceed to:
**Phase 8: Remove Dead Code**

---

**Phase Status:** Ready to Implement  
**Last Updated:** December 4, 2025
