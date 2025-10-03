/**
 * Convert the validated CSV template to TypeScript DEFAULT_LOGIC_TEMPLATE format
 */

const fs = require('fs');

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

function convertCSVToTypeScript(csvPath) {
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.trim().split('\n');
  const header = lines[0].split(',').map(h => h.trim());
  
  console.log('Header:', header);
  
  const fieldMapping = {
    'Fields': 'fields',
    'Output File Name': 'outputFileName', 
    'Input from?': 'inputFrom',
    'Type': 'type',
    'Formula': 'formula',
    'Notes': 'notes'
  };
  
  const templateRows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    const row = {};
    header.forEach((h, index) => {
      const fieldName = fieldMapping[h] || h.toLowerCase();
      row[fieldName] = values[index] || '';
    });
    
    templateRows.push(row);
  }
  
  console.log(`Parsed ${templateRows.length} rows`);
  
  // Convert to TypeScript format
  let tsCode = 'export const DEFAULT_LOGIC_TEMPLATE: LogicTemplateRow[] = [\n';
  
  templateRows.forEach((row, index) => {
    tsCode += '  {\n';
    tsCode += `    fields: '${row.fields.replace(/'/g, "\\'").replace(/"/g, '\\"')}',\n`;
    tsCode += `    outputFileName: '${row.outputFileName}',\n`;
    tsCode += `    inputFrom: '${row.inputFrom}',\n`;
    tsCode += `    type: '${row.type}',\n`;
    tsCode += `    formula: '${row.formula.replace(/'/g, "\\'").replace(/"/g, '\\"')}'\n`;
    if (row.notes && row.notes.trim()) {
      tsCode += `    notes: '${row.notes.replace(/'/g, "\\'").replace(/"/g, '\\"')}'\n`;
    }
    tsCode += '  }';
    if (index < templateRows.length - 1) {
      tsCode += ',';
    }
    tsCode += '\n';
  });
  
  tsCode += '];\n';
  
  return tsCode;
}

// Convert the final validated template
const inputFile = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/MOI Original Data/Logic Template/Default_Logic_v2a_final.csv';
const outputFile = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/default_template_typescript.ts';

console.log('🔄 Converting CSV to TypeScript format...');
console.log(`📁 Input: ${inputFile}`);

const tsCode = convertCSVToTypeScript(inputFile);

fs.writeFileSync(outputFile, tsCode);

console.log(`✅ TypeScript code generated: ${outputFile}`);
console.log('\n📋 Generated TypeScript code:');
console.log('='.repeat(50));
console.log(tsCode.substring(0, 1000) + '...');
console.log('='.repeat(50));
console.log('\n✅ Ready to replace DEFAULT_LOGIC_TEMPLATE in logicConfiguration.ts');