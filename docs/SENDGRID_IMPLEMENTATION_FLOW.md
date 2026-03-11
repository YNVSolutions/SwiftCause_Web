# SendGrid Implementation and Flow

## Scope
This document describes the current SendGrid implementation in `backend/functions`, including:
- Endpoints and Firestore triggers that send emails
- End-to-end flow from frontend to function to SendGrid
- Safety and edge-case handling currently implemented
- Audit logging and operational checks

## Current Email Types
1. Donation thank-you receipt
2. Contact form confirmation
3. Organization welcome email (post-verification)

## Key Files
- `backend/functions/services/email.js`
- `backend/functions/handlers/email.js`
- `backend/functions/handlers/triggers.js`
- `backend/functions/handlers/verification.js`
- `backend/functions/index.js`
- `src/shared/api/firestoreService.ts`
- `src/views/campaigns/EmailConfirmationScreen.tsx`
- `src/views/home/ContactPage.tsx`

## Configuration and Secrets
SendGrid is configured via Firebase Functions secrets:
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `SENDGRID_FROM_NAME` (optional, defaults to `SwiftCause`)

Where used:
- HTTP functions: `sendDonationThankYouEmail`, `sendContactConfirmationEmail`
- Firestore trigger: `sendWelcomeEmailForNewOrg`

Runtime behavior:
- `services/email.js` loads config from `process.env`
- Missing `SENDGRID_API_KEY` or `SENDGRID_FROM_EMAIL` throws an error and the send fails fast
- SendGrid client initialization is lazy and cached (`isInitialized`)

## Shared Email Service Flow
All email types flow through `sendEmail(...)` in `backend/functions/services/email.js`:
1. Ensure SendGrid client is initialized (`sgMail.setApiKey(...)`)
2. Build message with:
   - `to`
   - `from` (email + sender name)
   - `subject`, `text`, `html`
   - `categories`
   - `customArgs` (for audit correlation)
3. Call `sgMail.send(...)`
4. Write audit log document to `emailEvents`:
   - Success: status code + SendGrid message ID
   - Failure: sanitized error message

## Audit Logging (`emailEvents`)
Each send attempt writes to Firestore collection `emailEvents` with:
- `eventType` (`donation_thank_you`, `contact_confirmation`, `org_welcome`, etc.)
- `provider` = `sendgrid`
- `status` (`success`, `failed`, `deduplicated`)
- `recipient`
- `statusCode` (when available)
- `providerMessageId` (when available)
- Optional correlation IDs:
  - `donationId`
  - `organizationId`
  - `uid`
- `errorMessage` (sanitized, max 500 chars)
- `createdAt` (server timestamp)

If audit logging itself fails, the code logs to console but does not crash the process.

## Flow 1: Donation Thank-You Email

### Trigger Source
Frontend receipt UI calls `createThankYouMail(...)`:
- File: `src/views/campaigns/EmailConfirmationScreen.tsx`
- API wrapper: `src/shared/api/firestoreService.ts` -> `postPublicFunction('sendDonationThankYouEmail', ...)`

### Backend Entry
HTTP function `sendDonationThankYouEmail` in `backend/functions/handlers/email.js`.

### Request Contract
Method: `POST`
Body:
- `email` (required, valid format)
- `transactionId` (required)
- `campaignName` (optional override)

### Processing Steps
1. Validate method and payload (`405`/`400` on invalid input).
2. Resolve donation doc by `transactionId` with retry:
   - Up to 10 attempts
   - 700ms delay between attempts
3. If donation still missing: return `409` (`Donation is still processing...`).
4. Resolve organization name from `organizations/{organizationId}` when available.
5. Compose personalized email (donor name, amount, currency, campaign, org name).
6. Deduplication check before send:
   - Query `emailEvents` for successful `donation_thank_you` with same `donationId` + `recipient`
   - If found: log `deduplicated` event and skip send
7. Send via SendGrid and log result.

### Safety / Edge Cases Implemented
- Email format validation via regex
- Transaction ID required (prevents orphan sends)
- Read-after-write race protection using donation polling + 409 response
- Dedup prevention by donationId + recipient
- Graceful fallback text for missing donor/campaign/org values
- Fail-safe org lookup (warning log only; send still continues)
- Client-side UX maps 409 to a retry message

## Flow 2: Contact Confirmation Email

### Trigger Source
Frontend contact form:
- File: `src/views/home/ContactPage.tsx`
- First writes feedback doc (`submitFeedback`)
- Then calls `queueContactConfirmationEmail(...)`

### Backend Entry
HTTP function `sendContactConfirmationEmail` in `backend/functions/handlers/email.js`.

### Request Contract
Method: `POST`
Body:
- `email` (required, valid format)
- `firstName` (optional)
- `message` (required)

### Processing Steps
1. Validate method and payload (`405`/`400` as needed).
2. Build plain-text and HTML confirmation email.
3. Escape HTML and preserve message line breaks safely.
4. Send via SendGrid.
5. Log to `emailEvents` with eventType `contact_confirmation`.

### Safety / Edge Cases Implemented
- Honeypot field (`website`) on frontend blocks likely bot submissions
- Contact submission and email send are decoupled:
  - Feedback is still stored even if email send fails
  - UI surfaces "confirmation may be delayed" message
- Input validation for required email/message
- HTML escaping for user-provided content

## Flow 3: Organization Welcome Email

### Trigger Source
Firestore trigger `sendWelcomeEmailForNewOrg` in `backend/functions/handlers/triggers.js`.

### Upstream Initiator
HTTP function `completeEmailVerification` in `backend/functions/handlers/verification.js` sets:
- `users/{uid}.emailVerified = true`

That update triggers `onDocumentUpdated('users/{uid}')`.

### Trigger Conditions (all required)
The trigger sends only when:
1. User role is `admin` or `super_admin`
2. `after.emailVerified === true`
3. `before.emailVerified !== true` (must be first verification transition)
4. `after.welcomeEmailSentAt` does not already exist
5. User has both `email` and `organizationId`

### Processing Steps
1. Read org document `organizations/{organizationId}`.
2. Resolve organization name (`name`, fallback `organizationName`, fallback orgId).
3. Send welcome email via SendGrid service.
4. Mark user document:
   - `welcomeEmailSentAt` (server timestamp)
   - `welcomeEmailRecipient`

### Safety / Edge Cases Implemented
- Gate on verification transition prevents repeated sends on unrelated profile updates
- `welcomeEmailSentAt` flag provides idempotency guard
- Skip safely if required fields (`email`, `organizationId`) are missing
- Errors are logged without crashing trigger runtime

## Content Safety and Template Hardening
Implemented in `services/email.js`:
- `escapeHtml(...)` to sanitize interpolated user/org/message values
- Fallback defaults for missing personalization fields
- Message/error sanitization (`sanitizeErrorMessage`) before persistence
- Consistent branded shell HTML via `buildEmailShell(...)`

## HTTP Status and Retry Behavior
`postPublicFunction(...)` in `src/shared/api/firestoreService.ts`:
- Retryable statuses: `408, 409, 425, 429, 500, 502, 503, 504`
- Default attempts: `3`
- Default delay: `700ms`
- Donation receipt call currently forces `attempts: 1`
- Contact confirmation uses `attempts: 3`
- Request timeout: `15s` (AbortController)

## Deployment Checklist
1. Ensure secrets are set in Firebase project:
   - `SENDGRID_API_KEY`
   - `SENDGRID_FROM_EMAIL`
   - `SENDGRID_FROM_NAME` (optional)
2. Deploy functions from `backend/functions`:
   - `npm run deploy`
3. Validate exported functions in `backend/functions/index.js`:
   - `sendDonationThankYouEmail`
   - `sendContactConfirmationEmail`
   - `sendWelcomeEmailForNewOrg`
4. Run smoke tests:
   - Donation receipt from receipt screen
   - Contact form submission + confirmation email
   - Email verification flow for new admin user
5. Confirm `emailEvents` logs are being written.

## Operational Queries (Firestore)
Useful checks:
- Failed sends:
  - `emailEvents where status == "failed" orderBy createdAt desc`
- Duplicate suppression activity:
  - `emailEvents where status == "deduplicated"`
- Welcome email confirmation:
  - `users where welcomeEmailSentAt != null`

## Notes on Legacy Path
There is an older legacy function in:
- `src/shared/api/legacy/firestoreService.ts`
It wrote email payloads to Firestore `mail` collection (extension-style queue).  
Current active implementation is direct SendGrid via Cloud Functions and `services/email.js`.
