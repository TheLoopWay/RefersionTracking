# Complete Testing Guide for Cross-Domain Attribution

## Overview

This guide ensures your Segment + Refersion + HubSpot integration works correctly across TheLoopWay.com and LoopBioLabs.com.

## Prerequisites

- [ ] Refersion API key added to Vercel: `vercel env add REFERSION_API_KEY`
- [ ] Segment webhook configured and enabled
- [ ] HubSpot Cloud destination configured in Segment
- [ ] Test affiliate code from Refersion (e.g., "TEST123")
- [ ] Access to all platforms (Segment, HubSpot, Refersion, Vercel)

## Test Scenarios

### Test 1: Basic Attribution Flow

**Purpose**: Verify tracking flows from TheLoopWay → LoopBioLabs

1. **Visit TheLoopWay with affiliate link**
   ```
   https://theloopway.com?rfsn=TEST123
   ```

2. **Open Browser Console** and verify:
   ```javascript
   // Check tracking was captured
   localStorage.getItem('rfsn')  // Should return "TEST123"
   
   // Check Segment identity
   analytics.user().traits()  // Should show refersionId
   ```

3. **Submit a form** (e.g., peptide inquiry) with email: `test@example.com`

4. **Check HubSpot**:
   - Find contact by email
   - Verify `refersionid` property = "TEST123"

5. **Visit LoopBioLabs** (type URL directly, no parameters)

6. **Login with same email** and check console:
   ```javascript
   analytics.user().traits()  // Should include refersionId: "TEST123"
   ```

7. **Make a test purchase**

8. **Verify in all systems**:
   - Segment Debugger: "Order Completed" event with affiliateId
   - Vercel Logs: Webhook processing
   - Refersion Dashboard: New conversion

### Test 2: No Direct Navigation

**Purpose**: Test attribution when user never clicks a direct link

1. **Visit TheLoopWay with affiliate**: `?rfsn=NOLINK123`
2. **Submit form** with email: `nolink@test.com`
3. **Clear browser history/cache**
4. **Open new incognito window**
5. **Visit LoopBioLabs directly** (no URL params)
6. **Login** with `nolink@test.com`
7. **Make purchase**
8. **Verify**: Conversion still attributed to NOLINK123

### Test 3: Multiple Affiliates (Last Touch)

**Purpose**: Verify last-touch attribution

1. **Visit** with first affiliate: `?rfsn=FIRST123`
2. **Later visit** with second: `?rfsn=SECOND123`
3. **Submit form and purchase**
4. **Verify**: Attributed to SECOND123 (last touch)

### Test 4: Lifetime Attribution

**Purpose**: Test first-touch lifetime attribution

1. **First visit ever**: `?rfsn=LIFETIME123`
2. **Make first purchase**
3. **Check Segment traits**:
   ```javascript
   analytics.user().traits()
   // Should show:
   // refersionId: "LIFETIME123"
   // refersionFirstTouch: "LIFETIME123"
   ```
4. **Visit again** with different affiliate: `?rfsn=OTHER456`
5. **Make second purchase**
6. **Verify**: Still attributed to LIFETIME123 (first touch)

## Automated Test Scripts

### 1. Run Full Test Suite
```bash
npm run test-full-attribution
```

### 2. Test Individual Components
```bash
# Test webhook
npm run test-webhook

# Test form submission
npm run test-form-submission

# Test cross-domain flow
npm run test-cross-domain
```

### 3. Verify Live Endpoints
```bash
# Check all endpoints are responding
npm run verify-endpoints
```

## Debugging Checklist

### If tracking isn't captured:
- [ ] Check URL has `?rfsn=` parameter
- [ ] Verify JavaScript isn't blocked
- [ ] Check localStorage in DevTools
- [ ] Look for console errors

### If forms don't track:
- [ ] Verify Segment script loaded
- [ ] Check HubSpot form ID is correct
- [ ] Ensure email field is filled
- [ ] Check network tab for API calls

### If attribution fails:
- [ ] Verify same email used on both sites
- [ ] Check Segment Debugger for identify calls
- [ ] Verify webhook received "Order Completed"
- [ ] Check Vercel logs for errors

### If conversions don't appear:
- [ ] Verify REFERSION_API_KEY is set
- [ ] Check affiliate code exists in Refersion
- [ ] Ensure order ID is unique
- [ ] Look for API errors in Vercel logs

## Manual Testing Commands

### Check Segment Identity
```javascript
// On any page with Segment
analytics.user().id()      // User ID
analytics.user().traits()  // All traits including refersionId
```

### Force Identity Update
```javascript
// Use when testing needs fresh identity
analytics.identify('test@example.com', {
  refersionId: 'FORCETEST123',
  refersionFirstTouch: 'FORCETEST123'
});
```

### Simulate Purchase
```javascript
// Test purchase without going through checkout
analytics.track('Order Completed', {
  orderId: 'MANUAL-' + Date.now(),
  total: 99.99,
  email: analytics.user().traits().email,
  products: [{
    productId: 'TEST-001',
    name: 'Test Product',
    price: 99.99,
    quantity: 1
  }]
});
```

## Monitoring Production

### Daily Checks
1. Segment Debugger - Check for errors
2. Vercel Functions - Monitor success rate
3. Refersion - Verify conversions match orders

### Weekly Review
1. Attribution rate: (Attributed Orders / Total Orders)
2. Cross-domain success: (LoopBioLabs orders with TheLoopWay source)
3. Webhook reliability: (Successful / Total webhook calls)

## Success Metrics

Your attribution is working if:
- ✅ 40%+ of LoopBioLabs purchases have affiliate attribution
- ✅ Webhook success rate > 99%
- ✅ HubSpot contacts show refersionid for form submissions
- ✅ No duplicate conversions in Refersion

## Common Issues & Solutions

### "No affiliate ID in Order Completed"
- User wasn't identified properly
- Solution: Ensure identify() called on login

### "Webhook timeout"
- Refersion API slow response
- Solution: Check API key, increase timeout

### "Duplicate conversion"
- Same order ID used twice
- Solution: Ensure unique order IDs

### "Attribution rate low"
- Users not providing email on TheLoopWay
- Solution: Incentivize form completion