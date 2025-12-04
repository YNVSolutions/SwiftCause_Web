# FSD Migration Roadmap

**Project Board:** https://github.com/orgs/YNVSolutions/projects/5

---

## 📅 Timeline Overview

This roadmap provides a suggested timeline for completing the FSD migration. Adjust dates based on your team's capacity and priorities.

### Quick Timeline
- **Total Duration:** ~12 weeks (Oct 2025 - Dec 2025)
- **Total Issues:** 29 tickets across 8 phases
- **Target Completion:** December 31, 2025

---

## 🗓️ Phase Schedule

### Phase 1: Foundation & Setup (Week 1-2)
**Duration:** 2 weeks  
**Start:** October 7, 2025  
**End:** October 20, 2025  
**Issues:** #169-171 (3 tickets)

**Tasks:**
- Create FSD folder structure
- Set up ESLint import rules
- Document architecture

**Why 2 weeks?** Foundation is critical and requires careful planning.

---

### Phase 2: Shared Layer (Week 3-4)
**Duration:** 2 weeks  
**Start:** October 21, 2025  
**End:** November 3, 2025  
**Issues:** #172-174 (3 tickets)

**Tasks:**
- Migrate 40+ UI components to `shared/ui`
- Migrate utilities to `shared/lib`
- Create shared types and config

**Why 2 weeks?** 40+ components need careful migration and testing.

---

### Phase 3: Entities Layer (Week 5-7)
**Duration:** 3 weeks  
**Start:** November 4, 2025  
**End:** November 24, 2025  
**Issues:** #175-179 (5 tickets)

**Tasks:**
- Create Campaign entity
- Create User entity
- Create Donation entity
- Create Kiosk entity
- Create Organization entity

**Why 3 weeks?** Core business logic migration + switch to real-time listeners.

**💡 Can be parallelized:** Assign each entity to different developers.

---

### Phase 4: Features Layer (Week 8-10)
**Duration:** 3 weeks  
**Start:** November 25, 2025  
**End:** December 15, 2025  
**Issues:** #180-184 (5 tickets)

**Tasks:**
- Refactor auth features
- Create campaign management features
- Create donation/payment features
- Create admin features
- Create kiosk features

**Why 3 weeks?** Complex business logic and feature extraction.

**💡 Can be parallelized:** Assign feature groups to different developers.

---

### Phase 5: Widgets Layer (Week 11)
**Duration:** 1 week  
**Start:** December 16, 2025  
**End:** December 22, 2025  
**Issues:** #185-187 (3 tickets)

**Tasks:**
- Create navigation widgets
- Create admin dashboard widgets
- Create campaign widgets

**Why 1 week?** Widgets compose existing features/entities.

---

### Phase 6: Pages Layer (Week 11)
**Duration:** 1 week  
**Start:** December 16, 2025  
**End:** December 22, 2025  
**Issues:** #188-191 (4 tickets)

**Tasks:**
- Create public pages
- Create auth pages
- Create campaign pages
- Create admin pages

**Why 1 week?** Pages compose widgets and features.

**💡 Can run parallel with Phase 5.**

---

### Phase 7: App Layer (Week 12)
**Duration:** 1 week  
**Start:** December 23, 2025  
**End:** December 29, 2025  
**Issues:** #192-194 (3 tickets)

**Tasks:**
- Create app providers
- Set up React Router
- Refactor App.tsx

**Why 1 week?** Final integration of all layers.

---

### Phase 8: Cleanup & Testing (Week 12)
**Duration:** 1 week  
**Start:** December 23, 2025  
**End:** December 31, 2025  
**Issues:** #195-197 (3 tickets)

**Tasks:**
- Remove old folder structure
- Add unit tests
- Final documentation

**Why 1 week?** Verification and cleanup.

**💡 Can run parallel with Phase 7.**

---

## 📊 Gantt Chart View

```
Oct     Nov     Dec
|-------|-------|-------|
Phase 1: ███
Phase 2:     ███
Phase 3:         ████████
Phase 4:                 ████████
Phase 5:                         ███
Phase 6:                         ███
Phase 7:                            ███
Phase 8:                            ███
```

---

## 🎯 Milestone Breakdown

### Month 1: Foundation + Shared (Oct 7 - Nov 3)
- ✅ FSD structure created
- ✅ UI components migrated
- ✅ Shared layer complete
- **Progress:** 6/29 issues (21%)

### Month 2: Core Business Logic (Nov 4 - Dec 1)
- ✅ All entities created
- ✅ Real-time listeners implemented
- ✅ Feature extraction started
- **Progress:** 16/29 issues (55%)

### Month 3: Integration + Cleanup (Dec 2 - Dec 31)
- ✅ All features migrated
- ✅ Widgets and pages created
- ✅ React Router integrated
- ✅ Old structure removed
- **Progress:** 29/29 issues (100%)

---

## 👥 Resource Allocation

### Single Developer
- **Total Duration:** 12 weeks full-time
- **Follow phases sequentially**
- Focus on quality over speed

### 2-3 Developers
- **Total Duration:** 8 weeks
- **Phase 1-2:** One developer (sequential)
- **Phase 3:** Parallelize entities (2-3 devs)
- **Phase 4:** Parallelize features (2-3 devs)
- **Phase 5-8:** One developer (integration)

### 5+ Developers
- **Total Duration:** 6 weeks
- **Phase 1-2:** 1-2 developers (sequential)
- **Phase 3:** 5 developers (1 entity each)
- **Phase 4:** 5 developers (feature groups)
- **Phase 5-6:** 2-3 developers (parallel)
- **Phase 7-8:** 1-2 developers (integration)

---

## 📈 Progress Tracking

### Key Metrics

| Metric | Target | How to Track |
|--------|--------|--------------|
| Issues Closed | 29/29 | Milestone progress |
| Test Coverage | > 70% | Run coverage reports |
| Build Success | 100% | CI/CD pipeline |
| Import Violations | 0 | ESLint boundaries |
| Performance | No regression | Lighthouse scores |

### Weekly Check-ins

**Every Monday:**
- Review completed issues
- Update roadmap dates if needed
- Address blockers
- Plan week's work

**Every Friday:**
- Demo completed work
- Update project board
- Document learnings
- Prepare for next week

---

## 🚨 Risk Management

### Potential Delays

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | +2 weeks | Stick to phase checklists |
| Circular dependencies | +1 week | Follow FSD import rules strictly |
| Breaking changes | +1 week | Comprehensive testing per phase |
| Team availability | +2 weeks | Build buffer into timeline |
| Complex refactoring | +1 week | Pair programming for hard parts |

### Buffer Time
- Built-in: 1 week across all phases
- Contingency: Extend Dec 31 deadline if critical

---

## 🎉 Success Criteria

### Phase Completion
Each phase is "done" when:
- ✅ All phase issues closed
- ✅ Build succeeds without errors
- ✅ All tests pass
- ✅ No ESLint violations
- ✅ Code reviewed and merged
- ✅ Documentation updated

### Project Completion
The migration is "done" when:
- ✅ All 29 issues closed
- ✅ Milestone at 100%
- ✅ Old folders deleted
- ✅ > 70% test coverage
- ✅ All pages accessible via URLs
- ✅ Performance benchmarks met
- ✅ Team trained on FSD
- ✅ Documentation complete

---

## 🔄 Adjusting the Timeline

### If Ahead of Schedule
- Add more tests
- Improve documentation
- Refactor for quality
- Add helpful comments

### If Behind Schedule
**Week 1-4:** Catch up in later phases (more buffer)  
**Week 5-8:** Reassess scope, may need to extend  
**Week 9-12:** Focus on MVP, defer nice-to-haves

### Emergency Options
1. **Reduce scope:** Skip Phase 8 tests, add later
2. **Add resources:** Bring in more developers
3. **Extend deadline:** Push to Q1 2026
4. **Pause features:** Focus team on migration

---

## 📋 Setting Up the Roadmap View

### In GitHub Projects:

1. **Open your project:**
   ```
   https://github.com/orgs/YNVSolutions/projects/5
   ```

2. **Create Roadmap View:**
   - Click "+" next to views
   - Select "New view"
   - Choose "Roadmap" layout
   - Name it "Timeline"

3. **Configure Timeline:**
   - Group by: "Phase"
   - Date field: "Start Date" to "Target Date"
   - Color by: "Phase"

4. **Set Dates for Issues:**
   Use the timeline above to set Start/Target dates for each issue.

### Suggested Issue Dates:

**Phase 1 Issues (#169-171):**
- Start: Oct 7, 2025
- Target: Oct 20, 2025

**Phase 2 Issues (#172-174):**
- Start: Oct 21, 2025
- Target: Nov 3, 2025

**Phase 3 Issues (#175-179):**
- Start: Nov 4, 2025
- Target: Nov 24, 2025

**Phase 4 Issues (#180-184):**
- Start: Nov 25, 2025
- Target: Dec 15, 2025

**Phase 5 Issues (#185-187):**
- Start: Dec 16, 2025
- Target: Dec 22, 2025

**Phase 6 Issues (#188-191):**
- Start: Dec 16, 2025
- Target: Dec 22, 2025

**Phase 7 Issues (#192-194):**
- Start: Dec 23, 2025
- Target: Dec 29, 2025

**Phase 8 Issues (#195-197):**
- Start: Dec 23, 2025
- Target: Dec 31, 2025

---

## 🔗 Related Resources

- **Project Board:** https://github.com/orgs/YNVSolutions/projects/5
- **Milestone:** https://github.com/YNVSolutions/SwiftCause_Web/milestone/2
- **Migration Plan:** [FSD_MIGRATION_PLAN.md](./FSD_MIGRATION_PLAN.md)
- **Quick Reference:** [FSD_QUICK_REFERENCE.md](./FSD_QUICK_REFERENCE.md)

---

**Remember:** This timeline is a suggestion. Adjust based on your team's velocity and priorities. Quality over speed! 🎯

**Last Updated:** October 5, 2025
