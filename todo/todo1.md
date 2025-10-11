## Goal
Build on existing structured courses system: enhance dashboard course cards with detailed progress bars, expandable unit dropdowns showing completion status and attached quizzes, add 3-gem awards for first-attempt chapter/page completion (separate from quiz gems), and implement fun learning-focused UI with light palette.

---

## Phase 1 — Extend User model for completion gems (building on existing earnedGems) ✅ READY TO START
- [ ] Extend User model to track completion-specific gems
  - Add `completionGems: { courseId: ObjectId, completedUnits: [ObjectId], completedPages: [ObjectId] }[]` (separate from quiz `earnedGems`)
  - Track first-attempt completion awards to prevent duplicates
- [ ] Enhance existing progress tracking
  - Build on current "Learning Progress" system from Phase 9
  - Add detailed progress calculation methods for units/pages

Prompt to run:
"Extend User model with completionGems array (distinct from existing earnedGems for quizzes). Add migration to backfill existing users. Build on current progress tracking from Phase 9."

---

## Phase 2 — Extend backend APIs for completion gems (building on existing quiz APIs) ✅ PENDING
- [ ] Extend existing quiz submission logic
  - Build on Phase 4 quiz APIs and Phase 9 gem system
  - Add completion gem awards alongside existing quiz gems
- [ ] New completion tracking endpoints
  - POST `/api/users/complete-unit` - mark unit complete, award 3 gems if first attempt
  - POST `/api/users/complete-page` - mark page complete, award 3 gems if first attempt
  - GET `/api/users/course-progress/:courseId` - detailed progress with unit/page status
- [ ] Enhanced course APIs
  - Build on existing course detail endpoints from Phase 3
  - Include progress data and quiz attachment info in responses

Prompt to run:
"Extend existing quiz submission and course APIs to include completion gem logic. Add new endpoints for unit/page completion tracking, building on current gem system."

---

## Phase 3 — Transform existing dashboard to interactive course cards ✅ PENDING
- [ ] Enhance existing Dashboard "Learning Progress" from Phase 9
  - Transform current progress display into card-based layout
  - Each card shows: course title, description, detailed progress bar, unit count (e.g., "8 of 12 Chapters completed")
- [ ] Build on existing progress calculation
  - Enhance current unit completion tracking to show detailed percentages
  - Calculate progress based on completed units/pages from existing progress system
- [ ] Card styling preparation
  - Plan fun, light palette (blues, greens, yellows)
  - Prepare for expandable functionality in next phase

Prompt to run:
"Transform existing dashboard learning progress section into interactive course cards, building on current progress tracking from Phase 9."

---

## Phase 4 — Add expandable unit dropdown to course cards (building on existing course detail) ✅ PENDING
- [ ] Extend course cards with expandable functionality
  - Click card to toggle dropdown showing units list (build on existing unit rendering from Phase 8)
  - Smooth expand/collapse animation
- [ ] Unit list with completion status
  - Show each unit with title, completion status, and attached quiz indicator
  - Completed units: green checkmark, visual completion styling
  - Incomplete units: clickable to navigate to first incomplete page
- [ ] Quiz integration in dropdown
  - Show quiz icon next to units with attached quizzes (build on Phase 8 quiz surfacing)
  - Display quiz completion status alongside unit status

Prompt to run:
"Add expandable dropdown to course cards showing units with completion status and quiz attachments, building on existing course detail view from Phase 8."

---

## Phase 5 — Add completion tracking to existing PageViewer ✅ PENDING
- [ ] Extend existing PageViewer from Phase 8
  - Build on current HTML/media display and navigation
  - Track page reading progress and completion
  - Add "Mark as Complete" or "End Chapter" button at bottom of last page
- [ ] Gem award on completion with celebration
  - Award 3 gems when user clicks "End" on first attempt (separate from quiz gems)
  - Show confetti popup congratulating completion and gem award
  - Include celebration animation and gem counter update
  - Prevent duplicate awards using new completionGems tracking
- [ ] Progress synchronization
  - Update backend progress when page/chapter completed
  - Sync with enhanced dashboard progress bars

Prompt to run:
"Extend existing PageViewer with completion tracking, confetti celebration popup, and 3-gem awards for first-attempt completion, building on current page navigation from Phase 8."

---

## Phase 6 — Enhance quiz integration within expandable cards (building on existing quiz system) ✅ PENDING
- [ ] Extend quiz visibility in dropdown
  - Build on existing quiz surfacing from Phase 8
  - Show attached quizzes as sub-items under units in expanded cards
  - Display quiz status and score if completed
- [ ] Seamless quiz flow within cards
  - Click quiz to launch (building on existing "Take Quiz" CTAs)
  - Return to expanded card view after completion
- [ ] Combined progress tracking
  - Unit completion requires both page reading AND quiz completion (if attached)
  - Update progress bars to reflect combined completion status

Prompt to run:
"Enhance existing quiz integration within expandable course cards, building on Phase 8 quiz surfacing and completion rules."

---

## Phase 7 — UI theming and fun learning palette ✅ PENDING
- [ ] Light, fun color scheme
  - Primary: Soft blues (#4A90E2, #7BC9FF)
  - Secondary: Fresh greens (#7ED321, #A8E6CF)
  - Accent: Warm yellows (#F5A623, #FFE066)
  - Background: Very light grays (#F8F9FA, #FFFFFF)
- [ ] Interactive elements
  - Subtle hover animations and micro-interactions
  - Progress bars with gradient fills
  - Celebration animations for gem awards
- [ ] Typography and spacing
  - Playful, readable fonts
  - Generous spacing for breathing room
  - Clear visual hierarchy

Prompt to run:
"Implement fun, light color palette across dashboard, cards, and page viewer. Add micro-animations, gradients, and celebration effects for gem awards."

---

## Phase 8 — Testing and validation ✅ PENDING
- [ ] Unit tests for completion logic
  - Gem award prevention on repeat attempts
  - Progress calculation accuracy
  - Unit/page completion rules
- [ ] Integration tests
  - End-to-end completion flow with gem awards
  - Progress synchronization across components
- [ ] UI tests
  - Card expansion, progress display
  - Gem award animations and feedback

Prompt to run:
"Write comprehensive tests for completion tracking, gem awards, and progress calculation. Include UI tests for card interactions and animations."

---

## Phase 9 — Documentation and optimization ✅ PENDING
- [ ] Update user-facing documentation
  - How completion and gems work
  - Progress tracking features
- [ ] Performance optimization
  - Lazy load course details
  - Cache progress data
  - Optimize animations for smooth UX
- [ ] Accessibility improvements
  - Screen reader support for progress indicators
  - Keyboard navigation for expandable cards

Prompt to run:
"Document completion features for users, optimize performance with lazy loading and caching, and ensure accessibility compliance."

---

## Success Criteria
- [ ] Existing structured courses system enhanced with interactive card-based dashboard
- [ ] Course cards show detailed progress (e.g., "8 of 12 Chapters completed") building on existing progress tracking
- [ ] Clicking cards reveals expandable unit list with completion status and quiz attachments
- [ ] Users earn 3 gems per unit/page completion (first attempt only, separate from quiz gems)
- [ ] Completion celebrations with confetti popup congratulating users and showing gem awards
- [ ] Quiz integration enhanced within expandable cards, building on existing quiz system
- [ ] UI feels fun and inviting with light, colorful palette across enhanced components
- [ ] Progress tracking works accurately across dashboard, cards, and page viewer
- [ ] No duplicate completion gem awards on repeat attempts
- [ ] Backward compatibility maintained with existing course structure and gem systems
