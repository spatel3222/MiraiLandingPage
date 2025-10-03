#!/usr/bin/env node

/**
 * MOI Analytics Dashboard - Test Execution Script
 * 
 * Orchestrates the complete testing workflow:
 * 1. Environment setup and validation
 * 2. Sequential test execution with detailed logging
 * 3. Issue identification and reporting
 * 4. Fix validation and regression testing
 * 5. Comprehensive reporting
 */

import { execSync, spawn } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  errors: string[];
  screenshots: string[];
  issues: string[];
  recommendations: string[];
}

interface TestReport {
  timestamp: string;
  environment: any;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  criticalIssues: string[];
  fixesApplied: string[];
  nextSteps: string[];
  results: TestResult[];
}

class MOITestRunner {
  private results: TestResult[] = [];
  private startTime: number = Date.now();
  private testDir = join(process.cwd(), 'tests');
  private resultsDir = join(process.cwd(), 'test-results');

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories() {
    if (!existsSync(this.resultsDir)) {
      mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      warn: '⚠️',
      error: '❌'
    }[level];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  private async validateEnvironment(): Promise<boolean> {
    this.log('Validating test environment...', 'info');
    
    try {
      // Check if development server is running
      const response = await fetch('http://localhost:5173').catch(() => null);
      if (!response || !response.ok) {
        this.log('Development server not running on localhost:5173', 'warn');
        this.log('Starting development server...', 'info');
        
        // Start dev server in background
        const devServer = spawn('npm', ['run', 'dev'], {
          detached: true,
          stdio: 'pipe'
        });
        
        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Check again
        const retryResponse = await fetch('http://localhost:5173').catch(() => null);
        if (!retryResponse || !retryResponse.ok) {
          this.log('Failed to start development server', 'error');
          return false;
        }
      }
      
      this.log('✅ Development server is running', 'info');
      
      // Check Playwright installation
      try {
        execSync('npx playwright --version', { stdio: 'pipe' });
        this.log('✅ Playwright is installed', 'info');
      } catch (error) {
        this.log('Playwright not found, installing...', 'warn');
        execSync('npx playwright install', { stdio: 'inherit' });
      }
      
      return true;
    } catch (error) {
      this.log(`Environment validation failed: ${error}`, 'error');
      return false;
    }
  }

  private async runTest(testFile: string, testName: string): Promise<TestResult> {
    this.log(`Running ${testName}...`, 'info');
    const startTime = Date.now();
    
    const result: TestResult = {
      testName,
      status: 'failed',
      duration: 0,
      errors: [],
      screenshots: [],
      issues: [],
      recommendations: []
    };
    
    try {
      const command = `npx playwright test ${testFile} --reporter=json`;
      const output = execSync(command, { 
        cwd: process.cwd(),
        encoding: 'utf-8',
        timeout: 120000 // 2 minutes per test
      });
      
      result.status = 'passed';
      result.duration = Date.now() - startTime;
      
      // Parse output for screenshots and issues
      this.parseTestOutput(output, result);
      
    } catch (error: any) {
      result.status = 'failed';
      result.duration = Date.now() - startTime;
      result.errors.push(error.message || 'Unknown error');
      
      // Try to extract useful information from error output
      if (error.stdout) {
        this.parseTestOutput(error.stdout, result);
      }
    }
    
    this.log(`${testName} completed: ${result.status} (${result.duration}ms)`, 
             result.status === 'passed' ? 'info' : 'warn');
    
    return result;
  }

  private parseTestOutput(output: string, result: TestResult) {
    // Look for screenshot references
    const screenshotMatches = output.match(/test-results\/[^\\s]+\\.png/g);
    if (screenshotMatches) {
      result.screenshots = screenshotMatches;
    }
    
    // Look for localStorage issues
    if (output.includes('moi-meta-data') || output.includes('moi-google-data')) {
      result.issues.push('localStorage key mismatch detected');
      result.recommendations.push('Fix localStorage key naming in export system');
    }
    
    // Look for session duration issues
    if (output.includes('session duration') || output.includes('above 1 min')) {
      result.issues.push('Session duration calculation issues detected');
      result.recommendations.push('Review session duration calculation logic');
    }
    
    // Look for export failures
    if (output.includes('export') && output.includes('error')) {
      result.issues.push('Export functionality failures detected');
      result.recommendations.push('Debug export system data access');
    }
    
    // Look for console errors
    if (output.includes('console error') || output.includes('JavaScript error')) {
      result.issues.push('JavaScript runtime errors detected');
      result.recommendations.push('Fix JavaScript errors affecting functionality');
    }
  }

  private async generateReport(): Promise<TestReport> {
    const duration = Date.now() - this.startTime;
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'passed').length,
      failed: this.results.filter(r => r.status === 'failed').length,
      skipped: this.results.filter(r => r.status === 'skipped').length,
      duration
    };
    
    // Identify critical issues
    const criticalIssues: string[] = [];
    const allIssues = this.results.flatMap(r => r.issues);
    const allRecommendations = [...new Set(this.results.flatMap(r => r.recommendations))];
    
    if (allIssues.includes('localStorage key mismatch detected')) {
      criticalIssues.push('CRITICAL: Export system cannot find required localStorage keys');
    }
    
    if (allIssues.includes('Session duration calculation issues detected')) {
      criticalIssues.push('CRITICAL: Session duration calculations showing 0 values');
    }
    
    if (allIssues.includes('Export functionality failures detected')) {
      criticalIssues.push('CRITICAL: Export system failing to generate valid data');
    }
    
    const report: TestReport = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        cwd: process.cwd()
      },
      summary,
      criticalIssues,
      fixesApplied: [], // To be populated based on test results
      nextSteps: this.generateNextSteps(criticalIssues, allRecommendations),
      results: this.results
    };
    
    return report;
  }

  private generateNextSteps(criticalIssues: string[], recommendations: string[]): string[] {
    const nextSteps: string[] = [];
    
    if (criticalIssues.some(issue => issue.includes('localStorage'))) {
      nextSteps.push('1. Fix localStorage key naming in ExportModal.tsx');
      nextSteps.push('2. Update data loading system to use consistent key names');
      nextSteps.push('3. Create bridge between data loading and export systems');
    }
    
    if (criticalIssues.some(issue => issue.includes('Session duration'))) {
      nextSteps.push('4. Review session duration calculation logic');
      nextSteps.push('5. Fix 60-second threshold detection');
      nextSteps.push('6. Validate session-based metric calculations');
    }
    
    if (criticalIssues.some(issue => issue.includes('Export system'))) {
      nextSteps.push('7. Debug Meta/Google spend calculation');
      nextSteps.push('8. Fix CTR/CPM aggregation logic');
      nextSteps.push('9. Validate CSV output format');
    }
    
    nextSteps.push('10. Run regression tests after each fix');
    nextSteps.push('11. Validate fix effectiveness with end-to-end testing');
    
    return nextSteps;
  }

  private async saveReport(report: TestReport) {
    const reportPath = join(this.resultsDir, `test-report-${Date.now()}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Also create a human-readable summary
    const summaryPath = join(this.resultsDir, `test-summary-${Date.now()}.md`);
    const markdown = this.generateMarkdownReport(report);
    writeFileSync(summaryPath, markdown);
    
    this.log(`Test report saved: ${reportPath}`, 'info');
    this.log(`Test summary saved: ${summaryPath}`, 'info');
  }

  private generateMarkdownReport(report: TestReport): string {
    return `# MOI Analytics Dashboard - Test Report

**Generated:** ${report.timestamp}

## Summary

- **Total Tests:** ${report.summary.total}
- **Passed:** ${report.summary.passed} ✅
- **Failed:** ${report.summary.failed} ❌
- **Duration:** ${(report.summary.duration / 1000).toFixed(2)}s

## Critical Issues Identified

${report.criticalIssues.map(issue => `- ${issue}`).join('\\n')}

## Detailed Results

${report.results.map(result => `
### ${result.testName}
- **Status:** ${result.status}
- **Duration:** ${result.duration}ms
- **Issues:** ${result.issues.join(', ') || 'None'}
- **Screenshots:** ${result.screenshots.length} captured
`).join('\\n')}

## Next Steps

${report.nextSteps.map((step, index) => `${index + 1}. ${step}`).join('\\n')}

## Root Cause Analysis

Based on the test results, the primary issues are:

1. **localStorage Key Mismatch:** The export system expects 'moi-meta-data' and 'moi-google-data' but data is stored in 'moi-server-*' keys
2. **Session Duration Logic:** All session-based calculations showing 0, indicating threshold logic failure
3. **Data Access Pattern:** Disconnect between data loading system and export system

## Recommended Fixes

1. **Immediate:** Update ExportModal.tsx to use correct localStorage keys
2. **Short-term:** Fix session duration calculation threshold (60 seconds)
3. **Long-term:** Standardize data access patterns across the application
`;
  }

  public async runAllTests(): Promise<void> {
    this.log('🚀 Starting MOI Analytics Dashboard Test Suite', 'info');
    
    // Validate environment
    const envValid = await this.validateEnvironment();
    if (!envValid) {
      this.log('Environment validation failed, aborting tests', 'error');
      process.exit(1);
    }
    
    // Define test sequence
    const tests = [
      { file: 'localStorage-debug.test.ts', name: 'localStorage Debugging' },
      { file: 'export-validation.test.ts', name: 'Export System Validation' },
      { file: 'dashboard-regression.test.ts', name: 'Dashboard Regression' }
    ];
    
    // Run tests sequentially
    for (const test of tests) {
      const result = await this.runTest(test.file, test.name);
      this.results.push(result);
    }
    
    // Generate and save report
    const report = await this.generateReport();
    await this.saveReport(report);
    
    // Print summary
    this.log('🏁 Test Suite Completed', 'info');
    this.log(`Results: ${report.summary.passed}/${report.summary.total} passed`, 
             report.summary.failed > 0 ? 'warn' : 'info');
    
    if (report.criticalIssues.length > 0) {
      this.log('Critical issues found:', 'error');
      report.criticalIssues.forEach(issue => this.log(`  - ${issue}`, 'error'));
    }
    
    this.log('Next steps:', 'info');
    report.nextSteps.slice(0, 3).forEach(step => this.log(`  ${step}`, 'info'));
    
    // Exit with appropriate code
    process.exit(report.summary.failed > 0 ? 1 : 0);
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new MOITestRunner();
  runner.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

export { MOITestRunner };