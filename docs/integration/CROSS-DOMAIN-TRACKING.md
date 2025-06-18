# Cross-Domain Refersion + HubSpot Tracking

## 🎯 The Challenge

You have two sites:
1. **TheLoopWay.com** (Squarespace) - Lead generation, forms
2. **LoopBioLabs.com** (Bubble) - E-commerce, purchases

Both need to:
- Track the same Refersion affiliate
- Send data to the same HubSpot account
- Maintain tracking when users move between sites

## 🔗 The Solution: Unified Tracking

### 1. Consistent Storage Keys

Both sites must use the SAME storage keys:
```javascript
// Used on BOTH sites
localStorage.setItem('rfsn', affiliateId);
localStorage.setItem('rfsn_timestamp', timestamp);
localStorage.setItem('rfsn_source_url', sourceUrl);
```

### 2. Cross-Domain Tracking Links

When linking between your sites, preserve tracking:

**From TheLoopWay → LoopBioLabs:**
```javascript
// Add this to Squarespace Code Injection
function linkToBioLabs(path) {
  const rfsn = localStorage.getItem('rfsn');
  const baseUrl = 'https://loopbiolabs.com';
  if (rfsn) {
    return `${baseUrl}${path}?rfsn=${rfsn}`;
  }
  return `${baseUrl}${path}`;
}
```

**From LoopBioLabs → TheLoopWay:**
```javascript
// Add this to Bubble workflows
var rfsn = localStorage.getItem('rfsn');
var loopWayUrl = 'https://theloopway.com/page';
if (rfsn) {
  window.location = loopWayUrl + '?rfsn=' + rfsn;
} else {
  window.location = loopWayUrl;
}
```

### 3. HubSpot Contact Syncing

Both sites should use the same HubSpot contact property: `refersionid`

**On Form Submission (TheLoopWay):**
- Automatically included via forms.theloopway.com

**On Purchase (LoopBioLabs):**
```javascript
// In Bubble workflow after purchase
// Update HubSpot contact with purchase info
var email = Current User's Email;
var rfsn = localStorage.getItem('rfsn') || Current User's refersion_id;

// You'll need a HubSpot API workflow or integration
```

## 📋 Implementation Checklist

### Both Sites Need:
- [ ] Same Refersion public key: `pub_ee6ba2b9f9295e53f4eb`
- [ ] Same localStorage keys: `rfsn`, `rfsn_timestamp`, `rfsn_source_url`
- [ ] Same HubSpot property: `refersionid`

### TheLoopWay.com Setup:
- [ ] Global tracking script in Code Injection
- [ ] Forms at forms.theloopway.com capture tracking
- [ ] Links to LoopBioLabs include `?rfsn=` parameter

### LoopBioLabs.com Setup:
- [ ] Enhanced header tracking script
- [ ] Conversion tracking on purchase
- [ ] Store affiliate ID in Bubble database
- [ ] Links to TheLoopWay include `?rfsn=` parameter

## 🔄 User Journey Example

1. **Affiliate shares:** `theloopway.com/peptides?rfsn=ABC123`
2. **User visits:** Tracking stored in localStorage
3. **User fills form:** HubSpot contact created with `refersionid: ABC123`
4. **User clicks "Shop":** Goes to `loopbiolabs.com/shop?rfsn=ABC123`
5. **User purchases:** Conversion tracked to affiliate ABC123
6. **HubSpot updated:** Same contact now has form data + purchase data

## 💾 Bubble Database Schema

Add to your User data type:
```
refersion_id (text) - Affiliate ID
refersion_timestamp (date) - When they clicked
refersion_source (text) - Original landing page
refersion_synced (yes/no) - Synced to HubSpot?
```

## 🔧 Advanced: Unified Tracking Script

Create one script for both sites:

```javascript
// UNIFIED TRACKING SCRIPT - Use on both sites
(function() {
  // Configuration
  const SITES = {
    loopway: 'https://theloopway.com',
    biolabs: 'https://loopbiolabs.com',
    forms: 'https://forms.theloopway.com'
  };
  
  // Capture tracking
  function captureTracking() {
    const params = new URLSearchParams(window.location.search);
    const rfsn = params.get('rfsn');
    
    if (rfsn) {
      localStorage.setItem('rfsn', rfsn);
      localStorage.setItem('rfsn_timestamp', new Date().toISOString());
      localStorage.setItem('rfsn_source_url', window.location.href);
      
      // Track with Refersion if available
      if (window.r && window.r.click) {
        window.r.click(rfsn);
      }
    }
  }
  
  // Add tracking to cross-domain links
  function updateCrossDomainLinks() {
    const rfsn = localStorage.getItem('rfsn');
    if (!rfsn) return;
    
    // Find all cross-domain links
    document.querySelectorAll('a').forEach(link => {
      const href = link.href;
      Object.values(SITES).forEach(domain => {
        if (href && href.includes(domain) && !href.includes(window.location.hostname)) {
          // Add tracking to cross-domain link
          const separator = href.includes('?') ? '&' : '?';
          link.href = href + separator + 'rfsn=' + encodeURIComponent(rfsn);
        }
      });
    });
  }
  
  // Initialize
  captureTracking();
  updateCrossDomainLinks();
  
  // Watch for new links (Bubble SPA)
  if (window.MutationObserver) {
    new MutationObserver(updateCrossDomainLinks)
      .observe(document.body, { childList: true, subtree: true });
  }
})();
```

## 🏷️ HubSpot Workflow Automation

Create a HubSpot workflow:
1. **Trigger:** Contact property `refersionid` is known
2. **Action:** Add to list "Referral Leads"
3. **If/Then:** If contact makes purchase
4. **Action:** Add to list "Referral Customers"
5. **Action:** Send internal notification

## 🐛 Testing Cross-Domain Tracking

1. Visit: `theloopway.com?rfsn=CROSSTEST`
2. Check localStorage: `rfsn` should be `CROSSTEST`
3. Fill out a form
4. Check HubSpot: Contact should have `refersionid: CROSSTEST`
5. Click link to LoopBioLabs
6. URL should be: `loopbiolabs.com?rfsn=CROSSTEST`
7. Check localStorage on LoopBioLabs: Should still have `CROSSTEST`
8. Make a purchase
9. Check Refersion: Conversion should be attributed to `CROSSTEST`

## 🚨 Common Issues

**Tracking lost between sites:**
- Ensure links include `?rfsn=` parameter
- Check both sites use same localStorage keys
- Verify no typos in affiliate ID

**HubSpot contact duplicates:**
- Use email as unique identifier
- Merge duplicates in HubSpot
- Set up deduplication workflow

**Conversion not attributed:**
- Check Refersion dashboard for both domains
- Ensure purchase happens after click
- Verify conversion tracking fires

## 📊 Reporting

To see full customer journey:
1. HubSpot: Filter contacts by `refersionid` is known
2. Export list with form submissions + purchases
3. Match with Refersion conversion report
4. Calculate: Leads → Customers conversion rate per affiliate