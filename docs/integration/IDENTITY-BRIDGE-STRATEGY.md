# Cross-Site Identity Bridge Strategy

## The Challenge

When users move between TheLoopWay.com and LoopBioLabs.com without clicking a direct link, we lose tracking because:
- localStorage is domain-specific
- Cookies can't be shared across different root domains
- Users might visit days/weeks later

## The Solution: Multi-Layer Identity Strategy

### Layer 1: URL Parameter Decoration (Implemented ✅)
When users click links, we add:
- `?rfsn=AFFILIATE_ID` - Refersion tracking
- `&_sid=SEGMENT_ANONYMOUS_ID` - Segment identity

### Layer 2: Email-Based Reconciliation (Implemented ✅)
When users provide email:
- Form submission on TheLoopWay → Creates HubSpot contact with refersionid
- Login/purchase on LoopBioLabs → Looks up refersionid by email

### Layer 3: Smart Redirect Links (New)
Instead of direct links to LoopBioLabs, use bridge URLs:

```html
<!-- Instead of: -->
<a href="https://loopbiolabs.com/shop">Shop Now</a>

<!-- Use: -->
<a href="https://forms.theloopway.com/api/redirect?destination=https://loopbiolabs.com/shop">Shop Now</a>
```

The redirect endpoint:
1. Captures current tracking state
2. Generates a bridge ID
3. Redirects with all parameters preserved

### Layer 4: Persistent User Profiles (Recommended)

#### On TheLoopWay:
```javascript
// When user does ANYTHING meaningful (form view, button click, etc)
analytics.track('User Engaged', {
  action: 'viewed_peptide_info',
  affiliateId: rfsn
});
```

#### On LoopBioLabs:
```javascript
// On page load
analytics.ready(() => {
  const traits = analytics.user().traits();
  if (traits.refersionId && !localStorage.getItem('rfsn')) {
    // Restore from Segment
    localStorage.setItem('rfsn', traits.refersionId);
  }
});
```

## Implementation Priority

### 🥇 Must Have (90% Coverage)
1. **Email-based matching** - Already implemented
2. **URL decoration on links** - Already implemented
3. **Segment trait persistence** - Partially implemented

### 🥈 Should Have (95% Coverage)
4. **Smart redirect links** - Use `/api/redirect` for critical CTAs
5. **Enhanced Bubble workflows** - Check Segment traits on every page load

### 🥉 Nice to Have (98% Coverage)
6. **Progressive profiling** - Capture email earlier in journey
7. **Multi-touch attribution** - Track all interactions, not just last-click

## Practical Examples

### Example 1: Shop Button on TheLoopWay
```html
<a href="https://forms.theloopway.com/api/redirect?destination=https://loopbiolabs.com/shop" 
   class="shop-button"
   onclick="analytics.track('Shop Button Clicked', { affiliateId: LoopTracking.getAffiliateId() })">
  Shop Now
</a>
```

### Example 2: Bubble Page Load Check
```javascript
// Run on every page in Bubble
function checkForTracking() {
  // Priority order:
  // 1. URL parameter (highest)
  const urlRfsn = new URLSearchParams(window.location.search).get('rfsn');
  if (urlRfsn) return LoopTracking.setAffiliateId(urlRfsn);
  
  // 2. Current user's saved ID
  const userRfsn = 'Current User refersion_id'; // Bubble expression
  if (userRfsn) return LoopTracking.setAffiliateId(userRfsn);
  
  // 3. Segment traits
  if (analytics.user) {
    const traits = analytics.user().traits();
    if (traits.refersionId) return LoopTracking.setAffiliateId(traits.refersionId);
  }
  
  // 4. localStorage (last resort)
  const storedRfsn = localStorage.getItem('rfsn');
  if (storedRfsn) return storedRfsn;
}
```

## Testing Your Identity Bridge

### Test Case 1: Direct Navigation
1. Visit: `theloopway.com?rfsn=BRIDGE-TEST`
2. Submit a form with email `test@bridge.com`
3. Close browser
4. Open new browser, visit: `loopbiolabs.com` (no parameters)
5. Login with `test@bridge.com`
6. Make purchase
7. ✅ Should attribute to `BRIDGE-TEST`

### Test Case 2: Delayed Conversion
1. Visit: `theloopway.com?rfsn=DELAY-TEST`
2. Browse around, don't submit form
3. Wait 3 days
4. Visit: `loopbiolabs.com` directly
5. Sign up and purchase
6. ❌ Without email, attribution is lost
7. 💡 This is why progressive profiling matters

## The Reality Check

**You can achieve:**
- 90% attribution accuracy with email-based matching
- 95% with smart redirects and enhanced workflows
- 98% with progressive profiling and Segment identity resolution

**You cannot achieve:**
- 100% cross-domain tracking (technical impossibility without shared infrastructure)
- Anonymous user tracking across domains without some user action

## Recommended Next Steps

1. **Update critical CTAs** to use redirect endpoint
2. **Add Segment trait checking** to Bubble page loads
3. **Implement progressive profiling** - Capture emails earlier with value exchange
4. **Monitor attribution gaps** - Use Segment to identify where users drop off