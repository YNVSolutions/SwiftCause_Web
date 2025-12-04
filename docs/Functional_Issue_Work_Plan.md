# Functional Issue Work Plan

**Project:** SwiftCause Web  
**Focus:** Addressing functional issues #10 through #163  
**Timeline:** 10 Days (Intensive)  
**Repository:** [YNVSolutions/SwiftCause_Web](https://github.com/YNVSolutions/SwiftCause_Web)
**Project** [Swift Cause Project](https://github.com/orgs/YNVSolutions/projects/1)

---

## 📅 Day 1: Recurring Donation Foundation
*Focus: Designing the subscription architecture and implementing the frontend flow.*

### [Issue #11: Design Recurring Donation Flow](https://github.com/YNVSolutions/SwiftCause_Web/issues/11)
* **Goal:** Map out the subscription architecture and user journey.
* **Sprint:** Sprint 3
* **Size:** Large

### [Issue #161: Create UI for Recurring Donations](https://github.com/YNVSolutions/SwiftCause_Web/issues/161)
* **Goal:** Add "Monthly" toggle and frequency options to donation form.
* **Sprint:** Sprint 4
* **Size:** Medium

---

## 📅 Day 2: UI Polish & Payment Gateways
*Focus: Improving user experience and expanding payment options.*

### [Issue #123: Add skeleton loaders and No data fallback UI](https://github.com/YNVSolutions/SwiftCause_Web/issues/123)
* **Goal:** Implement `Skeleton` components in Campaign and Admin views.
* **Sprint:** Sprint 7
* **Size:** Medium

### [Issue #125: Connect accounts express dashboard functionality](https://github.com/YNVSolutions/SwiftCause_Web/issues/125)
* **Goal:** Enable sub-accounts to view their Stripe Express dashboard.
* **Sprint:** Sprint 7
* **Size:** Small

### [Issue #126: Add RazorPay SDK for India based payments](https://github.com/YNVSolutions/SwiftCause_Web/issues/126)
* **Goal:** Integrate RazorPay wrapper for Indian currency support.
* **Sprint:** Sprint 7
* **Size:** Medium

---

## 📅 Day 3: Communication Infrastructure
*Focus: Setting up the backend microservices for messaging.*

### [Issue #151: Architect and Build Email & Notification Microservice](https://github.com/YNVSolutions/SwiftCause_Web/issues/151)
* **Goal:** Design the Cloud Tasks queue and email worker system.
* **Sprint:** Sprint 5
* **Size:** Extra Large

---

## 📅 Day 4: Notifications System
*Focus: Implementing the consumer logic for emails.*

### [Issue #152: Setup Notification Service, Queue, and Webhook](https://github.com/YNVSolutions/SwiftCause_Web/issues/152)
* **Goal:** Implement the queue consumers and transactional email templates.
* **Sprint:** Sprint 5
* **Size:** Large

---

## 📅 Day 5: Compliance Framework
*Focus: Setting up the legal and regulatory requirements.*

### [Issue #150: Compliance Framework](https://github.com/YNVSolutions/SwiftCause_Web/issues/150)
* **Goal:** Research and document UK/GDPR compliance requirements.
* **Sprint:** Sprint 1
* **Size:** Extra Large

---

## 📅 Day 6: Analytics & Insights
*Focus: Enhancing the Admin Dashboard with actionable data.*

### [Issue #154: Admin Dashboard - Core Analytics Feature Enhancement](https://github.com/YNVSolutions/SwiftCause_Web/issues/154)
* **Goal:** Add time-series charts, retention rates, and campaign scores.
* **Sprint:** Sprint 6
* **Size:** Large

---

## 📅 Day 7: Geographic Intelligence
*Focus: Visualizing where donations come from.*

### [Issue #156: Geolocation Data Pipeline & Reporting](https://github.com/YNVSolutions/SwiftCause_Web/issues/156)
* **Goal:** Capture and store location data from donation IP addresses.
* **Sprint:** Sprint 6
* **Size:** Medium

### [Issue #157: Implement Geographic and Device Analytics Charts](https://github.com/YNVSolutions/SwiftCause_Web/issues/157)
* **Goal:** Render map visualizations and device breakdown charts.
* **Sprint:** Sprint 6
* **Size:** Medium

---

## 📅 Day 8: Subscription Infrastructure
*Focus: Connecting the Recurring UI to Stripe.*

### [Issue #162: Integrate Stripe Subscriptions](https://github.com/YNVSolutions/SwiftCause_Web/issues/162)
* **Goal:** Implement backend logic to create/manage Stripe Plans and Subs.
* **Sprint:** Sprint 3
* **Size:** Large

---

## 📅 Day 9: Donor Management
*Focus: Giving control back to the donor and understanding segments.*

### [Issue #163: Develop Donor Portal for Subscription Management](https://github.com/YNVSolutions/SwiftCause_Web/issues/163)
* **Goal:** Build the dashboard for donors to pause/cancel subscriptions.
* **Sprint:** Sprint 4
* **Size:** Large

### [Issue #153: Develop a Donor Segmentation Engine and API](https://github.com/YNVSolutions/SwiftCause_Web/issues/153)
* **Goal:** Create logic to categorize donors (e.g., "Lapsed", "Frequent").
* **Sprint:** Sprint 8
* **Size:** Large

---

## 📅 Day 10: Gift Aid Integration (All Tasks)
*Focus: Full implementation of UK Tax Relief features.*

### [Issue #10: Integrate Gift Aid functionality](https://github.com/YNVSolutions/SwiftCause_Web/issues/10)
* **Goal:** Define the full Gift Aid flow and integration points.
* **Sprint:** Sprint 2
* **Size:** Large

### [Issue #158: Create Gift Aid Declaration Form](https://github.com/YNVSolutions/SwiftCause_Web/issues/158)
* **Goal:** Build the UI form for donors to declare tax status.
* **Sprint:** Sprint 1
* **Size:** Medium

### [Issue #159: Store & Manage Gift Aid Declarations](https://github.com/YNVSolutions/SwiftCause_Web/issues/159)
* **Goal:** Create Firestore schema to securely store declarations.
* **Sprint:** Sprint 1
* **Size:** Medium

### [Issue #160: Develop HMRC Claim Generation Module](https://github.com/YNVSolutions/SwiftCause_Web/issues/160)
* **Goal:** Generate exportable reports/CSV for HMRC tax claims.
* **Sprint:** Sprint 2
* **Size:** Large