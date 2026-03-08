# Recurring Analytics Specification (REC-001)

## Purpose
Define a single source of truth for recurring donation analytics across backend and admin UI.

## Scope
This spec defines:
- KPI formulas
- Source collections and fields
- Time window and timezone behavior
- Edge-case handling

This spec does not define UI design.

## Canonical Data Sources
- Subscription state KPIs use `subscriptions` collection.
- Cash/revenue KPIs use successful recurring entries in `donations` collection.

## Currency and Units
- Store and compute all amounts in minor units (for example pence/cents).
- Convert to formatted currency only at render time.

## Time Rules
- Store timestamps in UTC.
- KPI window filters are inclusive:
  - `from <= timestamp < to`
- For monthly trend buckets:
  - Use organization timezone for bucket boundaries if available.
  - Fallback timezone is UTC.

## Subscription Status Mapping
- Active-like: `active`, `trialing`
- At-risk: `past_due`, `unpaid`, `incomplete`
- Closed: `canceled`, `incomplete_expired`

## Formula Notation
- `S` = set of subscriptions for an organization.
- `D` = set of donations for an organization.
- `W = [from, to)` = selected analysis window.
- `A0` = active subscription count at window start (`timestamp < from` and active-like status).
- `A1` = active subscription count at window end (`timestamp < to` and active-like status).
- `N` = new subscriptions in window.
- `C` = canceled subscriptions in window.
- `amt(s)` = subscription amount in minor units.
- `mrr(s)` = normalized monthly amount for subscription `s`.
- `pct(x)` = `x * 100`.

## KPI Definitions

### 1) Active Subscriptions
- Definition: Count of subscriptions with status in active-like set.
- Formula:
  - `ActiveSubs = | { s in S : status(s) in ["active","trialing"] } |`
- Source: `subscriptions`

### 2) New Subscriptions (Window)
- Definition: Subscriptions started in selected window.
- Formula:
  - `N = | { s in S : startedAt(s) in W } |`
- Source: `subscriptions.startedAt`
- Fallback when `startedAt` missing:
  - use `createdAt`

### 3) Canceled Subscriptions (Window)
- Definition: Subscriptions canceled in selected window.
- Formula:
  - `C = | { s in S : canceledAt(s) in W } |`
- Source: `subscriptions.canceledAt`

### 4) Churn Rate (Window)
- Definition: Percentage of subscriptions lost during the window.
- Formula:
  - `ChurnRate = pct(C / A0)`
- Return `0` if denominator is `0`.
- Source: `subscriptions`

### 5) MRR (Monthly Recurring Revenue)
- Definition: Normalized monthly run-rate from active subscriptions.
- Formula per active subscription:
  - if `interval = "month"` and `intervalCount = 1`: `mrr(s) = amt(s)`
  - if `interval = "month"` and `intervalCount = 3`: `mrr(s) = amt(s) / 3`
  - if `interval = "year"`: `mrr(s) = amt(s) / 12`
- MRR:
  - `MRR = sum( mrr(s) ) for s in S where status(s) in ["active","trialing"]`
- Source: `subscriptions` where status in active-like set

### 6) ARR (Annual Recurring Revenue)
- Definition: Annualized run-rate from active subscriptions.
- Formula:
  - `ARR = 12 * MRR`
- Equivalent per subscription:
  - monthly: `amount * 12` (or `amount * 4` for quarterly)
  - yearly: `amount`
- Source: `subscriptions` where status in active-like set

### 7) Recurring Cash Collected (Window)
- Definition: Real recurring cash successfully collected in selected window.
- Formula:
  - `RecurringCash = sum( amount(d) ) for d in D where isRecurring(d)=true and paymentStatus(d)="success" and timestamp(d) in W`
- Filter:
  - `donations.isRecurring = true`
  - `donations.paymentStatus = "success"`
  - `donations.timestamp in [from, to)`
- Source: `donations`

### 8) Past Due Count
- Definition: Number of subscriptions currently in past-due state.
- Formula:
  - `PastDueCount = | { s in S : status(s) = "past_due" } |`
- Source: `subscriptions`

## Trend Series Definitions

### Monthly MRR Trend
- For each month bucket:
  - compute MRR using active subscriptions at month-end.

### Monthly Recurring Cash Trend
- For each month bucket:
  - sum `donations.amount` with recurring + success filters in that month.

## Edge Cases
- Missing subscription doc for webhook event:
  - log warning, do not upsert unknown subscription automatically.
- Missing `current_period_end` in subscription update payload:
  - fetch latest subscription from Stripe if possible.
  - if still missing, update status only.
- Replayed webhook events:
  - no duplicate business effect due to idempotency claim + donation doc idempotency key.

## Required Fields

### `subscriptions`
- `stripeSubscriptionId`
- `organizationId`
- `campaignId`
- `status`
- `interval`
- `intervalCount`
- `amount`
- `currency`
- `currentPeriodEnd`
- `startedAt`
- `lastPaymentAt`
- `nextPaymentAt`
- `canceledAt` (nullable)
- `cancelReason` (nullable)
- `createdAt`
- `updatedAt`

### `donations` (for recurring revenue analytics)
- `organizationId`
- `amount`
- `currency`
- `timestamp`
- `paymentStatus`
- `isRecurring`
- `subscriptionId` (nullable on non-recurring)
- `invoiceId` (nullable)

## Validation Checklist
- KPI values match formulas in this document.
- MRR/ARR computed in minor units before display formatting.
- Window filtering uses `[from, to)` semantics.
- Subscription and donation KPIs are not mixed incorrectly.
