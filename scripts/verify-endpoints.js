#!/usr/bin/env node

/**
 * Verify all API endpoints are deployed and responding
 */

import fetch from 'node-fetch';
import chalk from 'chalk';

const BASE_URL = 'https://forms.theloopway.com';

const endpoints = [
  {
    name: 'Segment Webhook',
    url: '/api/segment-to-refersion',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { type: 'test', event: 'test' },
    expectedStatus: 200,
    expectedResponse: (data) => data.success === true
  },
  {
    name: 'Form Embed Script',
    url: '/embed.js',
    method: 'GET',
    expectedStatus: 200,
    expectedResponse: (data, text) => text.includes('FormEmbed')
  },
  {
    name: 'Tracking Backup',
    url: '/api/track',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { rfsn: 'TEST', timestamp: new Date().toISOString() },
    expectedStatus: 200,
    expectedResponse: (data) => data.success === true
  },
  {
    name: 'Main Forms Page',
    url: '/peptide-inquiry.html',
    method: 'GET',
    expectedStatus: 200,
    expectedResponse: (data, text) => text.includes('form')
  }
];

async function verifyEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.url}`;
  console.log(`\n🔍 Testing: ${endpoint.name}`);
  console.log(`   URL: ${url}`);
  console.log(`   Method: ${endpoint.method}`);
  
  try {
    const options = {
      method: endpoint.method,
      headers: endpoint.headers || {}
    };
    
    if (endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }
    
    const startTime = Date.now();
    const response = await fetch(url, options);
    const responseTime = Date.now() - startTime;
    
    console.log(`   Status: ${response.status} (${responseTime}ms)`);
    
    let data = null;
    let text = null;
    
    try {
      text = await response.text();
      data = JSON.parse(text);
    } catch (e) {
      // Not JSON, that's ok
      data = {};
    }
    
    // Check status
    if (response.status === endpoint.expectedStatus) {
      console.log(chalk.green(`   ✓ Status code correct`));
    } else {
      console.log(chalk.red(`   ✗ Expected status ${endpoint.expectedStatus}, got ${response.status}`));
      return false;
    }
    
    // Check response
    if (endpoint.expectedResponse) {
      if (endpoint.expectedResponse(data, text)) {
        console.log(chalk.green(`   ✓ Response valid`));
        return true;
      } else {
        console.log(chalk.red(`   ✗ Response invalid`));
        console.log(`   Response: ${text.substring(0, 200)}...`);
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    console.log(chalk.red(`   ✗ Error: ${error.message}`));
    return false;
  }
}

async function verifyAllEndpoints() {
  console.log(chalk.bold.blue('🚀 Verifying Loop Forms Endpoints\n'));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of endpoints) {
    const result = await verifyEndpoint(endpoint);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  // Summary
  console.log(chalk.bold.blue('\n📊 Summary\n'));
  console.log(chalk.green(`✓ Passed: ${passed}`));
  if (failed > 0) {
    console.log(chalk.red(`✗ Failed: ${failed}`));
  }
  
  const total = passed + failed;
  const passRate = ((passed / total) * 100).toFixed(1);
  console.log(`\n📈 Success Rate: ${passRate}%`);
  
  if (failed === 0) {
    console.log(chalk.bold.green('\n✅ All endpoints are working correctly!\n'));
  } else {
    console.log(chalk.bold.red('\n❌ Some endpoints are failing. Check deployment status.\n'));
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run verification
verifyAllEndpoints().catch(error => {
  console.error(chalk.red('Verification error:'), error);
  process.exit(1);
});