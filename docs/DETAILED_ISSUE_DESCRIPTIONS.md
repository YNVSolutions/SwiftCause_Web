# Detailed Issue Descriptions - Swift Cause Web

This document contains comprehensive technical specifications for all backlog issues, based on codebase analysis.

---

## Issue #163: Develop Donor Portal for Subscription Management

### Current State
No donor portal exists. Donors cannot view or manage their subscriptions.

### Technical Specs

**Route:** `/donor/portal` or `/my-subscriptions`

**Components Needed:**
\`\`\`typescript
// src/components/donor/DonorPortal.tsx
- SubscriptionList
- SubscriptionCard
- PaymentMethodManager
- InvoiceHistory
- DonationHistory
\`\`\`

**Firestore Queries:**
\`\`\`typescript
const subscriptions = await getDocs(
  query(
    collection(db, 'subscriptions'),
    where('donorEmail', '==', userEmail),
    orderBy('createdAt', 'desc')
  )
);
\`\`\`

**Features:**
1. View all active subscriptions
2. Pause subscription (1-3 months)
3. Cancel subscription (immediate or end of period)
4. Update payment method
5. View payment history
6. Download tax receipts
7. Update contact info

---

## Issue #151: Architect Email & Notification Microservice

### Current Problem
From codebase: **No email service exists!**

\`\`\`typescript
// src/components/EmailConfirmationScreen.tsx - just a UI placeholder
// No actual email sending implementation
\`\`\`

### Architecture Design

**Tech Stack:**
- **Queue:** Google Cloud Tasks
- **Email Provider:** SendGrid or Postmark
- **Templates:** Handlebars/React Email
- **Storage:** Firestore for queue/logs

**System Design:**
\`\`\`
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   App       │─────>│  Cloud Task  │─────>│   Email     │
│  (trigger)  │      │    Queue     │      │   Worker    │
└─────────────┘      └──────────────┘      └─────────────┘
                                                   │
                                                   v
                                            ┌─────────────┐
                                            │  SendGrid   │
                                            │   API       │
                                            └─────────────┘
\`\`\`

**Email Types:**
1. Donation receipt
2. Recurring payment confirmation
3. Subscription created/canceled
4. Payment failed
5. Gift Aid confirmation
6. Admin notifications

### Implementation
\`\`\`typescript
// functions/src/email/sendEmail.ts
interface EmailJob {
  to: string;
  template: 'donation_receipt' | 'subscription_created' | ...;
  data: Record<string, any>;
  priority: 'high' | 'normal' | 'low';
}

export const processEmailQueue = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    const jobs = await getPendingEmailJobs();
    await Promise.all(jobs.map(sendEmail));
  });
\`\`\`

---

## Issue #154: Admin Dashboard - Core Analytics Enhancement

### Current Implementation
From \`src/components/admin/AdminDashboard.tsx\`:

**Existing Analytics:**
- Total donations (line 125)
- Device distribution (line 127)
- Top campaigns (line 129)
- Goal comparison (line 130)
- Category data (line 131)

**Missing Analytics:**
- Time-series donation trends
- Donor retention rates
- Average donation by source
- Conversion funnels
- Geographic heatmaps
- Campaign performance scores

### Required Enhancements

**1. Time-Series Charts**
\`\`\`typescript
// Add to useDashboardData hook
interface DonationTrend {
  date: Date;
  amount: number;
  count: number;
}

const donationTrends = await getDocs(
  query(
    collection(db, 'donations'),
    where('organizationId', '==', orgId),
    where('timestamp', '>=', last30Days),
    orderBy('timestamp')
  )
);
\`\`\`

**2. Donor Retention**
\`\`\`typescript
interface RetentionMetrics {
  newDonors: number;
  returningDonors: number;
  retentionRate: number;
  averageLifetimeValue: number;
}
\`\`\`

**3. Campaign Performance Score**
\`\`\`typescript
function calculatePerformanceScore(campaign: Campaign): number {
  const progressScore = (campaign.raised / campaign.goal) * 40;
  const velocityScore = calculateVelocity(campaign) * 30;
  const engagementScore = calculateEngagement(campaign) * 30;
  return progressScore + velocityScore + engagementScore;
}
\`\`\`

---

## Issue #123: Add Skeleton Loaders and No Data Fallback UI

### Current Problems
From codebase analysis:

**Components Missing Loaders:**
- src/components/CampaignListScreen.tsx - No loading state
- src/components/admin/DonationManagement.tsx - Basic loading
- src/components/PaymentScreen.tsx - No loading indicators

**Existing Implementation:**
\`\`\`typescript
// src/components/admin/AdminDashboard.tsx has some skeletons
import { Skeleton } from "../ui/skeleton";

{loading ? (
  <Skeleton className="h-24 w-full" />
) : (
  <MetricCard />
)}
\`\`\`

But inconsistent across app!

### Required Implementation

**1. Create Skeleton Components**
\`\`\`typescript
// src/components/ui/skeletons/CampaignCardSkeleton.tsx
export function CampaignCardSkeleton() {
  return (
    <Card>
      <Skeleton className="h-48 w-full" />
      <CardContent className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}
\`\`\`

**2. Empty State Components**
\`\`\`typescript
// src/components/ui/EmptyState.tsx
export function EmptyState({
  icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-500 mt-2">{description}</p>
      {action && <Button className="mt-4">{action}</Button>}
    </div>
  );
}
\`\`\`

**3. Update All Components**
Apply pattern to:
- CampaignListScreen
- DonationManagement
- UserManagement
- KioskManagement
- All admin pages

---

## Remaining Issues Summary

**#152 - Notification Service:** Webhook system for real-time notifications
**#156 - Geolocation Pipeline:** Extract and store donor location data
**#157 - Geographic Analytics:** Visualize donations on maps
**#125 - Stripe Express Dashboard:** One-time links for connect accounts
**#126 - RazorPay Integration:** India payment gateway
**#153 - Donor Segmentation:** ML-based donor categorization

---

For full implementation details, see individual GitHub issues.
Each issue has been updated with:
- User stories
- Acceptance criteria
- Technical specifications from codebase
- Code examples
- Dependencies
- Definition of done

