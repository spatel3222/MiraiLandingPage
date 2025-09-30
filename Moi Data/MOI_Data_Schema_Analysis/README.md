# MOI Data Schema Analysis Project

## 📁 Folder Structure

| Folder | Purpose | Key Files |
|--------|---------|-----------|
| **01_Original_Data** | Source data references | Links to input example files |
| **02_Analysis_Scripts** | Python transformation code | Data pipeline scripts |
| **03_Reports_Final** | Executive documentation | MOI_Data_Schema_Mapping_Analysis.md |
| **04_Visualizations** | Charts and dashboards | Schema diagrams, flow charts |
| **05_CSV_Outputs** | Processed data outputs | Column_Mapping_Matrix.csv |
| **06_Archive_Previous** | Older versions | Previous iterations |
| **07_Technical_Summaries** | Implementation details | Data_Transformation_Specifications.json |

## 🎯 Quick Start

### **For Executives**
1. Read **03_Reports_Final/MOI_Data_Schema_Mapping_Analysis.md**
2. Review executive summary and business impact metrics
3. Check implementation roadmap timeline

### **For Technical Implementation**
1. Study **07_Technical_Summaries/Data_Transformation_Specifications.json**
2. Review **05_CSV_Outputs/Column_Mapping_Matrix.csv**
3. Reference original files in MOI Original Data/Input Example/

### **For Data Analysis**
1. Examine input file schemas in the main report
2. Understand transformation requirements
3. Implement using provided specifications

## 📊 Key Insights

### **Data Sources**
- **Meta Ads**: 7.6 KB, campaign/adset performance data
- **GA4 Export**: 437 B, Google Ads campaign metrics  
- **Shopify Export**: 112 MB, user behavior and conversion tracking

### **Output Targets**
- **Adset Level Matrices**: Campaign performance with quality metrics
- **Top Level Daily Metrics**: Daily aggregated cross-channel performance

### **Critical Mappings**
- Meta Ads → Shopify attribution via UTM parameters
- Quality user identification (1min+ sessions)
- Cross-platform cost efficiency calculations

## 🛠️ Implementation Priority

1. **High Priority**: UTM campaign/adset attribution logic
2. **Medium Priority**: Quality user metric calculations  
3. **Low Priority**: Manual input fields (remarks, status)

## 🚨 Known Challenges

- **Template Variables**: Shopify data contains `{{campaign.name}}` patterns requiring resolution
- **Large File Size**: Shopify export (112 MB) needs chunked processing
- **Attribution Gaps**: Some Shopify sessions lack UTM data

## 📈 Expected Benefits

- **95%+ automation** of current manual process
- **99%+ accuracy** with proper validation
- **15 minutes** total processing time vs 8 hours manual

*Last Updated: September 29, 2025*
*Project: MOI Analytics Dashboard Data Pipeline*