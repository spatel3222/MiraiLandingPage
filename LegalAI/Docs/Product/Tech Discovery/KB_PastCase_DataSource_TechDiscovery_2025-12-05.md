# Deep Analysis: Indian Legal Data Acquisition Strategy

**Date:** December 5, 2025
**Objective:** Build RAG system for lawyers with SC + HC judgments, 24-hour data freshness

---

## The Core Problem

You need **24-hour fresh data** for SC + HC judgments. This document maps out each source's actual capability.

---

## Source Analysis

### 1. AWS Open Data (Dattam Labs)

| Attribute | Finding |
|-----------|---------|
| **Coverage** | 25 HCs + SC, 1950-2025, ~16.7M judgments |
| **Format** | PDFs + JSON/Parquet metadata |
| **Size** | ~1.1 TB |
| **Update frequency** | **Quarterly** (every 3 months) |
| **Freshness gap** | **Up to 90 days behind** |
| **Access** | Free, no auth: `aws s3 sync --no-sign-request` |
| **Links** | [AWS Registry](https://registry.opendata.aws/indian-high-court-judgments/), [GitHub](https://github.com/vanga/indian-high-court-judgments) |

**Best for**: One-time bulk historical dump
**Problem**: 90-day lag unacceptable for 24-hour requirement

---

### 2. Indian Kanoon

| Attribute | Finding |
|-----------|---------|
| **Coverage** | SC, 24 HCs, District Courts, 11+ Tribunals |
| **API** | Yes - [api.indiankanoon.org](https://api.indiankanoon.org/documentation/) |
| **Pricing** | Search: ₹0.50/call, Doc: ₹0.20/call, Meta: ₹0.02/call |
| **Free tier** | ₹500 signup + ₹10,000/month (non-commercial, needs approval) |
| **RSS feeds** | Yes - [indiankanoon.org/feeds/](https://indiankanoon.org/feeds/) - per court |
| **Freshness** | **Unknown** - likely 24-72 hours (not documented) |

**Best for**: Daily delta sync via RSS + API
**Risk**: Freshness not guaranteed <24 hours, cost at scale

**Cost estimate for daily sync:**
- ~200 new HC judgments/day × ₹0.70 (search + doc) = ₹140/day = **₹4,200/month**

---

### 3. eCourts Direct (judgments.ecourts.gov.in)

| Attribute | Finding |
|-----------|---------|
| **Coverage** | SC, all HCs, District Courts |
| **API** | **No official API** |
| **Access** | Web scraping only |
| **Blockers** | CAPTCHA on every request, CSRF tokens |
| **Freshness** | **Real-time** (source of truth) |
| **Links** | [judgments.ecourts.gov.in](https://judgments.ecourts.gov.in/), [hcservices.ecourts.gov.in](https://hcservices.ecourts.gov.in/) |

**Best for**: Most current data
**Problem**: Requires captcha solving, legally gray, fragile

---

### 4. Kleopatra API

| Attribute | Finding |
|-----------|---------|
| **Coverage** | 700+ District, 25 HCs, SC, NCLT, CAT |
| **API** | Yes - RESTful with OpenAPI spec |
| **Pricing** | **Free: 10,000 calls/month** (research/education) |
| **Freshness** | Claims "real-time, no caching" |
| **Docs** | [e-courts-india-api.readme.io](https://e-courts-india-api.readme.io/) |
| **Links** | [court-api.kleopatra.io](https://court-api.kleopatra.io/) |

**Best for**: Real-time lookups, potentially daily sync
**Risk**: Third-party dependency, commercial terms unclear, 10K limit may be tight

---

### 5. OpenJustice eCourts Scraper

| Attribute | Finding |
|-----------|---------|
| **Coverage** | All HC benches |
| **Method** | Python library, handles sessions |
| **Rate** | **Single-threaded by design** (to not overload servers) |
| **CAPTCHA** | Does not solve - expects manual/external |
| **Freshness** | As fresh as eCourts (real-time) |
| **Links** | [github.com/openjustice-in/ecourts](https://github.com/openjustice-in/ecourts) |

**Best for**: Building custom scraper foundation
**Problem**: Slow (single-threaded), no captcha solving built-in

---

## Gap Analysis

| Requirement | AWS | Kanoon | eCourts | Kleopatra | OpenJustice |
|-------------|-----|--------|---------|-----------|-------------|
| Historical bulk | ✅ | ❌ | ❌ | ❌ | ❌ |
| 24-hour freshness | ❌ | ⚠️ | ✅ | ✅? | ✅ |
| No CAPTCHA | ✅ | ✅ | ❌ | ✅ | ❌ |
| Free/low cost | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| Reliable/stable | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Legal clarity | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |

---

## Recommended 3-Phase Strategy

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: ONE-TIME DUMP (Historical)                        │
│  Source: AWS Open Data                                      │
│  Data: SC + 25 HCs, 1950-2025                              │
│  Method: aws s3 sync --no-sign-request                     │
│  Size: ~1.1 TB                                              │
│  Time: 1-2 days download + processing                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 2: GAP FILL (AWS last update → today)                │
│  Source: Indian Kanoon API + RSS                            │
│  Method:                                                    │
│    1. Get AWS dataset's last judgment date per court        │
│    2. Query Kanoon for judgments after that date            │
│    3. Fetch missing documents via API                       │
│  Est. gap: ~30-90 days worth                                │
│  Cost: ₹2,000-5,000 one-time                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 3: DAILY SYNC (24-hour freshness)                    │
│  PRIMARY: Kleopatra API (if <24hr freshness confirmed)      │
│  FALLBACK: Indian Kanoon RSS + API                          │
│  BACKUP: OpenJustice scraper (for gaps)                     │
│                                                             │
│  Daily job:                                                 │
│    06:00 IST - Poll Kleopatra for yesterday's judgments    │
│    07:00 IST - Cross-check with Kanoon RSS feed            │
│    08:00 IST - Fetch any missing via Kanoon API            │
│    09:00 IST - Index to vector DB                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: One-Time Dump Details

### Download Commands

```bash
# Supreme Court judgments
aws s3 sync s3://indian-supreme-court-judgments/ ./data/sc/ --no-sign-request

# High Court judgments (full ~1TB)
aws s3 sync s3://indian-high-court-judgments/ ./data/hc/ --no-sign-request

# High Court - specific court only (example: Delhi HC)
aws s3 sync s3://indian-high-court-judgments/data/tar/ ./data/hc/ \
  --exclude "*" --include "*/court=27_1/*" --no-sign-request
```

### Data Structure

```
data/
├── pdf/year=YYYY/court=xyz/bench=xyz/judgment1.pdf
├── metadata/json/year=YYYY/court=xyz/bench=xyz/judgment1.json
├── metadata/parquet/year=YYYY/court=xyz/bench=xyz/metadata.parquet
└── tar/year=YYYY/court=xyz/bench=xyz/pdfs.tar
```

---

## Phase 2: Gap Fill Details

### Indian Kanoon API Endpoints

| Endpoint | Cost | Use |
|----------|------|-----|
| `/search/?formInput=<query>&pagenum=<n>` | ₹0.50 | Find judgments by date range |
| `/doc/<docid>/` | ₹0.20 | Get full judgment text |
| `/docmeta/<docid>/` | ₹0.02 | Get metadata only |
| `/origdoc/<docid>/` | ₹0.50 | Get original court copy |

### RSS Feed URLs (for monitoring)

- Supreme Court: `https://indiankanoon.org/feeds/latest/supremecourt/`
- Delhi HC: `https://indiankanoon.org/feeds/latest/delhi/`
- Bombay HC: `https://indiankanoon.org/feeds/latest/bombay/`
- (Pattern: `/feeds/latest/<court-identifier>/`)

---

## Phase 3: Daily Sync Options

### Option A: Kleopatra (Preferred if validated)

- **Endpoint**: RESTful API at court-api.kleopatra.io
- **Limit**: 10,000 calls/month free
- **Claim**: Real-time data
- **Action needed**: Test freshness for 1 week before committing

### Option B: Indian Kanoon RSS + API

- **RSS polling**: Every 6 hours per court
- **API fetch**: Only for new items in RSS
- **Cost**: ~₹4,200/month at scale

### Option C: Direct eCourts Scraping (Backup)

- **Tool**: OpenJustice ecourts library
- **Challenge**: CAPTCHA solving needed
- **Use**: Only for gaps not covered by A or B

---

## Critical Unknowns to Validate

| # | Question | How to Validate | Impact |
|---|----------|-----------------|--------|
| 1 | Kleopatra actual freshness - is it really <24 hours? | Test: compare their data vs eCourts for 1 week | Determines primary daily source |
| 2 | Indian Kanoon indexing delay - hours or days? | Test: check when today's SC judgment appears | Fallback reliability |
| 3 | AWS dataset last actual update date | Run: `aws s3 ls s3://indian-high-court-judgments/` | Gap fill scope |
| 4 | Kleopatra 10K/month limit sufficient? | Calculate: ~200 judgments/day × 30 = 6K calls/month | May need paid tier |
| 5 | Kanoon non-commercial approval - will they approve RAG for lawyers? | Apply and ask | Cost structure |

---

## Cost Summary

| Phase | Source | One-time | Monthly |
|-------|--------|----------|---------|
| Phase 1 | AWS S3 | Free (bandwidth only) | - |
| Phase 2 | Kanoon API | ₹2,000-5,000 | - |
| Phase 3 | Kleopatra | - | Free (10K limit) |
| Phase 3 | Kanoon (backup) | - | ~₹4,200 |

**Total estimated**: ₹5,000 one-time + ₹0-4,200/month depending on source

---

## Next Steps (Before Building)

1. **Validate Kleopatra freshness** - Create test account, compare data for 1 week
2. **Check AWS last update** - Determine exact gap size
3. **Apply for Kanoon non-commercial** - Describe use case, get ₹10K/month
4. **Test Kanoon RSS feeds** - Check actual delay from judgment to RSS
5. **Estimate daily volume** - Count SC+HC judgments per day for capacity planning

---

## Appendix: Useful Links

### Data Sources
- [AWS High Court Judgments](https://registry.opendata.aws/indian-high-court-judgments/)
- [AWS Supreme Court Judgments](https://registry.opendata.aws/indian-supreme-court-judgments/)
- [DDL Judicial Data Portal](https://www.devdatalab.org/judicial-data) (81M district court cases)
- [Open Justice India](https://openjustice-in.github.io/)
- [Justice Hub](https://justicehub.in/dataset)

### APIs
- [Indian Kanoon API Docs](https://api.indiankanoon.org/documentation/)
- [Indian Kanoon Pricing](https://api.indiankanoon.org/pricing/)
- [Kleopatra API Docs](https://e-courts-india-api.readme.io/)

### Scrapers
- [OpenJustice eCourts Library](https://github.com/openjustice-in/ecourts)
- [Apify eCourts Scraper](https://apify.com/codingfrontend/ecourts-case-scraper)

### Official Portals
- [eCourts India](https://ecourts.gov.in/)
- [Judgments Portal](https://judgments.ecourts.gov.in/)
- [NJDG](https://njdg.ecourts.gov.in/)

---

## Data Origin & Legal Status

### The Data Flow Chain

```
JUDGES (deliver judgment)
       │
       ▼
COURT REGISTRY (digitize & upload)
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  OFFICIAL COURT WEBSITES (Source of Truth)                   │
│  • main.sci.gov.in (Supreme Court)                           │
│  • [highcourt].gov.in (25 High Courts)                       │
│  • Each HC has its own IT infrastructure                     │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  eCOURTS / NJDG (NIC aggregator)                             │
│  • Built by National Informatics Centre (NIC)                │
│  • Funded by Dept of Justice, Govt of India                  │
│  • Aggregates from all court websites                        │
│  • judgments.ecourts.gov.in                                  │
└──────────────────────────────────────────────────────────────┘
       │
       ▼ (scraped by)
┌──────────────────────────────────────────────────────────────┐
│  THIRD PARTIES                                               │
│  • Indian Kanoon (scrapes court websites)                    │
│  • Kleopatra (scrapes eCourts)                               │
│  • AWS/Dattam Labs (periodic bulk scrape)                    │
│  • Manupatra, SCC Online (commercial)                        │
└──────────────────────────────────────────────────────────────┘
```

### Legal Status: Public Domain

| Law | What it says |
|-----|--------------|
| **[Section 52(q)(iv) Copyright Act](https://indiankanoon.org/doc/1013176/)** | "any judgment or order of a court, Tribunal or other judicial authority" is **exempt from copyright** |
| **Exception** | Unless the court specifically prohibits reproduction |
| **Implication** | You can legally copy, reproduce, redistribute court judgments freely |

**Key quote from Delhi HC (2016):**
> "Copyright is designed to stimulate activity and progress in the arts for the intellectual enrichment of the public... intended to increase and not to impede the harvest of knowledge"

### Why Direct Access is Still Difficult

| Barrier | Reality |
|---------|---------|
| **Legal** | Data is public domain ✅ |
| **Technical** | CAPTCHA + rate limits block automation ❌ |
| **Ethical** | Terms of Service may prohibit scraping ⚠️ |
| **Practical** | Fragile, slow, can break anytime ⚠️ |

---

## Direct Source Analysis: All 25 High Courts

### Summary Table

| # | High Court | Website | CAPTCHA | Open Endpoint | Notes |
|---|------------|---------|---------|---------------|-------|
| 1 | **Allahabad** | allahabadhighcourt.in | ❓ Unknown | ⚠️ RSS Feed | `elegalix.allahabadhighcourt.in/elegalix/ScrollingHeadLines.do` |
| 2 | **Andhra Pradesh** | aphc.gov.in | ❓ | ❌ | SSL cert issues |
| 3 | **Bombay** | bombayhighcourt.nic.in | ❓ | ❌ | Redirect - needs inspection |
| 4 | **Calcutta** | calcuttahighcourt.gov.in | ❌ No | ⚠️ Possible | Own judgment search |
| 5 | **Chhattisgarh** | highcourt.cg.gov.in | ❌ No | ⚠️ | `/hcbspjudgement/oj_search.php` |
| 6 | **Delhi** | delhihighcourt.nic.in | ❌ **NO** | ✅ **YES** | **`/web/judgement/fetch-data` CONFIRMED OPEN** |
| 7 | **Gauhati** | ghconline.gov.in | ❌ No | ⚠️ | `ghcservices.assam.gov.in/free_text/` |
| 8 | **Gujarat** | gujarathighcourt.nic.in | ❌ No | ⚠️ | `gujarathc-casestatus.nic.in` |
| 9 | **Himachal Pradesh** | highcourt.hp.gov.in | ❓ | ❌ | Redirect only |
| 10 | **J&K and Ladakh** | jkhighcourt.nic.in | ❌ No | ⚠️ | Direct PDF links on homepage |
| 11 | **Jharkhand** | jharkhandhighcourt.nic.in | ❌ No | ⚠️ | `./ejhlr` endpoint |
| 12 | **Karnataka** | judiciary.karnataka.gov.in | ❌ No | ⚠️ | Multiple quick search options |
| 13 | **Kerala** | highcourt.kerala.gov.in | ❌ No | ⚠️ | `hckinfo.keralacourts.in` |
| 14 | **Madhya Pradesh** | mphc.gov.in | ❓ | ❌ | Standard portal |
| 15 | **Madras** | hcmadras.tn.gov.in | ❌ No | ⚠️ | Judgments Portal exists |
| 16 | **Manipur** | hcmimphal.nic.in | ❌ No | ⚠️ | `hcmjudgment.man.nic.in` |
| 17 | **Meghalaya** | meghalayahighcourt.nic.in | ❌ No | ❌ | Uses eCourts only |
| 18 | **Orissa** | orissahighcourt.nic.in | ❓ | ❌ | Uses eCourts portal |
| 19 | **Patna** | patnahighcourt.gov.in | ✅ **YES** | ❌ | CAPTCHA confirmed |
| 20 | **Punjab & Haryana** | phhc.gov.in | ❌ No | ⚠️ | Case number search only |
| 21 | **Rajasthan** | hcraj.nic.in | ✅ **YES** | ❌ | CAPTCHA + Base64 encoding |
| 22 | **Sikkim** | hcs.gov.in | ❌ No | ✅ **Likely** | `/hcs/hcourt/hg_judgement_search` + PDF links |
| 23 | **Telangana** | tshc.gov.in | ✅ **YES** | ❌ | CAPTCHA on all searches |
| 24 | **Tripura** | thc.nic.in | ❌ No | ❌ | Uses eCourts portal |
| 25 | **Uttarakhand** | highcourtofuttarakhand.gov.in | ❓ | ❌ | Uses eCourts portal |

### Confirmed Open Endpoints (No CAPTCHA)

| Court | Endpoint | Method | Data |
|-------|----------|--------|------|
| **Delhi HC** | `delhihighcourt.nic.in/web/judgement/fetch-data` | GET | JSON/HTML, date filterable |
| **Sikkim HC** | `hcs.gov.in/hcs/hcourt/hg_judgement_search` | GET | Direct PDF links |
| **J&K HC** | Direct PDF links on homepage | GET | PDF downloads |

### Promising Endpoints (Need Testing)

| Court | Endpoint | Notes |
|-------|----------|-------|
| **Allahabad** | `elegalix.allahabadhighcourt.in/elegalix/ScrollingHeadLines.do` | RSS feed (got 429 rate limit) |
| **Chhattisgarh** | `highcourt.cg.gov.in/hcbspjudgement/oj_search.php` | No CAPTCHA mentioned |
| **Gauhati** | `ghcservices.assam.gov.in/free_text/` | Free text search |
| **Karnataka** | Multiple quick search options | No CAPTCHA visible |
| **Manipur** | `hcmjudgment.man.nic.in` | Separate judgment portal |

### Confirmed CAPTCHA Required

| Court | Notes |
|-------|-------|
| **Patna** | CAPTCHA + audio fallback |
| **Rajasthan** | CAPTCHA + Base64 encoding |
| **Telangana** | CAPTCHA on all search types |

### Court Website Categories

```
┌─────────────────────────────────────────────────────────────┐
│  CATEGORY 1: OWN PORTAL (may be open)                       │
│  - Delhi, Sikkim, J&K, Allahabad, Karnataka                 │
│  - Custom built, varying CAPTCHA policies                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CATEGORY 2: eCOURTS DEPENDENT (usually CAPTCHA)            │
│  - Meghalaya, Tripura, Uttarakhand, Orissa                  │
│  - Redirect to hcservices.ecourts.gov.in                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CATEGORY 3: HYBRID (both own + eCourts)                    │
│  - Most large HCs (Bombay, Calcutta, Madras)                │
│  - Own portal may be open, eCourts has CAPTCHA              │
└─────────────────────────────────────────────────────────────┘
```

---

## Supreme Court Direct Access

### Discovered: api.sci.gov.in PDF Endpoint

**URL Pattern:**
```
https://api.sci.gov.in/supremecourt/{YEAR}/{CASE_NO}/{CASE_NO}_{YEAR}_{X}_{XXXX}_{XXXXX}_{Judgement|Order}_{DD-Mon-YYYY}.pdf
```

**Examples:**
```
https://api.sci.gov.in/supremecourt/2025/8334/8334_2025_8_1501_63274_Judgement_14-Aug-2025.pdf
https://api.sci.gov.in/supremecourt/2024/13430/13430_2024_1_1502_55866_Judgement_20-Sep-2024.pdf
```

**Problem:** No listing API - need case metadata first to construct URLs.

**Older format:** `https://api.sci.gov.in/judgment/judis/{id}.pdf`

---

## All 25 High Court Official Websites

| # | High Court | Official Website |
|---|------------|------------------|
| 1 | Allahabad | http://allahabadhighcourt.in/ |
| 2 | Andhra Pradesh | https://aphc.gov.in/ |
| 3 | Bombay | http://bombayhighcourt.nic.in/ |
| 4 | Calcutta | https://www.calcuttahighcourt.gov.in/ |
| 5 | Chhattisgarh | http://highcourt.cg.gov.in/ |
| 6 | Delhi | http://delhihighcourt.nic.in/ |
| 7 | Gauhati | http://ghconline.gov.in/ |
| 8 | Gujarat | http://gujarathighcourt.nic.in/ |
| 9 | Himachal Pradesh | https://highcourt.hp.gov.in |
| 10 | Jammu & Kashmir | http://jkhighcourt.nic.in/ |
| 11 | Jharkhand | http://jharkhandhighcourt.nic.in/ |
| 12 | Karnataka | https://judiciary.karnataka.gov.in/ |
| 13 | Kerala | https://highcourt.kerala.gov.in/ |
| 14 | Madhya Pradesh | http://mphc.gov.in/ |
| 15 | Madras | https://hcmadras.tn.gov.in |
| 16 | Manipur | http://hcmimphal.nic.in/ |
| 17 | Meghalaya | http://meghalayahighcourt.nic.in/ |
| 18 | Orissa | http://www.orissahighcourt.nic.in/ |
| 19 | Patna | http://patnahighcourt.gov.in/ |
| 20 | Punjab & Haryana | http://highcourtchd.gov.in/ |
| 21 | Rajasthan | http://hcraj.nic.in/ |
| 22 | Sikkim | http://hcs.gov.in/ |
| 23 | Telangana | http://tshc.gov.in |
| 24 | Tripura | http://thc.nic.in/ |
| 25 | Uttarakhand | http://highcourtofuttarakhand.gov.in/ |

---

## Recommended Scraping Priority

| Priority | Court | Why |
|----------|-------|-----|
| 1️⃣ | **Delhi HC** | Confirmed open `/fetch-data` endpoint |
| 2️⃣ | **Sikkim HC** | Direct PDF links, no CAPTCHA |
| 3️⃣ | **J&K HC** | Direct PDF links on homepage |
| 4️⃣ | **Karnataka HC** | Multiple search options, no CAPTCHA visible |
| 5️⃣ | **Allahabad HC** | RSS feed exists (test rate limits) |

---

## Updated Next Steps

1. **Test Delhi HC endpoint** - Confirm parameters, pagination, date filters
2. **Test Sikkim/J&K** - Verify no CAPTCHA on judgment access
3. **Test Karnataka** - Check if quick search is truly open
4. **Test Allahabad RSS** - Understand rate limits, data format
5. **For CAPTCHA courts** - Evaluate CAPTCHA bypass vs Indian Kanoon fallback
6. **SC metadata source** - Find where to get case numbers for PDF URL construction

---

# PART 2: Indian Laws & Legal Articles Data Sources

**Date:** December 6, 2025
**Objective:** Add statutes (Central + State Acts) and legal articles to RAG system

---

## Laws/Statutes Data Sources

### 1. India Code (indiacode.nic.in) - Government Portal

| Attribute | Finding |
|-----------|---------|
| **Coverage** | All Central Acts (1836-present) + State Acts from all states/UTs |
| **Operator** | Legislative Dept, Ministry of Law & Justice |
| **Format** | PDF (original), browsable HTML |
| **CAPTCHA** | **Search: YES** (form tokens), **Browse: NO** |
| **API** | **No official API** |
| **Update** | Near real-time (official source) |

**Browse Access (No CAPTCHA):**
- Central Acts: `indiacode.nic.in/handle/123456789/1362`
- State Acts: Listed by state, direct browsing available
- Categories: Acts, Sections, Rules, Regulations, Notifications, Orders, Ordinances, Circulars

**Problem:** No bulk download, need to scrape individual pages

---

### 2. Zenodo Central Acts Dataset

| Attribute | Finding |
|-----------|---------|
| **Coverage** | 858 Central Acts (1838-2020) |
| **Format** | **Structured JSON** (parsed from PDFs) |
| **Size** | Manageable download |
| **API** | Direct download |
| **Link** | [zenodo.org/records/5088102](https://zenodo.org/records/5088102) |

**JSON Schema:**
```json
{
  "act_title": "Short title",
  "act_id": "Act number + year",
  "enactment_date": "Date bill became act",
  "act_definition": "Long title / purpose",
  "chapters": [...],
  "parts": [...],
  "sections": [...]
}
```

**Best for:** Historical Central Acts bulk import
**Gap:** No State Acts, only till 2020

---

### 3. eGazette (egazette.gov.in) - Official Notifications

| Attribute | Finding |
|-----------|---------|
| **Coverage** | All gazette notifications (new laws, amendments, orders) |
| **Operator** | Directorate of Printing, Govt of India |
| **Format** | PDF downloads |
| **CAPTCHA** | Unclear - needs direct testing |
| **Freshness** | **Real-time** (official publication source) |

**Best for:** Catching new laws and amendments as they're published
**Tool:** [github.com/sushant354/egazette](https://github.com/sushant354/egazette) - Python scraper

---

### 4. Subscription Databases: Manupatra vs SCC Online

| Feature | Manupatra | SCC Online |
|---------|-----------|------------|
| **Starter Price** | ₹14,250/yr | N/A |
| **Full Access** | ₹55,460/yr (Premium) | ₹55,759/yr (Platinum) |
| **Coverage** | SC + all HCs + Tribunals + Acts | SC + HCs + extensive law reports |
| **API** | No public API | No public API |
| **Special** | Business Policy Intelligence tier | Foreign law database tier (₹74,639) |

**Manupatra Tiers:**
| Plan | Price | Features |
|------|-------|----------|
| Starter | ₹14,250 | SC + 1 HC of choice |
| Core | ₹25,700 | SC + all HCs |
| Advanced | ₹31,860 | + Tribunals |
| Business Plus | ₹43,660 | + Business Policy |
| Premium | ₹55,460 | + International DBs |
| Saver | ₹24,700 | Night-time access (7pm-7am) |

**Verdict:** Both expensive, no API access, mainly for manual research backup

---

## Legal Articles & News Sources

### 1. Bar and Bench (barandbench.com)

| Attribute | Finding |
|-----------|---------|
| **Coverage** | SC, HCs, legal news, analysis, deals |
| **RSS Feed** | ✅ **CONFIRMED WORKING** |
| **Feed URL** | `prod-qt-images.s3.amazonaws.com/production/barandbench/feed.xml` |
| **Format** | Atom XML |
| **Update** | **Multiple times daily** (hourly frequency observed) |

**Sample Content:** Litigation news, court decisions, deal announcements, legal columns

---

### 2. Live Law (livelaw.in)

| Attribute | Finding |
|-----------|---------|
| **Coverage** | SC, HCs, breaking legal news |
| **RSS Feed** | ⚠️ Standard /feed URL returns 500 error |
| **Alternative** | May need direct scraping or contact for feed |

---

### 3. Indian Kanoon RSS Feeds (for articles/commentary)

| Attribute | Finding |
|-----------|---------|
| **Coverage** | Court-wise judgment feeds |
| **Feed URL Pattern** | `indiankanoon.org/feeds/latest/<court>/` |
| **Update** | Daily |

---

### 4. AIR Online RSS Feeds

| Attribute | Finding |
|-----------|---------|
| **Coverage** | All India Reporter legal updates |
| **Feeds** | Available at `aironline.in/rssfeeds-legal-updates.html` |

---

## Pre-trained Legal NLP Resources

### InLegalBERT (for embeddings/fine-tuning)

| Attribute | Finding |
|-----------|---------|
| **Training Data** | 5.4M Indian legal documents (SC + HCs, 1950-2019) |
| **Corpus Size** | 27 GB raw text |
| **Model** | HuggingFace: `law-ai/InLegalBERT` |
| **Downloads** | 1.75M+ on HuggingFace |
| **Tasks** | Legal statute ID, semantic segmentation, judgment prediction |

**Usage:**
```python
from transformers import AutoTokenizer, AutoModel
tokenizer = AutoTokenizer.from_pretrained("law-ai/InLegalBERT")
model = AutoModel.from_pretrained("law-ai/InLegalBERT")
```

**Related Datasets:**
- ILSI Dataset: Multi-label statute classification
- ISS Dataset: Sentence tagging
- ILDC Dataset: 35K SC cases for judgment prediction

---

## Laws & Articles Gap Analysis

| Data Type | Free Source | Quality | Freshness | State Coverage |
|-----------|-------------|---------|-----------|----------------|
| Central Acts | Zenodo JSON | ✅ Structured | ❌ 2020 cutoff | N/A |
| Central Acts (current) | India Code Browse | ⚠️ PDF | ✅ Real-time | N/A |
| State Acts | India Code Browse | ⚠️ PDF | ✅ Real-time | ✅ All states |
| New Laws/Amendments | eGazette | ⚠️ PDF | ✅ Real-time | ✅ Central + some state |
| Legal Articles | Bar & Bench RSS | ✅ Atom | ✅ Hourly | N/A |
| Legal Analysis | Live Law | ⚠️ Scrape needed | ✅ Daily | N/A |

---

## Recommended Strategy: Laws & Articles

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: STATUTES BULK IMPORT                              │
│  1. Download Zenodo 858 Central Acts (JSON, structured)     │
│  2. Index directly - already parsed                         │
│  Time: 1 day                                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 2: GAP FILL (2020-present + State Acts)              │
│  1. Scrape India Code browse pages (no CAPTCHA)             │
│  2. Parse PDFs → structured text                            │
│  3. Add State Acts by priority (Maharashtra, Delhi, etc.)   │
│  Time: 1-2 weeks                                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 3: ONGOING SYNC                                      │
│  Laws: Monitor eGazette for new notifications               │
│  Articles: Poll Bar & Bench RSS every 6 hours               │
│  News: Add Indian Kanoon RSS feeds                          │
└─────────────────────────────────────────────────────────────┘
```

---

## State Acts Priority

| Priority | State | Why |
|----------|-------|-----|
| 1️⃣ | Maharashtra | Mumbai HC, commercial hub |
| 2️⃣ | Delhi | National capital, central govt |
| 3️⃣ | Karnataka | Bangalore, tech hub |
| 4️⃣ | Tamil Nadu | Large economy, active judiciary |
| 5️⃣ | Gujarat | Commercial importance |
| 6️⃣ | Uttar Pradesh | Largest population, high litigation |

---

## Cost Summary: Laws & Articles

| Source | One-time | Monthly | Notes |
|--------|----------|---------|-------|
| Zenodo Acts | Free | - | 858 Central Acts |
| India Code Scraping | Dev time only | - | No API costs |
| eGazette Monitoring | Dev time only | - | No API costs |
| Bar & Bench RSS | Free | - | Direct feed |
| Manupatra (optional) | - | ₹1,188-4,622 | If subscription needed |
| SCC Online (optional) | - | ₹4,647 | If subscription needed |

---

# PART 3: Consolidated RAG Data Strategy

## Priority Order for Implementation

| # | Data Type | Source | Method | Priority |
|---|-----------|--------|--------|----------|
| 1 | **Court Judgments (Historical)** | AWS Open Data | S3 sync | HIGH - 1.1TB, takes time |
| 2 | **Central Acts (Structured)** | Zenodo | Direct download | HIGH - ready to use JSON |
| 3 | **Court Judgments (Gap Fill)** | Indian Kanoon | API + RSS | HIGH - 24hr freshness |
| 4 | **Legal News/Articles** | Bar & Bench RSS | RSS polling | MEDIUM - easy to add |
| 5 | **State Acts** | India Code | Browse + scrape | MEDIUM - PDF parsing needed |
| 6 | **New Laws** | eGazette | Monitor + scrape | MEDIUM - real-time updates |
| 7 | **Court Daily Sync** | Kleopatra/Kanoon | API | HIGH - 24hr requirement |

---

## Why This Order?

1. **AWS + Zenodo first** - Pre-processed, bulk data, no scraping
2. **Indian Kanoon gap fill** - Gets you to current state quickly
3. **RSS feeds** - Low effort, high value for articles
4. **State Acts later** - PDF parsing is time-consuming
5. **eGazette ongoing** - Keeps laws current after initial load

---

## Updated Links

### Statutes
- [India Code](https://indiacode.nic.in/) - Official legislation portal
- [Zenodo Central Acts](https://zenodo.org/records/5088102) - 858 structured JSONs
- [eGazette](https://egazette.gov.in/) - Official notifications
- [eGazette Scraper](https://github.com/sushant354/egazette) - Python tool

### Legal Articles
- [Bar & Bench RSS](https://prod-qt-images.s3.amazonaws.com/production/barandbench/feed.xml)
- [Indian Kanoon Feeds](https://indiankanoon.org/feeds/)
- [AIR Online RSS](https://www.aironline.in/rssfeeds-legal-updates.html)

### Subscription (if needed)
- [Manupatra Plans](https://www.manupatrafast.in/Asps/SubscriptionPlans.aspx)
- [SCC Online](https://www.ebcwebstore.com/)

### NLP Resources
- [InLegalBERT](https://huggingface.co/law-ai/InLegalBERT) - Pre-trained model
- [Law-AI Datasets](https://sites.google.com/site/saptarshighosh/datasets-codes)

---

# PART 4: Data Tier Matrix by Practice Area

**Date:** December 6, 2025
**Objective:** Map what data types are needed per practice area for complete legal research

---

## Master Data Tier Matrix

### Tier 1: Core (MVP) - Acts + Sections + Judgments

| Data Type | Description | Source | Status | Dev Effort |
|-----------|-------------|--------|--------|------------|
| **Central Acts** | 858+ Parliament laws | Zenodo JSON | ✅ Ready | 1 day |
| **Sections** | Individual provisions within Acts | Zenodo JSON (parsed) | ✅ Ready | Included |
| **SC Judgments** | Supreme Court cases | AWS Open Data | ✅ Ready | 1-2 days download |
| **HC Judgments** | 25 High Court cases | AWS Open Data | ✅ Ready | 1-2 days download |
| **Constitution** | 395 Articles + Schedules | Verify in Zenodo | ⚠️ Check | 1 day |

### Tier 2: Enhanced - Rules + Regulations (by Practice Area)

| Data Type | Description | Source | Status | Dev Effort |
|-----------|-------------|--------|--------|------------|
| **Central Rules** | Rules under Central Acts | India Code (scrape) | 🔨 Build | 1 week |
| **Regulations** | SEBI, RBI, IRDAI, etc. | Regulator websites | 🔨 Build | 1-2 weeks |
| **State Acts** | State legislature laws | India Code (scrape) | 🔨 Build | 2 weeks |

### Tier 3: Complete - Notifications + Circulars + Orders

| Data Type | Description | Source | Status | Dev Effort |
|-----------|-------------|--------|--------|------------|
| **Notifications** | Gazette notifications | eGazette (scrape) | 🔨 Build | 1-2 weeks |
| **Circulars** | Dept interpretations | Ministry websites | 🔨 Build | 2+ weeks |
| **Orders** | Specific directives | eGazette + Ministry | 🔨 Build | 2+ weeks |
| **Ordinances** | Emergency laws | eGazette | 🔨 Build | Included |

---

## Practice Area Requirements Matrix

| Practice Area | Acts | Sections | Rules | Regulations | Notifications | Circulars | Judgments |
|---------------|:----:|:--------:|:-----:|:-----------:|:-------------:|:---------:|:---------:|
| **Criminal** | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ✅ |
| **Civil** | ✅ | ✅ | ✅ | ❌ | ⚠️ | ❌ | ✅ |
| **Corporate** | ✅ | ✅ | ✅ | ✅✅ | ✅ | ✅ | ✅ |
| **Tax (Direct)** | ✅ | ✅ | ✅✅ | ❌ | ✅✅ | ✅✅ | ✅ |
| **Tax (GST)** | ✅ | ✅ | ✅✅ | ❌ | ✅✅ | ✅✅ | ✅ |
| **Labor** | ✅ | ✅ | ✅✅ | ⚠️ | ✅ | ✅ | ✅ |
| **IP** | ✅ | ✅ | ✅ | ❌ | ⚠️ | ⚠️ | ✅ |
| **Real Estate** | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ✅ |
| **Banking/Finance** | ✅ | ✅ | ✅ | ✅✅ | ✅ | ✅✅ | ✅ |
| **Environmental** | ✅ | ✅ | ✅ | ✅ | ✅✅ | ⚠️ | ✅ |

**Legend:** ✅ = Needed | ✅✅ = Critical | ⚠️ = Nice to have | ❌ = Not typically needed

---

## Priority Rules & Regulations by Practice Area

### 1. Criminal Law
| Document | Priority | Source |
|----------|----------|--------|
| Indian Penal Code, 1860 | ✅ Zenodo | Act |
| CrPC, 1973 | ✅ Zenodo | Act |
| Evidence Act, 1872 | ✅ Zenodo | Act |
| CrPC Rules (State-wise) | v1.5 | India Code |
| Prison Rules | v2 | State websites |

### 2. Civil Law
| Document | Priority | Source |
|----------|----------|--------|
| CPC, 1908 | ✅ Zenodo | Act |
| Limitation Act, 1963 | ✅ Zenodo | Act |
| Specific Relief Act, 1963 | ✅ Zenodo | Act |
| CPC Rules (Order I-XLVII) | v1.5 | India Code |
| Court Fees Rules | v2 | State websites |

### 3. Corporate Law
| Document | Priority | Source |
|----------|----------|--------|
| Companies Act, 2013 | ✅ Zenodo | Act |
| LLP Act, 2008 | ✅ Zenodo | Act |
| Insolvency Code, 2016 | ✅ Zenodo | Act |
| Companies Rules, 2014 | v1.5 | MCA website |
| SEBI Regulations | v1.5 | sebi.gov.in |
| RBI Master Directions | v1.5 | rbi.org.in |
| MCA Circulars | v2 | MCA website |

### 4. Tax Law (Direct)
| Document | Priority | Source |
|----------|----------|--------|
| Income Tax Act, 1961 | ✅ Zenodo | Act |
| Income Tax Rules, 1962 | v1.5 CRITICAL | India Code |
| CBDT Circulars | v1.5 CRITICAL | incometax.gov.in |
| CBDT Notifications | v1.5 CRITICAL | eGazette |
| Tax Treaties (DTAAs) | v2 | incometax.gov.in |

### 5. Tax Law (GST)
| Document | Priority | Source |
|----------|----------|--------|
| CGST Act, 2017 | ✅ Zenodo | Act |
| IGST Act, 2017 | ✅ Zenodo | Act |
| GST Rules | v1.5 CRITICAL | cbic.gov.in |
| GST Rate Notifications | v1.5 CRITICAL | eGazette |
| CBIC Circulars | v1.5 CRITICAL | cbic.gov.in |
| Advance Rulings | v2 | gstcouncil.gov.in |

### 6. Labor Law
| Document | Priority | Source |
|----------|----------|--------|
| Industrial Disputes Act | ✅ Zenodo | Act |
| Factories Act | ✅ Zenodo | Act |
| Labour Codes 2020 (4 new) | v1.5 | India Code |
| PF/ESI Rules | v1.5 CRITICAL | epfindia.gov.in |
| State Labour Rules | v2 | State websites |
| Labour Dept Notifications | v2 | eGazette |

### 7. Intellectual Property
| Document | Priority | Source |
|----------|----------|--------|
| Patents Act, 1970 | ✅ Zenodo | Act |
| Trademarks Act, 1999 | ✅ Zenodo | Act |
| Copyright Act, 1957 | ✅ Zenodo | Act |
| IP Rules | v1.5 | ipindia.gov.in |
| Patent Office Guidelines | v2 | ipindia.gov.in |

### 8. Banking & Finance
| Document | Priority | Source |
|----------|----------|--------|
| Banking Regulation Act | ✅ Zenodo | Act |
| RBI Act, 1934 | ✅ Zenodo | Act |
| SARFAESI Act, 2002 | ✅ Zenodo | Act |
| RBI Master Directions | v1.5 CRITICAL | rbi.org.in |
| RBI Circulars | v1.5 CRITICAL | rbi.org.in |
| SEBI Regulations | v1.5 | sebi.gov.in |

---

## Development Roadmap

```
┌─────────────────────────────────────────────────────────────────┐
│  v1 (MVP) - Launch                                              │
│  ✅ 858 Central Acts + Sections (Zenodo)                        │
│  ✅ SC + HC Judgments (AWS Open Data)                           │
│  ✅ Constitution of India                                        │
│  ✅ Legal News (Bar & Bench RSS)                                │
│  ✅ Daily judgment sync (Kleopatra/Kanoon)                      │
│                                                                 │
│  Lawyer Utility: 70% of research needs                          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  v1.5 - Rules & Regulations (2-4 weeks after launch)            │
│  🔨 CPC/CrPC Rules (Civil + Criminal)                           │
│  🔨 Companies Rules + SEBI Regulations (Corporate)              │
│  🔨 Income Tax Rules + GST Rules (Tax)                          │
│  🔨 PF/ESI Rules (Labor)                                        │
│  🔨 RBI Master Directions (Banking)                             │
│  🔨 State Acts (Top 6 states)                                   │
│                                                                 │
│  Lawyer Utility: 85% of research needs                          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  v2 - Notifications & Circulars                                 │
│  🔨 CBDT/CBIC Circulars (Tax)                                   │
│  🔨 MCA Circulars (Corporate)                                   │
│  🔨 RBI Circulars (Banking)                                     │
│  🔨 eGazette Notifications (All)                                │
│  🔨 State Rules (All states)                                    │
│  🔨 Tribunal Orders (NCLT, ITAT, etc.)                          │
│                                                                 │
│  Lawyer Utility: 95% of research needs                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Readiness Summary

### Data Sources Status

| Source | Type | CAPTCHA | API | Status | Action |
|--------|------|---------|-----|--------|--------|
| **Zenodo** | Acts | ❌ | ✅ Direct | ✅ Ready | Download |
| **AWS S3** | Judgments | ❌ | ✅ S3 | ✅ Ready | Sync |
| **India Code Browse** | Acts/Rules | ❌ | ❌ | ✅ Scrapable | Build scraper |
| **India Code Search** | All | ✅ | ❌ | ❌ Blocked | Use Browse |
| **eGazette** | Notifications | ❓ | ❌ | ⚠️ Test | Build scraper |
| **Indian Kanoon** | Judgments | ❌ | ✅ | ✅ Ready | API integration |
| **Kleopatra** | Judgments | ❌ | ✅ | ⚠️ Test | Validate freshness |
| **Bar & Bench** | News | ❌ | ✅ RSS | ✅ Ready | RSS poller |
| **SEBI/RBI/MCA** | Regulations | ❓ | ❌ | 🔨 Build | Per-regulator scraper |

### Immediate Development Tasks

| # | Task | Effort | Blocker? |
|---|------|--------|----------|
| 1 | Download Zenodo Acts dataset | 1 day | No |
| 2 | Start AWS S3 judgment sync | 2 days | No |
| 3 | Verify Constitution in Zenodo | 1 hour | No |
| 4 | Test Kleopatra API freshness | 1 week | No |
| 5 | Apply for Indian Kanoon API | 1 day | Approval wait |
| 6 | Set up Bar & Bench RSS poller | 1 day | No |
| 7 | Build India Code browse scraper | 1 week | No |

---

## Resolved Technical Questions (Dec 6, 2025)

| # | Question | Answer | Action |
|---|----------|--------|--------|
| 1 | Does Zenodo include Constitution? | ❌ **NO** - Zenodo has 858 Central Acts only | Use GitHub: [civictech-India/constitution-of-india](https://github.com/civictech-India/constitution-of-india) - JSON with 101 articles |
| 2 | Kleopatra freshness <24 hours? | ⚠️ **UNVERIFIED** - Claims "real-time" but no SLA. Free: 10K calls/month | Test for 1 week before relying |
| 3 | India Code browse rate limits? | ✅ **NO LIMITS** - Open browse, no restrictions mentioned | Build scraper |
| 4 | eGazette has CAPTCHA? | ✅ **NO CAPTCHA** on search page | Build scraper |
| 5 | SEBI/RBI sites scrapable? | **SEBI**: ⚠️ CAPTCHA on listing, but direct regulation links work. **RBI**: ✅ Fully scrapable, no CAPTCHA | RBI first, SEBI via direct links |
| 6 | Zenodo JSON quality? | ✅ **GOOD** - Structured with act_title, sections[], chapters[], metadata | Ready to use |

### Constitution of India - Alternative Source

| Source | Format | Coverage | Link |
|--------|--------|----------|------|
| GitHub civictech-India | JSON, CSV, SQLite | 101 articles (Parts I-IV) | [constitution-of-india](https://github.com/civictech-India/constitution-of-india) |
| Kaggle | Dataset | All 395 articles | [rushikeshdarge/constitution-of-india](https://www.kaggle.com/datasets/rushikeshdarge/constitution-of-india) |
| HuggingFace | Dataset | Full Constitution | [nisaar/Constitution_of_India](https://huggingface.co/datasets/nisaar/Constitution_of_India) |

**Recommendation:** Use Kaggle or HuggingFace for complete 395 articles + schedules

---

## Cost-Benefit by Tier

| Tier | Dev Effort | Data Cost | Lawyer Utility | ROI |
|------|------------|-----------|----------------|-----|
| **v1 (MVP)** | 1-2 weeks | Free | 70% | ⭐⭐⭐⭐⭐ High |
| **v1.5 (Rules)** | 2-4 weeks | Free | +15% → 85% | ⭐⭐⭐⭐ Good |
| **v2 (Complete)** | 4-8 weeks | Free | +10% → 95% | ⭐⭐⭐ Moderate |
