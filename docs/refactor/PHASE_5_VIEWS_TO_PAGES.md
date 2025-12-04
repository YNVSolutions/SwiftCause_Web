# Phase 5: Views → Pages Migration - Implementation Guide

**Estimated Time:** 4 hours (0.5 days)  
**Risk Level:** Low  
**Expected Line Reduction:** 0 lines (structural improvement)

---

## Overview

This phase renames the `views` directory to `pages` to align with FSD (Feature-Sliced Design) architecture standards.

---

## Pre-Implementation Checklist

- [ ] Phase 4 completed and tested
- [ ] Create feature branch: `refactor/phase-5-views-to-pages`
- [ ] Create git tag: `pre-refactor-phase-5`
- [ ] Ensure all tests pass

---

## Step 1: Rename Directory

### 1.1 Rename views to pages

```bash
git mv src/views src/pages
```

---

## Step 2: Update All Imports

### 2.1 Find All Import Statements

```bash
grep -r "from.*views" src/ --include="*.ts" --include="*.tsx" | wc -l
```

### 2.2 Update Import Pattern

**Before:**
```typescript
import HomePage from '@/views/home/HomePage';
import AdminDashboard from '@/views/admin/AdminDashboard';
```

**After:**
```typescript
import HomePage from '@/pages/home/HomePage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
```

### 2.3 Automated Find and Replace

Use your IDE's find and replace feature:

**Find:** `from '@/views/`  
**Replace:** `from '@/pages/`

**Find:** `from '../../views/`  
**Replace:** `from '../../pages/`

**Find:** `from '../views/`  
**Replace:** `from '../pages/`

---

## Step 3: Update TypeScript Path Aliases

### 3.1 Update tsconfig.json

**File: `tsconfig.json`**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/widgets/*": ["./src/widgets/*"],
      "@/features/*": ["./src/features/*"],
      "@/entities/*": ["./src/entities/*"],
      "@/shared/*": ["./src/shared/*"]
    }
  }
}
```

---

## Step 4: Update ESLint Configuration

### 4.1 Update eslint.config.js

**File: `eslint.config.js`**

The config already has rules for `pages`, so verify they're active:

```javascript
{
  files: ['src/pages/**/*.{ts,tsx}'],
  rules: {
    // Pages can import from widgets, features, entities, shared
    'import/no-restricted-paths': ['error', {
      zones: [
        {
          target: './src/pages',
          from: './src/app',
          message: 'Pages should not import from app layer'
        }
      ]
    }]
  }
}
```

Remove any old `views` references if they exist.

---

## Step 5: Update Next.js App Router (if applicable)

### 5.1 Update app directory imports

Check files in `app/` directory that might import from views:

```bash
grep -r "views" app/ --include="*.tsx" --include="*.ts"
```

Update any found imports to use `pages` instead.

---

## Step 6: Update Documentation

### 6.1 Update README.md

**File: `README.md`**

Update any references to the `views` directory:

**Before:**
```markdown
- `src/views/` - Page components
```

**After:**
```markdown
- `src/pages/` - Page components
```

### 6.2 Update Architecture Documentation

Update any architecture docs that reference the views layer:

```bash
grep -r "views" docs/ --include="*.md"
```

Replace with `pages` where appropriate.

---

## Step 7: Verify and Test

### 7.1 Check for Remaining References

```bash
# Should return 0 results (except in this guide!)
grep -r "from.*views" src/ --include="*.ts" --include="*.tsx"
grep -r "@/views" src/ --include="*.ts" --include="*.tsx"
```

### 7.2 TypeScript Compilation

```bash
npm run build
```

Fix any TypeScript errors related to import paths.

### 7.3 Run Linter

```bash
npm run lint
```

### 7.4 Run Tests

```bash
npm run test:run
```

### 7.5 Manual Testing Checklist

- [ ] Home page loads
- [ ] Admin dashboard loads
- [ ] Campaign pages work
- [ ] All navigation works
- [ ] No console errors
- [ ] All routes resolve correctly

---

## Step 8: Update Git History (Optional)

### 8.1 Preserve Git History

Git should automatically track the rename, but verify:

```bash
git log --follow src/pages/admin/AdminDashboard.tsx
```

This should show the history from when it was in `views/`.

---

## Completion Checklist

- [ ] Directory renamed from views to pages
- [ ] All imports updated
- [ ] TypeScript paths updated
- [ ] ESLint config updated
- [ ] Documentation updated
- [ ] TypeScript compiles without errors
- [ ] Linter passes
- [ ] All tests pass
- [ ] Manual testing complete
- [ ] Code committed and pushed
- [ ] PR created and reviewed

---

## Expected Results

**Structural Changes:**
- `src/views/` → `src/pages/`
- All imports updated
- Better FSD compliance
- No functional changes

**Line Count:**
- No net reduction (structural change only)
- Improved code organization
- Better alignment with FSD standards

---

## Rollback Procedure

If issues arise:

```bash
# Rollback to pre-refactor state
git reset --hard pre-refactor-phase-5

# Or manually rename back
git mv src/pages src/views
# Then revert import changes
```

---

## Next Phase

After completing Phase 5, proceed to:
**Phase 6: Type System Optimization**

---

**Phase Status:** Ready to Implement  
**Last Updated:** December 4, 2025
