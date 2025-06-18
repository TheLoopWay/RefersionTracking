#!/usr/bin/env node

/**
 * Cross-Domain Tracking Validation Script
 * 
 * This script validates that tracking is properly implemented on both sites
 * Usage: node tests/validate-tracking.js [--site=loopway|biolabs|both] [--verbose]
 */

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import chalk from 'chalk';

// Configuration
const SITES = {
  loopway: 'https://theloopway.com',
  biolabs: 'https://loopbiolabs.com',
  forms: 'https://forms.theloopway.com'
};

const TEST_AFFILIATE_ID = 'VALIDATION-TEST-' + Date.now();

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  switch (type) {
    case 'success':
      console.log(chalk.green(`✓ [${timestamp}] ${message}`));
      break;
    case 'error':
      console.log(chalk.red(`✗ [${timestamp}] ${message}`));
      break;
    case 'warning':
      console.log(chalk.yellow(`⚠ [${timestamp}] ${message}`));
      break;
    default:
      console.log(chalk.blue(`ℹ [${timestamp}] ${message}`));
  }
}

// Test 1: Check if tracking scripts are loaded
async function checkTrackingScripts(site, url) {
  log(`Checking tracking scripts on ${site}...`);
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html, { 
      runScripts: "outside-only",
      resources: "usable"
    });
    
    const tests = [
      {
        name: 'Refersion Script',
        check: () => html.includes('r.js') || html.includes('refersion.com'),
        required: true
      },
      {
        name: 'Refersion Public Key',
        check: () => html.includes('pub_ee6ba2b9f9295e53f4eb'),
        required: true
      },
      {
        name: 'localStorage Functions',
        check: () => html.includes('localStorage.setItem') && html.includes('rfsn'),
        required: true
      },
      {
        name: 'Cookie Functions',
        check: () => html.includes('document.cookie') && html.includes('rfsn'),
        required: false
      },
      {
        name: 'Cross-Domain Link Handler',
        check: () => html.includes('loopbiolabs.com') || html.includes('theloopway.com'),
        required: site === 'loopway'
      }
    ];
    
    tests.forEach(test => {
      if (test.check()) {
        results.passed.push(`${site}: ${test.name}`);
        log(`${test.name} found`, 'success');
      } else if (test.required) {
        results.failed.push(`${site}: ${test.name} missing`);
        log(`${test.name} missing`, 'error');
      } else {
        results.warnings.push(`${site}: ${test.name} not found (optional)`);
        log(`${test.name} not found (optional)`, 'warning');
      }
    });
    
  } catch (error) {
    results.failed.push(`${site}: Failed to fetch page - ${error.message}`);
    log(`Failed to fetch ${site}: ${error.message}`, 'error');
  }
}

// Test 2: Validate form embedding
async function checkFormEmbedding() {
  log('Checking form embedding...');
  
  try {
    const embedUrl = `${SITES.forms}/embed.js`;
    const response = await fetch(embedUrl);
    
    if (response.ok) {
      const embedScript = await response.text();
      
      const checks = [
        {
          name: 'localStorage bridge',
          test: embedScript.includes("localStorage.getItem('rfsn')")
        },
        {
          name: 'URL parameter preservation',
          test: embedScript.includes('trackingParams')
        },
        {
          name: 'iframe creation',
          test: embedScript.includes('createElement(\'iframe\')')
        }
      ];
      
      checks.forEach(check => {
        if (check.test) {
          results.passed.push(`Forms: ${check.name}`);
          log(`${check.name} implemented`, 'success');
        } else {
          results.failed.push(`Forms: ${check.name} missing`);
          log(`${check.name} missing`, 'error');
        }
      });
    } else {
      results.failed.push('Forms: embed.js not accessible');
      log('embed.js not accessible', 'error');
    }
  } catch (error) {
    results.failed.push(`Forms: ${error.message}`);
    log(`Form embedding check failed: ${error.message}`, 'error');
  }
}

// Test 3: Validate HubSpot integration
async function checkHubSpotIntegration() {
  log('Checking HubSpot integration...');
  
  try {
    // Check if form submission includes tracking
    const formResponse = await fetch(`${SITES.forms}/peptide-inquiry.html`);
    const formHtml = await formResponse.text();
    
    if (formHtml.includes('refersionid') || formHtml.includes('tracker.getTracking()')) {
      results.passed.push('HubSpot: Form tracking integration');
      log('Form includes refersionid field', 'success');
    } else {
      results.failed.push('HubSpot: Form missing refersionid field');
      log('Form missing refersionid field', 'error');
    }
    
  } catch (error) {
    results.failed.push(`HubSpot: ${error.message}`);
    log(`HubSpot check failed: ${error.message}`, 'error');
  }
}

// Test 4: Cross-domain link validation
async function checkCrossDomainLinks(site, url) {
  log(`Checking cross-domain links on ${site}...`);
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Find all cross-domain links
    const otherDomain = site === 'loopway' ? 'loopbiolabs.com' : 'theloopway.com';
    const links = Array.from(document.querySelectorAll(`a[href*="${otherDomain}"]`));
    
    if (links.length > 0) {
      log(`Found ${links.length} cross-domain links`, 'info');
      
      // Check if any have tracking parameters or if there's JS to add them
      const hasTrackingLogic = html.includes('updateCrossDomainLinks') || 
                              html.includes('?rfsn=') ||
                              html.includes('linkToBioLabs') ||
                              html.includes('createLoopWayLink');
      
      if (hasTrackingLogic) {
        results.passed.push(`${site}: Cross-domain tracking logic`);
        log('Cross-domain tracking logic found', 'success');
      } else {
        results.warnings.push(`${site}: No automatic cross-domain tracking`);
        log('No automatic cross-domain tracking found', 'warning');
      }
    } else {
      log(`No cross-domain links found on ${site}`, 'info');
    }
    
  } catch (error) {
    results.failed.push(`${site}: Cross-domain check failed - ${error.message}`);
    log(`Cross-domain check failed: ${error.message}`, 'error');
  }
}

// Test 5: Validate Bubble integration files
async function checkBubbleIntegration() {
  log('Checking Bubble integration files...');
  
  const bubbleFiles = [
    'bubble-refersion-header.html',
    'bubble-hubspot-sync.js',
    'bubble-simple-conversion.js'
  ];
  
  const fs = await import('fs').then(m => m.promises);
  const path = await import('path');
  
  for (const file of bubbleFiles) {
    try {
      const filePath = path.join(process.cwd(), 'integrations', 'bubble', file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      if (content.includes('localStorage') && content.includes('rfsn')) {
        results.passed.push(`Bubble: ${file} valid`);
        log(`${file} contains proper tracking code`, 'success');
      } else {
        results.warnings.push(`Bubble: ${file} may be incomplete`);
        log(`${file} may be missing tracking logic`, 'warning');
      }
    } catch (error) {
      results.failed.push(`Bubble: ${file} not found`);
      log(`${file} not found`, 'error');
    }
  }
}

// Main validation function
async function runValidation() {
  console.log(chalk.bold.blue('\n🔍 Cross-Domain Tracking Validation\n'));
  
  const args = process.argv.slice(2);
  const siteArg = args.find(arg => arg.startsWith('--site='));
  const site = siteArg ? siteArg.split('=')[1] : 'both';
  const verbose = args.includes('--verbose');
  
  // Run tests based on site selection
  if (site === 'loopway' || site === 'both') {
    await checkTrackingScripts('loopway', SITES.loopway);
    await checkCrossDomainLinks('loopway', SITES.loopway);
  }
  
  if (site === 'biolabs' || site === 'both') {
    await checkTrackingScripts('biolabs', SITES.biolabs);
    await checkCrossDomainLinks('biolabs', SITES.biolabs);
  }
  
  // Always check these
  await checkFormEmbedding();
  await checkHubSpotIntegration();
  await checkBubbleIntegration();
  
  // Display results
  console.log(chalk.bold.blue('\n📊 Validation Results\n'));
  
  console.log(chalk.green(`✓ Passed: ${results.passed.length}`));
  if (verbose || results.passed.length < 10) {
    results.passed.forEach(test => console.log(chalk.green(`  - ${test}`)));
  }
  
  if (results.warnings.length > 0) {
    console.log(chalk.yellow(`\n⚠ Warnings: ${results.warnings.length}`));
    results.warnings.forEach(warning => console.log(chalk.yellow(`  - ${warning}`)));
  }
  
  if (results.failed.length > 0) {
    console.log(chalk.red(`\n✗ Failed: ${results.failed.length}`));
    results.failed.forEach(failure => console.log(chalk.red(`  - ${failure}`)));
  }
  
  // Summary
  const totalTests = results.passed.length + results.failed.length;
  const passRate = ((results.passed.length / totalTests) * 100).toFixed(1);
  
  console.log(chalk.bold.blue(`\n📈 Pass Rate: ${passRate}%\n`));
  
  // Exit code based on failures
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run validation
runValidation().catch(error => {
  console.error(chalk.red('Validation script error:'), error);
  process.exit(1);
});