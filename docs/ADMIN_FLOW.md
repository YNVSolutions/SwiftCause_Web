# Admin Flow

This document outlines the main admin-facing workflows in SwiftCause.

## Overview

Admin users manage campaigns, users, kiosks, subscriptions, donations, and Gift Aid workflows from the `/admin` area.

## Main Entry Points

- `app/admin/page.tsx`
- `app/admin/campaigns/page.tsx`
- `app/admin/campaigns/create/page.tsx`
- `app/admin/users/page.tsx`
- `app/admin/kiosks/page.tsx`
- `app/admin/donations/page.tsx`
- `app/admin/subscriptions/page.tsx`
- `app/admin/gift-aid/page.tsx`
- `src/views/admin/*`

## High-Level Flow

1. Verified admin user signs in.
2. The app restores the admin session.
3. The user is routed into the `/admin` area.
4. The dashboard loads organization-specific data.
5. The admin navigates into campaigns, users, kiosks, donations, subscriptions, and Gift Aid tools.

## Main Admin Workflows

### Campaign Management

- create campaigns
- edit campaign content and metadata
- manage campaign images
- control kiosk and organization relationships

### User Management

- view organization users
- create and update users
- manage permissions and role information

### Kiosk Management

- view kiosks
- create or update kiosk records
- link kiosks to campaigns
- support kiosk login and campaign assignments

### Donations And Subscriptions

- inspect donation activity
- review recurring subscription records
- monitor performance and reporting data

### Stripe Onboarding

- launch onboarding links
- view account status
- access express dashboard links where supported

## Important Contributor Notes

- Many admin screens aggregate data from multiple features and shared hooks.
- Changes in admin flows often affect both UI composition and backend data assumptions.
- Authorization-sensitive changes should be reviewed carefully, especially around Stripe onboarding and organization scoping.
