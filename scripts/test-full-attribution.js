#!/usr/bin/env node

/**
 * Full Attribution Test Suite
 * Tests the complete Segment + Refersion + HubSpot integration
 */

import fetch from 'node-fetch';
import chalk from 'chalk';

const SITES = {
  theloopway: 'https://theloopway.com',
  loopbiolabs: 'https://loopbiolabs.com',
  forms: 'https://forms.theloopway.com'
};

class AttributionTester {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  log(message, type = 'info') {
    const prefix = {
      success: chalk.green('✓'),
      error: chalk.red('✗'),
      warning: chalk.yellow('⚠'),
      info: chalk.blue('ℹ')
    };
    
    console.log(`${prefix[type]} ${message}`);
  }

  async testSegmentPresence(siteName, url) {
    this.log(`Testing Segment presence on ${siteName}...`);
    
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      // Check for Segment snippet
      if (html.includes('analytics.load') && html.includes('analytics.page')) {
        this.results.passed.push(`${siteName}: Segment Analytics loaded`);
        this.log('Segment Analytics found', 'success');
        
        // Check for correct write key
        if (siteName === 'theloopway' && html.includes('WAwgCVzGN82fhGNl8u4Ap3xjdqALerZW')) {
          this.results.passed.push(`${siteName}: Correct Segment write key`);
          this.log('Correct write key for TheLoopWay', 'success');
        } else if (siteName === 'loopbiolabs' && html.includes('VLvSfT5m9qElluhLqdE38FMoMvdgxj47')) {
          this.results.passed.push(`${siteName}: Correct Segment write key`);
          this.log('Correct write key for LoopBioLabs', 'success');
        }
      } else {
        this.results.failed.push(`${siteName}: Segment Analytics missing`);
        this.log('Segment Analytics NOT found', 'error');
      }
      
      // Check for tracking functions
      if (html.includes('refersionId') || html.includes('refersion_id')) {
        this.results.passed.push(`${siteName}: Refersion tracking integration`);
        this.log('Refersion tracking integration found', 'success');
      }
      
    } catch (error) {
      this.results.failed.push(`${siteName}: Failed to fetch - ${error.message}`);
      this.log(`Failed to fetch ${siteName}: ${error.message}`, 'error');
    }
  }

  async testFormTracking() {
    this.log('Testing form tracking integration...');
    
    try {
      const formUrl = `${SITES.forms}/peptide-inquiry.html`;
      const response = await fetch(formUrl);
      const html = await response.text();
      
      const checks = [
        {
          name: 'Segment tracking script',
          test: html.includes('segment-tracking.js')
        },
        {
          name: 'Form submission tracking',
          test: html.includes('trackFormWithSegment')
        },
        {
          name: 'HubSpot form handler',
          test: html.includes('FormHandler')
        },
        {
          name: 'Refersion data capture',
          test: html.includes('tracker.getFormData')
        }
      ];
      
      checks.forEach(check => {
        if (check.test) {
          this.results.passed.push(`Forms: ${check.name}`);
          this.log(check.name, 'success');
        } else {
          this.results.failed.push(`Forms: ${check.name} missing`);
          this.log(`${check.name} missing`, 'error');
        }
      });
      
    } catch (error) {
      this.results.failed.push(`Forms: ${error.message}`);
      this.log(`Form test failed: ${error.message}`, 'error');
    }
  }

  async testWebhookEndpoint() {
    this.log('Testing webhook endpoint...');
    
    const webhookUrl = `${SITES.forms}/api/segment-to-refersion`;
    
    try {
      // Test with a sample Order Completed event
      const testEvent = {
        event: {
          type: 'track',
          event: 'Order Completed',
          userId: 'test@attribution.com',
          properties: {
            orderId: `ATTR-TEST-${Date.now()}`,
            total: 199.99,
            currency: 'USD',
            email: 'test@attribution.com',
            products: [{
              productId: 'TEST-001',
              name: 'Test Product',
              price: 199.99,
              quantity: 1
            }]
          },
          context: {
            traits: {
              email: 'test@attribution.com',
              refersionId: 'ATTR-TEST-123'
            }
          }
        }
      };
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test': 'true'
        },
        body: JSON.stringify(testEvent)
      });
      
      const result = await response.json();
      
      if (response.ok && result.affiliateId) {
        this.results.passed.push('Webhook: Processes Order Completed events');
        this.log(`Webhook processed successfully - Affiliate: ${result.affiliateId}`, 'success');
      } else {
        this.results.failed.push('Webhook: Failed to process event');
        this.log('Webhook failed to process event', 'error');
      }
      
    } catch (error) {
      this.results.failed.push(`Webhook: ${error.message}`);
      this.log(`Webhook test failed: ${error.message}`, 'error');
    }
  }

  async testCrossDomainSetup() {
    this.log('Testing cross-domain configuration...');
    
    // Check if forms support multiple domains
    try {
      const embedUrl = `${SITES.forms}/embed.js`;
      const response = await fetch(embedUrl);
      const embedScript = await response.text();
      
      if (embedScript.includes('localStorage.getItem')) {
        this.results.passed.push('Cross-domain: localStorage bridge implemented');
        this.log('localStorage bridge for cross-domain tracking', 'success');
      }
      
      if (embedScript.includes('trackingParams') || embedScript.includes('rfsn=')) {
        this.results.passed.push('Cross-domain: URL parameter preservation');
        this.log('URL parameter preservation implemented', 'success');
      }
      
    } catch (error) {
      this.results.failed.push(`Cross-domain: ${error.message}`);
      this.log(`Cross-domain test failed: ${error.message}`, 'error');
    }
  }

  async runAllTests() {
    console.log(chalk.bold.cyan('\n🧪 Running Full Attribution Test Suite\n'));
    
    // Test both sites
    await this.testSegmentPresence('theloopway', SITES.theloopway);
    await this.testSegmentPresence('loopbiolabs', SITES.loopbiolabs);
    
    // Test forms
    await this.testFormTracking();
    
    // Test webhook
    await this.testWebhookEndpoint();
    
    // Test cross-domain
    await this.testCrossDomainSetup();
    
    // Display results
    this.displayResults();
  }

  displayResults() {
    console.log(chalk.bold.cyan('\n📊 Test Results\n'));
    
    if (this.results.passed.length > 0) {
      console.log(chalk.green(`✓ Passed: ${this.results.passed.length}`));
      this.results.passed.forEach(test => 
        console.log(chalk.green(`  • ${test}`))
      );
    }
    
    if (this.results.warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠ Warnings: ${this.results.warnings.length}`));
      this.results.warnings.forEach(warning => 
        console.log(chalk.yellow(`  • ${warning}`))
      );
    }
    
    if (this.results.failed.length > 0) {
      console.log(chalk.red(`\n✗ Failed: ${this.results.failed.length}`));
      this.results.failed.forEach(failure => 
        console.log(chalk.red(`  • ${failure}`))
      );
    }
    
    // Summary
    const total = this.results.passed.length + this.results.failed.length;
    const passRate = total > 0 ? ((this.results.passed.length / total) * 100).toFixed(1) : 0;
    
    console.log(chalk.bold.cyan(`\n📈 Pass Rate: ${passRate}%`));
    
    if (this.results.failed.length === 0) {
      console.log(chalk.bold.green('\n✅ All tests passed! Attribution system is properly configured.\n'));
    } else {
      console.log(chalk.bold.red('\n❌ Some tests failed. Please check the issues above.\n'));
    }
    
    // Exit with appropriate code
    process.exit(this.results.failed.length > 0 ? 1 : 0);
  }
}

// Run tests
const tester = new AttributionTester();
tester.runAllTests().catch(error => {
  console.error(chalk.red('Test suite error:'), error);
  process.exit(1);
});