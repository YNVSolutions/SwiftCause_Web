# Swift Cause Web - Sprint Roadmap

**Created:** October 5, 2025  
**Total Issues:** 18 feature issues  
**Timeline:** Q4 2025 - Q1 2026

---

## 📅 Sprint Overview

### Sprint 1: Gift Aid Foundation (Oct 7 - Oct 20, 2025)
**Focus:** UK Tax Relief Compliance  
**Duration:** 2 weeks  
**Priority:** P1-High

**Issues (3):**
- #158 - Create Gift Aid Declaration Form `[size:M]`
- #159 - Store & Manage Gift Aid Declarations `[size:M]`
- #150 - Compliance Framework `[size:XL]` *(Start only)*

**Goals:**
- Gift Aid form component completed
- Data storage infrastructure ready
- Compliance research completed

**Dependencies:** None - can start immediately

---

### Sprint 2: Gift Aid Integration (Oct 21 - Nov 3, 2025)
**Focus:** Complete Gift Aid Feature  
**Duration:** 2 weeks  
**Priority:** P1-High

**Issues (2):**
- #10 - Integrate Gift Aid functionality `[size:L]`
- #160 - Develop HMRC Claim Generation Module `[size:L]`

**Goals:**
- Gift Aid fully integrated in donation flow
- HMRC claim generation working
- Ready for UK launch

**Dependencies:**
- Requires Sprint 1 completion

---

### Sprint 3: Recurring Donations - Backend (Nov 4 - Nov 17, 2025)
**Focus:** Subscription Infrastructure  
**Duration:** 2 weeks  
**Priority:** P1-High

**Issues (2):**
- #11 - Design Recurring Donation Flow `[size:L]`
- #162 - Integrate Stripe Subscriptions `[size:L]`

**Goals:**
- Recurring donation architecture designed
- Stripe subscription integration complete
- Webhook handlers implemented

**Dependencies:** None (can run parallel with Sprint 1-2)

---

### Sprint 4: Recurring Donations - Frontend (Nov 18 - Dec 1, 2025)
**Focus:** User-Facing Subscription Features  
**Duration:** 2 weeks  
**Priority:** P1-High

**Issues (2):**
- #161 - Create UI for Recurring Donations `[size:M]`
- #163 - Develop Donor Portal for Subscription Management `[size:L]`

**Goals:**
- Recurring donation UI completed
- Donor portal for managing subscriptions
- Full subscription flow tested

**Dependencies:**
- Requires Sprint 3 completion

---

### Sprint 5: Email & Notifications (Dec 2 - Dec 15, 2025)
**Focus:** Communication Infrastructure  
**Duration:** 2 weeks  
**Priority:** P1-High

**Issues (2):**
- #151 - Architect and Build Email & Notification Microservice `[size:XL]`
- #152 - Setup Notification Service, Queue, and Webhook `[size:L]`

**Goals:**
- Asynchronous email service deployed
- Notification queue system operational
- Transactional emails working

**Dependencies:** None (can run parallel)

---

### Sprint 6: Analytics Enhancement (Dec 16 - Dec 29, 2025)
**Focus:** Admin Dashboard Improvements  
**Duration:** 2 weeks  
**Priority:** P2-Medium

**Issues (3):**
- #154 - Admin Dashboard - Core Analytics Feature Enhancement `[size:L]`
- #156 - Geolocation Data Pipeline & Reporting `[size:M]`
- #157 - Implement Geographic and Device Analytics Charts `[size:M]`

**Goals:**
- Enhanced analytics on admin dashboard
- Geographic and device insights
- Better reporting capabilities

**Dependencies:** None

---

### Sprint 7: UX Polish & Payments (Jan 5 - Jan 18, 2026)
**Focus:** User Experience & Payment Options  
**Duration:** 2 weeks  
**Priority:** P2-Medium

**Issues (3):**
- #123 - Add skeleton loaders and No data fallback UI `[size:M]`
- #125 - Connect accounts express dashboard functionality `[size:S]`
- #126 - Add RazorPay SDK for India based payments `[size:M]`

**Goals:**
- Improved loading states across app
- Better empty states
- India payment support

**Dependencies:** None

---

### Sprint 8: Donor Management (Jan 19 - Feb 1, 2026)
**Focus:** Advanced Donor Features  
**Duration:** 2 weeks  
**Priority:** P3-Low

**Issues (1):**
- #153 - Develop a Donor Segmentation Engine and API `[size:L]`

**Goals:**
- Donor segmentation capabilities
- Advanced donor analytics
- Targeted communication support

**Dependencies:** Requires #151, #152 (email service)

---

## 📊 Sprint Distribution

### By Priority:
- **P1-High:** 11 issues (Sprints 1-5)
- **P2-Medium:** 6 issues (Sprints 6-7)
- **P3-Low:** 1 issue (Sprint 8)

### By Epic:
- **Gift Aid:** Sprints 1-2 (5 issues)
- **Recurring Donations:** Sprints 3-4 (4 issues)
- **Email & Notifications:** Sprint 5 (2 issues)
- **Analytics:** Sprint 6 (3 issues)
- **Payments & UX:** Sprint 7 (3 issues)
- **Donor Management:** Sprint 8 (1 issue)

---

## 🎯 Quarterly Goals

### Q4 2025 (Oct - Dec)
**Milestone: Core Revenue Features**

**Must Complete:**
- ✅ Gift Aid fully functional (#10, #150, #158, #159, #160)
- ✅ Recurring donations live (#11, #161, #162, #163)
- ✅ Email service operational (#151, #152)

**Impact:**
- Enable UK tax relief (25% boost on donations)
- Enable subscription revenue model
- Automated donor communication

---

### Q1 2026 (Jan - Mar)
**Milestone: Analytics & Optimization**

**Must Complete:**
- ✅ Enhanced analytics (#154, #156, #157)
- ✅ UX improvements (#123)
- ✅ Multi-currency payments (#125, #126)

**Nice to Have:**
- ⚠️ Donor segmentation (#153)

**Impact:**
- Better insights for decision making
- Improved user experience
- Global payment support

---

## 📈 Resource Planning

### Team Allocation

**2-Developer Team:**
- **Sprint 1-2:** Both on Gift Aid
- **Sprint 3:** Split (1 on recurring backend, 1 on email prep)
- **Sprint 4:** Both on recurring frontend
- **Sprint 5:** Both on email/notifications
- **Sprint 6-8:** Can work in parallel

**3+ Developer Team:**
- **Sprints 1-2:** 2 on Gift Aid, 1 on recurring backend
- **Sprints 3-4:** 2 on recurring, 1 on email
- **Sprints 5-8:** Can parallelize multiple epics

---

## 🚨 Risk Management

### High Risk Items:

**1. Gift Aid Compliance (#150)**
- Risk: Complex UK regulations
- Mitigation: Legal review, HMRC documentation
- Buffer: 1 week additional time if needed

**2. Stripe Subscriptions (#162)**
- Risk: Complex webhook handling
- Mitigation: Thorough testing, staging environment
- Buffer: Extend Sprint 3 if needed

**3. Email Microservice (#151)**
- Risk: Infrastructure complexity
- Mitigation: Use proven queue system (Cloud Tasks)
- Buffer: Can push to Q1 if needed

---

## 📋 Sprint Ceremonies

### Each Sprint:

**Sprint Planning (Day 1)**
- Review sprint goals
- Break down issues into tasks
- Assign ownership
- Identify blockers

**Daily Standups (Every day, 15 min)**
- What did yesterday
- What doing today
- Any blockers

**Mid-Sprint Review (Day 7)**
- Progress check
- Adjust if needed
- Address blockers

**Sprint Demo (Last day)**
- Demo completed features
- Stakeholder feedback
- Celebrate wins

**Sprint Retrospective (Last day)**
- What went well
- What to improve
- Action items

---

## 🎉 Success Metrics

### Per Sprint:
- ✅ All issues completed or carried over
- ✅ No critical bugs introduced
- ✅ All tests passing
- ✅ Documentation updated

### Overall:
- ✅ Q4 2025: Gift Aid + Recurring Donations live
- ✅ 90%+ sprint completion rate
- ✅ Zero high-severity bugs in production
- ✅ Positive stakeholder feedback

---

## 📞 Next Steps

1. **Review this roadmap** with team and stakeholders
2. **Adjust dates** based on team capacity
3. **Start Sprint 1** on October 7, 2025
4. **Setup sprint board** in GitHub Projects
5. **Schedule ceremonies** (planning, standup, demo, retro)

---

**View Issues:**
- Gift Aid Milestone: https://github.com/YNVSolutions/SwiftCause_Web/milestone/3
- Recurring Donations: https://github.com/YNVSolutions/SwiftCause_Web/milestone/4
- Analytics: https://github.com/YNVSolutions/SwiftCause_Web/milestone/5
- Email & Notifications: https://github.com/YNVSolutions/SwiftCause_Web/milestone/6

**Project Board:** https://github.com/orgs/YNVSolutions/projects/1
