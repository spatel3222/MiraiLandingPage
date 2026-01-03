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
