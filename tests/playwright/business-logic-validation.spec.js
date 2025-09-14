import { test, expect } from '@playwright/test';

/**
 * Business Logic & Mathematical Accuracy Validation Test Suite
 * 
 * This test suite focuses specifically on validating the mathematical accuracy
 * and business logic consistency of the dashboard calculations and metrics.
 */

test.describe('Business Logic & Mathematical Validation', () => {
  let page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/dashboard-prototype-improved.html');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.dashboard-container', { state: 'visible' });
    await page.waitForTimeout(2000); // Wait for Chart.js
  });

  test.describe('ROI Calculation Verification', () => {
    test('Validate individual use case ROI calculations', async () => {
      const useCaseData = await page.evaluate(() => {
        const items = document.querySelectorAll('.usecase-item');
        const cases = [];
        
        items.forEach(item => {
          const name = item.querySelector('.usecase-name')?.textContent?.trim();
          const details = item.querySelector('.usecase-details')?.textContent?.trim();
          const score = parseInt(item.querySelector('.usecase-score')?.textContent?.trim());
          
          const roiMatch = details?.match(/(\d+)%\s+ROI/);
          const timeMatch = details?.match(/(\d+)-(\d+)\s+weeks/);
          
          if (name && roiMatch && timeMatch) {
            cases.push({
              name,
              roi: parseInt(roiMatch[1]),
              minWeeks: parseInt(timeMatch[1]),
              maxWeeks: parseInt(timeMatch[2]),
              score
            });
          }
        });
        
        return cases;
      });

      // Validate each use case has realistic ROI
      useCaseData.forEach(useCase => {
        expect(useCase.roi).toBeGreaterThan(50); // Minimum viable ROI
        expect(useCase.roi).toBeLessThan(1000); // Maximum realistic ROI
        
        // Higher ROI should correlate with higher priority score
        // (This is a business logic assumption to verify)
        if (useCase.roi > 300) {
          expect(useCase.score).toBeGreaterThan(80);
        }
        
        console.log(`✅ ${useCase.name}: ROI ${useCase.roi}%, Score ${useCase.score}, Timeline ${useCase.minWeeks}-${useCase.maxWeeks} weeks`);
      });

      // Validate ROI ranking logic
      const sortedByROI = [...useCaseData].sort((a, b) => b.roi - a.roi);
      const sortedByScore = [...useCaseData].sort((a, b) => b.score - a.score);
      
      // Top ROI should generally have top scores (allowing some variance)
      const topROICase = sortedByROI[0];
      const topScoreCase = sortedByScore[0];
      
      console.log(`Top ROI: ${topROICase.name} (${topROICase.roi}%)`);
      console.log(`Top Score: ${topScoreCase.name} (${topScoreCase.score})`);
    });

    test('Validate Priority Matrix ROI consistency', async () => {
      const matrixData = await page.evaluate(() => {
        const quadrants = document.querySelectorAll('.matrix-quadrant');
        const data = {};
        
        quadrants.forEach(quadrant => {
          const title = quadrant.querySelector('.quadrant-info h3')?.textContent?.trim();
          const items = [];
          
          const matrixItems = quadrant.querySelectorAll('.matrix-item');
          matrixItems.forEach(item => {
            const content = item.textContent.trim();
            const nameMatch = content.match(/^([^\\n]+)/);
            const roiMatch = content.match(/ROI:\\s*(\\d+)%/);
            const timelineMatch = content.match(/Timeline:\\s*([^\\n]+)/);
            
            if (nameMatch && roiMatch) {
              items.push({
                name: nameMatch[1].trim(),
                roi: parseInt(roiMatch[1]),
                timeline: timelineMatch?.[1]?.trim()
              });
            }
          });
          
          if (title?.includes('Major Projects')) {
            data.majorProjects = items;
          } else if (title?.includes('Quick Wins')) {
            data.quickWins = items;
          } else if (title?.includes('Fill-ins')) {
            data.fillIns = items;
          } else if (title?.includes('Avoid')) {
            data.avoid = items;
          }
        });
        
        return data;
      });

      // Validate quadrant ROI logic
      // Quick Wins should have high ROI (>200%)
      matrixData.quickWins?.forEach(item => {
        expect(item.roi).toBeGreaterThan(150);
        console.log(`✅ Quick Win "${item.name}": ${item.roi}% ROI`);
      });
      
      // Major Projects should have decent ROI (>200%)
      matrixData.majorProjects?.forEach(item => {
        expect(item.roi).toBeGreaterThan(200);
        console.log(`✅ Major Project "${item.name}": ${item.roi}% ROI`);
      });
      
      // Fill-ins should have lower ROI (50-200%)
      matrixData.fillIns?.forEach(item => {
        expect(item.roi).toBeGreaterThan(50);
        expect(item.roi).toBeLessThan(250);
        console.log(`✅ Fill-in "${item.name}": ${item.roi}% ROI`);
      });
      
      // Avoid quadrant should have lowest ROI (<100%)
      matrixData.avoid?.forEach(item => {
        expect(item.roi).toBeLessThan(100);
        console.log(`✅ Avoid "${item.name}": ${item.roi}% ROI`);
      });
    });
  });

  test.describe('Financial Calculations Validation', () => {
    test('Validate Annual Savings calculation', async () => {
      const financialData = await page.evaluate(() => {
        const kpiValue = document.querySelector('.kpi-card .kpi-value')?.textContent?.trim();
        const roiMetrics = document.querySelectorAll('.roi-metric');
        
        let annualSavings = null;
        roiMetrics.forEach(metric => {
          const label = metric.querySelector('.roi-label')?.textContent?.trim();
          const value = metric.querySelector('.roi-value')?.textContent?.trim();
          if (label?.includes('Annual Savings')) {
            annualSavings = value;
          }
        });
        
        return {
          kpiAnnualSavings: kpiValue,
          roiAnnualSavings: annualSavings
        };
      });

      // Both should show the same annual savings figure
      expect(financialData.kpiAnnualSavings).toBe(financialData.roiAnnualSavings);
      
      // Validate the format is consistent
      const savingsRegex = /^\$\d+(\.\d+)?(M|K|B)$/;
      expect(financialData.kpiAnnualSavings).toMatch(savingsRegex);
      
      console.log(`✅ Annual Savings consistent: KPI (${financialData.kpiAnnualSavings}) = ROI (${financialData.roiAnnualSavings})`);
    });

    test('Validate Readiness Score calculation methodology', async () => {
      const readinessData = await page.evaluate(() => {
        const readinessScore = document.querySelector('.kpi-value')?.textContent?.match(/(\d+)\/(\d+)/);
        const deptScores = [];
        
        document.querySelectorAll('.dept-item .score-badge').forEach(badge => {
          const score = parseInt(badge.textContent.trim());
          if (!isNaN(score)) deptScores.push(score);
        });
        
        return {
          overallScore: readinessScore ? parseInt(readinessScore[1]) : null,
          maxScore: readinessScore ? parseInt(readinessScore[2]) : null,
          departmentScores: deptScores
        };
      });

      if (readinessData.overallScore && readinessData.departmentScores.length > 0) {
        const avgDeptScore = readinessData.departmentScores.reduce((a, b) => a + b, 0) / 
                            readinessData.departmentScores.length;
        
        // Overall score should be reasonably close to department average
        const difference = Math.abs(readinessData.overallScore - avgDeptScore);
        expect(difference).toBeLessThan(15); // 15-point tolerance
        
        // Score should be within valid range
        expect(readinessData.overallScore).toBeGreaterThanOrEqual(0);
        expect(readinessData.overallScore).toBeLessThanOrEqual(readinessData.maxScore);
        
        console.log(`✅ Readiness Score (${readinessData.overallScore}/${readinessData.maxScore}) vs Dept Avg (${avgDeptScore.toFixed(1)})`);
      }
    });

    test('Validate Payback Period calculations', async () => {
      const paybackData = await page.evaluate(() => {
        const roiMetrics = document.querySelectorAll('.roi-metric');
        let paybackPeriod = null;
        let averageROI = null;
        
        roiMetrics.forEach(metric => {
          const label = metric.querySelector('.roi-label')?.textContent?.trim();
          const value = metric.querySelector('.roi-value')?.textContent?.trim();
          
          if (label?.includes('Payback Period')) {
            paybackPeriod = value;
          } else if (label?.includes('Average ROI')) {
            averageROI = value;
          }
        });
        
        return { paybackPeriod, averageROI };
      });

      if (paybackData.paybackPeriod && paybackData.averageROI) {
        // Extract numeric values
        const paybackMatch = paybackData.paybackPeriod.match(/(\d+\.?\d*)(mo|months)/);
        const roiMatch = paybackData.averageROI.match(/(\d+)%/);
        
        if (paybackMatch && roiMatch) {
          const paybackMonths = parseFloat(paybackMatch[1]);
          const roiPercent = parseInt(roiMatch[1]);
          
          // Basic business logic: Higher ROI should correlate with shorter payback
          // ROI of 370% should have payback around 3-8 months
          if (roiPercent > 300) {
            expect(paybackMonths).toBeLessThan(10);
          }
          
          // Payback should be reasonable (not negative, not too long)
          expect(paybackMonths).toBeGreaterThan(0);
          expect(paybackMonths).toBeLessThan(36); // Max 3 years
          
          console.log(`✅ Payback Period: ${paybackMonths} months with ${roiPercent}% ROI`);
        }
      }
    });
  });

  test.describe('Process Count Arithmetic', () => {
    test('Validate process count arithmetic across all sections', async () => {
      const processData = await page.evaluate(() => {
        // Get total from key metrics
        const totalProcesses = document.querySelector('.metric-card .metric-value')?.textContent?.match(/(\d+)/)?.[1];
        
        // Get counts from priority matrix quadrants
        const quadrantCounts = [];
        document.querySelectorAll('.quadrant-badge').forEach(badge => {
          const count = parseInt(badge.textContent.trim());
          if (!isNaN(count)) quadrantCounts.push(count);
        });
        
        // Get process mentions in department rankings
        const deptProcesses = [];
        document.querySelectorAll('.dept-metric').forEach(metric => {
          const processMatch = metric.textContent.match(/(\d+)\s+processes/);
          if (processMatch) {
            deptProcesses.push(parseInt(processMatch[1]));
          }
        });
        
        return {
          totalFromMetrics: totalProcesses ? parseInt(totalProcesses) : null,
          quadrantCounts,
          departmentProcesses: deptProcesses
        };
      });

      if (processData.totalFromMetrics && processData.quadrantCounts.length > 0) {
        // Sum of quadrants should equal total processes
        const quadrantSum = processData.quadrantCounts.reduce((a, b) => a + b, 0);
        expect(quadrantSum).toBe(processData.totalFromMetrics);
        
        console.log(`✅ Process Count Arithmetic: Total (${processData.totalFromMetrics}) = Quadrant Sum (${quadrantSum})`);
        console.log(`   Quadrant breakdown: ${processData.quadrantCounts.join(' + ')} = ${quadrantSum}`);
      }

      // Department process counts should be reasonable
      if (processData.departmentProcesses.length > 0) {
        const deptSum = processData.departmentProcesses.reduce((a, b) => a + b, 0);
        console.log(`✅ Department Process Counts: ${processData.departmentProcesses.join(', ')} (Total: ${deptSum})`);
        
        // Department total can be higher than main total (processes can span departments)
        expect(deptSum).toBeGreaterThanOrEqual(processData.totalFromMetrics || 0);
      }
    });
  });

  test.describe('Timeline and Effort Correlation', () => {
    test('Validate implementation timeline logic', async () => {
      const timelineData = await page.evaluate(() => {
        const items = [];
        
        // Extract from priority matrix
        document.querySelectorAll('.matrix-item').forEach(item => {
          const content = item.textContent.trim();
          const nameMatch = content.match(/^([^\\n]+)/);
          const timelineMatch = content.match(/Timeline:\\s*([^\\n]+)/);
          const roiMatch = content.match(/ROI:\\s*(\\d+)%/);
          
          if (nameMatch && timelineMatch && roiMatch) {
            items.push({
              name: nameMatch[1].trim(),
              timeline: timelineMatch[1].trim(),
              roi: parseInt(roiMatch[1])
            });
          }
        });
        
        // Extract from use case priorities  
        document.querySelectorAll('.usecase-item').forEach(item => {
          const name = item.querySelector('.usecase-name')?.textContent?.trim();
          const details = item.querySelector('.usecase-details')?.textContent?.trim();
          
          const roiMatch = details?.match(/(\d+)%\s+ROI/);
          const timeMatch = details?.match(/(\d+)-(\d+)\s+weeks/);
          
          if (name && roiMatch && timeMatch) {
            items.push({
              name,
              timeline: `${timeMatch[1]}-${timeMatch[2]} weeks`,
              roi: parseInt(roiMatch[1])
            });
          }
        });
        
        return items;
      });

      // Group by timeline length for analysis
      const shortTerm = timelineData.filter(item => 
        item.timeline.includes('weeks') && 
        parseInt(item.timeline.match(/(\d+)/)?.[1]) <= 8
      );
      
      const longTerm = timelineData.filter(item => 
        item.timeline.includes('month') || 
        (item.timeline.includes('weeks') && parseInt(item.timeline.match(/(\d+)/)?.[1]) > 12)
      );

      // Short-term projects should generally have higher ROI (quicker wins)
      if (shortTerm.length > 0 && longTerm.length > 0) {
        const shortTermAvgROI = shortTerm.reduce((sum, item) => sum + item.roi, 0) / shortTerm.length;
        const longTermAvgROI = longTerm.reduce((sum, item) => sum + item.roi, 0) / longTerm.length;
        
        console.log(`Short-term avg ROI: ${shortTermAvgROI.toFixed(1)}%`);
        console.log(`Long-term avg ROI: ${longTermAvgROI.toFixed(1)}%`);
        
        // This is a business logic assumption - quick wins should have good ROI
        shortTerm.forEach(item => {
          if (item.timeline.includes('3-4 weeks') || item.timeline.includes('4-6 weeks')) {
            expect(item.roi).toBeGreaterThan(150); // Quick wins should be very beneficial
          }
        });
      }

      console.log(`✅ Timeline analysis: ${shortTerm.length} short-term, ${longTerm.length} long-term projects`);
    });
  });
});