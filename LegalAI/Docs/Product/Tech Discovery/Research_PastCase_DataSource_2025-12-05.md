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
### Flow of data

Origin Chain
JUDGES (deliver judgment)
       │
       ▼
COURT REGISTRY (digitize & upload)
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  OFFICIAL COURT WEBSITES (Source of Truth)           │
│  • main.sci.gov.in (Supreme Court)                   │
│  • [highcourt].gov.in (25 High Courts)               │
│  • Each HC has its own IT infrastructure             │
└──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  eCOURTS / NJDG (NIC aggregator)                     │
│  • Built by National Informatics Centre (NIC)        │
│  • Funded by Dept of Justice, Govt of India          │
│  • Aggregates from all court websites                │
│  • judgments.ecourts.gov.in                          │
└──────────────────────────────────────────────────────┘
       │
       ▼ (scraped by)
┌──────────────────────────────────────────────────────┐
│  THIRD PARTIES                                       │
│  • Indian Kanoon (scrapes court websites)            │
│  • Kleopatra (scrapes eCourts)                       │
│  • AWS/Dattam Labs (periodic bulk scrape)            │
│  • Manupatra, SCC Online (commercial)                │
└──────────────────────────────────────────────────────┘



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
