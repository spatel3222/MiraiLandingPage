/**
 * Centralized logging utility to control verbose logging
 */

// Set to false to disable verbose logging in production
const VERBOSE_LOGGING = false;
const DEBUG_LOGGING = false;

export const logger = {
  log: (...args: any[]) => {
    if (VERBOSE_LOGGING) {
      console.log(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (DEBUG_LOGGING) {
      console.log(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (VERBOSE_LOGGING) {
      console.info(...args);
    }
  },
  
  warn: (...args: any[]) => {
    // Always show warnings
    console.warn(...args);
  },
  
  error: (...args: any[]) => {
    // Always show errors
    console.error(...args);
  },
  
  // Only log important messages
  important: (...args: any[]) => {
    console.log(...args);
  }
};

export default logger;