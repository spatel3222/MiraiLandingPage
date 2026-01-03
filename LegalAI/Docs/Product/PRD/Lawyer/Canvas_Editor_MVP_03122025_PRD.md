# Canvas Editor MVP PRD

## L1 Features
+ Rich Text Canvas Editor (TipTap)
+ AI Sidebar Panel 
+ Playbook Integration
+ Track Changes & Redlining
+ Version Control
+ DOCX Import/Export

## L2 Features

### Rich Text Canvas Editor (TipTap Native)
+ TipTap-based WYSIWYG editor with legal document formatting
+ Full rich text: headings, bold, italic, underline, strikethrough
+ Paragraph styles: body, heading 1-6, quote, list (ordered/unordered)
+ Legal-specific: clause numbering, section references, defined terms highlighting
+ Table support for schedules and exhibits
+ Page breaks and section breaks
+ Find & replace with regex support
+ Keyboard shortcuts matching Word conventions
+ Zoom controls (50%-200%)
+ Print-friendly view mode

### AI Sidebar Panel
+ Collapsible right sidebar (resizable 300-500px)
+ Playbook analysis results
+ Issue cards with severity indicators
+ Inline suggestions with reasoning
+ Chat interface for document questions
+ Citation drill-down (click to view source)
+ Quick actions: Accept, Reject, Edit suggestion

### Playbook Integration
+ Run playbook against open document (auto run playbook as reocmmended interval to get metric)
+ Switch between playbooks
+ Real-time clause scanning
+ Risk score display (0-100)
+ Issue flagging with inline highlights
+ Jump-to-issue navigation
+ Bulk accept/reject suggestions

### Track Changes & Redlining
+ TipTap track-changes extension
+ Show insertions (green underline)
+ Show deletions (red strikethrough)
+ Change attribution (author + timestamp)
+ Accept/reject individual changes
+ Accept/reject all changes
+ Toggle track changes on/off
+ Compare versions side-by-side
+ Change summary panel

### Version Control
+ Auto-save with version snapshots
+ Manual version save with label
+ Version history timeline
+ Compare any two versions
+ Restore previous version
+ Version annotations/notes
+ Branch versions (alternative drafts)

### DOCX Import/Export
+ Import DOCX with formatting preservation
+ Import tracked changes from Word
+ Export to DOCX with tracked changes
+ Export clean version (changes accepted)
+ Export redline version (changes visible)
+ Preserve styles and numbering
+ Handle images and tables

### Comments & Annotations
+ Inline comments (highlight + comment)
+ Comment threads with replies
+ Resolve/unresolve comments
+ Filter comments by author/status
+ Export comments to separate document
+ AI-generated comments from playbook

---

## User Journey

### Journey 1: Review Incoming Contract with Playbook

**Step 1: Upload Document**
- Click "New Document" or drag DOCX into canvas
- Document renders in editor with formatting preserved

**Step 2: Select Playbook**
- Click "Run Playbook" in sidebar
- Select from library: "NDA - Tech Vendors"
- AI scans document (2-5 seconds)

**Step 3: Review Issues**
- Sidebar shows: Risk Score 72/100, 4 Issues Found
- Clauses with issues highlighted in document
- Click issue card → jumps to clause in document

**Step 4: Apply Redlines**
- Click issue → see suggested redline
- Preview: original vs suggested
- Click "Apply Redline" → tracked change inserted
- Or "Edit" to modify suggestion before applying

**Step 5: Finalize & Export**
- Review all tracked changes
- Accept/reject as needed
- Save version: "v2 - Post Playbook Review"
- Export DOCX with tracked changes for counterparty

### Journey 2: Draft New Document from Template

**Step 1: Start from Template**
- Click "New from Template"
- Select: "Standard NDA"
- Template loads with placeholders

**Step 2: Fill Placeholders**
- AI sidebar shows: "5 fields to complete"
- Click each → inline edit or sidebar form
- Party names, dates, specific terms

**Step 3: Customize Clauses**
- Edit clauses directly in canvas
- Track changes auto-enabled
- AI suggests improvements as you type

**Step 4: Run Compliance Check**
- Run firm playbook against draft
- Ensure draft meets firm standards
- Adjust any flagged issues

**Step 5: Save & Version**
- Save as: "Acme Corp NDA - Draft 1"
- Export clean DOCX for internal review

---

## Wireframes

### Wireframe 1: Main Canvas Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  mirai360.ai        Canvas Editor                          Case: XYZ   [AK] │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Import] [Save ▼] [Export ▼]  │  Acme_NDA_v2.docx        [Versions] [Share]│
├─────────────────────────────────────────────────────────────────────────────┤
│  [B] [I] [U] [S] │ [H1▼] │ [•] [1.] │ ["] │ [Table] │ [🔍] │ [Track ●] [💬] │
├─────────────────────────────────────────────────────────────┬───────────────┤
│                                                             │               │
│  ┌───────────────────────────────────────────────────────┐ │  AI Assistant │
│  │                                                       │ │  ───────────  │
│  │  CONFIDENTIALITY AGREEMENT                            │ │               │
│  │  ═══════════════════════════                          │ │  [Run Playbook│
│  │                                                       │ │   ▼ NDA-Tech] │
│  │  This Confidentiality Agreement ("Agreement") is      │ │               │
│  │  entered into as of December 3, 2024 ("Effective      │ │  ───────────  │
│  │  Date") by and between:                               │ │  Risk: 72/100 │
│  │                                                       │ │  ██████░░░░   │
│  │  1. Mirai360 Technologies Pvt. Ltd. ("Disclosing      │ │               │
│  │     Party"); and                                      │ │  Issues (4)   │
│  │  2. Acme Corporation ("Receiving Party")              │ │  ┌───────────┐│
│  │                                                       │ │  │🔴 Term: 5y││
│  │  1. DEFINITIONS                                       │ │  │  Exceeds  ││
│  │  ────────────────                                     │ │  │  max 3yr  ││
│  │  1.1 "Confidential Information" means all information │ │  │  [View]   ││
│  │  disclosed by either party...                         │ │  ├───────────┤│
│  │                                                       │ │  │🟡 Law: DE ││
│  │  2. TERM                                              │ │  │  Prefer IN││
│  │  ────────────────                                     │ │  │  [View]   ││
│  │ ┌─────────────────────────────────────────────────┐  │ │  ├───────────┤│
│  │ │ This Agreement shall remain in effect for five  │◄─┼─┼──│🟡 Dispute ││
│  │ │ (5) years from the Effective Date.              │  │ │  │  [View]   ││
│  │ └─────────────────────────────────────────────────┘  │ │  ├───────────┤│
│  │  ▲ Flagged: Exceeds maximum term                     │ │  │🟢 Defn: OK││
│  │                                                       │ │  │  [View]   ││
│  │  3. OBLIGATIONS                                       │ │  └───────────┘│
│  │  ────────────────                                     │ │               │
│  │  3.1 The Receiving Party agrees to:                   │ │  ───────────  │
│  │      (a) maintain confidentiality...                  │ │  [Chat]       │
│  │      (b) not disclose to third parties...             │ │  Ask about    │
│  │                                                       │ │  this doc...  │
│  │                                                       │ │  [Send →]     │
│  └───────────────────────────────────────────────────────┘ │               │
│  Page 1 of 4                              Zoom: [100% ▼]   │  [◀ Collapse] │
└─────────────────────────────────────────────────────────────┴───────────────┘
```

### Wireframe 2: Track Changes View
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  mirai360.ai        Canvas Editor                          Case: XYZ   [AK] │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Import] [Save ▼] [Export ▼]  │  Acme_NDA_v2.docx        [Versions] [Share]│
├─────────────────────────────────────────────────────────────────────────────┤
│  [B] [I] [U] [S] │ [H1▼] │ [•] [1.] │ ["] │ [Table] │ [🔍] │ [Track ●] [💬] │
├─────────────────────────────────────────────────────────────┬───────────────┤
│                                                             │               │
│  ┌───────────────────────────────────────────────────────┐ │  Changes (3)  │
│  │                                                       │ │  ───────────  │
│  │  2. TERM                                              │ │  [Accept All] │
│  │  ────────────────                                     │ │  [Reject All] │
│  │                                                       │ │               │
│  │  This Agreement shall remain in effect for            │ │  ┌───────────┐│
│  │  ~~five (5)~~ two (2) years from the Effective        │ │  │ Change 1  ││
│  │  Date, with mutual written consent to extend.         │ │  │ Term edit ││
│  │  ─────────────────────────────────────────            │ │  │ By: AI    ││
│  │  ▲ Insertion: "two (2)"          [✓] [✗]              │ │  │ 2:34 PM   ││
│  │  ▲ Deletion: "five (5)"          [✓] [✗]              │ │  │ [✓] [✗]   ││
│  │  ▲ Insertion: ", with mutual..." [✓] [✗]              │ │  ├───────────┤│
│  │                                                       │ │  │ Change 2  ││
│  │  ─────────────────────────────────────────────────    │ │  │ Law edit  ││
│  │                                                       │ │  │ By: AI    ││
│  │  8. GOVERNING LAW                                     │ │  │ 2:35 PM   ││
│  │  ────────────────                                     │ │  │ [✓] [✗]   ││
│  │                                                       │ │  ├───────────┤│
│  │  This Agreement shall be governed by the laws of      │ │  │ Change 3  ││
│  │  ~~Delaware~~ India.                                  │ │  │ Dispute   ││
│  │  ───────────────────                                  │ │  │ By: AI    ││
│  │  ▲ Deletion: "Delaware"          [✓] [✗]              │ │  │ 2:35 PM   ││
│  │  ▲ Insertion: "India"            [✓] [✗]              │ │  │ [✓] [✗]   ││
│  │                                                       │ │  └───────────┘│
│  │                                                       │ │               │
│  │  Legend:                                              │ │  ───────────  │
│  │  ~~strikethrough~~ = Deletion                         │ │  Summary:     │
│  │  underline         = Insertion                        │ │  +3 inserts   │
│  │                                                       │ │  -3 deletes   │
│  └───────────────────────────────────────────────────────┘ │  0 moves      │
│  Page 2 of 4                              Zoom: [100% ▼]   │               │
└─────────────────────────────────────────────────────────────┴───────────────┘
```

### Wireframe 3: Version History Panel
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Version History                                                       [X]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Acme_NDA.docx                                          [Compare Versions]  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Timeline                                                             │  │
│  │  ─────────────────────────────────────────────────────────────────    │  │
│  │                                                                       │  │
│  │  ● v4 - Final Signed                              Dec 5, 4:30 PM     │  │
│  │  │   Amit Kumar · "Executed version"                                  │  │
│  │  │   [View] [Restore] [Download]                                      │  │
│  │  │                                                                    │  │
│  │  ● v3 - Counterparty Redlines                     Dec 4, 2:15 PM     │  │
│  │  │   Imported · "Acme's markup received"                              │  │
│  │  │   +12 changes from v2                                              │  │
│  │  │   [View] [Restore] [Download] [Compare with v2]                    │  │
│  │  │                                                                    │  │
│  │  ● v2 - Post Playbook Review                      Dec 3, 3:45 PM     │  │
│  │  │   Amit Kumar · "Applied NDA playbook"                              │  │
│  │  │   +4 changes from v1                                               │  │
│  │  │   [View] [Restore] [Download] [Compare with v1]                    │  │
│  │  │                                                                    │  │
│  │  ● v1 - Initial Import                            Dec 3, 2:30 PM     │  │
│  │      Amit Kumar · "Original from Acme"                                │  │
│  │      [View] [Restore] [Download]                                      │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Auto-save: Every 30 seconds                        [Settings]              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Wireframe 4: Compare Versions (Side-by-Side)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Compare Versions                                                      [X]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Comparing: [v1 - Initial ▼]  vs  [v2 - Post Playbook ▼]    [Swap] [Merge] │
├──────────────────────────────────┬──────────────────────────────────────────┤
│  v1 - Initial Import             │  v2 - Post Playbook Review               │
│  Dec 3, 2:30 PM                  │  Dec 3, 3:45 PM                          │
├──────────────────────────────────┼──────────────────────────────────────────┤
│                                  │                                          │
│  2. TERM                         │  2. TERM                                 │
│  ────────────────                │  ────────────────                        │
│                                  │                                          │
│  This Agreement shall remain     │  This Agreement shall remain             │
│  in effect for five (5) years    │  in effect for two (2) years            │
│  from the Effective Date.        │  from the Effective Date, with           │
│                                  │  mutual written consent to extend.       │
│  ─────────────────────           │  ─────────────────────                   │
│  ▲ Changed in v2                 │  ▲ Updated                               │
│                                  │                                          │
│  ══════════════════════════════  │  ══════════════════════════════          │
│                                  │                                          │
│  8. GOVERNING LAW                │  8. GOVERNING LAW                        │
│  ────────────────                │  ────────────────                        │
│                                  │                                          │
│  This Agreement shall be         │  This Agreement shall be                 │
│  governed by the laws of         │  governed by the laws of                 │
│  Delaware.                       │  India.                                  │
│  ─────────────────────           │  ─────────────────────                   │
│  ▲ Changed in v2                 │  ▲ Updated                               │
│                                  │                                          │
├──────────────────────────────────┴──────────────────────────────────────────┤
│  Summary: 4 sections changed │ 2 additions │ 2 deletions │ 0 moves          │
│                                                                              │
│                              [ Close ]    [ Apply v2 Changes to Current ]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Wireframe 5: Redline Suggestion Modal
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Suggested Redline                                                     [X]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Clause: Term / Duration                                      🔴 Critical   │
│  Playbook: NDA - Tech Vendors                                               │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ ORIGINAL TEXT                                                         │  │
│  │ ───────────────────────────────────────────────────────────────────── │  │
│  │ This Agreement shall remain in effect for five (5) years from the    │  │
│  │ Effective Date.                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ SUGGESTED REDLINE                                                     │  │
│  │ ───────────────────────────────────────────────────────────────────── │  │
│  │ This Agreement shall remain in effect for ~~five (5)~~ two (2) years │  │
│  │ from the Effective Date, with mutual written consent to extend.      │  │
│  │                        ─────────────────────────────────────────      │  │
│  │                        ▲ Added fallback language                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ REASONING                                                             │  │
│  │ ───────────────────────────────────────────────────────────────────── │  │
│  │ • Red line triggered: "No terms exceeding 3 years"                    │  │
│  │ • Current term (5 years) exceeds maximum allowed (3 years)            │  │
│  │ • Applied preferred position: 2 years                                 │  │
│  │ • Added fallback: Extension clause per playbook guidelines            │  │
│  │                                                                       │  │
│  │ 📎 Reference: CFO Policy Update 2024 - NDA Terms                      │  │
│  │ ⚠️ Escalation: If 5+ years required, escalate to Partner              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│         [ Reject ]    [ Edit Before Apply ]    [ Apply Redline ]            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Wireframe 6: DOCX Import Modal
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Import Document                                                       [X]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │              📄 Drop DOCX file here or click to browse                │  │
│  │                                                                       │  │
│  │              Supports: .docx (Microsoft Word)                         │  │
│  │              Max file size: 25MB                                      │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Import Options                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ☑️ Preserve formatting (fonts, styles, spacing)                      │  │
│  │  ☑️ Import tracked changes from Word                                  │  │
│  │  ☑️ Import comments                                                   │  │
│  │  ☐  Convert to firm template styles                                   │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Associate with                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Case: [Select Case...                                            ▼] │  │
│  │  Folder: [Root / Contracts                                        ▼] │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│                              [ Cancel ]    [ Import Document ]              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Wireframe 7: Export Options Modal
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Export Document                                                       [X]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Document: Acme_NDA_v2.docx                                                 │
│                                                                              │
│  Export Format                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ● DOCX (Microsoft Word)                                              │  │
│  │  ○ Plain Text (.txt)                                                  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Track Changes                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ○ Clean version (all changes accepted)                               │  │
│  │  ● With tracked changes visible (for counterparty review)             │  │
│  │  ○ Redline comparison (original vs current)                           │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Include                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ☑️ Comments                                                          │  │
│  │  ☐  Version history metadata                                          │  │
│  │  ☐  AI analysis summary (as appendix)                                 │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Filename: [Acme_NDA_v2_redline.docx                                    ]   │
│                                                                              │
│                              [ Cancel ]    [ Export ]                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Stack

### Editor Core
+ **TipTap** (native) - Headless rich text editor framework
+ TipTap Pro extensions for enterprise features
+ Track changes via TipTap/ProseMirror plugin

### Key TipTap Extensions
+ `@tiptap/starter-kit` - Basic formatting
+ `@tiptap/extension-table` - Table support
+ `@tiptap/extension-highlight` - Clause highlighting
+ `@tiptap/extension-track-changes` (Pro) - Redlining
+ `@tiptap/extension-comments` (Pro) - Inline comments
+ Custom extension: Legal clause numbering

### DOCX Processing
+ `mammoth.js` - DOCX to HTML import
+ `docx` library - HTML to DOCX export
+ Preserve tracked changes on import/export

### Version Control
+ Backend: Document versions stored as JSON diffs
+ Frontend: Version timeline UI component
+ Compare: diff-match-patch for text comparison

---

## Custom Sub-Agents / Services

+ *DocParserAgent*: Parse uploaded DOCX, extract structure and tracked changes
+ *ClauseHighlighterAgent*: Identify and highlight clause boundaries in document
+ *RedlineGeneratorAgent*: Generate precise redline suggestions from playbook
+ *VersionDiffAgent*: Compute and visualize differences between document versions
+ *ExportFormatterAgent*: Convert canvas content to properly formatted DOCX

---

## Open Questions

**Dec 3 2024 - Initial Draft**
- TipTap Pro license cost and terms for enterprise features?
- Offline editing support needed for MVP?
- Max document size/page count for performance?
- How to handle complex Word features (headers/footers, TOC, footnotes)?
- Integration with existing case/matter structure in Prepare module?

**Next Steps:**
- Technical spike: TipTap track changes POC
- UX review: Toolbar layout and keyboard shortcuts
- Legal review: Required export formats for court filing
- Evaluate: mammoth.js vs docx4js for DOCX fidelity

---

## References

- [Legora Word Add-In](https://legora.com/product/word-add-in) - Playbook integration patterns
- [TipTap Enterprise](https://tiptap.dev/enterprise) - Track changes, collaboration features
- [Spellbook Redlining Guide](https://www.spellbook.legal/learn/redline-contracts) - AI contract redlining best practices
- [Gavel AI Redlining](https://www.gavel.io/resources/redlining-with-ai-the-new-playbook-for-contract-review) - Playbook-based review patterns
