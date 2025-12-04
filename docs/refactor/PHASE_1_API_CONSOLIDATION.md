# Phase 1: API Layer Consolidation - Implementation Guide

**Estimated Time:** 16 hours (2 days)  
**Risk Level:** Medium  
**Expected Line Reduction:** ~420 lines

---

## Overview

This phase eliminates duplicate API logic by removing legacy `shared/api` files and migrating all data access to entity/feature APIs following FSD architecture.

---

## Pre-Implementation Checklist

- [ ] Create feature branch: `refactor/phase-1-api-consolidation`
- [ ] Create git tag: `pre-refactor-phase-1`
- [ ] Backup current codebase
- [ ] Ensure all tests pass
- [ ] Document current API usage patterns

---

## Step 1: Audit Current API Usage

### 1.1 Map All API Imports

Run this command to find all imports from shared/api:

```bash
grep -r "from.*shared/api" src/ --include="*.ts" --include="*.tsx" | wc -l
```

### 1.2 Create Migration Mapping

| Old API (shared/api) | New API (entity/feature) | Status |
|---------------------|-------------------------|--------|
| `getCampaigns()` | `campaignApi.getCampaigns()` | ✅ Exists |
| `updateCampaign()` | `campaignApi.updateCampaign()` | ✅ Exists |
| `createCampaign()` | `campaignApi.createCampaign()` | ✅ Exists |
| `deleteCampaign()` | `campaignApi.deleteCampaign()` | ✅ Exists |
| `getKiosks()` | `kioskApi.getKiosks()` | ✅ Exists |
| `updateKiosk()` | `kioskApi.updateKiosk()` | ✅ Exists |
| `fetchAllUsers()` | `userApi.getUsers()` | ✅ Exists |
| `updateUser()` | `userApi.updateUser()` | ✅ Exists |
| `createUser()` | `userApi.createUser()` | ✅ Exists |
| `deleteUser()` | `userApi.deleteUser()` | ✅ Exists |
| `submitFeedback()` | Need to create | ❌ Missing |
| `createThankYouMail()` | Need to create | ❌ Missing |

---

## Step 2: Create Missing APIs

### 2.1 Create Contact Form Feature API

```bash
mkdir -p src/features/contact-form/api
touch src/features/contact-form/api/feedbackApi.ts
touch src/features/contact-form/api/index.ts
```

**File: `src/features/contact-form/api/feedbackApi.ts`**
```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

export interface FeedbackData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  timestamp?: Date;
}

export const feedbackApi = {
  async submitFeedback(feedback: FeedbackData) {
    const feedbackRef = collection(db, 'feedback');
    const feedbackData = {
      firstName: feedback.firstName,
      lastName: feedback.lastName,
      email: feedback.email,
      message: feedback.message,
      timestamp: Timestamp.now()
    };
    
    const docRef = await addDoc(feedbackRef, feedbackData);
    return { id: docRef.id, ...feedbackData };
  }
};
```

**File: `src/features/contact-form/api/index.ts`**
```typescript
export * from './feedbackApi';
```

### 2.2 Add Thank You Email to Donation Feature

**File: `src/features/donate-to-campaign/api/emailApi.ts`**
```typescript
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

export const emailApi = {
  async sendThankYouEmail(recipientEmail: string) {
    const mailRef = collection(db, 'mail');
    const donationThankYouEmail = {
      to: [recipientEmail],
      message: {
        subject: 'Thank you for your donation!',
        text: `Dear Donor,\n\nThank you so much for your generous contribution...`,
        html: `<!DOCTYPE html>...`
      }
    };

    await addDoc(mailRef, donationThankYouEmail);
  }
};
```

Update `src/features/donate-to-campaign/api/index.ts`:
```typescript
export * from './donationApi';
export * from './emailApi';
```

---

## Step 3: Update Entity Hooks to Use Entity APIs

### 3.1 Update Campaign Hooks

**File: `src/entities/campaign/model/hooks.ts`**

**Before:**
```typescript
import { getCampaigns, updateCampaign, createCampaign } from '../../../shared/api';
```

**After:**
```typescript
import { campaignApi } from '../api';
```

**Changes:**
- Replace `getCampaigns(organizationId)` → `campaignApi.getCampaigns(organizationId)`
- Replace `updateCampaign(id, data)` → `campaignApi.updateCampaign(id, data)`
- Replace `createCampaign(data)` → `campaignApi.createCampaign(data)`
- Replace `deleteCampaign(id)` → `campaignApi.deleteCampaign(id)`

### 3.2 Update Dashboard Hook

**File: `src/shared/lib/hooks/useDashboardData.ts`**

**Before:**
```typescript
import { getKiosks, getRecentDonations, getCampaigns } from '../../api/firestoreService';
```

**After:**
```typescript
import { campaignApi } from '@/entities/campaign';
import { kioskApi } from '@/entities/kiosk';
import { donationApi } from '@/entities/donation';
```

**Changes:**
- Replace `getCampaigns(organizationId)` → `campaignApi.getCampaigns(organizationId)`
- Replace `getKiosks(organizationId)` → `kioskApi.getKiosks(organizationId)`
- Replace `getRecentDonations(10, organizationId)` → `donationApi.getRecentDonations(10, organizationId)`

---

## Step 4: Update All View Components

### 4.1 Files to Update

Run this to find all files:
```bash
grep -rl "from.*shared/api" src/views/
```

### 4.2 Update Pattern

For each file:

1. **Find old import:**
   ```typescript
   import { getCampaigns } from '../../shared/api/firestoreService';
   ```

2. **Replace with entity import:**
   ```typescript
   import { campaignApi } from '@/entities/campaign';
   ```

3. **Update function calls:**
   ```typescript
   // Before
   const campaigns = await getCampaigns(orgId);
   
   // After
   const campaigns = await campaignApi.getCampaigns(orgId);
   ```

### 4.3 Specific Files to Update

**Contact Page:**
```typescript
// src/views/home/ContactPage.tsx
// Before
import { submitFeedback } from '../../shared/api/firestoreService';

// After
import { feedbackApi } from '@/features/contact-form';

// Update call
await feedbackApi.submitFeedback(formData);
```

**Campaign List Screen:**
```typescript
// src/views/campaigns/CampaignListScreen.tsx
// Before
import { updateKiosk } from '../../shared/api';

// After
import { kioskApi } from '@/entities/kiosk';

// Update call
await kioskApi.updateKiosk(kioskId, data);
```

---

## Step 5: Update Shared Hooks

### 5.1 Update useKiosks

**File: `src/shared/lib/hooks/useKiosks.ts`**

```typescript
// Before
import { getKiosks } from '../../api/firestoreService';

// After
import { kioskApi } from '@/entities/kiosk';

// In the hook
const list = await kioskApi.getKiosks(organizationId);
```

### 5.2 Update useUsers

**File: `src/shared/lib/hooks/useUsers.ts`**

```typescript
// Before
import { fetchAllUsers, updateUser as updateUserApi, createUser as createUserApi, deleteUser as deleteUserApi } from '../../api/userApi';

// After
import { userApi } from '@/entities/user';

// Update calls
const usersData = await userApi.getUsers(organizationId);
await userApi.createUser(userData);
await userApi.deleteUser(userId);
await userApi.updateUser(userId, userData);
```

---

## Step 6: Verify and Test

### 6.1 Check for Remaining Imports

```bash
# Should return 0 results
grep -r "from.*shared/api/firestoreService" src/
grep -r "from.*shared/api/authService" src/
grep -r "from.*shared/api/userApi" src/
```

### 6.2 TypeScript Compilation

```bash
npm run build
```

Fix any TypeScript errors that appear.

### 6.3 Run Linter

```bash
npm run lint
```

### 6.4 Manual Testing Checklist

- [ ] Login/Logout works
- [ ] Admin dashboard loads
- [ ] Campaign list displays
- [ ] Create new campaign works
- [ ] Update campaign works
- [ ] Delete campaign works
- [ ] Kiosk management works
- [ ] User management works
- [ ] Donation flow works
- [ ] Contact form submission works

---

## Step 7: Delete Legacy API Files

**Only after all tests pass!**

```bash
# Delete legacy API files
rm src/shared/api/firestoreService.ts
rm src/shared/api/authService.ts
rm src/shared/api/userApi.ts
rm src/shared/api/donationsApi.ts

# Keep only the index.ts if needed for re-exports
# Or delete the entire api folder if empty
```

### 7.1 Update shared/api/index.ts

If keeping the index file for convenience:

```typescript
// src/shared/api/index.ts
// Re-export entity APIs for convenience (optional)
export { campaignApi } from '@/entities/campaign';
export { kioskApi } from '@/entities/kiosk';
export { userApi } from '@/entities/user';
export { donationApi } from '@/entities/donation';
export { organizationApi } from '@/entities/organization';
```

Or delete it entirely and update all imports.

---

## Step 8: Final Verification

### 8.1 Code Metrics

```bash
# Count lines before
git show pre-refactor-phase-1:src/shared/api/firestoreService.ts | wc -l
git show pre-refactor-phase-1:src/shared/api/authService.ts | wc -l
git show pre-refactor-phase-1:src/shared/api/userApi.ts | wc -l

# Verify files deleted
ls src/shared/api/
```

### 8.2 Run Full Test Suite

```bash
npm run test:run
```

### 8.3 Build Production Bundle

```bash
npm run build
npm run start
```

Test the production build manually.

---

## Rollback Procedure

If issues arise:

```bash
# Rollback to pre-refactor state
git reset --hard pre-refactor-phase-1

# Or revert specific commits
git revert <commit-hash>
```

---

## Completion Checklist

- [ ] All imports updated
- [ ] Legacy API files deleted
- [ ] TypeScript compiles without errors
- [ ] Linter passes
- [ ] All manual tests pass
- [ ] Production build works
- [ ] Code committed and pushed
- [ ] PR created and reviewed
- [ ] Documentation updated

---

## Expected Results

**Lines Removed:**
- `firestoreService.ts`: ~300 lines
- `authService.ts`: ~20 lines
- `userApi.ts`: ~100 lines
- **Total: ~420 lines**

**Lines Added:**
- `feedbackApi.ts`: ~30 lines
- `emailApi.ts`: ~20 lines
- **Total: ~50 lines**

**Net Reduction: ~370 lines**

---

## Next Phase

After completing Phase 1, proceed to:
**Phase 2: Generic Hook Abstraction**

---

**Phase Status:** Ready to Implement  
**Last Updated:** December 4, 2025
