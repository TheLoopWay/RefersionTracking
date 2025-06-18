# Segment Quick Start Guide

## 🚀 5-Minute Setup

### 1. Create Segment Sources

In Segment dashboard:
- **Source 1**: "TheLoopWay" → Copy write key
- **Source 2**: "LoopBioLabs" → Copy write key

### 2. Install on TheLoopWay (Squarespace)

**Settings → Advanced → Code Injection → Header:**

```html
<!-- Segment -->
<script>
  !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="YOUR_THELOOPWAY_KEY";analytics.SNIPPET_VERSION="4.15.3";
  analytics.load("YOUR_THELOOPWAY_KEY");
  analytics.page();
  }}();
</script>

<!-- Simple Tracking Helper -->
<script src="https://forms.theloopway.com/integrations/segment/segment-simple.js"></script>
```

### 3. Install on LoopBioLabs (Bubble)

**Settings → SEO/metatags → Script in header:**

```html
<!-- Segment -->
<script>
  !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="YOUR_BIOLABS_KEY";analytics.SNIPPET_VERSION="4.15.3";
  analytics.load("YOUR_BIOLABS_KEY");
  analytics.page();
  }}();
</script>

<!-- Simple Tracking Helper -->
<script src="https://forms.theloopway.com/integrations/segment/segment-simple.js"></script>
```

### 4. Update Your Forms

In your form submission code (forms.theloopway.com):

```javascript
// After HubSpot submission
if (window.trackFormSubmission) {
  trackFormSubmission({
    email: formData.email,
    firstName: formData.first_name,
    lastName: formData.last_name,
    formName: 'peptide-inquiry',
    formId: HUBSPOT_FORM_ID
  });
}
```

### 5. Set Up Bubble Workflows

**On User Sign Up:**
```javascript
// Run JavaScript action
const rfsn = BubbleHelpers.identifyUser(
  'Current User email',
  'Current User first name', 
  'Current User last name'
);

// Save to Bubble user (if rfsn exists)
// Current User's refersion_id = rfsn
```

**On Purchase:**
```javascript
// Run JavaScript action
BubbleHelpers.trackOrder(
  'Current Order unique id',
  'Current Order total',
  'Current User email'
);
```

### 6. Configure Destinations

#### HubSpot
1. Add HubSpot destination in Segment
2. Map fields:
   - `traits.refersionId` → `refersionid`
   - `traits.email` → `email`

#### Refersion (via Webhook)
1. Add Webhook destination
2. URL: `https://forms.theloopway.com/api/segment-to-refersion`
3. Events: Only send "Order Completed"

### 7. Add to Vercel Environment

In Vercel dashboard, add:
```
REFERSION_API_KEY=your_refersion_secret_key
```

## 🧪 Testing

### Test 1: Basic Tracking
```
1. Visit: theloopway.com?rfsn=QUICK-TEST
2. Open console: LoopTracking.getAffiliateId()
3. Should return: "QUICK-TEST"
```

### Test 2: Cross-Domain
```
1. On TheLoopWay, click any LoopBioLabs link
2. URL should include: ?rfsn=QUICK-TEST&_sid=...
```

### Test 3: Purchase
```
1. On LoopBioLabs console:
BubbleHelpers.trackOrder('TEST-123', 99.99, 'test@example.com')

2. Check Segment Debugger for event
```

## 🎯 That's It!

You now have:
- ✅ Cross-domain tracking
- ✅ Refersion attribution
- ✅ HubSpot sync
- ✅ No expensive Unify needed

## Common Issues

**"LoopTracking is not defined"**
- Check if segment-simple.js loaded
- Try direct script include instead of src

**"No affiliate on purchase"**
- Check: `LoopTracking.getAffiliateId()`
- Check: `analytics.user().traits()`

**"Webhook not working"**
- Check Vercel logs
- Verify REFERSION_API_KEY is set
- Test webhook manually with Postman