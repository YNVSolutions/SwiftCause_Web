# Phase 3: Utility Consolidation - Implementation Guide

**Estimated Time:** 8 hours (1 day)  
**Risk Level:** Low  
**Expected Line Reduction:** ~120 lines

---

## Overview

This phase centralizes utility functions (currency formatting, date/time handling) to eliminate duplicate implementations across the codebase.

---

## Pre-Implementation Checklist

- [ ] Phase 2 completed and tested
- [ ] Create feature branch: `refactor/phase-3-utility-consolidation`
- [ ] Create git tag: `pre-refactor-phase-3`
- [ ] Audit all utility function usage

---

## Step 1: Enhance Currency Formatter

### 1.1 Update Currency Formatter

**File: `src/shared/lib/currencyFormatter.ts`**

```typescript
export interface CurrencyFormatOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  compact?: boolean;
  locale?: string;
}

export const formatCurrency = (
  amount: number,
  currency = 'USD',
  options: CurrencyFormatOptions = {}
): string => {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    compact = false,
    locale = 'en-US'
  } = options;

  if (compact) {
    return formatCompactCurrency(amount, currency, locale);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
};

export const formatCompactCurrency = (
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string => {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  let value: number;
  let suffix: string;

  if (absAmount >= 1_000_000_000) {
    value = absAmount / 1_000_000_000;
    suffix = 'B';
  } else if (absAmount >= 1_000_000) {
    value = absAmount / 1_000_000;
    suffix = 'M';
  } else if (absAmount >= 1_000) {
    value = absAmount / 1_000;
    suffix = 'K';
  } else {
    return formatCurrency(amount, currency, { locale });
  }

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);

  return `${sign}${formatted}${suffix}`;
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};
```

---

## Step 2: Remove Inline Currency Formatters

### 2.1 Update AdminDashboard

**File: `src/views/admin/AdminDashboard.tsx`**

**Remove these inline functions (~40 lines):**
```typescript
const formatLargeCurrency = (amount: number) => {
  // ... implementation
};

const formatShortCurrency = (amount: number) => {
  // ... implementation
};

const formatPercentage = (value: number) => {
  // ... implementation
};
```

**Add import:**
```typescript
import { formatCurrency, formatCompactCurrency, formatPercentage } from '@/shared/lib/currencyFormatter';
```

**Replace usage:**
```typescript
// Before
{formatLargeCurrency(totalDonations)}

// After
{formatCompactCurrency(totalDonations)}
```

### 2.2 Update KioskManagement

**File: `src/views/admin/KioskManagement.tsx`**

**Remove inline formatter (~5 lines):**
```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
```

**Add import:**
```typescript
import { formatCurrency } from '@/shared/lib/currencyFormatter';
```

### 2.3 Update DonationManagement

**File: `src/views/admin/DonationManagement.tsx`**

**Remove inline formatter (~10 lines):**
```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};
```

**Add import:**
```typescript
import { formatCurrency } from '@/shared/lib/currencyFormatter';
```

### 2.4 Update DonationSelectionScreen

**File: `src/views/campaigns/DonationSelectionScreen.tsx`**

**Remove inline formatter (~5 lines):**
```typescript
const formatCurrency = (amount: number) => {
  return `$${amount.toFixed(2)}`;
};
```

**Add import:**
```typescript
import { formatCurrency } from '@/shared/lib/currencyFormatter';
```

### 2.5 Update KioskCampaignAssignmentDialog

**File: `src/shared/ui/components/KioskCampaignAssignmentDialog.tsx`**

**Remove inline formatter (~5 lines):**
```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
```

**Add import:**
```typescript
import { formatCurrency } from '@/shared/lib/currencyFormatter';
```

---

## Step 3: Create Date/Time Utilities

### 3.1 Create Date Formatter

**File: `src/shared/lib/dateFormatter.ts`**

```typescript
export type TimeBucket = 'hour' | 'day' | 'week' | 'month';

export interface TimeBucketResult {
  bucket: TimeBucket;
  label: string;
  startDate: Date;
  endDate: Date;
}

export const getTimeBucket = (
  startDate: Date,
  endDate: Date
): TimeBucket => {
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays <= 1) return 'hour';
  if (diffDays <= 7) return 'day';
  if (diffDays <= 31) return 'week';
  return 'month';
};

export const formatDate = (
  date: Date,
  format: 'short' | 'medium' | 'long' = 'medium'
): string => {
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
  }[format];

  return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(date, 'short');
};

export const getBucketLabel = (
  date: Date,
  bucket: TimeBucket
): string => {
  switch (bucket) {
    case 'hour':
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: true,
      }).format(date);
    case 'day':
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(date);
    case 'week':
      return `Week of ${formatDate(date, 'short')}`;
    case 'month':
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        year: 'numeric',
      }).format(date);
  }
};

export const groupDataByTimeBucket = <T extends { timestamp: Date }>(
  data: T[],
  bucket: TimeBucket
): Map<string, T[]> => {
  const grouped = new Map<string, T[]>();

  data.forEach((item) => {
    const label = getBucketLabel(item.timestamp, bucket);
    const existing = grouped.get(label) || [];
    grouped.set(label, [...existing, item]);
  });

  return grouped;
};
```

### 3.2 Update Barrel Export

**File: `src/shared/lib/index.ts`**

```typescript
export * from './currencyFormatter';
export * from './dateFormatter';
export * from './firebase';
export * from './hooks';
```

---

## Step 4: Refactor Dashboard Data Hook

### 4.1 Update useDashboardData

**File: `src/shared/lib/hooks/useDashboardData.ts`**

**Remove inline time bucket logic (~80 lines):**
```typescript
const getTimeBucket = (startDate: Date, endDate: Date) => {
  // ... 80 lines of logic
};
```

**Add import:**
```typescript
import { getTimeBucket, groupDataByTimeBucket } from '../dateFormatter';
```

**Use imported functions:**
```typescript
const bucket = getTimeBucket(startDate, endDate);
const groupedData = groupDataByTimeBucket(donations, bucket);
```

---

## Step 5: Search and Replace Remaining Duplicates

### 5.1 Find All Currency Formatters

```bash
grep -rn "formatCurrency.*=" src/ --include="*.tsx" --include="*.ts"
```

### 5.2 Find All Date Formatters

```bash
grep -rn "new Intl.DateTimeFormat" src/ --include="*.tsx" --include="*.ts"
```

### 5.3 Replace Each Instance

For each found instance:
1. Remove inline implementation
2. Add import from shared lib
3. Update function calls if needed

---

## Step 6: Verify and Test

### 6.1 TypeScript Compilation

```bash
npm run build
```

### 6.2 Run Linter

```bash
npm run lint
```

### 6.3 Manual Testing Checklist

- [ ] Dashboard displays currency correctly
- [ ] Charts show proper formatting
- [ ] Kiosk management shows currency
- [ ] Donation amounts display correctly
- [ ] Date/time displays work
- [ ] Relative time formatting works
- [ ] All number formats are consistent

---

## Step 7: Final Verification

### 7.1 Code Metrics

```bash
# Count utility files
wc -l src/shared/lib/currencyFormatter.ts
wc -l src/shared/lib/dateFormatter.ts

# Verify no inline formatters remain
grep -r "const formatCurrency" src/views/
grep -r "const formatLargeCurrency" src/views/
```

---

## Completion Checklist

- [ ] Currency formatter enhanced
- [ ] Date formatter created
- [ ] All inline formatters removed
- [ ] All imports updated
- [ ] TypeScript compiles without errors
- [ ] Linter passes
- [ ] All manual tests pass
- [ ] Code committed and pushed
- [ ] PR created and reviewed

---

## Expected Results

**Lines Added:**
- Enhanced `currencyFormatter.ts`: ~30 lines
- New `dateFormatter.ts`: ~100 lines
- **Total: ~130 lines**

**Lines Removed:**
- Inline formatters: ~70 lines
- Dashboard time bucket logic: ~80 lines
- Duplicate implementations: ~100 lines
- **Total: ~250 lines**

**Net Reduction: ~120 lines**

---

## Next Phase

After completing Phase 3, proceed to:
**Phase 4: Component Decomposition**

---

**Phase Status:** Ready to Implement  
**Last Updated:** December 4, 2025
