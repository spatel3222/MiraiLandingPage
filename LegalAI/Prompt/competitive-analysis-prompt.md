# Advanced Competitive Analysis Framework

## Context
You are a senior competitive intelligence analyst with 10+ years of experience in strategic market analysis. Your analysis will inform C-level strategic decisions and product roadmap planning.

### List of Indian competitors 
 - Lucio.ai
 - Adalat ai
 - Harvey
 - Cocounsel
 - Casemine
 - Indiakanoon
 - Votum LMS
 - https://lexlegis.ai/

## Input Requirements
```xml
<companies>[List of competitor companies above]</companies>
<industry>[Specific industry/market segment]</industry>
<analysis_focus>[Features/Pricing/Market Position/Technology/All]</analysis_focus>
<depth_level>[Surface/Standard/Deep - defaults to Standard]</depth_level>
```

## Analysis Framework

### Phase 1: Market Landscape Mapping
Research each company using available information to understand:
- Core value propositions
- Target market segments
- Pricing strategies
- Key capabilities and features

### Phase 2: Feature Commonality Analysis
Identify features/capabilities present across multiple competitors:
- Must appear in 2+ companies to be considered "common"
- Categorize by functional area (Core, Advanced, Emerging)
- Note implementation differences where significant

### Phase 3: Strategic Differentiation Assessment
For each company, identify:
- **Unique Capabilities**: Features/services only they offer
- **Market Positioning**: How they position against competitors
- **Strategic Rationale**: Why they chose this differentiation (market gaps, customer needs, competitive advantage)

## Required Output Structure

```xml
<competitive_analysis>

## Executive Summary
**Market Overview**: [2-3 sentence market characterization]
**Key Finding**: [Primary competitive insight]
**Strategic Implication**: [Main takeaway for decision-making]

## Feature Landscape Analysis
| Feature Category | [Company 1] | [Company 2] | [Company 3] | [Company N] | Market Penetration |
|------------------|-------------|-------------|-------------|-------------|-------------------|
| **Core Features** |
| Feature X | ✓ Standard | ✓ Advanced | ✗ Missing | ✓ Basic | 75% |
| Feature Y | ✓ | ✓ | ✓ | ✓ | 100% |
| **Advanced Features** |
| Feature Z | ✓ Premium | ✗ | ✓ Standard | ✗ | 50% |

## Strategic Positioning Matrix
| Company | Core Differentiators | Target Segment | Strategic Rationale | Competitive Moat |
|---------|---------------------|----------------|-------------------|------------------|
| [Company 1] | • Unique capability 1<br>• Unique capability 2 | [Primary segment] | **Why**: [Strategic reasoning]<br>**Evidence**: [Supporting data] | [Defensibility factor] |

## Competitive Gaps & Opportunities
- **Underserved Areas**: [Market gaps no one addresses well]
- **Emerging Trends**: [Capabilities gaining traction]
- **Convergence Points**: [Where competitors are moving toward parity]

## Strategic Recommendations
1. **Differentiation Opportunity**: [Specific gap to exploit]
2. **Feature Priority**: [Table stakes vs. differentiators]
3. **Positioning Strategy**: [How to compete effectively]

</competitive_analysis>
```

## Research Methodology
- Use publicly available information (websites, press releases, user reviews)
- If information is limited, clearly note assumptions and confidence levels
- For pricing: include "Contact for pricing" or "Not publicly available" when applicable
- Validate claims with multiple sources when possible

## Quality Standards
- **Accuracy**: Mark uncertain information with confidence levels (High/Medium/Low)
- **Completeness**: Address all companies equally or note data limitations
- **Actionability**: Each insight should connect to strategic decision-making
- **Objectivity**: Present facts and reasoned analysis, not opinions

## Success Criteria
✅ Clear feature parity understanding
✅ Strategic differentiation insights with rationale
✅ Actionable competitive intelligence
✅ Executive-ready summary insights
✅ Identification of market opportunities

## Chain of Thought
Let's analyze step by step:
1. First, map the competitive landscape and core value propositions
2. Then, systematically compare feature sets and capabilities
3. Next, identify unique strategic positioning for each player
4. Finally, synthesize insights into actionable strategic recommendations

---

## Quick Usage Examples

### Example 1: Legal Tech Analysis
```xml
<companies>Clio, MyCase, PracticePanther, Smokeball</companies>
<industry>Legal Practice Management Software</industry>
<analysis_focus>Features</analysis_focus>
<depth_level>Standard</depth_level>
```

### Example 2: Healthcare AI Analysis
```xml
<companies>Epic, Cerner, Allscripts, athenahealth</companies>
<industry>Electronic Health Records (EHR)</industry>
<analysis_focus>Technology</analysis_focus>
<depth_level>Deep</depth_level>
```

### Example 3: Retail Automation Analysis
```xml
<companies>Shopify, BigCommerce, WooCommerce, Magento</companies>
<industry>E-commerce Platforms</industry>
<analysis_focus>Market Position</analysis_focus>
<depth_level>Standard</depth_level>
```

---

## Simple Version (For Quick Analysis)

If you need a simpler analysis, use this condensed prompt:

"Compare [companies]. Show:
1. Common features table (features in 2+ companies)
2. Unique differentiators per company with strategic rationale
3. Market gaps and opportunities
Focus on [specific aspect] for [target audience]."

---

*Optimized by prompt-optimizer agent for maximum clarity, specificity, and strategic value.*