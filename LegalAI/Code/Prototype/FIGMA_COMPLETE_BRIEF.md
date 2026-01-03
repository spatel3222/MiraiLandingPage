# Mirai Legal OS - Complete Figma Design Brief
## With Customer Journey & Legora Reference Analysis

---

# VERSION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0 | Dec 2, 2024 | Claude | Initial brief - Competitive analysis, Customer journey, Component library |
| v2.0 | Dec 3, 2024 | Claude | Added PART 4: Functional Requirements (13 features, 9 wireframes) |
| v2.1 | Dec 3, 2024 | Claude | Added PART 0: Official Brand Guidelines from Mirai360_Brand_Guidelines_v2.md |
| v3.0 | Dec 3, 2024 | Claude | Added PART 7: Overall User Flow (Onboarding → Prepare → Research → Create) |

---

# TABLE OF CONTENTS

0. [PART 0: Brand Guidelines](#part-0-official-brand-guidelines) (v2.1) ⭐ NEW
1. [PART 1: Competitive Analysis](#part-1-competitive-analysis-from-references) (v1.0)
2. [PART 2: Customer Journey Map](#part-2-complete-customer-journey-map) (v1.0)
3. [PART 3: Component Library](#part-3-component-library) (v1.0)
4. [PART 4: Functional Requirements](#part-4-functional-requirements-for-design) (v2.0)
5. [PART 5: Figma Deliverables Checklist](#part-5-figma-deliverables-checklist) (v1.0)
6. [PART 6: Reference Images](#part-6-reference-images) (v1.0)
7. [PART 7: Overall User Flow](#part-7-overall-user-flow) (v3.0) ⭐ NEW

---

<!-- ═══════════════════════════════════════════════════════════════════════════
     VERSION 2.1 - DECEMBER 3, 2024
     Added Official Brand Guidelines
     Source: /Assets/Brand/Guidelines/Mirai360_Brand_Guidelines_v2.md
═══════════════════════════════════════════════════════════════════════════ -->

# PART 0: OFFICIAL BRAND GUIDELINES

> **Source**: `/Assets/Brand/Guidelines/Mirai360_Brand_Guidelines_v2.md`
> **Version**: Brand Guidelines v2.0 - Professional Authority Minimal Design System

---

## 0.1 Brand Foundation

| Element | Value |
|---------|-------|
| **Company** | Mirai360.ai |
| **Tagline** | "Build AI Once. Scale Everywhere." |
| **Mission** | AI consultation platform enabling boutique law firms to compete with Big Law |
| **Target** | 10-49 lawyer boutique firms in India handling ₹2-10 crore mandates |
| **Design Philosophy** | "Invisible Excellence" - Authority through restraint |

### Brand Personality
- **Empowering** (35%): Levels the playing field for boutique firms
- **Professional** (30%): Enterprise-grade security and reliability
- **Innovative** (25%): Cutting-edge AI tailored for Indian legal context
- **Accessible** (10%): Crawl-walk-run methodology for seamless adoption

---

## 0.2 Logo System

### Primary Logo
- **Standard Version**: `mirai360.ai` or `Mirai360.ai`
- Both lowercase and title case acceptable
- Use `mirai360.ai` 

### Monogram
- **Secondary Mark**: lowercase `m` symbol
- For: Profile images, app icons, favicons
- Minimum size: 16px digital, 0.25" print

### Logo Specifications
```
Primary Logo Minimum Sizes:
- Digital: 120px width
- Print: 1.5" width
- Clear space: 0.5x logo height on all sides

Monogram Minimum Sizes:
- Digital: 24px square
- Print: 0.3" square
```

---

## 0.3 Color Palette

### Primary Authority Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Navy Primary** | `#1B365D` | Authority, Trust, Headers, Primary buttons |
| **Navy Light** | `#405A7A` | Readable text, Accessibility, Hover states |
| **Tech Accent** | `#2E86C1` | Innovation, Progress, CTAs, AI elements |
| **Neutral Base** | `#FAFBFC` | Clean backgrounds, Breathing room |

### Supporting Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Clean White** | `#FFFFFF` | Clarity, Transparency |
| **Success Green** | `#28B463` | Growth, Success metrics, Completed states |
| **Professional Gray** | `#566573` | Balance, Body text, Secondary info |
| **Warning Amber** | `#F39C12` | Warnings, Pending states |
| **Danger Red** | `#E74C3C` | Errors, Defendant indicators |

### Accessibility Standards
- Navy Primary on white: **10.1:1** contrast ratio ✓
- Tech Accent on white: **4.8:1** contrast ratio ✓
- Navy Light on white: **7.2:1** contrast ratio ✓
- All combinations meet **WCAG 2.1 AA** standards

---

## 0.4 Typography

### Font Family
**Primary Font**: Inter (400, 500, 600, 700 weights)
- Modern, professional, highly readable
- Excellent for legal document clarity

### Typography Scale
| Level | Size | Weight | Line Height | Use |
|-------|------|--------|-------------|-----|
| Display | 3.5rem (56px) | 700 | 1.1 | Hero headlines |
| H1 | 2.5rem (40px) | 600 | 1.2 | Section titles |
| H2 | 1.5rem (24px) | 600 | 1.3 | Subsections |
| H3 | 1.25rem (20px) | 500 | 1.4 | Components |
| Body | 1rem (16px) | 400 | 1.6 | Body text |
| Caption | 0.875rem (14px) | 400 | 1.5 | Small text |
| Small | 0.75rem (12px) | 400 | 1.5 | Labels, metadata |

---

## 0.5 Spacing System

### 8px Base Grid (with 40% more white space)
| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 8px | Tight spacing |
| `--space-sm` | 16px | Component spacing |
| `--space-md` | 45px | Section spacing |
| `--space-lg` | 90px | Major sections |
| `--space-xl` | 135px | Hero spacing |

---

## 0.6 Component Standards

### Buttons
- Border radius: 6px (subtle, professional)
- Primary: Navy background, white text
- Secondary: White background, 1px border
- Accent: Tech Accent background (for AI actions)
- Hover: Subtle 0.2s transition, slight lift

### Cards
- Background: White (#FFFFFF)
- Border: 1px solid minimal-border
- Border radius: 12px
- Shadow on hover: 0 8px 24px rgba(27, 54, 93, 0.1)

### Inputs
- Border: 1px solid #E5E7EB
- Border radius: 8px
- Padding: 12px 16px
- Focus: 2px ring Tech Accent/20

---

## 0.7 Brand Voice

### Voice Characteristics
- **Authoritative yet Approachable** (40%)
- **Technical without Jargon** (30%)
- **Success-Oriented** (20%)
- **Culturally Aware** (10%)

### Key Messaging Hierarchy
1. **Level 1**: "Transform Your Legal Practice"
2. **Level 2**: "Enable boutique firms to compete with Big Law"
3. **Level 3**: "Build AI Once. Scale Everywhere."

### Proof Points for Marketing
- 65% average revenue growth
- ₹5 crore deal capability
- 95% AI accuracy
- 50+ active firms
- 94% customer retention

---

## 0.8 Competitive Positioning Visual Cues

| vs Competitor | Our Visual Differentiation |
|---------------|---------------------------|
| **Harvey.ai** | Indian legal system focus, cultural understanding |
| **Lucio.ai** | Complete platform vs. point tools |
| **LexLegis.ai** | Digital twin technology, next-gen intelligence |

---

<!-- ═══════════════════════════════════════════════════════════════════════════
     VERSION 1.0 - DECEMBER 2, 2024
     Initial Design Brief with Competitive Analysis & Customer Journey
═══════════════════════════════════════════════════════════════════════════ -->

# PART 1: COMPETITIVE ANALYSIS FROM REFERENCES

## 1.1 Legora UI Patterns (app.eu.legora.com)

### MS Word Integration (Screenshot 1-2)
- **Right sidebar plugin** inside Microsoft Word
- Shows document title "Mutual Non-Disclosure Agreement..."
- **RYG Progress bar** at top (Red: 9, Yellow: 3, Green: 5)
- **Collapsible clause sections**:
  - Definition of Confidential Information (Red)
  - Exclusions from Confidential Information (Green)
  - Duration of Confidentiality Obligations (Yellow)
  - Use Restrictions (Yellow)
  - Disclosure to Representatives (Red)
  - Return or Destruction (Red)
  - No License or Rights Granted (Red)
  - Remedies for Breach (Yellow)
  - No Warranty for Accuracy (Red)
  - Non-Solicitation of Employees (Red)
- **"Apply all changes"** button at bottom
- **Key Insight**: Inline document review with sidebar compliance panel

### Tabular Review (Screenshot 3-4-5)
- **Left sidebar**: Database browser with search
- **Main table columns**: Document, Date, (custom columns via "Add column")
- **Add column modal**: Format dropdown, Label input, Prompt textarea
- **"Use @ to mention columns"** helper text
- **"AI Generate"** button for column creation
- **Run button** per column to process
- **Chat panel** slides from left with:
  - "New chat" button
  - Suggestion chips: "Extract key points", "Refine the review with more columns", "Add attached documents"
  - Context indicator showing "Tabular Review #63"
  - "Deep think" toggle
- **Key Insight**: Table-first with AI columns, chat as secondary

### Drill-Down Panel (Screenshot 3)
- **Document name** as header (jur1st 1.pdf)
- **"Jump to..."** navigation
- **Answer section**: Shows extracted date "20 Oct 1995"
- **Reasoning section**: Full explanation of how date was determined
- **Key Insight**: Answer + Reasoning pattern is core UX

## 1.2 TrialView UI Patterns (Screenshot 6)

### Left Navigation
- Collapsible sections: EVIDENCE, TRANSCRIPT, APPLICATION, DISCLOSURE, SUBMISSIONS
- **Private Bundles** section
- **Quick Links**: Timelines, Tags, Claimant's Evidence, Defendant's Evidence, Credibility Issues, Honesty
- Action buttons: Present Mode, Search Content, Ask AI, Doc Finder, All Annotations

### Chat Interface
- Search history button
- **Answer format dropdown**: Briefing, Chronology, List, Memo, Table, Free Form
- **"Options"** button for advanced settings
- Inline citations with numbers (1, 2, 3) linking to documents
- **"+1 More"** indicator for additional citations
- **Key Insight**: Multiple answer formats for different use cases

## 1.3 Timeline/Chronology View (Screenshot 7)

### Three-Panel Layout
1. **Left**: Top-level summary with date range
2. **Center**: Expandable event cards with "more detail" buttons
3. **Right**: Granular facts list with timestamps

### Event Card Design
- Date range header (e.g., "February 25, 2017 - March 17, 2025 (8 years)")
- Summary text
- **Exhibits badge** (e.g., "Exhibits 1-65")
- Individual document cards with:
  - Subject line
  - Timestamp
  - Summary
  - Exhibit reference

### Key Insight
- **Hierarchical drill-down**: Summary → Events → Facts → Documents
- Visual timeline with zoom levels

---

# PART 2: COMPLETE CUSTOMER JOURNEY MAP

## Journey Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MIRAI LEGAL OS - CUSTOMER JOURNEY                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ONBOARDING          PREPARE              RESEARCH            CREATE         │
│  ─────────          ───────              ────────            ──────         │
│                                                                              │
│  ┌─────────┐       ┌─────────┐         ┌─────────┐        ┌─────────┐      │
│  │  Login  │──────▶│ Upload  │────────▶│  Chat   │───────▶│ Generate│      │
│  │         │       │  Docs   │         │  Query  │        │  Brief  │      │
│  └─────────┘       └─────────┘         └─────────┘        └─────────┘      │
│       │                 │                   │                  │            │
│       ▼                 ▼                   ▼                  ▼            │
│  ┌─────────┐       ┌─────────┐         ┌─────────┐        ┌─────────┐      │
│  │ Create  │       │ Tabular │         │ Drill   │        │  Audit  │      │
│  │  Case   │       │ Review  │         │  Down   │        │ Review  │      │
│  └─────────┘       └─────────┘         └─────────┘        └─────────┘      │
│       │                 │                   │                  │            │
│       ▼                 ▼                   ▼                  ▼            │
│  ┌─────────┐       ┌─────────┐         ┌─────────┐        ┌─────────┐      │
│  │ Invite  │       │  Add    │         │ Similar │        │ Export  │      │
│  │  Team   │       │ Columns │         │  Cases  │        │  Doc    │      │
│  └─────────┘       └─────────┘         └─────────┘        └─────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2.1 PHASE 1: ONBOARDING & CASE SETUP

### Screen 1.1: Login/Welcome
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                    mirai360.ai                             │
│                                                            │
│              Welcome to Legal OS                           │
│                                                            │
│         ┌────────────────────────────┐                    │
│         │  Email                     │                    │
│         └────────────────────────────┘                    │
│         ┌────────────────────────────┐                    │
│         │  Password                  │                    │
│         └────────────────────────────┘                    │
│                                                            │
│         [       Sign In with SSO      ]                   │
│                                                            │
│              ─── or continue with ───                     │
│                                                            │
│         [Google]  [Microsoft]  [Email]                    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```
**User Goal**: Securely access platform
**Success Metric**: < 30 seconds to dashboard

### Screen 1.2: Case Creation
```
┌────────────────────────────────────────────────────────────┐
│  Create New Case                                      [X]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Case Name *                                               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Netflix Bundling Complaint                            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Case Type                                                 │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Consumer Dispute              ▼                       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Firm Role                                                 │
│  (○) Representing Claimant                                │
│  ( ) Representing Defendant                               │
│  ( ) Neutral/Advisory                                     │
│                                                            │
│  Team Members                                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ [AK] Advocate Kumar (Owner)                      [X] │ │
│  │ [+ Add team member]                                   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│            [ Cancel ]    [ Create Case ]                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```
**User Goal**: Set up case with correct context for AI
**Key Decision**: Claimant/Defendant role affects all AI analysis

### Screen 1.3: Document Upload
```
┌────────────────────────────────────────────────────────────┐
│  ← Netflix Bundling Complaint                              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │                                                    │   │
│  │     ┌───────┐                                      │   │
│  │     │  📁   │                                      │   │
│  │     └───────┘                                      │   │
│  │                                                    │   │
│  │     Drag & drop files here                        │   │
│  │     or click to browse                            │   │
│  │                                                    │   │
│  │     Supports: PDF, DOCX, EML, MSG, TXT, CSV       │   │
│  │     Max 500MB per file                            │   │
│  │                                                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ─── or import from ───                                   │
│                                                            │
│  [Google Drive] [OneDrive] [Dropbox] [Email Inbox]       │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 45%              │
│  Uploading 12 of 25 files...                              │
│                                                            │
│  Recent Uploads                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ✓ Payment Receipt.pdf              2.1 MB   Done    │ │
│  │ ✓ Default Notice Email.eml         156 KB   Done    │ │
│  │ ◐ Credit Report.pdf                4.8 MB   45%     │ │
│  │ ○ Terms of Service.pdf             1.2 MB   Queued  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```
**User Goal**: Get all case documents into system
**AI Action**: Background processing starts immediately

---

## 2.2 PHASE 2: PREPARE (Tabular Review)

### Screen 2.1: Document Table (Main View)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ☰  mirai360.ai        Prepare                    Case: Netflix ▼    [AK]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Document Review                               [Tag] [+ Add Column] [Chat]  │
│  125 documents • Auto-organized                                              │
│                                                                              │
│  Filter: [All] [Evidence] [Correspondence] [Contracts]    Sort: [Date ▼]   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ □ │ Document          │ Date      │ Type    │ Summary         │ Support ││
│  ├───┼───────────────────┼───────────┼─────────┼─────────────────┼─────────┤│
│  │ □ │ 📄 Payment        │ 01 Mar 24 │Evidence │ Payment of £150 │ ████░ 85││
│  │   │    Receipt.pdf    │           │         │ to settle...    │ █░░░░ 15││
│  ├───┼───────────────────┼───────────┼─────────┼─────────────────┼─────────┤│
│  │ □ │ 📧 Default Notice │ 15 Apr 24 │Corresp. │ Default notice  │ █████ 90││
│  │   │    Email.eml      │           │         │ sent to old...  │ █░░░░ 10││
│  ├───┼───────────────────┼───────────┼─────────┼─────────────────┼─────────┤│
│  │ □ │ 📄 Credit         │ 20 May 24 │Report   │ Credit file     │ █████ 95││
│  │   │    Report.pdf     │           │         │ showing def...  │ ░░░░░  5││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Showing 1-25 of 125        [◀] [1] [2] [3] ... [5] [▶]                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```
**User Goal**: Quickly understand document landscape
**Key Interaction**: Click row → opens drill-down panel

### Screen 2.2: Add Column Modal (Legora-inspired)
```
┌────────────────────────────────────────────────────────────┐
│  Add Custom Column                                    [X]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Format                                                    │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Text                                    ▼            │ │
│  └──────────────────────────────────────────────────────┘ │
│  Options: Text | Date | Number | Currency | Yes/No        │
│                                                            │
│  Label *                                                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Key Claims                                            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Prompt *                                                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ What are the main claims or arguments made in this   │ │
│  │ document? Focus on statements that support or        │ │
│  │ contradict the claimant's position.                  │ │
│  │                                                       │ │
│  │ Use @Date to reference other columns                 │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Suggested Prompts                                         │
│  [Extract monetary amounts] [Find key dates]              │
│  [Identify legal citations] [Summarize obligations]       │
│                                                            │
│            [ Cancel ]    [✨ AI Generate ]                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```
**User Goal**: Extract specific info from all documents at once
**AI Action**: Processes all documents with prompt, populates column

### Screen 2.3: Drill-Down Panel (Answer + Reasoning)
```
┌────────────────────────────────────────────────────────────┐
│  Payment Receipt.pdf                              [X]      │
│  01 Mar 2024 • 2 pages                    [Jump to... ▼]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────────────────────┐ ┌────────────────────┐            │
│  │  Claimant Support  │ │  Defendant Support │            │
│  │      85%           │ │       15%          │            │
│  │  ████████████░░░   │ │  ███░░░░░░░░░░░░░  │            │
│  └────────────────────┘ └────────────────────┘            │
│                                                            │
│  ─────────────────────────────────────────────────────    │
│  💡 Answer: Key Claims                                     │
│  ─────────────────────────────────────────────────────    │
│                                                            │
│  This document proves the claimant attempted to settle    │
│  their debt in good faith before any default notice was   │
│  issued. The payment of £150 on 01/03/2024 demonstrates   │
│  proactive effort to resolve the outstanding balance.      │
│                                                            │
│  ─────────────────────────────────────────────────────    │
│  🔍 Reasoning                                              │
│  ─────────────────────────────────────────────────────    │
│                                                            │
│  1. Payment receipt shows date of 01/03/2024, which is   │
│     45 days BEFORE the default notice (15/04/2024)        │
│                                                            │
│  2. Amount of £150 matches the disputed outstanding       │
│     balance in Netflix account records                     │
│                                                            │
│  3. Transaction reference NF-2024-03-15892 can be        │
│     verified with Netflix payment systems                  │
│                                                            │
│  ─────────────────────────────────────────────────────    │
│  📎 Related Documents                                      │
│  ─────────────────────────────────────────────────────    │
│  [📧 Default Notice Email.eml]  [📄 Credit Report.pdf]   │
│                                                            │
│  ─────────────────────────────────────────────────────    │
│                                                            │
│            [ Open Original Document ]                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```
**User Goal**: Understand WHY AI made this assessment
**Trust Builder**: Transparent reasoning builds confidence

### Screen 2.4: Chat Inside Table (Legora-inspired)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────┐                                                      │
│  │ 💬 New chat       │  Document Table (behind)                             │
│  │                   │                                                      │
│  │ Context:          │  ┌──────────────────────────────────────────────┐   │
│  │ [📋 Table #63]    │  │ Document      │ Date     │ Type    │ ...    │   │
│  │                   │  ├──────────────┼──────────┼─────────┤        │   │
│  │ ─────────────────│  │ ...          │ ...      │ ...     │        │   │
│  │                   │  └──────────────────────────────────────────────┘   │
│  │ ✨ Suggestions:   │                                                      │
│  │                   │                                                      │
│  │ [Extract key      │                                                      │
│  │  points]          │                                                      │
│  │                   │                                                      │
│  │ [Refine review    │                                                      │
│  │  with columns]    │                                                      │
│  │                   │                                                      │
│  │ [Add documents    │                                                      │
│  │  to review]       │                                                      │
│  │                   │                                                      │
│  │ ─────────────────│                                                      │
│  │                   │                                                      │
│  │ Type a question   │                                                      │
│  │ ┌───────────────┐ │                                                      │
│  │ │               │ │                                                      │
│  │ └───────────────┘ │                                                      │
│  │ ○ Deep think      │                                                      │
│  │                   │                                                      │
│  └───────────────────┘                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```
**User Goal**: Ask questions about filtered/visible documents
**Context**: Chat is scoped to current table view

---

## 2.3 PHASE 3: RESEARCH (AI Chat)

### Screen 3.1: Research Welcome
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ☰  mirai360.ai        Research                   Case: Netflix ▼    [AK]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐                                                            │
│ │ + New Chat   │                                                            │
│ │              │                    ┌──────────────────┐                    │
│ │ Knowledge    │                    │       🧠         │                    │
│ │ ─────────── │                    │                  │                    │
│ │ ☑ Case Files │                    │  Legal Research  │                    │
│ │ ☑ Firm KB    │                    │    Assistant     │                    │
│ │ ☐ Indian     │                    │                  │                    │
│ │   Kanoon     │                    │  Ask questions   │                    │
│ │ ☐ CaseMine   │                    │  about your case │                    │
│ │              │                    └──────────────────┘                    │
│ │ ─────────── │                                                            │
│ │ History      │     ┌─────────────────┐  ┌─────────────────┐              │
│ │ ─────────── │     │ 🔍 Legal        │  │ 🌐 Web          │              │
│ │ Today        │     │    Research     │  │    Search       │              │
│ │ • Payment    │     │                 │  │                 │              │
│ │   timeline   │     │ Search case     │  │ External        │              │
│ │ • Credit     │     │ files           │  │ sources         │              │
│ │   default    │     └─────────────────┘  └─────────────────┘              │
│ │              │                                                            │
│ │ Yesterday    │     ┌─────────────────┐  ┌─────────────────┐              │
│ │ • Similar    │     │ 📋 Similar      │  │ ⚖️ Clause       │              │
│ │   Netflix    │     │    Cases        │  │    Analysis     │              │
│ │   cases      │     │                 │  │                 │              │
│ │              │     │ Find            │  │ Check           │              │
│ │              │     │ precedents      │  │ violations      │              │
│ │              │     └─────────────────┘  └─────────────────┘              │
│ └──────────────┘                                                            │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Ask about your case files...                                    [↑] │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│  Answer format: [Free Form ▼]    Agents: [Clause] [Similar] [Judge]       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```
**User Goal**: Start research with contextual suggestions
**Answer Formats**: Briefing, Chronology, List, Memo, Table, Free Form

### Screen 3.2: Active Chat with Citations
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ☰  mirai360.ai        Research                   Case: Netflix ▼    [AK]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐                                                            │
│ │ ...          │                                                            │
│ │              │  ┌─────────────────────────────────────────────────────┐  │
│ │              │  │ What is the timeline of events?                     │  │
│ │              │  └─────────────────────────────────────────────────────┘  │
│ │              │                                                    2:34 PM │
│ │              │                                                            │
│ │              │  ┌─────────────────────────────────────────────────────┐  │
│ │              │  │ 🧠 Show reasoning [toggle]                          │  │
│ │              │  │                                                     │  │
│ │              │  │ ┌───────────────────────────────────────────────┐  │  │
│ │              │  │ │ → Searching case files for dates...           │  │  │
│ │              │  │ │ → Found 5 documents with timeline relevance   │  │  │
│ │              │  │ │ → Cross-referencing payment with default      │  │  │
│ │              │  │ └───────────────────────────────────────────────┘  │  │
│ │              │  │                                                     │  │
│ │              │  │ Based on the case documents, here's the timeline:  │  │
│ │              │  │                                                     │  │
│ │              │  │ 1. 15 Feb 2024 - Address change request (1,2)      │  │
│ │              │  │ 2. 01 Mar 2024 - Payment of £150 (3,4)             │  │
│ │              │  │ 3. 15 Apr 2024 - Default notice sent (5,6)         │  │
│ │              │  │ 4. 20 May 2024 - Credit impact discovered (7)      │  │
│ │              │  │                                                     │  │
│ │              │  │ Sources:                                            │  │
│ │              │  │ [📄 Payment Receipt] [📧 Default Notice]           │  │
│ │              │  │ [📄 Credit Report]                                  │  │
│ │              │  └─────────────────────────────────────────────────────┘  │
│ │              │                                                    2:35 PM │
│ └──────────────┘                                                            │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Are there similar cases?                                        [↑] │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```
**User Goal**: Get answers with traceable sources
**Key Feature**: Clickable citations open drill-down

### Screen 3.3: Similar Cases Results
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  I found 3 similar cases:                                                   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Thompson v. Disney+ (2023)                           [92% Match]   │   │
│  │  ──────────────────────────────────────────────────────────────────│   │
│  │  Similar credit default after disputed charges.                     │   │
│  │  Claimant awarded £2,500 compensation.                              │   │
│  │                                                                      │   │
│  │  Key similarities:                                                   │   │
│  │  • Streaming service billing dispute                                │   │
│  │  • Address update not processed                                     │   │
│  │  • Default filed incorrectly                                        │   │
│  │                                                                      │   │
│  │  [View Full Case]  [Compare with Current]  [Add to Brief]          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Roberts v. Amazon Prime (2022)                       [87% Match]   │   │
│  │  ──────────────────────────────────────────────────────────────────│   │
│  │  Address update not processed, default issued incorrectly.          │   │
│  │  Case settled out of court.                                         │   │
│  │  [View Full Case]  [Compare with Current]  [Add to Brief]          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```
**User Goal**: Find precedents to strengthen case
**Action**: Can add directly to brief being drafted

### Screen 3.4: Citation Drill-Down
```
┌────────────────────────────────────────────────────────────┐
│  📄 Payment Receipt.pdf                              [X]   │
│  Source Document                                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │         Relevance: 95%                             │   │
│  │         ██████████████████████░░░                  │   │
│  │         Directly supports timeline query           │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Summary                                                    │
│  ─────────────────────────────────────────────────────    │
│  Official payment confirmation showing £150 transaction   │
│  on 01/03/2024. Receipt includes transaction ID, date,    │
│  amount, and account details.                              │
│                                                            │
│  Relevant Excerpt                                          │
│  ─────────────────────────────────────────────────────    │
│  ┌────────────────────────────────────────────────────┐   │
│  │ "Payment received: £150.00                         │   │
│  │  Transaction Date: 01 March 2024                   │   │
│  │  Reference: NF-2024-03-15892                       │   │
│  │  Account Status: Settled"                          │   │
│  │                              — Page 1, Paragraph 2 │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Why This Matters                                          │
│  ─────────────────────────────────────────────────────    │
│  ✓ Establishes payment occurred before default            │
│  ✓ Account marked "Settled" contradicts default           │
│  ✓ Transaction reference enables verification             │
│                                                            │
│            [ Open Full Document ]                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```
**User Goal**: Verify AI's source and reasoning
**Trust**: See exact text AI used for answer

---

## 2.4 PHASE 4: CREATE (Canvas & Auditor)

### Screen 4.1: Canvas Editor
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ☰  mirai360.ai        Create                     Case: Netflix ▼    [AK]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌─────────────────────────────────────┐                  │
│ │ Evidence       │ │  Legal Brief - Netflix Complaint    │  [Save] [Export]│
│ │ ────────────── │ │  Last edited: 2 min ago   ● Saved   │                  │
│ │                │ ├─────────────────────────────────────┤                  │
│ │ 📄 Payment     │ │ [B] [I] [U]  [≡] [•] [1.]  [⚖ Audit]│                  │
│ │    Receipt     │ ├─────────────────────────────────────┤                  │
│ │    ████░ 85%   │ │                                     │                  │
│ │                │ │  # Legal Brief                      │                  │
│ │ 📧 Default     │ │                                     │                  │
│ │    Notice      │ │  ## IN THE MATTER OF:               │                  │
│ │    █████ 90%   │ │  Netflix Bundling Complaint         │                  │
│ │                │ │                                     │                  │
│ │ 📄 Credit      │ │  ## 1. Introduction                 │                  │
│ │    Report      │ │                                     │                  │
│ │    █████ 95%   │ │  This brief is submitted on behalf  │                  │
│ │                │ │  of the Claimant, Mr. James Smith,  │                  │
│ │ 📄 Terms       │ │  in relation to an erroneous        │                  │
│ │    ██░░░ 30%   │ │  default notice filed by Netflix UK │                  │
│ │                │ │  Ltd...                              │                  │
│ │ ────────────── │ │                                     │                  │
│ │                │ │  ┌───────────────────────────────┐  │                  │
│ │ [Generate      │ │  │ 💡 AI Suggestion              │  │                  │
│ │  Brief]        │ │  │ Consider citing Thompson v.   │  │                  │
│ │                │ │  │ Disney+ (2023) here...        │  │                  │
│ │ [Generate      │ │  │ [Insert] [Dismiss]            │  │                  │
│ │  LOD]          │ │  └───────────────────────────────┘  │                  │
│ │                │ │                                     │                  │
│ └────────────────┘ └─────────────────────────────────────┘                  │
│                                                                              │
│  Tone: [Claimant 78% ████████░░] [Defendant 22% ██░░░░░░]   Words: 487    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```
**User Goal**: Draft legal document with AI assistance
**Key Feature**: Drag evidence from left panel to insert citations

### Screen 4.2: Compliance Auditor Panel (Legora-inspired)
```
┌────────────────────────────────────────────────────────────┐
│  Compliance Auditor                                  [X]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│              ┌───────────────┐                             │
│              │      80%      │                             │
│              │   ┌───────┐   │                             │
│              │   │       │   │                             │
│              │   └───────┘   │                             │
│              │ Compliance    │                             │
│              └───────────────┘                             │
│              4 issues found                                │
│                                                            │
│  ─────────────────────────────────────────────────────    │
│                                                            │
│  ● Passed (8)                                              │
│  ─────────────────────────────────────────────────────    │
│    ✓ Case reference present                               │
│    ✓ Timeline documented                                   │
│    ✓ Evidence cited                                        │
│    ✓ Relief sought specified                              │
│    [Show all 8...]                                         │
│                                                            │
│  ● Warnings (3)                                            │
│  ─────────────────────────────────────────────────────    │
│  ┌────────────────────────────────────────────────────┐   │
│  │ ⚠️ Missing case law citation                       │   │
│  │ Section 3.1 mentions Consumer Credit Act           │   │
│  │ but no supporting case law                         │   │
│  │                              [Add Citation]        │   │
│  └────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────┐   │
│  │ ⚠️ Compensation not justified                      │   │
│  │ £5,000 claim needs breakdown                       │   │
│  │                              [Add Breakdown]       │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ● Errors (1)                                              │
│  ─────────────────────────────────────────────────────    │
│  ┌────────────────────────────────────────────────────┐   │
│  │ ❌ Exhibit reference mismatch                      │   │
│  │ Exhibit D referenced but shows as C                │   │
│  │                              [Fix Now]             │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│            [ Auto-Fix All Issues ]                         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```
**User Goal**: Ensure document is compliant before filing
**RYG Pattern**: Red (errors), Yellow (warnings), Green (passed)

### Screen 4.3: Generate Document Modal
```
┌────────────────────────────────────────────────────────────┐
│  Generate Legal Brief                                [X]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Template                                                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Standard Legal Brief                        ▼        │ │
│  └──────────────────────────────────────────────────────┘ │
│  Options: Standard Brief | Ombudsman | Court | LOD | NDA  │
│                                                            │
│  Tone                                                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐            │
│  │  Formal    │ │  Neutral   │ │ Assertive  │            │
│  │    ●       │ │     ○      │ │     ○      │            │
│  └────────────┘ └────────────┘ └────────────┘            │
│                                                            │
│  Include Sections                                          │
│  ☑ Introduction & Background                              │
│  ☑ Statement of Facts                                     │
│  ☑ Timeline of Events                                     │
│  ☑ Legal Arguments                                        │
│  ☑ Relief Sought                                          │
│  ☐ Exhibit List                                           │
│  ☐ Appendices                                             │
│                                                            │
│  Evidence to Include                                       │
│  ☑ Payment Receipt.pdf (85% relevance)                   │
│  ☑ Default Notice Email.eml (90% relevance)              │
│  ☑ Credit Report.pdf (95% relevance)                     │
│  ☐ Terms of Service.pdf (30% relevance)                  │
│                                                            │
│  Additional Instructions                                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Emphasize the timeline gap between payment and       │ │
│  │ default notice. Reference Thompson v. Disney+...     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│            [ Cancel ]    [✨ Generate ]                   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```
**User Goal**: Generate first draft with correct structure
**AI Action**: Creates complete document using case evidence

---

## 2.5 PHASE 5: TIMELINE VIEW (From Reference Screenshot 7)

### Screen 5.1: Chronology Explorer
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ☰  mirai360.ai        Timeline                   Case: Netflix ▼    [AK]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Chronology]  [Explore]  [Documents]  [Parties]          [Export] [+ Add] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐ ┌─────────────────────┐ ┌───────────────────────────┐ │
│  │ Summary         │ │ Events              │ │ Facts                     │ │
│  │ ─────────────── │ │ ─────────────────── │ │ ─────────────────────────│ │
│  │                 │ │                     │ │                           │ │
│  │ Feb 15 - May 20 │ │ ┌─────────────────┐ │ │ 10 facts                  │ │
│  │ 2024 (3 months) │ │ │ Feb 15, 2024    │ │ │ Feb 15 - Mar 1, 2024     │ │
│  │                 │ │ │                 │ │ │                           │ │
│  │ The claimant    │ │ │ Claimant sent   │ │ │ ┌───────────────────────┐│ │
│  │ engaged with    │ │ │ address change  │ │ │ │ Address Change        ││ │
│  │ Netflix UK      │ │ │ request to      │ │ │ │ Feb 15, 2024 10:30am  ││ │
│  │ regarding a     │ │ │ Netflix...      │ │ │ │                       ││ │
│  │ billing         │ │ │                 │ │ │ │ Claimant requested    ││ │
│  │ dispute that    │ │ │ [more detail »] │ │ │ │ address update via    ││ │
│  │ escalated to    │ │ │                 │ │ │ │ customer portal...    ││ │
│  │ an incorrect    │ │ │ Exhibits 1-3    │ │ │ │                       ││ │
│  │ credit default. │ │ └─────────────────┘ │ │ │ [Exhibits 1-3]        ││ │
│  │                 │ │                     │ │ └───────────────────────┘│ │
│  │ Key parties:    │ │ ┌─────────────────┐ │ │                           │ │
│  │ • James Smith   │ │ │ Mar 1, 2024     │ │ │ ┌───────────────────────┐│ │
│  │   (Claimant)    │ │ │                 │ │ │ │ Payment Made          ││ │
│  │ • Netflix UK    │ │ │ Payment of £150 │ │ │ │ Mar 1, 2024 14:22     ││ │
│  │   (Defendant)   │ │ │ made to settle  │ │ │ │                       ││ │
│  │                 │ │ │ account...      │ │ │ │ £150 payment via      ││ │
│  │ [more detail »] │ │ │                 │ │ │ │ online banking...     ││ │
│  │                 │ │ │ [more detail »] │ │ │ │                       ││ │
│  │                 │ │ │                 │ │ │ │ [Exhibits 4-5]        ││ │
│  │                 │ │ │ Exhibits 4-5    │ │ └───────────────────────┘│ │
│  │                 │ │ └─────────────────┘ │ │                           │ │
│  └─────────────────┘ └─────────────────────┘ └───────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```
**User Goal**: Understand case chronology at different zoom levels
**Key Pattern**: Summary → Events → Facts (3-level hierarchy)

---

# PART 3: COMPONENT LIBRARY

## 3.1 Navigation Components

```
Top Nav Bar
┌─────────────────────────────────────────────────────────────────────────────┐
│  ☰  mirai360.ai        [Active Tab]              Case: [Dropdown]    [AK]  │
└─────────────────────────────────────────────────────────────────────────────┘
Height: 64px
Background: White with blur
Border: 1px bottom gray-100

Sidebar (Collapsible)
┌────────────────┐
│ Case Selector  │  <- Dropdown
│ ────────────── │
│ ● Dashboard    │  <- Active state
│ ○ Prepare      │
│ ○ Research     │
│ ○ Create       │
│ ────────────── │
│ ○ Knowledge    │
│ ○ Team         │
│ ○ Settings     │
└────────────────┘
Width: 256px (expanded), 64px (collapsed)
```

## 3.2 Card Components

```
Framework Card
┌────────────────────────────────────────────────┐
│  ┌──────┐                                      │
│  │ Icon │  Title                               │
│  │      │  Subtitle                            │
│  └──────┘                                      │
│                                                │
│  Description text that explains the feature    │
│  in 2-3 lines maximum...                       │
│                                                │
│  ✓ Feature 1                                  │
│  ✓ Feature 2                                  │
│  ✓ Feature 3                                  │
│                                                │
│  [Call to Action →]                           │
│                                                │
└────────────────────────────────────────────────┘
Padding: 24px
Border Radius: 12px
Shadow on hover

Evidence Card (Draggable)
┌────────────────────────────────────────────────┐
│  📄  Document Name.pdf              [≡ drag]  │
│      01 Mar 2024                              │
│      ████████░░░░░░░░ 85%                     │
└────────────────────────────────────────────────┘
Padding: 12px
Draggable indicator on right
```

## 3.3 Table Components

```
Document Table Row
┌───┬──────────────────┬──────────┬─────────┬────────────────┬─────────────┐
│ □ │ 📄 Document      │ Date     │ Type    │ Summary        │ Support     │
│   │    Name.pdf      │ 01/03/24 │ [Badge] │ Truncated...   │ ████░ 85%   │
│   │    2 pages       │          │         │                │ █░░░░ 15%   │
└───┴──────────────────┴──────────┴─────────┴────────────────┴─────────────┘
Row height: 72px
Hover: Light blue background
Click: Opens drill-down panel

Support Bars
Claimant: ████████████░░░░░░ 85%  (Blue #2E86C1)
Defendant: ███░░░░░░░░░░░░░░ 15%  (Red #E74C3C)
```

## 3.4 Panel Components

```
Drill-Down Panel (Slide from Right)
┌────────────────────────────────────────────────┐
│  Document Name                            [X]  │
│  Metadata                         [Jump to ▼] │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────┐  ┌──────────────┐           │
│  │  Claimant    │  │  Defendant   │           │
│  │    85%       │  │    15%       │           │
│  └──────────────┘  └──────────────┘           │
│                                                │
│  💡 Answer                                     │
│  ──────────────────────────────────────────   │
│  [Answer content...]                          │
│                                                │
│  🔍 Reasoning                                  │
│  ──────────────────────────────────────────   │
│  1. [Step 1]                                  │
│  2. [Step 2]                                  │
│  3. [Step 3]                                  │
│                                                │
│  📎 Related Documents                          │
│  ──────────────────────────────────────────   │
│  [Doc 1] [Doc 2]                              │
│                                                │
├────────────────────────────────────────────────┤
│  [ Open Original Document ]                    │
└────────────────────────────────────────────────┘
Width: 480px
Animation: Slide from right, 300ms
```

## 3.5 Chat Components

```
User Message Bubble
                                    ┌─────────────────────────────┐
                                    │ User question text here     │
                                    └─────────────────────────────┘
                                                         2:34 PM
Background: Navy Primary
Text: White
Align: Right

AI Response Bubble
┌─────────────────────────────────────────────────────────────────┐
│ 🧠                                                              │
│                                                                 │
│ [Optional: Reasoning collapse]                                  │
│                                                                 │
│ Response content with formatting...                             │
│                                                                 │
│ Sources: [📄 Doc 1] [📧 Doc 2] [📄 Doc 3]                       │
└─────────────────────────────────────────────────────────────────┘
2:35 PM
Background: White
Border: 1px gray-200
Align: Left

Citation Chip
┌───────────────────────────────┐
│ 📄 Payment Receipt.pdf        │
└───────────────────────────────┘
Background: Gray-50
On click: Opens drill-down
Hover: Underline
```

## 3.6 Auditor Components

```
Compliance Score Circle
       ┌───────────────┐
       │      80%      │
       │   ╭───────╮   │
       │   │       │   │
       │   ╰───────╯   │
       │  Compliance   │
       └───────────────┘
SVG Progress ring
Colors: Green (>80), Amber (60-80), Red (<60)

Issue Card
┌────────────────────────────────────────────────┐
│ ⚠️ Warning Title                               │
│ Description of the issue that needs            │
│ attention...                                   │
│                              [Action Button]   │
└────────────────────────────────────────────────┘
Warning: Amber background
Error: Red background
Passed: Green checkmark only (no card)
```

---

<!-- ═══════════════════════════════════════════════════════════════════════════
     VERSION 2.0 - DECEMBER 3, 2024
     Added Functional Requirements for Prepare Module
     Source: User requirements table (Case Management, Document Management, Firm Management)
═══════════════════════════════════════════════════════════════════════════ -->

# PART 4: FUNCTIONAL REQUIREMENTS FOR DESIGN

## 4.1 Prepare Module - Case Management

| ID | Requirement | Screen Location | UI Component Needed |
|----|-------------|-----------------|---------------------|
| CM-01 | Create/delete case (super admin) | Dashboard / Case List | Modal + Confirmation dialog |
| CM-02 | Assign team members to case | Case Settings | Multi-select dropdown + Avatar chips |
| CM-03 | Assign role played by firm in case | Case Overview | Radio/Toggle: Claimant / Defendant / Neutral |
| CM-04 | Access control for case | Case Settings | Role permission matrix table |

### Wireframe: Case Creation Modal
```
┌────────────────────────────────────────────────────────────┐
│  Create New Case                                      [X]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Case Name *                                               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Netflix Bundling Complaint - James Smith             │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Firm's Role *                                             │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│  │ ● Claimant     │ │ ○ Defendant    │ │ ○ Neutral      │ │
│  └────────────────┘ └────────────────┘ └────────────────┘ │
│                                                            │
│  Case Type                                                 │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Consumer Dispute                               ▼     │ │
│  └──────────────────────────────────────────────────────┘ │
│  Options: Consumer | Commercial | Employment | Property   │
│                                                            │
│  Assign Team Members                                       │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ [AK] Amit Kumar  [x]  [SP] Sarah Patel  [x]          │ │
│  │ [+ Add team member...]                               │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Description                                               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Brief case description...                            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│            [ Cancel ]    [ Create Case ]                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Wireframe: Access Control Matrix
```
┌────────────────────────────────────────────────────────────┐
│  Case Access Control                                       │
├────────────────────────────────────────────────────────────┤
│  Team Member        │ View │ Edit │ Delete │ Share        │
├─────────────────────┼──────┼──────┼────────┼──────────────┤
│  [AK] Amit Kumar    │  ✓   │  ✓   │   ✓    │   ✓          │
│  (Super Admin)      │      │      │        │              │
├─────────────────────┼──────┼──────┼────────┼──────────────┤
│  [SP] Sarah Patel   │  ✓   │  ✓   │   ○    │   ○          │
│  (Associate)        │      │      │        │              │
├─────────────────────┼──────┼──────┼────────┼──────────────┤
│  [RK] Raj Kumar     │  ✓   │  ○   │   ○    │   ○          │
│  (Paralegal)        │      │      │        │              │
└────────────────────────────────────────────────────────────┘
✓ = Allowed  ○ = Denied
```

---

## 4.2 Prepare Module - Document Management

| ID | Requirement | Screen Location | UI Component Needed |
|----|-------------|-----------------|---------------------|
| DM-01 | Manage team members (super admin) | Settings > Team | User table + Invite modal |
| DM-02 | Database management for firm | Firm KB / All Docs | Filterable document table |
| DM-03 | Convert document to digital twin | Document Upload / Process | Upload modal + Processing indicator |

### Wireframe: Document Upload & Digital Twin Processing
```
┌────────────────────────────────────────────────────────────┐
│  Upload Documents                                     [X]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                      │ │
│  │           📁 Drop files here or click to upload      │ │
│  │                                                      │ │
│  │           Supports: PDF, DOCX, EML, TXT, Images      │ │
│  │           Max 50MB per file                          │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Processing Queue (24 files)                   [Pause All] │
│  ┌────────────────────────────┬───────────────┬───────────┐ │
│  │ File                       │ Status        │ Progress  │ │
│  ├────────────────────────────┼───────────────┼───────────┤ │
│  │ 📄 Contract_v2.pdf         │ Extracting... │ ████░ 80% │ │
│  │ 📄 Evidence_001.pdf        │ ✓ Complete    │ █████ 100%│ │
│  │ 📧 Notice_Email.eml        │ Analyzing...  │ █░░░░ 15% │ │
│  │ 📄 Deed_Final.pdf          │ Queued        │ ░░░░░  0% │ │
│  │ 📄 Affidavit_2023.pdf      │ Queued        │ ░░░░░  0% │ │
│  ├────────────────────────────┴───────────────┴───────────┤ │
│  │ ... +19 more files                      [Show All ▼]   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                            │
│  ☑ Auto-analyze support (Claimant/Defendant)              │
│  ☑ Extract timeline events                                │
│  ☑ Identify key entities and persons                      │
│                                                            │
│            [ Cancel ]    [ Upload & Process ]             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 4.3 Prepare Module - Firm Management

| ID | Requirement | Screen Location | UI Component Needed |
|----|-------------|-----------------|---------------------|
| FM-01 | Firm-level templates | Settings > Templates | Template library grid |
| FM-02 | Playbooks / guardrails / drafting guidelines | Settings > Playbooks | Document list + Editor |
| FM-03 | Workflows - approval, response | Settings > Workflows | Workflow builder / Status tracker |
| FM-04 | Billing and time management | Case > Billing | Time log table + Invoice modal |
| FM-05 | Translate from one language to another | Any document view | Language dropdown + Translate button |
| FM-06 | Annotation and error fixing | Document viewer | Annotation toolbar + Comment threads |

### Wireframe: Template Library
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ☰  mirai360.ai        Settings > Templates              Case: All    [AK]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Firm Templates                          [Search...]    [+ New Template]    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │ 📄               │  │ 📄               │  │ 📄               │          │
│  │                  │  │                  │  │                  │          │
│  │ Legal Brief      │  │ Letter of Demand │  │ NDA              │          │
│  │ ────────────────│  │ ────────────────│  │ ────────────────│          │
│  │ Standard format  │  │ Debt recovery    │  │ Mutual NDA for   │          │
│  │ for court        │  │ letter           │  │ business deals   │          │
│  │ submissions      │  │                  │  │                  │          │
│  │                  │  │                  │  │                  │          │
│  │ Used: 45 times   │  │ Used: 23 times   │  │ Used: 67 times   │          │
│  │ [Edit] [Clone]   │  │ [Edit] [Clone]   │  │ [Edit] [Clone]   │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │ 📄               │  │ 📄               │  │ 📄               │          │
│  │                  │  │                  │  │                  │          │
│  │ Ombudsman        │  │ Settlement       │  │ + Create         │          │
│  │ Complaint        │  │ Agreement        │  │   Template       │          │
│  │ ────────────────│  │ ────────────────│  │                  │          │
│  │ Financial        │  │ Standard         │  │                  │          │
│  │ ombudsman format │  │ settlement terms │  │                  │          │
│  │                  │  │                  │  │                  │          │
│  │ Used: 12 times   │  │ Used: 8 times    │  │                  │          │
│  │ [Edit] [Clone]   │  │ [Edit] [Clone]   │  │                  │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Wireframe: Playbooks / Drafting Guidelines
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ☰  mirai360.ai        Settings > Playbooks              Case: All    [AK]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Playbooks & Guidelines                  [Search...]    [+ New Playbook]    │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────┐ ┌────────────────────────────────────────────────┐   │
│ │ Playbooks          │ │  Consumer Dispute Playbook                     │   │
│ │ ──────────────────│ │  ────────────────────────────────────────────  │   │
│ │                    │ │                                                │   │
│ │ ● Consumer Dispute │ │  ## Overview                                   │   │
│ │   Playbook         │ │  This playbook outlines the standard approach  │   │
│ │                    │ │  for handling consumer disputes...             │   │
│ │ ○ Employment       │ │                                                │   │
│ │   Dispute Guide    │ │  ## Guardrails                                 │   │
│ │                    │ │  ┌────────────────────────────────────────┐   │   │
│ │ ○ Commercial       │ │  │ ⚠️ Never admit liability without       │   │   │
│ │   Litigation       │ │  │    senior partner approval             │   │   │
│ │                    │ │  │                                        │   │   │
│ │ ○ Debt Recovery    │ │  │ ⚠️ Always include limitation period    │   │   │
│ │   Guidelines       │ │  │    analysis                            │   │   │
│ │                    │ │  │                                        │   │   │
│ │ ────────────────── │ │  │ ✓ Use plain English for consumer       │   │   │
│ │                    │ │  │   correspondence                       │   │   │
│ │ Drafting Guidelines│ │  └────────────────────────────────────────┘   │   │
│ │ ──────────────────│ │                                                │   │
│ │                    │ │  ## Standard Workflow                         │   │
│ │ ○ Tone Guidelines  │ │  1. Initial client meeting (1 hr)             │   │
│ │ ○ Citation Format  │ │  2. Document collection (1 week)              │   │
│ │ ○ Court Formatting │ │  3. Letter of Demand (Draft + Review)         │   │
│ │                    │ │  4. Response period (14-28 days)              │   │
│ │                    │ │  5. Escalation decision                       │   │
│ └────────────────────┘ └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Wireframe: Workflow Approval System
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Approval Workflow: Legal Brief - Netflix Case                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐              │
│  │ Draft   │────▶│ Review  │────▶│ Approve │────▶│ Filed   │              │
│  │   ✓     │     │   ●     │     │   ○     │     │   ○     │              │
│  └─────────┘     └─────────┘     └─────────┘     └─────────┘              │
│   Completed       In Progress      Pending         Pending                  │
│   by SP           by AK                                                     │
│                                                                              │
│  Current Step: Review                                                        │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Reviewer: Amit Kumar (Senior Partner)                                  │ │
│  │ Assigned: 2 hours ago                                                  │ │
│  │                                                                        │ │
│  │ Comments:                                                              │ │
│  │ ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │ │ Please strengthen the timeline section. Add more citations       │  │ │
│  │ │ for the Consumer Credit Act references.                          │  │ │
│  │ └──────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  │ [ Request Changes ]    [ Approve & Forward ]                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Wireframe: Billing & Time Management
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ☰  mirai360.ai        Case: Netflix > Billing           Case: Netflix [AK] │
├─────────────────────────────────────────────────────────────────────────────┤
│  Time & Billing                                    [+ Log Time] [Invoice]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Summary                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Total Hours  │  │ Billable     │  │ Amount       │  │ Outstanding  │   │
│  │    24.5      │  │    22.0      │  │  £4,400      │  │  £1,200      │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  Time Log                                                                    │
│  ┌──────────┬─────────────────────────────┬────────┬─────────┬───────────┐ │
│  │ Date     │ Activity                    │ Member │ Hours   │ Billable  │ │
│  ├──────────┼─────────────────────────────┼────────┼─────────┼───────────┤ │
│  │ Dec 2    │ Document review & analysis  │ SP     │ 3.5     │ ✓ £700    │ │
│  │ Dec 2    │ Client call                 │ AK     │ 0.5     │ ✓ £150    │ │
│  │ Dec 1    │ Legal brief drafting        │ SP     │ 4.0     │ ✓ £800    │ │
│  │ Dec 1    │ Research - similar cases    │ RK     │ 2.0     │ ✓ £200    │ │
│  │ Nov 30   │ Initial case review         │ AK     │ 1.5     │ ✓ £450    │ │
│  └──────────┴─────────────────────────────┴────────┴─────────┴───────────┘ │
│                                                                              │
│  Rate Card: AK £300/hr | SP £200/hr | RK £100/hr                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Wireframe: Translation Feature
```
┌────────────────────────────────────────────────────────────┐
│  📄 Contract_Hindi.pdf                          [≡] [X]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Language: Hindi                   [Translate to ▼]       │
│                                    ┌─────────────────┐    │
│                                    │ ● English       │    │
│                                    │ ○ Hindi         │    │
│                                    │ ○ Gujarati      │    │
│                                    │ ○ Marathi       │    │
│                                    │ ○ Tamil         │    │
│                                    └─────────────────┘    │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                      │ │
│  │  यह समझौता दिनांक 01 मार्च 2024 को...                   │ │
│  │                                                      │ │
│  │  पक्षकार:                                              │ │
│  │  1. जेम्स स्मिथ ("प्रथम पक्ष")                           │ │
│  │  2. नेटफ्लिक्स यूके लिमिटेड ("द्वितीय पक्ष")               │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [ Cancel ]                    [ Translate Document ]     │
│                                                            │
│  ⚠️ Translation will create a new document version        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Wireframe: Annotation & Error Fixing
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📄 Legal_Brief_v2.pdf                                [Save] [Export]  [X]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🖍️ Highlight] [📝 Comment] [✏️ Edit] [❌ Strikethrough] [📌 Pin]         │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────┐ ┌────────────────────┐   │
│ │                                               │ │ Comments (3)       │   │
│ │  ## 1. Introduction                           │ │ ──────────────────│   │
│ │                                               │ │                    │   │
│ │  This brief is submitted on behalf of the     │ │ ┌────────────────┐│   │
│ │  Claimant, Mr. James Smith, in relation to    │ │ │ [AK] 2:30 PM   ││   │
│ │  an erroneous default notice filed by         │ │ │ ──────────────││   │
│ │  [HIGHLIGHTED: Netflix UK Ltd]...             │◄─┼─┤ Check if this  ││   │
│ │                                               │ │ │ should be      ││   │
│ │  ## 2. Statement of Facts                     │ │ │ "Netflix       ││   │
│ │                                               │ │ │ International" ││   │
│ │  On or about 15 February 2024, the Claimant   │ │ │                ││   │
│ │  [STRIKETHROUGH: requested] notified Netflix  │ │ │ [Reply] [Resolve]│   │
│ │                       ↑                       │ │ └────────────────┘│   │
│ │                  [✏️ EDIT SUGGESTION]         │ │                    │   │
│ │                  "informed" → Accepted ✓      │ │ ┌────────────────┐│   │
│ │                                               │ │ │ [SP] 2:15 PM   ││   │
│ │  of an address change via their online        │ │ │ ──────────────││   │
│ │  customer portal...                           │ │ │ Timeline needs ││   │
│ │                                               │ │ │ more detail    ││   │
│ └───────────────────────────────────────────────┘ │ │                ││   │
│                                                    │ │ [Reply] [Resolve]│   │
│                                                    │ └────────────────┘│   │
│                                                    └────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4.4 Requirements Summary Table

| Module | Category | Feature Count | Priority |
|--------|----------|---------------|----------|
| Prepare | Case Management | 4 | High |
| Prepare | Document Management | 3 | High |
| Prepare | Firm Management | 6 | Medium |
| **Total** | | **13** | |

### Design Priority Order
1. **High Priority** (Design First)
   - Case creation/assignment modal
   - Document upload with digital twin processing
   - Access control matrix

2. **Medium Priority** (Design Second)
   - Template library
   - Playbooks/guidelines editor
   - Billing & time tracking

3. **Lower Priority** (Design Later)
   - Translation feature
   - Annotation system
   - Workflow builder

---

# PART 5: FIGMA DELIVERABLES CHECKLIST

## Pages to Create
1. [ ] **Login/Onboarding** (2 screens)
2. [ ] **Dashboard** (1 screen)
3. [ ] **Prepare - Table View** (3 states: empty, populated, with panel)
4. [ ] **Prepare - Add Column Modal** (1 screen)
5. [ ] **Prepare - Chat Overlay** (1 screen)
6. [ ] **Research - Welcome** (1 screen)
7. [ ] **Research - Active Chat** (2 states: with/without CoT)
8. [ ] **Research - Citation Panel** (1 screen)
9. [ ] **Create - Canvas** (2 states: editing, with auditor)
10. [ ] **Create - Generate Modal** (1 screen)
11. [ ] **Timeline - Chronology** (1 screen)

## Component Library
1. [ ] Colors & Typography
2. [ ] Buttons (Primary, Secondary, Ghost, Danger)
3. [ ] Inputs (Text, Textarea, Select, Checkbox, Toggle)
4. [ ] Cards (Framework, Evidence, Issue, Case)
5. [ ] Tables (Header, Row, Pagination)
6. [ ] Chat (User bubble, AI bubble, Citation chip)
7. [ ] Panels (Drill-down, Auditor)
8. [ ] Modals (Standard, Confirmation)
9. [ ] Navigation (Top bar, Sidebar)
10. [ ] Support Bars (Claimant/Defendant)

## Prototype Interactions
1. [ ] Tab navigation between Prepare/Research/Create
2. [ ] Table row click → Drill-down panel
3. [ ] Add Column button → Modal
4. [ ] Chat toggle → Slide panel
5. [ ] Citation click → Drill-down
6. [ ] Run Auditor → Auditor panel
7. [ ] Generate button → Modal → Success state

---

# PART 6: REFERENCE IMAGES

## Legora Screenshots for Figma Reference

1. **MS Word Plugin** - Sidebar compliance checker
   - Shows RYG scoring bar
   - Collapsible clause sections
   - "Apply all changes" action

2. **Tabular Review** - Main table interface
   - Add column modal with prompt
   - Run button per column
   - Date extraction example

3. **Drill-Down** - Answer + Reasoning pattern
   - Clean separation of what vs why
   - Jump-to navigation

4. **Chat Panel** - Slide overlay on table
   - Context indicator
   - Suggestion chips
   - Deep think toggle

5. **TrialView Research** - Answer format options
   - Multiple output formats
   - Inline citations with numbers

6. **Timeline Explorer** - 3-panel chronology
   - Summary → Events → Facts hierarchy
   - Exhibit references

---

<!-- ═══════════════════════════════════════════════════════════════════════════
     VERSION 3.0 - DECEMBER 3, 2024
     Added Overall User Flow - Complete application journey
═══════════════════════════════════════════════════════════════════════════ -->

# PART 7: OVERALL USER FLOW

> Complete user journey from onboarding through case lifecycle

---

## 7.1 Flow Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MIRAI360 APPLICATION FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
  │ ONBOARDING │───▶│  PREPARE   │───▶│  RESEARCH  │───▶│   CREATE   │
  │            │    │            │    │            │    │            │
  │ Login      │    │ Upload     │    │ Chat AI    │    │ Timeline   │
  │ Team Setup │    │ Manage     │    │ Search KB  │    │ Draft      │
  │ Case Setup │    │ Organize   │    │ Citations  │    │ Playbook   │
  └────────────┘    └────────────┘    └────────────┘    └────────────┘
```

---

## 7.2 Detailed Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: ONBOARDING                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                 │
│  │ Super Admin  │────▶│ Setup Firm   │────▶│ Invite Team  │                 │
│  │ Login/Signup │     │ Profile      │     │ Members      │                 │
│  └──────────────┘     └──────────────┘     └──────────────┘                 │
│         │                                         │                          │
│         │         ┌───────────────────────────────┘                          │
│         │         ▼                                                          │
│         │  ┌──────────────┐                                                  │
│         │  │ Associates   │  (Can login, create cases, use all features)    │
│         │  │ Login        │                                                  │
│         │  └──────────────┘                                                  │
│         │         │                                                          │
│         └────────┬┘                                                          │
│                  ▼                                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ CASE CREATION (Any User)                                             │   │
│  │                                                                       │   │
│  │  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐         │   │
│  │  │ + New Case   │────▶│ Select Type  │────▶│ Enter Case   │         │   │
│  │  │              │     │ (Litigation/ │     │ Details      │         │   │
│  │  │              │     │  Contract/   │     │ (Name, Parties│         │   │
│  │  │              │     │  Advisory)   │     │  Court, etc.) │         │   │
│  │  └──────────────┘     └──────────────┘     └──────────────┘         │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                         │                                    │
└─────────────────────────────────────────┼────────────────────────────────────┘
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: PREPARE (Document Management)                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                 │
│  │ Upload Docs  │────▶│ AI Processing│────▶│ Digital Twin │                 │
│  │ (Drag/Drop)  │     │ (OCR, Parse) │     │ Created      │                 │
│  │ Bulk Support │     │              │     │              │                 │
│  └──────────────┘     └──────────────┘     └──────────────┘                 │
│         │                                         │                          │
│         ▼                                         ▼                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ DOCUMENT VIEWS                                                        │   │
│  │                                                                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │ Case Docs   │  │ Firm KB     │  │ Tabular     │  │ Document    │  │   │
│  │  │ (This Case) │  │ (All Cases) │  │ Review      │  │ Viewer      │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  │        │                │                │                │          │   │
│  │        └────────────────┴────────────────┴────────────────┘          │   │
│  │                                   │                                   │   │
│  │                                   ▼                                   │   │
│  │                    ┌──────────────────────────┐                       │   │
│  │                    │ Organize: Tag, Categorize│                       │   │
│  │                    │ Filter, Search, Sort     │                       │   │
│  │                    └──────────────────────────┘                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                         │                                    │
└─────────────────────────────────────────┼────────────────────────────────────┘
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: RESEARCH (AI Analysis)                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ KNOWLEDGE BASES (Select Context)                                      │   │
│  │                                                                       │   │
│  │  ☑ Case Documents    ☑ Firm KB    ☐ Indian Kanoon    ☐ CaseMine     │   │
│  │  ☐ India Clauses     ☐ Web Search                                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                         │                                    │
│                                         ▼                                    │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                 │
│  │ Chat with AI │────▶│ Get Response │────▶│ Drill Down   │                 │
│  │ Ask Questions│     │ + Citations  │     │ View Sources │                 │
│  └──────────────┘     └──────────────┘     └──────────────┘                 │
│         │                                         │                          │
│         ▼                                         ▼                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ SPECIALIZED AGENTS                                                    │   │
│  │                                                                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │ Similar     │  │ Clause      │  │ Judge Bias  │  │ Compare     │  │   │
│  │  │ Case Agent  │  │ Agent       │  │ Agent       │  │ Agent       │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                         │                                    │
└─────────────────────────────────────────┼────────────────────────────────────┘
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 4: CREATE (Drafting & Output)                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────┐    ┌────────────────────────────┐           │
│  │ TIMELINE GENERATOR         │    │ CANVAS EDITOR              │           │
│  │ (Separate Screen)          │    │ (Document Drafting)        │           │
│  │                            │    │                            │           │
│  │ ┌────────────────────────┐ │    │ ┌────────────────────────┐ │           │
│  │ │ Auto-extract events    │ │    │ │ Rich Text (TipTap)     │ │           │
│  │ │ from case documents    │ │    │ │ Track Changes          │ │           │
│  │ │                        │ │    │ │ Version Control        │ │           │
│  │ │ Manual add/edit        │ │    │ │ DOCX Import/Export     │ │           │
│  │ │                        │ │    │ │                        │ │           │
│  │ │ Export to document     │ │    │ │ ┌──────────────────┐   │ │           │
│  │ └────────────────────────┘ │    │ │ │ AI SIDEBAR       │   │ │           │
│  │                            │    │ │ │                  │   │ │           │
│  └────────────────────────────┘    │ │ │ Run Playbook ────┼───┼─┼─────┐     │
│                                    │ │ │ See Issues       │   │ │     │     │
│                                    │ │ │ Apply Redlines   │   │ │     │     │
│                                    │ │ │ Risk Score       │   │ │     │     │
│                                    │ │ └──────────────────┘   │ │     │     │
│                                    │ └────────────────────────┘ │     │     │
│                                    └────────────────────────────┘     │     │
│                                                                       │     │
│  ┌────────────────────────────────────────────────────────────────────┘     │
│  │                                                                          │
│  ▼                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ PLAYBOOK SYSTEM                                                       │   │
│  │                                                                       │   │
│  │  Create Playbook ───▶ Define Clauses ───▶ Set Positions ───▶ Save   │   │
│  │  (Anyone can create)   (What to check)    (Rules/Red Lines)          │   │
│  │                                                                       │   │
│  │  Use Playbook ───▶ Auto-run on doc ───▶ Flag Issues ───▶ Suggest    │   │
│  │  (In Create sidebar)  (Periodic check)   (Risk Score)    (Redlines)  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                         │                                    │
│                                         ▼                                    │
│                          ┌──────────────────────────┐                       │
│                          │ EXPORT                   │                       │
│                          │                          │                       │
│                          │ • Clean DOCX             │                       │
│                          │ • Tracked Changes DOCX   │                       │
│                          │ • Timeline Document      │                       │
│                          └──────────────────────────┘                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7.3 User Roles & Permissions

| Action | Super Admin | Associate |
|--------|:-----------:|:---------:|
| Login | ✓ | ✓ |
| Invite Team Members | ✓ | ✗ |
| Manage Firm Settings | ✓ | ✗ |
| Create Case | ✓ | ✓ |
| Upload Documents | ✓ | ✓ |
| Use Research | ✓ | ✓ |
| Create Playbook | ✓ | ✓ |
| Use Create/Draft | ✓ | ✓ |
| Access Firm KB | ✓ | ✓ |

---

## 7.4 Navigation Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  mirai360.ai    [Dashboard] [Prepare] [Research] [Create]    Case:[▼] [AK] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PREPARE TAB                    RESEARCH TAB               CREATE TAB       │
│  ────────────                   ────────────               ──────────       │
│  • All Documents                • Chat Interface           • Timeline Gen   │
│  • Case Documents               • Conversation History     • Canvas Editor  │
│  • Firm KB                      • Knowledge Base Select    • Playbook Lib   │
│  • Upload New                                              • Templates      │
│  • Tabular Review                                          • Export         │
│                                                                              │
│  SETTINGS (Super Admin)                                                     │
│  ─────────────────────                                                      │
│  • Team Management                                                          │
│  • Firm Profile                                                             │
│  • Playbooks                                                                │
│  • Templates                                                                │
│  • Billing                                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7.5 Key Screen List (For Figma Design)

### Onboarding (4 screens)
1. Login / Signup
2. Firm Setup Wizard
3. Team Invite Modal
4. Associate Login

### Dashboard (2 screens)
5. Home Dashboard (case overview, recent activity)
6. Case Creation Modal

### Prepare Module (5 screens)
7. Document Library (All Docs / Case Docs / Firm KB tabs)
8. Document Upload Modal (bulk upload, processing queue)
9. Tabular Review Interface
10. Document Viewer (single doc with AI sidebar)
11. Document Tagging/Organization

### Research Module (4 screens)
12. Chat Interface (welcome + suggestions)
13. Chat with Response + Citations
14. Drill-Down Modal (source + reasoning)
15. Conversation History Sidebar

### Create Module (6 screens)
16. Timeline Generator (separate full screen)
17. Canvas Editor (main drafting view)
18. Canvas with AI Sidebar (playbook results)
19. Playbook Library
20. Playbook Builder (6-step wizard)
21. Export Options Modal

### Settings (3 screens)
22. Team Management
23. Firm Profile
24. Playbook Management

**Total: 24 Core Screens**

---

## 7.6 Document Flow (Case vs Firm KB)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DOCUMENT ORGANIZATION                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                         FIRM KNOWLEDGE BASE                         │     │
│  │                      (Accessible to all cases)                      │     │
│  │                                                                     │     │
│  │   📁 Templates    📁 Precedents    📁 Firm Policies    📁 Training  │     │
│  │                                                                     │     │
│  └─────────────────────────────┬──────────────────────────────────────┘     │
│                                │                                            │
│              ┌─────────────────┼─────────────────┐                          │
│              ▼                 ▼                 ▼                          │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Case A Documents │ │ Case B Documents │ │ Case C Documents │            │
│  │                  │ │                  │ │                  │            │
│  │ 📄 Pleadings     │ │ 📄 Contracts     │ │ 📄 Evidence      │            │
│  │ 📄 Evidence      │ │ 📄 Amendments    │ │ 📄 Affidavits    │            │
│  │ 📄 Correspondence│ │ 📄 Schedules     │ │ 📄 Orders        │            │
│  │                  │ │                  │ │                  │            │
│  │ (Case-specific)  │ │ (Case-specific)  │ │ (Case-specific)  │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  RESEARCH CONTEXT: User can select any combination                          │
│  ☑ Case A Docs  ☐ Case B Docs  ☑ Firm KB  ☑ Indian Kanoon                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

**Document Version**: 3.0
**Last Updated**: December 3, 2024
**Author**: Mirai360.ai Design Team

---

<!--
HOW TO ADD NEW UPDATES:
1. Add new version entry to VERSION HISTORY table at top
2. Update TABLE OF CONTENTS with new sections
3. Add version divider comment before new section:
   <!-- ═══════════════════════════════════════════════════════════════════════════
        VERSION X.X - DATE
        Description of changes
   ═══════════════════════════════════════════════════════════════════════════ - ->
4. Add your new section content
5. Update Document Version at bottom
-->
