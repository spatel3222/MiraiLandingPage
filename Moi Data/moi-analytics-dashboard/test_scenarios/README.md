# MOI Analytics End-to-End Testing

## 🎯 Purpose
This test suite verifies that the export system uses actual template processing instead of hardcoded values.

## 📁 Test Scenarios

### 1. Basic Known Values (01_basic_known_values)
- **Purpose**: Verify basic template processing works
- **Expected**: Meta Spend=3000, Google Spend=4000, Total Users=300
- **Date**: 2025-09-29

### 2. Different Dates (02_different_dates)  
- **Purpose**: Verify date extraction from input files
- **Expected**: All outputs show 2025-10-15
- **Key Test**: Dates should change based on input files

### 3. Different Spend (03_different_spend)
- **Purpose**: Verify calculations work correctly
- **Expected**: Cost per user = 5000/50 = 100
- **Key Test**: Calculated fields should change based on input

### 4. Edge Cases (04_edge_cases)
- **Purpose**: Test zero values and edge cases
- **Expected**: All metrics = 0
- **Key Test**: System handles zero values properly

## 🧪 How to Test

1. **Start Dashboard**: http://localhost:5175
2. **For each scenario**:
   - Upload the 3 CSV files from scenario folder
   - Export all 3 output files
   - Verify values match expected results
3. **Key Validation**: Values should change between scenarios
4. **Failure Indication**: If values stay the same = hardcoding present

## ✅ Success Criteria
- Dates extract correctly from input files per template
- Spend amounts reflect input data exactly  
- User counts match Shopify data
- Calculated fields (Cost per user) work correctly
- Different inputs produce different outputs

## ❌ Failure Indicators
- Same dates across all test scenarios
- Same spend amounts regardless of input
- Same user counts regardless of Shopify data
- Calculated fields don't change appropriately
