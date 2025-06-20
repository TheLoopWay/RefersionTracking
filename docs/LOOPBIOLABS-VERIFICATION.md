# LoopBioLabs Conversion Tracking Verification

## Quick Verification Steps

### 1. Check Segment Integration
```javascript
// In browser console on LoopBioLabs.com:
analytics.user().traits()
```
Should show:
```javascript
{
  email: "user@example.com",
  refersionId: "ABC123"  // ← This is what we need
}
```

### 2. Test Purchase Event
```javascript
// Simulate a purchase in console:
analytics.track('Order Completed', {
  orderId: 'TEST-' + Date.now(),
  total: 99.99,
  email: analytics.user().traits().email,
  affiliateId: analytics.user().traits().refersionId
});
```

### 3. Check Webhook Received
1. Go to [Segment Debugger](https://app.segment.com/debugger)
2. Look for "Order Completed" event
3. Verify it contains refersionId in properties or traits

### 4. Check Vercel Logs
```bash
# View function logs
vercel logs --follow

# Look for:
# [Segment Webhook] Processing order TEST-123 for affiliate ABC123
```

## What Makes It Work

### On LoopBioLabs (Bubble):

1. **User Identification** - When user logs in/signs up:
```javascript
analytics.identify(userId, {
  email: email,
  refersionId: localStorage.getItem('rfsn')  // If available
});
```

2. **Purchase Tracking** - In checkout workflow:
```javascript
analytics.track('Order Completed', {
  orderId: orderId,
  total: total,
  email: currentUser.email
  // refersionId comes from user traits automatically
});
```

### The Attribution Chain:

```
TheLoopWay → Form Submit → HubSpot → refersionid property
                                   ↓
                          Segment identify() call
                                   ↓
LoopBioLabs → Login → Segment has refersionId trait
                                   ↓
           Purchase → Order Completed (with trait)
                                   ↓
              Webhook → Refersion API → Commission tracked
```

## Common Issues & Fixes

### Issue: "No affiliate ID in Order Completed"
**Check:**
1. Was user identified with refersionId trait?
2. Is Bubble passing user email to Segment?
3. Did user originally have tracking from TheLoopWay?

**Fix:**
```javascript
// Force refresh user traits before purchase
analytics.identify(analytics.user().id(), {
  email: currentUser.email,
  refersionId: localStorage.getItem('rfsn') || 
               currentUser.refersionId ||
               analytics.user().traits().refersionId
});
```

### Issue: "Webhook not receiving events"
**Check:**
1. Is webhook enabled in Segment destination?
2. Correct URL: https://forms.theloopway.com/api/segment-to-refersion
3. Any filters blocking Order Completed events?

### Issue: "Conversions not in Refersion"
**Check:**
1. Is REFERSION_API_KEY set in Vercel?
2. Check Vercel logs for Refersion API errors
3. Verify affiliate code exists in Refersion

## Manual Test Sequence

1. **Visit TheLoopWay** with `?rfsn=TESTAFFILIATE`
2. **Submit any form** with email test@example.com
3. **Log into LoopBioLabs** with same email
4. **Check console:**
   ```javascript
   analytics.user().traits() // Should have refersionId
   ```
5. **Make test purchase**
6. **Check Segment Debugger** for Order Completed
7. **Check Vercel logs** for webhook processing
8. **Check Refersion** for conversion (if API key set)

## Bubble-Specific Setup

Make sure these are in your Bubble workflows:

### On User Login/Signup:
```javascript
// Run JavaScript action
analytics.identify(Current_User's_unique_id, {
  email: Current_User's_email,
  firstName: Current_User's_first_name,
  lastName: Current_User's_last_name,
  refersionId: Get_refersion_from_localStorage_or_User
});
```

### On Purchase Complete:
```javascript
// Run JavaScript action
analytics.track('Order Completed', {
  orderId: This_Order's_ID,
  total: This_Order's_Total,
  currency: 'USD',
  email: Current_User's_email,
  products: [{
    productId: This_Order's_Product_ID,
    name: This_Order's_Product_Name,
    price: This_Order's_Product_Price,
    quantity: 1
  }]
});
```

The key is that Segment automatically includes user traits (including refersionId) with every track() call after identify().