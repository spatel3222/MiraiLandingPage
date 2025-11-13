# MOI Analytics Julius Prompt V6

## Objective
Build a unified marketing dataset across Meta, Google, and Shopify using provided CSVs with comprehensive validation to ensure data accuracy and prevent attribution errors.

## Data Inputs (Present on Disk)

### Meta Advertising Data
- **Files**: `Meta_Ads_day-month.csv` … `Meta_Ads_day-month.csv`
- **Columns**: 
  - Reporting starts
  - Campaign name
  - Ad set name
  - Ad name
  - Amount spent (INR)
  - CTR (link click-through rate)
  - CPM (cost per 1,000 impressions)

### Google Advertising Data
- **Files**: `Google_day-month.csv` … `Google_day-month.csv`
- **Columns**:
  - Day
  - Campaign
  - Cost

### Shopify Analytics Data
- **Files**: `Shopify_day-month.csv` … `Shopify_day-month.csv`
- **Columns**:
  - Hour or Day
  - Online store visitors
  - Sessions that completed checkout
  - Pageviews
  - Average session duration
  - UTM campaign
  - UTM term
  - UTM content

### Reference Data
- **File**: `unified_ads_shopify_date range_month.csv` (for context/reference only)

## Processing Steps

### 1. Pre-Processing Validation (See Section 7.1)
1. Load all Meta, Google, and Shopify CSVs
2. Execute file integrity checks
3. Validate schema compliance
4. Check date range coverage

### 2. Data Quality Validation (See Section 7.2)
1. Apply numeric bounds validation
2. Standardize date/time formats
3. Clean and validate text data
4. Convert numeric columns with errors='coerce'

### 3. Data Harmonization
1. Harmonize columns across datasets
2. For Shopify, derive Day from Hour when present
3. Map UTM parameters to campaign structure
4. Execute cross-platform consistency checks (See Section 7.3)

### 4. Attribution Logic Implementation
1. Apply attribution validation (See Section 7.3)
2. Aggregate Shopify metrics at correct granularity:
   - **Meta**: Day + Campaign + Ad Set + Ad
   - **Google**: Day + Campaign
3. Create Meta_eval and Google_eval tables
4. Stack into unified_attr dataset

### 5. Business Logic Validation (See Section 7.4)
1. Define good_lead_flag: Duration ≥60s AND Pageviews ≥5
2. Compute attribution metrics: visitors, checkouts, good_leads
3. Calculate performance metrics with validation
4. Apply empirical Bayes shrinkage

### 6. Scoring and Recommendations
1. Execute statistical validation (See Section 7.4)
2. Compute ad-level aggregations
3. Calculate ad_score = 0.4*efficiency + 0.4*quality + 0.2*volume
4. Apply recommendation mapping and confidence levels

### 7. Output Validation (See Section 7.5)
1. Execute totals reconciliation
2. Validate leaderboard completeness
3. Generate quality reports
4. Create final outputs with validation stamps

## Key Definitions

### Good Lead Classification
- **good_lead_flag**: Average session duration >= 60 seconds AND Pageviews >= 5
- **good_lead_count** = Online store visitors where good_lead_flag is true, else 0

### Attribution Metrics
- **visitors_attributed**
- **checkouts_attributed** 
- **good_lead_attributed**
- **pageviews_attributed**

### Performance Metrics
- **CPC** = spend / visitors_attributed (if > 0)
- **cost_per_good_lead** = spend / good_lead_attributed (if > 0)
- **cost_per_checkout** = spend / checkouts_attributed (if > 0)
- **good_lead_rate** = good_lead_attributed / visitors_attributed (if > 0)
- **checkout_rate** = checkouts_attributed / visitors_attributed (if > 0)

## Scoring Framework

### Score Calculation
- Rank cpl_gl_shrunk ascending and shrunk_good_lead_rate_agg descending
- Normalize ranks to 0–1
- Volume score: min(visitors_attributed / 500, 1)
- **ad_score** = 0.4*efficiency + 0.4*quality + 0.2*volume

### Recommendation Mapping
- **Green (Scale)**: ad_score ≥0.90
- **Light Green (Test-to-Scale)**: ad_score 0.80–0.90
- **Purple (Optimize)**: ad_score 0.70–0.80
- **Red (Pause/Fix)**: ad_score <0.70

### Confidence Levels
- **High**: visitors_attributed >= 100 and days_active >= 3
- **Medium**: visitors_attributed >= 30
- **Low**: otherwise

## Section 7: Validation Framework

### 7.1 Pre-Processing Validation
**File Integrity Checks**
- ✓ All required CSV files present
- ✓ File sizes > 0 bytes
- ✓ Files readable/not corrupted
- ✓ Date range coverage complete
- ✓ No gaps in daily data

**Schema Validation**
- ✓ Required columns present in each dataset
- ✓ Column data types match expectations
- ✓ No unexpected null columns
- ✓ Column name consistency

### 7.2 Data Quality Validation
**Numeric Data Bounds**
- ✓ Spend/Cost values >= 0
- ✓ CTR between 0-100%
- ✓ CPM > 0
- ✓ Session duration < 24 hours
- ✓ Pageviews >= 0
- ✓ Visitors >= Checkouts (impossible values)

**Date/Time Validation**
- ✓ All dates within expected range
- ✓ Date formats consistent
- ✓ No future dates
- ✓ Hour/Day derivation accurate

**Text Data Validation**
- ✓ Campaign names not empty
- ✓ UTM parameters properly formatted
- ✓ No special characters breaking attribution
- ✓ Case consistency across platforms

### 7.3 Attribution Validation
**UTM Mapping Integrity**
- ✓ Shopify UTM_campaign maps to Meta/Google campaigns
- ✓ UTM_term maps to Ad set names
- ✓ UTM_content maps to Ad names
- ✓ No orphaned UTM combinations

**Cross-Platform Consistency**
- ✓ Campaign names consistent between Meta and Shopify
- ✓ Date ranges overlap appropriately
- ✓ No duplicate campaign-day combinations within platform

**Attribution Logic Validation**
- ✓ Meta attribution: Day + Campaign + Ad Set + Ad
- ✓ Google attribution: Day + Campaign only
- ✓ No double counting of Shopify metrics
- ✓ Attribution sums ≤ original Shopify totals

### 7.4 Business Logic Validation
**Performance Metrics Sanity**
- ✓ Good lead criteria: Duration ≥60s AND Pageviews ≥5
- ✓ Good leads ≤ Total visitors
- ✓ Checkouts ≤ Good leads
- ✓ CPC calculations use correct denominators

**Statistical Validation**
- ✓ Global rates within reasonable bounds
- ✓ Empirical Bayes shrinkage applied correctly
- ✓ Volume thresholds met for confidence scoring
- ✓ Ad scores between 0-1

### 7.5 Output Validation
**Totals Reconciliation**
- ✓ Sum(Meta spend in unified) = Sum(original Meta spend)
- ✓ Sum(Google spend in unified) = Sum(original Google spend)
- ✓ Sum(attributed visitors) ≤ Sum(original Shopify visitors)
- ✓ Sum(attributed checkouts) ≤ Sum(original Shopify checkouts)

**Leaderboard Validation**
- ✓ All ads have valid scores (0-1 range)
- ✓ Recommendations match score thresholds
- ✓ Confidence levels align with volume criteria
- ✓ No missing critical fields

### 7.6 Quality Reporting
**Coverage Metrics**
- Attribution coverage: X% of Shopify traffic attributed
- Data completeness: X% of expected records present
- UTM mapping success: X% of Shopify sessions mapped
- Cross-platform consistency: X% campaigns matched

**Error Logging**
- Data quality issues found and resolved
- Rows excluded due to validation failures
- Attribution logic exceptions
- Performance metric outliers flagged

### 7.7 Implementation Checkpoints
**Validation Gates**
1. STOP if file integrity fails
2. STOP if >10% attribution mapping fails
3. STOP if spend totals don't reconcile
4. WARN if >5% outliers detected
5. WARN if attribution coverage <70%

**Confidence Scoring**
- HIGH: Clean data + >70% attribution coverage + consistent UTMs
- MEDIUM: Minor issues + 50-70% coverage + mostly consistent
- LOW: Data quality issues + <50% coverage + UTM problems

## Output Files

### Primary Outputs
1. **Unified Attribution Dataset**: `unified_meta_google_shopify_attributed.csv`
2. **Ad-Level Leaderboard**: `ad_level_leaderboard.csv`
3. **Sample Data Append**: `sample_data_appended_<datetime>.csv`
4. **Data Quality Report**: `data_quality_report_<datetime>.csv`

### Visualizations
- Spend vs Good Leads (Attributed), colored by recommendation
- Spend vs Visitors (Attributed)
- Daily Spend vs Daily Checkouts (macro health)

## Assumptions
- UTMs in Shopify consistently map to Meta campaigns/ad sets/ads
- Google attribution at campaign-day is acceptable for this period
- Low checkout volume expected; use shrunk checkout rates for decisioning

## Empirical Bayes Shrinkage

### Global Rate Calculation
Compute global rates across unified_attr:
- **global_good_lead_rate** = sum(good_lead_attributed) / sum(visitors_attributed)
- **global_checkout_rate** = sum(checkouts_attributed) / sum(visitors_attributed)

### Shrinkage Application
Use a small pseudo-count prior (e.g., 10 visitors) to create shrunk rates:
- **shrunk_good_lead_rate** = (good_lead_attributed + prior_visitors * global_good_lead_rate) / (visitors_attributed + prior_visitors)
- **shrunk_checkout_rate** = (checkouts_attributed + prior_visitors * global_checkout_rate) / (visitors_attributed + prior_visitors)
- **shrunk_cost_per_checkout** = spend / (visitors_attributed * shrunk_checkout_rate) where denominator > 0

## Ad-Level Aggregation for Decisioning

### Grouping Strategy
Group by: Source, Campaign name, Ad set name, Ad name; sum spend/visitors/good leads/checkouts and count days active.

### Aggregated Metrics
Recompute **shrunk_good_lead_rate_agg** and **shrunk_checkout_rate_agg** on aggregated totals using the same priors/global means.

Compute:
- **cpl_gl_shrunk** = spend_sum / (visitors_attributed * shrunk_good_lead_rate_agg) where denominator > 0
- **cp_checkout_shrunk** = spend_sum / (visitors_attributed * shrunk_checkout_rate_agg) where denominator > 0

## Validation Requirements

### Totals Integrity
- Sum of Meta and Google spend in unified_attr must equal their respective raw totals
- Daily Shopify visitors/checkouts should not be double counted: using attributed joins ensures no multiplication across ad rows

### Granularity Integrity
- Meta attribution is exact UTMs per Day; Google is campaign-day only

### Sanity Checks
- Number of rows with attributed visitors > 0 and checkouts > 0 should be plausible given Shopify totals
- Spot-check a few campaign-days to verify attribution aligns with UTMs

## Reporting Style

- Show head() of key tables and at least one visualization per major section
- Provide short confirmations after each major step (e.g., "Performance metrics computed")
- Include download links for generated files
- Keep commentary concise and practical

## Version History
Version 6.0 - Added comprehensive validation framework, detailed data inputs, empirical Bayes methodology, and systematic quality checks

## Last Updated
October 27, 2025