## TestMancer delivery plan (balanced frontend-backend TODOs + ready-to-use prompts)

This is a sequenced plan to ship your requested features: undergraduate onboarding (university/faculty/level), course visibility by audience, admin content authoring with pages + audio/video via Cloudinary, quizzes per page or end-of-course, gems/leaderboards, games, and dashboard category selection (Post‑UTME/JAMB/WAEC/Undergrad).

Each milestone includes BOTH backend and frontend components that can be tested together. Execute tasks top‑down for iterative testing.

---

### M0. Baseline cleanup and guardrails

**Backend:**
- [ ] Normalize category naming across backend and frontend (e.g., `postutme` vs `post-utme`)
- [ ] Add `role` to `User` (user/admin) and protect admin routes
- [ ] Ensure Cloudinary config present and env keys loaded

**Frontend:**
- [ ] Update category constants to match normalized backend names
- [ ] Add admin role checking in AuthContext
- [ ] Create admin-only route protection component

Acceptance
- **Consistent categories**: Same strings in `User.learningCategories` and `Course.learningGoals`
- **Admin security**: Admin-only routes return 403 for non-admin users, frontend shows proper access control
- **Cloudinary**: `/api/health` OK and sample upload route returns secure URL

Prompt
```text
Implement M0 baseline: normalize learning goal names across `User` and `Course` (pick: waec, jamb, postutme, toefl, ielts, undergraduate), add `role` field to `User` with default `user`, create `requireAdmin` middleware, wire it to future admin routes, and verify Cloudinary config loads from env. Update frontend category constants and add admin role checking in AuthContext. Provide minimal migration script for existing docs.
```

---

### M1. Undergrad onboarding fields and selection

**Backend:**
- [ ] Extend User model with undergraduate fields: `isUndergraduate`, `university`, `faculty`, `level`
- [ ] Update user profile API to persist undergraduate data
- [ ] Add validation for undergraduate pathway selection

**Frontend:**
- [ ] Extend onboarding flow to capture undergraduate details (university/faculty/level)
- [ ] Add dashboard pathway selector component with undergraduate option
- [ ] Update AuthContext to handle undergraduate profile data
- [ ] Create institution/faculty/level selection components

Acceptance
- **Onboarding**: New undergraduate steps appear; submit saves to user profile and shows success
- **Dashboard**: Users can switch between pathways; selector persists across sessions
- **Validation**: Required undergraduate fields validated; pathway switching works immediately

Prompt
```text
Add undergraduate onboarding: extend User model with `isUndergraduate`, `university`, `faculty`, `level` fields and update profile API. Update React onboarding flow to collect undergraduate details with form validation; store in `AuthContext` and persist via users API. Add a dashboard pathway selector that switches between postutme/jamb/waec/undergraduate and filters content accordingly. Include loading states and error handling.
```

---

### M2. Course audience targeting and content structure

**Backend:**
- [ ] Update `Course` model with audience fields: `audience.universities[]`, `audience.faculties[]`, `audience.levels[]` (all optional)
- [ ] Introduce `Module.pages[]` where each page has: `title`, `order`, `html`, `audioUrl?`, `videoUrl?`, `attachments[]?`
- [ ] Keep existing `modules` semantics; add `pages` within modules for fine-grained delivery
- [ ] Create migration script to backfill existing courses

**Frontend:**
- [ ] Update CourseDetail page to display pages within modules
- [ ] Create PageViewer component to show page content with media support
- [ ] Update course APIs to handle new page structure
- [ ] Add page navigation controls (previous/next)

Acceptance
- **Schema**: New fields exist with indexes for audience filtering
- **Data**: Old documents remain valid; empty `pages` allowed
- **UI**: Course pages display correctly with media; navigation works

Prompt
```text
Extend backend models: add audience targeting to `Course` (universities/faculties/levels) and introduce `pages` array inside `moduleSchema` (title, order, html/content, audioUrl, videoUrl, attachments). Create indexes for fast filtering and a migration script to backfill defaults. Update frontend CourseDetail page to display pages within modules with PageViewer component, media support, and navigation controls. Do not break existing API responses.
```

---

### M2.5 Advanced Role Management and Permissions

- [x] Extend `User` model with granular roles: `admin` (full access), `subadmin` (faculty-restricted), `waec_admin`, `jamb_admin`
- [x] Add role assignments: for subadmins include `assignedUniversities[]`, `assignedFaculties[]`, `assignedLevels[]`; for category admins include specific permissions
- [x] Create permission middleware that checks role + assignments before allowing course operations
- [x] Admin can change user roles via new API endpoints with proper validation
- [x] Add scoped course/quiz APIs for subadmins (only see/manage assigned content)

Acceptance
- **Roles**: Users can be assigned specific roles with faculty/university/level/category restrictions
- **Permissions**: Subadmins can only modify courses for their assigned faculties/universities/levels
- **API**: `/api/admin/users/:id/role` allows role changes with assignment validation
- **Scoped Access**: Subadmins see only courses/quizzes relevant to their assignments

Prompt
```text
Implement advanced role management: extend User model with role types (admin/subadmin/waec_admin/jamb_admin) and assignment fields (universities/faculties/levels for subadmins). Create permission middleware and admin API to update user roles with validation. Add scoped APIs so subadmins can only see/manage courses and quizzes for their assigned universities/faculties/levels, while category admins see only WAEC/JAMB content.
```

---

### M3. Media uploads (audio/mp3 + video) via Cloudinary

**Backend:**
- [ ] Add authenticated admin/subadmin upload endpoints for audio/video
- [ ] Accept `multipart/form-data` with multer; upload to Cloudinary; return secure URL
- [ ] Size/type validation and error handling
- [ ] Role-based access: full admin, subadmins, and category admins (WAEC/JAMB) can upload

**Frontend:**
- [ ] Create MediaUpload component with drag-and-drop for audio/video files
- [ ] Add upload progress indicators and error handling
- [ ] Integrate upload component into admin interfaces (to be built in M9)
- [ ] Update PageViewer to handle uploaded media URLs

Acceptance
- **API**: `POST /api/admin/uploads/audio` and `/video` return secure URLs
- **Validation**: Reject non-media or oversize files with useful errors
- **Permissions**: Subadmins can upload media for use in their scoped courses
- **UI**: Upload component works with progress feedback and error messages

Prompt
```text
Add role-based media upload endpoints using multer + Cloudinary: `/api/admin/uploads/audio` (mp3/m4a/wav) and `/api/admin/uploads/video` (mp4). Validate file types/sizes, use requirePermission('upload_media'), and return `{ url, duration?, bytes }`. Centralize Cloudinary config. Allow full admins, subadmins, and category admins to upload media. Create React MediaUpload component with drag-and-drop, progress indicators, and error handling for admin interfaces.
```

---

### M4. Admin/Subadmin course/page authoring APIs

**Backend:**
- [x] Role-based CRUD for course, module, page (admin/subadmin scoped)
- [x] On page: set text (HTML/Markdown), attach audio/video by URL, set `order`
- [x] Course audience targeting selectors (universities/faculties/levels)
- [x] Subadmin course creation limited to assigned universities/faculties/levels

**Frontend:**
- [x] Create basic admin API testing components (temporary for validation)
- [x] Add admin API service functions to handle CRUD operations
- [x] Create forms for course/module/page creation with audience targeting
- [x] Add validation for role-based permissions in frontend

Acceptance
- **Routes**: `/api/admin/courses` CRUD; nested modules/pages CRUD (scoped by role)
- **AuthZ**: Full admin has full access; subadmins limited to assigned scope
- **Validation**: Subadmins cannot create courses outside their assignments
- **Frontend**: Admin forms can create/edit courses with proper validation

Prompt
```text
Create role-based authoring routes: CRUD for courses (`title, description, learningGoals, category, audience`), modules (`title, description, order, estimatedTime`), pages (`title, order, html, audioUrl, videoUrl`), and quizzes (`courseId, title, questions, trigger, moduleId, pageOrder`). Implement nested REST routes and input validation. Use requirePermission('manage_courses') for scoped access - full admins see all, subadmins see only their assigned universities/faculties/levels. Create React admin API service functions and basic forms for testing CRUD operations with audience targeting and role validation.
```

---

### M5. Quiz authoring and delivery (per page or end-of-course)

**Backend:**
- [ ] Extend `Quiz` model to support `trigger`: `perPage | endOfCourse`, reference `moduleId` and `pageOrder?`
- [ ] Role-based admin quiz authoring (scoped to subadmin assignments)
- [ ] Subadmins can only create quizzes for their assigned courses

**Frontend:**
- [ ] Update Quiz component to show quizzes at correct timing (per-page/end-of-course)
- [ ] Create quiz authoring forms with trigger selection
- [ ] Add quiz insertion logic into course flow (after pages or at course end)
- [ ] Update course progress tracking to handle quiz triggers

Acceptance
- **Authoring**: Role-based quiz creation with scope validation
- **Runtime**: UI routes user to quiz at the right moment (after page or course completion)
- **Permissions**: Subadmins limited to quizzes within their course scope
- **Flow**: Quiz appears at correct points in learning journey

Prompt
```text
Update quizzes: add `trigger` field (`perPage` or `endOfCourse`) and link to `courseId`, optional `moduleId`, optional `pageOrder`. Add role-based admin CRUD for quizzes using requirePermission('manage_courses') and validate subadmins can only create quizzes for their assigned courses. Update React Quiz component to show quizzes at correct timing, create quiz authoring forms with trigger selection, and add quiz insertion logic into course flow with proper progress tracking.
```

---

### M6. Rewards logic (gems)

**Backend:**
- [ ] Award 1 gem per correct answer on the user's first attempt only
- [ ] Award 3 gems upon completing a course (once), not per module (make this configurable)
- [ ] Persist attempts per quiz and prevent duplicate rewards

**Frontend:**
- [ ] Update Quiz component to show gem rewards for correct answers
- [ ] Add course completion detection and reward display
- [ ] Update user profile to show total gems earned
- [ ] Add gem earning animations and feedback

Acceptance
- **First-attempt only**: Subsequent attempts do not earn per-question gems
- **Course completion**: On first full completion, +3 gems and idempotent
- **UI**: Gems appear in real-time with visual feedback

Prompt
```text
Adjust rewards: track attempts per quiz in `quizHistory` and award 1 gem per correct answer only on the first attempt. Add course-completion detection (all modules/pages done) and award +3 gems exactly once per course. Update React Quiz component to show gem rewards, add course completion detection with reward display, update user profile to show total gems, and add gem earning animations and feedback. Provide idempotent APIs and unit tests for edge cases.
```

---

### M7. Personalized course listing by audience

**Backend:**
- [x] Filter courses by user pathway and audience (university/faculty/level)
- [ ] Add audience filtering to personalized courses endpoint

**Frontend:**
- [ ] Update Dashboard to use personalized endpoint with user profile data
- [ ] Add loading states while fetching personalized courses
- [ ] Show empty states when no courses match user's audience
- [ ] Update course list when user switches pathways

Acceptance
- **API**: `/api/courses/personalized` returns only allowed courses
- **UI**: Dashboard list updates with profile/pathway changes
- **Filtering**: Courses filter correctly by university/faculty/level

Prompt
```text
Implement audience filtering: update personalized courses endpoint to include `audience` filters (university/faculty/level) in addition to `learningCategories`. Add indexes and tests. Wire frontend dashboard to the updated endpoint with loading states, empty states, and automatic updates when user switches pathways.
```

---

### M8. Leaderboards (university, faculty, level)

**Backend:**
- [ ] Aggregate user gems and quiz scores segmented by university/faculty/level
- [ ] Endpoints for each leaderboard with pagination
- [ ] Expose user rank in `GET /api/users/me`
- [ ] Role-based access: subadmins can only view leaderboards for their assignments

**Frontend:**
- [ ] Update Leaderboard page to show segmented leaderboards (university/faculty/level)
- [ ] Add user rank display in dashboard/profile
- [ ] Create leaderboard components with pagination
- [ ] Add loading states and empty states for leaderboards

Acceptance
- **APIs**: `/api/leaderboard/university`, `/faculty`, `/level` with rank and neighbors
- **Performance**: Indexed and paginated
- **Permissions**: Subadmins see only leaderboards for their assigned segments
- **UI**: Leaderboards display correctly with user ranks and pagination

Prompt
```text
Add segmented leaderboards: create endpoints to rank users by gems within university/faculty/level segments. Return user's current rank and top N. Ensure MongoDB indexes and efficient aggregation. Add role-based filtering so subadmins can only access leaderboards for their assigned universities/faculties/levels. Update React Leaderboard page to show segmented leaderboards, add user rank display in dashboard/profile, and create leaderboard components with pagination and loading states.
```

---

### M9. Admin dashboard (frontend)

**Backend:** (APIs from M4-M5)
- [ ] Ensure all admin CRUD APIs are ready (courses, modules, pages, quizzes)

**Frontend:**
- [ ] Admin UI to create/edit courses, modules, pages
- [ ] Upload media to Cloudinary and attach to pages (integrate M3 MediaUpload)
- [ ] Create quizzes and set triggers; assign audience scope
- [ ] Subadmin dashboard scoped to assigned universities/faculties only
- [ ] Role-based UI restrictions (subadmins can't manage users, only content)
- [ ] Add user role management interface (for full admins)

Acceptance
- **Flows**: Course -> Modules -> Pages (with media) and Quizzes
- **Validation**: Required fields; reorder via drag/drop preferred
- **Scoped Access**: Subadmins see only their assigned content; category admins see only WAEC/JAMB
- **User Management**: Full admins can change user roles

Prompt
```text
Build React admin dashboard with role-based access: full admin sees all content and user management, subadmins see only courses/quizzes for their assigned universities/faculties, category admins (WAEC/JAMB) see only relevant content. Include create/edit flows for Courses, Modules, Pages, and Quizzes with media upload integration (M3 MediaUpload component) and audience targeting. Add user role management interface for full admins only.
```

---

### M10. Learner dashboard updates

**Backend:** (APIs from M6-M8)
- [ ] Ensure progress tracking and leaderboard APIs are ready

**Frontend:**
- [ ] Show rank and gems; link to segmented leaderboards
- [ ] Course progress by modules/pages; quick resume next page
- [ ] Category selector (Post‑UTME/JAMB/WAEC/Undergrad)
- [ ] Personalized course filtering by user's university/faculty/level profile
- [ ] Add progress indicators and completion badges
- [ ] Create "Continue learning" CTA functionality

Acceptance
- **Rank**: Visible rank and delta with leaderboard links
- **Progress**: Next-action CTA works and shows progress indicators
- **Personalization**: Courses filtered by audience (university/faculty/level)
- **Navigation**: Smooth course resumption and progress tracking

Prompt
```text
Enhance learner dashboard: add rank + leaderboard entry points, show personalized courses with progress and a "Continue learning" CTA to the next page or quiz as configured. Add and persist category selector. Ensure courses are filtered by user's audience profile (university/faculty/level) in addition to learning categories. Add progress indicators, completion badges, and smooth course resumption functionality.
```

---

### M11. Games section (earn gems via course-tied games)

**Backend:**
- [ ] Create lightweight game registry (title, course link, rules, max gems)
- [ ] API to record game results and gems (with anti-abuse basics)
- [ ] Role-based game management: subadmins can only manage games for their courses

**Frontend:**
- [ ] Add games hub page and placeholder mini-game route
- [ ] Create game components with gem earning feedback
- [ ] Add games section to dashboard navigation
- [ ] Integrate game results posting and gem rewards

Acceptance
- **Hub**: Games listed and gated by course with proper navigation
- **Rewards**: Gems awarded per rules; rate limited with visual feedback
- **Permissions**: Subadmins limited to games within their course scope
- **Integration**: Games accessible from dashboard with results tracking

Prompt
```text
Introduce a games module: minimal backend model and endpoints to register games and record results; guard with basic rate limiting. Add role-based game management where subadmins can only create/manage games tied to their assigned courses. Frontend: games hub page and a placeholder mini-game that reads course context and posts results for gems, with proper navigation and gem earning feedback.
```

---

### M12. Seeds, tests, and migration scripts

**Backend:**
- [ ] Replace placeholder `npm run seed` with real seeders (universities, faculties, levels, sample courses/quizzes)
- [ ] Add unit/integration tests for rewards, leaderboards, and role permissions
- [ ] One-time migration scripts for schema changes (including role assignments)
- [ ] Seed sample subadmin users with different assignment scopes

**Frontend:**
- [ ] Create end-to-end test scenarios for complete user journeys
- [ ] Add integration tests for admin dashboard workflows
- [ ] Test onboarding to course completion flow
- [ ] Verify role-based UI restrictions work correctly

Acceptance
- **Seed**: One command populates a working demo with role-based content
- **CI-ready**: Tests cover critical flows including permission validation
- **Demo**: Sample subadmins can test scoped access to content
- **E2E**: Complete user journeys work from onboarding to course completion

Prompt
```text
Implement seeds and tests: create seed scripts for institutions, sample content, and role-based users (admin, subadmins with different scopes, category admins). Write Jest tests for quiz rewards (first-attempt only), segmented leaderboard aggregation, and role-based permission validation. Provide migration scripts for new fields including role assignments. Add React end-to-end test scenarios for complete user journeys, admin dashboard workflows, and role-based UI restrictions.
```

---

### M13. Deployability and quality

**Backend:**
- [ ] Env docs for Cloudinary and OAuth
- [ ] Rate limiting and input validation for all admin/subadmin endpoints
- [ ] Role-based security validation and audit logging

**Frontend:**
- [ ] Error states and toasts throughout the application
- [ ] Loading states and skeleton screens
- [ ] Comprehensive error boundaries and fallback UI
- [ ] Accessibility improvements and keyboard navigation

Acceptance
- **Docs**: README updated with env keys and run books
- **Resilience**: Graceful failures throughout with proper error messages
- **Security**: Role-based access control validated and logged
- **UX**: Smooth error handling, loading states, and accessibility

Prompt
```text
Harden and document: add rate limiting to admin/subadmin routes, comprehensive Joi validation, and update README with env variables and run instructions for media and OAuth. Add role-based security validation, audit logging for admin actions, and improve frontend error handling with toasts, loading states, error boundaries, and accessibility improvements.
```

---

## Quickstart commands

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```

## Notes on current codebase alignment

- `User.learningCategories` uses `post-utme` in places; `Course.learningGoals` uses `postutme` (no hyphen). Normalize per M0.
- Module completion currently adds 3 gems; your requirement says 3 gems for completing a course. Align in M6 (or make configurable).
- Media hosting via Cloudinary is configured; add admin upload endpoints in M3.

---

When you’re ready, copy a prompt under each milestone into Cursor and I’ll implement it end-to-end.


