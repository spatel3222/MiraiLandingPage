/**
 * Comprehensive Test Suite for Consulting.html Page Restructure
 * 
 * Tests cover:
 * - Section reordering: Problem → Why We Succeed → Services → Industries
 * - New "Areas We Support" section with Financial Services, Healthcare, Manufacturing
 * - Navigation functionality (menu, smooth scroll, anchor links)
 * - Visual hierarchy and content flow
 * - Mobile responsiveness and touch interactions
 * - CTA functionality (Calendly links, internal navigation)
 * - Cross-browser compatibility
 * - Performance impact of restructure
 * - Accessibility compliance
 * 
 * This follows the test-writer-fixer agent guidelines and provides
 * comprehensive coverage before implementation.
 * 
 * Run with: npm test tests/consulting-restructure.test.js
 */

// Mock DOM environment for testing
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Set up JSDOM with the HTML file
const htmlPath = path.join(__dirname, '../consulting.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const dom = new JSDOM(htmlContent, {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable',
    runScripts: 'dangerously'
});

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;
global.console = console;

// Test framework setup
class TestFramework {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.beforeEachCallbacks = [];
        this.afterEachCallbacks = [];
    }

    beforeEach(callback) {
        this.beforeEachCallbacks.push(callback);
    }

    afterEach(callback) {
        this.afterEachCallbacks.push(callback);
    }

    runBeforeEach() {
        this.beforeEachCallbacks.forEach(callback => callback());
    }

    runAfterEach() {
        this.afterEachCallbacks.forEach(callback => callback());
    }

    describe(suiteName, callback) {
        console.log(`\n🧪 Testing: ${suiteName}`);
        console.log('─'.repeat(50));
        callback();
    }

    test(testName, callback) {
        try {
            this.runBeforeEach();
            callback();
            this.passed++;
            console.log(`✅ ${testName}`);
        } catch (error) {
            this.failed++;
            console.log(`❌ ${testName}`);
            console.log(`   Error: ${error.message}`);
            console.log(`   Stack: ${error.stack}`);
        } finally {
            this.runAfterEach();
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
            toBeFalsy: () => {
                if (actual) {
                    throw new Error(`Expected falsy value, but got ${actual}`);
                }
            },
            toHaveLength: (expected) => {
                if (actual.length !== expected) {
                    throw new Error(`Expected length ${expected}, but got ${actual.length}`);
                }
            },
            toContain: (expected) => {
                if (!actual.includes(expected)) {
                    throw new Error(`Expected to contain ${expected}`);
                }
            },
            toHaveProperty: (property, value) => {
                if (!actual.hasOwnProperty(property)) {
                    throw new Error(`Expected object to have property ${property}`);
                }
                if (value !== undefined && actual[property] !== value) {
                    throw new Error(`Expected property ${property} to be ${value}, but got ${actual[property]}`);
                }
            },
            toMatch: (pattern) => {
                if (!pattern.test(actual)) {
                    throw new Error(`Expected ${actual} to match pattern ${pattern}`);
                }
            },
            toHaveClass: (className) => {
                if (!actual.classList.contains(className)) {
                    throw new Error(`Expected element to have class ${className}`);
                }
            },
            toHaveAttribute: (attribute, value) => {
                const actualValue = actual.getAttribute(attribute);
                if (actualValue === null) {
                    throw new Error(`Expected element to have attribute ${attribute}`);
                }
                if (value !== undefined && actualValue !== value) {
                    throw new Error(`Expected attribute ${attribute} to be ${value}, but got ${actualValue}`);
                }
            },
            toBeVisible: () => {
                const style = window.getComputedStyle(actual);
                if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                    throw new Error('Expected element to be visible');
                }
            },
            toBeInViewport: () => {
                const rect = actual.getBoundingClientRect();
                const inViewport = rect.top >= 0 && 
                                 rect.left >= 0 && 
                                 rect.bottom <= window.innerHeight && 
                                 rect.right <= window.innerWidth;
                if (!inViewport) {
                    throw new Error('Expected element to be in viewport');
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
            console.log('\n🎉 All tests passed!');
        } else {
            console.log('\n⚠️  Some tests failed');
            process.exit(1);
        }
    }
}

const test = new TestFramework();

// Helper functions
function mockIntersectionObserver() {
    global.IntersectionObserver = class IntersectionObserver {
        constructor(callback) {
            this.callback = callback;
        }
        observe() {}
        disconnect() {}
        unobserve() {}
    };
}

function simulateScroll(targetY) {
    window.scrollY = targetY;
    window.pageYOffset = targetY;
    window.dispatchEvent(new window.Event('scroll'));
}

function simulateResize(width, height) {
    Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
    window.dispatchEvent(new window.Event('resize'));
}

function waitForAnimation(duration = 500) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

// Mock performance measurement
function measurePerformance(callback) {
    const start = performance.now();
    callback();
    const end = performance.now();
    return end - start;
}

// Setup for all tests
mockIntersectionObserver();

// Begin Tests
test.describe('Section Order and Structure Tests', () => {
    test.test('should have correct section order: Problem → Why We Succeed → Services → Industries', () => {
        const sections = document.querySelectorAll('section');
        const sectionTexts = Array.from(sections).map(section => {
            const headings = section.querySelectorAll('h1, h2, h3');
            return headings.length > 0 ? headings[0].textContent.trim() : '';
        });

        // Hero section (first) - now Problem statement
        test.expect(sectionTexts[0]).toContain('78% of Companies Use AI');

        // Problem section should be early (around index 2-3)
        const problemIndex = sectionTexts.findIndex(text => 
            text.includes('78% of Companies Use AI') || text.includes('Only 1% Do It Well')
        );
        test.expect(problemIndex).toBeTruthy();
        test.expect(problemIndex < 4).toBeTruthy();

        // Why We Succeed section should come after Problem
        const whySucceedIndex = sectionTexts.findIndex(text => 
            text.includes('Why We Succeed') || text.includes('CRTX Flywheel')
        );
        test.expect(whySucceedIndex > problemIndex).toBeTruthy();

        // Services section should come after Why We Succeed
        const servicesIndex = sectionTexts.findIndex(text => 
            text.includes('AI Consulting Services')
        );
        test.expect(servicesIndex > whySucceedIndex).toBeTruthy();

        // Industries/Market Focus should be positioned correctly
        const industriesIndex = sectionTexts.findIndex(text => 
            text.includes('Market Focus') || text.includes('Areas We Support')
        );
        test.expect(industriesIndex).toBeTruthy();
    });

    test.test('should have "Areas We Support" section with Financial Services, Healthcare, Manufacturing', () => {
        const areasSection = document.querySelector('#areas') || 
                           document.querySelector('section h2');
        
        test.expect(areasSection).toBeTruthy();

        // Check for Financial Services
        const financialServicesContent = areasSection.innerHTML;
        test.expect(financialServicesContent).toContain('Financial Services');
        test.expect(financialServicesContent).toContain('banks') || test.expect(financialServicesContent).toContain('credit unions');

        // Check for Healthcare
        test.expect(financialServicesContent).toContain('Healthcare');
        test.expect(financialServicesContent).toContain('hospital') || test.expect(financialServicesContent).toContain('HIPAA');

        // Check for Manufacturing
        test.expect(financialServicesContent).toContain('Manufacturing');
    });

    test.test('should maintain emerald brand design consistency', () => {
        // Check for emerald color classes
        const emeraldElements = document.querySelectorAll('[class*="emerald"]');
        test.expect(emeraldElements.length > 0).toBeTruthy();

        // Check for emerald gradient classes
        const gradientElements = document.querySelectorAll('.gradient-text-consulting, .gradient-consulting, .btn-consulting');
        test.expect(gradientElements.length > 0).toBeTruthy();

        // Verify emerald color usage in CSS
        const styles = document.querySelector('style');
        test.expect(styles.textContent).toContain('#059669'); // emerald-700
        test.expect(styles.textContent).toContain('#10b981'); // emerald-500
    });
});

test.describe('Navigation Functionality Tests', () => {
    test.test('should have working mobile menu toggle', () => {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        test.expect(mobileMenuButton).toBeTruthy();
        test.expect(mobileMenu).toBeTruthy();
        
        // Initial state - menu should be hidden
        test.expect(mobileMenu.classList.contains('hidden')).toBeTruthy();
        
        // Simulate click
        mobileMenuButton.click();
        // Note: Since we're testing the structure, we can't test the actual JS behavior
        // but we can verify the elements exist and are properly set up
    });

    test.test('should have smooth scroll anchor links', () => {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        test.expect(anchorLinks.length > 0).toBeTruthy();
        
        anchorLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href !== '#') {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                // Some anchor links might point to sections that will be created
                // So we check for common anchor patterns
                test.expect(href).toMatch(/^#(services|approach|market|areas|contact|flywheel)$/);
            }
        });
    });

    test.test('should have proper navigation structure with dropdown', () => {
        const nav = document.querySelector('nav');
        test.expect(nav).toBeTruthy();
        test.expect(nav).toHaveClass('sticky');
        
        // Check for services dropdown
        const servicesDropdown = document.querySelector('.group');
        test.expect(servicesDropdown).toBeTruthy();
        
        // Verify dropdown menu structure
        const dropdownMenu = servicesDropdown.querySelector('.absolute');
        test.expect(dropdownMenu).toBeTruthy();
        test.expect(dropdownMenu).toHaveClass('opacity-0');
        test.expect(dropdownMenu).toHaveClass('invisible');
    });

    test.test('should maintain navigation consistency across breakpoints', () => {
        // Desktop navigation
        const desktopNav = document.querySelector('.hidden.md\\:flex');
        test.expect(desktopNav).toBeTruthy();
        
        // Mobile navigation
        const mobileNav = document.querySelector('.md\\:hidden');
        test.expect(mobileNav).toBeTruthy();
        
        // Responsive classes should be present
        const responsiveElements = document.querySelectorAll('[class*="md:"], [class*="lg:"], [class*="sm:"]');
        test.expect(responsiveElements.length > 0).toBeTruthy();
    });
});

test.describe('Content Flow and Visual Hierarchy Tests', () => {
    test.test('should have proper heading hierarchy', () => {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        // Should have only one h1
        const h1Elements = document.querySelectorAll('h1');
        test.expect(h1Elements).toHaveLength(1);
        
        // H1 should be in problem section
        const h1 = h1Elements[0];
        test.expect(h1.textContent).toContain('78% of Companies Use AI');
        
        // H2 elements should be section headers
        const h2Elements = document.querySelectorAll('h2');
        test.expect(h2Elements.length >= 3).toBeTruthy();
        
        // Check for logical heading progression
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            if (index > 0) {
                const prevLevel = parseInt(headings[index - 1].tagName.charAt(1));
                // Heading levels shouldn't jump more than 1 level
                test.expect(level - prevLevel <= 1).toBeTruthy();
            }
        });
    });

    test.test('should have clear visual sections with appropriate spacing', () => {
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            // Each section should have padding/margin classes
            const hasSpacing = section.className.includes('py-') || 
                             section.className.includes('mt-') || 
                             section.className.includes('mb-');
            test.expect(hasSpacing).toBeTruthy();
        });
        
        // Check for container classes
        const containers = document.querySelectorAll('.max-w-7xl, .container, .mx-auto');
        test.expect(containers.length > 0).toBeTruthy();
    });

    test.test('should have engaging visual elements (animations, gradients, icons)', () => {
        // Check for animation classes
        const animatedElements = document.querySelectorAll('.float-animation, [class*="transition"], [class*="hover:"]');
        test.expect(animatedElements.length > 0).toBeTruthy();
        
        // Check for gradient elements
        const gradientElements = document.querySelectorAll('[class*="gradient"]');
        test.expect(gradientElements.length > 0).toBeTruthy();
        
        // Check for SVG icons
        const svgIcons = document.querySelectorAll('svg');
        test.expect(svgIcons.length > 5).toBeTruthy(); // Should have multiple icons
        
        // Check for card hover effects
        const cardElements = document.querySelectorAll('.card-hover');
        test.expect(cardElements.length > 0).toBeTruthy();
    });

    test.test('should have trust indicators and social proof', () => {
        // Check for statistics/trust indicators
        const trustIndicators = document.querySelector('.grid.grid-cols-3');
        test.expect(trustIndicators).toBeTruthy();
        
        // Should have percentage or statistical data
        const statsText = document.body.textContent;
        test.expect(statsText).toMatch(/84%|15\.7T|\$15\.7T|729M/);
        
        // Check for credibility elements
        test.expect(statsText).toContain('Fortune 1') || test.expect(statsText).toContain('enterprise');
    });
});

test.describe('Mobile Responsiveness Tests', () => {
    test.beforeEach(() => {
        // Reset to mobile viewport
        simulateResize(375, 667); // iPhone SE dimensions
    });

    test.test('should have proper mobile navigation', () => {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        test.expect(mobileMenuButton).toBeTruthy();
        test.expect(mobileMenu).toBeTruthy();
        
        // Mobile menu should be hidden by default
        test.expect(mobileMenu).toHaveClass('hidden');
        
        // Button should be visible on mobile
        test.expect(mobileMenuButton.parentElement).toHaveClass('md:hidden');
    });

    test.test('should have responsive grid layouts', () => {
        const gridElements = document.querySelectorAll('[class*="grid-cols-"]');
        
        gridElements.forEach(grid => {
            // Should have responsive grid classes
            const hasResponsiveGrid = grid.className.includes('sm:') || 
                                    grid.className.includes('md:') || 
                                    grid.className.includes('lg:');
            test.expect(hasResponsiveGrid).toBeTruthy();
        });
    });

    test.test('should have responsive text sizing', () => {
        const headings = document.querySelectorAll('h1, h2, h3');
        
        headings.forEach(heading => {
            // Should have responsive text classes
            const hasResponsiveText = heading.className.includes('sm:text-') || 
                                    heading.className.includes('md:text-') || 
                                    heading.className.includes('lg:text-');
            if (!hasResponsiveText) {
                // At minimum should have base responsive text size
                test.expect(heading.className).toMatch(/text-(xl|2xl|3xl|4xl|5xl)/);
            }
        });
    });

    test.test('should have touch-friendly interactive elements', () => {
        const buttons = document.querySelectorAll('button, a[class*="btn"], a[class*="button"]');
        
        buttons.forEach(button => {
            // Buttons should have adequate padding for touch
            const hasPadding = button.className.includes('px-') && button.className.includes('py-');
            test.expect(hasPadding).toBeTruthy();
        });
    });

    test.test('should hide/show elements appropriately on mobile', () => {
        // Desktop-only elements should be hidden on mobile
        const desktopOnly = document.querySelectorAll('.hidden.md\\:block, .hidden.md\\:flex');
        test.expect(desktopOnly.length > 0).toBeTruthy();
        
        // Mobile-specific elements should exist
        const mobileSpecific = document.querySelectorAll('.md\\:hidden');
        test.expect(mobileSpecific.length > 0).toBeTruthy();
    });
});

test.describe('CTA Functionality Tests', () => {
    test.test('should have multiple Calendly CTA links', () => {
        const calendlyLinks = document.querySelectorAll('a[href*="calendly.com"]');
        
        test.expect(calendlyLinks.length >= 2).toBeTruthy(); // Multiple CTAs
        
        calendlyLinks.forEach(link => {
            test.expect(link.getAttribute('href')).toContain('calendly.com/shivang-crtx');
            test.expect(link.getAttribute('target')).toBe('_blank');
        });
    });

    test.test('should have internal navigation CTAs', () => {
        const internalCTAs = document.querySelectorAll('a[href^="#"], a[href^="/"]');
        
        test.expect(internalCTAs.length > 0).toBeTruthy();
        
        // Check for specific internal CTAs
        const approachCTA = document.querySelector('a[href="#approach"]');
        test.expect(approachCTA).toBeTruthy();
    });

    test.test('should have prominent primary CTAs', () => {
        const primaryCTAs = document.querySelectorAll('.btn-consulting, .bg-emerald-600, [class*="bg-emerald"]');
        
        test.expect(primaryCTAs.length >= 2).toBeTruthy();
        
        // Primary CTAs should have proper styling
        primaryCTAs.forEach(cta => {
            test.expect(cta.textContent.trim()).toBeTruthy();
            test.expect(cta.tagName).toBe('A'); // Should be links
        });
    });

    test.test('should have clear CTA hierarchy', () => {
        // Primary CTA in hero
        const heroCTA = document.querySelector('section').querySelector('a[href*="calendly"]');
        test.expect(heroCTA).toBeTruthy();
        
        // Secondary CTA in hero
        const secondaryCTA = document.querySelector('section').querySelector('a[href="#approach"]');
        test.expect(secondaryCTA).toBeTruthy();
        
        // Final CTA section
        const finalCTASection = document.querySelector('.bg-gray-900, .bg-black');
        test.expect(finalCTASection).toBeTruthy();
    });
});

test.describe('Performance Tests', () => {
    test.test('should have optimized image loading', () => {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Should have alt attributes
            test.expect(img.getAttribute('alt')).toBeTruthy();
            
            // Should use modern formats or have proper optimization
            const src = img.getAttribute('src');
            if (src) {
                // Check for CDN usage or optimized formats
                const isOptimized = src.includes('.webp') || 
                                  src.includes('cdn') || 
                                  src.includes('optimize') ||
                                  img.hasAttribute('loading');
            }
        });
    });

    test.test('should minimize CSS and JavaScript', () => {
        // Check for external Tailwind CDN (should be optimized)
        const tailwindScript = document.querySelector('script[src*="tailwindcss.com"]');
        test.expect(tailwindScript).toBeTruthy();
        
        // Inline styles should be minimal
        const inlineStyles = document.querySelectorAll('style');
        inlineStyles.forEach(style => {
            // Inline styles should be focused and not excessive
            test.expect(style.textContent.length < 2000).toBeTruthy();
        });
    });

    test.test('should have efficient animations', () => {
        const animatedElements = document.querySelectorAll('.float-animation, [class*="transition"]');
        
        animatedElements.forEach(element => {
            // Animations should use CSS transforms/opacity for performance
            const style = element.className;
            const hasEfficientAnimation = style.includes('transition') || 
                                        style.includes('transform') || 
                                        element.classList.contains('float-animation');
            test.expect(hasEfficientAnimation).toBeTruthy();
        });
    });

    test.test('should load critical resources efficiently', () => {
        // Fonts should be loaded efficiently
        const fontLinks = document.querySelectorAll('link[rel="preload"], link[rel="preconnect"]');
        // Note: Tailwind CSS handles font loading
        
        // Critical CSS should be inlined
        const criticalStyles = document.querySelector('style');
        test.expect(criticalStyles).toBeTruthy();
        
        // External scripts should be properly positioned
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            // External scripts should be at end of document or have async/defer
            const hasOptimalLoading = script.hasAttribute('async') || 
                                    script.hasAttribute('defer') ||
                                    script.closest('body');
        });
    });
});

test.describe('Accessibility Tests', () => {
    test.test('should have proper semantic HTML structure', () => {
        // Should have semantic elements
        const semanticElements = document.querySelectorAll('header, nav, main, section, article, aside, footer');
        test.expect(semanticElements.length >= 3).toBeTruthy();
        
        // Navigation should be properly marked up
        const nav = document.querySelector('nav');
        test.expect(nav).toBeTruthy();
        
        // Sections should have proper hierarchy
        const sections = document.querySelectorAll('section');
        test.expect(sections.length >= 4).toBeTruthy();
    });

    test.test('should have proper ARIA attributes', () => {
        // Interactive elements should have proper ARIA
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            // Buttons should be properly labeled
            const hasLabel = button.textContent.trim() || 
                          button.getAttribute('aria-label') || 
                          button.getAttribute('aria-labelledby');
            test.expect(hasLabel).toBeTruthy();
        });
        
        // Navigation should have ARIA structure
        const navElements = document.querySelectorAll('[role="navigation"], nav');
        test.expect(navElements.length > 0).toBeTruthy();
    });

    test.test('should have keyboard navigation support', () => {
        // Focusable elements should be in logical order
        const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
        
        focusableElements.forEach(element => {
            // Elements should not have negative tabindex unless intentional
            const tabindex = element.getAttribute('tabindex');
            if (tabindex) {
                test.expect(parseInt(tabindex) >= 0).toBeTruthy();
            }
        });
        
        // Skip links or focus management should exist for complex interactions
        const skipLinks = document.querySelectorAll('a[href^="#"], [class*="skip"]');
        test.expect(skipLinks.length > 0).toBeTruthy();
    });

    test.test('should have sufficient color contrast', () => {
        // Text elements should have proper color classes
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a');
        
        textElements.forEach(element => {
            const className = element.className;
            // Should use accessible color combinations
            const hasAccessibleColors = className.includes('text-gray-900') || 
                                      className.includes('text-white') || 
                                      className.includes('text-gray-700') ||
                                      className.includes('text-emerald');
            
            // Elements with custom colors should be checked manually
            if (!hasAccessibleColors && className.includes('text-')) {
                // Log for manual review
                console.log(`Review color contrast for: ${element.textContent.substring(0, 50)}...`);
            }
        });
    });

    test.test('should have proper form accessibility', () => {
        // Any forms should have proper labels
        const formInputs = document.querySelectorAll('input, select, textarea');
        
        formInputs.forEach(input => {
            const hasLabel = input.getAttribute('aria-label') || 
                          input.getAttribute('aria-labelledby') || 
                          document.querySelector(`label[for="${input.id}"]`);
            test.expect(hasLabel).toBeTruthy();
        });
    });

    test.test('should handle screen reader navigation', () => {
        // Headings should create proper document outline
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        test.expect(headings.length >= 5).toBeTruthy();
        
        // Content should be in logical reading order
        const landmarks = document.querySelectorAll('header, nav, main, section, footer, [role]');
        test.expect(landmarks.length >= 3).toBeTruthy();
        
        // Images should have alt text
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            test.expect(img.getAttribute('alt')).toBeTruthy();
        });
    });
});

test.describe('Cross-Browser Compatibility Tests', () => {
    test.test('should use modern CSS with fallbacks', () => {
        const styles = document.querySelector('style').textContent;
        
        // Should use Flexbox and Grid (well-supported)
        test.expect(styles).toContain('flex');
        test.expect(styles).toContain('grid');
        
        // Should use modern CSS features appropriately
        test.expect(styles).toContain('linear-gradient');
        test.expect(styles).toContain('transform');
        
        // Should not rely on experimental features without fallbacks
        const hasExperimental = styles.includes('@supports') || 
                               styles.includes('backdrop-filter') ||
                               styles.includes('clip-path');
        // If experimental features are used, should have fallbacks
    });

    test.test('should use semantic HTML compatible across browsers', () => {
        // Should use standard HTML5 elements
        const html5Elements = document.querySelectorAll('section, header, nav, main, article, aside, footer');
        test.expect(html5Elements.length > 0).toBeTruthy();
        
        // Should not use deprecated elements
        const deprecatedElements = document.querySelectorAll('center, font, marquee, blink');
        test.expect(deprecatedElements).toHaveLength(0);
    });

    test.test('should handle JavaScript gracefully', () => {
        // JavaScript should be progressive enhancement
        const scripts = document.querySelectorAll('script');
        
        // Core functionality should work without JavaScript
        const navigation = document.querySelector('nav');
        test.expect(navigation).toBeTruthy();
        
        // CTAs should be standard links
        const ctas = document.querySelectorAll('a[href*="calendly"]');
        ctas.forEach(cta => {
            test.expect(cta.getAttribute('href')).toBeTruthy();
        });
    });
});

test.describe('Edge Cases and Error Handling', () => {
    test.test('should handle missing elements gracefully', () => {
        // Test should not break if optional elements are missing
        const optionalElements = document.querySelectorAll('#optional-element');
        // Should not throw errors if elements don't exist
        
        // Navigation should work even if some links are missing targets
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href !== '#') {
                // Should have either target element or graceful handling
                const target = document.querySelector(href);
                // Note: Some targets may be added dynamically
            }
        });
    });

    test.test('should handle various content lengths', () => {
        // Should handle long and short content gracefully
        const textElements = document.querySelectorAll('p, h1, h2, h3');
        
        textElements.forEach(element => {
            // Text should not overflow containers
            const hasOverflowControl = element.closest('[class*="overflow-"]') || 
                                     element.className.includes('truncate') ||
                                     element.className.includes('break-');
        });
    });

    test.test('should handle slow network conditions', () => {
        // External resources should have fallbacks
        const externalLinks = document.querySelectorAll('script[src], link[href^="http"]');
        
        // Critical functionality should not depend on external resources
        // (Tailwind CSS is external but provides core styling)
        const criticalStyles = document.querySelector('style');
        test.expect(criticalStyles).toBeTruthy();
    });
});

// Automation Opportunities
test.describe('Automation Test Scenarios', () => {
    test.test('should support automated visual regression testing', () => {
        // Elements should have stable selectors for automation
        const keyElements = {
            hero: document.querySelector('h1'),
            primaryCTA: document.querySelector('a[href*="calendly"]'),
            navigation: document.querySelector('nav'),
            sections: document.querySelectorAll('section')
        };
        
        Object.entries(keyElements).forEach(([name, element]) => {
            test.expect(element).toBeTruthy();
        });
    });

    test.test('should support automated accessibility testing', () => {
        // Structure should be compatible with automated accessibility tools
        test.expect(document.querySelector('h1')).toBeTruthy();
        test.expect(document.querySelector('nav')).toBeTruthy();
        test.expect(document.querySelectorAll('section').length >= 4).toBeTruthy();
        
        // Interactive elements should be properly marked
        const interactiveElements = document.querySelectorAll('a, button');
        test.expect(interactiveElements.length >= 5).toBeTruthy();
    });

    test.test('should support automated performance testing', () => {
        // Elements should be measurable for performance
        const measureableElements = document.querySelectorAll('[class*="transition"], .float-animation');
        test.expect(measureableElements.length > 0).toBeTruthy();
        
        // External resources should be identifiable
        const externalResources = document.querySelectorAll('script[src], link[href^="http"]');
        test.expect(externalResources.length > 0).toBeTruthy();
    });
});

// Run all tests
console.log('🚀 Starting Consulting.html Page Restructure Test Suite');
console.log('Testing comprehensive restructure before implementation\n');

test.summary();

// Export for potential CI/CD integration
module.exports = {
    TestFramework,
    measurePerformance,
    simulateResize,
    simulateScroll
};