# Marketing Dataset Unification: Meta, Google & Shopify Integration

 ***Objective**: Build a unified marketing dataset across Meta, Google, and Shopify using the provided CSVs to create actionable insights and performance recommendations.

 ***Data Inputs** 

  *Meta Advertising Data* 

  - Files: Meta_Ads_day-month.csv … Meta_Ads_day-month.csv (daily data in individual file)
  - Columns:
    - Reporting starts
    - Campaign name
    - Ad set name
    - Ad name
    - Amount spent (INR)
    - CTR (link click-through rate)
    - CPM (cost per 1,000 impressions)

  *Google Advertising Data*

  - Files: Google_day-month.csv … Google_day-month.csv
  - Columns:
    - Day
    - Campaign
    - Cost

 *Shopify Analytics Data*

  - Files: Shopify_day-month.csv … Shopify_day-month.csv
  - Columns:
    - Hour or Day
    - Online store visitors
    - Sessions that completed checkout
    - Pageviews
    - Average session duration
    - UTM campaign
    - UTM term
    - UTM content


  ***Processing Steps***

  1. Load and Harmonize Data

  	1. Load all Meta, Google, and Shopify CSVs and harmonize columns
  	2. For Shopify, derive Day from Hour when present; ensure Campaign name, Ad set name, Ad name come from UTM campaign/term/content
  	3. Apply empirical Bayes shrinkage to stabilize low-volume rates
  	4. Produce a ranked ad-level leaderboard with recommendations, color coding, and confidence
  	5. Validate no double counting and consistent totals
  	6. Generate clean visualizations that reflect attributed metrics
  	7. Convert numeric columns with errors='coerce', fill appropriately only where safe

  2. Create Aggregated Attribution

  	Aggregate Shopify attributed metrics at:
  	- Meta attribution grain: Day, Campaign name, Ad set name, Ad name
  	- Google attribution grain: Day, Campaign name

  3. Build Evaluation Tables

  	- Meta_eval = Meta merged with Shopify attributed (Day+Campaign+Ad set+Ad). Fill missing attributed metrics with 0
  	- Google_eval = Google merged with Shopify campaign-day attributed (Day+Campaign). Fill missing attributed metrics with 0
  	- Add a Source column: Meta or Google

  4. Create Unified Attributed View

  	Stack Meta_eval and Google_eval to create unified_attr with shared columns:
  	- Day
  	- Campaign name
  	- Ad set name
  	- Ad name
  	- Amount spent (INR)
  	- visitors_attributed
  	- checkouts_attributed
  	- good_lead_attributed
  	- CTR
  	- CPM
  	- Source

  ***Key Definitions***

  *Good Lead Classification*

  - good_lead_flag: Average session duration >= 60 seconds AND Pageviews >= 5
  - good_lead_count = Online store visitors where good_lead_flag is true, else 0

  *Attribution Metrics*

  - visitors_attributed
  - checkouts_attributed
  - good_lead_attributed
  - pageviews_attributed (optional but helpful context)

  *Performance Metrics*

  Compute per-row metrics:
  - CPC = spend / visitors_attributed (if > 0)
  - cost_per_good_lead = spend / good_lead_attributed (if > 0)
  - cost_per_checkout = spend / checkouts_attributed (if > 0)
  - good_lead_rate = good_lead_attributed / visitors_attributed (if > 0)
  - checkout_rate = checkouts_attributed / visitors_attributed (if > 0)

  *Empirical Bayes Shrinkage*

  Global Rate Calculation

  Compute global rates across unified_attr:
  - global_good_lead_rate = sum(good_lead_attributed) / sum(visitors_attributed)
  - global_checkout_rate = sum(checkouts_attributed) / sum(visitors_attributed)

  Shrinkage Application

  Use a small pseudo-count prior (e.g., 10 visitors) to create shrunk rates:
  - shrunk_good_lead_rate = (good_lead_attributed + prior_visitors * global_good_lead_rate) / (visitors_attributed + prior_visitors)
  - shrunk_checkout_rate = (checkouts_attributed + prior_visitors * global_checkout_rate) / (visitors_attributed + prior_visitors)
  - shrunk_cost_per_checkout = spend / (visitors_attributed * shrunk_checkout_rate) where denominator > 0

  *Ad-Level Aggregation for Decisioning*

  Grouping Strategy

  Group by: Source, Campaign name, Ad set name, Ad name; sum spend/visitors/good leads/checkouts and count days active.

  Aggregated Metrics

  Recompute shrunk_good_lead_rate_agg and shrunk_checkout_rate_agg on aggregated totals using the same priors/global means.

  Compute:
  - cpl_gl_shrunk = spend_sum / (visitors_attributed * shrunk_good_lead_rate_agg) where denominator > 0
  - cp_checkout_shrunk = spend_sum / (visitors_attributed * shrunk_checkout_rate_agg) where denominator > 0

  Scoring, Color Coding & Recommendations

  Score Calculation

  Rank cpl_gl_shrunk ascending (lower is better) and shrunk_good_lead_rate_agg descending (higher is better). Normalize ranks to 0–1.

  Add a volume score capped at 1.0: min(visitors_attributed / 500, 1).

  ad_score = 0.4efficiency + 0.4quality + 0.2*volume

  Recommendation Mapping

  - Green (Scale): ad_score ≥0.90 = Scale aggressively
  - Light Green (Test-to-Scale): ad_score 0.80–0.90 = Cautious scale
  - Purple (Optimize): ad_score 0.70–0.80 = Optimize cost
  - Red (Pause/Fix): ad_score <0.70 = Pause or reduce

  Confidence Levels

  - High if visitors_attributed >= 100 and days_active >= 3
  - Medium if visitors_attributed >= 30
  - Low otherwise

  *Validation Requirements*

  Totals Integrity

  - Sum of Meta and Google spend in unified_attr must equal their respective raw totals
  - Daily Shopify visitors/checkouts should not be double counted: using attributed joins ensures no multiplication across ad rows

  Granularity Integrity

  - Meta attribution is exact UTMs per Day; Google is campaign-day only

  Sanity Checks

  - Number of rows with attributed visitors > 0 and checkouts > 0 should be plausible given Shopify totals
  - Spot-check a few campaign-days to verify attribution aligns with UTMs

  ***Output Files***

  Primary Outputs

  1. Unified Attribution Dataset
    - Filename: unified_meta_google_shopify_attributed.csv
    - Content: unified_attr with all per-row attributed columns and shrunk rates
  2. Ad-Level Leaderboard
    - Filename: ad_level_leaderboard.csv
    - Key Fields:
        - Source, Campaign, Ad Set, Ad, Spend, Visitors, Good Leads, Checkouts, Days Active
      - Good Lead Rate (Shrunk), Cost per Good Lead (Shrunk), Ad Score, Color, Recommendation, Confidence
  3. Sample Data Append
    - Filename: sample_data_appended_<date time>.csv
    - Key Fields:
        - 'Date', 'Meta Spend', 'Meta CTR', 'meta CPM', 'google Spend', 'google CTR', 'google CPM', 'Shopify Total Users', 'Shopify Total
  ATC', 'Shopify Total Reached Checkout ', 'Shopify Total Abandoned Checkout', 'Shopify Session Duration', 'Users with Session above 1 min',
   'Users with Above 5 page views and above 1 min', 'ATC with session duration above 1 min', 'Reached Checkout with session duration above 1
   min', 'General Queries', 'Open Queries ', 'Online Orders'
    - Action: Append new data to sample_data (daily campaign level metric)

  Visualizations

  Attributed metrics only (not daily totals duplicated across rows):
  - Spend vs Good Leads (Attributed), colored by recommendation
  - Spend vs Visitors (Attributed)
  - Optional: Daily Spend vs Daily Checkouts (for macro health)

  Reporting Style

  - Show head() of key tables and at least one visualization per major section
  - Provide short confirmations after each major step (e.g., "Performance metrics computed")
  - Include download links for generated files
  - Keep commentary concise and practical

  Assumptions

  - UTMs in Shopify consistently map to Meta campaigns/ad sets/ads
  - Google attribution at campaign-day is acceptable for this period
  - Low checkout volume is expected; use shrunk checkout rates for decisioning