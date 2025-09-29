const fs = require('fs');
const path = require('path');

// Create organized folder structure
function createFolderStructure() {
  const folders = [
    '01_Original_Data',
    '02_Analysis_Scripts', 
    '03_Reports_Final',
    '04_Visualizations',
    '05_CSV_Outputs',
    '06_Archive_Previous',
    '07_Technical_Summaries'
  ];
  
  folders.forEach(folder => {
    const folderPath = path.join(__dirname, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  });
}

// Analyze the captured data and create comprehensive brand guide
function createBrandAnalysis() {
  createFolderStructure();
  
  // Read the page analysis data
  const pageAnalysisPath = path.join(__dirname, '01_Original_Data', 'page-analysis.json');
  const pageData = JSON.parse(fs.readFileSync(pageAnalysisPath, 'utf8'));
  
  // Extract brand colors from analysis
  const brandAnalysis = {
    brandName: "MOI - Boutique Fine Jewellery",
    website: "https://vibewithmoi.in/",
    tagline: "Boutique Everyday Luxury",
    captureDate: new Date().toISOString(),
    
    // Color Palette Analysis
    colorPalette: {
      primary: {
        name: "Deep Charcoal",
        hex: "#141314",
        rgb: "rgb(20, 19, 20)",
        usage: "Primary text, headings, body content"
      },
      secondary: {
        name: "Warm Grey",
        hex: "#3F3E3E", 
        rgb: "rgb(63, 62, 62)",
        usage: "Secondary text, navigation labels, category headers"
      },
      accent: {
        name: "Rich Red",
        hex: "#721C24",
        rgb: "rgb(114, 28, 36)", 
        usage: "Error messages, sale notifications"
      },
      neutral: {
        name: "Pure White",
        hex: "#FFFFFF",
        rgb: "rgb(255, 255, 255)",
        usage: "Backgrounds, overlay text on images"
      },
      darkGrey: {
        name: "Medium Grey",
        hex: "#2C2C2C",
        rgb: "rgb(44, 44, 44)",
        usage: "Emphasized content sections"
      }
    },
    
    // Typography System
    typography: {
      primaryFont: {
        family: "orpheuspro",
        fallback: "sans-serif",
        usage: "Headings, product names, section titles",
        characteristics: "Elegant serif font, sophisticated and premium feel"
      },
      secondaryFont: {
        family: "BentonSans Book",
        fallback: "sans-serif", 
        usage: "Body text, navigation, UI elements",
        characteristics: "Clean sans-serif, highly readable"
      },
      supportingFont: {
        family: "BentonSans",
        fallback: "sans-serif",
        usage: "Category labels, small text elements",
        characteristics: "Consistent with secondary but variations in weight"
      },
      hierarchy: {
        h1: {
          size: "40px",
          weight: "500",
          lineHeight: "42px-50px",
          usage: "Hero headings, main page titles"
        },
        h2: {
          size: "27px-32px", 
          weight: "100-400",
          lineHeight: "32.4px-37px",
          usage: "Section headings, major content blocks"
        },
        h3: {
          size: "12px-32px",
          weight: "400-600",
          lineHeight: "12px-34px",
          usage: "Product titles, category labels, subsections"
        },
        body: {
          size: "16px",
          weight: "normal",
          lineHeight: "normal",
          usage: "General content, descriptions"
        }
      }
    },
    
    // Design Principles
    designPrinciples: {
      visualStyle: "Minimalist luxury with sophisticated typography",
      layout: "Clean, spacious layouts with generous white space",
      imagery: "High-quality product photography with professional models",
      colorUsage: "Monochromatic with strategic color accents",
      spacing: "Generous padding and margins for premium feel"
    },
    
    // Brand Personality
    brandPersonality: {
      tone: "Sophisticated, accessible luxury",
      adjectives: ["Elegant", "Modern", "Refined", "Approachable", "Premium"],
      target: "Women seeking everyday luxury jewelry",
      positioning: "Boutique fine jewelry for discerning customers"
    },
    
    // UI Patterns observed
    uiPatterns: {
      navigation: "Clean horizontal navigation with category dropdowns",
      buttons: "Minimal styling with clear typography",
      cards: "Simple product cards with focus on imagery",
      layout: "Grid-based with flexible responsive design",
      contrast: "High contrast for readability"
    }
  };
  
  // Additional color variations extracted from screenshots
  const extendedColors = {
    complementary: {
      name: "Soft Beige/Cream",
      estimated_hex: "#F5F3F0",
      usage: "Background sections, product cards",
      source: "Observed in product showcase areas"
    },
    metallic: {
      name: "Gold Accents", 
      estimated_hex: "#D4AF37",
      usage: "Product details, jewelry highlights",
      source: "Product imagery and metallic elements"
    },
    muted: {
      name: "Soft Grey",
      estimated_hex: "#F8F8F8", 
      usage: "Subtle backgrounds, content separation",
      source: "Content area backgrounds"
    }
  };
  
  brandAnalysis.colorPalette.extended = extendedColors;
  
  // Dashboard recommendations based on brand analysis
  const dashboardRecommendations = {
    colorScheme: {
      primary: "#141314", // Deep charcoal for main text
      secondary: "#3F3E3E", // Warm grey for secondary elements
      background: "#FFFFFF", // Clean white background
      cards: "#F5F3F0", // Soft beige for card backgrounds
      accent: "#721C24", // Rich red for alerts/important metrics
      success: "#2D5530", // Deep green (complementary to red)
      borders: "#E8E8E8", // Light grey for subtle borders
      text: {
        primary: "#141314",
        secondary: "#3F3E3E", 
        light: "#FFFFFF"
      }
    },
    typography: {
      headings: "orpheuspro, serif", // Maintain brand elegance
      body: "BentonSans Book, sans-serif", // Clean readability
      ui: "BentonSans, sans-serif", // Consistent UI elements
      hierarchy: {
        dashboard_title: "32px, weight 400",
        section_headers: "18px, weight 500", 
        metric_labels: "12px, weight 500",
        data_values: "16px-24px, weight 600"
      }
    },
    designElements: {
      spacing: "Generous padding (24px-32px) to maintain luxury feel",
      cards: "Subtle shadows, rounded corners (8px), beige backgrounds",
      charts: "Minimal design with brand colors, clean lines",
      icons: "Simple, minimal icons in brand grey",
      buttons: "Minimal styling, clear typography, brand colors"
    },
    dataVisualization: {
      primary_chart_colors: ["#141314", "#3F3E3E", "#721C24", "#2D5530"],
      background_colors: ["#F5F3F0", "#F8F8F8"],
      text_colors: ["#141314", "#3F3E3E"],
      principles: [
        "High contrast for accessibility",
        "Minimal decoration to focus on data",
        "Consistent with brand's sophisticated aesthetic",
        "Use brand red sparingly for important alerts/metrics"
      ]
    }
  };
  
  // Save comprehensive analysis
  fs.writeFileSync(
    path.join(__dirname, '03_Reports_Final', 'moi-brand-analysis-complete.json'),
    JSON.stringify({
      brandAnalysis,
      dashboardRecommendations,
      metadata: {
        analysis_date: new Date().toISOString(),
        source_website: "vibewithmoi.in",
        analysis_method: "Automated screenshot analysis + CSS extraction"
      }
    }, null, 2)
  );
  
  // Create markdown report
  const markdownReport = generateMarkdownReport(brandAnalysis, dashboardRecommendations);
  fs.writeFileSync(
    path.join(__dirname, '03_Reports_Final', 'MOI_Brand_Guidelines_for_Dashboard.md'),
    markdownReport
  );
  
  // Create CSV of color palette
  const colorCSV = generateColorCSV(brandAnalysis.colorPalette);
  fs.writeFileSync(
    path.join(__dirname, '05_CSV_Outputs', 'moi-color-palette.csv'),
    colorCSV
  );
  
  console.log('✅ Brand analysis complete!');
  console.log('📁 Files created:');
  console.log('   📋 03_Reports_Final/MOI_Brand_Guidelines_for_Dashboard.md');
  console.log('   📊 03_Reports_Final/moi-brand-analysis-complete.json');
  console.log('   📈 05_CSV_Outputs/moi-color-palette.csv');
}

function generateMarkdownReport(brandAnalysis, dashboardRecommendations) {
  return `# MOI Brand Guidelines for Dashboard Design

## Executive Summary
MOI is a sophisticated boutique fine jewelry brand that embodies "Boutique Everyday Luxury." Their visual identity emphasizes minimalist elegance, premium typography, and a refined color palette that would translate beautifully to analytics dashboards.

## Brand Overview
- **Brand Name**: ${brandAnalysis.brandName}
- **Website**: ${brandAnalysis.website}
- **Tagline**: ${brandAnalysis.tagline}
- **Brand Personality**: ${brandAnalysis.brandPersonality.tone}

## Color Palette

### Primary Colors
| Color | Hex Code | RGB | Usage |
|-------|----------|-----|-------|
| **Deep Charcoal** | ${brandAnalysis.colorPalette.primary.hex} | ${brandAnalysis.colorPalette.primary.rgb} | ${brandAnalysis.colorPalette.primary.usage} |
| **Warm Grey** | ${brandAnalysis.colorPalette.secondary.hex} | ${brandAnalysis.colorPalette.secondary.rgb} | ${brandAnalysis.colorPalette.secondary.usage} |
| **Pure White** | ${brandAnalysis.colorPalette.neutral.hex} | ${brandAnalysis.colorPalette.neutral.rgb} | ${brandAnalysis.colorPalette.neutral.usage} |

### Accent Colors
| Color | Hex Code | RGB | Usage |
|-------|----------|-----|-------|
| **Rich Red** | ${brandAnalysis.colorPalette.accent.hex} | ${brandAnalysis.colorPalette.accent.rgb} | ${brandAnalysis.colorPalette.accent.usage} |
| **Medium Grey** | ${brandAnalysis.colorPalette.darkGrey.hex} | ${brandAnalysis.colorPalette.darkGrey.rgb} | ${brandAnalysis.colorPalette.darkGrey.usage} |

## Typography System

### Font Families
| Purpose | Font Family | Characteristics |
|---------|-------------|-----------------|
| **Primary Headings** | ${brandAnalysis.typography.primaryFont.family} | ${brandAnalysis.typography.primaryFont.characteristics} |
| **Body Text** | ${brandAnalysis.typography.secondaryFont.family} | ${brandAnalysis.typography.secondaryFont.characteristics} |
| **UI Elements** | ${brandAnalysis.typography.supportingFont.family} | ${brandAnalysis.typography.supportingFont.characteristics} |

### Typography Hierarchy
| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| **H1** | ${brandAnalysis.typography.hierarchy.h1.size} | ${brandAnalysis.typography.hierarchy.h1.weight} | ${brandAnalysis.typography.hierarchy.h1.lineHeight} | ${brandAnalysis.typography.hierarchy.h1.usage} |
| **H2** | ${brandAnalysis.typography.hierarchy.h2.size} | ${brandAnalysis.typography.hierarchy.h2.weight} | ${brandAnalysis.typography.hierarchy.h2.lineHeight} | ${brandAnalysis.typography.hierarchy.h2.usage} |
| **H3** | ${brandAnalysis.typography.hierarchy.h3.size} | ${brandAnalysis.typography.hierarchy.h3.weight} | ${brandAnalysis.typography.hierarchy.h3.lineHeight} | ${brandAnalysis.typography.hierarchy.h3.usage} |
| **Body** | ${brandAnalysis.typography.hierarchy.body.size} | ${brandAnalysis.typography.hierarchy.body.weight} | ${brandAnalysis.typography.hierarchy.body.lineHeight} | ${brandAnalysis.typography.hierarchy.body.usage} |

## Dashboard Design Recommendations

### Color Scheme Implementation
| Element | Color | Hex Code | Usage in Dashboard |
|---------|-------|----------|-------------------|
| **Primary Text** | Deep Charcoal | ${dashboardRecommendations.colorScheme.primary} | Main headings, data labels |
| **Secondary Text** | Warm Grey | ${dashboardRecommendations.colorScheme.secondary} | Subheadings, metadata |
| **Background** | Pure White | ${dashboardRecommendations.colorScheme.background} | Main dashboard background |
| **Card Backgrounds** | Soft Beige | ${dashboardRecommendations.colorScheme.cards} | Widget/card backgrounds |
| **Alert/Important** | Rich Red | ${dashboardRecommendations.colorScheme.accent} | Critical metrics, alerts |
| **Success/Positive** | Deep Green | ${dashboardRecommendations.colorScheme.success} | Positive metrics, growth |

### Typography for Dashboard
| Element | Font & Size | Weight | Usage |
|---------|-------------|--------|-------|
| **Dashboard Title** | ${dashboardRecommendations.typography.headings}, ${dashboardRecommendations.typography.hierarchy.dashboard_title} | 400 | Main dashboard heading |
| **Section Headers** | ${dashboardRecommendations.typography.headings}, ${dashboardRecommendations.typography.hierarchy.section_headers} | 500 | Widget/section titles |
| **Metric Labels** | ${dashboardRecommendations.typography.ui}, ${dashboardRecommendations.typography.hierarchy.metric_labels} | 500 | Data point labels |
| **Data Values** | ${dashboardRecommendations.typography.body}, ${dashboardRecommendations.typography.hierarchy.data_values} | 600 | Actual metric values |

### Design Principles for Dashboard

#### Layout & Spacing
- **Spacing**: ${dashboardRecommendations.designElements.spacing}
- **Cards**: ${dashboardRecommendations.designElements.cards}
- **Visual Hierarchy**: Maintain MOI's sophisticated minimalism

#### Data Visualization Guidelines
${dashboardRecommendations.dataVisualization.principles.map(principle => `- ${principle}`).join('\\n')}

#### Chart Color Palette
**Primary Chart Colors**: ${dashboardRecommendations.dataVisualization.primary_chart_colors.join(', ')}
**Background Options**: ${dashboardRecommendations.dataVisualization.background_colors.join(', ')}

## Brand Personality Integration

### Key Adjectives
${brandAnalysis.brandPersonality.adjectives.map(adj => `- ${adj}`).join('\\n')}

### Design Approach
- **Visual Style**: ${brandAnalysis.designPrinciples.visualStyle}
- **Layout Philosophy**: ${brandAnalysis.designPrinciples.layout}
- **Color Strategy**: ${brandAnalysis.designPrinciples.colorUsage}

## Implementation Guidelines

### Do's
✅ Use generous white space to maintain premium feel
✅ Prioritize readability with high contrast ratios
✅ Keep data visualizations clean and minimal
✅ Use brand colors consistently across all elements
✅ Maintain sophisticated typography hierarchy

### Don'ts
❌ Overcrowd the interface with too many elements
❌ Use bright, saturated colors that clash with brand palette
❌ Mix too many font families
❌ Compromise on spacing for more content
❌ Use busy or distracting visual elements

## Technical Implementation

### CSS Custom Properties
\`\`\`css
:root {
  /* Brand Colors */
  --moi-primary: #141314;
  --moi-secondary: #3F3E3E;
  --moi-accent: #721C24;
  --moi-neutral: #FFFFFF;
  --moi-background: #F5F3F0;
  --moi-success: #2D5530;
  
  /* Typography */
  --font-primary: 'orpheuspro', serif;
  --font-secondary: 'BentonSans Book', sans-serif;
  --font-ui: 'BentonSans', sans-serif;
}
\`\`\`

### Dashboard Component Styling
\`\`\`css
.dashboard-title {
  font-family: var(--font-primary);
  font-size: 32px;
  font-weight: 400;
  color: var(--moi-primary);
}

.metric-card {
  background: var(--moi-background);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.metric-value {
  font-family: var(--font-secondary);
  font-size: 24px;
  font-weight: 600;
  color: var(--moi-primary);
}
\`\`\`

---

*Generated on ${new Date().toLocaleDateString()} from MOI brand analysis*
*Source: vibewithmoi.in homepage capture and CSS analysis*
`;
}

function generateColorCSV(colorPalette) {
  let csv = 'Color Name,Hex Code,RGB,Usage,Category\\n';
  
  // Primary colors
  Object.entries(colorPalette).forEach(([key, color]) => {
    if (key !== 'extended') {
      csv += `"${color.name}","${color.hex}","${color.rgb}","${color.usage}","Primary"\\n`;
    }
  });
  
  // Extended colors
  if (colorPalette.extended) {
    Object.entries(colorPalette.extended).forEach(([key, color]) => {
      csv += `"${color.name}","${color.estimated_hex}","Estimated","${color.usage}","Extended"\\n`;
    });
  }
  
  return csv;
}

// Run the analysis
createBrandAnalysis();