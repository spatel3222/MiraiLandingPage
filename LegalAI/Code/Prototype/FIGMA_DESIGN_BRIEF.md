# Figma Design Brief: Mirai Legal OS

## Project Overview
**Product**: Mirai360.ai Legal OS - AI-powered legal workflow platform for boutique law firms
**Target Users**: Lawyers, legal associates, paralegals at small-to-mid sized law firms
**Core Value Prop**: "Build AI Once. Scale Everywhere" - unified platform for Prepare, Research, Create workflows

---

## Brand Identity

### Colors
```
Primary Navy:      #1B365D (headers, primary buttons, key text)
Navy Light:        #405A7A (secondary elements)
Tech Accent:       #2E86C1 (links, highlights, AI elements)
Success Green:     #28B463 (positive indicators, completed states)
Neutral Base:      #FAFBFC (backgrounds)
Professional Gray: #566573 (body text, secondary info)
Warning Amber:     #F39C12 (warnings, pending states)
Danger Red:        #E74C3C (errors, defendant indicators)
Claimant Blue:     #2E86C1 (claimant support visualization)
Defendant Red:     #E74C3C (defendant support visualization)
```

### Typography
- **Primary Font**: Inter (400, 500, 600, 700 weights)
- **Headings**: Inter Bold/Semibold
- **Body**: Inter Regular
- **Size Scale**: 12px (xs), 14px (sm), 16px (base), 18px (lg), 20px (xl), 24px (2xl), 30px (3xl)

### Logo
- Text-based: "mirai360" in Navy Primary + ".ai" in Tech Accent
- Clean, modern, no icon needed

---

## Design System Components

### 1. Cards
```
- Background: White (#FFFFFF)
- Border: 1px solid #E5E7EB
- Border Radius: 12px (xl) or 8px (lg)
- Shadow on hover: 0 8px 24px rgba(27, 54, 93, 0.1)
- Padding: 24px
- Transition: transform translateY(-2px) on hover
```

### 2. Buttons
```
Primary:
  - Background: Navy Primary (#1B365D)
  - Text: White
  - Border Radius: 8px
  - Padding: 10px 20px
  - Hover: 90% opacity

Secondary:
  - Background: White
  - Border: 1px solid #E5E7EB
  - Text: Professional Gray
  - Hover: Gray-50 background

Accent:
  - Background: Tech Accent (#2E86C1)
  - Text: White
  - Use for AI-related actions
```

### 3. Input Fields
```
- Border: 1px solid #E5E7EB
- Border Radius: 8px
- Padding: 12px 16px
- Focus: 2px ring Tech Accent/20, border Tech Accent
- Placeholder: Professional Gray
```

### 4. Tags/Chips
```
- Border Radius: 4px (small) or 8px (medium)
- Padding: 4px 8px (small), 6px 12px (medium)
- Colors: Contextual (green for evidence, red for disputed, blue for timeline, etc.)
- Hover: Scale 1.05
```

### 5. Support Bars (Claimant/Defendant)
```
- Height: 6px
- Border Radius: 3px
- Background: Gray-200
- Fill: Claimant Blue or Defendant Red
- Always show percentage label
```

### 6. Slide Panels
```
- Width: 400px-480px
- Background: White
- Border Left: 1px solid gray-200
- Shadow: XL
- Animation: Slide from right (0.3s ease)
```

### 7. Modals
```
- Centered vertically and horizontally
- Max Width: 500px-600px
- Background overlay: Navy Primary/30 with blur
- Border Radius: 12px
- Shadow: 2XL
```

---

## Screen Specifications

### Screen 1: Lawyer Dashboard (lawyer.html)
**Purpose**: Central hub showing case overview and access to 3 workflows

**Layout**:
- Fixed top nav (64px height)
- Left sidebar (256px width) with case selector
- Main content area with welcome header

**Key Components**:
1. **Case Selector Dropdown** - Top of sidebar, shows current case
2. **Three Framework Cards** (equal width, 3-column grid):
   - PREPARE: Blue gradient icon, links to tabular view
   - RESEARCH: Navy gradient icon, links to AI chat
   - CREATE: Green gradient icon, links to canvas
3. **Case Overview Card** - Summary, document count, team members
4. **Stats Grid** (4 columns): Total docs, Processed, Pending, Chats

**UX Improvements Needed**:
- Consider adding recent activity feed
- Quick actions for common tasks
- Progress indicators for case completion

---

### Screen 2: Prepare - Tabular Review (prepare.html)
**Purpose**: Document organization with AI-generated columns and analysis

**Layout**:
- Full-width table view
- Right slide panel for drill-down
- Modal for adding columns

**Key Components**:
1. **Filter Bar**: Category filters, sort dropdown, search
2. **Document Table**:
   - Checkbox column
   - Document (icon + name + page count)
   - Date
   - Type (colored badge)
   - Summary (truncated, 2 lines)
   - Author
   - Persons mentioned (chips)
   - Support bars (Claimant/Defendant dual bars)
   - Tags
   - AI Column (highlighted background)
   - Action arrow

3. **Add Column Modal**:
   - Column name input
   - Prompt textarea
   - Suggested prompts as clickable chips

4. **Drill-Down Panel**:
   - Document header with icon
   - Support score cards (2-column)
   - AI Analysis section
   - Reasoning steps (numbered)
   - Related documents
   - Tags with add button
   - Open original CTA

5. **Chat Panel** (alternative right panel):
   - Welcome state with suggestions
   - Chat input at bottom

**UX Improvements Needed**:
- Bulk actions toolbar when items selected
- Column reordering via drag
- Keyboard shortcuts for navigation
- Filter by tag/type persistence
- Export table to CSV/Excel

---

### Screen 3: Research - AI Chat (research.html)
**Purpose**: RAG-powered legal research with citation drill-down

**Layout**:
- Left sidebar (288px) for chat history & knowledge base
- Main chat area (centered, max 768px)
- Right slide panel for citations

**Key Components**:
1. **Left Sidebar**:
   - New Conversation button
   - Knowledge Base checkboxes (Case Files, Firm KB, Indian Kanoon, CaseMine)
   - Chat history grouped by date

2. **Welcome State**:
   - Animated AI icon with pulse ring
   - Title + description
   - 4 suggestion cards (2x2 grid): Legal Research, Web Search, Similar Cases, Clause Analysis

3. **Chat Messages**:
   - User bubble: Navy background, white text, right-aligned
   - AI bubble: White background, left-aligned with AI avatar
   - Chain of Thought toggle (show/hide reasoning)
   - CoT section: Amber background, bullet points
   - Citations as clickable chips below answer

4. **Similar Case Cards**:
   - Case name + year
   - Brief description
   - Match percentage badge (green 80%+, amber 70-79%)

5. **Citation Panel**:
   - Relevance score (circular progress)
   - Summary
   - Relevant excerpt (quote block with left border)
   - Reasoning bullets
   - Cross-references

6. **Chat Input**:
   - Textarea with auto-resize
   - Attachment button
   - Send button
   - Agent indicators (ClauseAgent, SimilarCaseAgent, etc.)

**UX Improvements Needed**:
- Voice input option
- Copy/share response
- Pin important messages
- Compare mode (side-by-side documents)
- Incognito mode toggle
- Export conversation

---

### Screen 4: Create - Canvas & Auditor (create.html)
**Purpose**: Document generation with AI assistance and compliance checking

**Layout**:
- Left panel (320px) for evidence/templates
- Main editor (flexible, max 768px content)
- Right slide panel for auditor

**Key Components**:
1. **Left Panel**:
   - Tabs: Evidence | Templates
   - Evidence items with:
     - File icon
     - Name + date
     - Relevance bar (0-100%)
   - Drag hint area
   - Generate Brief / Generate LOD buttons

2. **Document Header**:
   - Editable title
   - Meta info (case, last edited, auto-save status)

3. **Editor Toolbar**:
   - Undo/Redo
   - Bold/Italic/Underline
   - Alignment
   - Lists
   - Run Auditor button (amber)

4. **Editor Content**:
   - Contenteditable area
   - Prose styling
   - Citation links (tech-accent colored)
   - AI Suggestion blocks (inline, with insert/dismiss)

5. **Tone Analysis Bar** (bottom):
   - Claimant % indicator
   - Defendant % indicator
   - Word count + reading time

6. **Auditor Panel**:
   - Circular compliance score (SVG progress ring)
   - Issue count
   - Grouped findings:
     - Passed (green checkmarks)
     - Warnings (amber, expandable cards)
     - Errors (red, with Fix Now button)
   - Auto-Fix All CTA

7. **Generate Modal**:
   - Template dropdown
   - Tone selector (Formal/Neutral/Assertive)
   - Section checkboxes
   - Additional instructions textarea

**UX Improvements Needed**:
- Version history
- Track changes / diff view
- Collaborative editing indicators
- Template library browser
- Word/PDF export options
- Spell check integration
- Readability score

---

## Interaction Patterns

### Animations
```css
/* Card hover */
transform: translateY(-2px);
box-shadow: 0 8px 24px rgba(27, 54, 93, 0.1);
transition: all 0.2s ease;

/* Slide panel */
transform: translateX(100%) → translateX(0);
transition: transform 0.3s ease;

/* Chat bubble appear */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Typing indicator */
@keyframes typingDot {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* Pulse ring (AI icon) */
@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1); opacity: 0.3; }
  100% { transform: scale(0.8); opacity: 0.5; }
}
```

### Micro-interactions
- Checkbox: Smooth check animation
- Tags: Scale 1.05 on hover
- Buttons: Slight press effect
- Links: Underline on hover
- Panels: Escape key to close
- Modals: Click outside to dismiss

---

## Responsive Breakpoints
```
Desktop XL: 1800px+
Desktop:    1200px - 1799px
Tablet:     810px - 1199px
Mobile:     < 810px
```

**Mobile Considerations**:
- Collapsible sidebars
- Bottom sheet instead of side panels
- Stack cards vertically
- Full-width table with horizontal scroll
- Floating action button for common actions

---

## Accessibility Requirements

1. **Color Contrast**: Minimum 4.5:1 for text, 3:1 for large text
2. **Focus States**: Visible focus rings (2px Tech Accent)
3. **Keyboard Navigation**: All interactive elements accessible
4. **Screen Readers**: Proper ARIA labels, semantic HTML
5. **Reduced Motion**: Respect prefers-reduced-motion

---

## Figma Design Deliverables

### Required Screens (in priority order)
1. **Prepare - Tabular View** (most complex, highest priority)
   - Empty state
   - Populated table
   - Drill-down panel open
   - Add column modal

2. **Research - AI Chat**
   - Welcome state
   - Active conversation
   - Citation panel open

3. **Create - Canvas**
   - Editor with content
   - Auditor panel open
   - Generate modal

4. **Dashboard**
   - Full layout with all components

### Component Library
- All buttons (primary, secondary, accent, ghost)
- All input types (text, textarea, select, checkbox)
- Cards (framework, evidence, case)
- Tags (all color variants)
- Support bars
- Tables (header, row, pagination)
- Chat bubbles (user, AI)
- Panels (slide-in)
- Modals
- Navigation (top nav, sidebar)

### Prototype Interactions
- Navigation between screens
- Panel open/close
- Modal open/close
- Hover states
- Active/selected states

---

## Design Inspiration References

### From Legora (app.eu.legora.com)
- Clean tabular interface
- Custom column prompts with AI
- Drill-down sidebar with Answer + Reasoning
- Claimant/Defendant support visualization

### From Ctrl Disputes
- Evidence table with relevance bars
- Case file panel alongside editor
- Professional legal document styling

### General SaaS Inspiration
- Linear.app (keyboard shortcuts, clean tables)
- Notion (editor experience)
- Vercel (dark accents, modern feel)
- Figma (collaborative indicators)

---

## Success Metrics for Design

1. **Usability**: 5-second test - users should understand each screen's purpose immediately
2. **Efficiency**: Common tasks (add column, cite evidence, run auditor) in ≤3 clicks
3. **Trust**: Professional appearance suitable for legal industry
4. **Delight**: Smooth animations that feel responsive, not slow
5. **Scalability**: Design works with 5 documents or 500 documents

---

## Questions for Figma Designer

1. How can we make the support bars (Claimant/Defendant) more intuitive?
2. Should the AI suggestions be inline or in a separate panel?
3. What's the best way to show document relationships in the drill-down?
4. How do we balance information density with readability in the table?
5. Should the chat interface have a compact mode for power users?
