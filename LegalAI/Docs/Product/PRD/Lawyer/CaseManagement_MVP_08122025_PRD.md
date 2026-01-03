# Case Management MVP PRD

## L1 Features
+ Client Management
+ Matter Management (Optional)
+ Case Management with eCourts Integration, CNR Auto-Fetch (SC + 30 HCs + District Courts + Tribunals)
+ Hearing & Cause List Tracking (nice to have)
+ Appeal & Order Alerts (nice to have)

## L2 Features

### Client Management
+ Add client (Company / Individual)
+ Client details: Name, Type, PAN/GSTIN, Contact Person, Email, Phone
+ View all matters and cases under a client
+ Search/filter clients

### Matter Management (Optional)
+ Create matter linked to client (or standalone)
+ Matter details: Name, Practice Area, Team Members
+ Group multiple cases under one matter
+ Skip matter - link case directly to client

### Case Management
+ Create case manually or via eCourts import
+ Case fields: Case Number, Court, Bench, Stage, Parties, Next Hearing, CNR (auto-fetched)
+ Firm's Role: Petitioner / Respondent / Intervenor / Amicus
+ Multi-party support: List of Petitioners, List of Respondents
+ Assign team members to case
+ Link documents, notes, tasks to case

### eCourts Auto-Fetch (Primary: Case Number + Court)
+ **Primary input:** Court + Case Type + Case Number + Year → Fetch from eCourts
+ **Fallback input:** CNR number (if user has it)
+ Auto-populate: Filing Date, Parties, Stage, Next Hearing, CNR
+ Court coverage: Supreme Court, 30+ High Courts, District Courts, Tribunals (NCLT, ITAT)
+ Manual override if auto-fetch fails
+ Periodic sync: Refresh case status daily (nice to have)

**Why Case Number over CNR?**
+ Lawyers know Case Number (on court orders, client communications)
+ CNR is 16-digit eCourts ID - rarely known by lawyers
+ API converts Case Number → CNR internally for tracking

### Hearing & Cause List Tracking (nice to have)
+ Auto-sync next hearing date from eCourts
+ Daily cause list download (PDF export)
+ In-portal calendar view of all upcoming hearings
+ Notification when case appears in cause list (day before)

### Appeal & Order Alerts (nice to have)
+ Enable per-case: "Monitor for appeals"
+ Daily check: New filings with same parties in higher forums
+ Order upload alert: Notify when new order/judgment uploaded
+ In-portal alert: Bell notification + alert badge
+ Alert shows: Appeal/Order details, court, date

---

## User Journey

**Add New Case (eCourts Import):**
Select Client (optional) → Select Court → Select Case Type → Enter Case Number + Year → Fetch Details → Review Auto-filled Data → Set Firm's Role → Assign Team → Save

**Add New Case (Manual):**
Select Client (optional) → Enter Case Details Manually → Set Firm's Role → Assign Team → Save

**View Case Updates:**
Dashboard → Cases with Updates → Click Case → View Synced Hearing Date / Appeal Alert

---

## Visual

### Import Case Modal - BEFORE vs AFTER

**BEFORE (Current - CNR only)**
```
┌─────────────────────────────────────────────────────────────┐
│  Import Case via CNR                                   [X]  │
├─────────────────────────────────────────────────────────────┤
│  Step 1: Enter CNR Number                                   │
│  ┌─────────────────────────────────┐                        │
│  │ DLHC01-000123-2024              │  [Fetch from eCourts]  │
│  └─────────────────────────────────┘                        │
│  Format: COURTCODE-CASENUM-YEAR                             │
│                                                             │
│  ⚠️ Problem: Lawyers rarely know CNR                        │
└─────────────────────────────────────────────────────────────┘
```

**AFTER (New - Case Number + Court)**
```
┌─────────────────────────────────────────────────────────────┐
│  Import Case from eCourts                              [X]  │
├─────────────────────────────────────────────────────────────┤
│  Step 1: Select Court                                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Delhi High Court                                  ▼ │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Step 2: Case Details                                       │
│  Case Type        Case Number         Year                  │
│  ┌───────────┐    ┌───────────┐      ┌────────┐            │
│  │ WP(C)   ▼ │    │ 123       │      │ 2024   │            │
│  └───────────┘    └───────────┘      └────────┘            │
│                                                             │
│                         [Fetch from eCourts]                │
│                                                             │
│  ── or have CNR? ───────────────────────────────────────    │
│  ┌─────────────────────────────────┐                        │
│  │ DLHC01-000123-2024              │  [Fetch]               │
│  └─────────────────────────────────┘                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ── Auto-populated from eCourts ────────────────────────    │
│                                                             │
│  Case Number:     WP(C) 123/2024                            │
│  Court:           Delhi High Court                          │
│  CNR:             DLHC01-000123-2024  (auto-fetched)        │
│  Filing Date:     15-Mar-2024                               │
│  Next Hearing:    20-Dec-2024                               │
│  Stage:           Arguments                                 │
│  Petitioner:      ABC Pvt Ltd                               │
│  Respondent:      XYZ Corp                                  │
│                                                             │
│  ── Your Firm's Details ────────────────────────────────    │
│  Client           [Select Client        ▼]  (optional)      │
│  Matter           [Select/Create Matter ▼]  (optional)      │
│  Firm's Role      (●) Petitioner  ( ) Respondent            │
│  Team             [Amit K ×] [+ Add]                        │
│                                                             │
│                    [Cancel]  [Create Case]                  │
└─────────────────────────────────────────────────────────────┘
```

### Key UI Changes for Figma

| Element | BEFORE | AFTER |
|---------|--------|-------|
| **Primary Input** | CNR Number (16 digits) | Court + Case Type + Number + Year |
| **Modal Title** | "Import Case via CNR" | "Import Case from eCourts" |
| **Input Fields** | 1 field (CNR) | 4 fields (Court dropdown, Case Type dropdown, Number, Year) |
| **CNR Field** | Primary (required) | Secondary (optional fallback) |
| **Court Selection** | None | Dropdown with SC, 30 HCs, Districts |
| **Case Type** | None | Dropdown (WP, CS, CRL, etc.) |
| **Auto-populated CNR** | N/A | Show CNR after fetch (read-only) |

### Data Hierarchy

**BEFORE (Current)**
```
CASE
    ├── Case Name
    ├── Firm's Role (Claimant/Defendant/Neutral)
    ├── Case Type
    ├── Team Members
    └── Description
```

**AFTER (New)**
```
CLIENT (optional)
    │   ├── Name, Type (Company/Individual)
    │   ├── PAN/GSTIN, Contact
    │   └── Matters count, Cases count
    │
    └── MATTER (optional)
            │   ├── Name, Practice Area
            │   ├── Team Members
            │   └── Cases count
            │
            └── CASE
                    ├── CNR / Case Number (auto-fetched)
                    ├── Court + Bench
                    ├── Parties (Petitioners[], Respondents[])
                    ├── Firm's Role
                    ├── Stage + Next Hearing (auto-synced)
                    ├── Team Members
                    ├── Documents, Notes, Tasks
                    └── Appeal Alerts (monitored)
```

---

## Custom Sub-Agents / Services

+ *eCourtsService*: Surepass API integration for CNR lookup (SC, HC, District, Tribunals)
+ *CaseSyncWorker*: Daily background job to refresh case status + next hearing from eCourts
+ *CauseListWorker*: Daily fetch of cause lists, match against user's cases, send alerts
+ *AppealMonitorWorker*: Daily check for new appeals against monitored cases
+ *OrderAlertWorker*: Check for new orders/judgments uploaded on tracked cases

---

## Assumptions
+ Surepass API provides reliable CNR data for District Courts
+ High Court case lookup available via hcservices.ecourts.gov.in or Surepass
+ User has internet connectivity for eCourts sync
+ Appeal detection based on party name matching (not guaranteed 100%)

## Backlog features 
+ Email/SMS alerts? v1 is in-portal only, expand later?
+ Live court display board? Stream court proceedings status?
+ Calendar view 

## Reference
+ Zelican Case Management: zelican.com/legal-case-management-software/
+ eCourts Services: ecourts.gov.in
+ Surepass CNR API: surepass.io/ecourt-cnr-search-api/
