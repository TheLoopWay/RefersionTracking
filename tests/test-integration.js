/**
 * Refersion + HubSpot Integration Test Script
 * Tests the live Squarespace site for proper installation and functionality
 */

class RefersionIntegrationTester {
    constructor(siteUrl, options = {}) {
        this.siteUrl = siteUrl.replace(/\/$/, '');
        this.options = {
            testAffiliateId: options.testAffiliateId || 'TEST123',
            timeout: options.timeout || 10000,
            verbose: options.verbose || false,
            ...options
        };
        this.results = {
            passed: [],
            failed: [],
            warnings: []
        };
    }

    log(message, type = 'info') {
        if (this.options.verbose || type !== 'info') {
            const prefix = {
                info: '📊',
                success: '✅',
                error: '❌',
                warning: '⚠️'
            }[type] || '📌';
            console.log(`${prefix} ${message}`);
        }
    }

    async runTests() {
        console.log('🔍 Starting Refersion Integration Tests...\n');
        
        try {
            // Test 1: Check if site is accessible
            await this.testSiteAccessibility();
            
            // Test 2: Check if integration script is loaded
            await this.testScriptLoading();
            
            // Test 3: Check global object availability
            await this.testGlobalObject();
            
            // Test 4: Test tracking capture
            await this.testTrackingCapture();
            
            // Test 5: Check for HubSpot forms
            await this.testHubSpotForms();
            
            // Test 6: Test data persistence
            await this.testDataPersistence();
            
            // Test 7: Test form field population
            await this.testFormFieldPopulation();
            
        } catch (error) {
            this.results.failed.push({
                test: 'Overall Test Execution',
                error: error.message
            });
        }
        
        this.printResults();
        return this.results;
    }

    async testSiteAccessibility() {
        const testName = 'Site Accessibility';
        try {
            const response = await fetch(this.siteUrl);
            if (response.ok) {
                this.results.passed.push(testName);
                this.log(`Site is accessible at ${this.siteUrl}`, 'success');
            } else {
                throw new Error(`Site returned status ${response.status}`);
            }
        } catch (error) {
            this.results.failed.push({ test: testName, error: error.message });
            this.log(`Failed to access site: ${error.message}`, 'error');
        }
    }

    async testScriptLoading() {
        const testName = 'Script Loading';
        try {
            // Using Puppeteer or Playwright would be ideal here
            // For now, we'll fetch the page and check for script inclusion
            const response = await fetch(this.siteUrl);
            const html = await response.text();
            
            if (html.includes('hubspot-integration.js') || 
                html.includes('refersion') || 
                html.includes('rfsn')) {
                this.results.passed.push(testName);
                this.log('Integration script reference found', 'success');
            } else {
                throw new Error('Integration script not found in page source');
            }
        } catch (error) {
            this.results.failed.push({ test: testName, error: error.message });
            this.log(`Script loading check failed: ${error.message}`, 'error');
        }
    }

    async testGlobalObject() {
        const testName = 'Global Object Availability';
        // This would require browser automation
        this.results.warnings.push({
            test: testName,
            message: 'Requires browser automation (Puppeteer/Playwright) for full testing'
        });
        this.log('Global object test requires browser automation', 'warning');
    }

    async testTrackingCapture() {
        const testName = 'Tracking Capture';
        const testUrl = `${this.siteUrl}?rfsn=${this.options.testAffiliateId}`;
        
        try {
            const response = await fetch(testUrl);
            if (response.ok) {
                this.results.passed.push(`${testName} - URL accepts tracking parameter`);
                this.log(`Tracking URL accessible: ${testUrl}`, 'success');
            }
        } catch (error) {
            this.results.failed.push({ test: testName, error: error.message });
            this.log(`Tracking capture test failed: ${error.message}`, 'error');
        }
    }

    async testHubSpotForms() {
        const testName = 'HubSpot Forms Detection';
        try {
            const response = await fetch(this.siteUrl);
            const html = await response.text();
            
            const hasHubSpotForm = 
                html.includes('hbspt.forms.create') ||
                html.includes('hsforms') ||
                html.includes('hubspot.com/forms');
            
            if (hasHubSpotForm) {
                this.results.passed.push(testName);
                this.log('HubSpot form references found', 'success');
            } else {
                this.results.warnings.push({
                    test: testName,
                    message: 'No HubSpot form references found - may be loaded dynamically'
                });
                this.log('No HubSpot forms detected in initial HTML', 'warning');
            }
        } catch (error) {
            this.results.failed.push({ test: testName, error: error.message });
            this.log(`Form detection failed: ${error.message}`, 'error');
        }
    }

    async testDataPersistence() {
        const testName = 'Data Persistence';
        this.results.warnings.push({
            test: testName,
            message: 'Requires browser automation to test localStorage/cookies'
        });
        this.log('Data persistence test requires browser automation', 'warning');
    }

    async testFormFieldPopulation() {
        const testName = 'Form Field Population';
        this.results.warnings.push({
            test: testName,
            message: 'Requires browser automation to test form interaction'
        });
        this.log('Form field population test requires browser automation', 'warning');
    }

    printResults() {
        console.log('\n📋 Test Results Summary\n' + '='.repeat(40));
        
        console.log(`\n✅ Passed Tests (${this.results.passed.length}):`);
        this.results.passed.forEach(test => console.log(`   • ${test}`));
        
        if (this.results.failed.length > 0) {
            console.log(`\n❌ Failed Tests (${this.results.failed.length}):`);
            this.results.failed.forEach(({ test, error }) => {
                console.log(`   • ${test}: ${error}`);
            });
        }
        
        if (this.results.warnings.length > 0) {
            console.log(`\n⚠️  Warnings (${this.results.warnings.length}):`);
            this.results.warnings.forEach(({ test, message }) => {
                console.log(`   • ${test}: ${message}`);
            });
        }
        
        const total = this.results.passed.length + this.results.failed.length;
        const passRate = total > 0 ? (this.results.passed.length / total * 100).toFixed(1) : 0;
        
        console.log(`\n📊 Overall: ${passRate}% passed (${this.results.passed.length}/${total} tests)`);
        console.log('='.repeat(40));
    }
}

// Export for use in Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RefersionIntegrationTester;
}

// Example usage:
if (require.main === module) {
    const siteUrl = process.argv[2];
    
    if (!siteUrl) {
        console.error('Usage: node test-integration.js <site-url>');
        console.error('Example: node test-integration.js https://your-site.squarespace.com');
        process.exit(1);
    }
    
    const tester = new RefersionIntegrationTester(siteUrl, {
        verbose: true,
        testAffiliateId: 'TEST123'
    });
    
    tester.runTests().then(results => {
        process.exit(results.failed.length > 0 ? 1 : 0);
    });
}