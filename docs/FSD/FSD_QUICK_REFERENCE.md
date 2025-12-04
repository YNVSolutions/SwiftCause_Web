# FSD Migration - Quick Reference

## 🎯 Quick Links

- **Project Board:** https://github.com/orgs/YNVSolutions/projects/5
- **Roadmap:** [FSD_ROADMAP.md](./FSD_ROADMAP.md)
- **Milestone:** https://github.com/YNVSolutions/SwiftCause_Web/milestone/2
- **Full Plan:** [FSD_MIGRATION_PLAN.md](./FSD_MIGRATION_PLAN.md)
- **FSD Docs:** https://feature-sliced.design/

---

## 📁 Target FSD Structure

```
src/
├── app/                      # App initialization
│   ├── providers/            # Context providers
│   ├── routes/               # Route definitions
│   └── App.tsx              # Entry point
│
├── pages/                    # Route pages
│   ├── home/
│   ├── admin-dashboard/
│   ├── campaigns/
│   └── ...
│
├── widgets/                  # Composite UI blocks
│   ├── navigation-header/
│   ├── dashboard-metrics/
│   └── ...
│
├── features/                 # User actions
│   ├── auth-by-email/
│   ├── donate-to-campaign/
│   ├── manage-users/
│   └── ...
│
├── entities/                 # Business entities
│   ├── campaign/
│   ├── user/
│   ├── donation/
│   ├── kiosk/
│   └── organization/
│
└── shared/                   # Shared resources
    ├── ui/                   # UI components
    ├── lib/                  # Utilities
    ├── api/                  # Base API
    ├── config/               # Constants
    └── types/                # Global types
```

---

## 🎫 All Tickets at a Glance

### Phase 1: Foundation (3 tickets)
- #169 - FSD folder structure
- #170 - ESLint import rules
- #171 - Architecture documentation

### Phase 2: Shared (3 tickets)
- #172 - Migrate UI components
- #173 - Migrate utils/libs
- #174 - Shared types/config

### Phase 3: Entities (5 tickets)
- #175 - Campaign entity
- #176 - User entity
- #177 - Donation entity
- #178 - Kiosk entity
- #179 - Organization entity

### Phase 4: Features (5 tickets)
- #180 - Auth features
- #181 - Campaign features
- #182 - Donation/payment features
- #183 - Admin features
- #184 - Kiosk features

### Phase 5: Widgets (3 tickets)
- #185 - Navigation widgets
- #186 - Admin widgets
- #187 - Campaign widgets

### Phase 6: Pages (4 tickets)
- #188 - Public pages
- #189 - Auth pages
- #190 - Campaign pages
- #191 - Admin pages

### Phase 7: App (3 tickets)
- #192 - App providers
- #193 - React Router setup
- #194 - Refactor App.tsx

### Phase 8: Cleanup (3 tickets)
- #195 - Remove old structure
- #196 - Add unit tests
- #197 - Final documentation

---

## 📋 Migration Checklist (Copy for Each Ticket)

```markdown
## Pre-work
- [ ] Assigned to myself
- [ ] Read issue description
- [ ] Understand dependencies
- [ ] Create feature branch: `fsd-phase-X-[issue-number]`

## Implementation
- [ ] Complete all tasks in issue
- [ ] Follow slice structure (ui/, model/, api/, index.ts)
- [ ] Create public API exports
- [ ] Update all imports across codebase

## Quality
- [ ] Run `npm run build` - builds successfully
- [ ] Run `npm run lint` - no errors
- [ ] Manual testing - no broken functionality
- [ ] Add/update tests (if applicable)

## PR
- [ ] Create PR referencing issue number
- [ ] PR description includes what changed
- [ ] Request code review
- [ ] Address review comments
- [ ] Merge after approval

## Cleanup
- [ ] Close issue after merge
- [ ] Delete feature branch
- [ ] Update milestone progress
```

---

## 🔍 Common Tasks

### Creating a New Entity

```typescript
// 1. Create structure
entities/my-entity/
├── ui/
│   └── MyEntityCard.tsx
├── model/
│   ├── types.ts
│   └── useMyEntity.ts
├── api/
│   └── getMyEntity.ts
└── index.ts

// 2. Define types
// model/types.ts
export interface MyEntity {
  id: string;
  name: string;
}

// 3. Create API
// api/getMyEntity.ts
import { db } from '@/shared/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export const subscribeToMyEntities = (callback) => {
  return onSnapshot(collection(db, 'my-entities'), callback);
};

// 4. Create hook
// model/useMyEntity.ts
import { useState, useEffect } from 'react';
import { subscribeToMyEntities } from '../api/getMyEntity';

export const useMyEntity = () => {
  const [entities, setEntities] = useState([]);
  
  useEffect(() => {
    return subscribeToMyEntities((snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setEntities(data);
    });
  }, []);
  
  return { entities };
};

// 5. Export via index
// index.ts
export { MyEntityCard } from './ui/MyEntityCard';
export { useMyEntity } from './model/useMyEntity';
export type { MyEntity } from './model/types';
```

### Creating a New Feature

```typescript
// 1. Create structure
features/do-something/
├── ui/
│   └── DoSomethingForm.tsx
├── model/
│   └── useDoSomething.ts
└── index.ts

// 2. Implement logic in model
// model/useDoSomething.ts
import { useMyEntity } from '@/entities/my-entity';

export const useDoSomething = () => {
  const { entities } = useMyEntity();
  
  const handleAction = async () => {
    // Feature logic here
  };
  
  return { handleAction };
};

// 3. Create UI
// ui/DoSomethingForm.tsx
import { useDoSomething } from '../model/useDoSomething';

export const DoSomethingForm = () => {
  const { handleAction } = useDoSomething();
  return <form onSubmit={handleAction}>...</form>;
};

// 4. Export
// index.ts
export { DoSomethingForm } from './ui/DoSomethingForm';
```

---

## 🚫 Common Mistakes to Avoid

### ❌ Don't Import from Internal Paths
```typescript
// BAD
import { useCampaigns } from '@/entities/campaign/model/useCampaigns';

// GOOD
import { useCampaigns } from '@/entities/campaign';
```

### ❌ Don't Import Upward
```typescript
// BAD - entities importing from features
import { CreateCampaignForm } from '@/features/create-campaign';

// GOOD - features import from entities
import { Campaign } from '@/entities/campaign';
```

### ❌ Don't Skip Public APIs
```typescript
// BAD - no index.ts, direct imports
import { Something } from './ui/Something';

// GOOD - barrel export via index.ts
// index.ts
export { Something } from './ui/Something';
```

### ❌ Don't Mix Old and New Structure
```typescript
// BAD - mixing old imports with new
import { getCampaigns } from '@/api/firestoreService';
import { useCampaigns } from '@/entities/campaign';

// GOOD - all new structure
import { useCampaigns } from '@/entities/campaign';
```

---

## 🔄 Migration Status Commands

```bash
# View all FSD tickets
gh issue list --milestone "Full FSD Refactoring"

# View tickets by phase
gh issue list --label "fsd-phase-1"
gh issue list --label "fsd-phase-2"
# ... etc

# View your assigned tickets
gh issue list --assignee @me --milestone "Full FSD Refactoring"

# Create a branch for a ticket
gh issue view 169 --web  # Open in browser
git checkout -b fsd-phase-1-169

# Mark ticket as complete
gh issue close 169
```

---

## 🎨 VS Code Tips

### Recommended Extensions
- ESLint
- Prettier
- Path Intellisense
- Auto Import
- GitLens

### Path Aliases (already configured in tsconfig)
```json
{
  "@/app": ["./src/app"],
  "@/pages": ["./src/pages"],
  "@/widgets": ["./src/widgets"],
  "@/features": ["./src/features"],
  "@/entities": ["./src/entities"],
  "@/shared": ["./src/shared"]
}
```

### Search and Replace Tips
When migrating, use VS Code's find/replace:
- `Cmd+Shift+F` - Search in all files
- Use regex for complex replacements
- Preview changes before applying

---

## 📞 Need Help?

1. **Check the issue description** - Most questions answered there
2. **Read FSD docs** - https://feature-sliced.design/
3. **Ask in PR comments** - Tag reviewers
4. **Team sync** - Discuss in daily standup
5. **Update this doc** - Add learnings for others

---

**Remember:** Take it one phase at a time. Don't rush. Quality over speed! 🎯
