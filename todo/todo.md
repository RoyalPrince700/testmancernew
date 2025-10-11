## Goal
Enable subadmins to create structured courses (chapter/module/section/topic based), add hierarchical content pages with media (images/audio/video/links), attach quizzes at unit or page level, award 1 gem per correct answer on first attempt, and surface progress/gems on the user dashboard.

---

## Phase 0 — Baseline audit and alignment ✅ COMPLETED
- [x] Review current admin/subadmin course management UIs and permissions
  - Backend: Confirm `manage_courses` scope and existing routes cover subadmin flows
  - Frontend: Verify `SubAdminCoursesManagement.jsx` vs `CoursesManagement.jsx` feature gaps (no module/page mgmt in subadmin)
- [x] Decide naming for hierarchical unit label
  - Choose one canonical term internally: "unit" with `unitType` set to one of `chapter|module|section|topic`

Prompt to run:
"Scan the codebase to list all places using course modules/pages and outline the delta to support generic units with a `unitType` and page-level quizzes."

---

## Phase 1 — Data model updates (Mongo/Mongoose) ✅ COMPLETED
- [x] Course schema: add structure metadata
  - Add `structure: { unitType: enum('chapter','module','section','topic'), unitLabel: string, unitCount: number }`
  - Keep existing `modules` array but rename in API to `units` (alias in code) or add virtual getters so UI doesn't break
- [x] Module schema: make `content` optional or remove, since pages hold content
- [x] Page schema: already supports `html`, `audioUrl`, `videoUrl`, `attachments` — keep
- [x] Quiz schema: add optional association for page-level triggers
  - Add `moduleId` (exists), add `pageOrder` (number), add `trigger` enum(`unit`,`page`)
- [x] User model: track first-attempt gem awards per question
  - Add `earnedGems: { quizId: ObjectId, questionIds: [ObjectId] }[]` or a `questionGems` map indexed by quizId

Prompt to run:
"Implement model changes: add `course.structure`, relax/remove `module.content`, extend `quiz` with `trigger|pageOrder`, and add `user.earnedGems`. Provide migration script to backfill defaults."

---

## Phase 2 — Migrations and backfill ✅ COMPLETED
- [x] Write migration to set default `structure` on existing courses
  - Default `unitType='module'`, `unitLabel='Module'`, `unitCount = modules.length`
- [x] Remove or null `module.content` in existing documents
- [x] Ensure existing quizzes get `trigger='unit'`

Prompt to run:
"Create a migration script to update existing courses/quizzes to the new structure fields and clean module.content. Run safely with a dry-run flag first."

---

## Phase 3 — Backend APIs (courses/units/pages)✅ COMPLETED
- [ ] Courses
  - POST/PUT: accept `structure.unitType|unitLabel|unitCount`
  - GET: include `structure` in responses
- [ ] Units (formerly modules)
  - Expose routes as `.../units` (keep `modules` routes for backward compatibility with a deprecation warning)
  - Enforce unique `order` per course; return `unitType`/`unitLabel`
- [ ] Pages
  - Keep as-is; ensure create supports `attachments` and optional media URLs
- [ ] Permissions
  - Ensure `validateCourseScope` still applies for subadmin

Prompt to run:
"Add `units` alias endpoints mirrored from `modules` with request/response mapping and deprecation logging on `modules` routes. Update validation to include `structure`."

---

## Phase 4 — Backend APIs (quizzes and attempts)✅ COMPLETED
- [ ] Create quiz
  - Accept `trigger: 'unit'|'page'`, `moduleId` required if unit, `pageOrder` required if page
- [ ] Submit quiz answers
  - Compute gems: 1 gem per correct answer only if user hasn’t previously earned a gem for that question in this quiz
  - Persist results and append newly earned questionIds in `user.earnedGems`
  - Update quiz stats as before
- [ ] Quiz retrieval
  - Filter by course/unit/page; include `trigger` and associations

Prompt to run:
"Update quizzes routes to support page-level linking and first-attempt gem logic using `user.earnedGems`. Provide unit tests for repeat attempts."

---

## Phase 5 — Subadmin UI: Create Course → Structure setup ✅ COMPLETED
- [ ] In `SubAdminCoursesManagement.jsx` create course form
  - Add selector for `Structure Type` (Chapter/Module/Section/Topic)
  - Add `Unit Count` (dropdown 1–100 or free number input with min/max)
  - Send `structure` with course payload
- [ ] After course creation, navigate to a "Manage Units" view for that course

Prompt to run:
"Extend subadmin create-course form with `Structure Type` and `Unit Count`, wiring to backend `structure` fields."

---

## Phase 6 — Subadmin UI: Manage course units and pages ✅ COMPLETED
- [ ] Add a `Manage` action per course to open a detailed manager
  - Units list: show `unitLabel` (e.g., Chapter) and count, with Add/Edit/Delete
  - Create Unit form: `title`, `description`, `order`, `estimatedTime`
- [ ] Pages under a unit
  - Add Page: `title`, `order`, `html` (rich text), optional `audioUrl`, `videoUrl`, `attachments`
  - Reorder pages; delete page
- [ ] Media upload
  - Use existing uploads endpoints via `MediaUpload` or direct URLs

Prompt to run:
"Add a subadmin course manager UI to create/manage Units and Pages (reuse admin manager patterns), showing `unitLabel` dynamically."

---

## Phase 7 — Quiz authoring at unit or page level ✅ COMPLETED
- [ ] In unit view: button "Add Quiz for this [unitLabel]"
  - Opens quiz builder; saves with `trigger='unit'` and `moduleId`
- [ ] In page list item: button "Add Quiz for this Page"
  - Saves with `trigger='page'` and `pageOrder`
- [ ] Indicate quizzes attached to a unit/page; allow edit/delete

Prompt to run:
"Build quiz authoring UI from subadmin manager to attach quizzes at unit or page level with validation."

---

## Phase 8 — User consumption flow and progress ✅ COMPLETED
- [ ] Course detail view
  - Render units according to `unitLabel`
  - Show pages per unit; open Page Viewer
- [ ] Page Viewer
  - Display HTML and media; next/prev navigation
  - If page-level quiz exists, surface ‘Take Quiz’ CTA
- [ ] Unit completion
  - Mark unit completed when all pages are viewed or when passing attached unit-quiz (decide rule; default: when pages all viewed)

Prompt to run:
"Update course detail and page viewer to reflect dynamic unit labels, surface page-level quizzes, and mark completion rules."

---

## Phase 9 — Gems and dashboard updates ✅ COMPLETED
- [ ] Quiz submission UI: show gems earned this attempt vs lifetime
- [ ] Dashboard
  - Add Gems card (current total, recent earned)
  - Add ‘Learning Progress’ by course/unit
  - Optional: show badges/progress streaks

Prompt to run:
"Expose gems on the user dashboard and quiz results view, including per-attempt gems and lifetime total."

---

## Phase 10 — Admin UI parity and deprecation ✅ COMPLETED
- [x] Update `CoursesManagement.jsx` to use dynamic `unitLabel` and `units` endpoints
- [x] Keep `modules` flows working temporarily; add deprecation notice in UI for admins

Prompt to run:
"Refactor admin course manager to use `units` alias and dynamic labels while preserving backward compatibility."

---

## Phase 11 — Validation, permissions, and guardrails ✅ COMPLETED
- [x] Server-side validation for `structure` inputs (min/max unitCount)
- [x] Ensure subadmin cannot exceed scope when creating/updating units/pages/quizzes
- [x] Rate-limit uploads and sanitize HTML content

Prompt to run:
"Tighten Joi schemas for structure and add HTML sanitization + basic rate-limiting on uploads."

---

## Phase 12 — Testing ✅ COMPLETED
- [ ] Unit tests: model changes, quiz gem logic, endpoints
- [ ] Integration tests: subadmin course creation → units/pages → quiz → submission
- [ ] UI tests: critical flows (create course, add unit/page, take quiz)

Prompt to run:
"Author tests for quiz-first-attempt gems and page-triggered quizzes; provide fixtures and mocks."

---

## Phase 13 — Docs and ops
- [ ] Update README for new structure terminology and APIs
- [ ] Write admin/subadmin how-to for structured courses
- [ ] Add migration rollout steps and rollback notes

Prompt to run:
"Draft documentation for admins/subadmins on structured courses, plus migration runbook for deployment."


