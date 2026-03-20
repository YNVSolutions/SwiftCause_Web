# Gift Aid Flow

This document outlines the current Gift Aid flow in SwiftCause.

## Overview

SwiftCause supports Gift Aid declaration capture as part of eligible donation flows and provides admin tooling for later review and reporting.

## Main Areas

- donor-facing declaration capture during donation flow
- storage of declaration details
- admin review and export workflows

## Main Files

- `src/entities/giftAid/*`
- `src/features/kiosk-gift-aid/*`
- `src/views/admin/GiftAidManagement.tsx`
- `src/shared/config/constants.ts`
- `src/shared/api/firestoreService.ts`
- `backend/functions/shared/giftAidContract.js`

## Donor Flow

1. Donor chooses to apply Gift Aid during donation.
2. The app captures the required declaration data.
3. The declaration text and donor confirmation are stored with the donation context.
4. The resulting Gift Aid record is linked back to the donation and organization.

## Stored Data

Gift Aid data includes:

- donor name and address details
- postcode and tax confirmation
- declaration wording and version
- donation amount and donation date
- organization and donation identifiers
- audit-oriented timestamps

## Admin Flow

1. Admin opens the Gift Aid management area.
2. The app loads declaration records for the active organization.
3. Admin reviews claim state and related donation information.
4. Admin exports or reports on declaration data as needed.

## Important Contributor Notes

- Gift Aid is a compliance-sensitive flow, so wording, field requirements, and storage shape should not be changed casually.
- When updating Gift Aid UX, review both donor-facing capture and admin/reporting use cases.
- If legal wording changes, version the declaration text clearly and keep backward compatibility for stored records.
