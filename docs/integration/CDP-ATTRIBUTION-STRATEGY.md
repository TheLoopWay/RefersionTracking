# Modern Cross-Domain Attribution with CDP

## Why Use a CDP (Segment/RudderStack)?

### Current Pain Points
- Multiple tracking scripts (Refersion, HubSpot, analytics)
- Cross-domain attribution is fragile
- No unified customer view
- Manual implementation for each tool
- Privacy compliance complexity

### What a CDP Solves
1. **Single Source of Truth** - One SDK, all destinations
2. **Identity Resolution** - Automatically links anonymous → known users
3. **Cross-Domain Stitching** - Built-in cross-domain tracking
4. **Email-Based Attribution** - Reliable tracking through user identification
5. **Server-Side Tracking** - Bypasses ad blockers, more reliable

## Recommended Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  TheLoopWay.com │     │ LoopBioLabs.com │
│   (Squarespace) │     │     (Bubble)    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     ↓
            ┌─────────────────┐
            │   Segment/      │
            │  RudderStack    │
            │   (CDP)         │
            └────────┬────────┘
                     ↓
     ┌───────────────┴───────────────┐
     ↓               ↓               ↓
┌─────────┐    ┌─────────┐    ┌─────────┐
│Refersion│    │ HubSpot │    │Analytics│
└─────────┘    └─────────┘    └─────────┘
```

## Implementation Guide

### Step 1: Choose Your CDP

**Segment** (Recommended for ease of use)
- Pros: Market leader, extensive integrations, great docs
- Cons: Can get expensive at scale
- Best for: Quick implementation, less technical teams

**RudderStack** (Recommended for control)
- Pros: Open source option, self-hostable, cheaper
- Cons: Slightly steeper learning curve
- Best for: Technical teams, cost-conscious

### Step 2: Basic Setup

```javascript
// 1. Install Segment on both sites
!function(){var analytics=window.analytics=window.analytics||[];
// ... Segment snippet
analytics.load("YOUR_WRITE_KEY");
analytics.page();}();

// 2. Identify users consistently
// On TheLoopWay form submission:
analytics.identify(userId, {
  email: formData.email,
  refersionId: urlParams.get('rfsn'),
  firstName: formData.firstName,
  source: 'theloopway_form'
});

// On LoopBioLabs login/signup:
analytics.identify(userId, {
  email: currentUser.email
});
// Segment automatically merges these profiles!
```

### Step 3: Track Key Events

```javascript
// TheLoopWay - Form submission
analytics.track('Form Submitted', {
  formName: 'peptide-inquiry',
  refersionId: localStorage.getItem('rfsn'),
  email: formData.email
});

// LoopBioLabs - Purchase
analytics.track('Order Completed', {
  orderId: order.id,
  total: order.total,
  products: order.items,
  // Segment automatically includes the user's refersionId!
});
```

### Step 4: Configure Destinations

#### Refersion Integration
```javascript
// In Segment/RudderStack destination config:
{
  "publicKey": "pub_ee6ba2b9f9295e53f4eb",
  "cartIdField": "properties.orderId",
  "affiliateIdField": "traits.refersionId"
}
```

#### HubSpot Integration
```javascript
// Map Segment traits to HubSpot properties:
{
  "traits.refersionId": "refersionid",
  "traits.email": "email",
  "properties.total": "last_purchase_amount"
}
```

## Advanced: Enhanced Cross-Domain Tracking

### Email-First Strategy
**Benefits:**
- 100% accuracy when email is provided
- No privacy concerns
- Works with all browsers and privacy tools
- Permanent attribution

### Implementation:
```javascript
// Capture email as early as possible
analytics.identify(userEmail, {
  email: userEmail,
  refersionId: urlParams.get('rfsn'),
  source: 'form_submission'
});

// On the second domain, Segment automatically
// links the user when they provide the same email
```

## Privacy-First Approach

### Recommended Strategy
1. **Primary**: Email-based identity (explicit consent)
2. **Secondary**: URL parameters (rfsn tracking)
3. **Tertiary**: First-party cookies (same domain)
4. **Always**: Respect user privacy and consent

### Implementation:
```javascript
// Privacy-respecting tracking
class PrivacyFirstTracker {
  async getUserId() {
    // 1. Check for authenticated user
    if (currentUser?.email) {
      return { id: currentUser.email, method: 'authenticated' };
    }
    
    // 2. Check for consented tracking
    if (hasTrackingConsent()) {
      // Use first-party cookie
      let userId = getCookie('loop_user_id');
      if (!userId) {
        userId = generateUUID();
        setCookie('loop_user_id', userId, { 
          domain: '.theloopway.com',
          sameSite: 'lax',
          secure: true 
        });
      }
      return { id: userId, method: 'cookie' };
    }
    
    // 3. Session-only tracking
    return { 
      id: sessionStorage.getItem('session_id') || generateUUID(),
      method: 'session' 
    };
  }
}
```

## Migration Path

### Phase 1: Add CDP alongside existing tracking (1 week)
- Install Segment/RudderStack
- Keep existing scripts running
- Verify data flow

### Phase 2: Route through CDP (2 weeks)
- Configure Refersion destination
- Configure HubSpot destination
- Test attribution flow

### Phase 3: Remove direct scripts (1 week)
- Remove individual tracking scripts
- Monitor for issues
- Keep CDP as single source

## Cost-Benefit Analysis

### Without CDP (Current)
- **Dev Time**: 40+ hours initial, 10 hours/month maintenance
- **Attribution Loss**: ~15-20% of cross-domain conversions
- **Data Quality**: Inconsistent user profiles
- **Compliance Risk**: Manual privacy handling

### With CDP
- **Dev Time**: 20 hours initial, 2 hours/month maintenance
- **Attribution Loss**: <5% of cross-domain conversions
- **Data Quality**: Unified profiles, automatic deduplication
- **Compliance**: Built-in consent management

### ROI Calculation
```
Monthly affiliate sales: $50,000
Attribution improvement: 15% → 95% = 80% increase in tracked sales
Additional tracked revenue: $40,000
Typical affiliate commission: 10% = $4,000/month
CDP cost: ~$500/month
Net benefit: $3,500/month
```

## Recommended Next Steps

1. **Sign up for Segment free tier** (10,000 MTUs free)
2. **Install on both properties** (2 hours)
3. **Configure Refersion destination** (1 hour)
4. **Test with real affiliate link** (30 mins)
5. **Monitor for 1 week**
6. **Remove old tracking scripts**

## Simple Implementation Example

```javascript
// TheLoopWay.com - Global Script
analytics.ready(() => {
  // Capture Refersion ID
  const rfsn = new URLSearchParams(window.location.search).get('rfsn');
  if (rfsn) {
    analytics.identify({ refersionId: rfsn });
    analytics.track('Affiliate Link Clicked', { 
      affiliateId: rfsn,
      landingPage: window.location.href 
    });
  }
});

// LoopBioLabs.com - Purchase Event
analytics.track('Order Completed', {
  orderId: order.id,
  revenue: order.total,
  // Segment automatically includes refersionId from identify!
});
```

That's it! The CDP handles all the complex attribution logic.