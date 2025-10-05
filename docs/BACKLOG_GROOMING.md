# Swift Cause Web - Backlog Grooming Plan

**Date:** October 5, 2025  
**Total Open Issues:** 18 feature issues  
**Status:** Needs Organization & Detailing

---

## 📊 Current State Analysis

### Issues by Theme:

**1. Gift Aid & UK Compliance (5 issues)**
- #10 - Integrate Gift Aid functionality
- #158 - Create Gift Aid Declaration Form
- #159 - Store & Manage Gift Aid Declarations  
- #160 - Develop HMRC Claim Generation Module
- #150 - Compliance Framework

**2. Recurring Donations & Subscriptions (4 issues)**
- #11 - Design Recurring Donation Flow
- #161 - Create UI for Recurring Donations
- #162 - Integrate Stripe Subscriptions
- #163 - Develop Donor Portal for Subscription Management

**3. Analytics & Reporting (3 issues)**
- #154 - Admin Dashboard - Core Analytics Feature Enhancement
- #156 - Geolocation Data Pipeline & Reporting
- #157 - Implement Geographic and Device Analytics Charts

**4. Email & Notifications (2 issues)**
- #151 - Architect and Build an Asynchronous Email & Notification Microservice
- #152 - Setup Notification Service, Queue, and Webhook for Transactional Emails

**5. Payment Infrastructure (2 issues)**
- #125 - Create functionality for connect accounts to see their express dashboards
- #126 - Add RazorPay SDK for India based payments

**6. Donor Management (1 issue)**
- #153 - Develop a Donor Segmentation Engine and API

**7. UI/UX Improvements (1 issue)**
- #123 - Add skeleton loaders and No data fallback UI

---

## 🎯 Suggested Organization

### Create Epics/Milestones:

1. **Epic: Gift Aid & UK Tax Relief**
   - Priority: HIGH (UK legal requirement)
   - Timeline: 6-8 weeks
   - Issues: #10, #150, #158, #159, #160

2. **Epic: Recurring Donations**
   - Priority: HIGH (Revenue model)
   - Timeline: 4-6 weeks
   - Issues: #11, #161, #162, #163

3. **Epic: Advanced Analytics**
   - Priority: MEDIUM
   - Timeline: 4 weeks
   - Issues: #154, #156, #157

4. **Epic: Email & Notifications**
   - Priority: HIGH (User engagement)
   - Timeline: 3-4 weeks
   - Issues: #151, #152

5. **Feature: Multi-Currency Payments**
   - Priority: MEDIUM
   - Timeline: 2 weeks
   - Issues: #125, #126

6. **Feature: Donor Management**
   - Priority: LOW
   - Timeline: 2 weeks
   - Issues: #153

7. **Improvement: UX Polish**
   - Priority: MEDIUM
   - Timeline: 1 week
   - Issues: #123

---

## ✅ Grooming Actions Needed

### For Each Issue:

1. **Add Detailed Description**
   - User story format
   - Acceptance criteria
   - Technical requirements
   - Dependencies

2. **Update Labels**
   - Epic label
   - Priority label (P0, P1, P2, P3)
   - Type label (Feature, Enhancement, Bug)
   - Team label (Frontend, Backend, Full Stack)

3. **Set Estimates**
   - Story points or time estimates
   - Complexity rating

4. **Identify Dependencies**
   - Blocking issues
   - Related issues
   - External dependencies

5. **Assign Milestone**
   - Q4 2025
   - Q1 2026
   - Future/Backlog

---

## 🏷️ Proposed Label Structure

### Priority Labels:
- `P0-Critical` - Must have, blocking
- `P1-High` - Important for milestone
- `P2-Medium` - Should have
- `P3-Low` - Nice to have

### Epic Labels:
- `epic:gift-aid`
- `epic:recurring-donations`
- `epic:analytics`
- `epic:notifications`
- `epic:payments`

### Size Labels:
- `size:XS` (1-2 days)
- `size:S` (3-5 days)
- `size:M` (1-2 weeks)
- `size:L` (2-4 weeks)
- `size:XL` (1+ month)

### Status Labels:
- `status:needs-design`
- `status:needs-spec`
- `status:ready`
- `status:in-progress`
- `status:blocked`

---

## 📋 Grooming Checklist Template

```markdown
## Issue Grooming Checklist

- [ ] Title is clear and descriptive
- [ ] Description includes user story
- [ ] Acceptance criteria defined
- [ ] Technical approach outlined
- [ ] Dependencies identified
- [ ] Labels assigned (epic, priority, size, type)
- [ ] Milestone assigned
- [ ] Story points/estimate added
- [ ] Related issues linked
- [ ] Design/mockups attached (if applicable)
```

---

## 🎯 Priority Order for Grooming

### Phase 1 (This Week):
1. Gift Aid issues (#10, #158-160, #150) - UK compliance critical
2. Recurring Donations (#11, #161-163) - Revenue impact
3. Email/Notifications (#151-152) - User engagement

### Phase 2 (Next Week):
4. Analytics (#154, #156-157) - Admin needs
5. Payment improvements (#125-126)
6. UI Polish (#123)

### Phase 3 (Later):
7. Donor Management (#153) - Nice to have

---

## 📝 Next Steps

1. **Create Epic Milestones in GitHub**
2. **Create Epic/Priority/Size labels**
3. **Groom issues one by one** (starting with P0/P1)
4. **Break down large issues** into smaller tasks
5. **Schedule sprint planning** based on groomed backlog

---

**Would you like me to:**
1. Start grooming issues one by one with detailed descriptions?
2. Create the label structure and epics?
3. Create a sprint plan based on priorities?
