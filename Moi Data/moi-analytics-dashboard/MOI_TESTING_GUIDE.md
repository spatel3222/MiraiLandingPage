# MOI Analytics Dashboard - Comprehensive Testing Guide

## 🎯 Critical Issues Identified

Based on the code analysis, the dashboard has several critical issues:

1. **localStorage Key Mismatch**: Export system looks for `moi-meta-data` and `moi-google-data` but data is stored in `moi-server-*` keys
2. **Session Duration Bug**: All session-based calculations showing 0 instead of real values  
3. **Meta/Google Spend**: CTR/CPM showing 0 instead of actual values from localStorage
4. **Data Access Disconnect**: File loading system and export system use different key naming conventions

## 🚀 Quick Start Testing

### 1. Install Dependencies
```bash
npm install
npm run test:install  # Install Playwright browsers
```

### 2. Start Development Server
```bash
npm run dev
# Server should start on http://localhost:5173
```

### 3. Run Debugging Tests (New Terminal)
```bash
# Run all debug tests with comprehensive reporting
npm run test:all

# Or run individual test suites:
npm run test:localstorage  # localStorage debugging
npm run test:export        # Export validation
npm run test:regression    # Dashboard regression tests
```

### 4. View Test Results
```bash
npm run test:report
# Opens HTML report in browser with screenshots and logs
```

## 📋 Test Suite Overview

### Test 1: localStorage Debugging (`localStorage-debug.test.ts`)
**Purpose**: Identify and fix the localStorage key mismatch issue

**Tests Include**:
- ✅ **01. Identify localStorage Key Mismatch**: Maps expected vs actual keys
- ✅ **02. Reproduce Export System Failure**: Captures exact failure conditions  
- ✅ **03. Fix localStorage Key Issue**: Tests corrected key naming
- ✅ **04. Test Session Duration Calculations**: Validates 60-second threshold logic
- ✅ **05. Comprehensive Data Flow Analysis**: End-to-end debugging

**Key Findings Expected**:
- Export system expects `moi-meta-data` but finds `moi-server-topLevel`
- Session duration calculations fail due to improper threshold checks
- Data exists but is inaccessible due to key naming issues

### Test 2: Export Validation (`export-validation.test.ts`)
**Purpose**: Validate export system generates correct data (not zeros)

**Tests Include**:
- ✅ **01. Validate Meta Ads Data Export**: Checks spend/CTR/CPM calculations
- ✅ **02. Validate Google Ads Data Export**: Validates Google metrics aggregation
- ✅ **03. Validate Session Duration Calculations**: Tests "above 1 min" logic
- ✅ **04. End-to-End Export Validation**: Complete export workflow test

**Expected Results**:
- Meta Spend: Should show ~4300 (2500 + 1800), not 0
- Session Users Above 1 Min: Should count sessions > 60 seconds
- CTR/CPM: Should show decimal values, not 0.0

### Test 3: Dashboard Regression (`dashboard-regression.test.ts`)
**Purpose**: Ensure fixes don't break existing functionality

**Tests Include**:
- ✅ **01. Dashboard Load and Initial Render**: Basic functionality
- ✅ **02. Data Loading and Processing**: Validates data pipeline  
- ✅ **03. UI Component Functionality**: Interactive elements
- ✅ **04. Export Modal Accessibility**: Keyboard navigation, ESC handling
- ✅ **05. Performance and Memory Validation**: Load time, memory usage
- ✅ **06. Error Recovery and Edge Cases**: Malformed data handling

## 🔍 Console Monitoring Features

Each test includes comprehensive console monitoring:

### Console Error Detection
- **JavaScript Runtime Errors**: Catches silent failures
- **localStorage Access Errors**: Identifies data retrieval issues  
- **Export Process Errors**: Monitors calculation failures
- **Performance Warnings**: Detects slow operations

### Visual Feedback Integration  
- **Before/After Screenshots**: Visual comparison of changes
- **Error State Capture**: Screenshots when failures occur
- **Multi-Viewport Testing**: Mobile, tablet, desktop views
- **Console Log Export**: Complete debugging information

## 🛠️ Advanced Testing Commands

### Debug Mode (Step-by-step execution)
```bash
npm run test:debug
# Opens browser for manual interaction during test
```

### Headed Mode (Watch tests run)
```bash
npm run test:headed  
# See tests execute in visible browser window
```

### Specific Test Targeting
```bash
# Run only localStorage debugging
npx playwright test tests/localStorage-debug.test.ts::01

# Run only export validation for Meta Ads
npx playwright test tests/export-validation.test.ts -g "Meta Ads"

# Run tests matching pattern
npx playwright test -g "session duration"
```

## 📊 Understanding Test Output

### Test Results Structure
```
test-results/
├── playwright-report/     # HTML report with screenshots
├── test-report-*.json     # Detailed JSON results
├── test-summary-*.md      # Human-readable summary
├── screenshots/          # Before/after screenshots
└── console-logs/         # Exported console output
```

### Key Metrics to Watch
- **Console Errors**: Should be 0 after fixes
- **Export Success Rate**: Should be 100% with valid data
- **Session Calculation Accuracy**: Non-zero values for >1min sessions
- **Meta/Google Data Access**: Non-zero spend/CTR/CPM values

## 🔧 Expected Fix Roadmap

Based on test results, here's the expected fix sequence:

### Priority 1: localStorage Key Fix
**Issue**: Export system can't find data due to key mismatch
**Fix Location**: `src/components/ExportModal.tsx` lines 91-92
**Change**: 
```typescript
// Current (broken):
const metaDataRaw = localStorage.getItem('moi-meta-data');
const googleDataRaw = localStorage.getItem('moi-google-data');

// Fixed (should work):
const metaDataRaw = localStorage.getItem('moi-meta-data') || 
                   localStorage.getItem('moi-server-meta') ||
                   localStorage.getItem('meta-data');
```

### Priority 2: Session Duration Logic
**Issue**: Sessions above 1 min calculations showing 0
**Fix Location**: `src/components/ExportModal.tsx` lines 256-263
**Problem**: `duration > 60` comparison may be failing
**Test**: Validate with known session durations (125 seconds, 45 seconds)

### Priority 3: Data Aggregation
**Issue**: Meta/Google spend showing 0 instead of actual values
**Fix Location**: `src/components/ExportModal.tsx` lines 280-325
**Validation**: Should aggregate to ~4300 INR total spend

## 🚨 Critical Test Scenarios

### Scenario 1: Empty localStorage
**Test**: Dashboard should handle gracefully without crashing
**Expected**: Show empty state, no JavaScript errors

### Scenario 2: Malformed Data
**Test**: Invalid JSON in localStorage keys
**Expected**: Parse errors handled, dashboard still functional

### Scenario 3: Large Dataset
**Test**: 1000+ campaigns for performance testing  
**Expected**: Load time < 10 seconds, no memory leaks

### Scenario 4: Cross-Browser Compatibility
**Test**: Chrome, Firefox, Safari behavior
**Expected**: Consistent functionality across browsers

## 📈 Success Criteria

### ✅ Tests Pass When:
1. **No Console Errors**: JavaScript executes cleanly
2. **Real Data in Exports**: Non-zero values for spend/CTR/CPM
3. **Session Calculations Work**: Accurate >1min user counts
4. **All Export Types Function**: Top Level, Adset, Pivot exports
5. **Regression Tests Pass**: Existing functionality unaffected

### ❌ Tests Fail When:
1. **localStorage Access Fails**: Cannot find required data
2. **Calculations Return Zero**: When real data exists
3. **JavaScript Errors**: Console shows runtime failures
4. **Export Downloads Fail**: No CSV files generated
5. **UI Becomes Unresponsive**: Performance degradation

## 🔄 Test-Driven Development Workflow

1. **Run Tests First**: Establish baseline failure conditions
2. **Identify Root Causes**: Use console logs and screenshots
3. **Apply Targeted Fixes**: Address specific failing tests
4. **Validate Fixes**: Re-run affected test suites
5. **Run Regression Tests**: Ensure no new issues introduced
6. **Repeat Until Green**: All tests passing

## 🎯 Next Steps After Testing

1. **Review Test Reports**: Analyze failures and recommendations
2. **Implement Critical Fixes**: Start with localStorage key issues  
3. **Validate Each Fix**: Run specific test suites
4. **Document Changes**: Update this guide with fix details
5. **Deploy with Confidence**: Comprehensive test coverage ensures stability

---

## 🆘 Troubleshooting

### Dev Server Won't Start
```bash
# Kill any existing process on port 5173
lsof -ti:5173 | xargs kill -9
npm run dev
```

### Playwright Installation Issues
```bash
npx playwright install --with-deps
```

### Tests Timing Out
```bash
# Increase timeout in playwright.config.ts
timeout: 60 * 1000  # 1 minute per test
```

### Can't Find Export Button
- Check if dashboard loaded properly
- Look for console errors preventing UI render
- Verify test data is properly set in localStorage

This comprehensive testing framework will systematically identify and validate fixes for all the critical export system issues while ensuring the dashboard remains stable and functional.