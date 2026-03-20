# Roadmap

This document outlines the current product direction for SwiftCause and highlights areas where contributors can help.

## Near Term

### Authentication And Account Management

- Complete end-to-end testing for forgot-password and account recovery flows.
- Improve email verification and recovery UX for edge cases and expired actions.
- Add clearer audit visibility for authentication-related admin events.

### Donations And Payments

- Expand Stripe payment flow validation and failure-state handling.
- Improve campaign payment experience on mobile devices.
- Add stronger admin tooling around payout, reconciliation, and onboarding status.

### Gift Aid

- Refine the declaration capture flow and validation rules.
- Improve admin review and reporting for Gift Aid records.
- Add clearer donor-facing messaging around eligibility and declarations.

### Quality And Reliability

- Add real automated test coverage for critical donation and authentication flows.
- Tighten CI so typecheck, lint, and build failures block merges.
- Reduce framework warnings, including the deprecated `middleware` convention.

## Mid Term

### Admin Experience

- Expand dashboard insights for donations, campaigns, and device activity.
- Improve bulk actions and filtering across admin tables.
- Add role-based access refinements for different organization users.

### Campaign Management

- Add richer campaign editing, scheduling, and publishing controls.
- Improve media management and asset handling for campaign pages.
- Add reusable templates for common campaign types.

### Kiosk And Device Support

- Improve provisioning and monitoring flows for kiosk devices.
- Add better diagnostics for disconnected or misconfigured devices.
- Strengthen device-to-campaign assignment workflows.

## Long Term

### Platform Expansion

- Support more nonprofit operational workflows beyond campaign fundraising.
- Add deeper reporting and export capabilities for finance and compliance needs.
- Explore more integrations for CRM, email, and donor management tooling.

### Contributor On-Ramps

- Add architecture diagrams and module ownership guidance.
- Create issue labels for priority, difficulty, and domain ownership.
- Break larger epics into contributor-friendly milestones and starter tasks.

## Good First Contributions

- Add or improve tests around auth and payment flows.
- Fix workflow warnings and strengthen CI enforcement.
- Improve documentation for setup, deployment, and contribution flow.
- Triage and document admin UI inconsistencies or accessibility issues.
