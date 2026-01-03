# NIDHI-PRAYAS Grant Application Pitch

## Mirai — The Future of Legal
**360° Legal Intelligence: From Companies to Courts**

---

# 1. EXECUTIVE SUMMARY

## The Problem
**The legal workflow is a loop — but it's broken.**

- Companies generate **contracts** → disputes reach lawyers
- Lawyers litigate **cases** → cases reach courts
- Courts set **precedents** → precedents should inform future contracts

**Why it's broken:** Each stakeholder works in isolation.

| Stakeholder | What They Have | What's Missing | Impact |
|-------------|----------------|----------------|--------|
| **Courts** | 311 Cr pages digitized, ₹8,880 Cr spent | No AI to surface precedents | 47M cases pending |
| **Lawyers** | Years of expertise in folders | No co-pilot to scale playbooks | Every matter from scratch |
| **Companies** | Contracts across departments | No risk intelligence | Surprises become litigation |

The infrastructure exists. The intelligence layer is missing.

## Our Solution
**Mirai** — the operating system that closes the loop.

**One Platform. Three Stakeholders. Complete Loop.**

We deliver the complete pipeline — not just software:
- **Foundation:** Hardware, OCR in 10 Indian court languages, on-premise infrastructure
- **Intelligence:** RAG, agentic workflows, citations
- **Interface:** Document management, eCourts integration, custom agent builder

**Network Effect:** Private data stays private. Public precedents connect everyone. Each participant compounds their own intelligence.

## Traction
- Currently serving **2 large law firms in Ahmedabad**
- Processing scanned copies in **English and Gujarati**
- Converting to LLM-ready digital format with translation

## Ask
**₹9 Lakhs** under NIDHI-PRAYAS to build scalable Proof of Concept demonstrating:
- Processing 10,000+ legal documents
- Vernacular language semantic search interface (PoC: English + Gujarati; roadmap: Hindi, Bengali, Marathi, Telugu, Tamil, Kannada)
- RAG-based Q&A system
- On-premise deployment (data sovereignty compliant)

---

# 2. PROBLEM STATEMENT

## The Legal Workflow is a Loop — But It's Broken

- Companies generate **contracts** → disputes reach lawyers
- Lawyers litigate **cases** → cases reach courts
- Courts set **precedents** → precedents should inform future contracts

**Why it's broken:** Each stakeholder works in isolation.

### The Investment vs Reality Gap

| Entity | Investment | What's Missing |
|--------|-----------|----------------|
| e-Courts Phase II | ₹1,670 Cr spent | No AI to surface precedents |
| e-Courts Phase III | ₹7,210 Cr approved | No AI vendor yet |
| Gujarat HC (2024) | 1,179 scanners deployed | PDFs searchable individually, not as corpus |

**311 Cr pages digitized.** But individual file search ≠ corpus intelligence.

### Impact by Stakeholder

| Stakeholder | Current State | Impact |
|-------------|---------------|--------|
| **Courts** | 47M cases pending | Years to resolve; judges manually hunt precedents |
| **Lawyers** | Expertise trapped in folders | Every matter starts from scratch; 6 hrs/week wasted on document management |
| **Companies** | Contracts scattered | Surprises become litigation; no risk visibility |

### The Common Thread
The infrastructure exists. The intelligence layer is missing.

Government is creating the **data**. We are building the **intelligence layer**.

---

# 3. SOLUTION

## Mirai — The Operating System for India's Legal Ecosystem

### What We Build
**The intelligence layer that closes the loop** — connecting Companies, Lawyers, and Courts.

We deliver the complete pipeline — not just software:
- **Foundation:** Hardware, OCR in 10 Indian court languages, on-premise infrastructure
- **Intelligence:** RAG, agentic workflows, citations
- **Interface:** Document management, eCourts integration, custom agent builder

Works with existing infrastructure or as turnkey deployment. Forward and backward compatible.

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

| Component | Function | Technology |
|-----------|----------|------------|
| **Hardware Layer** | Scanners, GPU servers, NAS storage, network | Fujitsu/Canon scanners, RTX 4090, 10TB+ NAS |
| **Document Ingestion** | Accept from scanners, folders, FTP, API, legacy PDFs | Python, Apache Tika, hot folder watch |
| **Text Extraction** | OCR for 10 Indian languages + English | NeMo, Tesseract, EasyOCR, LayoutLM |
| **Translation Engine** | Any Indian language ↔ English | AI4Bharat IndicTrans2 (22 languages) |
| **Chunking Engine** | Legal-aware text segmentation | Custom (clause, section aware) |
| **Vector Database** | Semantic embeddings storage | ChromaDB/Milvus (on-premise) |
| **RAG Pipeline** | Context retrieval + LLM generation | LangChain, local LLM (Llama 3, Mistral) |
| **Cloud Sync** | Secure sync to cloud for remote access | Encrypted, selective sync |
| **Search Interface** | Semantic + keyword hybrid search | Custom UI (web + mobile) |
| **Q&A Interface** | Natural language queries in any language | Chat interface with citations |

### Key Differentiators

| Feature | Why It Matters |
|---------|----------------|
| **Complete End-to-End** | Hardware → On-premise processing → Cloud sync → RAG. Single vendor, full stack. |
| **Privacy-First Architecture** | Private data stays private. Public precedents connect everyone. No cross-party learning. |
| **Hybrid Deployment** | On-premise processing (data sovereignty) + Cloud RAG interface (accessibility anywhere) |
| **Backward Compatible** | Works with existing scanners + previously scanned documents. No rework. |
| **India-Native** | OCR + translation for 10 Indian court languages. Covers all 25 High Courts. |
| **Agentic AI** | Specialized agents for contract review, case research, compliance. Hallucination-resistant. |
| **Proven Traction** | Already serving 2 law firms in Ahmedabad |

---

# 4. MARKET OPPORTUNITY

## India Legal Tech Market

| Metric | Value | Source |
|--------|-------|--------|
| Legal Services Market (2025) | $2.49 Billion | Mordor Intelligence |
| Legal Tech Market (2030) | $1.25 Billion | Grand View Research |
| Legal AI CAGR | 23% (2025-2030) | Grand View Research |
| Pending Cases | 47 Million+ | National Judicial Data Grid |
| Legal Tech Startups | 650-800 | Industry Reports |

## Target Segments

### Segment 1: Government/Judiciary (Primary)
- **Size**: 25 High Courts, 672 District Courts, Tribunals
- **Entry Point**: Gujarat HC (reference from scanner tender context)
- **Value Prop**: Complete end-to-end digitization - we provide hardware + software + process legacy archives + enable AI search
- **Revenue Model**: Implementation + Annual Maintenance Contract

### Segment 2: Law Firms (Current Customers)
- **Size**: 1,500+ registered law firms, 1.7M advocates
- **Pain Point**: Hours spent on document research, scattered archives
- **Value Prop**: We digitize their existing paper/scanned archives + set up scanners + provide AI search - complete transformation
- **Revenue Model**: SaaS subscription + one-time setup
- **Traction**: 2 large law firms in Ahmedabad (active)

### Segment 3: Corporate Legal (Tertiary)
- **Size**: 10,000+ companies with legal departments
- **Pain Point**: Contract management, compliance tracking
- **Value Prop**: Contract intelligence, obligation extraction
- **Revenue Model**: Enterprise license

## Competitive Landscape

| Competitor | Focus | Our Advantage |
|------------|-------|---------------|
| SpotDraft | Contract lifecycle | No digitization, cloud-only |
| Leegality | e-Signatures | Partner opportunity, no AI |
| Kira | Contract review | Single function, no India focus |
| Luminance | Due diligence | Cloud, expensive, no vernacular language support |
| Thomson Reuters | Legal research | Subscription model, no document processing |

**Our Moat**: Complete end-to-end stack (hardware → intelligence → interface), privacy-first architecture, hybrid deployment, backward compatibility, India-native vernacular support, existing traction.

---

# 5. PROOF OF CONCEPT SCOPE

## PoC Objectives
Scale our existing solution from current law firm pilots to a robust, deployable platform.

## Deliverables

| Deliverable | Description | Success Metric |
|-------------|-------------|----------------|
| **Document Ingestion** | Process 10,000+ legal documents | 100% ingestion rate |
| **Text Extraction** | OCR for English + Gujarati | 95%+ accuracy |
| **Translation** | Gujarati ↔ English legal translation | 90%+ accuracy |
| **Vector Index** | Semantic embeddings for corpus | Sub-second search |
| **Search Interface** | Semantic + keyword search UI | Relevant results in top 5 |
| **RAG Q&A** | Natural language query interface | Accurate answers with citations |
| **On-Premise Deploy** | Runs on local GPU server | Zero cloud dependency |

## PoC Timeline

| Phase | Duration | Activities |
|-------|----------|------------|
| **Phase 1** | Month 1-3 | Infrastructure setup, scale document pipeline |
| **Phase 2** | Month 4-8 | Vector DB, search, RAG development, translation refinement |
| **Phase 3** | Month 9-12 | UI development, testing, optimization |
| **Phase 4** | Month 13-18 | Additional pilots, feedback, iteration |

## Current Progress (Pre-PoC)
- ✅ Document ingestion pipeline (working)
- ✅ English + Gujarati OCR (working)
- ✅ Translation capability (working)
- ✅ 2 law firm pilots (active)
- ⏳ Scalable vector search (needs development)
- ⏳ RAG Q&A interface (needs development)
- ⏳ On-premise GPU deployment (needs hardware)

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
**Founder & CEO, mirai360.ai**

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
| Large Law Firm 2 | Ahmedabad | Scanned copy processing, LLM-ready conversion | Active |

## What We're Delivering Today
1. **Scanned document processing**: Converting image PDFs to text
2. **Vernacular language support**: English and Gujarati documents
3. **Translation**: Gujarati ↔ English for cross-language research
4. **LLM-ready output**: Structured text that AI systems can understand

## Validation Points
- ✅ Law firms are paying for the service
- ✅ Real-world document volumes being processed
- ✅ Gujarati language capability proven
- ✅ Translation accuracy validated by legal professionals

## What Grant Enables
- Scale from manual/semi-automated to fully automated pipeline
- Add semantic search across entire corpus
- Build RAG Q&A interface
- Deploy on-premise GPU infrastructure
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
- **Amount Fit**: ₹10L covers infrastructure + development
- **Timeline Fit**: 18 months aligns with our scaling goals
- **Ecosystem**: Access to labs, mentorship, network

## Why iCreate Ahmedabad
- **Location**: We are based in Ahmedabad
- **Track Record**: National Award Winner 2020
- **Infrastructure**: FabLab, IoT lab, prototyping facilities
- **Network**: Gujarat govt connections (relevant for judiciary pilots)

## What We Bring
- ✅ Technical team already executing
- ✅ Paying customers (2 law firms)
- ✅ Proven product-market fit
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
