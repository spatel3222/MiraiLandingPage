import { Page } from '@playwright/test';

/**
 * LocalStorage Helper - Debug and validate localStorage operations
 * Focuses on the disconnect between available data and export system expectations
 */
export class LocalStorageHelper {
  constructor(private page: Page) {}

  /**
   * Get all localStorage keys and values
   */
  async getAllStorageData(): Promise<Record<string, string | null>> {
    return await this.page.evaluate(() => {
      const data: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          data[key] = localStorage.getItem(key);
        }
      }
      return data;
    });
  }

  /**
   * Get localStorage keys that match a pattern
   */
  async getKeysMatching(pattern: string): Promise<string[]> {
    return await this.page.evaluate((pattern) => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(pattern)) {
          keys.push(key);
        }
      }
      return keys;
    }, pattern);
  }

  /**
   * Check if specific keys exist in localStorage
   */
  async checkKeysExist(keys: string[]): Promise<Record<string, boolean>> {
    return await this.page.evaluate((keys) => {
      const results: Record<string, boolean> = {};
      keys.forEach(key => {
        results[key] = localStorage.getItem(key) !== null;
      });
      return results;
    }, keys);
  }

  /**
   * Get the size/length of data in localStorage keys
   */
  async getDataSizes(keys: string[]): Promise<Record<string, number>> {
    return await this.page.evaluate((keys) => {
      const results: Record<string, number> = {};
      keys.forEach(key => {
        const data = localStorage.getItem(key);
        results[key] = data ? data.length : 0;
      });
      return results;
    }, keys);
  }

  /**
   * CRITICAL: Debug the specific issue with export system
   * Check what keys exist vs what the export system looks for
   */
  async debugExportSystemKeys(): Promise<{
    expectedKeys: Record<string, boolean>;
    availableKeys: string[];
    mismatchAnalysis: string[];
  }> {
    return await this.page.evaluate(() => {
      // Keys the export system looks for (from ExportModal.tsx)
      const expectedKeys = [
        'moi-meta-data',
        'moi-google-data',
        'moi-shopify-data'
      ];
      
      // Check what's actually available
      const availableKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          availableKeys.push(key);
        }
      }
      
      // Check existence of expected keys
      const expectedKeyStatus: Record<string, boolean> = {};
      expectedKeys.forEach(key => {
        expectedKeyStatus[key] = localStorage.getItem(key) !== null;
      });
      
      // Analyze mismatches
      const mismatchAnalysis: string[] = [];
      
      // Find MOI-related keys that exist
      const moiKeys = availableKeys.filter(key => key.includes('moi'));
      
      expectedKeys.forEach(expectedKey => {
        if (!expectedKeyStatus[expectedKey]) {
          // Look for similar keys
          const similarKeys = moiKeys.filter(key => 
            key.includes(expectedKey.replace('moi-', '')) ||
            (expectedKey.includes('meta') && key.includes('meta')) ||
            (expectedKey.includes('google') && key.includes('google'))
          );
          
          if (similarKeys.length > 0) {
            mismatchAnalysis.push(`Missing "${expectedKey}" but found similar: ${similarKeys.join(', ')}`);
          } else {
            mismatchAnalysis.push(`Missing "${expectedKey}" with no similar keys found`);
          }
        }
      });
      
      // Check for server-side keys that should contain data
      const serverKeys = ['moi-server-topLevel', 'moi-server-adset'];
      serverKeys.forEach(serverKey => {
        if (availableKeys.includes(serverKey)) {
          const data = localStorage.getItem(serverKey);
          if (data && data.length > 0) {
            mismatchAnalysis.push(`Found data in "${serverKey}" (${data.length} chars) - this should be accessible to export system`);
          }
        }
      });
      
      return {
        expectedKeys: expectedKeyStatus,
        availableKeys,
        mismatchAnalysis
      };
    });
  }

  /**
   * Set test data in localStorage with proper keys
   */
  async setTestData(): Promise<void> {
    await this.page.evaluate(() => {
      // Clear existing data
      localStorage.clear();
      
      // Set the correct keys that the export system expects
      const metaData = [
        {
          "Campaign name": "BOF | DPA",
          "Ad set name": "DPA - Broad",
          "Amount spent (INR)": 2500,
          "CTR (link click-through rate)": 1.45,
          "CPM (cost per 1,000 impressions)": 59.10
        },
        {
          "Campaign name": "TOF | Interest", 
          "Ad set name": "Luxury Shoppers",
          "Amount spent (INR)": 1800,
          "CTR (link click-through rate)": 1.23,
          "CPM (cost per 1,000 impressions)": 63.16
        }
      ];
      
      const googleData = [
        {
          "Campaign": "india-pmax-rings",
          "Cost": 1200,
          "CTR": "2.04%",
          "Avg. CPM": 244.90
        }
      ];
      
      // CRITICAL: Use the exact keys the export system looks for
      localStorage.setItem('moi-meta-data', JSON.stringify(metaData));
      localStorage.setItem('moi-google-data', JSON.stringify(googleData));
      
      // Also set server-side keys for dashboard loading
      const topLevelCSV = `Date,Meta Spend,Meta CTR,Meta CPM,Google Spend,Google CTR,Google CPM,Total Users,Total ATC,Total Reached Checkout,Total Abandoned Checkout,Session Duration,Users with Session above 1 min,Users with Above 5 page views and above 1 min,ATC with session duration above 1 min,Reached Checkout with session duration above 1 min
2025-09-29,4300,1.34,61.13,1200,2.04,244.90,974,6,2,0,52,234,89,4,1`;
      
      localStorage.setItem('moi-server-topLevel', topLevelCSV);
      localStorage.setItem('moi-server-topLevel-timestamp', new Date().toISOString());
      
      console.log('✅ Test data set with correct keys');
    });
  }

  /**
   * Monitor localStorage changes during test execution
   */
  async startMonitoring(): Promise<void> {
    await this.page.addInitScript(() => {
      const originalSetItem = localStorage.setItem;
      const originalRemoveItem = localStorage.removeItem;
      const originalClear = localStorage.clear;
      
      (window as any).__localStorageChanges = [];
      
      localStorage.setItem = function(key: string, value: string) {
        (window as any).__localStorageChanges.push({
          action: 'setItem',
          key,
          value: value.substring(0, 100) + (value.length > 100 ? '...' : ''),
          timestamp: new Date().toISOString()
        });
        return originalSetItem.call(this, key, value);
      };
      
      localStorage.removeItem = function(key: string) {
        (window as any).__localStorageChanges.push({
          action: 'removeItem',
          key,
          timestamp: new Date().toISOString()
        });
        return originalRemoveItem.call(this, key);
      };
      
      localStorage.clear = function() {
        (window as any).__localStorageChanges.push({
          action: 'clear',
          timestamp: new Date().toISOString()
        });
        return originalClear.call(this);
      };
    });
  }

  /**
   * Get localStorage changes that occurred during test
   */
  async getStorageChanges(): Promise<any[]> {
    return await this.page.evaluate(() => {
      return (window as any).__localStorageChanges || [];
    });
  }

  /**
   * Clear localStorage and reset to clean state
   */
  async clearStorage(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear();
    });
  }

  /**
   * Export localStorage state for debugging
   */
  async exportStorageState(): Promise<{
    keys: string[];
    data: Record<string, string | null>;
    sizes: Record<string, number>;
    timestamp: string;
  }> {
    const data = await this.getAllStorageData();
    const keys = Object.keys(data);
    const sizes: Record<string, number> = {};
    
    keys.forEach(key => {
      const value = data[key];
      sizes[key] = value ? value.length : 0;
    });
    
    return {
      keys,
      data,
      sizes,
      timestamp: new Date().toISOString()
    };
  }
}