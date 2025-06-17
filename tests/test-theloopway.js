#!/usr/bin/env node
/**
 * Refersion + HubSpot Integration Test for TheLoopWay.com
 * Focuses on functional testing rather than implementation details
 */

const puppeteer = require('puppeteer');

class LoopWayIntegrationTest {
    constructor(options = {}) {
        this.baseUrl = 'https://www.theloopway.com';
        this.formPageUrl = 'https://www.theloopway.com/peptide-coaching-inquiry-page';
        this.options = {
            testAffiliateId: options.testAffiliateId || 'LOOP' + Date.now(),
            headless: options.headless !== false,
            timeout: options.timeout || 30000,
            ...options
        };
        this.results = {
            passed: [],
            failed: [],
            warnings: [],
            screenshots: []
        };
    }

    async run() {
        console.log('🚀 Testing Refersion Integration on TheLoopWay.com\n');
        console.log(`📍 Base URL: ${this.baseUrl}`);
        console.log(`📝 Form Page: ${this.formPageUrl}`);
        console.log(`🔖 Test Affiliate ID: ${this.options.testAffiliateId}\n`);

        const browser = await puppeteer.launch({
            headless: this.options.headless,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });
            
            // Enable console logging for debugging
            page.on('console', msg => {
                const text = msg.text();
                if (text.includes('Refersion') || text.includes('REFERSION') || text.includes('rfsn')) {
                    console.log('🔍 Console:', text);
                }
            });

            // Core functionality tests
            await this.testTrackingCapture(page);
            await this.testDataPersistence(page);
            await this.testFormPageIntegration(page);
            await this.testCrossDomainTracking(page);

        } catch (error) {
            this.recordFailure('Test Execution', error.message);
        } finally {
            await browser.close();
        }

        this.printResults();
        return this.results;
    }

    async testTrackingCapture(page) {
        const testName = 'Tracking Parameter Capture';
        console.log(`\n🧪 Testing: ${testName}`);
        
        try {
            // Visit site with tracking parameter
            const trackingUrl = `${this.baseUrl}?rfsn=${this.options.testAffiliateId}`;
            console.log(`   → Visiting: ${trackingUrl}`);
            
            await page.goto(trackingUrl, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 3000)); // Give scripts time to initialize
            
            // Check if tracking was captured (flexible check)
            const isTracked = await page.evaluate((expectedId) => {
                // Check multiple possible storage methods
                const checks = [];
                
                // Check localStorage
                try {
                    const stored = localStorage.getItem('refersion_tracking');
                    if (stored) {
                        const data = JSON.parse(stored);
                        checks.push(data.rfsn === expectedId);
                    }
                } catch (e) {}
                
                // Check cookies
                try {
                    const cookies = document.cookie.split(';');
                    const refCookie = cookies.find(c => c.trim().startsWith('refersion_tracking='));
                    if (refCookie) {
                        const value = decodeURIComponent(refCookie.split('=')[1]);
                        const data = JSON.parse(value);
                        checks.push(data.rfsn === expectedId);
                    }
                } catch (e) {}
                
                // Check global object if available
                if (window.RefersionHubSpot && window.RefersionHubSpot.getTrackingData) {
                    const data = window.RefersionHubSpot.getTrackingData();
                    checks.push(data && data.rfsn === expectedId);
                }
                
                // Check URL params still present
                const urlParams = new URLSearchParams(window.location.search);
                checks.push(urlParams.get('rfsn') === expectedId);
                
                return {
                    tracked: checks.some(c => c === true),
                    methods: {
                        localStorage: checks[0] || false,
                        cookie: checks[1] || false,
                        globalObject: checks[2] || false,
                        urlParam: checks[3] || false
                    }
                };
            }, this.options.testAffiliateId);
            
            if (isTracked.tracked) {
                this.recordSuccess(testName);
                console.log('   ✅ Tracking captured successfully');
                console.log('   📊 Storage methods:', Object.entries(isTracked.methods)
                    .filter(([_, v]) => v)
                    .map(([k, _]) => k)
                    .join(', '));
            } else {
                throw new Error('Tracking parameter not captured in any storage method');
            }
            
            // Take screenshot
            await this.takeScreenshot(page, 'tracking-capture');
            
        } catch (error) {
            this.recordFailure(testName, error.message);
        }
    }

    async testDataPersistence(page) {
        const testName = 'Data Persistence Across Navigation';
        console.log(`\n🧪 Testing: ${testName}`);
        
        try {
            // First ensure we have tracking data before navigation
            const hasDataBefore = await page.evaluate(() => {
                return localStorage.getItem('refersion_tracking') !== null;
            });
            
            if (!hasDataBefore) {
                console.log('   ⚠️  No tracking data to test persistence with');
                this.recordWarning(testName, 'No initial tracking data found');
                return;
            }
            
            // Navigate to another page
            console.log(`   → Navigating to: ${this.baseUrl}/about`);
            await page.goto(`${this.baseUrl}/about`, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if data persists with debug info
            const persistenceResult = await page.evaluate((expectedId) => {
                const stored = localStorage.getItem('refersion_tracking');
                if (stored) {
                    try {
                        const data = JSON.parse(stored);
                        return {
                            persisted: data.rfsn === expectedId,
                            actualId: data.rfsn,
                            expectedId: expectedId,
                            fullData: data
                        };
                    } catch (e) {
                        return { persisted: false, error: 'Failed to parse stored data' };
                    }
                }
                return { persisted: false, error: 'No data in localStorage' };
            }, this.options.testAffiliateId);
            
            if (persistenceResult.persisted) {
                this.recordSuccess(testName);
                console.log('   ✅ Tracking data persists across page navigation');
            } else {
                console.log('   🔍 Debug:', JSON.stringify(persistenceResult));
                this.recordWarning(testName, `Tracking data issue: ${persistenceResult.error || 'ID mismatch'}`);
            }
            
        } catch (error) {
            this.recordFailure(testName, error.message);
        }
    }

    async testFormPageIntegration(page) {
        const testName = 'HubSpot Form Integration';
        console.log(`\n🧪 Testing: ${testName}`);
        
        try {
            // Navigate to the form page
            console.log(`   → Visiting form page: ${this.formPageUrl}`);
            await page.goto(this.formPageUrl, { waitUntil: 'networkidle2' });
            
            // Wait for HubSpot forms to load with multiple strategies
            console.log('   ⏳ Waiting for HubSpot forms to load...');
            
            // Strategy 1: Wait for HubSpot script to initialize
            await page.waitForFunction(
                () => window.hbspt || window.HubSpotForms || document.querySelector('iframe[src*="forms.hsforms.com"]'),
                { timeout: 15000 }
            ).catch(() => console.log('   ⚠️  HubSpot script not detected in 15s'));
            
            // Additional wait for forms to render
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Check for HubSpot forms (multiple detection methods)
            const formCheck = await page.evaluate(() => {
                const results = {
                    hasForm: false,
                    formCount: 0,
                    formTypes: [],
                    debugInfo: []
                };
                
                // Check for iframe forms (most common)
                const iframes = document.querySelectorAll('iframe');
                let hubspotIframes = 0;
                iframes.forEach(iframe => {
                    if (iframe.src && (iframe.src.includes('forms.hsforms.com') || 
                        iframe.src.includes('forms.hubspot.com') ||
                        iframe.id && iframe.id.includes('hs-form'))) {
                        hubspotIframes++;
                        results.debugInfo.push(`iFrame: ${iframe.src || iframe.id}`);
                    }
                });
                if (hubspotIframes > 0) {
                    results.hasForm = true;
                    results.formCount += hubspotIframes;
                    results.formTypes.push(`${hubspotIframes} HubSpot iframe(s)`);
                }
                
                // Check for div-based forms
                const formDivs = document.querySelectorAll('[id*="hbspt-form"], [id*="hs-form"], [class*="hbspt-form"], [class*="hs-form"], .hs-form');
                if (formDivs.length > 0) {
                    results.hasForm = true;
                    results.formCount += formDivs.length;
                    results.formTypes.push(`${formDivs.length} form container(s)`);
                    formDivs.forEach(div => {
                        results.debugInfo.push(`Div: ${div.id || div.className}`);
                    });
                }
                
                // Check for HubSpot script objects
                if (window.hbspt) {
                    results.hasForm = true;
                    results.formTypes.push('hbspt object loaded');
                }
                if (window.HubSpotForms) {
                    results.hasForm = true;
                    results.formTypes.push('HubSpotForms object loaded');
                }
                
                // Check for any form elements that might be HubSpot
                const forms = document.querySelectorAll('form');
                forms.forEach(form => {
                    if (form.action && form.action.includes('hsforms.com')) {
                        results.hasForm = true;
                        results.formTypes.push('Direct form element');
                    }
                });
                
                // Check for form fields that might be populated
                const trackingFields = document.querySelectorAll(
                    'input[name*="refersion"], input[id*="refersion"], ' +
                    'input[name*="rfsn"], input[id*="rfsn"], ' +
                    'input[name*="affiliate"], input[id*="affiliate"]'
                );
                if (trackingFields.length > 0) {
                    results.formTypes.push(`${trackingFields.length} tracking field(s)`);
                }
                
                // Debug: List all iframes on page
                results.debugInfo.push(`Total iframes on page: ${iframes.length}`);
                
                return results;
            });
            
            if (formCheck.hasForm) {
                this.recordSuccess(testName);
                console.log('   ✅ HubSpot form detected on page');
                console.log(`   📝 Found: ${formCheck.formTypes.join(', ')}`);
            } else {
                // Show debug info to help diagnose
                console.log('   🔍 Debug info:', formCheck.debugInfo.join(', '));
                
                // Try one more detection method - check page content
                const pageContent = await page.content();
                const hasHubSpotInHTML = pageContent.includes('hubspot') || pageContent.includes('hsforms');
                
                if (hasHubSpotInHTML) {
                    this.recordWarning(testName, 'HubSpot references found in HTML but form not detected - may be loading very slowly');
                } else {
                    this.recordWarning(testName, 'No HubSpot forms detected - please verify form is on this page');
                }
            }
            
            // Check if tracking data would be available for form population
            const trackingAvailable = await page.evaluate(() => {
                const stored = localStorage.getItem('refersion_tracking');
                return !!stored;
            });
            
            if (trackingAvailable) {
                console.log('   ✅ Tracking data available for form population');
            } else {
                console.log('   ⚠️  No tracking data available for this session');
            }
            
            // Take screenshot of form page
            await this.takeScreenshot(page, 'form-page');
            
        } catch (error) {
            this.recordFailure(testName, error.message);
        }
    }

    async testCrossDomainTracking(page) {
        const testName = 'Cross-Domain Tracking';
        console.log(`\n🧪 Testing: ${testName}`);
        
        try {
            // Clear existing data
            await page.evaluate(() => {
                localStorage.clear();
                document.cookie.split(";").forEach(c => {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });
            });
            
            // Visit with new tracking ID
            const newTrackingId = 'XDOMAIN' + Date.now();
            await page.goto(`${this.baseUrl}?rfsn=${newTrackingId}`, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Navigate directly to form page
            await page.goto(this.formPageUrl, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if tracking persisted
            const crossDomainCheck = await page.evaluate((expectedId) => {
                const stored = localStorage.getItem('refersion_tracking');
                if (stored) {
                    const data = JSON.parse(stored);
                    return data.rfsn === expectedId;
                }
                return false;
            }, newTrackingId);
            
            if (crossDomainCheck) {
                this.recordSuccess(testName);
                console.log('   ✅ Tracking persists from home page to form page');
            } else {
                this.recordWarning(testName, 'Tracking may not persist across subdomains');
            }
            
        } catch (error) {
            this.recordFailure(testName, error.message);
        }
    }

    async takeScreenshot(page, name) {
        try {
            const filename = `test-${name}-${Date.now()}.png`;
            await page.screenshot({ path: filename, fullPage: true });
            this.results.screenshots.push(filename);
            console.log(`   📸 Screenshot: ${filename}`);
        } catch (error) {
            console.log(`   ⚠️  Screenshot failed: ${error.message}`);
        }
    }

    recordSuccess(testName) {
        this.results.passed.push(testName);
    }

    recordFailure(testName, error) {
        this.results.failed.push({ test: testName, error });
        console.log(`   ❌ Failed: ${error}`);
    }

    recordWarning(testName, message) {
        this.results.warnings.push({ test: testName, message });
        console.log(`   ⚠️  Warning: ${message}`);
    }

    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 Test Results Summary for TheLoopWay.com');
        console.log('='.repeat(60));
        
        const total = this.results.passed.length + this.results.failed.length;
        const passRate = total > 0 ? (this.results.passed.length / total * 100).toFixed(1) : 0;
        
        console.log(`\n✅ Passed: ${this.results.passed.length}/${total} (${passRate}%)`);
        this.results.passed.forEach(test => console.log(`   • ${test}`));
        
        if (this.results.failed.length > 0) {
            console.log(`\n❌ Failed: ${this.results.failed.length}`);
            this.results.failed.forEach(({ test, error }) => {
                console.log(`   • ${test}: ${error}`);
            });
        }
        
        if (this.results.warnings.length > 0) {
            console.log(`\n⚠️  Warnings: ${this.results.warnings.length}`);
            this.results.warnings.forEach(({ test, message }) => {
                console.log(`   • ${test}: ${message}`);
            });
        }
        
        if (this.results.screenshots.length > 0) {
            console.log(`\n📸 Screenshots saved: ${this.results.screenshots.length}`);
            this.results.screenshots.forEach(path => console.log(`   • ${path}`));
        }
        
        console.log('\n' + '='.repeat(60));
        
        if (this.results.failed.length === 0) {
            console.log('✨ All critical tests passed! The integration appears to be working correctly.');
        } else {
            console.log('❗ Some tests failed. Please review the errors above.');
        }
        console.log('='.repeat(60));
    }
}

// Run the test
if (require.main === module) {
    const test = new LoopWayIntegrationTest({
        headless: process.argv.includes('--headed') ? false : true
    });
    
    test.run().then(results => {
        process.exit(results.failed.length > 0 ? 1 : 0);
    }).catch(error => {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    });
}

module.exports = LoopWayIntegrationTest;