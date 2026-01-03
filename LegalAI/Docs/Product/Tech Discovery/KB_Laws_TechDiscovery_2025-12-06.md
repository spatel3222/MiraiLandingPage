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

## Regulatory & Tribunal Data Sources

### 5. GST Council & CBIC (cbic.gov.in / gstcouncil.gov.in)

| Attribute | Finding |
|-----------|---------|
| **Coverage** | GST Acts, Rules, Rates, Notifications, Circulars, Advance Rulings |
| **Operator** | Central Board of Indirect Taxes and Customs |
| **Format** | PDF + HTML |
| **CAPTCHA** | No |
| **Key URLs** | `cbic.gov.in/htdocs-cbec/gst`, `gstcouncil.gov.in/gst-laws` |

**Data Types:**
- GST Rate Notifications (frequent updates)
- CGST/IGST/SGST Rules
- Circulars (interpretive guidance)
- Advance Rulings (AAR/AAAR orders)

---

### 6. Income Tax Department (incometax.gov.in)

| Attribute | Finding |
|-----------|---------|
| **Coverage** | IT Act, Rules, CBDT Circulars, Notifications, DTAAs |
| **Operator** | Central Board of Direct Taxes |
| **Format** | PDF |
| **CAPTCHA** | No on main pages |
| **Key URLs** | `incometax.gov.in/iec/foportal/` |

**Data Types:**
- CBDT Circulars (binding interpretations)
- Notifications (amendments, exemptions)
- Double Taxation Avoidance Agreements (DTAAs)
- Income Tax Rules, 1962

---

### 7. MoEF&CC - Environment Ministry (moef.gov.in / parivesh.nic.in)

| Attribute | Finding |
|-----------|---------|
| **Coverage** | Environment Acts, EIA Notifications, Clearances, NGT Orders |
| **Operator** | Ministry of Environment, Forest and Climate Change |
| **Format** | PDF |
| **CAPTCHA** | No |
| **Key URLs** | `moef.gov.in`, `parivesh.nic.in` |

**Data Types:**
- Environment Protection Act notifications
- EIA Notification 2006 + amendments
- Coastal Regulation Zone notifications
- Forest clearance orders
- Wildlife Protection Act notifications

---

### 8. NCLT/NCLAT - Corporate Tribunals (nclt.gov.in / nclat.gov.in)

| Attribute | Finding |
|-----------|---------|
| **Coverage** | IBC orders, Company law matters, Competition appeals |
| **Operator** | National Company Law Tribunal / Appellate Tribunal |
| **Format** | PDF orders |
| **CAPTCHA** | No on order search |
| **Key URLs** | `nclt.gov.in/order-judgment`, `nclat.gov.in` |

**Data Types:**
- IBC admission/resolution orders
- Company petition orders
- CIRP/Liquidation orders
- NCLAT appeals

---

### 9. ITAT - Income Tax Appellate Tribunal (itat.gov.in)

| Attribute | Finding |
|-----------|---------|
| **Coverage** | All ITAT orders across 28 benches |
| **Operator** | Income Tax Appellate Tribunal |
| **Format** | PDF |
| **CAPTCHA** | No |
| **Key URL** | `itat.gov.in` |

**Data Types:**
- ITAT orders (tax appeals)
- Bench-wise listings
- Transfer pricing orders

---

### 10. Other Key Tribunals

| Tribunal | URL | Coverage | Priority |
|----------|-----|----------|----------|
| **NGT** | greentribunal.gov.in | Environment appeals | v1.5 |
| **SAT** | sat.gov.in | SEBI appeals | v1.5 |
| **TDSAT** | tdsat.gov.in | Telecom disputes | v2 |
| **CAT** | cgatnew.gov.in | Service matters | v2 |
| **DRT** | drt.gov.in | Debt recovery | v2 |
| **RERA** | rera.gov.in (state-wise) | Real estate | v2 |

---

## Legal Articles & News Sources

### 1. Bar and Bench (barandbench.com)

| Attribute | Finding |
|-----------|---------|
| **Coverage** | SC, HCs, legal news, analysis, deals |
| **RSS Feed** | CONFIRMED WORKING |
| **Feed URL** | `prod-qt-images.s3.amazonaws.com/production/barandbench/feed.xml` |
| **Format** | Atom XML |
| **Update** | **Multiple times daily** (hourly frequency observed) |

**Sample Content:** Litigation news, court decisions, deal announcements, legal columns

---

### 2. Live Law (livelaw.in)

| Attribute | Finding |
|-----------|---------|
| **Coverage** | SC, HCs, breaking legal news |
| **RSS Feed** | Standard /feed URL returns 500 error |
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
| Central Acts | Zenodo JSON | Structured | 2020 cutoff | N/A |
| Central Acts (current) | India Code Browse | PDF | Real-time | N/A |
| State Acts | India Code Browse | PDF | Real-time | All states |
| New Laws/Amendments | eGazette | PDF | Real-time | Central + some state |
| Legal Articles | Bar & Bench RSS | Atom | Hourly | N/A |
| Legal Analysis | Live Law | Scrape needed | Daily | N/A |

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
| 1 | Maharashtra | Mumbai HC, commercial hub |
| 2 | Delhi | National capital, central govt |
| 3 | Karnataka | Bangalore, tech hub |
| 4 | Tamil Nadu | Large economy, active judiciary |
| 5 | Gujarat | Commercial importance |
| 6 | Uttar Pradesh | Largest population, high litigation |

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
| **Central Acts** | 858+ Parliament laws | Zenodo JSON | Ready | 1 day |
| **Sections** | Individual provisions within Acts | Zenodo JSON (parsed) | Ready | Included |
| **SC Judgments** | Supreme Court cases | AWS Open Data | Ready | 1-2 days download |
| **HC Judgments** | 25 High Court cases | AWS Open Data | Ready | 1-2 days download |
| **Constitution** | 395 Articles + Schedules | Verify in Zenodo | Check | 1 day |

### Tier 2: Enhanced - Rules + Regulations (by Practice Area)

| Data Type | Description | Source | Status | Dev Effort |
|-----------|-------------|--------|--------|------------|
| **Central Rules** | Rules under Central Acts | India Code (scrape) | Build | 1 week |
| **Regulations** | SEBI, RBI, IRDAI, etc. | Regulator websites | Build | 1-2 weeks |
| **State Acts** | State legislature laws | India Code (scrape) | Build | 2 weeks |

### Tier 3: Complete - Notifications + Circulars + Orders

| Data Type | Description | Source | Status | Dev Effort |
|-----------|-------------|--------|--------|------------|
| **Notifications** | Gazette notifications | eGazette (scrape) | Build | 1-2 weeks |
| **Circulars** | Dept interpretations | Ministry websites | Build | 2+ weeks |
| **Orders** | Specific directives | eGazette + Ministry | Build | 2+ weeks |
| **Ordinances** | Emergency laws | eGazette | Build | Included |

---

## Practice Area Requirements Matrix

| Practice Area | Acts | Sections | Rules | Regulations | Notifications | Circulars | Judgments |
|---------------|:----:|:--------:|:-----:|:-----------:|:-------------:|:---------:|:---------:|
| **Criminal** | Yes | Yes | Maybe | No | No | No | Yes |
| **Civil** | Yes | Yes | Yes | No | Maybe | No | Yes |
| **Corporate** | Yes | Yes | Yes | Critical | Yes | Yes | Yes |
| **Tax (Direct)** | Yes | Yes | Critical | No | Critical | Critical | Yes |
| **Tax (GST)** | Yes | Yes | Critical | No | Critical | Critical | Yes |
| **Labor** | Yes | Yes | Critical | Maybe | Yes | Yes | Yes |
| **IP** | Yes | Yes | Yes | No | Maybe | Maybe | Yes |
| **Real Estate** | Yes | Yes | Yes | Maybe | Yes | Maybe | Yes |
| **Banking/Finance** | Yes | Yes | Yes | Critical | Yes | Critical | Yes |
| **Environmental** | Yes | Yes | Yes | Yes | Critical | Maybe | Yes |

---

## Priority Rules & Regulations by Practice Area

### 1. Criminal Law
| Document | Priority | Source |
|----------|----------|--------|
| Indian Penal Code, 1860 | Zenodo | Act |
| CrPC, 1973 | Zenodo | Act |
| Evidence Act, 1872 | Zenodo | Act |
| CrPC Rules (State-wise) | v1.5 | India Code |
| Prison Rules | v2 | State websites |

### 2. Civil Law
| Document | Priority | Source |
|----------|----------|--------|
| CPC, 1908 | Zenodo | Act |
| Limitation Act, 1963 | Zenodo | Act |
| Specific Relief Act, 1963 | Zenodo | Act |
| CPC Rules (Order I-XLVII) | v1.5 | India Code |
| Court Fees Rules | v2 | State websites |

### 3. Corporate Law
| Document | Priority | Source |
|----------|----------|--------|
| Companies Act, 2013 | Zenodo | Act |
| LLP Act, 2008 | Zenodo | Act |
| Insolvency Code, 2016 | Zenodo | Act |
| Companies Rules, 2014 | v1.5 | MCA website |
| SEBI Regulations | v1.5 | sebi.gov.in |
| RBI Master Directions | v1.5 | rbi.org.in |
| MCA Circulars | v2 | MCA website |

### 4. Tax Law (Direct)
| Document | Priority | Source |
|----------|----------|--------|
| Income Tax Act, 1961 | Zenodo | Act |
| Income Tax Rules, 1962 | v1.5 CRITICAL | India Code |
| CBDT Circulars | v1.5 CRITICAL | incometax.gov.in |
| CBDT Notifications | v1.5 CRITICAL | eGazette |
| Tax Treaties (DTAAs) | v2 | incometax.gov.in |

### 5. Tax Law (GST)
| Document | Priority | Source |
|----------|----------|--------|
| CGST Act, 2017 | Zenodo | Act |
| IGST Act, 2017 | Zenodo | Act |
| GST Rules | v1.5 CRITICAL | cbic.gov.in |
| GST Rate Notifications | v1.5 CRITICAL | eGazette |
| CBIC Circulars | v1.5 CRITICAL | cbic.gov.in |
| Advance Rulings | v2 | gstcouncil.gov.in |

### 6. Labor Law
| Document | Priority | Source |
|----------|----------|--------|
| Industrial Disputes Act | Zenodo | Act |
| Factories Act | Zenodo | Act |
| Labour Codes 2020 (4 new) | v1.5 | India Code |
| PF/ESI Rules | v1.5 CRITICAL | epfindia.gov.in |
| State Labour Rules | v2 | State websites |
| Labour Dept Notifications | v2 | eGazette |

### 7. Intellectual Property
| Document | Priority | Source |
|----------|----------|--------|
| Patents Act, 1970 | Zenodo | Act |
| Trademarks Act, 1999 | Zenodo | Act |
| Copyright Act, 1957 | Zenodo | Act |
| IP Rules | v1.5 | ipindia.gov.in |
| Patent Office Guidelines | v2 | ipindia.gov.in |

### 8. Banking & Finance
| Document | Priority | Source |
|----------|----------|--------|
| Banking Regulation Act | Zenodo | Act |
| RBI Act, 1934 | Zenodo | Act |
| SARFAESI Act, 2002 | Zenodo | Act |
| RBI Master Directions | v1.5 CRITICAL | rbi.org.in |
| RBI Circulars | v1.5 CRITICAL | rbi.org.in |
| SEBI Regulations | v1.5 | sebi.gov.in |

---

## Development Roadmap

```
┌─────────────────────────────────────────────────────────────────┐
│  v1 (MVP) - Launch                                              │
│  - 858 Central Acts + Sections (Zenodo)                         │
│  - SC + HC Judgments (AWS Open Data)                            │
│  - Constitution of India (Kaggle)                               │
│  - Legal News (Bar & Bench RSS)                                 │
│  - Daily judgment sync (Kleopatra/Kanoon)                       │
│                                                                 │
│  Lawyer Utility: 70% of research needs                          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  v1.5 - Rules & Regulations (2-4 weeks after launch)            │
│  - CPC/CrPC Rules (Civil + Criminal)                            │
│  - Companies Rules + SEBI Regulations (Corporate)               │
│  - Income Tax Rules + GST Rules (Tax)                           │
│  - PF/ESI Rules (Labor)                                         │
│  - RBI Master Directions (Banking)                              │
│  - State Acts (Top 6 states)                                    │
│                                                                 │
│  Lawyer Utility: 85% of research needs                          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  v2 - Notifications & Circulars                                 │
│  - CBDT/CBIC Circulars (Tax)                                    │
│  - MCA Circulars (Corporate)                                    │
│  - RBI Circulars (Banking)                                      │
│  - eGazette Notifications (All)                                 │
│  - State Rules (All states)                                     │
│  - Tribunal Orders (NCLT, ITAT, etc.)                           │
│                                                                 │
│  Lawyer Utility: 95% of research needs                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Readiness Summary

### Data Sources Status

| Source | Type | CAPTCHA | API | Status | Action |
|--------|------|---------|-----|--------|--------|
| **Zenodo** | Acts | No | Direct | Ready | Download |
| **AWS S3** | Judgments | No | S3 | Ready | Sync |
| **India Code Browse** | Acts/Rules | No | No | Scrapable | Build scraper |
| **India Code Search** | All | Yes | No | Blocked | Use Browse |
| **eGazette** | Notifications | ? | No | Test | Build scraper |
| **Indian Kanoon** | Judgments | No | Yes | Ready | API integration |
| **Kleopatra** | Judgments | No | Yes | Test | Validate freshness |
| **Bar & Bench** | News | No | RSS | Ready | RSS poller |
| **SEBI/RBI/MCA** | Regulations | ? | No | Build | Per-regulator scraper |

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
| 1 | Does Zenodo include Constitution? | **NO** - Zenodo has 858 Central Acts only | Use GitHub: [civictech-India/constitution-of-india](https://github.com/civictech-India/constitution-of-india) - JSON with 101 articles |
| 2 | Kleopatra freshness <24 hours? | **UNVERIFIED** - Claims "real-time" but no SLA. Free: 10K calls/month | Test for 1 week before relying |
| 3 | India Code browse rate limits? | **NO LIMITS** - Open browse, no restrictions mentioned | Build scraper |
| 4 | eGazette has CAPTCHA? | **NO CAPTCHA** on search page | Build scraper |
| 5 | SEBI/RBI sites scrapable? | **SEBI**: CAPTCHA on listing, but direct regulation links work. **RBI**: Fully scrapable, no CAPTCHA | RBI first, SEBI via direct links |
| 6 | Zenodo JSON quality? | **GOOD** - Structured with act_title, sections[], chapters[], metadata | Ready to use |

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
| **v1 (MVP)** | 1-2 weeks | Free | 70% | High |
| **v1.5 (Rules)** | 2-4 weeks | Free | +15% → 85% | Good |
| **v2 (Complete)** | 4-8 weeks | Free | +10% → 95% | Moderate |
