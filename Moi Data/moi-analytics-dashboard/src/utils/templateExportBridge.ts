/**
 * Template Export Bridge
 * Bridges dashboard template configuration with Python conversion logic
 */

import { LogicTemplateManager } from '../services/logicTemplateManager';
import type { LogicConfiguration } from '../types/logicConfiguration';

export class TemplateExportBridge {
  private static readonly EXPORT_PATH = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/temp_dashboard_config.json';

  /**
   * Export current dashboard template configuration for Python converter
   */
  static async exportConfigurationForPython(): Promise<void> {
    const config = LogicTemplateManager.getCurrentConfiguration();
    
    const exportData = {
      templateRows: config.templateRows,
      isActive: config.isActive,
      lastModified: config.lastModified.toISOString(),
      exportedAt: new Date().toISOString(),
      source: config.isActive ? 'dashboard_custom' : 'dashboard_default',
      fieldCount: config.templateRows.length
    };

    // Create downloadable file for user to place in correct location
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'temp_dashboard_config.json';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show instructions
    this.showExportInstructions();
  }

  /**
   * Show user instructions for using exported config
   */
  private static showExportInstructions(): void {
    const instructions = `
Template Configuration Exported!

To use this template with the Python converter:

1. Save the downloaded 'temp_dashboard_config.json' file to:
   /Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/

2. Run the dashboard-integrated converter:
   python3 dashboard_integrated_converter.py

The converter will automatically:
✅ Use your custom template if active
✅ Fall back to default template if none uploaded
✅ Generate outputs matching your template configuration

File location: ${this.EXPORT_PATH}
    `;

    // Create modal or notification
    if (typeof window !== 'undefined') {
      alert(instructions);
    }
    
    console.log(instructions);
  }

  /**
   * Auto-export configuration on template changes
   */
  static enableAutoExport(): void {
    // Listen for localStorage changes to auto-export when templates are updated
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'moi-logic-template') {
          console.log('🔄 Template configuration changed, auto-exporting...');
          this.exportConfigurationForPython();
        }
      });
    }
  }

  /**
   * Check if Python converter integration is available
   */
  static checkPythonIntegration(): {
    available: boolean;
    message: string;
    instructions?: string;
  } {
    // This would be expanded to actually check if the Python script exists
    return {
      available: true,
      message: 'Dashboard-integrated Python converter is available',
      instructions: 'Use "Export for Python Converter" to sync your template configuration'
    };
  }

  /**
   * Manual sync button for dashboard UI
   */
  static createSyncButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = '🔄 Export for Python Converter';
    button.className = 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors';
    button.onclick = () => this.exportConfigurationForPython();
    return button;
  }

  /**
   * Get current template status for display
   */
  static getTemplateStatus(): {
    source: string;
    isActive: boolean;
    fieldCount: number;
    lastModified: string;
    canExport: boolean;
  } {
    const config = LogicTemplateManager.getCurrentConfiguration();
    
    return {
      source: config.isActive ? 'Custom Upload' : 'Default Template',
      isActive: config.isActive,
      fieldCount: config.templateRows.length,
      lastModified: config.lastModified.toLocaleDateString(),
      canExport: true
    };
  }
}

// Auto-enable export on module load in browser environment
if (typeof window !== 'undefined') {
  // Enable auto-export when templates change
  TemplateExportBridge.enableAutoExport();
}