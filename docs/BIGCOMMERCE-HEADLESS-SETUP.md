# Refersion × Headless BigCommerce Setup Guide

_Purpose:_ keep click → checkout → conversion attribution intact when your storefront is split across **startwithloop.com** (landing), **loopbiolabs.com** (headless catalogue) and **pay.loopbiolabs.com** (BigCommerce‐hosted checkout).

---
## 1. Terminology & URLs
| Layer | Domain | What it hosts |
|-------|--------|--------------|
| Landing site | `startwithloop.com` | Marketing pages, blog, sign-up |
| Headless store | `loopbiolabs.com` | Product browsing, cart, custom /checkout route |
| BigCommerce theme | `pay.loopbiolabs.com` (or `loop-bio-labs.mybigcommerce.com`) | Stencil theme; checkout + order confirmation |

Refersion's _visit_ (click) tracker stores tokens in **`localStorage`**, which is **domain-scoped**. Any time we jump across domains we must rewrite those tokens on the destination domain _before_ continuing.

---
## 2. Overview of the hand-off chain
```
startwithloop.com (captures rfsn from URL)
  └── Link to store  →  loopbiolabs.com (receives & stores tracking)
                            └── /checkout route  →  pay.loopbiolabs.com/checkout
                                                        └── receives tracking params via URL
                                                              └── shopper pays → Order Confirmation
```
The Refersion-for-BigCommerce app or conversion script on the confirmation page finalizes the sale in Refersion.

---
## 3. Implementation details
### 3.1 Landing site (startwithloop)
* Captures affiliate ID (`rfsn`) from URL parameters
* Stores tracking data in localStorage and cookies
* Uses `TrackedLink.tsx` component to preserve tracking when linking to the store
* Sends tracking data to HubSpot when visitors submit email forms

### 3.2 Headless store (loopbiolabs.com)
* **Middleware** (`with-affiliate-tracking.ts`): Captures `rfsn` and UTM parameters from URL
* **Analytics Providers**: Both Segment and Refersion providers initialized with tracking data
* **Checkout Route** (`/checkout/route.ts`): Updated to extract tracking data and append to BigCommerce checkout URL
* **Cross-Domain Utilities** (`/lib/tracking/cross-domain.ts`): Helper functions to extract and pass tracking data

### 3.3 BigCommerce theme (pay.loopbiolabs.com)
1. **Headless Redirect & Cross-Domain Tracking** — Added to `templates/layout/base.html`:
   - Automatically redirects non-checkout pages to the headless store
   - Receives tracking parameters from URL on checkout pages
   - Sets tracking data in localStorage and cookies for Refersion to pick up
   
2. **Cross-Domain Tracking Script** — The script in base.html:
   - Redirects all non-checkout traffic to `loopbiolabs.com`
   - Preserves paths and query strings when redirecting
   - On checkout pages, extracts tracking parameters from URL:
     - `rfsn_v4_id`, `rfsn_v4_aid`, `rfsn_v4_cs` (Refersion v4 format)
     - `rfsn` (standard Refersion ID)
   - Sets both `rfsn` and `refersion_code` cookies for BigCommerce app compatibility

3. **Refersion Conversion Tracking** — Ensure one of these is configured:
   - **Option A**: Install the Refersion-for-BigCommerce app from the BigCommerce App Store
   - **Option B**: Add conversion tracking script to order confirmation page:
   ```html
   <script>
   !function(e,n,t){e.TrackingSystemObject="r";(s=n.createElement(t)).async=1;
   s.src="https://cdn.refersion.com/refersion.js";s.onload=function(){
       r.pubKey="YOUR_PUBLIC_KEY";r.settings.fp_off=true;
       r.initializeXDLS().then(()=>r.sendConversion());};
   (n.getElementsByTagName(t)[0]).parentNode.insertBefore(s,null)}(window,document,"script");
   </script>
   ```

---
## 4. Segment — do we embed it in Stencil?
Not necessary **and** not recommended: 
* We already send `Order Completed` from the headless site (server-side Catalyst or Segment middleware).
* If the Stencil template loaded Segment JS it could double-fire the same event or break under ad-blockers on checkout.bigcommerce.com.

Only include Segment in Stencil if you have other BC-only events you must capture (very rare for headless builds). If you do, use `analytics.load(writeKey,{disableClientPersistence:true})` to avoid duplicate cookies.

---
## 5. End-to-end test checklist
1. Visit `https://startwithloop.com/?rfsn=TESTCODE` → Click "Shop"
2. Verify tracking on `loopbiolabs.com`:
   - Open DevTools Console
   - Check: `localStorage.getItem('rfsn')` should return "TESTCODE"
   - Check: Cookie `rfsn` should be set
3. Add product to cart → Click checkout
4. On `pay.loopbiolabs.com` checkout page:
   - Check URL contains tracking parameters
   - Open DevTools Console:
   ```js
   localStorage.getItem('rfsn_v4_id') // → should have value
   document.cookie // → should contain rfsn=TESTCODE
   ```
5. Complete test purchase
6. Check Refersion dashboard → Conversions → Today shows the sale

---
## 6. Troubleshooting
| Symptom | Most common cause |
|---------|------------------|
| pay.loopbiolabs.com doesn't redirect | Script might be cached or not loading. Check browser console for errors |
| Tracking parameters lost on checkout | Checkout route not passing parameters. Verify `/checkout/route.ts` implementation |
| Clicks track but conversions don't | 1) Refersion app not installed, 2) Conversion script missing, or 3) Tracking data not in localStorage |
| Duplicate conversions | Both webhook & BC app firing; disable one source |
| No affiliate attribution | Check cookies/localStorage have correct domain (`.loopbiolabs.com`) |

---
## 7. Critical Implementation Notes

1. **Domain Configuration**: Ensure cookies are set with domain `.loopbiolabs.com` to work across subdomains
2. **URL Parameters**: The checkout route MUST pass these parameters:
   - `rfsn` - Primary Refersion ID
   - `rfsn_v4_id`, `rfsn_v4_aid`, `rfsn_v4_cs` - Refersion v4 tracking
   - UTM parameters for additional attribution
3. **BigCommerce App**: The Refersion-for-BigCommerce app looks for both `rfsn` and `refersion_code` cookies
4. **Testing**: Always test with real affiliate IDs from your Refersion dashboard

When all steps are complete, your cross-domain tracking will maintain attribution from initial click through final conversion. 