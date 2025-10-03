import { Page } from '@playwright/test';

export interface ConsoleEvent {
  type: string;
  text: string;
  location?: {
    url: string;
    lineNumber: number;
    columnNumber: number;
  };
  timestamp: Date;
}

export interface PageError {
  message: string;
  stack?: string;
  timestamp: Date;
}

/**
 * Console Monitor - Comprehensive console and error tracking
 * CRITICAL: Captures JavaScript errors that cause silent feature failures
 */
export class ConsoleMonitor {
  private consoleEvents: ConsoleEvent[] = [];
  private pageErrors: PageError[] = [];
  private isMonitoring = false;

  constructor(private page: Page) {}

  /**
   * Start monitoring console logs and page errors
   * MUST be called before navigating to any page
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    console.log('🔍 Starting console monitoring...');
    
    // Monitor console messages
    this.page.on('console', (msg) => {
      const event: ConsoleEvent = {
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
        timestamp: new Date()
      };
      
      this.consoleEvents.push(event);
      
      // Log errors immediately for debugging
      if (msg.type() === 'error') {
        console.log(`❌ CONSOLE ERROR: ${msg.text()}`);
        if (msg.location()) {
          console.log(`   Location: ${msg.location().url}:${msg.location().lineNumber}:${msg.location().columnNumber}`);
        }
      }
      
      // Log warnings for performance issues
      if (msg.type() === 'warning') {
        console.log(`⚠️ CONSOLE WARNING: ${msg.text()}`);
      }
    });

    // Monitor page errors (JavaScript runtime errors)
    this.page.on('pageerror', (error) => {
      const pageError: PageError = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date()
      };
      
      this.pageErrors.push(pageError);
      console.log(`💥 PAGE ERROR: ${error.message}`);
      if (error.stack) {
        console.log(`   Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
      }
    });

    // Monitor unhandled promise rejections
    this.page.on('requestfailed', (request) => {
      console.log(`🌐 REQUEST FAILED: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    this.isMonitoring = true;
  }

  /**
   * Stop monitoring and clear events
   */
  stopMonitoring() {
    this.page.removeAllListeners('console');
    this.page.removeAllListeners('pageerror');
    this.page.removeAllListeners('requestfailed');
    this.isMonitoring = false;
    console.log('🛑 Stopped console monitoring');
  }

  /**
   * Get all console events
   */
  getConsoleEvents(): ConsoleEvent[] {
    return [...this.consoleEvents];
  }

  /**
   * Get console errors only
   */
  getConsoleErrors(): ConsoleEvent[] {
    return this.consoleEvents.filter(event => event.type === 'error');
  }

  /**
   * Get console warnings only
   */
  getConsoleWarnings(): ConsoleEvent[] {
    return this.consoleEvents.filter(event => event.type === 'warning');
  }

  /**
   * Get page errors
   */
  getPageErrors(): PageError[] {
    return [...this.pageErrors];
  }

  /**
   * Get all errors (console + page)
   */
  getAllErrors(): (ConsoleEvent | PageError)[] {
    return [
      ...this.getConsoleErrors(),
      ...this.pageErrors
    ];
  }

  /**
   * Check if any errors occurred
   */
  hasErrors(): boolean {
    return this.getConsoleErrors().length > 0 || this.pageErrors.length > 0;
  }

  /**
   * Get error summary for reporting
   */
  getErrorSummary(): string {
    const consoleErrors = this.getConsoleErrors();
    const pageErrors = this.getPageErrors();
    
    if (!this.hasErrors()) {
      return '✅ No errors detected';
    }
    
    let summary = '❌ Errors detected:\n';
    
    if (consoleErrors.length > 0) {
      summary += `\nConsole Errors (${consoleErrors.length}):\n`;
      consoleErrors.forEach((error, index) => {
        summary += `  ${index + 1}. ${error.text}\n`;
        if (error.location) {
          summary += `     at ${error.location.url}:${error.location.lineNumber}\n`;
        }
      });
    }
    
    if (pageErrors.length > 0) {
      summary += `\nPage Errors (${pageErrors.length}):\n`;
      pageErrors.forEach((error, index) => {
        summary += `  ${index + 1}. ${error.message}\n`;
      });
    }
    
    return summary;
  }

  /**
   * Clear all collected events
   */
  clearEvents() {
    this.consoleEvents = [];
    this.pageErrors = [];
    console.log('🧹 Cleared console monitoring events');
  }

  /**
   * Export events to JSON for debugging
   */
  exportEvents() {
    return {
      consoleEvents: this.consoleEvents,
      pageErrors: this.pageErrors,
      summary: this.getErrorSummary(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Filter events by time range
   */
  getEventsSince(startTime: Date): ConsoleEvent[] {
    return this.consoleEvents.filter(event => event.timestamp >= startTime);
  }

  /**
   * Check for localStorage-related errors specifically
   */
  getLocalStorageErrors(): ConsoleEvent[] {
    return this.consoleEvents.filter(event => 
      event.type === 'error' && 
      (event.text.toLowerCase().includes('localstorage') ||
       event.text.toLowerCase().includes('storage') ||
       event.text.toLowerCase().includes('moi-'))
    );
  }

  /**
   * Check for export-related errors specifically
   */
  getExportErrors(): ConsoleEvent[] {
    return this.consoleEvents.filter(event => 
      event.type === 'error' && 
      (event.text.toLowerCase().includes('export') ||
       event.text.toLowerCase().includes('download') ||
       event.text.toLowerCase().includes('csv') ||
       event.text.toLowerCase().includes('meta') ||
       event.text.toLowerCase().includes('google'))
    );
  }
}