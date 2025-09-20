const { test, expect } = require('@playwright/test');

test.describe('Debug CSV Validation', () => {
    test('test validation of icd_all_processes_complete.csv', async ({ page }) => {
        console.log('🔍 Testing CSV validation for icd_all_processes_complete.csv...');
        
        // Navigate to dashboard
        await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Read the actual CSV file
        const fs = require('fs');
        const csvContent = fs.readFileSync('/Users/shivangpatel/Documents/GitHub/crtx.in/icd_all_processes_complete.csv', 'utf8');
        
        console.log('📄 CSV file first 500 characters:');
        console.log(csvContent.substring(0, 500));
        
        // Test CSV parsing and validation
        const validationResult = await page.evaluate((csvData) => {
            // Test if Papa Parse is available
            if (typeof Papa === 'undefined') {
                return { error: 'Papa Parse library not available' };
            }
            
            try {
                // Parse the CSV
                const parseResult = Papa.parse(csvData, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: false // Keep as strings to match real upload behavior
                });
                
                if (parseResult.errors && parseResult.errors.length > 0) {
                    return { 
                        parseErrors: parseResult.errors,
                        success: false 
                    };
                }
                
                const data = parseResult.data;
                console.log('📊 Parsed', data.length, 'rows');
                console.log('📋 First row fields:', Object.keys(data[0] || {}));
                console.log('📋 First row data:', data[0]);
                
                // Simulate the validation logic
                const validationErrors = [];
                const requiredFields = ['Process Name', 'Department', 'Time Spent', 'Repetitive Score', 'Data-Driven Score', 'Rule-Based Score', 'High Volume Score', 'Impact Score', 'Feasibility Score'];
                
                data.forEach((row, index) => {
                    const rowNumber = index + 2; // +2 because index starts at 0 and CSV has header
                    
                    // Check required fields
                    requiredFields.forEach(field => {
                        if (!row[field] || row[field].toString().trim() === '') {
                            validationErrors.push({
                                row: rowNumber,
                                field: field,
                                message: `Missing required field: ${field}`,
                                actualValue: row[field]
                            });
                        }
                    });
                    
                    // Validate scores (1-10)
                    const scoreFields = ['Repetitive Score', 'Data-Driven Score', 'Rule-Based Score', 'High Volume Score', 'Impact Score', 'Feasibility Score'];
                    scoreFields.forEach(field => {
                        const value = parseFloat(row[field]);
                        if (isNaN(value) || value < 1 || value > 10) {
                            validationErrors.push({
                                row: rowNumber,
                                field: field,
                                message: `${field} must be a number between 1 and 10`,
                                actualValue: row[field],
                                parsedValue: value
                            });
                        }
                    });
                    
                    // Validate time spent
                    const timeSpent = parseFloat(row['Time Spent']);
                    if (isNaN(timeSpent) || timeSpent <= 0) {
                        validationErrors.push({
                            row: rowNumber,
                            field: 'Time Spent',
                            message: 'Time Spent must be a positive number',
                            actualValue: row['Time Spent'],
                            parsedValue: timeSpent
                        });
                    }
                    
                    // Validate department
                    if (row['Department'] === 'Custom' && (!row['Custom Department'] || row['Custom Department'].trim() === '')) {
                        validationErrors.push({
                            row: rowNumber,
                            field: 'Custom Department',
                            message: 'Custom Department must be specified when Department is "Custom"',
                            actualValue: row['Custom Department']
                        });
                    }
                });
                
                return {
                    success: true,
                    rowCount: data.length,
                    fields: Object.keys(data[0] || {}),
                    sampleRow: data[0],
                    validationErrors: validationErrors,
                    errorCount: validationErrors.length,
                    firstFewErrors: validationErrors.slice(0, 5)
                };
                
            } catch (error) {
                return { 
                    success: false, 
                    error: error.message 
                };
            }
        }, csvContent);
        
        console.log('🔍 Validation Result:', JSON.stringify(validationResult, null, 2));
        
        if (validationResult.success) {
            console.log(`📊 Successfully parsed ${validationResult.rowCount} rows`);
            console.log(`📋 Fields found: ${validationResult.fields.join(', ')}`);
            console.log(`❌ Validation errors: ${validationResult.errorCount}`);
            
            if (validationResult.errorCount > 0) {
                console.log('🚨 First few validation errors:');
                validationResult.firstFewErrors.forEach((error, index) => {
                    console.log(`  ${index + 1}. Row ${error.row}, Field "${error.field}": ${error.message}`);
                    if (error.actualValue !== undefined) {
                        console.log(`     Actual value: "${error.actualValue}"`);
                    }
                    if (error.parsedValue !== undefined) {
                        console.log(`     Parsed value: ${error.parsedValue}`);
                    }
                });
            } else {
                console.log('✅ No validation errors found!');
            }
        } else {
            console.log('❌ Failed to parse CSV:', validationResult.error);
            if (validationResult.parseErrors) {
                console.log('📋 Parse errors:', validationResult.parseErrors);
            }
        }
    });
});