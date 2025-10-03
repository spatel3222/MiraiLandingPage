#!/bin/bash

# MOI Analytics Dashboard - Test Setup Validation Script

echo "🚀 MOI Analytics Dashboard Test Setup Validation"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from dashboard root directory."
    exit 1
fi

echo "✅ Found package.json"

# Check Playwright installation
if command -v npx >/dev/null 2>&1; then
    echo "✅ npx is available"
    
    if npx playwright --version >/dev/null 2>&1; then
        PLAYWRIGHT_VERSION=$(npx playwright --version)
        echo "✅ Playwright installed: $PLAYWRIGHT_VERSION"
    else
        echo "❌ Playwright not found. Installing..."
        npx playwright install
    fi
else
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

# Check test files exist
TEST_FILES=(
    "tests/localStorage-debug.test.ts"
    "tests/export-validation.test.ts" 
    "tests/dashboard-regression.test.ts"
    "tests/helpers/console-monitor.ts"
    "tests/helpers/localStorage-helper.ts"
    "playwright.config.ts"
)

echo ""
echo "📁 Checking test files..."

for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
    fi
done

# Check if dev server is running
echo ""
echo "🌐 Checking development server..."

if curl -s http://localhost:5173 >/dev/null 2>&1; then
    echo "✅ Development server running on http://localhost:5173"
else
    echo "⚠️  Development server not running. Start with: npm run dev"
fi

# Test directory structure
echo ""
echo "📂 Test directory structure:"
if [ -d "tests" ]; then
    echo "✅ tests/"
    if [ -d "tests/helpers" ]; then
        echo "✅ tests/helpers/"
    else
        echo "❌ tests/helpers/ missing"
    fi
    if [ -d "test-results" ]; then
        echo "✅ test-results/"
    else
        echo "⚠️  test-results/ will be created on first test run"
    fi
else
    echo "❌ tests/ directory missing"
fi

echo ""
echo "🎯 Ready to run tests!"
echo ""
echo "Quick start commands:"
echo "  npm run dev                    # Start development server"
echo "  npm run test:localstorage      # Run localStorage debugging tests"
echo "  npm run test:export            # Run export validation tests"
echo "  npm run test:regression        # Run regression tests"
echo "  npm run test:report            # View test results"
echo ""
echo "For detailed instructions, see: MOI_TESTING_GUIDE.md"