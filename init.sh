#!/bin/bash
# Mirai360 Landing Page - Development Environment Setup
# Run this script to set up and start the development environment

set -e

echo "=========================================="
echo "  Mirai360 Landing Page - Dev Setup"
echo "=========================================="
echo ""

# Check Node.js version
echo "[1/5] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Please install Node.js 18+ first."
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "WARNING: Node.js 18+ recommended. Current: $(node -v)"
fi
echo "  Node.js: $(node -v)"

# Install dependencies
echo ""
echo "[2/5] Installing npm dependencies..."
npm install

# Install Playwright browsers
echo ""
echo "[3/5] Installing Playwright browsers..."
npx playwright install chromium firefox webkit

# Build check
echo ""
echo "[4/5] Running build check..."
npm run build
echo "  Build successful!"

# Start development server
echo ""
echo "[5/5] Starting development server..."
echo ""
echo "=========================================="
echo "  Development server starting..."
echo "  Local:   http://localhost:5173"
echo "  Network: Check terminal output below"
echo ""
echo "  Commands:"
echo "    npm run dev       - Start dev server"
echo "    npm run build     - Production build"
echo "    npm run preview   - Preview production build"
echo "    npx playwright test           - Run all tests"
echo "    npx playwright test --headed  - Run tests with browser UI"
echo "    npx playwright test --ui      - Open Playwright UI"
echo ""
echo "  Press Ctrl+C to stop the server"
echo "=========================================="
echo ""

npm run dev
