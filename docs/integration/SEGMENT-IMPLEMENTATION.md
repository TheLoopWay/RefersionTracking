# Segment Implementation Guide (Without Unify)

## Overview

We'll use Segment for event tracking and basic identity management, but build our own lightweight identity resolution instead of paying for Unify.

## Step 1: Segment Account Setup

1. **Create Segment Account**
   - Go to [app.segment.com](https://app.segment.com)
   - Create workspace: "Loop"

2. **Create Sources**
   - Source 1: "TheLoopWay Website" (JavaScript)
   - Source 2: "LoopBioLabs Website" (JavaScript)
   - Note the write keys for each

3. **Add Destinations**
   - HubSpot (existing integration)
   - Refersion (we'll use webhooks)
   - Google Analytics (optional)

## Step 2: Install Segment Scripts

### On TheLoopWay.com (Squarespace)

**Settings → Advanced → Code Injection → Header:**

```html
<!-- Segment -->
<script>
  !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="YOUR_THELOOPWAY_WRITE_KEY";analytics.SNIPPET_VERSION="4.15.3";
  analytics.load("YOUR_THELOOPWAY_WRITE_KEY");
  }}();
</script>

<!-- Our Custom Identity Manager -->
<script src="https://forms.theloopway.com/integrations/segment/segment-setup.js"></script>

<!-- Initialize tracking -->
<script>
// Capture Refersion immediately
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const rfsn = urlParams.get('rfsn');
  
  if (rfsn) {
    // Store for later
    localStorage.setItem('rfsn', rfsn);
    localStorage.setItem('rfsn_timestamp', new Date().toISOString());
    
    // Track with Segment when ready
    analytics.ready(() => {
      analytics.track('Affiliate Link Clicked', {
        affiliateId: rfsn,
        landingPage: window.location.href
      });
      
      // Add to user traits
      analytics.identify({
        refersionId: rfsn
      });
    });
  }
})();
</script>
```

### On LoopBioLabs.com (Bubble)

**Settings → SEO/metatags → Script in the header:**

```html
<!-- Segment -->
<script>
  !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="YOUR_LOOPBIOLABS_WRITE_KEY";analytics.SNIPPET_VERSION="4.15.3";
  analytics.load("YOUR_LOOPBIOLABS_WRITE_KEY");
  }}();
</script>

<!-- Our Custom Identity Manager -->
<script src="https://forms.theloopway.com/integrations/segment/segment-setup.js"></script>

<!-- Bubble-specific helpers -->
<script>
// Helper for Bubble workflows
window.segmentHelpers = {
  // Call on user login/signup
  identifyUser: function(email, firstName, lastName) {
    analytics.identify(email, {
      email: email,
      firstName: firstName,
      lastName: lastName
    });
    
    // Check for stored Refersion ID
    const rfsn = localStorage.getItem('rfsn');
    if (rfsn) {
      analytics.identify(email, {
        refersionId: rfsn
      });
    }
  },
  
  // Call on purchase
  trackPurchase: function(orderId, total, email, productName) {
    const rfsn = localStorage.getItem('rfsn') || 
                 analytics.user().traits().refersionId;
    
    analytics.track('Order Completed', {
      orderId: orderId,
      total: parseFloat(total),
      currency: 'USD',
      email: email,
      products: [{
        name: productName,
        price: parseFloat(total),
        quantity: 1
      }],
      affiliateId: rfsn
    });
  }
};
</script>
```

## Step 3: Update Your Forms

### TheLoopWay Form Submission

Add to your form submission handler:

```javascript
// After successful HubSpot submission
analytics.identify(formData.email, {
  email: formData.email,
  firstName: formData.firstName,
  lastName: formData.lastName,
  source: 'theloopway_form'
});

analytics.track('Form Submitted', {
  formName: 'peptide-inquiry',
  formId: 'YOUR_HUBSPOT_FORM_ID'
});
```

## Step 4: Configure Bubble Workflows

### On User Sign Up

**Workflow: When User signs up**
1. **Run JavaScript:**
   ```javascript
   segmentHelpers.identifyUser(
     'Current User\'s email',
     'Current User\'s first name',
     'Current User\'s last name'
   );
   ```

### On Purchase Complete

**Workflow: When Order is completed**
1. **Run JavaScript:**
   ```javascript
   segmentHelpers.trackPurchase(
     'Current Order\'s unique id',
     'Current Order\'s total amount',
     'Current User\'s email',
     'Current Order\'s Product\'s name'
   );
   ```

## Step 5: Cross-Domain Link Setup

### Update Links on TheLoopWay

Add this script to automatically decorate shop links:

```javascript
// Auto-decorate cross-domain links
document.addEventListener('DOMContentLoaded', function() {
  const rfsn = localStorage.getItem('rfsn');
  
  if (rfsn) {
    // Find all links to LoopBioLabs
    document.querySelectorAll('a[href*="loopbiolabs.com"]').forEach(link => {
      const url = new URL(link.href);
      url.searchParams.set('rfsn', rfsn);
      
      // Also add anonymous ID for identity stitching
      const anonId = analytics.user().anonymousId();
      if (anonId) {
        url.searchParams.set('_sid', anonId);
      }
      
      link.href = url.toString();
    });
  }
});
```

## Step 6: Set Up Refersion Webhook

Since Segment doesn't have a native Refersion integration, we'll use webhooks:

1. **In Segment:** Go to Destinations → Add Destination → Webhooks
2. **Configure:**
   - Webhook URL: `https://forms.theloopway.com/api/segment-to-refersion`
   - Events: Only "Order Completed"

3. **Deploy webhook handler:** (Already created in `/api/segment-to-refersion.js`)

## Step 7: Configure HubSpot Destination

In Segment → Destinations → HubSpot:

**Identify Traits Mapping:**
```
traits.email → email
traits.firstName → firstname  
traits.lastName → lastname
traits.refersionId → refersionid
```

**Track Events Mapping:**
- "Form Submitted" → Create/Update Contact
- "Order Completed" → Update Contact Properties

## Testing Your Setup

### Test 1: Basic Flow
1. Visit: `theloopway.com?rfsn=SEGMENT-TEST`
2. Open console: `analytics.user().traits()` should show `refersionId`
3. Submit form
4. Check HubSpot: Contact should have `refersionid` property

### Test 2: Cross-Domain
1. Visit: `theloopway.com?rfsn=CROSS-TEST`
2. Click shop link
3. URL should be: `loopbiolabs.com?rfsn=CROSS-TEST&_sid=...`
4. Make purchase
5. Check Segment debugger for "Order Completed" event with `affiliateId`

### Test 3: Email Matching
1. Submit form on TheLoopWay with `test@example.com`
2. Later, sign up on LoopBioLabs with same email
3. Make purchase
4. Check if original `refersionId` is included

## Cost Optimization

With this setup, you're only paying for:
- Segment MTUs (Monthly Tracked Users)
- No Unify needed
- No Personas needed

To minimize costs:
1. Use `identify` sparingly (only on form/signup)
2. Batch events when possible
3. Filter out bot traffic
4. Set up sampling for high-volume pages

## Next Steps

1. **Monitor for 1 week** - Check Segment debugger
2. **Verify Refersion tracking** - Ensure conversions are attributed
3. **Remove old scripts** - Once confirmed working
4. **Add more events** - Product views, cart additions, etc.

## Troubleshooting

**"No affiliate ID on purchase"**
- Check localStorage: `localStorage.getItem('rfsn')`
- Check user traits: `analytics.user().traits()`
- Verify cross-domain parameters

**"Events not showing in Segment"**
- Check write key is correct
- Open browser console for errors
- Use Segment debugger Chrome extension

**"HubSpot not updating"**
- Verify destination is enabled
- Check field mappings
- Look for errors in Event Delivery tab