# Cross-Domain Attribution Strategy

## The Challenge
Users are tagged with Refersion tracking on TheLoopWay.com but make purchases on LoopBioLabs.com. How do we connect these conversions?

## Solution Overview

### 🥇 Priority 1: Email-Based Attribution (Recommended)

**How it works:**
1. User clicks affiliate link → lands on TheLoopWay.com
2. Fills out form → HubSpot contact created with `refersionid`
3. Later visits LoopBioLabs.com → logs in/signs up with same email
4. System looks up their HubSpot contact → retrieves `refersionid`
5. Purchase tracked to original affiliate

**Implementation in Bubble:**
```javascript
// On user login/signup
1. Make API call to HubSpot with user email
2. Get contact's refersionid property
3. Store in Bubble user record
4. Use for all future conversions
```

### 🥈 Priority 2: Direct Link Tracking

**How it works:**
1. All links from TheLoopWay → LoopBioLabs include `?rfsn=` parameter
2. LoopBioLabs captures and stores the parameter
3. No email lookup needed

**Implementation:**
```javascript
// On TheLoopWay - modify Shop/Buy buttons
<a href="https://loopbiolabs.com/shop?rfsn={{stored_affiliate_id}}">
  Shop Now
</a>
```

### 🥉 Priority 3: Unified Visitor ID

**How it works:**
1. Generate unique visitor ID on first visit to any site
2. Include in all form submissions and purchases
3. Match conversions by visitor ID

**Limitations:**
- Doesn't work across devices
- Cleared with browser data
- Privacy regulations may apply

## Recommended Implementation

### Step 1: Update LoopBioLabs Header
Add the enhanced tracking script:
```html
<!-- In Bubble Settings → SEO → Header -->
<script src="integrations/bubble/bubble-hubspot-attribution.js"></script>
```

### Step 2: Create Login/Signup Workflow
```
When User logs in or signs up:
1. Run JavaScript: getUnifiedTracking()
2. If result.rfsn exists → Update Current User's refersion_id
3. Else → Make API call to check HubSpot
```

### Step 3: Modify Shop Links on TheLoopWay
```javascript
// Add to TheLoopWay global scripts
document.addEventListener('DOMContentLoaded', function() {
  const rfsn = localStorage.getItem('rfsn');
  if (rfsn) {
    // Update all shop links
    document.querySelectorAll('a[href*="loopbiolabs.com"]').forEach(link => {
      const separator = link.href.includes('?') ? '&' : '?';
      link.href = link.href + separator + 'rfsn=' + rfsn;
    });
  }
});
```

### Step 4: Track Conversions with Attribution
In your Bubble purchase workflow:
```javascript
// Get affiliate ID (checks all sources)
const tracking = await getUnifiedTracking();

if (tracking.rfsn) {
  // Track with Refersion
  r.sendConversion({
    affiliate_id: tracking.rfsn,
    order_id: 'Order ID',
    amount: 'Order Amount'
  });
  
  // Update HubSpot
  updateHubSpotContact({
    email: 'Customer Email',
    refersionid: tracking.rfsn,
    last_purchase: 'Current Date'
  });
}
```

## Testing Your Attribution

### Test Case 1: Direct Flow
1. Visit: `theloopway.com?rfsn=TEST-DIRECT`
2. Click "Shop Now" → redirects to `loopbiolabs.com?rfsn=TEST-DIRECT`
3. Make purchase
4. Check: Conversion attributed to `TEST-DIRECT`

### Test Case 2: Email Lookup
1. Visit: `theloopway.com?rfsn=TEST-EMAIL`
2. Submit form with `test@example.com`
3. Later, visit `loopbiolabs.com` (no tracking parameter)
4. Login with `test@example.com`
5. Make purchase
6. Check: Conversion attributed to `TEST-EMAIL`

### Test Case 3: Multi-Device
1. Phone: Visit `theloopway.com?rfsn=TEST-DEVICE`
2. Phone: Submit form
3. Desktop: Visit `loopbiolabs.com`
4. Desktop: Login with same email
5. Desktop: Make purchase
6. Check: Conversion attributed to `TEST-DEVICE`

## Troubleshooting

### "No attribution found"
1. Check if user has HubSpot contact
2. Verify email matches exactly
3. Check browser console for errors
4. Try direct link method as backup

### "Wrong affiliate credited"
1. Check order of priority in `getUnifiedTracking()`
2. Clear test data between tests
3. Verify no duplicate contacts in HubSpot

### "Attribution lost on mobile"
1. Ensure mobile links include parameters
2. Test email lookup fallback
3. Consider SMS link tracking

## Advanced: Server-Side Attribution

For highest reliability, implement server-side tracking:

1. **On form submission (TheLoopWay):**
   - Send to your API: `{email, rfsn, timestamp}`
   
2. **On purchase (LoopBioLabs):**
   - Query your API by email
   - Get original rfsn
   - Track conversion

This eliminates all client-side issues and works 100% of the time.

## Summary

Best approach depends on your flow:
- **High email capture rate?** → Use HubSpot lookup
- **Direct shopping flow?** → Use URL parameters  
- **Complex user journey?** → Implement all methods

The provided scripts support all three methods, so you're covered regardless of how users move between your sites.