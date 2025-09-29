# MOI Brand Guidelines for Dashboard Design

## Executive Summary
MOI is a sophisticated boutique fine jewelry brand that embodies "Boutique Everyday Luxury." Their visual identity emphasizes minimalist elegance, premium typography, and a refined color palette that would translate beautifully to analytics dashboards.

## Brand Overview
- **Brand Name**: MOI - Boutique Fine Jewellery
- **Website**: https://vibewithmoi.in/
- **Tagline**: Boutique Everyday Luxury
- **Brand Personality**: Sophisticated, accessible luxury

## Color Palette

### Primary Colors
| Color | Hex Code | RGB | Usage |
|-------|----------|-----|-------|
| **Deep Charcoal** | #141314 | rgb(20, 19, 20) | Primary text, headings, body content |
| **Warm Grey** | #3F3E3E | rgb(63, 62, 62) | Secondary text, navigation labels, category headers |
| **Pure White** | #FFFFFF | rgb(255, 255, 255) | Backgrounds, overlay text on images |

### Accent Colors
| Color | Hex Code | RGB | Usage |
|-------|----------|-----|-------|
| **Rich Red** | #721C24 | rgb(114, 28, 36) | Error messages, sale notifications |
| **Medium Grey** | #2C2C2C | rgb(44, 44, 44) | Emphasized content sections |

## Typography System

### Font Families
| Purpose | Font Family | Characteristics |
|---------|-------------|-----------------|
| **Primary Headings** | orpheuspro | Elegant serif font, sophisticated and premium feel |
| **Body Text** | BentonSans Book | Clean sans-serif, highly readable |
| **UI Elements** | BentonSans | Consistent with secondary but variations in weight |

### Typography Hierarchy
| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| **H1** | 40px | 500 | 42px-50px | Hero headings, main page titles |
| **H2** | 27px-32px | 100-400 | 32.4px-37px | Section headings, major content blocks |
| **H3** | 12px-32px | 400-600 | 12px-34px | Product titles, category labels, subsections |
| **Body** | 16px | normal | normal | General content, descriptions |

## Dashboard Design Recommendations

### Color Scheme Implementation
| Element | Color | Hex Code | Usage in Dashboard |
|---------|-------|----------|-------------------|
| **Primary Text** | Deep Charcoal | #141314 | Main headings, data labels |
| **Secondary Text** | Warm Grey | #3F3E3E | Subheadings, metadata |
| **Background** | Pure White | #FFFFFF | Main dashboard background |
| **Card Backgrounds** | Soft Beige | #F5F3F0 | Widget/card backgrounds |
| **Alert/Important** | Rich Red | #721C24 | Critical metrics, alerts |
| **Success/Positive** | Deep Green | #2D5530 | Positive metrics, growth |

### Typography for Dashboard
| Element | Font & Size | Weight | Usage |
|---------|-------------|--------|-------|
| **Dashboard Title** | orpheuspro, serif, 32px, weight 400 | 400 | Main dashboard heading |
| **Section Headers** | orpheuspro, serif, 18px, weight 500 | 500 | Widget/section titles |
| **Metric Labels** | BentonSans, sans-serif, 12px, weight 500 | 500 | Data point labels |
| **Data Values** | BentonSans Book, sans-serif, 16px-24px, weight 600 | 600 | Actual metric values |

### Design Principles for Dashboard

#### Layout & Spacing
- **Spacing**: Generous padding (24px-32px) to maintain luxury feel
- **Cards**: Subtle shadows, rounded corners (8px), beige backgrounds
- **Visual Hierarchy**: Maintain MOI's sophisticated minimalism

#### Data Visualization Guidelines
- High contrast for accessibility\n- Minimal decoration to focus on data\n- Consistent with brand's sophisticated aesthetic\n- Use brand red sparingly for important alerts/metrics

#### Chart Color Palette
**Primary Chart Colors**: #141314, #3F3E3E, #721C24, #2D5530
**Background Options**: #F5F3F0, #F8F8F8

## Brand Personality Integration

### Key Adjectives
- Elegant\n- Modern\n- Refined\n- Approachable\n- Premium

### Design Approach
- **Visual Style**: Minimalist luxury with sophisticated typography
- **Layout Philosophy**: Clean, spacious layouts with generous white space
- **Color Strategy**: Monochromatic with strategic color accents

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
```css
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
```

### Dashboard Component Styling
```css
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
```

---

*Generated on 9/29/2025 from MOI brand analysis*
*Source: vibewithmoi.in homepage capture and CSS analysis*
