# Case Management - Technical Discovery

**Date:** December 8, 2025
**Related PRD:** CaseManagement_MVP_08122025_PRD.md

---

## 1. eCourts API Options

### Option A: Kleopatra / ECIAPI (Recommended)

| Attribute | Details |
|-----------|---------|
| **Provider** | Kleopatra (court-api.kleopatra.io) |
| **Coverage** | District Courts, High Courts, Supreme Court, NCLT, Consumer Forum |
| **Format** | JSON |
| **Response Time** | ~3 seconds avg |
| **Pricing** | Free for non-commercial, Pay-per-request for commercial |
| **Free Trial** | 30 requests |
| **Architecture** | Dedicated tenant instances |

**Why Recommended:** Covers all required courts (SC + HC + District + Tribunals), real-time data, JSON format ready for integration.

**Contact:** kleopatra.support (for API keys and commercial pricing)

---

### Option B: Surepass eCourt CNR API

| Attribute | Details |
|-----------|---------|
| **Provider** | Surepass (surepass.io) |
| **Coverage** | District Courts via CNR |
| **Format** | JSON |
| **Pricing** | ~₹2-5 per lookup (estimated) |
| **Authentication** | API Key / OAuth |

**Data Returned:**
- Case status
- Petitioner details
- Respondent details
- Advocate details
- Court information
- Interim details
- Case history
- Judgment info

**Best for:** District Court CNR lookups, background verification use cases.

**Limitation:** High Court and Tribunal coverage unclear.

---

### Option C: OpenJustice Python Library (Self-Hosted)

| Attribute | Details |
|-----------|---------|
| **Type** | Open-source Python library |
| **Repo** | openjustice-in/ecourts (GitHub) |
| **Base URL** | `https://hcservices.ecourts.gov.in/ecourtindiaHC` |
| **Coverage** | High Courts |
| **Cost** | Free (self-hosted) |
| **Risk** | CAPTCHA handling required, may break if eCourts changes |

**Key Methods:**

```python
from ecourts import ECourt, Court

# Initialize
ecourt = ECourt(court=Court.DELHI_HC)

# Search by case number
case = ecourt.searchSingleCase("WP(C)/123/2024", case_type="WP(C)")

# Get case history
history = ecourt.getCaseHistory(case)

# Get cause list for date
cause_list = ecourt.getCauseLists(date="08-12-2025")

# Download order PDF
ecourt.downloadOrder(order, case, filename="order.pdf")
```

**API Endpoints (underlying):**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/cases/case_no_qry.php` | POST | Search by case number |
| `/cases/s_casetype_qry.php` | POST | Search by case type |
| `/cases/o_civil_case_history.php` | POST | Get case history |
| `/cases/s_orderdate_qry.php` | POST | Orders by date |
| `/cases/display_pdf.php` | GET | Download order PDF |
| `/cases/highcourt_causelist_qry.php` | POST | Cause list by date |

**Common Parameters:**
- `__csrf_magic` - Security token
- `state_cd` - State code
- `dist_cd` - District code
- `court_code` - Court identifier
- `captcha` - Solved CAPTCHA

---

## 2. Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (React)                                                │
│  ├── Create Case Modal (CNR input + auto-fetch)                  │
│  ├── Case Detail View (synced data display)                      │
│  └── Alerts Panel (appeal/order notifications)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND API (Node.js / Python)                                  │
│  ├── POST /api/cases/lookup-cnr          → Fetch from eCourts   │
│  ├── POST /api/cases                      → Create case          │
│  ├── GET  /api/cases/:id                  → Get case details     │
│  ├── GET  /api/cases/:id/sync             → Manual refresh       │
│  ├── GET  /api/clients                    → List clients         │
│  ├── POST /api/clients                    → Create client        │
│  └── GET  /api/alerts                     → Get user alerts      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  eCOURTS SERVICE (Wrapper)                                       │
│  ├── lookupByCNR(cnr)           → District Courts               │
│  ├── lookupByCaseNumber(...)    → High Courts                   │
│  ├── getCauseList(court, date)  → Daily cause list              │
│  └── checkForAppeals(parties)   → Appeal detection              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  EXTERNAL APIs                                                   │
│  ├── Kleopatra API (Primary)    → SC, HC, District, NCLT        │
│  ├── Surepass API (Fallback)    → District Courts               │
│  └── Direct eCourts (Backup)    → If APIs fail                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKGROUND WORKERS (Cron Jobs)                                  │
│  ├── CaseSyncWorker       → Daily 6 AM: Refresh all cases       │
│  ├── CauseListWorker      → Daily 7 AM: Fetch cause lists       │
│  ├── AppealMonitorWorker  → Daily 8 AM: Check for new appeals   │
│  └── OrderAlertWorker     → Daily 9 AM: Check for new orders    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### Clients Table
```sql
CREATE TABLE clients (
    id              UUID PRIMARY KEY,
    org_id          UUID REFERENCES organizations(id),
    name            VARCHAR(255) NOT NULL,
    type            ENUM('company', 'individual'),
    pan             VARCHAR(10),
    gstin           VARCHAR(15),
    contact_person  VARCHAR(255),
    email           VARCHAR(255),
    phone           VARCHAR(20),
    address         TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP
);
```

### Matters Table
```sql
CREATE TABLE matters (
    id              UUID PRIMARY KEY,
    org_id          UUID REFERENCES organizations(id),
    client_id       UUID REFERENCES clients(id),  -- nullable
    name            VARCHAR(255) NOT NULL,
    practice_area   VARCHAR(100),
    status          ENUM('active', 'closed'),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP
);
```

### Cases Table (Enhanced)
```sql
CREATE TABLE cases (
    id                  UUID PRIMARY KEY,
    org_id              UUID REFERENCES organizations(id),
    client_id           UUID REFERENCES clients(id),      -- nullable
    matter_id           UUID REFERENCES matters(id),      -- nullable

    -- eCourts Data (auto-fetched)
    cnr                 VARCHAR(20) UNIQUE,
    case_number         VARCHAR(50),
    court_name          VARCHAR(255),
    court_type          ENUM('supreme_court', 'high_court', 'district', 'nclt', 'itat', 'other'),
    bench               VARCHAR(255),
    filing_date         DATE,
    registration_date   DATE,

    -- Parties (JSONB for flexibility)
    petitioners         JSONB,  -- [{name, advocate}]
    respondents         JSONB,  -- [{name, advocate}]

    -- Status
    stage               VARCHAR(100),
    next_hearing_date   DATE,
    case_status         ENUM('pending', 'disposed', 'transferred'),

    -- Firm Details
    firm_role           ENUM('petitioner', 'respondent', 'intervenor', 'amicus'),
    case_type           VARCHAR(100),
    description         TEXT,

    -- Sync Metadata
    ecourts_last_synced TIMESTAMP,
    ecourts_sync_error  TEXT,
    appeal_monitoring   BOOLEAN DEFAULT false,

    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP
);

CREATE INDEX idx_cases_cnr ON cases(cnr);
CREATE INDEX idx_cases_next_hearing ON cases(next_hearing_date);
CREATE INDEX idx_cases_client ON cases(client_id);
```

### Case Team Members Table
```sql
CREATE TABLE case_team_members (
    id          UUID PRIMARY KEY,
    case_id     UUID REFERENCES cases(id),
    user_id     UUID REFERENCES users(id),
    role        VARCHAR(50),  -- 'lead', 'associate', 'paralegal'
    created_at  TIMESTAMP DEFAULT NOW()
);
```

### Alerts Table
```sql
CREATE TABLE alerts (
    id              UUID PRIMARY KEY,
    org_id          UUID REFERENCES organizations(id),
    case_id         UUID REFERENCES cases(id),
    user_id         UUID REFERENCES users(id),
    type            ENUM('hearing', 'cause_list', 'appeal', 'order', 'status_change'),
    title           VARCHAR(255),
    message         TEXT,
    metadata        JSONB,
    is_read         BOOLEAN DEFAULT false,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_unread ON alerts(user_id, is_read);
```

---

## 4. API Endpoints

### CNR Lookup
```
POST /api/ecourts/lookup

Request:
{
    "cnr": "DLHC010012342024",
    "court_type": "high_court"  // optional hint
}

Response:
{
    "success": true,
    "data": {
        "cnr": "DLHC010012342024",
        "case_number": "CS(COMM) 123/2024",
        "court_name": "Delhi High Court",
        "bench": "Single Bench",
        "filing_date": "2024-03-15",
        "registration_date": "2024-03-18",
        "petitioners": [
            {"name": "ABC Pvt Ltd", "advocate": "Adv. Sharma"}
        ],
        "respondents": [
            {"name": "XYZ Corp", "advocate": "Adv. Verma"}
        ],
        "stage": "Arguments",
        "next_hearing_date": "2024-12-20",
        "case_status": "pending"
    }
}

Error Response:
{
    "success": false,
    "error": "CNR_NOT_FOUND",
    "message": "No case found for the given CNR"
}
```

### Create Case (with optional CNR auto-fetch)
```
POST /api/cases

Request:
{
    "cnr": "DLHC010012342024",       // triggers auto-fetch if provided
    "client_id": "uuid",             // optional
    "matter_id": "uuid",             // optional
    "firm_role": "petitioner",
    "team_member_ids": ["uuid1", "uuid2"],
    "appeal_monitoring": true,

    // Manual fields (used if CNR not provided or fetch fails)
    "case_number": "CS(COMM) 123/2024",
    "court_name": "Delhi High Court",
    "petitioners": [...],
    "respondents": [...]
}
```

### Sync Case Status
```
POST /api/cases/:id/sync

Response:
{
    "success": true,
    "changes": {
        "next_hearing_date": {
            "old": "2024-12-15",
            "new": "2024-12-20"
        },
        "stage": {
            "old": "Admission",
            "new": "Arguments"
        }
    },
    "synced_at": "2024-12-08T12:00:00Z"
}
```

### Get Cause List
```
GET /api/cause-list?court=delhi_hc&date=2024-12-09

Response:
{
    "court": "Delhi High Court",
    "date": "2024-12-09",
    "cases": [
        {
            "case_number": "CS(COMM) 123/2024",
            "court_room": "Court 5",
            "item_number": 12,
            "is_tracked": true,  // matches user's case
            "case_id": "uuid"    // if tracked
        }
    ],
    "tracked_count": 3
}
```

---

## 5. Background Workers

### CaseSyncWorker
```python
# Runs: Daily 6:00 AM IST
# Purpose: Refresh case status for all tracked cases

def run():
    cases = get_cases_with_monitoring_enabled()

    for case in cases:
        try:
            new_data = ecourts_service.lookup(case.cnr)

            if new_data.next_hearing_date != case.next_hearing_date:
                create_alert(
                    case_id=case.id,
                    type='hearing',
                    title='Hearing Date Changed',
                    message=f'New date: {new_data.next_hearing_date}'
                )

            if new_data.stage != case.stage:
                create_alert(
                    case_id=case.id,
                    type='status_change',
                    title='Case Stage Updated',
                    message=f'New stage: {new_data.stage}'
                )

            update_case(case.id, new_data)

        except Exception as e:
            log_sync_error(case.id, str(e))
```

### CauseListWorker
```python
# Runs: Daily 7:00 AM IST
# Purpose: Check if any tracked case appears in tomorrow's cause list

def run():
    tomorrow = date.today() + timedelta(days=1)
    courts = get_unique_courts_from_tracked_cases()

    for court in courts:
        cause_list = ecourts_service.get_cause_list(court, tomorrow)

        for item in cause_list:
            matching_case = find_case_by_number(item.case_number)

            if matching_case:
                create_alert(
                    case_id=matching_case.id,
                    type='cause_list',
                    title='Case Listed Tomorrow',
                    message=f'Court Room {item.court_room}, Item #{item.item_number}'
                )
```

### AppealMonitorWorker
```python
# Runs: Daily 8:00 AM IST
# Purpose: Check for new appeals filed against monitored cases

def run():
    cases = get_cases_with_appeal_monitoring()

    for case in cases:
        # Search in higher forums
        higher_courts = get_appeal_courts(case.court_type)

        for court in higher_courts:
            appeals = ecourts_service.search_by_party(
                court=court,
                party_name=case.petitioners[0].name
            )

            for appeal in appeals:
                if is_related_appeal(case, appeal):
                    create_alert(
                        case_id=case.id,
                        type='appeal',
                        title='Appeal Filed',
                        message=f'New appeal: {appeal.case_number} in {court}'
                    )
```

---

## 6. Court Codes Reference

### High Courts
| Court | Code | eCourts URL |
|-------|------|-------------|
| Supreme Court | SCIND | main.sci.gov.in |
| Delhi HC | DLHC | delhihighcourt.nic.in |
| Bombay HC | MBHC | bombayhighcourt.nic.in |
| Madras HC | MDHC | hcmadras.tn.nic.in |
| Calcutta HC | WBHC | calcuttahighcourt.gov.in |
| Karnataka HC | KRHC | karnatakajudiciary.kar.nic.in |

### CNR Format
```
CNR: XXYYZZZZZZZZYYYY

XX   = State Code (e.g., DL for Delhi)
YY   = District Code
ZZZZZZZZZZ = Sequential Number
YYYY = Year
```

Example: `DLHC010012342024`
- DL = Delhi
- HC = High Court
- 01 = Bench/Division
- 0012342024 = Case reference

---

## 7. Error Handling

| Error Code | Meaning | Action |
|------------|---------|--------|
| `CNR_NOT_FOUND` | Invalid or non-existent CNR | Show user error, allow manual entry |
| `CAPTCHA_FAILED` | eCourts CAPTCHA blocked | Retry with delay, fallback to manual |
| `RATE_LIMITED` | Too many API requests | Queue request, retry after cooldown |
| `SERVICE_DOWN` | eCourts/API unavailable | Show cached data, queue for later sync |
| `SYNC_PARTIAL` | Some fields failed to update | Log error, show last known data |

---

## 8. Implementation Phases

### Phase 1: Core Case Management (Week 1-2)
- [ ] Client CRUD APIs
- [ ] Matter CRUD APIs (optional layer)
- [ ] Enhanced Case schema with new fields
- [ ] Basic Create/Edit Case UI

### Phase 2: eCourts Integration (Week 2-3)
- [ ] Integrate Kleopatra API
- [ ] CNR lookup endpoint
- [ ] Auto-populate on case creation
- [ ] Manual sync button

### Phase 3: Background Sync (Week 3-4)
- [ ] CaseSyncWorker (daily refresh)
- [ ] CauseListWorker (day-before alerts)
- [ ] Alerts table + notification UI

### Phase 4: Appeal Monitoring (Week 4-5)
- [ ] AppealMonitorWorker
- [ ] Party name search across higher courts
- [ ] Appeal alert notifications

---

## 9. External Dependencies

| Dependency | Purpose | Fallback |
|------------|---------|----------|
| Kleopatra API | Primary eCourts data | Surepass API |
| Surepass API | Backup for District Courts | Direct scraping |
| eCourts Portal | Source of truth | N/A (required) |

---

## 10. References

- [Kleopatra eCourts API](https://court-api.kleopatra.io)
- [Surepass CNR API](https://surepass.io/ecourt-cnr-search-api/)
- [OpenJustice Python Library](https://openjustice-in.github.io/ecourts/)
- [eCourts India Portal](https://ecourts.gov.in/)
- [High Court Services](https://hcservices.ecourts.gov.in/)
