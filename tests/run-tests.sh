#!/bin/bash

# Focus Mode Test Runner Script
# Executes the comprehensive test suite for Daily Focus Mode functionality

echo "🧪 Focus Mode Test Suite"
echo "========================================"
echo "Testing functionality from commits:"
echo "- 8adda1c (Implement Daily Focus Mode)"
echo "- 52a9668 (Fix focus mode modal overlap)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed${NC}"
    echo "Please install Node.js to run the test suite"
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing test dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}🔧 Running Unit Tests...${NC}"
echo "----------------------------------------"

# Run the Node.js unit tests
node tests/focus-mode.test.js

# Check if unit tests passed
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Unit tests completed successfully${NC}"
else
    echo -e "${RED}❌ Unit tests failed${NC}"
    echo "Check the output above for details"
fi

echo ""
echo -e "${BLUE}🌐 Opening Integration Tests in Browser...${NC}"
echo "----------------------------------------"

# Detect OS and open browser accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open tests/focus-mode-integration.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open tests/focus-mode-integration.html
elif [[ "$OSTYPE" == "msys" ]]; then
    # Windows
    start tests/focus-mode-integration.html
else
    echo -e "${YELLOW}⚠️  Unable to detect OS. Please manually open:${NC}"
    echo "   tests/focus-mode-integration.html"
fi

echo ""
echo -e "${GREEN}🎉 Test suite execution complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "1. Review unit test results above"
echo "2. Complete integration tests in the opened browser"
echo "3. Check the live functionality in the embedded iframe"
echo ""
echo "📖 For detailed documentation, see: tests/README.md"