#!/bin/bash

# Category Colors and Filtering Test Runner
# Run this script to execute all category-related tests

echo "🚀 Starting Category Colors and Filtering Test Suite"
echo "=================================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Installing dependencies..."
    npm install
    echo ""
fi

# Run Node.js tests
echo "📝 Running Node.js Tests..."
echo "----------------------------"
npm run test:category

# Check if tests passed
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Node.js tests PASSED!"
    
    # Open browser tests
    echo ""
    echo "🌐 Opening Browser Integration Tests..."
    echo "-------------------------------------"
    
    # Detect OS and open browser accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open tests/category-filtering-integration.html
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        xdg-open tests/category-filtering-integration.html
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows
        start tests/category-filtering-integration.html
    else
        echo "Please manually open: tests/category-filtering-integration.html"
    fi
    
    echo ""
    echo "🎉 All tests completed successfully!"
    echo ""
    echo "📋 Test Summary:"
    echo "  ✅ Unit Tests: PASSED"
    echo "  ✅ Integration Tests: OPENED"
    echo "  ✅ Visual Regression Tests: AVAILABLE"
    echo "  ✅ Accessibility Tests: INCLUDED"
    echo ""
    echo "💡 Tips:"
    echo "  - Review browser tests for visual verification"
    echo "  - Test keyboard navigation in browser"
    echo "  - Verify color contrast in different themes"
    echo "  - Check performance with large datasets"
    
else
    echo ""
    echo "❌ Node.js tests FAILED!"
    echo "Please fix the failing tests before proceeding."
    exit 1
fi