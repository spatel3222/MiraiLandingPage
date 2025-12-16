# Mirai360 Landing Page - Dark Mode Stealth Redesign v2.0

## Working Folder
/Users/shivangpatel/Documents/GitHub/crtx.in/LegalAI/Code/MiraiLandingPage

## Current Phase
Phase 0: Planning Complete - Awaiting User Approval

## Overall Progress
- [x] Phase 0: Planning & Setup
- [ ] Phase 1: Dark Theme + Simplified Structure
- [ ] Phase 2: Waitlist Component (Supabase storage)
- [ ] Phase 3: V1 - Scales of Justice 3D Element
- [ ] Phase 4: V2 - Legal Pillar 3D Element
- [ ] Phase 5: V3 - Gavel 3D Element
- [ ] Phase 6: Animation Selector Dropdown
- [ ] Phase 7: Testing & Deployment

---

## Project Summary

### Objective
Transform mirai360.ai into a modern, dark-mode stealth landing page with:
- 3 interchangeable law-themed 3D elements
- Email waitlist with optional message (Supabase storage)
- Animation library selector (Framer Motion vs GSAP)
- Investor-friendly messaging from pitch deck

### Key Copy (from Pitch Deck)
- **Headline**: "mirai 360° Legal Intelligence"
- **Tagline**: "Agentic Operating System for legal ecosystem"
- **Validation**: "Validated with India's top law firms"
- **Footer**: "Mirai | 未来 | Future"

### Tech Stack
- Vite + React + TypeScript (existing)
- Shadcn UI components (existing)
- Tailwind CSS (existing)
- Framer Motion (existing as `motion`)
- GSAP (to be added for option 2)
- Three.js / React Three Fiber (for 3D elements)
- Supabase (waitlist storage + email trigger)

---

## Phase 1: Dark Theme + Simplified Structure

### Objective
Convert to dark mode, remove feature-revealing sections, create stealth structure.

### Implementation Steps
1. [ ] Create dark theme CSS variables in theme.css
2. [ ] Update App.tsx - remove WhoItsFor, CoreCapabilities
3. [ ] Redesign Hero.tsx with dark gradient background
4. [ ] Add animated text reveal for tagline
5. [ ] Update Footer.tsx for dark theme
6. [ ] Add stealth badge: "In private beta"
7. [ ] Add validation text: "Validated with India's top law firms"

### Files to Modify
- src/styles/theme.css
- src/app/App.tsx
- src/app/components/Hero.tsx
- src/app/components/Footer.tsx

### Success Criteria
- [ ] Page is fully dark mode
- [ ] Only shows: Logo, Tagline, Badge, Validation, Footer
- [ ] No feature details revealed
- [ ] Smooth gradient background

---

## Phase 2: Waitlist Component (Supabase)

### Objective
Create email waitlist with optional message, stored in Supabase with email trigger.

### Implementation Steps
1. [ ] Install @supabase/supabase-js
2. [ ] Create Supabase project (if not exists) or use existing
3. [ ] Create `waitlist` table in Supabase:
   ```sql
   CREATE TABLE waitlist (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email TEXT NOT NULL UNIQUE,
     message TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```
4. [ ] Set up Supabase Edge Function or Database Webhook to email shivang@mirai360.ai on new entry
5. [ ] Create lib/supabase.ts client config
6. [ ] Create WaitlistForm.tsx component
7. [ ] Email input (required) + message textarea (optional)
8. [ ] Add success/error states with animations
9. [ ] Style with glow effect on dark background

### Supabase Email Trigger Options
- **Option A**: Edge Function (serverless, on insert trigger)
- **Option B**: Database Webhook → Zapier/Make → Email
- **Option C**: Supabase Auth magic link (overkill for waitlist)

**Recommendation**: Option B (simplest) or just check Supabase dashboard manually since low volume expected.

### Success Criteria
- [ ] Form captures email + optional message
- [ ] Data saved to Supabase `waitlist` table
- [ ] Shows success confirmation
- [ ] You receive notification (via webhook or manual check)

---

## Phase 3: V1 - Scales of Justice 3D Element

### Objective
Create floating, rotating scales of justice with ambient glow.

### Visual Design
- Metallic gold/bronze material
- Subtle ambient occlusion
- Slow Y-axis rotation
- Blue/purple glow accents

---

## Phase 4: V2 - Legal Pillar 3D Element

### Objective
Create Greek column with circuit/tech lines overlay.

### Visual Design
- White marble base
- Blue glowing circuit lines
- Subtle rotation
- Tech-meets-tradition aesthetic

---

## Phase 5: V3 - Gavel 3D Element

### Objective
Create judge's gavel with energy/aurora effect.

### Visual Design
- Dark wood texture
- Purple/blue aurora effect
- Floating above sound block
- Occasional subtle tap motion

---

## Phase 6: Animation Selector Dropdown

### Objective
Add dropdown to switch between Framer Motion and GSAP animations.

### Options
- Framer Motion (lighter, React-native)
- GSAP (more powerful, complex animations)

---

## Phase 7: Testing & Deployment

### Steps
1. [ ] Test V1, V2, V3 on desktop and mobile
2. [ ] Verify waitlist works correctly
3. [ ] Check performance (3D should not lag)
4. [ ] Update CHANGELOG.md
5. [ ] Git commit and push
6. [ ] Deploy to GitHub Pages

---

## Previous Implementation (v1.0) - ARCHIVED

### Phase 1: PRD Creation (Completed)
- [x] Created PRD with brand guidelines integration
- [x] Matched wording to pitch deck

### Phase 2: Component Development (Completed)
- [x] Hero.tsx - Logo, headline, stealth badge
- [x] WhoItsFor.tsx - Target audience cards
- [x] CoreCapabilities.tsx - 4-column capability grid
- [x] Footer.tsx - Contact, tagline, copyright

### Phase 3: Deployment (Completed)
- [x] GitHub Pages configuration
- [x] Custom domain: https://mirai360.ai

---

*Last Updated: Dec 16, 2025*
*Version: 2.0.0-planning*
