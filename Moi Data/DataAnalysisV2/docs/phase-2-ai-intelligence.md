# Phase 2: AI-Powered Data Intelligence

## Overview

Phase 2 enhances the data validation system with advanced AI-powered intelligence for automatic data correction, quality assessment, and smart suggestions. This phase builds upon Phase 1's basic validation to provide sophisticated data cleaning and normalization capabilities.

## Phase 2 Goals

- 🤖 Advanced AI-powered data correction using Claude
- 📊 Intelligent data quality scoring and recommendations
- 🔄 Automatic format standardization across platforms
- 🎯 Smart column mapping and field normalization
- 📈 Predictive data validation and anomaly detection
- 🔍 Cross-platform consistency validation

## Implementation Timeline: Week 2

### Day 1-2: Advanced AI Correction Engine
### Day 3-4: Data Quality Intelligence System
### Day 5-7: Cross-Platform Validation & Optimization

---

## Technical Implementation

### 1. Enhanced AI Correction Engine

#### Advanced AI Fixer (`lib/ai-fixer-advanced.js`)
```javascript
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class AdvancedAIFixer {
  constructor() {
    this.correctionHistory = new Map();
    this.confidenceThreshold = 0.85;
  }

  async analyzeAndCorrect(platform, data, validationErrors) {
    const analysis = await this.performDeepAnalysis(platform, data, validationErrors);
    const corrections = await this.generateSmartCorrections(analysis);
    const quality = await this.assessDataQuality(data, corrections);
    
    return {
      analysis,
      corrections,
      quality,
      recommendations: this.generateRecommendations(analysis, quality)
    };
  }

  async performDeepAnalysis(platform, data, validationErrors) {
    const prompt = this.buildAnalysisPrompt(platform, data, validationErrors);
    
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.1,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return this.parseAnalysisResponse(message.content[0].text);
  }

  buildAnalysisPrompt(platform, data, validationErrors) {
    const sampleData = data.slice(0, 20);
    const dataPreview = JSON.stringify(sampleData, null, 2);
    
    return `
You are an expert data analyst specializing in marketing analytics data cleaning and validation. 

TASK: Analyze ${platform} marketing data for quality issues and provide intelligent correction strategies.

PLATFORM: ${platform}
DATA SAMPLE: ${dataPreview}
VALIDATION ERRORS: ${JSON.stringify(validationErrors, null, 2)}

Perform a comprehensive analysis and respond in this EXACT JSON format:

{
  "data_patterns": {
    "date_formats": ["detected_formats"],
    "column_inconsistencies": ["issues_found"],
    "data_types": {"column": "detected_type"},
    "null_patterns": {"column": "null_percentage"},
    "encoding_issues": ["detected_issues"]
  },
  "quality_assessment": {
    "overall_score": 0.85,
    "completeness": 0.90,
    "consistency": 0.80,
    "accuracy": 0.85,
    "issues": ["major_issues_list"]
  },
  "correction_strategies": [
    {
      "strategy_id": "date_standardization",
      "priority": "high",
      "confidence": 0.95,
      "description": "Standardize date formats to YYYY-MM-DD",
      "affected_columns": ["Day"],
      "transformation_logic": "date normalization function",
      "risk_level": "low"
    }
  ],
  "cross_platform_insights": {
    "campaign_mapping_quality": 0.75,
    "utm_consistency": 0.80,
    "data_alignment": "good|fair|poor"
  }
}

Focus on:
1. Date format standardization (YYYY-MM-DD)
2. Numeric field cleaning (remove currency, percentages)
3. Column name normalization (consistent naming)
4. Text encoding fixes (UTF-8)
5. Campaign name consistency across platforms
6. UTM parameter validation and cleaning
7. Missing data imputation strategies
8. Outlier detection and handling

Be conservative with transformations that might lose data. Prioritize high-confidence corrections.
`;
  }

  parseAnalysisResponse(response) {
    try {
      const analysis = JSON.parse(response);
      return {
        ...analysis,
        timestamp: new Date().toISOString(),
        model_version: 'claude-3-sonnet'
      };
    } catch (error) {
      console.error('Failed to parse AI analysis:', error);
      throw new Error('Invalid AI analysis response');
    }
  }

  async generateSmartCorrections(analysis) {
    const corrections = [];
    
    for (const strategy of analysis.correction_strategies) {
      if (strategy.confidence >= this.confidenceThreshold) {
        const correction = await this.buildCorrectionFunction(strategy);
        corrections.push(correction);
      }
    }

    return corrections;
  }

  async buildCorrectionFunction(strategy) {
    const prompt = `
Create a JavaScript correction function for this data cleaning strategy:

STRATEGY: ${JSON.stringify(strategy, null, 2)}

Return ONLY a JavaScript function in this format:

function correctData(value, columnName, rowIndex) {
  // Correction logic here
  return correctedValue;
}

The function should:
1. Handle null/undefined values gracefully
2. Return the original value if correction fails
3. Be efficient for large datasets
4. Follow the strategy's transformation logic
5. Include appropriate validation

Examples for common corrections:
- Date standardization: Convert DD-MM-YYYY to YYYY-MM-DD
- Numeric cleaning: Remove currency symbols, convert percentages
- Text normalization: Trim whitespace, fix encoding
- Column mapping: Standardize column names
`;

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 500,
      temperature: 0,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const functionCode = this.extractFunctionCode(message.content[0].text);
    
    return {
      id: strategy.strategy_id,
      title: strategy.description,
      priority: strategy.priority,
      confidence: strategy.confidence,
      riskLevel: strategy.risk_level,
      affectedColumns: strategy.affected_columns,
      functionCode,
      preview: this.generatePreview(strategy)
    };
  }

  extractFunctionCode(response) {
    // Extract JavaScript function from AI response
    const functionMatch = response.match(/function\s+correctData[^}]+}/s);
    if (functionMatch) {
      return functionMatch[0];
    }
    
    // Fallback to identity function
    return 'function correctData(value) { return value; }';
  }

  generatePreview(strategy) {
    // Generate example transformations for user preview
    const examples = {
      date_standardization: {
        before: '15-11-2025',
        after: '2025-11-15'
      },
      numeric_cleaning: {
        before: '₹1,234.56',
        after: '1234.56'
      },
      text_normalization: {
        before: '  Campaign Name  ',
        after: 'Campaign Name'
      }
    };

    return examples[strategy.strategy_id] || {
      before: 'sample_value',
      after: 'corrected_value'
    };
  }

  async assessDataQuality(data, corrections) {
    // Calculate quality metrics
    const metrics = {
      completeness: this.calculateCompleteness(data),
      consistency: this.calculateConsistency(data),
      accuracy: this.estimateAccuracy(data, corrections),
      uniqueness: this.calculateUniqueness(data),
      validity: this.calculateValidity(data)
    };

    const overallScore = Object.values(metrics).reduce((sum, score) => sum + score, 0) / Object.keys(metrics).length;

    return {
      overall_score: Math.round(overallScore * 100) / 100,
      metrics,
      improvements: corrections.length > 0 ? this.calculateImprovements(metrics, corrections) : {},
      recommendations: this.generateQualityRecommendations(metrics)
    };
  }

  calculateCompleteness(data) {
    if (data.length === 0) return 0;
    
    const totalCells = data.length * Object.keys(data[0] || {}).length;
    const filledCells = data.reduce((count, row) => {
      return count + Object.values(row).filter(value => 
        value !== null && value !== undefined && value !== ''
      ).length;
    }, 0);

    return totalCells > 0 ? filledCells / totalCells : 0;
  }

  calculateConsistency(data) {
    if (data.length === 0) return 0;
    
    const columns = Object.keys(data[0] || {});
    let consistencyScore = 0;

    columns.forEach(column => {
      const values = data.map(row => row[column]).filter(v => v !== null && v !== undefined);
      const types = [...new Set(values.map(v => typeof v))];
      const formatConsistency = types.length === 1 ? 1 : 0.5;
      consistencyScore += formatConsistency;
    });

    return columns.length > 0 ? consistencyScore / columns.length : 0;
  }

  estimateAccuracy(data, corrections) {
    // Base accuracy estimate
    let baseAccuracy = 0.8;
    
    // Increase accuracy based on corrections confidence
    const highConfidenceCorrections = corrections.filter(c => c.confidence >= 0.9);
    const accuracyBoost = highConfidenceCorrections.length * 0.05;
    
    return Math.min(baseAccuracy + accuracyBoost, 1.0);
  }

  calculateUniqueness(data) {
    if (data.length === 0) return 0;
    
    // Check for duplicate rows
    const uniqueRows = new Set(data.map(row => JSON.stringify(row)));
    return uniqueRows.size / data.length;
  }

  calculateValidity(data) {
    // Simple validity check based on expected data patterns
    let validityScore = 0;
    const sampleSize = Math.min(data.length, 100);
    
    for (let i = 0; i < sampleSize; i++) {
      const row = data[i];
      let rowValidity = 0;
      
      Object.entries(row).forEach(([key, value]) => {
        if (this.isValidValue(key, value)) {
          rowValidity += 1;
        }
      });
      
      validityScore += rowValidity / Object.keys(row).length;
    }

    return sampleSize > 0 ? validityScore / sampleSize : 0;
  }

  isValidValue(columnName, value) {
    if (value === null || value === undefined || value === '') return false;
    
    const normalizedColumn = columnName.toLowerCase();
    
    // Date validation
    if (normalizedColumn.includes('day') || normalizedColumn.includes('date')) {
      return !isNaN(Date.parse(value));
    }
    
    // Numeric validation
    if (normalizedColumn.includes('cost') || normalizedColumn.includes('spend') || 
        normalizedColumn.includes('ctr') || normalizedColumn.includes('cpm')) {
      const numericValue = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
      return !isNaN(numericValue) && numericValue >= 0;
    }
    
    return true;
  }

  generateQualityRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.completeness < 0.8) {
      recommendations.push({
        type: 'completeness',
        priority: 'high',
        message: 'Consider data imputation for missing values',
        impact: 'improves analysis reliability'
      });
    }
    
    if (metrics.consistency < 0.7) {
      recommendations.push({
        type: 'consistency',
        priority: 'high',
        message: 'Standardize data formats and types',
        impact: 'enables better cross-platform analysis'
      });
    }
    
    if (metrics.uniqueness < 0.9) {
      recommendations.push({
        type: 'uniqueness',
        priority: 'medium',
        message: 'Review and remove duplicate entries',
        impact: 'prevents skewed analytics'
      });
    }

    return recommendations;
  }
}
```

### 2. Smart Data Quality Assessment

#### Quality Assessment API (`api/ai/assess-quality.js`)
```javascript
import { AdvancedAIFixer } from '../../lib/ai-fixer-advanced';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { platform, data, validationErrors } = req.body;
    
    const aiFixer = new AdvancedAIFixer();
    const assessment = await aiFixer.analyzeAndCorrect(platform, data, validationErrors);
    
    res.status(200).json({
      success: true,
      assessment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Quality assessment error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
```

### 3. Cross-Platform Data Validation

#### Cross-Platform Validator (`lib/cross-platform-validator.js`)
```javascript
export class CrossPlatformValidator {
  constructor() {
    this.validationRules = {
      dateAlignment: this.validateDateAlignment.bind(this),
      campaignMapping: this.validateCampaignMapping.bind(this),
      utmConsistency: this.validateUTMConsistency.bind(this),
      dataVolume: this.validateDataVolume.bind(this)
    };
  }

  async validateCrossPlatform(platformData) {
    const results = {};
    
    for (const [ruleName, ruleFunction] of Object.entries(this.validationRules)) {
      try {
        results[ruleName] = await ruleFunction(platformData);
      } catch (error) {
        results[ruleName] = {
          isValid: false,
          error: error.message
        };
      }
    }

    return {
      overallValid: Object.values(results).every(r => r.isValid),
      results,
      summary: this.generateValidationSummary(results)
    };
  }

  validateDateAlignment(platformData) {
    const dates = {};
    
    // Extract date ranges from each platform
    Object.entries(platformData).forEach(([platform, data]) => {
      if (data && data.length > 0) {
        const dateDates = data.map(row => new Date(row.Day || row.day)).filter(d => !isNaN(d));
        if (dateDates.length > 0) {
          dates[platform] = {
            start: new Date(Math.min(...dateDates)),
            end: new Date(Math.max(...dateDates)),
            count: dateDates.length
          };
        }
      }
    });

    // Check for reasonable overlap
    const platforms = Object.keys(dates);
    if (platforms.length < 2) {
      return {
        isValid: true,
        message: 'Single platform detected, no alignment needed'
      };
    }

    // Calculate overlap
    const overlapDays = this.calculateDateOverlap(dates);
    const isValid = overlapDays >= 1;

    return {
      isValid,
      overlapDays,
      dateRanges: dates,
      message: isValid ? 
        `Good date alignment with ${overlapDays} overlapping days` :
        'Poor date alignment between platforms'
    };
  }

  validateCampaignMapping(platformData) {
    const metaData = platformData.meta || [];
    const googleData = platformData.google || [];
    const shopifyData = platformData.shopify || [];

    // Extract campaign names
    const metaCampaigns = new Set(metaData.map(row => 
      this.normalizeCampaignName(row['Campaign name'] || row.campaign)
    ).filter(Boolean));

    const googleCampaigns = new Set(googleData.map(row => 
      this.normalizeCampaignName(row.Campaign || row.campaign)
    ).filter(Boolean));

    const shopifyUTMs = new Set(shopifyData.map(row => 
      this.normalizeCampaignName(row['UTM campaign'] || row.utm_campaign)
    ).filter(Boolean));

    // Calculate mapping coverage
    const metaInShopify = [...metaCampaigns].filter(campaign => shopifyUTMs.has(campaign));
    const googleInShopify = [...googleCampaigns].filter(campaign => shopifyUTMs.has(campaign));

    const metaCoverage = metaCampaigns.size > 0 ? metaInShopify.length / metaCampaigns.size : 0;
    const googleCoverage = googleCampaigns.size > 0 ? googleInShopify.length / googleCampaigns.size : 0;

    const overallCoverage = (metaCoverage + googleCoverage) / 2;
    const isValid = overallCoverage >= 0.7; // 70% mapping threshold

    return {
      isValid,
      coverage: {
        meta: metaCoverage,
        google: googleCoverage,
        overall: overallCoverage
      },
      unmappedCampaigns: {
        meta: [...metaCampaigns].filter(c => !shopifyUTMs.has(c)),
        google: [...googleCampaigns].filter(c => !shopifyUTMs.has(c))
      },
      message: isValid ? 
        'Good campaign mapping coverage' :
        'Poor campaign mapping - many campaigns not found in Shopify UTMs'
    };
  }

  validateUTMConsistency(platformData) {
    const shopifyData = platformData.shopify || [];
    
    if (shopifyData.length === 0) {
      return {
        isValid: false,
        message: 'No Shopify data available for UTM validation'
      };
    }

    // Check UTM parameter consistency
    const utmPatterns = {
      campaign: this.analyzeUTMPattern(shopifyData, 'UTM campaign'),
      term: this.analyzeUTMPattern(shopifyData, 'UTM term'),
      content: this.analyzeUTMPattern(shopifyData, 'UTM content')
    };

    const consistencyScores = Object.values(utmPatterns).map(p => p.consistency);
    const overallConsistency = consistencyScores.reduce((a, b) => a + b, 0) / consistencyScores.length;

    const isValid = overallConsistency >= 0.8; // 80% consistency threshold

    return {
      isValid,
      consistency: overallConsistency,
      patterns: utmPatterns,
      message: isValid ? 
        'UTM parameters are well-structured' :
        'UTM parameter structure needs improvement'
    };
  }

  validateDataVolume(platformData) {
    const volumes = {};
    
    Object.entries(platformData).forEach(([platform, data]) => {
      volumes[platform] = data ? data.length : 0;
    });

    // Check for reasonable data volumes
    const totalRows = Object.values(volumes).reduce((a, b) => a + b, 0);
    const isValid = totalRows >= 10 && Object.values(volumes).every(v => v > 0);

    return {
      isValid,
      volumes,
      totalRows,
      message: isValid ? 
        'Good data volume across platforms' :
        'Insufficient data volume or missing platform data'
    };
  }

  normalizeCampaignName(name) {
    if (!name) return '';
    
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_');
  }

  analyzeUTMPattern(data, utmField) {
    const values = data.map(row => row[utmField]).filter(Boolean);
    const unique = new Set(values);
    
    // Analyze pattern consistency
    const patterns = values.map(this.extractUTMPattern);
    const patternTypes = new Set(patterns);
    
    return {
      totalValues: values.length,
      uniqueValues: unique.size,
      patterns: patternTypes.size,
      consistency: patternTypes.size <= 3 ? 1 : Math.max(0, 1 - (patternTypes.size - 3) * 0.2)
    };
  }

  extractUTMPattern(value) {
    if (!value) return 'empty';
    
    // Categorize UTM patterns
    if (value.includes('-')) return 'hyphenated';
    if (value.includes('_')) return 'underscore';
    if (value.includes(' ')) return 'spaced';
    if (/^\w+$/.test(value)) return 'single_word';
    
    return 'mixed';
  }

  calculateDateOverlap(dateRanges) {
    const platforms = Object.keys(dateRanges);
    if (platforms.length < 2) return 0;

    const allStarts = platforms.map(p => dateRanges[p].start);
    const allEnds = platforms.map(p => dateRanges[p].end);

    const overlapStart = new Date(Math.max(...allStarts));
    const overlapEnd = new Date(Math.min(...allEnds));

    if (overlapStart <= overlapEnd) {
      return Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
    }

    return 0;
  }

  generateValidationSummary(results) {
    const validCount = Object.values(results).filter(r => r.isValid).length;
    const totalCount = Object.keys(results).length;
    
    const score = validCount / totalCount;
    let grade, message;

    if (score >= 0.9) {
      grade = 'A';
      message = 'Excellent cross-platform data quality';
    } else if (score >= 0.7) {
      grade = 'B';
      message = 'Good cross-platform data quality with minor issues';
    } else if (score >= 0.5) {
      grade = 'C';
      message = 'Fair cross-platform data quality - some improvements needed';
    } else {
      grade = 'D';
      message = 'Poor cross-platform data quality - significant issues detected';
    }

    return {
      grade,
      score,
      validationsCount: validCount,
      totalCount,
      message,
      criticalIssues: Object.entries(results)
        .filter(([_, result]) => !result.isValid)
        .map(([name, result]) => ({ name, message: result.message }))
    };
  }
}
```

### 4. Enhanced UI Components

#### AI Quality Dashboard (`components/AIQualityDashboard.jsx`)
```jsx
import { useState, useEffect } from 'react';
import { AdvancedAIFixer } from '../lib/ai-fixer-advanced';

export default function AIQualityDashboard({ platformData, onCorrectionsApply }) {
  const [assessments, setAssessments] = useState({});
  const [crossPlatformValidation, setCrossPlatformValidation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (platformData && Object.keys(platformData).length > 0) {
      performQualityAssessment();
    }
  }, [platformData]);

  const performQualityAssessment = async () => {
    setIsAnalyzing(true);
    
    try {
      // Assess each platform individually
      const platformAssessments = {};
      for (const [platform, data] of Object.entries(platformData)) {
        const response = await fetch('/api/ai/assess-quality', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform, data, validationErrors: [] })
        });
        
        const result = await response.json();
        platformAssessments[platform] = result.assessment;
      }
      
      setAssessments(platformAssessments);

      // Perform cross-platform validation
      const crossValidation = await performCrossPlatformValidation(platformData);
      setCrossPlatformValidation(crossValidation);
      
    } catch (error) {
      console.error('Quality assessment failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performCrossPlatformValidation = async (data) => {
    // This would typically call an API endpoint
    const validator = new (await import('../lib/cross-platform-validator')).CrossPlatformValidator();
    return await validator.validateCrossPlatform(data);
  };

  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">AI is analyzing your data quality...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Quality Score */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">AI Quality Assessment</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(assessments).map(([platform, assessment]) => (
            <QualityScoreCard 
              key={platform}
              platform={platform}
              assessment={assessment}
            />
          ))}
        </div>

        {crossPlatformValidation && (
          <CrossPlatformValidationSummary validation={crossPlatformValidation} />
        )}
      </div>

      {/* Detailed Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(assessments).map(([platform, assessment]) => (
          <PlatformRecommendations
            key={platform}
            platform={platform}
            assessment={assessment}
            onApplyCorrections={(corrections) => onCorrectionsApply(platform, corrections)}
          />
        ))}
      </div>
    </div>
  );
}

function QualityScoreCard({ platform, assessment }) {
  const score = assessment.quality.overall_score;
  const scoreColor = score >= 0.8 ? 'text-green-600' : score >= 0.6 ? 'text-yellow-600' : 'text-red-600';
  const bgColor = score >= 0.8 ? 'bg-green-50' : score >= 0.6 ? 'bg-yellow-50' : 'bg-red-50';

  return (
    <div className={`${bgColor} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium capitalize">{platform}</h4>
        <div className={`text-2xl font-bold ${scoreColor}`}>
          {Math.round(score * 100)}%
        </div>
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Completeness:</span>
          <span>{Math.round(assessment.quality.metrics.completeness * 100)}%</span>
        </div>
        <div className="flex justify-between">
          <span>Consistency:</span>
          <span>{Math.round(assessment.quality.metrics.consistency * 100)}%</span>
        </div>
        <div className="flex justify-between">
          <span>Accuracy:</span>
          <span>{Math.round(assessment.quality.metrics.accuracy * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

function CrossPlatformValidationSummary({ validation }) {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Cross-Platform Validation</h4>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${validation.overallValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
        `}>
          Grade {validation.summary.grade}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{validation.summary.message}</p>
      
      {validation.summary.criticalIssues.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-red-800">Critical Issues:</h5>
          {validation.summary.criticalIssues.map((issue, index) => (
            <div key={index} className="text-xs text-red-700 bg-red-50 p-2 rounded">
              <strong>{issue.name}:</strong> {issue.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlatformRecommendations({ platform, assessment, onApplyCorrections }) {
  const [selectedCorrections, setSelectedCorrections] = useState(new Set());

  const handleApplyCorrections = () => {
    const correctionsToApply = assessment.corrections.filter(c => 
      selectedCorrections.has(c.id)
    );
    onApplyCorrections(correctionsToApply);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h4 className="font-semibold mb-4 capitalize">{platform} Recommendations</h4>
      
      {assessment.quality.recommendations.map((rec, index) => (
        <div key={index} className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              {rec.priority === 'high' ? (
                <ExclamationCircleIcon className="w-4 h-4 text-red-500 mt-0.5" />
              ) : (
                <InformationCircleIcon className="w-4 h-4 text-yellow-500 mt-0.5" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{rec.message}</p>
              <p className="text-xs text-gray-600 mt-1">{rec.impact}</p>
            </div>
          </div>
        </div>
      ))}

      {assessment.corrections.length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-medium mb-2">Available Corrections:</h5>
          <div className="space-y-2">
            {assessment.corrections.map(correction => (
              <div key={correction.id} className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={selectedCorrections.has(correction.id)}
                  onChange={(e) => {
                    const newSelection = new Set(selectedCorrections);
                    if (e.target.checked) {
                      newSelection.add(correction.id);
                    } else {
                      newSelection.delete(correction.id);
                    }
                    setSelectedCorrections(newSelection);
                  }}
                  className="mt-1"
                />
                <div className="flex-1 text-sm">
                  <div className="font-medium">{correction.title}</div>
                  <div className="text-gray-600">
                    Confidence: {Math.round(correction.confidence * 100)}%
                  </div>
                  {correction.preview && (
                    <div className="text-xs bg-white p-1 rounded border mt-1">
                      {correction.preview.before} → {correction.preview.after}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleApplyCorrections}
            disabled={selectedCorrections.size === 0}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 text-sm"
          >
            Apply Selected Corrections
          </button>
        </div>
      )}
    </div>
  );
}
```

### 5. Automated Data Enhancement

#### Data Enhancement Pipeline (`lib/data-enhancement-pipeline.js`)
```javascript
export class DataEnhancementPipeline {
  constructor() {
    this.enhancers = [
      this.standardizeDates,
      this.normalizeNumericValues,
      this.cleanTextFields,
      this.validateBusinessLogic,
      this.enrichMetadata
    ];
  }

  async enhance(platform, data, aiCorrections) {
    let enhancedData = [...data];
    const enhancementLog = [];

    for (const enhancer of this.enhancers) {
      try {
        const result = await enhancer.call(this, platform, enhancedData, aiCorrections);
        enhancedData = result.data;
        enhancementLog.push(result.log);
      } catch (error) {
        enhancementLog.push({
          enhancer: enhancer.name,
          error: error.message,
          skipped: true
        });
      }
    }

    return {
      data: enhancedData,
      log: enhancementLog,
      summary: this.generateEnhancementSummary(data, enhancedData, enhancementLog)
    };
  }

  standardizeDates(platform, data, aiCorrections) {
    const dateColumns = this.identifyDateColumns(platform);
    let modificationsCount = 0;

    const enhancedData = data.map(row => {
      const newRow = { ...row };
      
      dateColumns.forEach(column => {
        if (newRow[column]) {
          const originalDate = newRow[column];
          const standardizedDate = this.standardizeDateFormat(originalDate);
          
          if (standardizedDate !== originalDate) {
            newRow[column] = standardizedDate;
            modificationsCount++;
          }
        }
      });
      
      return newRow;
    });

    return {
      data: enhancedData,
      log: {
        enhancer: 'standardizeDates',
        modificationsCount,
        affectedColumns: dateColumns,
        success: true
      }
    };
  }

  normalizeNumericValues(platform, data, aiCorrections) {
    const numericColumns = this.identifyNumericColumns(platform);
    let modificationsCount = 0;

    const enhancedData = data.map(row => {
      const newRow = { ...row };
      
      numericColumns.forEach(column => {
        if (newRow[column]) {
          const originalValue = newRow[column];
          const normalizedValue = this.normalizeNumeric(originalValue);
          
          if (normalizedValue !== originalValue) {
            newRow[column] = normalizedValue;
            modificationsCount++;
          }
        }
      });
      
      return newRow;
    });

    return {
      data: enhancedData,
      log: {
        enhancer: 'normalizeNumericValues',
        modificationsCount,
        affectedColumns: numericColumns,
        success: true
      }
    };
  }

  cleanTextFields(platform, data, aiCorrections) {
    const textColumns = this.identifyTextColumns(platform);
    let modificationsCount = 0;

    const enhancedData = data.map(row => {
      const newRow = { ...row };
      
      textColumns.forEach(column => {
        if (newRow[column] && typeof newRow[column] === 'string') {
          const originalText = newRow[column];
          const cleanedText = this.cleanText(originalText);
          
          if (cleanedText !== originalText) {
            newRow[column] = cleanedText;
            modificationsCount++;
          }
        }
      });
      
      return newRow;
    });

    return {
      data: enhancedData,
      log: {
        enhancer: 'cleanTextFields',
        modificationsCount,
        affectedColumns: textColumns,
        success: true
      }
    };
  }

  identifyDateColumns(platform) {
    const datePatterns = ['day', 'date', 'time'];
    return this.getColumnsMatchingPatterns(platform, datePatterns);
  }

  identifyNumericColumns(platform) {
    const numericPatterns = ['cost', 'spend', 'ctr', 'cpm', 'visitors', 'sessions'];
    return this.getColumnsMatchingPatterns(platform, numericPatterns);
  }

  identifyTextColumns(platform) {
    const textPatterns = ['campaign', 'ad', 'utm', 'name', 'content'];
    return this.getColumnsMatchingPatterns(platform, textPatterns);
  }

  getColumnsMatchingPatterns(platform, patterns) {
    // This would be populated based on actual data columns
    // For now, return common column names for each platform
    const platformColumns = {
      meta: ['Campaign name', 'Ad set name', 'Ad name', 'Day'],
      google: ['Campaign', 'Day'],
      shopify: ['UTM campaign', 'UTM term', 'UTM content', 'Day']
    };

    const columns = platformColumns[platform] || [];
    return columns.filter(column => 
      patterns.some(pattern => 
        column.toLowerCase().includes(pattern)
      )
    );
  }

  standardizeDateFormat(dateString) {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch {
      return dateString;
    }
  }

  normalizeNumeric(value) {
    if (typeof value === 'number') return value;
    
    const stringValue = value.toString();
    // Remove currency symbols, commas, and percentages
    const cleaned = stringValue.replace(/[₹$,€£%]/g, '').trim();
    
    const numericValue = parseFloat(cleaned);
    return isNaN(numericValue) ? value : numericValue;
  }

  cleanText(text) {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s-_.]/g, '') // Remove special characters except common ones
      .trim();
  }

  generateEnhancementSummary(originalData, enhancedData, log) {
    const totalModifications = log.reduce((sum, entry) => 
      sum + (entry.modificationsCount || 0), 0
    );

    const successfulEnhancements = log.filter(entry => entry.success).length;
    const failedEnhancements = log.filter(entry => entry.skipped).length;

    return {
      totalModifications,
      enhancementCoverage: successfulEnhancements / (successfulEnhancements + failedEnhancements),
      qualityImprovement: this.calculateQualityImprovement(originalData, enhancedData),
      recommendations: this.generateRecommendations(log)
    };
  }

  calculateQualityImprovement(original, enhanced) {
    // Simple quality score based on data consistency
    const originalScore = this.calculateSimpleQualityScore(original);
    const enhancedScore = this.calculateSimpleQualityScore(enhanced);
    
    return enhancedScore - originalScore;
  }

  calculateSimpleQualityScore(data) {
    if (data.length === 0) return 0;
    
    const totalCells = data.length * Object.keys(data[0]).length;
    const validCells = data.reduce((count, row) => 
      count + Object.values(row).filter(value => 
        value !== null && value !== undefined && value !== ''
      ).length, 0
    );
    
    return validCells / totalCells;
  }

  generateRecommendations(log) {
    const recommendations = [];
    
    const failedEnhancements = log.filter(entry => entry.skipped);
    if (failedEnhancements.length > 0) {
      recommendations.push({
        type: 'enhancement_failures',
        message: `${failedEnhancements.length} enhancement(s) failed - review data quality`,
        priority: 'medium'
      });
    }

    const lowModificationEnhancements = log.filter(entry => 
      entry.modificationsCount !== undefined && entry.modificationsCount < 5
    );
    
    if (lowModificationEnhancements.length === log.length) {
      recommendations.push({
        type: 'data_quality',
        message: 'Data quality is already good - minimal enhancements needed',
        priority: 'low'
      });
    }

    return recommendations;
  }
}
```

---

## Phase 2 Testing Strategy

### AI Correction Testing
- Test date format detection accuracy
- Validate numeric cleaning functions
- Verify column mapping suggestions
- Test error handling for malformed data

### Quality Assessment Testing
- Validate quality scoring algorithms
- Test cross-platform validation rules
- Verify recommendation generation
- Test performance with large datasets

### Integration Testing
- End-to-end AI correction workflow
- Quality dashboard functionality
- Cross-platform validation accuracy
- Data enhancement pipeline

## Phase 2 Success Criteria

- 🤖 AI provides 90%+ accurate correction suggestions
- 📊 Quality scoring correlates with manual assessment
- 🔄 Automatic corrections improve data quality by 20%+
- 🎯 Cross-platform validation identifies key issues
- 📈 Enhancement pipeline processes 10K+ rows efficiently
- 🔍 User interface clearly communicates quality insights

---
*Phase 2 Timeline: Week 2 (7 days)*  
*Next Phase: [Report Generation & Julius V7 Porting](phase-3-report-generation.md)*