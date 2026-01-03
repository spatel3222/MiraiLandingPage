# NIDHI-PRAYAS Grant Application Pitch

## Mirai — The Future of Legal
**Making Public Legal Data Accessible, Searchable & Secure**

---

# 1. EXECUTIVE SUMMARY

**₹8,880 Cr spent on digitization.¹ Still no searchable corpus.** Courts have scanners. Lawyers have archives. But no intelligence layer connects them — judges hunt precedents manually, lawyers can't find their own documents.

**Mirai** delivers the missing layer: complete hardware-to-AI pipeline that works with existing infrastructure.

**Traction:** Paying customers (2 law firms in Ahmedabad) processing English + Gujarati documents.

**Ask:** ₹9 Lakhs — hardware (₹3L) + development (₹6L) — to scale from pilots to 10,000+ document platform.

**Vision:** One Platform. Two Stakeholders (Courts + Lawyers). Complete digitization-to-intelligence loop.

---

# 2. PROBLEM STATEMENT

## The Hardware Investment Gap

**Massive digitization investment. Zero intelligence layer.**

| Entity | Hardware Investment | Current State | What's Missing |
|--------|---------------------|---------------|----------------|
| e-Courts Phase II¹ | ₹1,670 Cr spent | 311 Cr pages scanned² | No AI to surface precedents |
| e-Courts Phase III¹ | ₹7,210 Cr approved | Scanners being deployed | No AI vendor selected |
| Gujarat HC (2024) | 1,179 scanners | PDFs stored individually | No corpus-level search |
| Law Firms | Existing scanner investments | Archives in folders | No unified search |

## The Core Problem

**Individual file search ≠ Corpus intelligence.**

- A judge can open one PDF at a time — but can't search "show me all bail orders for Section 302"
- A lawyer can find one document — but can't ask "what did we argue in similar cases?"

## Voices from the Field

> "Scanned copies of a document... cannot be treated as electronic records."
> — **Supreme Court of India**, SBI vs Ajay Kumar Sood (2022)³

> "Lawyers waste 6 hours per week on document management issues... 2.3 hours searching for documents they cannot find."
> — **MetaJure Research**⁴

The judiciary itself has acknowledged: **digitization without intelligence is not enough.**

## Impact

| User | Pain Point | Quantified Impact |
|------|-----------|-------------------|
| **Courts** | Manual precedent hunting | 47M cases pending⁵ |
| **Lawyers** | Document findability | 6 hrs/week wasted⁴ |

## The Opportunity

Every scanner already deployed, every PDF already scanned — can now become searchable. No re-investment required.

---

# 3. SOLUTION

## Mirai — Complete Digitization Infrastructure with AI Search

### What We Build
**The intelligence layer that makes existing hardware investments useful.**

We deliver the full pipeline — hardware to search:
- **Hardware:** Scanners, servers, storage, network
- **Processing:** Convert scanned images to searchable text (10 Indian languages)
- **Search:** Ask questions in plain language, get answers with source citations

### Hardware Compatibility (Key Differentiator)

| Input Source | How We Support It |
|--------------|-------------------|
| **New Scanners** | We provide + configure (Fujitsu, Canon, HP) |
| **Existing Scanners** | Auto-detect when files land in shared folders |
| **Legacy Scanned PDFs** | Bulk import — no re-scanning needed |
| **eCourts Integration** | Direct connection to government court databases |

**Zero vendor lock-in.**

### Architecture Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                        INPUT SOURCES                             │
│  [New Scanners]  [Existing Scanners]  [Previously Scanned PDFs] │
│        ↓                 ↓                      ↓                │
│   Full hardware    Plug into existing    Backward compatible    │
│      setup           infrastructure         processing          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              ON-PREMISE PROCESSING (Data Sovereignty)            │
│                                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │ Document │ → │   OCR    │ → │  Vector  │ → │ Local    │     │
│  │ Ingestion│   │(NeMo/    │   │Embedding │   │ Index    │     │
│  │          │   │Tesseract)│   │          │   │          │     │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘     │
│        │                                                         │
│        ▼                                                         │
│  ┌──────────┐                                                   │
│  │Translation│  (Gujarati ↔ English)                            │
│  └──────────┘                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                         Secure Sync
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUD RAG LAYER (Accessibility)               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    UNIFIED INDEX                          │   │
│  │  • Semantic Search    • Entity Extraction                 │   │
│  │  • Q&A Interface      • Vernacular Language Support        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   USER INTERFACES (Anywhere)                     │
│  [Courts]  [Lawyers]  [Legal Researchers]  [Compliance Teams]   │
│                                                                  │
│  "Show bail precedents for Section 302"                         │
│  "What obligations exist under Clause 4.2 of Contract #ABC?"    │
│  "Translate and summarize this Gujarati judgment"               │
└─────────────────────────────────────────────────────────────────┘
```

### Core Components

| Layer | What It Does |
|-------|--------------|
| **Hardware** | Scanners, servers, storage, network |
| **Processing** | Convert images to text, translate between languages |
| **Intelligence** | Understand meaning, find similar documents, generate answers |
| **Interface** | Search and ask questions in plain language |

*See Appendix A for detailed technical specifications and software stack.*

### Key Differentiators

| Feature | Why It Matters |
|---------|----------------|
| **Complete Hardware Stack** | Scanners → Servers → Storage → Network. Single vendor, full deployment. |
| **Backward Compatible** | Works with existing scanners + legacy PDFs. No re-scanning. |
| **On-Premise First** | Data sovereignty compliant. Sensitive documents never leave premises. |
| **Indian Language Support** | Reads 10 Indian court languages. Covers all 25 High Courts. |

---

# 4. MARKET OPPORTUNITY

## Primary Focus: Courts + Law Firms

| Segment | Size | Hardware Opportunity | Our Value Prop |
|---------|------|---------------------|----------------|
| **Government/Judiciary** | 25 High Courts, 672 District Courts | ₹7,210 Cr Phase III budget¹ | Complete hardware + AI layer |
| **Law Firms** | 1,500+ firms, 1.7M advocates | Existing scanner investments | Make archives searchable |

## Why Hardware-First Wins

| Competitor | What They Offer | What's Missing |
|------------|-----------------|----------------|
| SpotDraft, Kira, Luminance | Cloud software only | No hardware, no digitization |
| Thomson Reuters | Subscription research | No document processing |
| Indian Kanoon | Free search | No private corpus, no OCR |

**Our Moat:** We deploy complete infrastructure. Competitors sell software. We deliver searchable archives.

## Future Expansion (Post-PoC)
- Corporate legal departments (contract management)
- Compliance teams (regulatory tracking)
- Legal researchers (academic institutions)

---

# 5. PROOF OF CONCEPT SCOPE

## PoC Objectives
Scale our existing solution from current law firm pilots to a robust, deployable platform.

## Deliverables

| Deliverable | Description | Success Metric |
|-------------|-------------|----------------|
| **Document Ingestion** | Process 10,000+ legal documents | 100% processed |
| **Text Extraction** | Convert scanned images to text (English + Gujarati) | 95%+ accuracy |
| **Translation** | Gujarati ↔ English legal translation | 90%+ accuracy |
| **Smart Search** | Find documents by meaning, not just keywords | Results in <1 second |
| **Search Interface** | User-friendly search screen | Relevant results in top 5 |
| **Q&A System** | Ask questions, get answers with source citations | Accurate with references |
| **On-Premise Deploy** | Runs on local server (no cloud required) | Works offline |

## PoC Timeline

| Phase | Duration | Activities |
|-------|----------|------------|
| **Phase 1** | Month 1-3 | Infrastructure setup, scale document pipeline |
| **Phase 2** | Month 4-8 | Smart search, Q&A system, translation refinement |
| **Phase 3** | Month 9-12 | UI development, testing, optimization |
| **Phase 4** | Month 13-18 | Additional pilots, feedback, iteration |

## Current Progress (Pre-PoC)
- ✅ Document processing pipeline (working)
- ✅ English + Gujarati text extraction (working)
- ✅ Translation capability (working)
- ✅ 2 law firm pilots (active)
- ⏳ Smart search (needs development)
- ⏳ Q&A system (needs development)
- ⏳ On-premise server deployment (needs hardware)

---

# 6. BUDGET BREAKDOWN

## Total Ask: ₹9,00,000 (Nine Lakhs)

| Category | Item | Amount (₹) |
|----------|------|------------|
| **Development** | Full-time Engineer (1) @ ₹50K/month × 12 months | 6,00,000 |
| **Hardware** | GPU Server (RTX 4090 or equivalent) | 2,00,000 |
| **Hardware** | Scanner (Fujitsu fi-8170 or equiv) - 1 unit for testing | 75,000 |
| **Hardware** | Storage (NAS 10TB+) + Network equipment | 25,000 |
| | **TOTAL** | **9,00,000** |

## Resource Utilization

```
Development (Engineer):    67%  ██████████████████████
Hardware & Infrastructure: 33%  ███████████
```

---

# 7. TEAM

## Founder

### Shivang Patel
**Founder & CEO, Mirai**

**20+ years product leadership | AI/ML platforms | 100M+ users served**

- **Ex-Walmart Global Tech** - Senior Manager, Product Management (2022-Present)
  - Scaled Conversational AI from task-based to GenAI across international markets
  - $100M+ business impact, 20% engagement increase
  - Led 200+ cross-functional team (AI/ML engineers, designers, PMs)

- **Ex-Fossil Group** - Group Product Manager, Wearables (2019-2022)
  - Launched 4 generations of smartwatches
  - Cross-functional leadership: Marketing, Engineering, Legal, Data Analytics

- **Co-Founder, Airosense** (2014-2018)
  - Built Industrial IoT platform from prototype to profitability
  - 25% market share in India's smart cities air quality monitoring
  - Partnerships: Gujarat State Pollution Control Board, US EPA

**Education:**
- Executive Program, IoT - MIT (2018)
- MBA - Santa Clara University (2010-2013)
- MS Electrical Engineering - San Jose State University (2002-2004)

**Key Achievements:** $100M+ revenue impact • 200+ team led • 100M+ users served • 4 product generations launched

**Location:** Ahmedabad, Gujarat

## Entity Details
| Field | Details |
|-------|---------|
| **Startup Name** | Mirai (mirai360.ai) |
| **Entity Type** | Proprietorship |
| **Registration** | November 2025 |
| **Location** | Ahmedabad, Gujarat |
| **Status** | Early-stage with paying customers |

## Current Team Capabilities
- AI/ML development
- Full-stack engineering
- OCR and document processing
- Vernacular NLP (English, Gujarati)

## Advisory (To Build)
- Legal domain expert (retired judge / senior advocate)
- Enterprise sales (govt/judiciary experience)
- Technical advisor (AI/NLP specialist)

## Hiring Plan (Post-PoC)
- Full-stack developer (1)
- ML Engineer (1)
- Legal domain specialist (1)
- Sales/BD (1)

---

# 8. TRACTION & VALIDATION

## Current Customers

| Client Type | Location | Services | Status |
|-------------|----------|----------|--------|
| Large Law Firm 1 | Ahmedabad | Document digitization, Gujarati-English translation | Active |
| Large Law Firm 2 | Ahmedabad | Scanned copy processing, AI-ready conversion | Active |

## What We're Delivering Today
1. **Scanned document processing**: Converting image PDFs to searchable text
2. **Regional language support**: English and Gujarati documents
3. **Translation**: Gujarati ↔ English for cross-language research
4. **AI-ready output**: Structured text that search systems can understand

## Validation Points
- ✅ Law firms are paying for the service
- ✅ Real-world document volumes being processed
- ✅ Gujarati language capability proven
- ✅ Translation accuracy validated by legal professionals

## What Grant Enables
- Scale from manual to fully automated document processing
- Add smart search across entire document collection
- Build question-and-answer system with citations
- Deploy on-premise server infrastructure
- Expand from 2 to 10+ customers

---

# 9. GO-TO-MARKET STRATEGY

## Phase 1: PoC & Scale (Month 1-18)
- Build scalable platform from current pilots
- Expand to 5-10 law firms in Ahmedabad/Gujarat
- Document case studies from existing customers

## Phase 2: Gujarat Market (Month 18-30)
- Reference from Gujarat HC ecosystem
- Target district courts in Gujarat
- Partner with Leegality for e-sign integration
- 15-20 paying customers

## Phase 3: National Expansion (Month 30+)
- Replicate Gujarat playbook in Maharashtra, Delhi
- Enterprise law firm deals
- Corporate legal departments
- Platform licensing model

## Partnership Strategy
| Partner Type | Examples | Value Exchange |
|--------------|----------|----------------|
| Scanner Vendors | Canon, HP, Fujitsu | Bundle AI layer with hardware |
| e-Sign Platforms | Leegality | Integration, cross-sell |
| Legal Databases | Indian Kanoon | Data access, co-marketing |
| System Integrators | TCS, Infosys | Govt implementation channel |

---

# 10. WHY NIDHI-PRAYAS & iCREATE

## Why PRAYAS
- **Stage Fit**: We have traction, need funding to scale PoC
- **Amount Fit**: ₹9L covers infrastructure + development
- **Timeline Fit**: 18 months aligns with our scaling goals
- **Ecosystem**: Access to labs, mentorship, network

## Why iCreate Ahmedabad
- **Location**: We are based in Ahmedabad
- **Track Record**: National Award Winner 2020
- **Infrastructure**: FabLab, IoT lab, prototyping facilities
- **Network**: Gujarat govt connections (relevant for judiciary pilots)

## What We Bring
- ✅ Technical team already executing
- ✅ Paying customers with proven PMF
- ✅ Clear scaling roadmap
- ✅ Domain expertise in legal-tech

---

# 11. APPENDIX

## A. Technical Specifications

### Minimum Hardware Requirements (On-Premise)
| Component | Specification |
|-----------|--------------|
| GPU | NVIDIA RTX 4090 (24GB VRAM) or equivalent |
| CPU | AMD EPYC / Intel Xeon (16+ cores) |
| RAM | 64GB DDR5 |
| Storage | 10TB NVMe SSD + 50TB HDD |
| Network | Gigabit Ethernet |

### Input Sources (Multiple Data Paths)

**We accept documents from ANY source:**

| Source Type | Examples | Integration Method |
|-------------|----------|-------------------|
| **New Scanner Setup** | We provide + configure hardware | Direct TWAIN/ISIS integration |
| **Existing Scanners** | Client's current scanners | Hot folder watch, network share |
| **Legacy Scanned PDFs** | Previously digitized archives | Batch import, API upload |
| **Email Attachments** | Documents received via email | Email gateway integration |
| **Cloud Storage** | Google Drive, OneDrive, Dropbox | API sync |
| **FTP/SFTP** | Automated document drops | Scheduled polling |
| **Manual Upload** | One-off documents | Web UI drag-drop |

**File Formats Supported:**
- PDF (searchable or image-based)
- TIFF, JPEG, PNG images
- Microsoft Word (.docx)
- Scanned books (multi-page TIFF)

**Scanner Compatibility (if we provide hardware):**
| Vendor | Models | Interface |
|--------|--------|-----------|
| Fujitsu | fi-8170, fi-7160, ScanSnap | TWAIN, ISIS, Network |
| Canon | DR-C225, imageFORMULA | TWAIN, Network folder |
| HP | ScanJet Pro | TWAIN, Network |
| Epson | WorkForce DS-series | TWAIN, Network |

**Key Point:** Zero vendor lock-in. Works with what you have OR we set up new infrastructure.

### Software Stack
| Layer | Technology |
|-------|------------|
| OCR | NVIDIA NeMo (primary), Tesseract, EasyOCR, LayoutLM |
| Text Processing | spaCy, NLTK, custom NER |
| Translation | AI4Bharat IndicTrans2 (22 Indic languages), open-source, on-premise capable |
| Embeddings | Sentence Transformers, BGE |
| Vector DB | ChromaDB, Milvus, Qdrant |
| LLM | Llama 3, Mistral (local) |
| RAG Framework | LangChain, LlamaIndex |
| Backend | FastAPI, Python |
| Frontend | React, Next.js |
| Deployment | Docker, Kubernetes |

## B. References

### Market Research
- Grand View Research: India Legal Technology Market
- Mordor Intelligence: India Legal Services Market
- National Judicial Data Grid: Case statistics

### Tender Reference
- Gujarat High Court RFP No. ITC/RFP/06/2024
- 1,179 scanners across Gujarat State Judiciary
- Validates government investment in digitization infrastructure

### PRAYAS Program
- NIDHI-PRAYAS Official: https://nidhi-prayas.org/
- iCreate: https://icreate.org.in/

---

## Sources

1. [E-Courts Mission Mode Project](https://doj.gov.in/ecourts-mission-mode-project-2/), Department of Justice — Phase II: ₹1,670 Cr spent (2015-2023); [Phase III](https://doj.gov.in/phase-iii/): ₹7,210 Cr approved (2023-2027)
2. [Scanning & Digitization in Courts](https://ecommitteesci.gov.in/project/scanning-digitization-in-the-high-court/), e-Committee, Supreme Court of India — 311 crore pages digitized
3. [State Bank of India vs Ajay Kumar Sood, 2022](https://www.livelaw.in/top-stories/supreme-court-judgments-digital-signature-scanned-version-printed-copies-state-bank-of-india-vs-ajay-kumar-sood-2022-livelaw-sc-706-207473) — Supreme Court on scanned documents being inaccessible
4. [MetaJure Research](https://metajure.com/lawyers-waste-six-hours-a-week-on-document-management-issues-2/) — Lawyers waste 6 hours/week on document management; 2.3 hours searching for unfindable documents
5. [National Judicial Data Grid (NJDG)](https://njdg.ecourts.gov.in/) — 47M+ pending cases
6. [Grand View Research](https://www.grandviewresearch.com/) — India Legal AI Market Outlook 2024-2030 (23% CAGR)
7. [Research and Markets](https://www.researchandmarkets.com/) — India Regulatory Technology Business Report 2024 (37.8% CAGR)

---

## Summary

**WHAT:** Complete digitization infrastructure with AI search — hardware to intelligence in one platform.

**WHY:** ₹8,880 Cr invested in digitization, zero intelligence layer. The window is open.

**BY WHEN:** 10,000+ documents searchable, 10+ customers within 18 months.

---

## Contact

**Mirai** | 未来 | Future
*Building the operating system for India's legal ecosystem*

**Shivang Patel**
Founder & CEO

shivang@mirai360.ai | +91 7892921332 | Ahmedabad, Gujarat

---

*Document prepared for NIDHI-PRAYAS Grant Application*
*Target Incubator: iCreate, Ahmedabad*
*Date: December 2025*
*Version: 2.3 (Plain English per write_pitch v3.0)*
