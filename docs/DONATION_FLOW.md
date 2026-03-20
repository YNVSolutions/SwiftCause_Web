# Donation Flow

This document outlines the current donor-facing payment flow in SwiftCause.

## Overview

The donation experience covers:

- campaign discovery and selection
- donor information capture
- one-time and recurring payments
- optional Gift Aid declaration
- payment result handling

## Main Entry Points

- `app/campaign/[campaignId]/page.tsx`
- `app/payment/[campaignId]/page.tsx`
- `app/result/page.tsx`
- `src/views/campaigns/CampaignScreen.tsx`
- `src/views/campaigns/DonationSelectionScreen.tsx`
- `src/views/campaigns/PaymentScreen.tsx`
- `src/views/campaigns/ResultScreen.tsx`
- `src/features/payment/hooks/usePayment.ts`
- `src/features/donate-to-campaign/hooks/usePayment.ts`

## High-Level Flow

1. Donor opens a campaign page.
2. The app loads campaign details and donation options.
3. The donor chooses an amount and recurring or one-time payment mode.
4. The donor submits donor details and optional message information.
5. If Gift Aid applies, the donor may complete the declaration flow.
6. The app requests a payment intent or subscription-related backend action.
7. Stripe payment collection completes.
8. The app routes to the result screen and shows success or failure state.

## One-Time Donation Flow

For a one-time donation:

1. The user selects a campaign and amount.
2. The frontend calls the payment backend to create a payment intent.
3. Stripe Elements confirms the payment.
4. The result screen displays confirmation details.

## Recurring Donation Flow

For recurring donations:

1. The user selects a recurring cadence.
2. The frontend calls the recurring subscription backend function.
3. Stripe manages the subscription lifecycle.
4. Subscription identifiers are stored for later management and reporting.

## Related Systems

- Firebase stores campaign, donation, and donor-related records.
- Firebase Functions handle privileged payment operations.
- Stripe handles payment intent and subscription processing.

## Important Contributor Notes

- Payment flows are split between UI state, shared API helpers, and backend functions.
- Changes to donor forms should be reviewed for validation, mobile UX, and payment failure handling.
- When updating recurring flows, check both frontend and backend subscription code paths.
