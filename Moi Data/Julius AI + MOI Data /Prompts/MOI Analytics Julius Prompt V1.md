# MOI Marketing Analysis

## Input Files will include:
 1. Meta_Ads_<date>.csv with columns at least: Campaign name, Ad set name, Ad name, Day (or Reporting starts), Amount spent (INR), CPM, CTR
 2. Google_Ads_<date>.csv (exported campaign-level) with Day, Campaign, Cost, plus any date if available
 3. Shopify_<date>.csv with   Hours yyyy-mm-dd x:xx:xx or Day, UTM campaign (Campaign name), UTM term (Ad set name), UTM Content (Ad name) , Online store visitors, Sessions that completed checkout, Pageviews, Average session duration. 
    
 ## Task:
    Load all attached Meta, Google, and Shopify CSVs for the given window. Auto-harmonize headers:

- For Meta files missing Day, derive Day from Reporting starts (daily granularity). 
 For Google campaign reports with banner rows or Unnamed columns, detect the header row and clean it; keep Campaign and Cost; if no date per row, assume the file’s date for Day.
- Shopify: rename UTM campaign to Campaign name and UTM term to Ad set name; keep Day or Hours needs to be converted into days, Online store visitors, Sessions that completed checkout, Pageviews, Average session duration. Some Shopify files will have Day column and other will hHours which you need to convert to Day 

### Build unified daily dataset:
    Join Meta spend to Shopify engagement on Campaign name + Ad set name + Ad name +  Day (left join from Meta).
    For Google, join by Campaign name + Day only (no ad set).

### Safer pattern during unification:
- visitors_daily = shopify.groupby('Day')['Online store visitors'].sum()
- unified = meta.merge(google, ..., how='outer') then merge visitors_daily on Day
- For any reporting by Day, use visitors_daily directly.

### Create metrics:
        visitors: Online store visitors (or sum if multiple rows)
        good_lead: count of sessions with Average session duration >= 60 seconds AND Pageviews >= 5 (aggregate per Campaign/Ad set/Day)
        CPC_like = Amount spent (INR) / visitors
        CPCheckout = Amount spent (INR) / Sessions that completed checkout, when > 0
        cost_per_good_lead = Amount spent (INR) / good_lead, when > 0
        good_lead_rate = good_lead / visitors
   

### Color code per Campaign/Ad set/Day:
        Green: good_lead above median AND cost_per_good_lead below median
        Light Green: cost_per_good_lead below median but good_lead below median
        Purple: good_lead above median but cost_per_good_lead above median
        Red: everything else
    
### Recommendation and confidence:
        Green: Increase investment (High)
        Light Green: Cautious scale (Medium)
        Purple: Optimize cost; keep running (Medium)
        Red: Reduce investment or pause (Low)

### Relationship labeling (explicit):
    For each Campaign + Ad set, fit simple models on daily points:
    visitors vs spend and checkouts vs spend
    Compare: linear y ~ x vs exponential by fitting log1p(y) ~ x
    Rules per target (visitors and checkouts separately):
    negative if linear slope < 0 and R²_linear ≥ 0.3
    exponential if R²_exp > R²_linear with R²_exp ≥ 0.3 and slope ≥ 0
    linear if slope ≥ 0 and R²_linear ≥ 0.3
    else unclear or insufficient_data
    Append relationship_label_visitors and relationship_label_checkouts to the unified dataset.

## Validate unified sheet:
After you unify data, check the unified data output for metrics such as meta spend and google spend for input and output to make sure they add up. For example if Meta Spend in input files add up to 1000 then make sure the unified sheet has 1000 in meta spend. Also validate total visitors from Shopify individual files to unified file before proceeding. Iterate until the data is validated. If there are some data mapping questions then please ask.


###DATA UNIFICATION & VALIDATION FRAMEWORK

- STEP 1: PRE-MERGE VALIDATION
----------------------------
1. Load all source files and compute baseline totals:
   - Total spend by source (Meta, Google, etc.)
   - Total visitors from Shopify (by day)
   - Total checkouts from Shopify (by day)
   - Total sessions/interactions

2. Document baseline metrics:
   - Print and save all input totals
   - Count unique days in each source
   - Identify date ranges and gaps

- STEP 2: MERGE STRATEGY
   -----------------------
3. Define merge logic BEFORE executing:
   - Primary key: Day (date)
   - Shopify metrics: Aggregate ONCE by day, then LEFT JOIN
   - Ad data: Can have multiple rows per day (campaigns/ad sets)
   - NEVER sum Shopify metrics across ad rows

4. Implement merge:
   - Step A: Aggregate Shopify by day → shopify_daily
   - Step B: Merge/concat ad sources → ads_unified  
   - Step C: LEFT JOIN ads_unified with shopify_daily on Day
   - Step D: For reporting, use shopify_daily for visitor totals

STEP 3: POST-MERGE VALIDATION (AUTO-RETRY)
-------------------------------------------
5. Validate output totals (retry up to 5 times if fails):
   
   CHECK 1: Spend validation
   - Input total spend = Output total spend (tolerance: 0.01%)
   
   CHECK 2: Visitor validation  
   - Input Shopify visitors = Output unique daily visitors sum (tolerance: 0%)
   
   CHECK 3: Checkout validation
   - Input Shopify checkouts = Output checkouts (tolerance: 0%)
   
   CHECK 4: Row count sanity
   - Output rows should = ad campaign rows (not multiplied by days)
   
   CHECK 5: No duplication
   - Group by Day and check visitor sum vs shopify_daily
   - Should match exactly

6. If validation FAILS:
   - Retry with adjusted merge logic
   - Log what failed and why
   - Attempt fix (max 5 retries)
   - If still failing after 5 attempts → ASK USER

7. If validation PASSES:
   - Print validation report
   - Save validated dataset
   - Proceed to analysis

STEP 4: ANALYSIS & REPORTING
-----------------------------
8. Use validated data only
9. For daily aggregations, reference shopify_daily directly
10. Document any assumptions or data limitations


## Outputs to produce:
1. Show head of the unified table with key columns:
 2. Day, Campaign name, Ad set name, Ad Name, Amount spent (INR), visitors, CTR (from meta reports), good_lead, checkouts, CPC_like, CPCheckout, cost_per_good_lead, good_lead_rate, color_code, recommendation, confidence, relationship_label_visitors, relationship_label_checkouts

### Plot:
    1. Scatter: Amount spent (INR) vs good_lead colored by color_code (filter out zero good_lead)
    2. Scatter: Amount spent (INR) vs visitors
    3. Scatter: Amount spent (INR) vs checkouts
  
### Google sheet two CSVs:
    unified_meta_google_shopify.csv (full dataset with metrics and color codes)
    unified_with_relationships.csv (same plus relationship labels)
    Brief 5–7 line summary with top recommendations:
    Which color to scale, what to pause, and any notable relationship patterns.
 

## Deliverables:
    1. Data validation summary, 2 sentence, why the generated output does not have double counting, or under counting and input and output metrics add up. 
    2. Display the head of the unified table and the plots.
    3. Provide google sheet  links for the two saved CSVs.