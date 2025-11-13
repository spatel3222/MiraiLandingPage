# Mirai360.ai Typography Specifications

## Primary Font Family: Inter

**Google Fonts**: https://fonts.google.com/specimen/Inter
**Font Files**: Available in Inter_Font_Files/ directory

### Font Weights Available
- **Regular (400)**: Body text, descriptions, captions
- **Medium (500)**: Subheadings, emphasis, navigation
- **SemiBold (600)**: Section titles, card headers
- **Bold (700)**: Display headlines, hero titles

## Logo Typography

### Primary Logo: mirai360.ai
- **Visual Height Optimization**: Characters sized for uniform visual appearance
- **Base Size**: 48px for most characters (m, r, a, 3, 6, 0, ., a)
- **Adjusted Size**: 52px for "i" characters to match visual height of other letters
- **Weight Distribution**: 
  - "mirai360": font-weight 700 (Bold), color #1B365D
  - ".ai": font-weight 500 (Medium), color #2E86C1
- **Design Principle**: All characters appear visually uniform in height through selective font size adjustments
- **Light Version**: Same sizing hierarchy, colors adjusted for dark backgrounds

## Typography Hierarchy

### Display Text
- **Font Size**: 3.5rem (56px)
- **Font Weight**: 700 (Bold)
- **Line Height**: 1.1
- **Letter Spacing**: -0.025em
- **Usage**: Hero headlines, main page titles

### Heading 1
- **Font Size**: 2.5rem (40px)
- **Font Weight**: 600 (SemiBold)
- **Line Height**: 1.2
- **Letter Spacing**: Normal
- **Usage**: Section titles, major headings

### Heading 2
- **Font Size**: 1.5rem (24px)
- **Font Weight**: 600 (SemiBold)
- **Line Height**: 1.3
- **Letter Spacing**: Normal
- **Usage**: Subsection titles, component headers

### Heading 3
- **Font Size**: 1.25rem (20px)
- **Font Weight**: 500 (Medium)
- **Line Height**: 1.4
- **Letter Spacing**: Normal
- **Usage**: Card titles, list headers

### Body Text
- **Font Size**: 1rem (16px)
- **Font Weight**: 400 (Regular)
- **Line Height**: 1.6
- **Letter Spacing**: Normal
- **Usage**: Paragraphs, descriptions, content

### Caption
- **Font Size**: 0.875rem (14px)
- **Font Weight**: 400 (Regular)
- **Line Height**: 1.5
- **Letter Spacing**: Normal
- **Usage**: Labels, metadata, fine print

## Typography Principles

### Professional Readability
- **Minimum Size**: 16px for body text (legal document standards)
- **Line Height**: 1.6 for optimal legal document reading
- **Generous Spacing**: 40% more white space than traditional designs

### Legal Industry Standards
- High contrast for long reading sessions
- Clear hierarchy for document structure
- Professional appearance for client communications
- Accessibility compliance for diverse users

### Color Usage
- **Navy Primary (#1B365D)**: Headlines, important text
- **Navy Light (#405A7A)**: Body text, readable content
- **Professional Gray (#566573)**: Supporting text, captions
- **Tech Accent (#2E86C1)**: Links, highlights, CTAs

## Responsive Typography

### Desktop (1200px+)
- Use full font sizes as specified
- Maintain generous spacing
- Multi-column layouts where appropriate

### Tablet (768px - 1199px)
- Reduce display text to 3rem
- Maintain hierarchy relationships
- Optimize for touch targets

### Mobile (320px - 767px)
- Reduce display text to 2.5rem
- Stack content vertically
- Increase touch target sizes
- Maintain readability

## CSS Implementation

```css
:root {
  /* Typography Scale */
  --font-size-display: 3.5rem;
  --font-size-h1: 2.5rem;
  --font-size-h2: 1.5rem;
  --font-size-h3: 1.25rem;
  --font-size-body: 1rem;
  --font-size-caption: 0.875rem;
  
  /* Font Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Line Heights */
  --line-height-tight: 1.1;
  --line-height-snug: 1.2;
  --line-height-normal: 1.3;
  --line-height-relaxed: 1.4;
  --line-height-loose: 1.6;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: var(--font-size-body);
  line-height: var(--line-height-loose);
  color: #405A7A;
}
```

## Usage Guidelines

### Do's
✅ Use Inter font family consistently
✅ Maintain proper font weight hierarchy
✅ Use generous line heights (1.6 for body)
✅ Ensure accessibility contrast ratios
✅ Scale responsively for all devices

### Don'ts
❌ Mix with other font families
❌ Use too many font weights (max 4)
❌ Reduce line height below 1.4
❌ Use font sizes smaller than 14px
❌ Ignore responsive scaling needs