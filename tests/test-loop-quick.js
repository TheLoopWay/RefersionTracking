#!/usr/bin/env node
/**
 * Quick functional test for TheLoopWay.com Refersion integration
 * No browser required - just checks basic functionality
 */

const https = require('https');

async function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function quickTest() {
    console.log('🚀 Quick Integration Test for TheLoopWay.com\n');
    
    const tests = {
        passed: 0,
        failed: 0
    };
    
    try {
        // Test 1: Check if main site loads
        console.log('1️⃣  Testing site accessibility...');
        const homePage = await fetchPage('https://www.theloopway.com');
        if (homePage.length > 1000) {
            console.log('   ✅ Site is accessible');
            tests.passed++;
        } else {
            console.log('   ❌ Site returned minimal content');
            tests.failed++;
        }
        
        // Test 2: Check for integration script references
        console.log('\n2️⃣  Checking for Refersion integration...');
        const hasRefersion = homePage.toLowerCase().includes('refersion') || 
                           homePage.includes('rfsn') ||
                           homePage.includes('affiliate');
        
        if (hasRefersion) {
            console.log('   ✅ Refersion references found');
            tests.passed++;
        } else {
            console.log('   ⚠️  No obvious Refersion references (may be loaded dynamically)');
        }
        
        // Test 3: Check form page
        console.log('\n3️⃣  Testing form page...');
        const formPage = await fetchPage('https://www.theloopway.com/peptide-coaching-inquiry-page');
        const hasHubSpot = formPage.includes('forms.hsforms.com') || 
                          formPage.includes('hbspt') ||
                          formPage.includes('hubspot');
        
        if (hasHubSpot) {
            console.log('   ✅ HubSpot form integration found');
            tests.passed++;
        } else {
            console.log('   ❌ No HubSpot form references found');
            tests.failed++;
        }
        
        // Test 4: Check if tracking parameter is accepted
        console.log('\n4️⃣  Testing tracking parameter...');
        const trackingPage = await fetchPage('https://www.theloopway.com?rfsn=TEST123');
        if (trackingPage.length > 1000) {
            console.log('   ✅ Site accepts tracking parameters');
            tests.passed++;
        } else {
            console.log('   ❌ Issue loading page with tracking parameter');
            tests.failed++;
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
        tests.failed++;
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Results: ${tests.passed} passed, ${tests.failed} failed`);
    
    if (tests.failed === 0) {
        console.log('✨ Basic checks passed! Run full browser test for complete validation.');
    } else {
        console.log('⚠️  Some basic checks failed. Review the integration setup.');
    }
    console.log('='.repeat(50));
    
    console.log('\n💡 For comprehensive testing, run:');
    console.log('   npm run test:loop\n');
}

quickTest();