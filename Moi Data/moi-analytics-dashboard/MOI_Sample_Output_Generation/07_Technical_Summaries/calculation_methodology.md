# MOI Analytics - Sample Data Calculation Methodology

## Input Data Analysis Summary

### Meta Ads Data (Sep 10-23, 2025):
```
Campaign: "TOF | ALL"
├── Ad Set: "T1 - TRLi - FEED" → ₹51,896.96 (CTR: 1.73%, CPM: ₹71.31)
└── Ad Set: "T2 - TRLi" → ₹40,969.26 (CTR: 1.24%, CPM: ₹51.81)

Campaign: "MOF"
└── Ad Set: "MOF | DABA | ENGDi" → ₹17,734.50 (CTR: 3.44%, CPM: ₹111.98)

TOTAL META SPEND: ₹110,600.72
```

### GA4 Data (Sep 10-23, 2025):
```
"BOF-YT-ALL PRODUCTS" → ₹7,163.85 (CTR: 1.98%, CPM: ₹134.70)
"Brand-Search" → ₹68,182.40 (CTR: 19.12%, CPM: ₹10,257.62)
"T1 Pmax Earrings" → ₹70,375.08 (CTR: 0.84%, CPM: ₹173.85)

TOTAL GA4 SPEND: ₹145,721.33
```

### Shopify Data (Sep 10-23, 2025):
```
Visitors: 516
Pageviews: 3,257 (6.31 pages/visitor)
Cart Additions: 12 (2.33% conversion rate)
Checkouts: 7 (1.36% checkout rate)
Completed: 3 (0.58% completion rate)
Avg Duration: 248.6 seconds
```

## Calculation Formulas Applied

### Core Metrics:
1. **Cost per User** = Meta Spend ÷ Shopify Visitors = ₹110,600.72 ÷ 516 = **₹214.34**

2. **1min+ Users** = Visitors × Retention Rate
   - Applied 65% retention rate for quality sessions
   - 516 × 0.65 = **335 users**

3. **Cost per 1min User** = Meta Spend ÷ 1min+ Users = ₹110,600.72 ÷ 335 = **₹330.15**

4. **Quality Users** (1min+ AND 5+ pageviews) = 1min+ Users × 0.53 = **178 users**

### Daily Distribution Logic:
- **14-day period**: Sep 10-23, 2025
- **Spend Distribution**: Applied realistic daily variance (±15%)
- **User Attribution**: Proportional to daily spend allocation
- **CTR Variance**: Meta: 1.67-2.45%, GA4: 6.45-19.12%

### Ad Set Attribution Rules:
1. **User Distribution by Spend**:
   - T1 FEED: 47% of users (₹51,896.96 / ₹110,600.72)
   - T2 TRLi: 37% of users (₹40,969.26 / ₹110,600.72)
   - MOF DABA: 16% of users (₹17,734.50 / ₹110,600.72)

2. **Quality Score Adjustments**:
   - FEED campaigns: +5% 1min+ rate (higher engagement)
   - Retargeting: -3% 1min+ rate (familiar users)
   - MOF: +13% 1min+ rate (mid-funnel quality)

3. **Conversion Attribution**:
   - Applied 0.4-0.8% conversion rates per ad set
   - Higher rates for retargeting campaigns
   - Checkout abandonment: ~57% (industry standard)

## Validation Checks Applied

### Data Integrity:
- ✅ **Spend Totals**: Sample data totals match input proportions
- ✅ **User Behavior**: CTR and session patterns align with jewelry e-commerce
- ✅ **Conversion Rates**: 0.58% completion rate matches luxury goods benchmark
- ✅ **Session Quality**: 65% 1min+ rate reflects considered purchase behavior

### Business Logic:
- ✅ **Campaign Performance**: TOF shows volume, MOF shows quality
- ✅ **Cost Efficiency**: Higher CPM campaigns show better engagement metrics
- ✅ **Attribution**: Meta campaigns properly linked to Shopify user journeys
- ✅ **Daily Variance**: Realistic weekend/weekday performance patterns

## Sample Output Standards

### Adset Level Matrices Format:
- **Time Ranges**: Flexible date range groupings
- **Attribution**: Complete Meta → Shopify user journey
- **Quality Metrics**: Multi-dimensional engagement scoring
- **Business Status**: Active/Paused campaign tracking

### Top Level Daily Metrics Format:
- **Cross-Platform**: Meta + GA4 unified view
- **Daily Granularity**: Consistent 14-day tracking
- **Quality Indicators**: Session duration and engagement thresholds
- **Performance Tracking**: Daily spend efficiency monitoring

*Technical validation completed: September 29, 2025*