## TestMancer Card Artwork Prompts (OpenAI-style)

Use these prompts with your image model (ChatGPT, Gemini, Midjourney, Stable Diffusion). They produce clean, abstract tiles like the OpenAI news cards: pastel gradient fields or simple soft-shape compositions with subtle depth, no text.

General spec for all images:
- Aspect ratio: 16:9 (1600×900) for card headers; also export 1:1 (1024×1024) when needed.
- Style: minimalist, soft gradients, gentle bloom, shallow depth, matte finish.
- Content: abstract only; no logos, no text, no UI.
- Lighting: soft studio, volumetric haze at 5–12%.
- Texture: ultra-fine grain/noise 2–3% to avoid banding.
- Edges: rounded forms, no harsh lines, avoid high-frequency detail.
- Output: webp preferred, high quality.

Color palette tokens (match Tailwind config):
- Primary blues: #60A5FA, #3B82F6, #2563EB
- Emerald/teal: #10B981, #34D399, #14B8A6
- Slate neutrals: #E2E8F0, #CBD5E1, #94A3B8
- Accent (sparingly): #A78BFA (violet), #F59E0B (amber)

---

### Prompt scaffold
Copy this, then fill brackets.

```text
Minimal abstract [tile | background] with soft gradient field and gentle depth.
[one or two] rounded shapes (spheres / blobs / petals) drifting, center-weighted, large scale.
Color palette: [blue primary + emerald secondary + slate highlights].
Lighting: soft studio, subtle bloom, volumetric haze 8%.
Texture: ultra-fine film grain 3% to prevent banding.
Mood: calm, optimistic, clean. No text, no watermark, no logo.
Framing: 16:9, subject centered or slight rule-of-thirds.
Quality: photographic realism not required, keep it illustrative and minimal.
```

Negative cues (append to any prompt):
```
no text, no typography, no watermark, no faces, no hands, no logos, no sharp edges, no clutter, no busy patterns
```

---

### Ready-to-use prompts by use case

1) Brand gradient tile (no shapes)
```text
Minimal gradient background, soft flowing mesh.
Primary blues (#60A5FA→#2563EB) with a hint of emerald haze (#10B981) at 8% opacity.
Very subtle radial glow from top-left, fine grain 2%, gentle vignette 4%.
No shapes, no text, 16:9, web-quality, clean and calm.
```

2) Company/partnership news tile
```text
Abstract collaboration theme: two large overlapping soft spheres, one blue, one slate-neutral,
slight translucency and rim light, soft shadow on gradient background (blue→teal mesh).
Clean composition, central balance, no text or logos, 16:9, subtle bloom.
```

3) Product update tile
```text
Minimal abstract interface vibe: a single rounded rectangle form floating over a blue→slate gradient,
soft shadow, tiny specular on top-right edge, matte finish.
Keep it simple, no glyphs, no text, 16:9, fine grain 3%.
```

4) Safety/ethics tile
```text
Calm safety theme: soft shield-like blob formed by overlapping petals,
emerald→teal gradient on white/silver slate backdrop, volumetric haze 10%.
No text, no symbols, 16:9, minimalist.
```

5) Research/publication tile
```text
Abstract research: layered translucent sheets/panels gently offset, subtle isometric hint,
slate neutrals with a faint blue accent glow, micro-shadow between layers.
No text, minimal detail, 16:9, studio lighting.
```

6) Story/human angle tile
```text
Soft macro bokeh spheres over a pastel gradient (blue→violet), dreamy but minimal,
center-weighted, shallow depth-of-field effect.
No text, 16:9, low contrast, calm.
```

7) Course/subject tiles (abstracted; no icons)
- Mathematics
```text
Mathematics theme as abstract geometry: few rounded shapes suggesting waves/grids,
blue primary with slate accents, minimal, no symbols, 16:9.
```
- English
```text
Language theme abstracted: soft overlapping pages/petals, warm blue→violet tint,
no letters, no text, 16:9, gentle bloom.
```
- Current Affairs
```text
Timely theme abstracted: gentle concentric ripples in blue→teal gradient,
matte finish, no icons, 16:9.
```

8) Leaderboard/achievement tile
```text
Single luminous gem-like blob with subtle internal glow, teal→emerald hues atop a cool slate gradient.
No facets, no realism, keep it soft and minimal, 16:9.
```

---

### Variations and controls

- More/less blur:
  - Add: “increase bloom to 12%, soften edges further”
  - Reduce: “reduce bloom to 4%, slightly crisper edges”

- Composition bias:
  - “place the main shape top-left, negative space bottom-right”
  - “two-thirds placement left, gentle counterbalance glow on right edge”

- Texture:
  - “add ultra-fine film grain 2%” or “make background perfectly clean without visible noise”

---

### Batch generation template
Use this when you need many tiles at once (edit subjects and palettes):

```text
Generate 12 minimalist abstract 16:9 tiles in a consistent style:
- 3 brand gradients (blue primary with tiny emerald haze, no shapes)
- 3 product updates (single rounded rectangle floating, blue→slate)
- 2 safety tiles (emerald→teal petals over white/slate)
- 2 research tiles (layered translucent slabs, slate with blue glow)
- 2 stories tiles (bokeh spheres over blue→violet)
Global rules: no text, no logos, soft studio light, bloom 8–10%, fine grain 2–3%, rounded shapes only, minimalist.
```

---

### Export and naming

- Size: 1600×900 (primary), also export 1024×1024 when needed.
- Format: .webp (preferred) or .jpg (90+ quality).
- Naming: `news-[slug]-1600x900.webp`, `research-[slug]-1600x900.webp`, `story-[slug]-1600x900.webp`.

---

## TestMancer-specific prompts (titled and mapped to features/pages)

Each item below is titled with where it’s used in TestMancer, followed by a ready prompt. All follow the General spec above (16:9, abstract, no text).

### Home — Hero background
Usage: Top hero behind headline on `Home`.
Filename: `home-hero-1600x900.webp`
```text
Minimal brand gradient mesh, blue primary (#60A5FA→#2563EB) with a faint emerald glow (#10B981) at 8%.
Large soft radial from top-left, subtle grid feel, fine grain 2%.
No shapes or text, calm and bright, 16:9.
```

### Home — Feature card tiles
Usage: Feature cards (Why choose TestMancer?).
Filename: `feature-[slug]-1600x900.webp`
```text
Soft abstract tile with one rounded blob on a blue→slate gradient, matte finish, shallow depth.
Keep composition simple and center-weighted. No text, 16:9.
```

### News — Latest news card
Usage: `NewsSection` cards.
Filename: `news-[slug]-1600x900.webp`
```text
Abstract news tile: two overlapping translucent spheres (blue + slate) on blue→teal mesh,
soft rim light and micro-shadow. Minimal and balanced, no text, 16:9.
```

### Stories — User stories card
Usage: `StoriesSection` cards.
Filename: `story-[slug]-1600x900.webp`
```text
Soft macro bokeh spheres over a blue→violet gradient, dreamy but minimal.
Shallow depth, low contrast, clean negative space. 16:9, no text.
```

### Research — Publication card
Usage: `ResearchSection` cards.
Filename: `research-[slug]-1600x900.webp`
```text
Layered translucent panels (slate neutrals) with faint blue accent glow,
slight isometric offset and micro-shadows, studio light. No text, 16:9.
```

### Learning Path — WAEC
Usage: `LearningPathsSection` WAEC tile and path pages.
Filename: `path-waec-1600x900.webp`
```text
WAEC path as abstract: gentle wave geometry and rounded forms,
blue primary with subtle gold-amber accents (#F59E0B) at 8% for warmth.
Minimal, no icons or text, 16:9.
```

### Learning Path — JAMB
Usage: JAMB tiles and pages.
Filename: `path-jamb-1600x900.webp`
```text
JAMB path abstract: crisp layered curves implying preparedness,
blue→teal gradient, slate highlights, calm and focused. No text, 16:9.
```

### Learning Path — Post‑UTME
Usage: Post‑UTME tiles and pages.
Filename: `path-postutme-1600x900.webp`
```text
Post‑UTME path abstract: concentric ripples and a central soft glow,
blue primary with a hint of emerald haze, matte finish, 16:9, no text.
```

### Learning Path — TOEFL
Usage: TOEFL tiles and pages.
Filename: `path-toefl-1600x900.webp`
```text
TOEFL path abstract: overlapping soft “pages/petals” forms suggesting language layers,
cool blue base with gentle violet tint, subtle bloom, no letters or symbols, 16:9.
```

### Learning Path — IELTS
Usage: IELTS tiles and pages.
Filename: `path-ielts-1600x900.webp`
```text
IELTS path abstract: two soft intersecting shapes, warm blue→violet gradient,
low-contrast rim light, clean negative space. No text, 16:9.
```

### Learning Path — Undergraduate
Usage: Undergraduate tiles and pages (audience targeting).
Filename: `path-undergrad-1600x900.webp`
```text
Undergraduate path abstract: layered campus-like slabs (very simplified), slate neutrals with a blue accent glow,
balanced composition, micro-shadows, minimal, 16:9, no text.
```

### Course — Subject tile: Mathematics
Usage: Course grid cards for Math.
Filename: `course-mathematics-1600x900.webp`
```text
Mathematics abstract geometry: smooth waves/grids with rounded intersections,
blue primary with slate accents, matte and minimal, no symbols, 16:9.
```

### Course — Subject tile: English
Usage: Course grid cards for English.
Filename: `course-english-1600x900.webp`
```text
English abstract: overlapping soft pages/petals, blue→violet tone,
no letters, gentle bloom, 16:9.
```

### Course — Subject tile: Current Affairs
Usage: Course grid cards for Current Affairs.
Filename: `course-current-affairs-1600x900.webp`
```text
Current Affairs abstract: concentric ripples on blue→teal gradient,
subtle motion feel, matte finish, no icons, 16:9.
```

### Assessment — Quiz/CA tile
Usage: `Assessment`, `Quiz`, and CA entry cards.
Filename: `assessment-generic-1600x900.webp`
```text
Assessment abstract: a floating rounded rectangle over blue→slate gradient,
tiny specular edge, soft shadow, interface hint without glyphs. No text, 16:9.
```

### Results — Quiz result tile
Usage: `QuizResult` header/card.
Filename: `result-generic-1600x900.webp`
```text
Results abstract: gentle upward arc glow suggesting progress, blue→emerald gradient,
matte finish, clean negative space, 16:9, no text.
```

### Gamification — Gem rewards
Usage: Gem/reward banners and cards.
Filename: `gems-reward-1600x900.webp`
```text
Single soft gem-like blob with internal glow, teal→emerald hues on cool slate gradient,
no facets, minimal and bright, 16:9.
```

### Leaderboard — Rankings tile
Usage: `Leaderboard` header/card.
Filename: `leaderboard-generic-1600x900.webp`
```text
Leaderboard abstract: stepped platforms made of rounded slabs with a soft top glow,
blue primary with teal highlight, subtle depth, no symbols, 16:9.
```

### Resources — Library tile
Usage: `ResourcesPage` cards.
Filename: `resources-generic-1600x900.webp`
```text
Resource library abstract: stacked rounded rectangles with slight offsets,
slate neutrals, soft blue rim light, micro-shadows, no text, 16:9.
```

### Onboarding — Background set
Usage: Onboarding step backgrounds (University, Faculty, Department, Level).
Filename: `onboarding-[step]-1600x900.webp`
```text
Onboarding abstract mesh: very light slate background with a soft blue radial and tiny emerald haze (6–8%),
clean and optimistic, no shapes drawing attention, 16:9.
```

### Auth — Login/Callback background
Usage: `Auth`, `AuthCallback` headers.
Filename: `auth-hero-1600x900.webp`
```text
Minimal brand gradient mesh with soft radial from top-left,
primary blue base and faint emerald tint, extremely clean, 16:9, no text.
```

### Admin — Dashboard panel tile
Usage: Admin panels (Courses, Users, Media, Analytics).
Filename: `admin-[panel]-1600x900.webp`
```text
Admin abstract: neutral slate tiles with a precise blue accent glow,
layered slab motif to imply control panels, micro-shadows, 16:9.
```

### Subadmin — Content management tile
Usage: Subadmin panels (Courses, Assessments, Resources, Media, Analytics).
Filename: `subadmin-[panel]-1600x900.webp`
```text
Subadmin abstract: neutral slate surfaces with soft emerald accent glow,
layered slab motif, minimal depth, clean negative space, 16:9.
```

### Empty state — No data
Usage: Empty lists for courses/resources/leaderboard.
Filename: `empty-generic-1600x900.webp`
```text
Empty state abstract: pale slate gradient with a single soft circle faded into the background,
quiet and neutral, no symbols, 16:9.
```

### Error state — Failure boundary
Usage: Generic error/failed request banners.
Filename: `error-generic-1600x900.webp`
```text
Error abstract: slate base with a very subtle warm amber hint (#F59E0B at 6%) to signal caution,
soft vignette, no icons, keep it calm and minimal, 16:9.
```

