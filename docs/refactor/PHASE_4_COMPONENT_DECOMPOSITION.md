# Phase 4: Component Decomposition - Implementation Guide

**Estimated Time:** 24 hours (3 days)  
**Risk Level:** Medium  
**Expected Line Reduction:** ~1,000 lines

---

## Overview

This phase breaks down large monolithic components into smaller, focused, reusable components following FSD architecture.

---

## Pre-Implementation Checklist

- [ ] Phase 3 completed and tested
- [ ] Create feature branch: `refactor/phase-4-component-decomposition`
- [ ] Create git tag: `pre-refactor-phase-4`
- [ ] Backup AdminDashboard and CampaignManagement

---

## Part A: AdminDashboard Decomposition (1,497 lines → ~150 lines)

### Step 1: Create Widget Structure

```bash
mkdir -p src/widgets/admin-dashboard/ui
mkdir -p src/widgets/admin-dashboard/model
```

### Step 2: Extract DashboardStats Component

**File: `src/widgets/admin-dashboard/ui/DashboardStats.tsx`**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/card';
import { formatCompactCurrency, formatNumber } from '@/shared/lib/currencyFormatter';

interface DashboardStatsProps {
  totalDonations: number;
  totalCampaigns: number;
  totalKiosks: number;
  activeDonors: number;
}

export function DashboardStats({
  totalDonations,
  totalCampaigns,
  totalKiosks,
  activeDonors,
}: DashboardStatsProps) {
  const stats = [
    {
      title: 'Total Donations',
      value: formatCompactCurrency(totalDonations),
      icon: '💰',
    },
    {
      title: 'Active Campaigns',
      value: formatNumber(totalCampaigns),
      icon: '📊',
    },
    {
      title: 'Kiosks Deployed',
      value: formatNumber(totalKiosks),
      icon: '🖥️',
    },
    {
      title: 'Active Donors',
      value: formatNumber(activeDonors),
      icon: '👥',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <span className="text-2xl">{stat.icon}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```


### Step 3: Extract DashboardCharts Component

**File: `src/widgets/admin-dashboard/ui/DashboardCharts.tsx`**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/card';
import { BarChart, LineChart, PieChart } from '@/shared/ui/components/charts';

interface DashboardChartsProps {
  donationTrends: any[];
  campaignPerformance: any[];
  donorDistribution: any[];
}

export function DashboardCharts({
  donationTrends,
  campaignPerformance,
  donorDistribution,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Donation Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart data={donationTrends} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={campaignPerformance} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Donor Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart data={donorDistribution} />
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 4: Extract Platform Features Component

**File: `src/widgets/admin-dashboard/ui/PlatformFeatures.tsx`**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/card';

const features = [
  {
    title: 'Campaign Management',
    description: 'Create and manage fundraising campaigns',
    icon: '📊',
  },
  {
    title: 'Kiosk Network',
    description: 'Deploy and monitor donation kiosks',
    icon: '🖥️',
  },
  {
    title: 'Analytics Dashboard',
    description: 'Track donations and campaign performance',
    icon: '📈',
  },
  {
    title: 'Donor Management',
    description: 'Engage with your donor community',
    icon: '👥',
  },
];

export function PlatformFeatures() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Features</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start space-x-3">
              <span className="text-3xl">{feature.icon}</span>
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 5: Extract Getting Started Guide

**File: `src/widgets/admin-dashboard/ui/GettingStartedGuide.tsx`**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/card';
import { Button } from '@/shared/ui/components/button';
import { CheckCircle2, Circle } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
  actionLabel?: string;
}

interface GettingStartedGuideProps {
  steps: Step[];
}

export function GettingStartedGuide({ steps }: GettingStartedGuideProps) {
  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Getting Started</CardTitle>
        <div className="mt-2">
          <div className="flex items-center justify-between text-sm">
            <span>{completedCount} of {steps.length} completed</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start space-x-3">
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className="font-medium">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {step.action && !step.completed && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={step.action}
                  >
                    {step.actionLabel || 'Complete'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 6: Extract Activity Feed

**File: `src/widgets/admin-dashboard/ui/ActivityFeed.tsx`**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/card';
import { formatRelativeTime } from '@/shared/lib/dateFormatter';

interface Activity {
  id: string;
  type: 'donation' | 'campaign' | 'kiosk' | 'user';
  message: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'donation': return '💰';
      case 'campaign': return '📊';
      case 'kiosk': return '🖥️';
      case 'user': return '👤';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <span className="text-xl">{getActivityIcon(activity.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 7: Create Widget Barrel Export

**File: `src/widgets/admin-dashboard/index.ts`**

```typescript
export { DashboardStats } from './ui/DashboardStats';
export { DashboardCharts } from './ui/DashboardCharts';
export { PlatformFeatures } from './ui/PlatformFeatures';
export { GettingStartedGuide } from './ui/GettingStartedGuide';
export { ActivityFeed } from './ui/ActivityFeed';
```

### Step 8: Refactor AdminDashboard to Use Widgets

**File: `src/views/admin/AdminDashboard.tsx`** (Reduced to ~150 lines)

```typescript
import { useDashboardData } from '@/shared/lib/hooks';
import { useAuth } from '@/shared/lib/hooks/useAuth';
import {
  DashboardStats,
  DashboardCharts,
  PlatformFeatures,
  GettingStartedGuide,
  ActivityFeed,
} from '@/widgets/admin-dashboard';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, loading, error } = useDashboardData(user?.organizationId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  const steps = [
    {
      id: 'stripe',
      title: 'Connect Stripe Account',
      description: 'Set up payment processing',
      completed: data.stripeConnected,
      action: () => {/* handle stripe setup */},
      actionLabel: 'Connect Stripe',
    },
    {
      id: 'campaign',
      title: 'Create First Campaign',
      description: 'Launch your first fundraising campaign',
      completed: data.totalCampaigns > 0,
      action: () => {/* navigate to campaigns */},
      actionLabel: 'Create Campaign',
    },
    // ... more steps
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <DashboardStats
        totalDonations={data.totalDonations}
        totalCampaigns={data.totalCampaigns}
        totalKiosks={data.totalKiosks}
        activeDonors={data.activeDonors}
      />

      <DashboardCharts
        donationTrends={data.donationTrends}
        campaignPerformance={data.campaignPerformance}
        donorDistribution={data.donorDistribution}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <GettingStartedGuide steps={steps} />
        <ActivityFeed activities={data.recentActivities} />
      </div>

      <PlatformFeatures />
    </div>
  );
}
```

---

## Part B: CampaignManagement Decomposition (800+ lines → ~150 lines)

### Step 1: Create Feature Structure

```bash
mkdir -p src/features/campaign-management/ui
mkdir -p src/features/campaign-management/model
```

### Step 2: Extract Campaign Dialog

**File: `src/features/campaign-management/ui/CampaignDialog.tsx`**

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/components/dialog';
import { CampaignForm } from './CampaignForm';
import { Campaign } from '@/entities/campaign';

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign;
  onSave: (data: Partial<Campaign>) => Promise<void>;
}

export function CampaignDialog({
  open,
  onOpenChange,
  campaign,
  onSave,
}: CampaignDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {campaign ? 'Edit Campaign' : 'Create Campaign'}
          </DialogTitle>
        </DialogHeader>
        <CampaignForm
          campaign={campaign}
          onSubmit={onSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### Step 3: Extract Campaign Form

**File: `src/features/campaign-management/ui/CampaignForm.tsx`**

```typescript
import { useState } from 'react';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import { Textarea } from '@/shared/ui/components/textarea';
import { Campaign } from '@/entities/campaign';
import { CampaignImageUpload } from './CampaignImageUpload';

interface CampaignFormProps {
  campaign?: Campaign;
  onSubmit: (data: Partial<Campaign>) => Promise<void>;
  onCancel: () => void;
}

export function CampaignForm({ campaign, onSubmit, onCancel }: CampaignFormProps) {
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    description: campaign?.description || '',
    goalAmount: campaign?.goalAmount || 0,
    imageUrl: campaign?.imageUrl || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Campaign Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      
      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={4}
      />

      <Input
        label="Goal Amount"
        type="number"
        value={formData.goalAmount}
        onChange={(e) => setFormData({ ...formData, goalAmount: Number(e.target.value) })}
        required
      />

      <CampaignImageUpload
        imageUrl={formData.imageUrl}
        onImageChange={(url) => setFormData({ ...formData, imageUrl: url })}
      />

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Campaign'}
        </Button>
      </div>
    </form>
  );
}
```

### Step 4: Extract Campaign List

**File: `src/features/campaign-management/ui/CampaignList.tsx`**

```typescript
import { Campaign } from '@/entities/campaign';
import { CampaignCard } from './CampaignCard';

interface CampaignListProps {
  campaigns: Campaign[];
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
}

export function CampaignList({ campaigns, onEdit, onDelete }: CampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No campaigns found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onEdit={() => onEdit(campaign)}
          onDelete={() => onDelete(campaign.id)}
        />
      ))}
    </div>
  );
}
```

### Step 5: Create Feature Barrel Export

**File: `src/features/campaign-management/index.ts`**

```typescript
export { CampaignDialog } from './ui/CampaignDialog';
export { CampaignList } from './ui/CampaignList';
export { CampaignFilters } from './ui/CampaignFilters';
```

### Step 6: Refactor CampaignManagement

**File: `src/views/admin/CampaignManagement.tsx`** (Reduced to ~150 lines)

```typescript
import { useState } from 'react';
import { useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign } from '@/entities/campaign';
import { CampaignDialog, CampaignList, CampaignFilters } from '@/features/campaign-management';
import { Button } from '@/shared/ui/components/button';

export default function CampaignManagement() {
  const { campaigns, loading, refresh } = useCampaigns();
  const { execute: createCampaign } = useCreateCampaign(refresh);
  const { execute: updateCampaign } = useUpdateCampaign(refresh);
  const { execute: deleteCampaign } = useDeleteCampaign(refresh);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | undefined>();
  const [filters, setFilters] = useState({ search: '', status: 'all' });

  const handleSave = async (data: Partial<Campaign>) => {
    if (selectedCampaign) {
      await updateCampaign(selectedCampaign.id, data);
    } else {
      await createCampaign(data);
    }
    setDialogOpen(false);
    setSelectedCampaign(undefined);
  };

  const filteredCampaigns = campaigns.filter(/* filter logic */);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Campaign Management</h1>
        <Button onClick={() => setDialogOpen(true)}>
          Create Campaign
        </Button>
      </div>

      <CampaignFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <CampaignList
          campaigns={filteredCampaigns}
          onEdit={(campaign) => {
            setSelectedCampaign(campaign);
            setDialogOpen(true);
          }}
          onDelete={deleteCampaign}
        />
      )}

      <CampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        campaign={selectedCampaign}
        onSave={handleSave}
      />
    </div>
  );
}
```

---

## Part C: Create Generic Dialog Components

### Step 1: Create FormDialog

**File: `src/shared/ui/components/FormDialog.tsx`**

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { ReactNode } from 'react';

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}

export function FormDialog({ open, onOpenChange, title, children }: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

### Step 2: Create ConfirmDialog

**File: `src/shared/ui/components/ConfirmDialog.tsx`**

```typescript
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

## Verification and Testing

### TypeScript Compilation

```bash
npm run build
```

### Manual Testing

- [ ] Dashboard loads and displays all widgets
- [ ] Stats cards show correct data
- [ ] Charts render properly
- [ ] Activity feed updates
- [ ] Campaign list displays
- [ ] Create campaign works
- [ ] Edit campaign works
- [ ] Delete campaign works
- [ ] All dialogs function correctly

---

## Completion Checklist

- [ ] AdminDashboard decomposed into widgets
- [ ] CampaignManagement decomposed into features
- [ ] Generic dialog components created
- [ ] All components properly exported
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Code committed and pushed

---

## Expected Results

**AdminDashboard:**
- Before: 1,497 lines
- After: ~150 lines (orchestration) + ~600 lines (widgets)
- Net Reduction: ~750 lines

**CampaignManagement:**
- Before: 800 lines
- After: ~150 lines (orchestration) + ~400 lines (features)
- Net Reduction: ~250 lines

**Total Net Reduction: ~1,000 lines**

---

## Next Phase

After completing Phase 4, proceed to:
**Phase 5: Views → Pages Migration**

---

**Phase Status:** Ready to Implement  
**Last Updated:** December 4, 2025
