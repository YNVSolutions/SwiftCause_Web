# Phase 8: Remove Dead Code - Implementation Guide

**Estimated Time:** 8 hours (1 day)  
**Risk Level:** Low  
**Expected Line Reduction:** ~1,000 lines

---

## Overview

This phase identifies and removes unused code including commented-out code, unused imports, unused exports, and legacy files.

---

## Pre-Implementation Checklist

- [ ] Phase 7 completed and tested
- [ ] Create feature branch: `refactor/phase-8-dead-code`
- [ ] Create git tag: `pre-refactor-phase-8`
- [ ] Backup codebase

---

## Step 1: Remove Unused Imports

### 1.1 Use ESLint to Find Unused Imports

```bash
npm run lint -- --fix
```

This will automatically remove unused imports if configured.

### 1.2 Manual Check

```bash
# Find files with potential unused imports
grep -r "^import.*from" src/ --include="*.ts" --include="*.tsx" | wc -l
```

### 1.3 Use TypeScript Compiler

```bash
npx tsc --noUnusedLocals --noUnusedParameters --noEmit
```

This will show warnings for unused variables and imports.

---

## Step 2: Find and Remove Unused Exports

### 2.1 Use ts-prune

Install and run ts-prune to find unused exports:

```bash
npx ts-prune
```

This will list all exports that are never imported.

### 2.2 Review and Remove

For each unused export:

1. Verify it's truly unused
2. Check if it's part of public API
3. Remove if confirmed unused

**Example:**

```typescript
// Before
export const unusedFunction = () => { /* ... */ };
export const usedFunction = () => { /* ... */ };

// After (remove unused)
export const usedFunction = () => { /* ... */ };
```

---

## Step 3: Remove Commented-Out Code

### 3.1 Find Commented Code

```bash
# Find files with commented code blocks
grep -r "^[[:space:]]*//.*" src/ --include="*.ts" --include="*.tsx" | wc -l
```

### 3.2 Manual Review and Removal

Review each file and remove:
- Old commented-out implementations
- Debugging comments
- TODO comments that are no longer relevant

**Keep:**
- Documentation comments
- Important explanatory comments
- Active TODO items

**Example:**

```typescript
// Before
export function processData(data: any) {
  // Old implementation
  // const result = data.map(item => {
  //   return item.value * 2;
  // });
  
  // New implementation
  return data.map(item => item.value * 2);
}

// After
export function processData(data: any) {
  return data.map(item => item.value * 2);
}
```

---

## Step 4: Remove Legacy API Folder

### 4.1 Check for Legacy Folder

```bash
ls -la src/shared/api/legacy/
```

### 4.2 Verify No Imports

```bash
grep -r "from.*api/legacy" src/
```

### 4.3 Delete if Unused

```bash
rm -rf src/shared/api/legacy/
```

---

## Step 5: Remove Unused Components

### 5.1 Find Component Files

```bash
find src/ -name "*.tsx" -type f
```

### 5.2 Check Component Usage

For each component, check if it's imported:

```bash
# Example: Check if OldButton is used
grep -r "OldButton" src/ --include="*.ts" --include="*.tsx"
```

### 5.3 Remove Unused Components

Delete component files that are never imported.

**Common candidates:**
- Old/deprecated UI components
- Prototype components
- Duplicate components

---

## Step 6: Remove Unused Hooks

### 6.1 List All Custom Hooks

```bash
find src/ -name "use*.ts" -o -name "use*.tsx"
```

### 6.2 Check Hook Usage

For each hook:

```bash
# Example: Check if useOldData is used
grep -r "useOldData" src/ --include="*.ts" --include="*.tsx"
```

### 6.3 Remove Unused Hooks

Delete hooks that are never imported or used.

---

## Step 7: Remove Unused Utility Functions

### 7.1 Audit Utility Files

```bash
ls -la src/shared/lib/
```

### 7.2 Check Each Utility

For each utility function, verify usage:

```bash
# Example
grep -r "oldUtilityFunction" src/
```

### 7.3 Remove Unused Utilities

Delete utility functions that are never called.

---

## Step 8: Clean Up Test Files

### 8.1 Find Test Files

```bash
find src/ -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts"
```

### 8.2 Remove Tests for Deleted Code

If you deleted components/functions, remove their test files too.

### 8.3 Remove Skipped Tests

Find and remove tests that are permanently skipped:

```bash
grep -r "test.skip\|it.skip\|describe.skip" src/
```

---

## Step 9: Remove Unused Assets

### 9.1 Check Public Folder

```bash
ls -la public/
```

### 9.2 Find Unused Images

For each image, check if it's referenced:

```bash
# Example
grep -r "old-logo.png" src/ app/ public/
```

### 9.3 Remove Unused Assets

Delete images, fonts, or other assets that are never referenced.

---

## Step 10: Clean Up Package Dependencies

### 10.1 Find Unused Dependencies

```bash
npx depcheck
```

This will list:
- Unused dependencies
- Missing dependencies
- Unused devDependencies

### 10.2 Remove Unused Packages

```bash
npm uninstall <unused-package>
```

**Be careful with:**
- Peer dependencies
- Type definition packages
- Build tool dependencies

---

## Step 11: Remove Console Logs and Debugger Statements

### 11.1 Find Console Logs

```bash
grep -r "console.log\|console.debug\|console.warn" src/ --include="*.ts" --include="*.tsx"
```

### 11.2 Remove Debug Code

Remove or replace with proper logging:

**Before:**
```typescript
console.log('Debug:', data);
debugger;
```

**After:**
```typescript
// Remove or use proper logger
logger.debug('Processing data', { data });
```

### 11.3 Keep Intentional Logs

Keep:
- Error logging (`console.error`)
- Production logging
- Important warnings

---

## Step 12: Clean Up Empty Files

### 12.1 Find Empty or Near-Empty Files

```bash
find src/ -type f -size -10c
```

### 12.2 Review and Delete

Delete files that are:
- Completely empty
- Only contain imports
- Only contain comments

---

## Step 13: Remove Duplicate Code

### 13.1 Use jscpd to Find Duplicates

```bash
npx jscpd src/
```

### 13.2 Refactor Duplicates

For each duplicate found:
1. Extract to shared function/component
2. Replace all instances
3. Delete duplicate code

---

## Step 14: Final Cleanup

### 14.1 Remove Empty Directories

```bash
find src/ -type d -empty -delete
```

### 14.2 Clean Up Barrel Exports

Remove exports for deleted files from index.ts files:

```bash
# Find all index.ts files
find src/ -name "index.ts"
```

Review each and remove exports for deleted files.

---

## Step 15: Verify and Test

### 15.1 TypeScript Compilation

```bash
npm run build
```

### 15.2 Run Linter

```bash
npm run lint
```

### 15.3 Run Tests

```bash
npm run test:run
```

### 15.4 Check Bundle Size

```bash
npm run build
# Check .next/analyze or build output for size
```

### 15.5 Manual Testing

- [ ] Application starts
- [ ] All pages load
- [ ] All features work
- [ ] No console errors
- [ ] No missing imports

---

## Step 16: Document Removed Code

### 16.1 Create Removal Log

**File: `docs/refactor/REMOVED_CODE_LOG.md`**

```markdown
# Removed Code Log - Phase 8

## Removed Files
- `src/shared/api/legacy/` - Legacy API implementations
- `src/components/OldButton.tsx` - Replaced by new Button component
- `src/hooks/useOldData.ts` - Replaced by useAsyncData

## Removed Functions
- `oldUtilityFunction()` - No longer needed
- `deprecatedHelper()` - Functionality moved to new helper

## Removed Dependencies
- `old-package` - No longer used
- `deprecated-lib` - Replaced by modern-lib

## Total Lines Removed
- ~1,000 lines of dead code
```

---

## Completion Checklist

- [ ] Unused imports removed
- [ ] Unused exports removed
- [ ] Commented code removed
- [ ] Legacy folders deleted
- [ ] Unused components removed
- [ ] Unused hooks removed
- [ ] Unused utilities removed
- [ ] Unused assets removed
- [ ] Unused dependencies removed
- [ ] Console logs cleaned
- [ ] Empty files removed
- [ ] Duplicate code refactored
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Bundle size reduced
- [ ] Documentation updated
- [ ] Code committed and pushed
- [ ] PR created and reviewed

---

## Expected Results

**Categories of Removed Code:**
- Unused imports: ~100 lines
- Unused exports: ~150 lines
- Commented code: ~200 lines
- Legacy API: ~200 lines
- Unused components: ~150 lines
- Unused hooks: ~100 lines
- Unused utilities: ~100 lines
- **Total: ~1,000 lines**

**Quality Improvements:**
- Cleaner codebase
- Smaller bundle size
- Faster build times
- Better maintainability
- Reduced confusion
- Improved code navigation

**Bundle Size Impact:**
- Expected reduction: 15-20%
- Faster page loads
- Better tree-shaking

---

## Rollback Procedure

If issues arise:

```bash
# Rollback to pre-refactor state
git reset --hard pre-refactor-phase-8

# Or revert specific commits
git revert <commit-hash>
```

---

## Final Phase Complete

After completing Phase 8, all refactoring phases are complete!

Proceed to:
**Final Verification and Documentation**

---

**Phase Status:** Ready to Implement  
**Last Updated:** December 4, 2025
