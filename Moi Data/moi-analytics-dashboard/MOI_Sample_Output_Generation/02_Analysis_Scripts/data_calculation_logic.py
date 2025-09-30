#!/usr/bin/env python3
"""
MOI Analytics Dashboard - Sample Data Generation Logic
Based on actual input data from Sep 10-23, 2025

INPUT DATA ANALYSIS:
- Meta Ads: 3 ad sets, total spend ~110,600 INR
- GA4: 3 campaigns, total spend ~145,721 INR  
- Shopify: 516 visitors, 3,257 pageviews, 3 conversions

CALCULATION FORMULAS:
1. Cost per User = Meta Spend ÷ Shopify Visitors
2. 1min+ Users = Visitors × (session duration > 60s rate)
3. Quality Users = Users with 1min+ AND 5+ pageviews
4. Daily breakdown = Total ÷ 14 days (Sep 10-23)
"""

import pandas as pd
from datetime import datetime, timedelta
import random

# Input data from actual reports
META_DATA = [
    {"campaign": "TOF | ALL", "adset": "T1 - TRLi - FEED", "spend": 51896.96, "cpm": 71.31, "ctr": 1.73},
    {"campaign": "TOF | ALL", "adset": "T2 - TRLi", "spend": 40969.26, "cpm": 51.81, "ctr": 1.24},
    {"campaign": "MOF", "adset": "MOF | DABA | ENGDi", "spend": 17734.50, "cpm": 111.98, "ctr": 3.44}
]

GA4_DATA = [
    {"campaign": "BOF-YT-ALL PRODUCTS", "cost": 7163.85, "ctr": 1.98, "cpm": 134.70},
    {"campaign": "Brand-Search", "cost": 68182.40, "ctr": 19.12, "cpm": 10257.62},
    {"campaign": "T1 Pmax Earrings", "cost": 70375.08, "ctr": 0.84, "cpm": 173.85}
]

SHOPIFY_DATA = {
    "visitors": 516,
    "pageviews": 3257,
    "checkout_sessions": 7,
    "completed_checkout": 3,
    "cart_additions": 12,
    "avg_duration": 248.6
}

# Derived calculations
TOTAL_META_SPEND = sum([item["spend"] for item in META_DATA])
TOTAL_GA4_SPEND = sum([item["cost"] for item in GA4_DATA])
COST_PER_USER = TOTAL_META_SPEND / SHOPIFY_DATA["visitors"]
USERS_1MIN_PLUS = int(SHOPIFY_DATA["visitors"] * 0.65)  # Assuming 65% have 1min+ sessions

print(f"Total Meta Spend: {TOTAL_META_SPEND:,.2f} INR")
print(f"Total GA4 Spend: {TOTAL_GA4_SPEND:,.2f} INR")
print(f"Cost per User: {COST_PER_USER:,.2f} INR")
print(f"1min+ Users: {USERS_1MIN_PLUS}")