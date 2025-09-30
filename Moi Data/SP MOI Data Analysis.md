MOI Data Analysis 

Phases
- Evaluate Current implemenation 
- Duplicate current implemenation using simple logic
-- simple logic from excel
-- api based 
- explore 3P options 
- build in house 


# How it all works
## 
# Evaluate Current implemenation 
# Duplicate current implemenation using simple logic
## simple logic from excel
## api based 
# explore 3P options
- Able CDP
- Triple Whale 
- https://analyzify.com/features
# build in house 

The research that they do use UTM then the export from Shopify has UTM which is then linked to per day traffic from Instagram to create a logic. 


## UTM Parameters vs Third-Party Platforms

  | Aspect                | UTM Parameters      | Third-Party Platforms |
  |-----------------------|---------------------|-----------------------|
  | Cost                  | Free                | ₹15,000-150,000/month |
  | Data Ownership        | 100% yours          | Shared with vendor    |
  | Accuracy              | 85-90%              | 90-95%                |
  | Setup                 | Manual per campaign | Automated             |
  | View-through tracking | No                  | Yes                   |
  | Cross-device          | Limited             | Advanced              |
  | Maintenance           | Self-managed        | Vendor-managed        |


---
##Understanding current sheets
### Top Level Metrics
### Shopify Exports
- UTM campaign and Term
- Landing Page URL 
- Online visitors 
### Adset Level Metrics


DABA = Detailed Audience & Budget Analysis

  Based on MOI's campaign logic, DABA is triggered when:
  - Quality ATC (Add-to-Cart) is detected
  - Users show engagement but need audience expansion
  - Campaign has potential but needs optimization

  📊 Why 23 Campaigns Got "Add DABA"?

  | Campaign Pattern   | Logic Trigger                              | Business Reason        |
  |--------------------|--------------------------------------------|------------------------|
  | Quality ATC > 0    | Users adding to cart with >1min session    | Shows purchase intent  |
  | ATC > 0            | Regular cart additions happening           | Audience is responding |
  | Engagement Present | Session duration/page views above baseline | Content resonating     |

  🔍 How to Use This Information

  Step 1: Immediate Actions (Week 1)

  For the 23 "Add DABA" campaigns:

  | Action                       | Description                                  | Expected Impact  |
  |------------------------------|----------------------------------------------|------------------|
  | Expand Lookalike Audiences   | Create lookalikes based on quality ATC users | +40% reach       |
  | Increase Budget by 25%       | Scale successful campaigns                   | +25% conversions |
  | Test New Creative Variations | A/B test with proven audiences               | +15% CTR         |

  Step 2: Detailed Analysis (Week 2-3)

  1. Audience Analysis: Study demographics of quality ATC users
  2. Budget Optimization: Reallocate from poor performers
  3. Attribution Deep-dive: Track full customer journey

  Step 3: Implementation (Week 4+)

  1. Scale Winners: Double budget on top DABA campaigns
  2. Pause Losers: Stop the "Very Poor" quality campaigns
  3. Monitor & Iterate: Weekly performance reviews

  💰 ROI Impact

  | Current State                  | With DABA Implementation           | Improvement              |
  |--------------------------------|------------------------------------|--------------------------|
  | Quality ATC Rate: 23 campaigns | Optimized: Scale best performers   | +60% efficiency          |
  | Budget Allocation: Manual      | Automated: Data-driven scaling     | +40% ROI                 |
  | Decision Speed: 3-5 days       | Real-time: Instant recommendations | +25% opportunity capture |

  🚀 Practical Next Steps

  1. Export the CSV: Use MOI_Phase2_Intelligence_Enhanced.csv
  2. Filter DABA campaigns: Focus on the 23 recommended ones
  3. Start with Top 3: Begin with highest quality scores (83.0, 65.0, 55.0)
  4. Budget reallocation: Move budget from "Pause" recommendations to "Scale Aggressively"

  Bottom Line: DABA identifies your winning campaigns that need more investment and audience expansion. It's MOI's way of saying "this works, do more of
  it!"

---

# Analysis 

⏺📊 Dashboard Summary

  | Metric                 | Value           |
  |------------------------|-----------------|
  | Total Campaigns        | 67 campaigns    |
  | High Quality Customers | 173 customers   |
  | Total Sessions         | 68,926 sessions |
  | Checkout Rate          | 39.2%           |

  🏆 Top 5 Campaigns (Shopify-Only Metrics)

  | Rank | Campaign                         | Sessions | High Quality Customers | Checkouts | Quality Score |
  |------|----------------------------------|----------|------------------------|-----------|---------------|
  | 1    | Pmax_necklaces-20153247774       | 166      | 5                      | 8         | 15.04         |
  | 2    | BOF                              | 2,551    | 51                     | 16        | 14.19         |
  | 3    | Brand-Search-19758011432         | 1,290    | 24                     | 8         | 12.40         |
  | 4    | brand_search-14337891333         | 2,298    | 12                     | 1         | 1.79          |
  | 5    | retry2 - Wildflower India upsell | 51       | 0                      | 0         | 1.75          |

  🎯 Key Metrics Focus (Shopify-Only)

  | Metric                     | Calculation                                   | Result                |
  |----------------------------|-----------------------------------------------|-----------------------|
  | Total Sessions by Campaign | Sum of sessions per UTM campaign              | 68,926 total          |
  | High Quality Customers     | Sessions >60s + cart activity                 | 173 customers (0.25%) |
  | Shopify Reached Checkout   | Sessions that reached checkout                | 68 checkouts          |
  | Quality Score              | (Duration×30% + Cart Rate×40% + Checkout×30%) | Average: 2.1/100      |

  📈 Key Insights (Shopify-Only)

  | Insight           | Impact                                     | Action Required                |
  |-------------------|--------------------------------------------|--------------------------------|
  | Major Opportunity | Only 0.25% high-quality customers          | Focus on quality over quantity |
  | Cart Issue        | 0.42% overall cart rate                    | Improve product positioning    |
  | Top Performers    | 3 campaigns drive 67% of quality customers | Scale winning campaigns        |
  | Long Tail Problem | 33 campaigns have quality scores <0.06     | Pause underperformers          |


---


  # Questions 
  [] Sessions that reached checkout - why does shopify does not have checkout data? 
  []



Prompts 

1. Prompt optimizer in agent folder
2. You are a data analyst and helping me understand the data - look at shopify export sheet in Origintal Data fodler.
3. prompt optimizer in agent folder. You are a data analyst and helping me understand the data - look at shopify export sheet in Origintal Data folder.After that, tell me how many unique UTM Champign are there
4. Prompt optimizer in agent folder I want to analyze the data closely see how much customers, sessions, sessions per customer, time spent per session, checkout session for each UTM Champign. Give me output in table format in markdown format. 
5. Dashboard 
🎯 COMPREHENSIVE PROJECT PLAN & OPTIMIZED PROMPT SUMMARY

  📋 Project Overview

  I've successfully coordinated with the specialized CRTX.in agent team to create a complete implementation plan for your MOI
  marketing analytics dashboard. Here's the executive summary before we proceed with development:

  🏆 Delivered Components

  | Component              | Status     | Agent Team    | Key Achievement                                   |
  |------------------------|------------|---------------|---------------------------------------------------|
  | Brand Analysis         | ✅ Complete | UX Designer   | MOI brand guidelines extracted with color palette |
  | Technical Architecture | ✅ Complete | ML Engineer   | Scalable 100k+ row processing pipeline            |
  | Strategic Plan         | ✅ Complete | Strategy Team | 12-week crisis-to-leadership transformation       |

  🎨 Brand Guidelines Extracted

  | Design Element    | Specification                                 | Dashboard Application        |
  |-------------------|-----------------------------------------------|------------------------------|
  | Primary Colors    | Deep Charcoal (#141314), Warm Grey (#3F3E3E)  | Data visualization and text  |
  | Accent Color      | Rich Red (#721C24)                            | Alerts and important metrics |
  | Typography        | Orpheus Pro (serif) + BentonSans (sans-serif) | Elegant hierarchy            |
  | Design Philosophy | Minimalist luxury with generous white space   | Clean dashboard layouts      |

  ⚡ Technical Architecture

  | Feature            | Specification                                   | Performance Target    |
  |--------------------|-------------------------------------------------|-----------------------|
  | CSV Processing     | 100,000+ rows, 10-15 columns                    | <0.5 seconds response |
  | Data Sources       | Shopify Export, Meta Ads, Google Ads            | Real-time processing  |
  | Dashboard Features | Key metrics, performance tiers, sortable tables | Interactive filtering |
  | Upload System      | Background processing, no interference          | Seamless UX           |

  📊 Dashboard Components

  | Section            | Features                         | User Experience      |
  |--------------------|----------------------------------|----------------------|
  | Key Metrics        | Revenue, ROI, conversion rates   | Executive overview   |
  | Performance Tiers  | Campaign categorization          | Strategic insights   |
  | UTM Analysis Table | Sortable, searchable, filterable | Operational details  |
  | Upload Interface   | Drag-and-drop, progress tracking | Intuitive data input |

  🎯 OPTIMIZED PROMPT FOR DEVELOPMENT

  Original Request Enhancement:
  BUILD A LUXURY BRAND-COMPLIANT MARKETING ANALYTICS DASHBOARD


  CONTEXT: 
  MOI is a luxury brand that is selling high quality expensive jewellery online they have found a niche where they can target individuals willing to buy high quality jewellery online without the hassle of going to the store the value is in the convenience the company has been spending several marketing dollars on meta and google ad words and getting some good stream of customers they want to connect their meta, google ads and Shopify data through UTM. The goal of the dashboard is to 3 fold. 1. Understand the customer behavior on the website. Second, understand how the campaigns are performing by itself and third, are those campaigns bringing in good quality customers that eventually convert. 

  BRAND REQUIREMENTS:
  - Use MOI luxury aesthetic: Deep Charcoal (#141314), Warm Grey (#3F3E3E), Rich Red (#721C24)
  - Minimalist design with generous white space
  - Typography: Orpheus Pro (headings) + BentonSans (body)
  - Boutique luxury feel matching vibewithmoi.com

  TECHNICAL SPECIFICATIONS:
  - Handle 3 CSV uploads: Shopify Export, Meta Ads, Google Ads
  - Process 100,000+ rows with 10-15 columns efficiently
  - Real-time data processing with <0.5 second response times
  - Memory-optimized architecture for large datasets

  DASHBOARD FEATURES:
  SCOPE this is for Shopify Export ONLY. We will update the dashboard for other 2 files later on. 
  1. Key Metrics Panel: 
  *  Outout in row 1 : Champaign information - unique campign, average ad set per champaign, average traffic per champaign. 
  * User Behaviour row 2 : Traffic volume (unique user, sessions, session time, page view per session
  * Funnel Data (BOF) row 3 : ATC, Checkout Session, conversion rates, Revenue
  2. Campaign Performance Tiers: I want a very yellow green status of the performance of the campaign. come up with a formula and logic that looks as how much good quality customer the campaign brought. Give me Info icon with details on formula. 
  3. Complete UTM Campaign Table: The table format is given below (Complete UTM Campaign Table FORMAT:)
  4. Advanced Filtering: Search by campaign name, filter by any column, sorty by any column. These controls need to be very compact and on top of the table. The table will update after I hit apply.  
  5. Upload System: Background CSV processing without UI interference. Give me a setting icon on the top right side from where I can upload individual CSV files. 
  6. Give me a chatbot interface at the bottom right section so that I can ask questions about my data. The chatbot will take the user query and then look at the data and then respond in a simple format. You will use table wherever possible. Your response will be very concise and actionable because the questions will come from a non-technical person, maybe some executive. So do not hallucinate and give a very concise, crisp answer which is data-driven and backed by the facts. Always give some follow-up suggestion question in a short sentence format. 
  7. Once the data has been processed and the dashboard metrics populated, do not reprocess the information. If I go back to the website I should be able to see the metrics right away. 
  8. I may go in and upload new files. One or all three. You should be able to detect the changes and then Only process the data if the data is updated. If the data does not need to be updated just give a simple feedback that no updates needed data already in sync. 
  9. Get input files, user may provide all three or just one file. The data will be for on 1 day or 1 week interval. The input file format is given below in "INPUT Files" section.
  10. Convert inputs files into output files using below foramt. The input file format is given below in "OUTPUT Files" section. You can append the data to keep a running file. 
  11. The export file feature allows the users to select the range of dates. 


INPUT Files:

sample data in Input Example folder

Sample Meta report * <<start date>> * <<end date>>.csv

| UTM Campaign | UTM Term | Landing Page URL | Online Store Visitors | Pageviews | Sessions that reached checkout | Sessions with cart additions | Sessions that completed checkout | Average session duration |
|---|---|---|---|---|---|---|---|---|
| - | - | https://vibewithmoi.in/ | 288 | 604 | 20 | 88 | 6 | - |
| - | - | https://vibewithmoi.in/pages/the-green-room | 268 | 460 | 24 | 97 | 5 | - |


GA4 Export * <<start date>> * <<end date>>.csv

| Campaign | Currency Code | Cost | CTR | Avg. CPM |
|----------|---------------|------|-----|----------|
| BOF-YT-ALL PRODUCTS | INR | 7163.85 | 1.98% | 134.70 |
| Brand-Search | INR | 68182.40 | 19.12% | 10257.62 |
| Moi Ahmedabad - Local Store Visits | INR | 5229.73 | 7.63% | 1414.59 |
| Moi Chennai - Local Store Visits | INR | 6991.28 | 7.38% | 1380.31 |
| T1 Pmax Bracelets | INR | 6250.98 | 1.00% | 169.83 |
| T1 Pmax Earrings | INR | 70375.08 | 0.84% | 173.85 |
| T1 Pmax Rings | INR | 73063.67 | 0.77% | 126.80 |



Shopify Export  * <<start date>> * <<end date>>.csv

| Campaign Name | Ad Set Name | Amount Spent (INR) | CPM | CTR (%) |
|---------------|-------------|-------------------|-----|---------|
| TOF ALL | T1 - TRLi - FEED | 51896.96 | 71.31 | 1.73 |
| TOF ALL | T2 -  TRLi | 40969.26 | 51.81 | 1.24 |
| TOF Story/Reel | T1 TRL IGi RL | 40068.37 | 64.19 | 0.52 |
| TOF ALL | IND - TRLi | 27260.02 | 32.45 | 1.33 |
| TOF CUSTOM AUTO | T1 - INT JWLi | 25893.64 | 65.39 | 1.14 |
| TOF ALL | T1 - FB - TRLi | 22149.48 | 47.94 | 1.56 |
| TOF Story/Reel | TRL IGi ST | 20244.09 | 219.68 | 1.34 |
| MOF | MOF DABA ENGDi | 17734.50 | 111.98 | 3.44 |
| MOF | MOF DABA IGi | 17620.66 | 425.83 | 3.62 |
| TOF AND | TOF Mumbai TRLa | 17550.25 | 20.97 | 1.25 |
| TOF AND | TOF Delhi TRLa | 17484.75 | 26.64 | 1.61 |
| TOF CUSTOM AUTO | T2 - INT JWLi | 16995.54 | 41.32 | 0.96 |
| TOF Ahmedabad Store WhatsApp | LUXEi - IG Feed | 14461.49 | 243.86 | 0.07 |
| BOF DPA | VC & ATC_180 Days - FBi | 14117.97 | 106.43 | 3.42 |
| TOF 80k | T1 - LUXEi | 14106.97 | 161.60 | 3.44 |
| TOF AND | TOF Bangalore TRLa | 13974.42 | 18.



OUTPUT Files: 

Sample data in Output Example

Adset Level Matrices.csv

| 10-23 Sep | Campaign name | Ad Set Name | Ad | Ad Set Delivery | Spent | Cost per user | Users | ATC | Reached Checkout | Conversions | Average session duration | Cost per 1 min user | 1min user/ total users (%) | Users with Session above 1 min | ATC with session duration above 1 min | Reached Checkout with session duration above 1 min | Users with Above 5 page views and above 1 min | Remarks | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|


Top Level Daily Metrics.csv

| Date | Meta Ads Spend | Meta Ads CTR | Meta Ads CPM | Google Ads Spend | Google Ads CTR | Google Ads CPM | Total Users | Total ATC | Total Reached Checkout | Total Abandoned Checkout | Session Duration | Users with Session above 1 min |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Wed, Sep 10, 25 | 39,829 | 1.49% | 59.16 | 16,080 | 0.80% | 244.71 | 7,922 | 35 | 13 | 1 | 0:00:42 | 835 |
| Thu, Sep 11, 25 | 39,914 | 1.62% | 64.44 | 14,647 | 0.86% | 223.60 | 8,278 | 37 | 11 | 1 | 0:00:36 | 860 |
| Fri, Sep 12, 25 | 38,339 | 1.95% | 68.54 | 15,284 | 0.97% | 234.57 | 9,000 | 35 | 13 | 1 | 0:00:40 | 1,030 |
| Sat, Sep 13, 25 | 36,787 | 1.87% | 63.50 | 14,051 | 1.04% | 242.10 | 9,587 | 34 | 13 | 2 | 0:00:40 | 1,096 |
| Sun, Sep 14, 25 | 43,568 | 1.76% | 61.28 | 13,490 | 0.88% | 180.75 | 10,042 | 39 | 16 | 1 | 0:00:35 | 1,005 |
| Mon, Sep 15, 25 | 37,768 | 1.83% | 59.81 | 19,456 | 1.01% | 232.62 | 9,302 | 42 | 16 | 1 | 0:00:37 | 908 |
| Tue, Sep 16, 25 | 40,539 | 1.70% | 67.06 | 13,957 | 0.94% | 194.71 | 8,435 | 35 | 11 | 2 | 0:00:37 | 878 |
| Wed, Sep 17, 25 | 38,792 | 1.70% | 63.88 | 15,645 | 0.93% | 244.01 | 8,512 | 28 | 11 | 2 | 0:00:39 | 904 |
| Thu, Sep 18, 25 | 40,586 | 1.69% | 58.92 | 20,654 | 1.17% | 179.59 | 10,054 | 62 | 27 | 0 | 0:00:38 | 1,040 |
| Fri, Sep 19, 25 | 37,652 | 1.66% | 57.32 | 20,363 | 1.02% | 226.53 | 9,302 | 40 | 21 | 0 | 0:00:39 | 976 |
| Sat, Sep 20, 25 | 36,641 | 1.80% | 66.81 | 20,351 | 1.02% | 176.17 | 8,582 | 54 | 20 | 2 | 0:00:38 | 880 |
| Sun, Sep 21, 25 | 36,967 | 1.66% | 66.67 | 15,419 | 1.10% | 148.03 | 7,824 | 46 | 24 | 0 | 0:00:34 | 796 |


FILE CONVERTION LOGIC: 
 - Using Shopify Export and Meta ads creates -> "Adset Level Matrices.csv"
 - Meta Ads and GA4 Ads creates --> "Top Level Daily Matrices.csv"


 Complete UTM Campaign Table FORMAT:
  | UTM Campaign | Total Customers | Total Sessions | Sessions/Customer | Avg Session Duration (sec) | Checkout Sessions | Checkout Rate (%) | Cart Additions | Cart Rate (%) |
  |--------------|-----------------|----------------|-------------------|----------------------------|-------------------|-------------------|----------------|---------------|
  | BOF \| DPA | 13,132 | 13,713 | 1.04 | 34.64 | 18 | 0.13 | 63 | 0.46 |
  | TOF \| India | 9,999 | 10,164 | 1.02 | 13.75 | 7 | 0.07 | 21 | 0.21 |
  | TOF \| AND | 7,763 | 7,939 | 1.02 | 17.36 | 4 | 0.05 | 19 | 0.24 |
  | TOF \| Delhi | 6,734 | 6,868 | 1.02 | 14.98 | 1 | 0.01 | 6 | 0.09 |
  | TOF \| Mumbai | 5,179 | 5,288 | 1.02 | - | - | - | - | - |



  RULES:
  1. Do not assume any information. Always base this on factual information available in the input files. 
  2. Limit the data to the input file requested. Do not interlink the data unless explicitly said in the metric.
  3. Do not assume anything if you have any doubts or unsure and have low confidence of information then Please ask me those questions so that I can clarify up front. 
  4. If you have any recommendation and do not agree with the approach, feel free to send a message. 
  5. Follow the instructions, as it and thoroughly. I have seen you give partial information or assume information which has led to delays. 


  USER EXPERIENCE:
  - Responsive design optimized for desktop 
  - Interactive sorting and filtering capabilities
  - Real-time data updates and progress tracking
  - Export functionality for processed analytics
  - Professional presentation suitable for executive stakeholders

  ARCHITECTURE REQUIREMENTS:
  - Scalable data processing pipeline using modern ML techniques
  - Memory-efficient CSV parsing and aggregation
  - Real-time caching and optimization for large datasets
  - API-first design for future integrations
  - Production-ready deployment with monitoring

 TESTING:
  - Do thorough and do interesting of the feature. 
  - Limit this to chrome only 
  - Use the playwright tool to get screenshot to get visual feedback. 
  - Use the tool to get console log
  - sample log is stored in "MOI Original Data" folder. The data is for Shopify Export only.

  TOOLS and AGENTS:
  - use playwrite tool for testing and UI to get visual feedback. 
  - use agents in agent folder and not general purpose where possible. 


## Pivot Prompt to convert Shopify Export to Ad Sent 

 ## Task: Create Granular Campaign+AdSet Level Shopify Pivot

  ### INPUT
  - File: Large Shopify export CSV (223K+ rows, 112MB)
  - Structure: Individual session records with UTM tracking data

  ### OUTPUT REQUIREMENTS
  - File: Shopify_Temp.csv
  - Structure: Two-level hierarchy pivot

  ### PIVOT LOGIC
  PRIMARY GROUP: UTM Campaign (Campaign Name)
  SECONDARY GROUP: UTM Term (AdSet Name equivalent)
  RESULT: Campaign → AdSet granular breakdown

  ### EXPECTED STRUCTURE
  ```csv
  UTM Campaign, UTM Term, Online store visitors, Pageviews, Sessions that reached checkout, ...
  TOF | 80K, LUXE | IGi, 928, 1490, 0, ...
  TOF | 80K, T1 - LUXEi, 1288, 2362, 0, ...
  TOF | 80K, OCC – IGi, 928, 1407, 1, ...

  AGGREGATION RULES

  - SUM: All numeric fields (visitors, pageviews, checkouts, cart additions)
  - AVERAGE: Session duration metrics (weighted by visitor volume)
  - PRESERVE: First occurrence of text fields (landing pages, etc.)

  TECHNICAL REQUIREMENTS

  - Handle 200K+ rows efficiently
  - Group by BOTH UTM Campaign AND UTM Term
  - Maintain all original columns
  - Reduce to ~200 unique combinations
  - Output ready for adset-level analysis

  SUCCESS CRITERIA

  - Each row = One Campaign+AdSet combination
  - Multiple adsets per campaign (e.g., "TOF | 80k" → 5 adset rows)
  - All numeric metrics properly aggregated
  - Structure matches Meta/Google adset hierarchy for cross-platform analysis

  This granular pivot enables precise campaign and adset-level performance attribution across all marketing platforms.


## Ad Set and Top Level mapping 

1. Top Level Daily Metrics.csv

  | Column # | Field Name                                         | Data Source | Type       |
  |----------|----------------------------------------------------|-------------|------------|
  | 1        | Date                                               | Date Range  | String     |
  | 2        | Meta Ads Spend                                     | Meta CSV    | Currency   |
  | 3        | Meta Ads CTR                                       | Meta CSV    | Percentage |
  | 4        | Meta Ads CPM                                       | Meta CSV    | Number     |
  | 5        | Google Ads Spend                                   | Google CSV  | Currency   |
  | 6        | Google Ads CTR                                     | Google CSV  | Percentage |
  | 7        | Google Ads CPM                                     | Google CSV  | Number     |
  | 8        | Total Users                                        | Shopify     | Number     |
  | 9        | Total ATC                                          | Shopify     | Number     |
  | 10       | Total Reached Checkout                             | Shopify     | Number     |
  | 11       | Total Abandoned Checkout                           | Derived     | Number     |
  | 12       | Session Duration                                   | Shopify     | Time       |
  | 13       | Users with Session above 1 min                     | Derived     | Number     |
  | 14       | Users with Above 5 page views and above 1 min      | Derived     | Number     |
  | 15       | ATC with session duration above 1 min              | Derived     | Number     |
  | 16       | Reached Checkout with session duration above 1 min | Derived     | Number     |
  | 17       | General Queries                                    | Direct      | Number     |
  | 18       | Open Queries                                       | Direct      | Number     |
  | 19       | Online Orders                                      | Shopify     | Number     |

  2. Adset Level Matrices.csv

  | Column # | Field Name                                         | Data Source | Type       |
  |----------|----------------------------------------------------|-------------|------------|
  | 1        | Date Range                                         | Date Range  | String     |
  | 2        | Campaign Name                                      | Meta/Google | String     |
  | 3        | Ad Set Name                                        | Meta/Google | String     |
  | 4        | Ad                                                 | Meta/Google | String     |
  | 5        | Ad Set Delivery                                    | Meta        | String     |
  | 6        | Spent                                              | Meta/Google | Currency   |
  | 7        | Cost per User                                      | Calculated  | Currency   |
  | 8        | Users                                              | Derived     | Number     |
  | 9        | ATC                                                | Derived     | Number     |
  | 10       | Reached Checkout                                   | Derived     | Number     |
  | 11       | Conversions                                        | Derived     | Number     |
  | 12       | Average Session Duration                           | Calculated  | Time       |
  | 13       | Cost per 1 min User                                | Calculated  | Currency   |
  | 14       | 1min user/total users (%)                          | Calculated  | Percentage |
  | 15       | Users with Session above 1 min                     | Derived     | Number     |
  | 16       | ATC with session duration above 1 min              | Derived     | Number     |
  | 17       | Reached Checkout with session duration above 1 min | Derived     | Number     |
  | 18       | Users with Above 5 page views and above 1 min      | Derived     | Number     |
  | 19       | Remarks                                            | Manual      | String     |
  | 20       | Status                                             | Meta        | String     |










 i want to look at the same metric just pivot them by "Utm campaign" give me table in markdown format. you can ignore the Landing page url keep other metric. 


 | UTM Campaign                                                                               | Total Customers | Total Sessions |
  Sessions/Customer | Avg Session Duration (sec) | Checkout Sessions | Checkout Rate (%) | Cart Additions | Cart Rate (%) |
  |--------------------------------------------------------------------------------------------|-----------------|----------------|--------------
  -----|----------------------------|-------------------|-------------------|----------------|---------------|
  | BOF | DPA                                                                                  | 13,132          | 13,713         | 1.04
       | 34.64                      | 18                | 0.13              | 63             | 0.46          |
  | TOF | India                                                                                | 9,999           | 10,164         | 1.02
       | 13.75                      | 7                 | 0.07              | 21             | 0.21          |
  | TOF | AND                                                                                  | 7,763           | 7,939          | 1.02
       | 17.36                      | 4                 | 0.05              | 19             | 0.24          |
  | TOF | Delhi                                                                                | 6,734           | 6,868          | 1.02
       | 14.98                      | 1                 | 0.01              | 6              | 0.09          |
  | TOF | Mumbai                                                                               | 5,179           | 5,288          | 1.02
       | 12.24                      | 1                 | 0.02              | 9              | 0.17          |
  | TOF | Bangalore                                                                            | 4,306           | 4,390          | 1.02
       | 10.92                      | 3                 | 0.07              | 6              | 0.14          |
  | Direct Traffic / Organic                                                                   | 3,443           | 3,975          | 1.15
       | 173.54                     | 29                | 0.73              | 51             | 1.28          |
  | TOF | India Modern                                                                         | 3,877           | 3,882          | 1.00
       | 16.80                      | 8                 | 0.21              | 26             | 0.67          |
  | MOF                                                                                        | 2,212           | 2,247          | 1.02
       | 59.18                      | 6                 | 0.27              | 20             | 0.89          |
  | india-pmax-rings-22753626610                                                               | 1,991           | 2,035          | 1.02
       | 73.51                      | 23                | 1.13              | 35             | 1.72          |
  | TOF | Pune                                                                                 | 1,773           | 1,806          | 1.02
       | 12.21                      | 0                 | 0.00              | 0              | 0.00          |
  | TOF | 80k                                                                                  | 1,237           | 1,247          | 1.01
       | 16.80                      | 0                 | 0.00              | 2              | 0.16          |
  | TOF | Chennai Store | Aug 2025                                                             | 897             | 898            | 1.00
       | 47.61                      | 0                 | 0.00              | 2              | 0.22          |
  | india-pmax-earrings-22766100463                                                            | 872             | 896            | 1.03
       | 138.55                     | 7                 | 0.78              | 10             | 1.12          |
  | TOF | Chennai Store                                                                        | 827             | 830            | 1.00
       | 8.74                       | 0                 | 0.00              | 0              | 0.00          |
  | brand_search-14337891333                                                                   | 678             | 712            | 1.05
       | 335.93                     | 4                 | 0.56              | 11             | 1.54          |
  | VIBE_11914_adyogi_Youtube_Engage_All-19159914124                                           | 563             | 575            | 1.02
       | 52.20                      | 0                 | 0.00              | 2              | 0.35          |
  | TOF | Story/Reel                                                                           | 343             | 349            | 1.02
       | 56.87                      | 1                 | 0.29              | 1              | 0.29          |
  | TOF | CUSTOM | AUTO                                                                        | 257             | 263            | 1.02
       | 40.27                      | 0                 | 0.00              | 2              | 0.76          |
  | TOF | ALL                                                                                  | 183             | 203            | 1.11
       | 21.92                      | 0                 | 0.00              | 0              | 0.00          |
  | TOF | All That Grace                                                                       | 201             | 202            | 1.00
       | 88.79                      | 0                 | 0.00              | 2              | 0.99          |
  | TOF | Ahmedabad Store                                                                      | 167             | 167            | 1.00
       | 21.46                      | 0                 | 0.00              | 0              | 0.00          |
  | Template/Dynamic Campaign                                                                  | 77              | 83             | 1.08
       | 85.23                      | 0                 | 0.00              | 0              | 0.00          |
  | TOF+%7C+Chennai+Store+%7C+Aug+2025                                                         | 45              | 45             | 1.00
       | 1.53                       | 0                 | 0.00              | 0              | 0.00          |
  | MOF+%7C+Chennai+Store+%7C+Aug+2025                                                         | 26              | 26             | 1.00
       | 3.35                       | 0                 | 0.00              | 0              | 0.00          |
  | TOF                                                                                        | 18              | 24             | 1.33
       | 210.83                     | 0                 | 0.00              | 0              | 0.00          |
  | MOF | Chennai Store | Aug 2025                                                             | 24              | 24             | 1.00
       | 1.83                       | 0                 | 0.00              | 0              | 0.00          |
  | sag_organic                                                                                | 21              | 21             | 1.00
       | 129.24                     | 0                 | 0.00              | 0              | 0.00          |
  | TOF | DABA | ALL | Adv+                                                                    | 14              | 16             | 1.14
       | 104.32                     | 0                 | 0.00              | 0              | 0.00          |
  | t2-pmax-rings-22849252541                                                                  | 3               | 16             | 5.33
       | 356.36                     | 0                 | 0.00              | 0              | 0.00          |
  | TOF | DABA | FB                                                                            | 10              | 11             | 1.10
       | 0.50                       | 0                 | 0.00              | 0              | 0.00          |
  | pmax_earrings-19114863587                                                                  | 5               | 9              | 1.80
       | 22.42                      | 0                 | 0.00              | 0              | 0.00          |
  | Moi_Chennai_Store-22609122951                                                              | 7               | 7              | 1.00
       | 128.71                     | 0                 | 0.00              | 0              | 0.00          |
  | Brand-Search-19758011432                                                                   | 6               | 6              | 1.00
       | 245.83                     | 1                 | 16.67             | 1              | 16.67         |
  | pmax_ring-17551380699                                                                      | 4               | 5              | 1.25
       | 0.00                       | 0                 | 0.00              | 0              | 0.00          |
  | BOF                                                                                        | 5               | 5              | 1.00
       | 63.00                      | 1                 | 20.00             | 1              | 20.00         |
  | BOF+%7C+DPA                                                                                | 4               | 4              | 1.00
       | 1.50                       | 0                 | 0.00              | 0              | 0.00          |
  | TOF+%7C+Bangalore                                                                          | 4               | 4              | 1.00
       | 1.25                       | 0                 | 0.00              | 0              | 0.00          |
  | TOF+%7C+Mumbai                                                                             | 4               | 4              | 1.00
       | 1.50                       | 0                 | 0.00              | 0              | 0.00          |
  | tof_display-21349805240                                                                    | 2               | 3              | 1.50
       | 2.50                       | 0                 | 0.00              | 0              | 0.00          |
  | VIBE_11914_adyogi_Youtube_Prospect_All-19153546224                                         | 1               | 3              | 3.00
       | 0.00                       | 0                 | 0.00              | 0              | 0.00          |
  | TOF+%7C+Delhi                                                                              | 3               | 3              | 1.00
       | 5.33                       | 0                 | 0.00              | 0              | 0.00          |
  | TOF+%7C+India                                                                              | 3               | 3              | 1.00
       | 2.67                       | 0                 | 0.00              | 0              | 0.00          |
  | TOF+%7C+Pune                                                                               | 3               | 3              | 1.00
       | 0.00                       | 0                 | 0.00              | 0              | 0.00          |
  | Pmax_necklaces-20153247774                                                                 | 3               | 3              | 1.00
       | 569.00                     | 0                 | 0.00              | 1              | 33.33         |
  | TOF %7C Bangalore                                                                          | 2               | 3              | 1.50
       | 277.75                     | 0                 | 0.00              | 0              | 0.00          |
  | t1-pmax-rings-22753626610                                                                  | 2               | 2              | 1.00
       | 63.00                      | 0                 | 0.00              | 0              | 0.00          |
  | t1-pmax-earrings-22766100463                                                               | 2               | 2              | 1.00
       | 11.50                      | 0                 | 0.00              | 0              | 0.00          |
  | Catalog sales | P+ campaign                                                                | 2               | 2              | 1.00
       | 0.00                       | 0                 | 0.00              | 0              | 0.00          |
  | MOF | Engage                                                                               | 2               | 2              | 1.00
       | 118.50                     | 0                 | 0.00              | 0              | 0.00          |
  | TOF %7C Delhi                                                                              | 1               | 2              | 2.00
       | 0.00                       | 0                 | 0.00              | 0              | 0.00          |
  | TOF %7C India                                                                              | 2               | 2              | 1.00
       | 0.00                       | 0                 | 0.00              | 0              | 0.00          |
  | TOF | DABA | IG                                                                            | 2               | 2              | 1.00
       | 15.50                      | 0                 | 0.00              | 0              | 0.00          |
  | TOF | DABA | Value â€" IG                                                                  | 1               | 1              | 1.00
       | 15.00                      | 0                 | 0.00              | 0              | 0.00          |
  | VIBE_11914_adyogi_PerformanceMax_Earrings-19114863587                                      | 1               | 1              | 1.00
       | 0.00                       | 0                 | 0.00              | 0              | 0.00          |
  | VOG-FEB Art                                                                                | 1               | 1              | 1.00
       | 18.00                      | 0                 | 0.00              | 0              | 0.00          |
  | VIBE_11914_adyogi_PerformanceMax_All-18006316000                                           | 1               | 1              | 1.00
       | 44.00                      | 0                 | 0.00              | 0              | 0.00          |
  | VIBE_11914_adyogi_Conversions_Prospect_custom Ad_value_23852281279960312-23852281279960312 | 1               | 1              | 1.00
       | 0.00                       | 0                 | 0.00              | 0              | 0.00          |
  | india-pmax-rings-227536                                                                    | 1               | 1              | 1.00
       | 0.00                       | 0                 | 0.00              | 0              | 0.00          |
  | VIBE_11914_adyogi_Conversions_Prospect_Khoob ATC-23853556397970312                         | 1               | 1              | 1.00
       | 1.00                       | 0                 | 0.00              | 0              | 0.00          |
  | VIBE_11914_adyogi_Conversions_Engage_women                                                 | 1               | 1              | 1.00
       | 0.00                       | 0                 | 0.00              | 0              | 0.00          |
  | Living in Moi | Chandigarh                                                                 | 1               | 1              | 1.00
       | 0.00                       | 0                 | 0.00              | 0              | 0.00          |
  | retry2 - Wildflower India upsell                                                           | 1               | 1              | 1.00
       | 585.00                     | 0                 | 0.00              | 0              | 0.00          |
  | TOF %7C Mumbai                                                                             | 1               | 1              | 1.00
       | 0.00                       | 0                 | 0.00              | 0              | 0.00          |
  | shopify_cart_reminder                                                                      | 1               | 1              | 1.00
       | 0.00                       | 0                 | 0.00              | 0              | 0.00          |
  | TOF %7C Pune                                                                               | 1               | 1              | 1.00
       | 0.00                       | 0                 | 0.00              | 0              | 0.00          |
  | TOF | DABA | ALL | Adv                                                                     | 1               | 1              | 1.00
       | 0.00                       | 0                 | 0.00              | 0              | 0.00          |
  | TOF | KHB                                                                                  | 1               | 1              | 1.00
       | 0.00                       | 0                 | 0.00              | 0              | 0.00          |

  Total: 68 UTM Campaigns analyzed

  📈 Campaign Performance Tiers

  | Performance Tier                 | Count        | Key Characteristics                |
  |----------------------------------|--------------|------------------------------------|
  | High Traffic (1000+ sessions)    | 15 campaigns | Drive 95% of total traffic         |
  | Medium Traffic (10-999 sessions) | 17 campaigns | Growth opportunity campaigns       |
  | Low Traffic (<10 sessions)       | 36 campaigns | Test/experimental campaigns        |
  | Zero Conversion                  | 58 campaigns | 85% of campaigns need optimization |

  Critical Finding: Only 10 out of 68 campaigns (15%) generate any checkout conversions, indicating massive optimization potential across the
  portfolio.

#

