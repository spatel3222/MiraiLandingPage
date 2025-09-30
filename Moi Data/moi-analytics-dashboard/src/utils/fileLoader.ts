import { parseTopLevelCSV, parseAdsetCSV, processOutputFiles } from './outputDataProcessor';
import type { DashboardData } from '../types';

// Define possible file paths for the output files
const OUTPUT_FILE_PATHS = [
  // MOI Sample Output Generation folder
  '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/MOI_Sample_Output_Generation/05_CSV_Outputs/',
  // MOI Data Schema Analysis folder  
  '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/MOI_Data_Schema_Analysis/05_CSV_Outputs/',
  // Original Data Output Example folder
  '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/MOI Original Data/Output Example/'
];

const TOP_LEVEL_FILENAMES = [
  'AI Generated - Top Level Daily Metrics_Complete.csv',
  'AI Generated -  Top Level Daily Metrics.csv',
  'Top Level Daily Metrics.csv',
  'Top_Level_Daily_Metrics_Full.csv'
];

const ADSET_FILENAMES = [
  'AI Generated - Adset Level Matrices.csv', 
  'Adset_Level_Matrices_Template.csv',
  'Adset Level Matrices.csv'
];

export const loadExistingOutputFiles = async (): Promise<DashboardData | null> => {
  try {
    // Try to load files from various possible locations
    const topLevelData = await loadTopLevelFile();
    const adsetData = await loadAdsetFile();
    
    if (topLevelData && adsetData) {
      console.log('Found existing output files, processing data...');
      return processOutputFiles(topLevelData, adsetData);
    } else if (topLevelData) {
      console.log('Found top-level file only, using sample adset data...');
      // Use sample adset data if only top-level is found
      const sampleAdsetData = [{
        date: "Sample",
        campaignName: "BOF | DPA", 
        campaignId: "123456",
        adsetName: "DPA - Broad",
        adsetId: "789012",
        platform: "Meta",
        spend: 2500,
        impressions: 42300,
        ctr: 1.45,
        cpm: 59.10,
        cpc: 4.08,
        users: 500,
        atc: 3,
        reachedCheckout: 1,
        purchases: 0,
        revenue: 0,
        roas: 0.00
      }];
      return processOutputFiles(topLevelData, sampleAdsetData);
    }
    
    return null;
  } catch (error) {
    console.log('No existing output files found or error loading them:', error);
    return null;
  }
};

const loadTopLevelFile = async () => {
  // Try different file paths and names
  for (const basePath of OUTPUT_FILE_PATHS) {
    for (const filename of TOP_LEVEL_FILENAMES) {
      try {
        const response = await fetch(`${basePath}${filename}`);
        if (response.ok) {
          const csvContent = await response.text();
          console.log(`Loaded top-level file: ${basePath}${filename}`);
          return parseTopLevelCSV(csvContent);
        }
      } catch (error) {
        // Continue to next file
        continue;
      }
    }
  }
  
  // If no files found via fetch, try using the File System API (if available)
  try {
    const fileContent = await loadFileFromLocalSystem('top-level');
    if (fileContent) {
      return parseTopLevelCSV(fileContent);
    }
  } catch (error) {
    // File system access not available
  }
  
  return null;
};

const loadAdsetFile = async () => {
  // Try different file paths and names
  for (const basePath of OUTPUT_FILE_PATHS) {
    for (const filename of ADSET_FILENAMES) {
      try {
        const response = await fetch(`${basePath}${filename}`);
        if (response.ok) {
          const csvContent = await response.text();
          console.log(`Loaded adset file: ${basePath}${filename}`);
          return parseAdsetCSV(csvContent);
        }
      } catch (error) {
        // Continue to next file
        continue;
      }
    }
  }
  
  // If no files found via fetch, try using the File System API (if available)
  try {
    const fileContent = await loadFileFromLocalSystem('adset');
    if (fileContent) {
      return parseAdsetCSV(fileContent);
    }
  } catch (error) {
    // File system access not available
  }
  
  return null;
};

const loadFileFromLocalSystem = async (fileType: 'top-level' | 'adset'): Promise<string | null> => {
  // This would require File System API or electron integration
  // For now, return null as browsers have limited file system access
  return null;
};

// Alternative: Load from localStorage if previously cached
export const loadCachedOutputData = (): DashboardData | null => {
  try {
    const cachedData = localStorage.getItem('moi-output-data');
    const cachedTimestamp = localStorage.getItem('moi-output-timestamp');
    
    if (cachedData && cachedTimestamp) {
      // Check if cache is less than 24 hours old
      const cacheAge = Date.now() - new Date(cachedTimestamp).getTime();
      if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours
        console.log('Loading cached output data');
        return JSON.parse(cachedData);
      }
    }
    
    return null;
  } catch (error) {
    console.log('Error loading cached data:', error);
    return null;
  }
};

// Cache output data for quick access
export const cacheOutputData = (data: DashboardData) => {
  try {
    localStorage.setItem('moi-output-data', JSON.stringify(data));
    localStorage.setItem('moi-output-timestamp', new Date().toISOString());
    console.log('Cached output data for future use');
  } catch (error) {
    console.log('Error caching data:', error);
  }
};

// Check if output files exist and are recent
export const checkForRecentOutputFiles = (): { hasFiles: boolean; lastModified?: string } => {
  try {
    const timestamp = localStorage.getItem('moi-output-timestamp');
    if (timestamp) {
      const age = Date.now() - new Date(timestamp).getTime();
      if (age < 24 * 60 * 60 * 1000) { // Less than 24 hours
        return {
          hasFiles: true,
          lastModified: new Date(timestamp).toLocaleString()
        };
      }
    }
    
    return { hasFiles: false };
  } catch (error) {
    return { hasFiles: false };
  }
};