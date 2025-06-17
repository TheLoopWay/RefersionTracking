/**
 * Refersion + HubSpot Integration Browser Test
 * Full automated testing using Puppeteer
 */

const puppeteer = require('puppeteer');

class RefersionBrowserTest {
    constructor(siteUrl, options = {}) {
        this.siteUrl = siteUrl.replace(/\/$/, '');
        this.options = {
            testAffiliateId: options.testAffiliateId || 'TEST123',
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
        console.log('🚀 Starting Refersion Integration Browser Tests...\n');
        console.log(`🌐 Testing site: ${this.siteUrl}\n`);

        const browser = await puppeteer.launch({
            headless: this.options.headless,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });
            
            // Enable console logging
            page.on('console', msg => {
                if (msg.text().includes('Refersion') || msg.text().includes('REFERSION')) {
                    console.log('📌 Console:', msg.text());
                }
            });

            // Test 1: Basic page load and script detection
            await this.testPageLoad(page);
            
            // Test 2: Script loading and global object
            await this.testScriptInitialization(page);
            
            // Test 3: Tracking parameter capture
            await this.testTrackingCapture(page);
            
            // Test 4: Data persistence
            await this.testDataPersistence(page);
            
            // Test 5: HubSpot form detection
            await this.testHubSpotForms(page);
            
            // Test 6: Form field population
            await this.testFormFieldPopulation(page);
            
            // Test 7: Clean tracking (no parameters)
            await this.testCleanPageLoad(page);

        } catch (error) {
            this.recordFailure('Browser Test Execution', error.message);
        } finally {
            await browser.close();
        }

        this.printResults();
        return this.results;
    }

    async testPageLoad(page) {
        const testName = 'Page Load';
        try {
            await page.goto(this.siteUrl, { waitUntil: 'networkidle2' });
            this.recordSuccess(testName);
            
            // Take initial screenshot
            const screenshotPath = `test-screenshot-initial-${Date.now()}.png`;
            await page.screenshot({ path: screenshotPath });
            this.results.screenshots.push(screenshotPath);
            console.log(`📸 Screenshot saved: ${screenshotPath}`);
        } catch (error) {
            this.recordFailure(testName, error.message);
        }
    }

    async testScriptInitialization(page) {
        const testName = 'Script Initialization';
        try {
            // Check if the integration script is loaded
            const hasScript = await page.evaluate(() => {
                return typeof window.RefersionHubSpot !== 'undefined';
            });

            if (hasScript) {
                this.recordSuccess(testName);
                
                // Get debug info
                const debugInfo = await page.evaluate(() => {
                    if (window.RefersionHubSpot && window.RefersionHubSpot.getDebugInfo) {
                        return window.RefersionHubSpot.getDebugInfo();
                    }
                    return null;
                });
                
                if (debugInfo) {
                    console.log('🔍 Debug Info:', JSON.stringify(debugInfo, null, 2));
                }
            } else {
                throw new Error('RefersionHubSpot global object not found');
            }
        } catch (error) {
            this.recordFailure(testName, error.message);
        }
    }

    async testTrackingCapture(page) {
        const testName = 'Tracking Capture';
        try {
            // Navigate with tracking parameter
            const trackingUrl = `${this.siteUrl}?rfsn=${this.options.testAffiliateId}`;
            await page.goto(trackingUrl, { waitUntil: 'networkidle2' });
            
            // Wait for script to process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if tracking was captured
            const trackingData = await page.evaluate(() => {
                if (window.RefersionHubSpot && window.RefersionHubSpot.getTrackingData) {
                    return window.RefersionHubSpot.getTrackingData();
                }
                // Fallback: check localStorage directly
                const stored = localStorage.getItem('refersion_tracking');
                return stored ? JSON.parse(stored) : null;
            });
            
            if (trackingData && trackingData.rfsn === this.options.testAffiliateId) {
                this.recordSuccess(testName);
                console.log('✅ Tracking captured:', trackingData);
            } else {
                throw new Error('Tracking parameter not captured correctly');
            }
            
            // Screenshot with tracking
            const screenshotPath = `test-screenshot-tracking-${Date.now()}.png`;
            await page.screenshot({ path: screenshotPath });
            this.results.screenshots.push(screenshotPath);
            
        } catch (error) {
            this.recordFailure(testName, error.message);
        }
    }

    async testDataPersistence(page) {
        const testName = 'Data Persistence';
        try {
            // Check localStorage
            const localStorageData = await page.evaluate(() => {
                return localStorage.getItem('refersion_tracking');
            });
            
            // Check cookies
            const cookies = await page.cookies();
            const refersionCookie = cookies.find(c => c.name === 'refersion_tracking');
            
            if (localStorageData || refersionCookie) {
                this.recordSuccess(testName);
                console.log('✅ Data persisted in:', {
                    localStorage: !!localStorageData,
                    cookie: !!refersionCookie
                });
            } else {
                throw new Error('No persistent data found');
            }
        } catch (error) {
            this.recordFailure(testName, error.message);
        }
    }

    async testHubSpotForms(page) {
        const testName = 'HubSpot Form Detection';
        try {
            // Wait for forms to load
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Check for HubSpot forms
            const formInfo = await page.evaluate(() => {
                const forms = {
                    iframe: document.querySelectorAll('iframe[src*="forms.hsforms.com"]').length,
                    div: document.querySelectorAll('div[id^="hbspt-form"]').length,
                    script: !!window.hbspt
                };
                return forms;
            });
            
            if (formInfo.iframe > 0 || formInfo.div > 0 || formInfo.script) {
                this.recordSuccess(testName);
                console.log('✅ HubSpot forms found:', formInfo);
            } else {
                this.recordWarning(testName, 'No HubSpot forms detected on page');
            }
        } catch (error) {
            this.recordFailure(testName, error.message);
        }
    }

    async testFormFieldPopulation(page) {
        const testName = 'Form Field Population';
        try {
            // This test checks if the integration would populate form fields
            const canPopulate = await page.evaluate(() => {
                if (!window.RefersionHubSpot) return false;
                
                // Check if we have tracking data
                const data = window.RefersionHubSpot.getTrackingData && 
                           window.RefersionHubSpot.getTrackingData();
                
                return !!data && !!data.rfsn;
            });
            
            if (canPopulate) {
                this.recordSuccess(testName + ' (Ready to populate)');
                
                // Try to find actual form fields
                const formFields = await page.evaluate(() => {
                    const fields = [];
                    // Check for refersion fields in iframes
                    const iframes = document.querySelectorAll('iframe[src*="forms.hsforms.com"]');
                    
                    // Check main document
                    ['refersionid', 'refersion_timestamp', 'refersion_source_url'].forEach(name => {
                        const field = document.querySelector(`input[name="${name}"], input[id*="${name}"]`);
                        if (field) fields.push(name);
                    });
                    
                    return {
                        fieldsFound: fields,
                        iframeCount: iframes.length
                    };
                });
                
                console.log('📝 Form field check:', formFields);
            } else {
                this.recordWarning(testName, 'No tracking data available for population');
            }
        } catch (error) {
            this.recordFailure(testName, error.message);
        }
    }

    async testCleanPageLoad(page) {
        const testName = 'Clean Page Load (No Tracking)';
        try {
            // Clear all data first
            await page.evaluate(() => {
                localStorage.removeItem('refersion_tracking');
                // Clear cookies
                document.cookie = 'refersion_tracking=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            });
            
            // Load page without tracking
            await page.goto(this.siteUrl, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Verify no tracking data
            const hasTracking = await page.evaluate(() => {
                const stored = localStorage.getItem('refersion_tracking');
                return !!stored;
            });
            
            if (!hasTracking) {
                this.recordSuccess(testName);
            } else {
                throw new Error('Tracking data found when none expected');
            }
        } catch (error) {
            this.recordFailure(testName, error.message);
        }
    }

    recordSuccess(testName) {
        this.results.passed.push(testName);
        console.log(`✅ ${testName}`);
    }

    recordFailure(testName, error) {
        this.results.failed.push({ test: testName, error });
        console.log(`❌ ${testName}: ${error}`);
    }

    recordWarning(testName, message) {
        this.results.warnings.push({ test: testName, message });
        console.log(`⚠️  ${testName}: ${message}`);
    }

    printResults() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 Test Results Summary');
        console.log('='.repeat(50));
        
        console.log(`\n✅ Passed: ${this.results.passed.length}`);
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
        
        const total = this.results.passed.length + this.results.failed.length;
        const passRate = total > 0 ? (this.results.passed.length / total * 100).toFixed(1) : 0;
        
        console.log(`\n📈 Overall Pass Rate: ${passRate}% (${this.results.passed.length}/${total})`);
        console.log('='.repeat(50));
    }
}

// Run the test if called directly
if (require.main === module) {
    const siteUrl = process.argv[2];
    
    if (!siteUrl) {
        console.error('❌ Usage: node test-integration-puppeteer.js <site-url>');
        console.error('Example: node test-integration-puppeteer.js https://your-site.squarespace.com');
        process.exit(1);
    }
    
    const tester = new RefersionBrowserTest(siteUrl, {
        headless: process.argv.includes('--headed') ? false : true,
        testAffiliateId: 'TEST' + Date.now()
    });
    
    tester.run().then(results => {
        process.exit(results.failed.length > 0 ? 1 : 0);
    }).catch(error => {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    });
}

module.exports = RefersionBrowserTest;