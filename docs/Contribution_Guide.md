# 📘 The SwiftCause Intern Contribution Guide

**"Do it once, do it right."**

To maintain the integrity of our codebase and ensure a smooth migration, every intern must adhere to these **Golden Rules**. Violations of these rules will result in immediate PR rejection.

-----

## 1\. Architectural Integrity (The "FSD" Law)

We strictly follow **Feature-Sliced Design (FSD)**. Do not reinvent the wheel; follow the slice structure.

  * **Rule 1.1: Respect the Hierarchy.**
      * **Shared** cannot import from *Entities*.
      * **Entities** cannot import from *Features*.
      * **Features** cannot import from *Widgets*.
      * **Pages** are for composition only (assembling Widgets).
      * *See a violation? Fix it. Do not add to it.*
  * **Rule 1.2: Separation of Concerns (3-Layer Logic).**
      * **UI (View):** Dumb components. They only receive props and render HTML. No complex logic.
      * **Model (State/Logic):** Custom hooks (`useAuth`, `useCampaign`). All business logic lives here.
      * **API (Data):** Dedicated API services. UI components should never call `fetch` or `axios` directly.
  * **Rule 1.3: No Hardcoding.**
      * Never hardcode strings, colors, or magic numbers in components.
      * Use `shared/config` for constants.
      * Use `shared/ui` for reusable base components (Buttons, Inputs).

## 2\. Code Quality & Linting

  * **Rule 2.1: Zero Lint Tolerance.**
      * If the console is red or yellow, you are not done.
      * **Forbidden:** `console.log` in production code.
      * **Forbidden:** `any` type in TypeScript. Use Interfaces or Generics.
  * **Rule 2.2: Permanent Fixes Only.**
      * **"No need to refactor again"**: Do not apply "band-aid" fixes. If you touch a file, leave it cleaner than you found it. We do not want to revisit this issue next week.

## 3\. Workflow & Project Management

  * **Rule 3.1: The Kanban Ritual.**
      * **Before starting:** Drag your issue to **`In Progress`** on the GitHub Board.
      * **During work:** If you are stuck for \>2 hours, comment on the issue asking for help.
      * **After PR:** Drag your issue to **`Review`**.
      * **Merged:** Drag your issue to **`Done`**.
  * **Rule 3.2: Branching Strategy.**
      * **NEVER** commit directly to `main` or `master`.
      * Create a branch from `develop` (or `main` if `develop` doesn't exist).
      * **Naming Convention:**
          * `fix/issue-number-description` (e.g., `fix/265-migrate-dashboard`)
          * `feat/issue-number-description` (e.g., `feat/280-add-login`)

## 4\. The "Perfect PR" Protocol

A Pull Request is not just code; it is a presentation of your work.

  * **Rule 4.1: The PR Template.**
      * Every PR must follow the format below. If it doesn't, it will be closed without review.
  * **Rule 4.2: Evidence is Mandatory.**
      * You must provide a **video** (Loom/Screen recording) showing the feature working or the bug being fixed. Screenshots are allowed only for tiny UI tweaks.

### 📋 Copy-Paste PR Template

```markdown
# 📝 Description

# 🔗 Linked Issue
Closes #

# 📸 Visual Proof (Before vs. After)
| Before | After |
|--------|-------|
| [Insert Image/Video] | [Insert Image/Video] |

# 🧪 Test Cases
1. 
2. 
3. 

# 📝 Additional Notes

# ✅ Intern Checklist
- [ ] **FSD Architecture:** My code strictly follows FSD (Features do not import Widgets, Shared doesn't import Entities).
- [ ] **No Hardcoding:** I have moved all strings/colors/magic numbers to `shared/config` or constants.
- [ ] **Linting:** I have run `npm run lint` locally and there are ZERO errors.
- [ ] ...
```

-----

## 5\. Summary Checklist for Interns

Before you ask for a review, ask yourself:

1.  Did I break the FSD import rules?
2.  Did I leave any `console.log`?
3.  Did I update the Kanban board?
4.  Did I record a video of it working?

