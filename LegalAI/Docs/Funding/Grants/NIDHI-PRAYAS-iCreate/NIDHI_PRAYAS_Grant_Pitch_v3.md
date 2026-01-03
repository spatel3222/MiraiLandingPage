# NIDHI-PRAYAS Grant Application

## Mirai DocVault — Legal Document Digitization System
**Hardware + AI Infrastructure for Courts & Law Firms**

---

# 1. EXECUTIVE SUMMARY

**₹8,880 Cr invested in court digitization. Zero intelligence layer.** Gujarat HC alone deployed 1,179 scanners — PDFs stored, not searchable.

**Mirai DocVault** is an integrated hardware system (Scanner + GPU Server + Storage) that converts scanned legal documents into searchable, AI-ready archives — on-premise, multilingual, secure.

**Traction:** 2 paying law firms in Ahmedabad. English + Gujarati documents processing live.

**Ask:** ₹9 Lakhs for prototype hardware + external development services.

**Deliverable:** Working DocVault unit deployed at 2 pilot sites within 12 months.

---

# 2. PROBLEM STATEMENT

## The Digitization Gap

Courts and law firms have scanners. They produce PDFs. But PDFs ≠ searchable archives.

| Entity | Hardware Investment | Current State | What's Missing |
|--------|---------------------|---------------|----------------|
| e-Courts Phase II | ₹1,670 Cr spent¹ | 311 Cr pages scanned² | Intelligence layer |
| e-Courts Phase III | ₹7,210 Cr approved¹ | Scanners deploying | AI vendor not selected |
| Gujarat HC (2024) | 1,179 scanners | PDFs stored individually | Corpus-level search |
| Law Firms | Existing scanners | Archives in folders | Unified search |

## Core Problem

**Individual file access ≠ Corpus intelligence.**

- Judge can open one PDF — cannot search "all bail orders for Section 302"
- Lawyer can find one document — cannot ask "what did we argue in similar cases?"

## Validation

> "Scanned copies of a document... cannot be treated as electronic records."
> — **Supreme Court of India**, SBI vs Ajay Kumar Sood (2022)³

> "Lawyers waste 6 hours per week on document management... 2.3 hours searching for documents they cannot find."
> — **MetaJure Research**⁴

---

# 3. PROPOSED SOLUTION

## Mirai DocVault — Integrated Hardware System

**What it is:** Self-contained unit that takes scanned documents and makes them searchable.

### System Components

| Component | Specification | Purpose |
|-----------|---------------|---------|
| **Document Scanner** | Fujitsu fi-8170 (70 ppm) | High-speed document input |
| **GPU Server** | RTX 4090 (24GB VRAM) | On-premise AI processing |
| **Storage** | 10TB NAS | Document archive |
| **Network** | Gigabit switch + cables | Local connectivity |
| **Software Stack** | OCR + Translation + Search | Intelligence layer |

### Processing Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    MIRAI DOCVAULT                           │
│                                                             │
│  [Scanner] → [Ingestion] → [OCR] → [Translation] → [Index] │
│                              ↓                              │
│                    [GPU Processing]                         │
│                              ↓                              │
│              [Searchable Archive + Q&A Interface]           │
└─────────────────────────────────────────────────────────────┘
```

### Key Capabilities

| Feature | What It Does |
|---------|--------------|
| **Multi-format Input** | Scanned PDFs, images, new scans |
| **Multilingual OCR** | English + Gujarati (expandable to 10 Indian languages) |
| **Translation** | Gujarati ↔ English legal translation |
| **Semantic Search** | Find by meaning, not just keywords |
| **Q&A Interface** | Ask questions, get answers with citations |
| **On-Premise** | Data never leaves premises — sovereignty compliant |

### Hardware Compatibility

| Input Source | Support |
|--------------|---------|
| New scans via DocVault scanner | Direct integration |
| Existing scanners | Hot folder watch |
| Legacy scanned PDFs | Bulk import |

**Zero vendor lock-in. Works with existing infrastructure.**

---

# 4. INNOVATION & TECHNOLOGY

## What's Novel

| Aspect | Current Market | Mirai DocVault |
|--------|----------------|----------------|
| **Approach** | Software-only (cloud) | Hardware + Software (on-premise) |
| **Deployment** | SaaS subscription | One-time infrastructure |
| **Data Location** | Cloud servers | Client premises |
| **Indian Languages** | Limited | 10 languages (NeMo + IndicTrans2) |
| **Integration** | Greenfield only | Works with existing scanners |

## Technical Differentiators

1. **On-Premise AI:** GPU processing locally — no cloud dependency
2. **Backward Compatible:** Processes existing scanned archives — no re-scanning
3. **Multilingual:** Built for Indian court languages from day one
4. **Complete Stack:** Hardware to search — single vendor deployment

## Software Stack

| Layer | Technology |
|-------|------------|
| OCR | NVIDIA NeMo, Tesseract, EasyOCR |
| Translation | AI4Bharat IndicTrans2 |
| Embeddings | Sentence Transformers, BGE |
| Vector DB | ChromaDB / Milvus |
| LLM | Llama 3 / Mistral (local) |
| Backend | FastAPI, Python |
| Frontend | React, Next.js |

---

# 5. PROTOTYPE DELIVERABLES

## 12-Month Prototype: Mirai DocVault v1.0

| Deliverable | Description | Success Metric |
|-------------|-------------|----------------|
| **Integrated Hardware Unit** | Scanner + Server + Storage assembled | Working system |
| **Document Ingestion** | Process 10,000+ legal documents | 100% processed |
| **Text Extraction** | OCR for English + Gujarati | 95%+ accuracy |
| **Translation Engine** | Gujarati ↔ English | 90%+ accuracy |
| **Semantic Search** | Find documents by meaning | Results in <1 second |
| **Q&A Interface** | Ask questions, get cited answers | Relevant top-5 results |
| **Pilot Deployment** | Running at 2 law firm sites | Active daily usage |

---

# 6. MILESTONES & WORK PLAN

## 12-Month Timeline

| Phase | Month | Activities | Deliverable |
|-------|-------|------------|-------------|
| **1: Hardware Setup** | 1-3 | Procure components, assemble DocVault unit, configure network | Working hardware |
| **2: Core Engine** | 4-6 | OCR pipeline, translation engine, document ingestion | 5,000+ docs processed |
| **3: Intelligence Layer** | 7-9 | Semantic search, Q&A system, vector indexing | Search functional |
| **4: Deployment** | 10-12 | UI polish, pilot deployment, testing, iteration | DocVault v1.0 live |

## Milestone Chart

```
Month:  1   2   3   4   5   6   7   8   9   10  11  12
        |-------|-------|-------|-------|-------|-------|
Phase 1: ███████ Hardware Setup
Phase 2:         ███████ Core Engine
Phase 3:                 ███████ Intelligence
Phase 4:                         ███████ Deployment
```

---

# 7. BUDGET BREAKDOWN

## Total Ask: ₹9,00,000 (Nine Lakhs)

| Category | Item | Amount (₹) |
|----------|------|------------|
| **Hardware** | GPU Server (RTX 4090 workstation) | 3,50,000 |
| **Hardware** | Document Scanner (Fujitsu fi-8170) | 1,25,000 |
| **Hardware** | NAS Storage (10TB+) | 50,000 |
| **Hardware** | Network Equipment | 25,000 |
| **Hardware** | Edge Processing Module | 75,000 |
| **Fabrication** | System Integration & Enclosure | 1,00,000 |
| **Services** | External Contractor (Development) | 1,50,000 |
| **Consumables** | Testing, Documentation, Misc | 25,000 |
| | **TOTAL** | **9,00,000** |

## Resource Allocation

```
Hardware & Infrastructure:  72%  ████████████████████████
System Integration:         11%  ████
External Services:          17%  █████
```

---

# 8. TEAM

## Founder

### Shivang Patel
**Founder & CEO, Mirai**

**20+ years product leadership | AI/ML platforms | 100M+ users served**

| Role | Organization | Impact |
|------|--------------|--------|
| Senior Manager, Product | Walmart Global Tech | $100M+ business impact, 200+ team, GenAI platforms |
| Group Product Manager | Fossil Group | 4 smartwatch generations launched |
| Co-Founder | Airosense (IoT) | 25% market share, Gujarat SPCB partnership |

**Education:**
- Executive Program, IoT — MIT (2018)
- MBA — Santa Clara University
- MS Electrical Engineering — San Jose State University

**Key Strengths:** Hardware + Software integration, AI/ML products, Gujarat ecosystem

## Entity

| Field | Details |
|-------|---------|
| Startup Name | Mirai (mirai360.ai) |
| Entity Type | Proprietorship |
| Registration | November 2025 |
| Location | Ahmedabad, Gujarat |
| Status | Early-stage with paying customers |

---

# 9. TRACTION & VALIDATION

## Current Customers

| Client | Location | Service | Status |
|--------|----------|---------|--------|
| Law Firm 1 | Ahmedabad | Document digitization, Gujarati-English translation | Active (Paying) |
| Law Firm 2 | Ahmedabad | Scanned copy processing, AI-ready conversion | Active (Paying) |

## What's Working Today

- Scanned document → searchable text conversion
- English + Gujarati OCR
- Gujarati ↔ English translation
- Legal professionals validating accuracy

## What Grant Enables

| Current State | Post-Grant State |
|---------------|------------------|
| Manual processing | Automated pipeline |
| File-by-file search | Corpus-wide semantic search |
| Basic text extraction | Q&A with citations |
| Software-only | Integrated hardware system |
| 2 customers | 10+ customers |

---

# 10. MARKET OPPORTUNITY

## Primary Market

| Segment | Size | Our Value |
|---------|------|-----------|
| **Courts** | 25 High Courts, 672 District Courts | Complete digitization infrastructure |
| **Law Firms** | 1,500+ firms, 1.7M advocates | Make existing archives searchable |

## Why Hardware Wins

| Competitor | Offering | Gap |
|------------|----------|-----|
| SpotDraft, Kira | Cloud software | No hardware, no digitization |
| Thomson Reuters | Subscription research | No document processing |
| Indian Kanoon | Free search | No private corpus, no OCR |

**Mirai DocVault:** Deploy complete infrastructure. Competitors sell software only.

## Government Opportunity

₹7,210 Cr approved for e-Courts Phase III¹ — scanners deploying, AI vendor not selected. Window is open.

---

# 11. WHY NIDHI-PRAYAS & iCREATE

## Program Fit

| Criteria | Mirai DocVault |
|----------|----------------|
| Stage | Idea-to-Prototype ✓ |
| Hardware focus | Scanner + Server + Storage ✓ |
| Funding need | ₹9L (within ₹10L limit) ✓ |
| Timeline | 12 months (within 18 months) ✓ |
| Indian innovation | Multilingual legal-tech ✓ |

## Why iCreate Ahmedabad

- **Location match:** Mirai based in Ahmedabad
- **Infrastructure:** FabLab, prototyping facilities available
- **Network:** Gujarat govt connections for judiciary pilots
- **Track record:** National Award Winner 2020

## What We Bring

- Technical team executing
- Paying customers (PMF validated)
- Clear 12-month prototype plan
- Domain expertise in legal-tech

---

# 12. SUMMARY

**WHAT:** Mirai DocVault — integrated hardware system (Scanner + GPU Server + Storage) that converts scanned legal documents into searchable, AI-ready archives.

**WHY NOW:** ₹8,880 Cr invested in court digitization, zero intelligence layer. Hardware deployed, AI missing. Window open.

**BY WHEN:** Working DocVault prototype deployed at 2 pilot sites within 12 months.

---

## Contact

**Mirai** | 未来 | Future

**Shivang Patel**
Founder & CEO

shivang@mirai360.ai | +91 7892921332 | Ahmedabad, Gujarat

---

*Document prepared for NIDHI-PRAYAS Grant Application*
*Target Incubator: iCreate, Ahmedabad*
*Date: December 2025*
*Version: 3.0 (PRAYAS Compliant — Hardware-First)*

---

## Sources

1. [E-Courts Mission Mode Project](https://doj.gov.in/ecourts-mission-mode-project-2/), Department of Justice — Phase II: ₹1,670 Cr; Phase III: ₹7,210 Cr
2. [Scanning & Digitization](https://ecommitteesci.gov.in/project/scanning-digitization-in-the-high-court/), e-Committee, Supreme Court — 311 Cr pages
3. [SBI vs Ajay Kumar Sood, 2022](https://www.livelaw.in/top-stories/supreme-court-judgments-digital-signature-scanned-version-printed-copies-state-bank-of-india-vs-ajay-kumar-sood-2022-livelaw-sc-706-207473) — SC on scanned documents
4. [MetaJure Research](https://metajure.com/lawyers-waste-six-hours-a-week-on-document-management-issues-2/) — 6 hrs/week wasted on document management
