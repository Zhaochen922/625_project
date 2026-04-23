# UI Insight — High-Fidelity Visual Design Specification

## Product Vision
Create a premium, modern SaaS interface for students to evaluate and improve user interfaces with AI. The visual flow must clearly communicate:

**Upload → AI Analysis → Results → Discussion → Improvement**

This specification is intentionally **visual-only** (no code behavior or backend logic).

---

## 1) Global Design Language

### A. Layout System
- **Canvas**: soft light-gray app background with a centered max-width content container.
- **Global container width**: 1280–1360 px on desktop.
- **Outer margins**: 24–32 px.
- **Grid**: 12-column responsive desktop grid.
- **Spacing scale**: 8 px base rhythm (8/12/16/24/32/40/48).

### B. Visual Style
- **Look and feel**: clean, minimal, polished, high-fidelity SaaS.
- **Cards**: white surfaces, 14–18 px corner radius, subtle borders, soft shadows.
- **Shadows**:
  - Resting cards: very soft, low elevation.
  - Hovered cards: slightly stronger elevation and border contrast.
- **Borders**: thin, cool-gray strokes for structure and clarity.

### C. Color System (Light Theme)
- **Primary**: indigo-violet accent for active nav, CTA buttons, links.
- **Background**: cool off-white.
- **Surface**: white.
- **Text**:
  - Primary: deep navy/charcoal.
  - Secondary: muted slate.
- **Semantic labels**:
  - Success/Improvement: soft green chips.
  - Warning/Usability issue: soft red or amber chips.
  - Neutral tags: pale indigo-gray chips.

### D. Typography
- **Style**: modern sans-serif, high readability (Inter/SF-style aesthetic).
- **Scale**:
  - Page title: 44–52 px equivalent visual weight.
  - Section headers: 30–36 px.
  - Card titles: 24–30 px.
  - Body: 18–22 px.
  - Labels/meta: 15–18 px.
- **Weights**: 500–700 for hierarchy, 400–500 for body/supporting text.

### E. Navigation & Interaction Tone
- Top navigation persistent across all pages.
- Active tab marked by:
  - primary color text,
  - thin underline indicator,
  - subtle transition.
- Buttons:
  - Primary: filled gradient/solid primary color, white text.
  - Secondary: white fill with border.
  - Rounded rectangle shape, medium-to-large padding.

---

## 2) Shared Shell (All Pages)

### Top Navigation Bar
- Left: product logo + app name + short subtitle (“AI-Powered UI Analysis”).
- Center: 4 tabs (**Upload, Results, Discussion, Profile**).
- Right: circular avatar (opens dropdown on Profile page state).
- Nav container:
  - white background,
  - bottom border,
  - slight shadow to separate from page canvas.

### Dropdown Menu (from top-right avatar)
- Anchored panel with rounded corners and soft shadow.
- Menu items with icon + text rows:
  - View Profile
  - Settings
  - Notifications
  - Help & Support
  - Log Out
- Clear row spacing and hover highlight states.

---

## 3) Page 1 — Upload Interface

### Page Composition
Use a **two-panel horizontal layout** under the navbar:
- **Left panel (Upload action)**
- **Right panel (Preview)**

### Left Panel: Upload Action Card
- Large title: **“Upload Your UI Screenshot”**.
- Supporting text guiding quality and purpose.
- Central **drag-and-drop zone** with dashed border and large upload icon.
- Inside drop zone:
  - text: “Drag & drop your screenshot here”
  - divider word: “or”
  - secondary button: **“Browse File”**
  - helper text: supported formats + max size.
- Helper tip box below upload zone with icon and concise guidance.

### Right Panel: Preview Card
- Header: **“Preview”**.
- Large image preview area for uploaded screenshot.
- Secondary action button below preview: **“Change File”**.

### Primary Call-to-Action
- Full-width, prominent bottom CTA spanning content width:
  - **“Run AI Analysis”**
  - high-contrast filled primary style.
- Beneath CTA: trust/privacy helper text with security icon.

### Visual Priorities
1. Drag-and-drop area
2. Preview confirmation
3. Run AI Analysis CTA

---

## 4) Page 2 — Analysis Results Interface

### Page Composition
- Top row: page title + short explanatory subtitle.
- Right-aligned utility action: **“Download Report”** button.
- Main content: **two-column comparison layout**.

### Left Column: Usability Issues
- Section title with issue count chip (e.g., “6 Issues Found”).
- Vertical list of issue cards.
- Each issue card includes:
  - warning/problem icon,
  - issue title,
  - short description,
  - principle/category label (e.g., Visibility, Consistency, Hierarchy, Learnability),
  - subtle arrow affordance.
- Soft red/amber accents for issue context.

### Right Column: Improvement Suggestions
- Section title with suggestion count chip.
- Each suggestion card aligned by row with corresponding issue.
- Suggestion card includes:
  - success icon,
  - concise recommendation text,
  - impact chip (e.g., “Impact: High/Medium”),
  - arrow affordance.
- Soft green accents for constructive tone.

### Relationship Cue
- Use visual connectors (horizontal arrows or alignment cues) between corresponding left/right rows.

### Readability Rules
- Maintain generous vertical rhythm between cards.
- Keep line lengths comfortable and scannable.
- Ensure chips/icons are consistent in size and position.

---

## 5) Page 3 — Discussion Interface

### Page Composition
- Header area:
  - page title: **Community Discussion**,
  - short subtitle,
  - right-aligned primary button: **“Create Post”**.

### Controls Row
- Left: filter chips/buttons:
  - **Latest** (active state)
  - **Top Ideas**
  - **All Topics** (dropdown style)
- Right: search bar with icon and placeholder text.

### Main Layout
Use **content + sidebar** split:
- **Left (wider)**: discussion feed cards.
- **Right (narrow)**: community insight cards.

### Discussion Post Card
Each post card contains:
- user avatar,
- post title,
- short preview text,
- metadata row (author, time, topic tag),
- engagement row/icons (comments, likes).

### Sidebar Cards
1. **Top Contributors** card with ranked list and point totals.
2. **Popular Topics** card with clickable tag pills.
3. Link rows (e.g., “View Leaderboard”, “View all topics”).

### Interaction Tone
- Post cards should feel tappable/clickable.
- Filters and tags should have clear active/hover states.

---

## 6) Page 4 — Profile Interface

### Page Composition
- Large profile summary card at top.
- Two equal cards below:
  - **Account Settings**
  - **Change Password**

### Profile Summary Card
Include:
- large circular profile image with small edit-photo icon overlay,
- name + email + role badge,
- stat strip (e.g., analyses run, discussions, helpful votes, member since).

### Account Settings Card
- Form-like fields with clear labels:
  - Full Name
  - Email
  - Bio
- Primary action: **“Save Changes”**.

### Change Password Card
- Fields:
  - New Password
  - Confirm Password
- Visibility toggle icons in each password field.
- Primary action: **“Update Password”**.

### Avatar Dropdown Requirement
- From top-right avatar, show dropdown panel as defined in shared shell.
- Ensure panel overlays naturally and aligns with navigation height.

---

## 7) Component & Spacing Consistency Checklist

### Card Rules
- Radius, padding, border color, and shadow intensity must be consistent across all pages.

### Button Rules
- Primary and secondary button styles must be reused consistently.
- Avoid introducing one-off button styles.

### Form/Input Rules
- Inputs share same height, border radius, border color, and placeholder style.

### Icon Rules
- Use a unified icon family and stroke weight.
- Match icon color to semantic context (primary, success, warning, neutral).

### Spacing Rules
- Keep 24–32 px section spacing.
- Keep 12–16 px spacing inside compact UI clusters.

---

## 8) Motion & Micro-Interaction Direction (Subtle)
- Use understated transitions (150–220ms) for:
  - tab underline movement,
  - card hover elevation,
  - button hover/focus states,
  - dropdown open/close.
- Avoid heavy animation; prioritize clarity and responsiveness.

---

## 9) Accessibility-Forward Visual Guidelines
- Preserve strong text/background contrast for core copy.
- Ensure active states are visible via color + shape/underline, not color only.
- Keep tap targets and control sizes comfortably large.
- Use clear labels, helper text, and semantic cues to reduce cognitive load.

---

## 10) Final Visual Outcome
The UI should feel like a cohesive, production-quality modern dashboard product:
- premium yet calm,
- highly readable,
- card-based and neatly structured,
- with clear flow from upload to improvement through AI insights and peer discussion.
