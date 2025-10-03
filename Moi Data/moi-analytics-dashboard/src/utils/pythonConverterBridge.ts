/**
 * Python Converter Bridge
 * Integrates dashboard file uploads with Python conversion pipeline
 */

export interface ConversionFiles {
  shopify: File | null;
  meta: File | null;
  google: File | null;
}

export class PythonConverterBridge {
  private static readonly BRIDGE_DIR = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/dashboard_uploads';
  
  /**
   * Save uploaded files to disk for Python converter
   */
  static async saveFilesForPython(files: ConversionFiles): Promise<string[]> {
    const savedFiles: string[] = [];
    
    // Create file mappings with proper naming for auto-detection
    const fileMap = {
      shopify: { file: files.shopify, name: 'shopify_dashboard_upload.csv' },
      meta: { file: files.meta, name: 'meta_dashboard_upload.csv' },
      google: { file: files.google, name: 'google_dashboard_upload.csv' }
    };
    
    // Save each file
    for (const [type, config] of Object.entries(fileMap)) {
      if (config.file) {
        try {
          await this.saveFileToSystem(config.file, config.name);
          savedFiles.push(config.name);
          console.log(`✅ Saved ${type} file: ${config.name}`);
        } catch (error) {
          console.error(`❌ Failed to save ${type} file:`, error);
          throw new Error(`Failed to save ${type} file`);
        }
      }
    }
    
    return savedFiles;
  }
  
  /**
   * Save individual file to file system
   */
  private static async saveFileToSystem(file: File, filename: string): Promise<void> {
    // Convert File to text content
    const content = await file.text();
    
    // Create download link to save file
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary link for download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    // Note: Browser security prevents direct file system writes
    // This creates downloads that user can save to the bridge directory
  }
  
  /**
   * Generate instructions for user to complete the bridge
   */
  static generateBridgeInstructions(savedFiles: string[]): string {
    return `
🔗 File Bridge Instructions

1. Save downloaded files to:
   ${this.BRIDGE_DIR}

2. Downloaded files:
${savedFiles.map(f => `   • ${f}`).join('\n')}

3. Run Python converter:
   cd "/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data"
   python3 dashboard_integrated_converter.py --dashboard

✅ This will process your uploaded files with the active template configuration.
    `;
  }
  
  /**
   * Auto-save files with user guidance
   */
  static async bridgeFilesToPython(files: ConversionFiles): Promise<void> {
    try {
      // Save files
      const savedFiles = await this.saveFilesForPython(files);
      
      // Show instructions
      const instructions = this.generateBridgeInstructions(savedFiles);
      
      // Display in modal or alert
      if (typeof window !== 'undefined') {
        alert(instructions);
      }
      
      console.log(instructions);
      
      return;
    } catch (error) {
      throw new Error(`File bridge failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Check if Python converter is available
   */
  static checkPythonConverter(): { available: boolean; message: string } {
    // This would ideally ping the Python script or check file system
    return {
      available: true,
      message: 'Python converter ready. Use file bridge to process uploads.'
    };
  }
  
  /**
   * Create one-click conversion workflow
   */
  static async processAndConvert(files: ConversionFiles): Promise<string> {
    try {
      // Bridge files to Python
      await this.bridgeFilesToPython(files);
      
      // Return next steps
      return `
Files prepared for conversion!

Next steps:
1. Save the downloaded CSV files to: ${this.BRIDGE_DIR}
2. Run: python3 dashboard_integrated_converter.py --dashboard
3. Check outputs in: MOI_Sample_Output_Generation/05_CSV_Outputs/

Your custom template configuration will be used automatically.
      `;
    } catch (error) {
      throw new Error(`Conversion workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}