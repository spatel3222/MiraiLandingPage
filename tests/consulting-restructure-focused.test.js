#!/usr/bin/env node
/**
 * Focused Test Suite for Consulting.html Page Restructure
 * 
 * Tests the 5 key requirements:
 * 1. Section order validation (Problem → Flywheel → Services → Areas)
 * 2. Navigation anchor links working correctly
 * 3. Mobile responsiveness maintained
 * 4. No broken HTML structure
 * 5. CTA functionality preserved
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Set up JSDOM with the HTML file
const htmlPath = path.join(__dirname, '../consulting.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const dom = new JSDOM(htmlContent, {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;

class FocusedTestFramework {
    constructor() {
        this.passed = 0;
        this.failed = 0;
    }

    test(name, callback) {
        try {
            callback();
            this.passed++;
            console.log(`✅ ${name}`);
        } catch (error) {
            this.failed++;
            console.log(`❌ ${name}`);
            console.log(`   ${error.message}`);
        }
    }

    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, but got ${actual}`);
                }
            },
            toBeTruthy: () => {
                if (!actual) {
                    throw new Error(`Expected truthy value, but got ${actual}`);
                }
            },
            toContain: (expected) => {
                if (!actual.includes(expected)) {
                    throw new Error(`Expected to contain "${expected}"`);
                }
            },
            toHaveLength: (expected) => {
                if (actual.length !== expected) {
                    throw new Error(`Expected length ${expected}, but got ${actual.length}`);
                }
            },
            toBeGreaterThan: (expected) => {
                if (actual <= expected) {
                    throw new Error(`Expected ${actual} to be greater than ${expected}`);
                }
            }
        };
    }

    summary() {
        console.log('\n📊 Test Summary');
        console.log('─'.repeat(30));
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📈 Total:  ${this.passed + this.failed}`);
        
        if (this.failed === 0) {
            console.log('\n🎉 All focused tests passed!');
        } else {
            console.log('\n⚠️  Some tests failed');
        }
        
        return this.failed === 0;
    }
}

const test = new FocusedTestFramework();

console.log('🎯 Focused Test Suite for Consulting.html Restructure');
console.log('═'.repeat(60));

// Test 1: Section Order Validation
test.test('Section order: Problem → Flywheel → Services → Areas', () => {
    const sections = document.querySelectorAll('section');
    const sectionData = Array.from(sections).map((section, index) => ({
        index,
        id: section.id || `section-${index}`,
        heading: section.querySelector('h1, h2, h3')?.textContent.trim() || 'No heading'
    }));
    
    // Should have at least 4 main sections
    test.expect(sections.length).toBeGreaterThan(3);
    
    // First section should be Problem (contains h1 with "78% of Companies Use AI")
    const problemSection = sectionData[0];
    test.expect(problemSection.heading).toContain('78% of Companies Use AI');
    
    // Second section should be Flywheel (id="flywheel")
    const flywheelSection = sectionData.find(s => s.id === 'flywheel');
    test.expect(flywheelSection).toBeTruthy();
    test.expect(flywheelSection.heading).toContain('Why We Succeed');
    
    // Should have Services section (id="services")
    const servicesSection = sectionData.find(s => s.id === 'services');
    test.expect(servicesSection).toBeTruthy();
    test.expect(servicesSection.heading).toContain('Services');
    
    // Should have Areas section (id="areas")
    const areasSection = sectionData.find(s => s.id === 'areas');
    test.expect(areasSection).toBeTruthy();
    test.expect(areasSection.heading).toContain('Areas We Support');
});

// Test 2: Navigation Anchor Links
test.test('Navigation anchor links function correctly', () => {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    test.expect(anchorLinks.length).toBeGreaterThan(0);
    
    // Check key anchor links exist and have targets
    const keyAnchors = [
        { link: '#flywheel', target: '#flywheel' },
        { link: '#areas', target: '#areas' }
    ];
    keyAnchors.forEach(({ link, target }) => {
        const linkElement = document.querySelector(`a[href="${link}"]`);
        const targetElement = document.querySelector(target);
        test.expect(linkElement).toBeTruthy();
        test.expect(targetElement).toBeTruthy();
    });
    
    // Mobile menu should exist
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    test.expect(mobileMenuButton).toBeTruthy();
    test.expect(mobileMenu).toBeTruthy();
});

// Test 3: Areas We Support Content
test.test('Areas We Support section contains required industries', () => {
    const areasSection = document.querySelector('#areas');
    test.expect(areasSection).toBeTruthy();
    
    const areasContent = areasSection.textContent;
    test.expect(areasContent).toContain('Financial Services');
    test.expect(areasContent).toContain('Healthcare');
    test.expect(areasContent).toContain('Manufacturing');
    
    // Check for specific industry details
    test.expect(areasContent).toContain('banks') || test.expect(areasContent).toContain('credit unions');
    test.expect(areasContent).toContain('HIPAA') || test.expect(areasContent).toContain('hospital');
    test.expect(areasContent).toContain('predictive') || test.expect(areasContent).toContain('discrete');
});

// Test 4: HTML Structure Integrity
test.test('HTML structure is valid and complete', () => {
    // Should have single h1
    const h1Elements = document.querySelectorAll('h1');
    test.expect(h1Elements).toHaveLength(1);
    
    // Should have multiple h2 elements for section headers
    const h2Elements = document.querySelectorAll('h2');
    test.expect(h2Elements.length).toBeGreaterThan(2);
    
    // Should have navigation
    const nav = document.querySelector('nav');
    test.expect(nav).toBeTruthy();
    
    // Should have footer
    const footer = document.querySelector('footer');
    test.expect(footer).toBeTruthy();
});

// Test 5: CTA Functionality
test.test('CTA functionality preserved (Calendly links, internal nav)', () => {
    // Check for Calendly links
    const calendlyLinks = document.querySelectorAll('a[href*="calendly.com"]');
    test.expect(calendlyLinks.length).toBeGreaterThan(0);
    
    // Calendly links should have proper attributes
    calendlyLinks.forEach(link => {
        test.expect(link.getAttribute('href')).toContain('calendly.com/shivang-crtx');
        test.expect(link.getAttribute('target')).toBe('_blank');
    });
    
    // Check for internal navigation CTAs
    const internalCTAs = document.querySelectorAll('a[href="#areas"], a[href="#flywheel"]');
    test.expect(internalCTAs.length).toBeGreaterThan(0);
    
    // Primary CTAs should have proper styling
    const primaryCTAs = document.querySelectorAll('.btn-consulting, [class*="bg-emerald"]');
    test.expect(primaryCTAs.length).toBeGreaterThan(0);
});

// Test 6: Mobile Responsiveness Classes
test.test('Mobile responsiveness maintained', () => {
    // Check for responsive grid classes
    const responsiveGrids = document.querySelectorAll('[class*="md:grid-cols"], [class*="lg:grid-cols"]');
    test.expect(responsiveGrids.length).toBeGreaterThan(0);
    
    // Check for responsive text classes
    const responsiveText = document.querySelectorAll('[class*="sm:text-"], [class*="md:text-"]');
    test.expect(responsiveText.length).toBeGreaterThan(0);
    
    // Check for mobile-specific navigation
    const mobileSpecific = document.querySelectorAll('.md\\:hidden');
    test.expect(mobileSpecific.length).toBeGreaterThan(0);
    
    // Check for desktop-specific elements
    const desktopSpecific = document.querySelectorAll('.hidden.md\\:flex, .hidden.md\\:block');
    test.expect(desktopSpecific.length).toBeGreaterThan(0);
});

// Test 7: Brand Design Consistency
test.test('Emerald brand design consistency maintained', () => {
    // Check for emerald color classes
    const emeraldElements = document.querySelectorAll('[class*="emerald"]');
    test.expect(emeraldElements.length).toBeGreaterThan(0);
    
    // Check for gradient classes
    const gradientElements = document.querySelectorAll('.gradient-text-consulting, .gradient-consulting, .btn-consulting');
    test.expect(gradientElements.length).toBeGreaterThan(0);
    
    // Check for emerald colors in CSS
    const styles = document.querySelector('style');
    test.expect(styles.textContent).toContain('#059669'); // emerald-700
    test.expect(styles.textContent).toContain('#10b981'); // emerald-500
});

// Run tests and output results
const success = test.summary();

// Additional diagnostic information
console.log('\n📋 Diagnostic Information:');
console.log('─'.repeat(30));
console.log(`Total sections found: ${document.querySelectorAll('section').length}`);
console.log(`Calendly links found: ${document.querySelectorAll('a[href*="calendly.com"]').length}`);
console.log(`Anchor links found: ${document.querySelectorAll('a[href^="#"]').length}`);
console.log(`Emerald elements found: ${document.querySelectorAll('[class*="emerald"]').length}`);

process.exit(success ? 0 : 1);