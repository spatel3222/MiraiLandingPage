# Objective

Build a unified marketing dataset across Meta, Google, and Shopify for Oct 1–6 using the provided CSVs.

Attribute Shopify engagement at the correct granularity:
- **Meta**: Campaign name + Ad set name + Ad name + Day (exact UTM match).
- **Google**: Campaign + Day (campaign-day level).

Compute performance metrics using attributed visitors, good leads, and checkouts.

Apply empirical Bayes shrinkage to stabilize low-volume rates.

Produce a ranked ad-level leaderboard with recommendations, color coding, and confidence.

Validate no double counting and consistent totals.

Generate clean visualizations that reflect attributed metrics.

## Data inputs (present on disk)

- **Meta**: Meta_Ads_day-month.csv … Meta_Ads_day-month.csv
- **Google**: Google_day-month.csv … Google_day-month.csv
- **Shopify**: Shopify_day-month.csv … Shopify_day-month.csv
- **Unified prior**: unified_ads_shopify_date range_month.csv (for context/reference only)

**Assume:**

- Shopify has columns: Hour or Day; Online store visitors; Sessions that completed checkout; Pageviews; Average session duration; UTM campaign, UTM term, UTM content.
- Meta has: Reporting starts, Campaign name, Ad set name, Ad name, Amount spent (INR), CTR (link click-through rate), CPM (cost per 1,000 impressions).
- Google daily files have Day, Campaign, Cost.

## Steps

### Load and harmonize

Load all Meta, Google, and Shopify CSVs and harmonize columns.

For Shopify, derive Day from Hour when present; ensure Campaign name, Ad set name, Ad name come from UTM campaign/term/content.

Convert numeric columns with errors='coerce', fill appropriately only where safe.

### Define good lead and attribute Shopify

Define **good_lead_flag**: Average session duration >= 60 seconds AND Pageviews >= 5.

**good_lead_count** = Online store visitors where good_lead_flag is true, else 0.

Aggregate Shopify attributed metrics at:
- **Meta attribution grain**: Day, Campaign name, Ad set name, Ad name
- **Google attribution grain**: Day, Campaign name

For each aggregation, compute:
- visitors_attributed
- checkouts_attributed
- good_lead_attributed
- pageviews_attributed (optional but helpful context)

### Build Meta and Google evaluation tables

**Meta_eval** = Meta merged with Shopify attributed (Day+Campaign+Ad set+Ad). Fill missing attributed metrics with 0.

**Google_eval** = Google merged with Shopify campaign-day attributed (Day+Campaign). Fill missing attributed metrics with 0.

Add a Source column: Meta or Google.

### Unified attributed view and metrics

Stack Meta_eval and Google_eval to create **unified_attr** with shared columns:

Day, Campaign name, Ad set name, Ad name, Amount spent (INR), visitors_attributed, checkouts_attributed, good_lead_attributed, CTR, CPM, Source

Compute per-row metrics:
- **CPC** = spend / visitors_attributed (if > 0)
- **cost_per_good_lead** = spend / good_lead_attributed (if > 0)
- **cost_per_checkout** = spend / checkouts_attributed (if > 0)
- **good_lead_rate** = good_lead_attributed / visitors_attributed (if > 0)
- **checkout_rate** = checkouts_attributed / visitors_attributed (if > 0)

### Empirical Bayes shrinkage

Compute global rates across unified_attr:
- **global_good_lead_rate** = sum(good_lead_attributed) / sum(visitors_attributed)
- **global_checkout_rate** = sum(checkouts_attributed) / sum(visitors_attributed)

Use a small pseudo-count prior (e.g., 10 visitors) to create shrunk rates:
- **shrunk_good_lead_rate** = (good_lead_attributed + prior_visitors * global_good_lead_rate) / (visitors_attributed + prior_visitors)
- **shrunk_checkout_rate** = (checkouts_attributed + prior_visitors * global_checkout_rate) / (visitors_attributed + prior_visitors)
- **shrunk_cost_per_checkout** = spend / (visitors_attributed * shrunk_checkout_rate) where denominator > 0.

### Aggregate to ad-level for decisioning

Group by: Source, Campaign name, Ad set name, Ad name; sum spend/visitors/good leads/checkouts and count days active.

Recompute **shrunk_good_lead_rate_agg** and **shrunk_checkout_rate_agg** on aggregated totals using the same priors/global means.

Compute:
- **cpl_gl_shrunk** = spend_sum / (visitors_attributed * shrunk_good_lead_rate_agg) where denominator > 0
- **cp_checkout_shrunk** = spend_sum / (visitors_attributed * shrunk_checkout_rate_agg) where denominator > 0

### Scoring, color coding, confidence, and recommendations

**Scores:**

Rank cpl_gl_shrunk ascending (lower is better) and shrunk_good_lead_rate_agg descending (higher is better). Normalize ranks to 0–1.

Add a volume score capped at 1.0: min(visitors_attributed / 500, 1).

**ad_score** = 0.4*efficiency + 0.4*quality + 0.2*volume.

**Color coding by medians:**
- **Green**: ad_score >= median(ad_score) and cpl_gl_shrunk <= median(cpl_gl_shrunk)
- **Light Green**: ad_score < median(ad_score) and cpl_gl_shrunk <= median(cpl_gl_shrunk)
- **Purple**: ad_score >= median(ad_score) and cpl_gl_shrunk > median(cpl_gl_shrunk)
- **Red**: else

**Confidence:**
- **High** if visitors_attributed >= 100 and days_active >= 3
- **Medium** if visitors_attributed >= 30
- **Low** otherwise

**Recommendation mapping:**
- **Green**: Scale aggressively
- **Light Green**: Cautious scale
- **Purple**: Optimize cost
- **Red**: Pause or reduce

## Validation requirements

### Totals integrity:

Sum of Meta and Google spend in unified_attr must equal their respective raw totals.

Daily Shopify visitors/checkouts should not be double counted: using attributed joins ensures no multiplication across ad rows.

### Granularity integrity:

Meta attribution is exact UTMs per Day; Google is campaign-day only.

### Sanity checks:

Number of rows with attributed visitors > 0 and checkouts > 0 should be plausible given Shopify totals.

Spot-check a few campaign-days to verify attribution aligns with UTMs.

## Outputs and files

Save **unified_attr** with all per-row attributed columns and shrunk rates: `unified_meta_google_shopify_attributed.csv`

Save **ad-level leaderboard** with key fields:
- Source, Campaign, Ad Set, Ad, Spend, Visitors, Good Leads, Checkouts, Days Active
- Good Lead Rate (Shrunk), Cost per Good Lead (Shrunk), Ad Score, Color, Recommendation, Confidence
- Filename: `ad_level_leaderboard.csv`

**Visualizations** (attributed, not daily totals duplicated across rows):
- Spend vs Good Leads (Attributed), colored by recommendation
- Spend vs Visitors (Attributed)
- Optional: Daily Spend vs Daily Checkouts (for macro health)

## Reporting style

Show head() of key tables and at least one visualization per major section.

Provide short confirmations after each major step (e.g., "Performance metrics computed").

Include download links for generated files.

Keep commentary concise and practical.

## Assumptions

UTMs in Shopify consistently map to Meta campaigns/ad sets/ads.

Google attribution at campaign-day is acceptable for this period.

Low checkout volume is expected; use shrunk checkout rates for decisioning.