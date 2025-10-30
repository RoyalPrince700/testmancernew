## TestMancer UI Revamp Plan (OpenAI-style)

Goal: A calm, typographic, minimal UI with a shared desktop sidebar and consistent layout, matching OpenAI’s simplicity and polish while fitting TestMancer’s content.

Scope covered:
- Home page
- User Dashboard
- Admin Dashboard
- Subadmin Dashboard
- Shared desktop sidebar and layout
- Color, gradient, and imagery guidance

---

### OpenAI-style parity: visual system and layout rules (mobile + desktop)
Outcome: Achieve the same calm, air-y feel and structure as the reference: big breathable hero, roomy content bands with thin borders, neutral cards with subtle elevation, compact link lists, and clear “View all” affordances across breakpoints.

Layout and rhythm:
- Section spacing baseline: desktop `py-28`, mobile `py-20`.
- Container: reuse `page-container` at `max-w-7xl`; long-reading text capped at `max-w-3xl`.
- Grid density: prefer 1/2/3/4 columns; keep consistent gaps (`gap-8`).
- Surfaces: white or `bg-slate-50` with `border-slate-200`; avoid heavy shadows.
- Radius: `rounded-lg` for tiles; chips/avatars `rounded-full`.
- Links: low-contrast default `text-slate-600 hover:text-slate-900` with no underline until hover.

Typography:
- Display: `Heading h1` uses `tracking-tight`; body copy in `text-slate-600` at `text-lg` or `text-xl`.
- Section headings: concise `Heading h2` + optional one-line subhead.
- Meta text: `text-sm text-slate-500`.

Motion and affordances:
- Entrance: subtle fades/slides; respect `prefers-reduced-motion`.
- Hover: `hover:bg-slate-50` and slight color changes; never scale.
- Focus: `focus-visible:ring-2 ring-primary-400` on interactive controls.

Mobile specifics:
- Header height ~56–60px; hero headline max `text-4xl`.
- Stack grids to single column; images use `aspect-video`.
- Hit targets `min-h-[44px]` and ample spacing between groups.

Desktop specifics:
- Hero centered with lots of white space; constrain text width.
- 2–4 column content bands; uniform tile heights via `min-h-[180px]`.
- Right-aligned "View all" in each section header for scan-ability.

Components to add for parity:
- `SectionHeader.jsx`: title, optional description, right-aligned `viewAllHref`.
- `ArticleCard.jsx`: neutral tile with image/gradient, eyebrow, title, and tiny meta.
- `SkeletonTile.jsx`: gray placeholder with pulse, `aspect-video` by default.
- `FooterNavigation.jsx`: multi-column link lists with tiny uppercase headings.

Prompts to execute:
```
Create frontend/src/components/ui/SectionHeader.jsx with props: title, description, viewAllHref.
Create frontend/src/components/ui/ArticleCard.jsx with props: imageSrc, gradientClass, eyebrow, title, meta.
Create frontend/src/components/ui/SkeletonTile.jsx with animated pulse and aspect-video.
Create frontend/src/components/layout/FooterNavigation.jsx with 4–6 columns of links.
```

Usage patterns:
- Sections begin with `<SectionHeader>` followed by a grid of `<ArticleCard>` or `<Card>`.
- While loading, render `<SkeletonTile>`s to prevent layout shift.

Color and tile guidance:
- Most tiles white or `bg-slate-50` with thin border and no drop shadow.
- Gradient accents sparingly (brand moments): `from-primary-500 to-primary-400` or `from-emerald-500 to-teal-500` at low opacity when under text.
- Images framed with `ring-1 ring-slate-200` and `rounded-lg`.

---

### Step 1 — Design tokens and Tailwind base
Outcome: Establish neutral-first palette, subtle motion, and typography as the backbone.

Actions:
- Enable dark mode via class, add typography/forms/aspect-ratio plugins.
- Add global selection color, antialiasing, and container widths.
- Keep accents minimal; use neutral slate tones for most surfaces.

Prompt to execute:
```
Update frontend/tailwind.config.cjs to:
- Set darkMode: 'class'
- Add plugins: @tailwindcss/typography, @tailwindcss/forms, @tailwindcss/aspect-ratio
- Ensure fontFamily.sans uses "Inter, system-ui, sans-serif"

Update frontend/src/index.css base layer to include:
- html/body: antialiased; selection:bg-primary-200 selection:text-primary-900
- A .container utility: max-w-7xl with px-4 sm:px-6 lg:px-8
```

---

### Step 2 — Shared layout and dynamic desktop sidebar
Outcome: One elegant, collapsible desktop sidebar used across all dashboards; role-specific menus; accessible on all dashboard pages.

Actions:
- Create a shared `DesktopSidebar.jsx` that accepts `role`, `menuGroups`, and `collapsed` state.
- Create `DashboardLayout.jsx` that renders: sticky header, `DesktopSidebar`, and a scrollable main content area.
- Centralize role menus in `frontend/src/config/menus.js` for `user`, `admin`, `subadmin`.
- Update routing so `/dashboard`, `/admin`, `/subadmin` use `DashboardLayout` with role-specific menus.

Prompt to execute:
```
Create:
- frontend/src/config/menus.js (export role-based menu groups with icon refs)
- frontend/src/components/layout/DesktopSidebar.jsx (collapsible, 72px collapsed, 280px expanded)
- frontend/src/components/layout/DashboardLayout.jsx (header + sidebar + main)

Refactor:
- Replace per-page sidebars in components/AdminDashboard.jsx, components/SubAdminDashboard.jsx,
  components/DashboardWithSidebar.jsx to use <DashboardLayout role={role} menu={menus[role]}>
- Keep unique content per role inside the layout.

Router:
- In frontend/src/App.jsx, wrap /dashboard, /admin, /subadmin with DashboardLayout and pass role from useAuth().
```

Design notes:
- Visual style: white surface, hairline borders (border-slate-200), very soft shadows, rounded-lg.
- Hover: subtle bg (`hover:bg-slate-50`), active indicator: thin left/underline bar in accent.
- Icons: outline-style or consistent weight from react-icons; size 18–20.

---

### Step 3 — Home page revamp
Outcome: OpenAI-like hero with a plain, bold headline; minimal copy; subtle gradient mesh background; clean sections.

Actions:
- Standardize spacing using a `Section` component (py-24 on desktop, py-16 on mobile).
- Simplify copy in `HeroSection`, `FeaturesSection`, `LearningPathsSection`, `StatsSection`, `CTASection`.
- Add a subtle gradient mesh + grid background in the hero only.

Prompt to execute:
```
Create frontend/src/components/ui/{Section.jsx,Heading.jsx,Button.jsx,Card.jsx} with a minimal API.
Refactor frontend/src/pages/Home.jsx and components/home/* to use <Section>, <Heading>, <Card>, <Button>.

HeroSection.jsx:
- Replace busy visuals with a large H1 (tracking-tight), concise subhead, single primary CTA.
- Add a radial gradient mesh background (very low opacity) and a faint grid overlay.

FeaturesSection.jsx:
- Use a 3 or 4-card grid, small mono icons, minimal copy (1 sentence per card).

CTASection.jsx:
- One sentence, one CTA. Keep generous spacing.
```

Recommended hero copy:
- H1: "Master exams, enjoy learning."
- Subhead: "Personalized courses, calm design, and instant feedback that keeps you moving."
- Primary CTA: "Start learning free"

---

### Step 3.5 — Home page parity enhancements (like the reference)
Outcome: Add section headers with “View all”, neutral news/stories/research grids, and proper skeletons for a clean, content-forward page.

Actions:
- Prepend `SectionHeader` to Features/Paths/Stats and add new bands for "Latest news", "Stories", and "Latest research" using `ArticleCard` grids.
- Implement `SkeletonTile` placeholders for each grid while loading.
- Ensure each band includes a right-justified `View all` link.

Prompt to execute:
```
Create and wire SectionHeader, ArticleCard, SkeletonTile per the parity Components.
Add a new home band "Latest news" as a 3-up grid using ArticleCard (static data for now).
Add a new band "Stories" and another "Latest research" as 2-up or 3-up grids.
Render SkeletonTile while fetching; swap to ArticleCard when data resolves.
```

Design notes:
- Keep card copy extremely terse (1–2 lines). Use meta lines for dates/categories.
- Maintain equal heights to avoid jagged rows; clamp titles to 2 lines.

---

### Step 4 — User Dashboard revamp
Outcome: Calm overview with cards for progress, recent activity, and quick access—using shared layout and unified card style.

Actions:
- Replace `DashboardWithSidebar`’s bespoke sidebar with `DashboardLayout`.
- Standardize card components for Overview, Courses, Activity, Results.
- Keep motion subtle (fade/slide on entrance) and respect prefers-reduced-motion.

Prompt to execute:
```
Edit components/DashboardWithSidebar.jsx:
- Remove inline sidebar; render children inside <DashboardLayout role="user">.
- Map tabs to routes or query (?tab=) but keep the main content simple, using shared <Card>.
- Ensure cards use consistent padding, border, radius, and soft shadow.
```

---

### Step 5 — Admin Dashboard revamp
Outcome: Shared layout + clear groupings (Management, Insights & System) with clean, compact navigation.

Actions:
- Replace inline sidebar with `DashboardLayout`.
- Keep section headings tiny uppercase inside the sidebar when expanded.
- Use the shared `Card` style for all panels (Courses, Users, Media, Analytics, Settings).

Prompt to execute:
```
Edit components/AdminDashboard.jsx:
- Remove bespoke sidebar; wrap content with <DashboardLayout role="admin" menu={menus.admin}>.
- Replace per-panel wrappers with <Card> and standardized section headings.
```

---

### Step 6 — Subadmin Dashboard revamp
Outcome: Same shell as admin with scoped menu; consistent look across roles.

Actions:
- Replace inline sidebar with `DashboardLayout`.
- Keep groups: Content Management, Insights.

Prompt to execute:
```
Edit components/SubAdminDashboard.jsx:
- Remove bespoke sidebar; render inside <DashboardLayout role="subadmin" menu={menus.subadmin}>.
- Keep mobile bottom nav if desired; desktop uses the shared sidebar.
```

---

### Step 7 — Accessibility and performance
Outcome: WCAG-friendly, fast page loads, and gentle motion.

Actions:
- Ensure contrast AA; add focus rings (focus-visible:ring-2 ring-primary-400).
- Lazy-load below-the-fold images, set width/height to prevent CLS.
- Use reduced motion variants for all animated components.

Prompt to execute:
```
Sweep components for:
- Add aria-labels to icon-only buttons and collapsers.
- Add focus-visible styles on interactive elements.
- Wrap motion.* with reduced motion checks; disable parallax for prefers-reduced-motion.
```

---

### Step 8 — Backgrounds, gradients, and imagery
Outcome: Subtle depth and polish without visual noise.

Reusable backgrounds:
- Grid overlay (very faint):
```css
background-image: linear-gradient(to right, rgba(15,23,42,0.04) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(15,23,42,0.04) 1px, transparent 1px);
background-size: 24px 24px;
```
- Radial mesh (hero):
```css
background: radial-gradient(600px 300px at 20% 0%, rgba(59,130,246,0.12), transparent 60%),
            radial-gradient(500px 250px at 80% 10%, rgba(16,185,129,0.10), transparent 60%);
```
- Noise overlay: ultra-faint PNG over white at 2–3% opacity.

---

### Color and image recommendations per card/section
Use neutrals for most surfaces; reserve accent for highlights.

- Hero (image-gradient):
  - Background: white with radial mesh (blue/teal at 10–12% opacity)
  - Text: slate-900, subhead slate-600
  - CTA primary: primary-600 → hover primary-700; secondary: slate outline

- Feature cards (color fill):
  - Background: slate-50 with border-slate-200
  - Icon chip: gradient from primary-100 to primary-200
  - Hover: bg-slate-100

- Course cards (image-gradient):
  - Background: white with very faint diagonal gradient (from-slate-50 to-white)
  - Progress ring: primary-500; metadata in slate-500

- Stats cards (color fill):
  - Background: white; subtle inner gradient from-slate-50 to-transparent
  - Accents: success-500 for positive, warning-500 for caution

- Admin/Subadmin panel cards (color fill):
  - Background: white; border-slate-200
  - Section headers: tiny uppercase slate-500
  - Active tabs underline: role accent (admin: blue-600, subadmin: green-600)

- CTA band (image-gradient):
  - Background: gradient-to-br from primary-50 to emerald-50 at 6–10% opacity
  - Button: primary solid; optional ghost secondary

- Resource cards (color fill):
  - Background: slate-50; thumbnail with aspect-video and faint gradient overlay

Tailwind class hints:
- Surfaces: `bg-white border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-lg`
- Headings: `tracking-tight text-slate-900`
- Section: `py-24 md:py-28`

---

### File-by-file prompts summary
Use these targeted prompts to implement each area safely.

1) Tailwind and base styles
```
Edit frontend/tailwind.config.cjs: add darkMode:'class' and the three Tailwind plugins.
Edit frontend/src/index.css: add selection styles and a .container utility (max-w-7xl).
```

2) Shared layout + sidebar
```
Create menus at frontend/src/config/menus.js for user/admin/subadmin.
Create frontend/src/components/layout/DesktopSidebar.jsx (collapsible, role-aware, keyboard accessible).
Create frontend/src/components/layout/DashboardLayout.jsx (header + sidebar + main with container).
Update frontend/src/App.jsx to wrap /dashboard, /admin, /subadmin with DashboardLayout using role from useAuth().
Refactor AdminDashboard.jsx, SubAdminDashboard.jsx, DashboardWithSidebar.jsx to remove local sidebars and consume the layout.
```

3) Home page
```
Create ui primitives in frontend/src/components/ui: Section, Heading, Card, Button.
Refactor components/home/* to use the primitives and simplified copy.
Add hero background mesh and grid overlay in HeroSection.jsx using inline styles or utility classes.
```

4) User Dashboard
```
In components/DashboardWithSidebar.jsx, replace the sidebar with <DashboardLayout role="user">.
Keep tabs via query (?tab=), but render content in standardized <Card> components and unify spacing.
```

5) Admin Dashboard
```
In components/AdminDashboard.jsx, remove the bespoke sidebar and wrap content with <DashboardLayout role="admin">.
Use <Card> for panels and keep sidebar groups: Management, Insights & System.
```

6) Subadmin Dashboard
```
In components/SubAdminDashboard.jsx, remove the bespoke sidebar and wrap content with <DashboardLayout role="subadmin">.
Preserve mobile SubAdminBottomNav; use shared desktop sidebar only on md+.
```

7) Accessibility & performance sweep
```
Add aria-labels to icon buttons, focus-visible rings, lazy loading for images.
Wrap motion with prefers-reduced-motion; ensure headings follow a logical hierarchy.
```

---

### QA checklist
- Typography scale consistent across pages (H1/H2/H3 sizes and tracking).
- Sidebar collapse/expand works with keyboard and screen readers.
- Section spacing consistent (py-24 baseline on desktop).
- Cards share the same border, radius, and shadow.
- Gradients are subtle; contrast meets AA.


