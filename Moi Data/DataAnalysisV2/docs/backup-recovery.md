# Backup & Recovery Best Practices

## Overview

This document outlines comprehensive backup and recovery strategies for MOI Data Analytics V2, ensuring data protection, business continuity, and disaster recovery capabilities for both uploaded data and generated reports.

## Backup Strategy

### Multi-Layer Backup Approach

#### 1. Database-Level Backup (Supabase Native)
```javascript
// Supabase automatic backups are enabled by default
// Point-in-time recovery (PITR) available for up to 7 days
// Full database snapshots taken daily

const supabaseBackupInfo = {
  automaticBackups: {
    frequency: 'daily',
    retention: '7 days (PITR)',
    fullSnapshots: '30 days'
  },
  manualBackups: {
    enabled: true,
    frequency: 'before major uploads',
    retention: 'configurable'
  }
};
```

#### 2. Application-Level Data Backup
```javascript
// lib/backup-service.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

export class BackupService {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    this.backupDir = path.join(process.cwd(), 'backups');
    this.platforms = ['meta', 'google', 'shopify'];
  }

  async createFullBackup(options = {}) {
    const {
      includeRawData = true,
      includeProcessedData = true,
      compressBackup = true,
      dateRange = null
    } = options;

    const backupId = this.generateBackupId();
    const backupPath = path.join(this.backupDir, backupId);
    
    console.log(`Creating full backup: ${backupId}`);
    
    try {
      // Ensure backup directory exists
      await fs.mkdir(backupPath, { recursive: true });
      
      const backupManifest = {
        id: backupId,
        timestamp: new Date().toISOString(),
        type: 'full_backup',
        options,
        tables: [],
        files: []
      };

      // Backup each platform table
      for (const platform of this.platforms) {
        const tableBackup = await this.backupTable(platform, backupPath, dateRange);
        backupManifest.tables.push(tableBackup);
      }

      // Backup uploaded files (if any)
      if (includeRawData) {
        const filesBackup = await this.backupUploadedFiles(backupPath);
        backupManifest.files.push(...filesBackup);
      }

      // Save manifest
      const manifestPath = path.join(backupPath, 'backup-manifest.json');
      await fs.writeFile(manifestPath, JSON.stringify(backupManifest, null, 2));

      // Compress if requested
      if (compressBackup) {
        const compressedPath = await this.compressBackup(backupPath);
        backupManifest.compressedPath = compressedPath;
      }

      console.log(`Backup completed: ${backupId}`);
      return backupManifest;

    } catch (error) {
      console.error('Backup failed:', error);
      // Cleanup failed backup
      await this.cleanupFailedBackup(backupPath);
      throw error;
    }
  }

  async backupTable(platform, backupPath, dateRange = null) {
    const tableName = `${platform}_import_data`;
    const fileName = `${tableName}.json`;
    const filePath = path.join(backupPath, fileName);

    console.log(`Backing up table: ${tableName}`);

    let query = this.supabase.from(tableName).select('*');
    
    if (dateRange) {
      query = query.gte('day', dateRange.start).lte('day', dateRange.end);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to backup ${tableName}: ${error.message}`);
    }

    // Write data to file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return {
      platform,
      tableName,
      fileName,
      rowCount: data?.length || 0,
      totalRows: count,
      dateRange: dateRange,
      backupTime: new Date().toISOString()
    };
  }

  async backupUploadedFiles(backupPath) {
    const uploadDir = path.join(process.cwd(), 'temp', 'uploads');
    const backupFiles = [];
    
    try {
      const files = await fs.readdir(uploadDir);
      
      for (const file of files) {
        const sourcePath = path.join(uploadDir, file);
        const destPath = path.join(backupPath, 'uploaded_files', file);
        
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.copyFile(sourcePath, destPath);
        
        backupFiles.push({
          originalPath: sourcePath,
          backupPath: destPath,
          fileName: file
        });
      }
    } catch (error) {
      console.warn('Upload files backup failed:', error.message);
    }

    return backupFiles;
  }

  async compressBackup(backupPath) {
    const compressedPath = `${backupPath}.tar.gz`;
    
    // This is a simplified version - in production, use proper compression
    console.log(`Compressing backup to: ${compressedPath}`);
    
    // Implementation would use tar/compression library
    // For now, just return the path
    return compressedPath;
  }

  async createIncrementalBackup(lastBackupDate) {
    console.log(`Creating incremental backup since: ${lastBackupDate}`);
    
    const backupId = this.generateBackupId('incremental');
    const changes = [];

    for (const platform of this.platforms) {
      const platformChanges = await this.getTableChanges(platform, lastBackupDate);
      changes.push(platformChanges);
    }

    return {
      id: backupId,
      type: 'incremental',
      since: lastBackupDate,
      timestamp: new Date().toISOString(),
      changes
    };
  }

  async getTableChanges(platform, since) {
    const tableName = `${platform}_import_data`;
    
    const { data, error } = await this.supabase
      .from(tableName)
      .select('*')
      .gte('created_at', since);

    if (error) {
      throw new Error(`Failed to get changes for ${tableName}: ${error.message}`);
    }

    return {
      platform,
      tableName,
      changedRows: data?.length || 0,
      data: data || []
    };
  }

  generateBackupId(type = 'full') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `backup_${type}_${timestamp}`;
  }

  async cleanupFailedBackup(backupPath) {
    try {
      await fs.rmdir(backupPath, { recursive: true });
    } catch (error) {
      console.error('Failed to cleanup failed backup:', error);
    }
  }
}
```

#### 3. Automated Backup Scheduling
```javascript
// lib/backup-scheduler.js
import cron from 'node-cron';
import { BackupService } from './backup-service';

export class BackupScheduler {
  constructor() {
    this.backupService = new BackupService();
    this.schedules = new Map();
  }

  setupAutomatedBackups() {
    // Daily full backup at 2 AM IST
    this.schedules.set('daily_full', cron.schedule('0 2 * * *', async () => {
      try {
        console.log('Starting scheduled daily backup...');
        const backup = await this.backupService.createFullBackup({
          compressBackup: true,
          includeRawData: true
        });
        
        await this.notifyBackupComplete(backup);
        await this.cleanupOldBackups();
      } catch (error) {
        console.error('Scheduled backup failed:', error);
        await this.notifyBackupFailure(error);
      }
    }, { timezone: 'Asia/Kolkata' }));

    // Incremental backup every 6 hours
    this.schedules.set('incremental', cron.schedule('0 */6 * * *', async () => {
      try {
        const lastBackup = await this.getLastBackupTime();
        if (lastBackup) {
          const incrementalBackup = await this.backupService.createIncrementalBackup(lastBackup);
          console.log('Incremental backup completed:', incrementalBackup.id);
        }
      } catch (error) {
        console.error('Incremental backup failed:', error);
      }
    }, { timezone: 'Asia/Kolkata' }));

    // Pre-upload backup (triggered manually)
    this.setupPreUploadBackup();
  }

  setupPreUploadBackup() {
    // This would be triggered before major data uploads
    // Via API call or event listener
  }

  async cleanupOldBackups() {
    const retentionDays = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`Cleaning up backups older than ${cutoffDate.toISOString()}`);
    
    // Implementation would scan backup directory and remove old files
    // Keep last N backups regardless of age for safety
  }

  async notifyBackupComplete(backup) {
    console.log('Backup completed successfully:', backup.id);
    // In production, send notifications via email/Slack/etc.
  }

  async notifyBackupFailure(error) {
    console.error('Backup failed - manual intervention required:', error);
    // In production, send urgent notifications
  }

  async getLastBackupTime() {
    // Query backup history to get last backup timestamp
    return new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(); // 6 hours ago
  }
}
```

## Recovery Procedures

### 1. Data Recovery Scenarios

#### Scenario 1: Accidental Data Deletion
```javascript
// Recovery from recent backup
export class DataRecovery {
  constructor() {
    this.backupService = new BackupService();
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  async recoverDeletedData(platform, deletedDate) {
    console.log(`Recovering ${platform} data deleted on ${deletedDate}`);
    
    // Step 1: Find the most recent backup before deletion
    const backup = await this.findBackupBeforeDate(deletedDate);
    
    if (!backup) {
      throw new Error('No suitable backup found for recovery');
    }

    // Step 2: Extract data from backup
    const recoveryData = await this.extractDataFromBackup(backup, platform);
    
    // Step 3: Validate recovery data
    const validation = await this.validateRecoveryData(recoveryData, platform);
    
    if (!validation.isValid) {
      throw new Error(`Recovery data validation failed: ${validation.errors.join(', ')}`);
    }

    // Step 4: Restore data with conflict resolution
    const restoreResult = await this.restoreDataWithConflictResolution(platform, recoveryData);
    
    return {
      platform,
      recoveredRows: restoreResult.restoredRows,
      conflicts: restoreResult.conflicts,
      backupUsed: backup.id,
      recoveryTime: new Date().toISOString()
    };
  }

  async recoverFromPointInTime(platform, targetDateTime) {
    console.log(`Point-in-time recovery for ${platform} to ${targetDateTime}`);
    
    // Use Supabase PITR if within 7 days
    const timeDiff = Date.now() - new Date(targetDateTime).getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    
    if (timeDiff < sevenDaysMs) {
      return await this.supabasePointInTimeRecover(platform, targetDateTime);
    } else {
      return await this.backupPointInTimeRecover(platform, targetDateTime);
    }
  }

  async supabasePointInTimeRecover(platform, targetDateTime) {
    // This would use Supabase's built-in PITR functionality
    // Implementation depends on Supabase API capabilities
    console.log(`Using Supabase PITR for ${platform} to ${targetDateTime}`);
    
    return {
      method: 'supabase_pitr',
      platform,
      targetDateTime,
      status: 'completed'
    };
  }

  async backupPointInTimeRecover(platform, targetDateTime) {
    // Recover from historical backups + incremental changes
    const baseBackup = await this.findBackupBeforeDate(targetDateTime);
    const incrementalChanges = await this.getIncrementalChangesUntil(targetDateTime);
    
    // Apply base backup + incremental changes
    const recoveredData = await this.applyIncrementalChanges(baseBackup, incrementalChanges);
    
    return recoveredData;
  }
}
```

#### Scenario 2: Database Corruption
```javascript
// Complete database restore from backup
async function restoreFromCompleteBackup(backupId) {
  console.log(`Restoring complete database from backup: ${backupId}`);
  
  const recovery = new DataRecovery();
  const results = [];
  
  // Restore each platform sequentially
  for (const platform of ['meta', 'google', 'shopify']) {
    try {
      console.log(`Restoring ${platform} data...`);
      
      // Clear existing data (if corruption scenario)
      await recovery.clearCorruptedData(platform);
      
      // Restore from backup
      const result = await recovery.restoreFromBackup(backupId, platform);
      results.push(result);
      
      console.log(`${platform} restoration completed: ${result.restoredRows} rows`);
    } catch (error) {
      console.error(`Failed to restore ${platform}:`, error);
      results.push({ platform, error: error.message, status: 'failed' });
    }
  }
  
  return {
    backupId,
    restorationTime: new Date().toISOString(),
    results,
    overallSuccess: results.every(r => r.status !== 'failed')
  };
}
```

### 2. Validation and Testing

#### Recovery Testing Framework
```javascript
// lib/recovery-testing.js
export class RecoveryTester {
  constructor() {
    this.testEnvironment = process.env.NODE_ENV === 'test';
  }

  async testBackupIntegrity(backupId) {
    console.log(`Testing backup integrity: ${backupId}`);
    
    const tests = [
      this.testBackupCompleteness,
      this.testDataConsistency,
      this.testRecoveryProcedure
    ];

    const results = [];
    
    for (const test of tests) {
      try {
        const result = await test(backupId);
        results.push({ test: test.name, status: 'passed', ...result });
      } catch (error) {
        results.push({ test: test.name, status: 'failed', error: error.message });
      }
    }

    return {
      backupId,
      testTime: new Date().toISOString(),
      overallStatus: results.every(r => r.status === 'passed') ? 'passed' : 'failed',
      results
    };
  }

  async testBackupCompleteness(backupId) {
    // Verify all expected tables and data are present in backup
    const expectedTables = ['meta_import_data', 'google_import_data', 'shopify_import_data'];
    const backup = await this.loadBackup(backupId);
    
    const missingTables = expectedTables.filter(table => !backup.tables.find(t => t.tableName === table));
    
    if (missingTables.length > 0) {
      throw new Error(`Missing tables in backup: ${missingTables.join(', ')}`);
    }

    return { tablesCount: backup.tables.length, expectedTables: expectedTables.length };
  }

  async testDataConsistency(backupId) {
    // Verify data integrity and consistency within backup
    const backup = await this.loadBackup(backupId);
    const consistencyErrors = [];

    for (const table of backup.tables) {
      // Check for required fields
      const data = await this.loadTableData(backup, table.tableName);
      
      if (data.length === 0) continue;
      
      const requiredFields = this.getRequiredFields(table.tableName);
      const sampleRow = data[0];
      
      const missingFields = requiredFields.filter(field => !(field in sampleRow));
      if (missingFields.length > 0) {
        consistencyErrors.push(`${table.tableName}: Missing fields ${missingFields.join(', ')}`);
      }
    }

    if (consistencyErrors.length > 0) {
      throw new Error(`Data consistency errors: ${consistencyErrors.join('; ')}`);
    }

    return { tablesChecked: backup.tables.length };
  }

  async testRecoveryProcedure(backupId) {
    if (!this.testEnvironment) {
      throw new Error('Recovery testing can only be performed in test environment');
    }

    // Perform actual recovery test on test database
    const recovery = new DataRecovery();
    const testResult = await recovery.recoverDeletedData('meta', new Date().toISOString());
    
    return { recoveredRows: testResult.recoveredRows };
  }

  getRequiredFields(tableName) {
    const fieldMap = {
      'meta_import_data': ['day', 'campaign_name', 'ad_set_name', 'ad_name'],
      'google_import_data': ['day', 'campaign'],
      'shopify_import_data': ['day', 'utm_campaign', 'online_store_visitors']
    };
    return fieldMap[tableName] || [];
  }
}
```

## Disaster Recovery Plan

### 1. Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO)

#### Service Level Targets
```javascript
const recoveryObjectives = {
  criticalData: {
    rto: '2 hours',    // Maximum acceptable downtime
    rpo: '1 hour',     // Maximum acceptable data loss
    priority: 'highest'
  },
  historicalData: {
    rto: '24 hours',   // Less critical historical data
    rpo: '24 hours',   // Daily backup acceptable
    priority: 'medium'
  },
  reportOutputs: {
    rto: '4 hours',    // Can be regenerated from source data
    rpo: '24 hours',   // Daily backup sufficient
    priority: 'low'
  }
};
```

### 2. Emergency Response Procedures

#### Disaster Detection and Response
```javascript
// lib/disaster-response.js
export class DisasterResponse {
  constructor() {
    this.alertThresholds = {
      dataLoss: 0.01,        // 1% data loss triggers alert
      performanceDeg: 0.5,   // 50% performance degradation
      uptimeTarget: 0.99     // 99% uptime requirement
    };
  }

  async detectAndRespond() {
    const healthCheck = await this.performHealthCheck();
    
    if (healthCheck.criticalIssues.length > 0) {
      await this.initiateDisasterResponse(healthCheck);
    }
    
    return healthCheck;
  }

  async performHealthCheck() {
    const checks = await Promise.all([
      this.checkDatabaseConnectivity(),
      this.checkDataIntegrity(),
      this.checkBackupStatus(),
      this.checkSystemPerformance()
    ]);

    const criticalIssues = checks.filter(check => check.status === 'critical');
    const warnings = checks.filter(check => check.status === 'warning');

    return {
      timestamp: new Date().toISOString(),
      overallStatus: criticalIssues.length > 0 ? 'critical' : warnings.length > 0 ? 'warning' : 'healthy',
      criticalIssues,
      warnings,
      checks
    };
  }

  async initiateDisasterResponse(healthCheck) {
    console.log('DISASTER RESPONSE INITIATED');
    console.log('Critical issues detected:', healthCheck.criticalIssues);

    const responseActions = [
      this.notifyEmergencyContacts,
      this.activateBackupSystems,
      this.beginDataRecovery,
      this.communicateWithStakeholders
    ];

    for (const action of responseActions) {
      try {
        await action(healthCheck);
      } catch (error) {
        console.error(`Disaster response action failed: ${action.name}`, error);
      }
    }
  }

  async notifyEmergencyContacts(healthCheck) {
    const emergencyContacts = [
      { name: 'System Administrator', email: 'admin@moi.com', priority: 'immediate' },
      { name: 'Data Team Lead', email: 'data-lead@moi.com', priority: 'immediate' },
      { name: 'Business Stakeholders', email: 'stakeholders@moi.com', priority: 'within_1_hour' }
    ];

    for (const contact of emergencyContacts) {
      if (contact.priority === 'immediate') {
        await this.sendEmergencyAlert(contact, healthCheck);
      }
    }
  }

  async activateBackupSystems(healthCheck) {
    // Switch to backup data sources if primary is unavailable
    console.log('Activating backup systems...');
    
    // This would typically involve:
    // - Switching to backup database instance
    // - Activating read-only mode if writes are affected
    // - Routing traffic to backup servers
  }

  async beginDataRecovery(healthCheck) {
    const recovery = new DataRecovery();
    
    // Prioritize recovery based on criticality
    const recoveryPlan = this.createRecoveryPlan(healthCheck);
    
    for (const step of recoveryPlan) {
      try {
        await this.executeRecoveryStep(step, recovery);
      } catch (error) {
        console.error(`Recovery step failed: ${step.description}`, error);
      }
    }
  }

  createRecoveryPlan(healthCheck) {
    const plan = [];
    
    // High priority: Core data tables
    if (healthCheck.criticalIssues.some(issue => issue.component === 'database')) {
      plan.push({
        priority: 1,
        description: 'Restore critical data tables',
        action: 'restore_core_tables',
        estimatedTime: '30 minutes'
      });
    }

    // Medium priority: Historical data
    plan.push({
      priority: 2,
      description: 'Restore historical data',
      action: 'restore_historical_data',
      estimatedTime: '2 hours'
    });

    return plan.sort((a, b) => a.priority - b.priority);
  }
}
```

## Backup Monitoring and Alerting

### 1. Backup Health Monitoring
```javascript
// lib/backup-monitoring.js
export class BackupMonitor {
  constructor() {
    this.metrics = {
      lastBackupTime: null,
      backupSizeGrowth: [],
      failureRate: 0,
      recoveryTestResults: []
    };
  }

  async monitorBackupHealth() {
    const healthMetrics = {
      lastBackupAge: await this.getLastBackupAge(),
      backupSizeAlert: await this.checkBackupSize(),
      integrityStatus: await this.checkBackupIntegrity(),
      storageCapacity: await this.checkStorageCapacity()
    };

    const alerts = this.generateAlerts(healthMetrics);
    
    if (alerts.length > 0) {
      await this.sendBackupAlerts(alerts);
    }

    return { healthMetrics, alerts };
  }

  async getLastBackupAge() {
    // Check when the last backup was created
    const lastBackup = await this.getLatestBackup();
    
    if (!lastBackup) {
      return { status: 'critical', message: 'No backups found' };
    }

    const ageHours = (Date.now() - new Date(lastBackup.timestamp).getTime()) / (1000 * 60 * 60);
    
    if (ageHours > 48) {
      return { status: 'critical', ageHours, message: 'Backup is over 48 hours old' };
    } else if (ageHours > 26) {
      return { status: 'warning', ageHours, message: 'Backup is over 26 hours old' };
    }
    
    return { status: 'healthy', ageHours, message: 'Backup is recent' };
  }

  generateAlerts(healthMetrics) {
    const alerts = [];
    
    if (healthMetrics.lastBackupAge.status === 'critical') {
      alerts.push({
        severity: 'critical',
        component: 'backup_schedule',
        message: healthMetrics.lastBackupAge.message
      });
    }

    if (healthMetrics.storageCapacity.usage > 0.9) {
      alerts.push({
        severity: 'warning',
        component: 'storage',
        message: `Backup storage is ${(healthMetrics.storageCapacity.usage * 100).toFixed(1)}% full`
      });
    }

    return alerts;
  }
}
```

### 2. Recovery Testing Schedule
```javascript
// Automated recovery testing
const recoveryTestSchedule = {
  monthly: {
    description: 'Full recovery test on test environment',
    frequency: 'first Sunday of each month',
    scope: 'complete database restore',
    acceptanceCriteria: '100% data recovery with <1% variance'
  },
  
  weekly: {
    description: 'Backup integrity verification',
    frequency: 'every Sunday',
    scope: 'backup file integrity and accessibility',
    acceptanceCriteria: 'all backup files readable and complete'
  },
  
  daily: {
    description: 'Backup completion verification',
    frequency: 'daily after backup completion',
    scope: 'verify backup created successfully',
    acceptanceCriteria: 'backup file exists and contains expected data volume'
  }
};
```

## Data Retention Policies

### 1. Retention Schedule
```javascript
const retentionPolicies = {
  backups: {
    daily: '30 days',
    weekly: '12 weeks', 
    monthly: '12 months',
    yearly: '7 years'
  },
  
  rawData: {
    uploadedFiles: '90 days',
    processedData: 'indefinite',
    temporaryFiles: '7 days'
  },
  
  reports: {
    generatedReports: '2 years',
    reportCache: '30 days',
    errorLogs: '6 months'
  },
  
  auditLogs: {
    dataAccess: '2 years',
    systemChanges: '7 years',
    backupOperations: '1 year'
  }
};
```

### 2. Automated Cleanup
```javascript
// lib/data-cleanup.js
export class DataCleanup {
  constructor() {
    this.retentionPolicies = retentionPolicies;
  }

  async performScheduledCleanup() {
    console.log('Starting scheduled data cleanup...');
    
    const cleanupResults = {
      backupsRemoved: await this.cleanupOldBackups(),
      tempFilesRemoved: await this.cleanupTemporaryFiles(),
      reportCacheCleared: await this.cleanupReportCache(),
      logsArchived: await this.archiveOldLogs()
    };

    console.log('Cleanup completed:', cleanupResults);
    return cleanupResults;
  }

  async cleanupOldBackups() {
    const cutoffDates = {
      daily: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      weekly: new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000),
      monthly: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000)
    };

    let removedCount = 0;
    
    // Implementation would scan backup directories and remove old files
    // based on retention policies
    
    return removedCount;
  }
}
```

## Security Considerations

### 1. Backup Encryption
```javascript
// Encrypt sensitive backups
const backupEncryption = {
  algorithm: 'AES-256-GCM',
  keyManagement: 'environment_variables',
  encryptionScope: ['PII_data', 'financial_data', 'sensitive_campaigns']
};
```

### 2. Access Control
```javascript
// Backup access permissions
const backupAccessControl = {
  admins: ['full_backup_access', 'recovery_operations'],
  dataTeam: ['read_backup_status', 'initiate_recovery'],
  users: ['download_own_reports']
};
```

### 3. Audit Trail
```javascript
// Log all backup and recovery operations
const auditRequirements = {
  backupOperations: ['timestamp', 'user', 'operation_type', 'data_scope'],
  recoveryOperations: ['timestamp', 'user', 'recovery_reason', 'data_restored'],
  accessAttempts: ['timestamp', 'user', 'resource_accessed', 'success_status']
};
```

---

*Backup & Recovery Plan Version: 1.0*  
*Last Updated: November 11, 2025*  
*Next Review: After Phase 1 Implementation*