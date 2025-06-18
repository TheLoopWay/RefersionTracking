# Loop Forms - Technical Approach Summary

## Our Tracking Approach

This document clarifies the exact tracking approach implemented in the Loop Forms platform.

### ✅ What We Use

1. **Segment Analytics** (Primary)
   - Unified tracking across TheLoopWay.com and LoopBioLabs.com
   - Write keys configured for both properties
   - Handles identity resolution through email matching

2. **HubSpot Forms API**
   - Direct form submission to HubSpot
   - Custom property `refersionid` for affiliate tracking
   - No iframe embeds - we use the Forms API v3

3. **Refersion Affiliate Tracking**
   - URL parameter `rfsn` for affiliate identification
   - Server-side conversion tracking via webhooks
   - localStorage and cookies for persistence

4. **Webhook-Based Conversion Tracking**
   - Segment → Refersion webhook at `/api/segment-to-refersion`
   - Real-time conversion processing
   - No database required - Segment provides event history

5. **Cross-Domain Tracking**
   - Email-based identity matching (primary method)
   - URL parameter decoration for direct links
   - Segment anonymous ID for session continuity

### ❌ What We DON'T Use

1. **No Device Fingerprinting**
   - No Fingerprint.com or similar services
   - Privacy-first approach
   - No device-based tracking

2. **No HubSpot Embed Codes**
   - We use the Forms API directly
   - Better control over tracking
   - No iframe limitations

3. **No Complex Databases**
   - Segment provides event storage
   - Refersion stores conversions
   - Simple, maintainable architecture

### 📊 Attribution Coverage

With our email-based approach:
- **~40%** - Users who provide email on TheLoopWay before purchasing on LoopBioLabs
- **+20%** - Users who click tracked links between sites
- **+10%** - Returning users with persistent tracking
- **= ~70%** Total attribution coverage

This is acceptable given:
- Privacy compliance
- No additional costs
- Simple implementation
- Legal constraints (sites can't directly link)

### 🔑 Key Integration Points

1. **TheLoopWay.com** (Squarespace)
   ```
   /integrations/segment/theloopway-header.html
   /public/embed.js
   ```

2. **LoopBioLabs.com** (Bubble)
   ```
   /integrations/segment/enhanced-bubble-tracking.html
   Bubble workflows for identify/track calls
   ```

3. **Forms Platform**
   ```
   https://forms.theloopway.com
   Hosted on Vercel with Edge Functions
   ```

### 🧪 Testing Your Implementation

1. **Quick Test**: Upload `/tests/quick-test.html` to both sites
2. **Comprehensive Test**: Use `/tests/cross-domain-tracking-test.html`
3. **Webhook Test**: Run `npm run test-webhook`
4. **Form Validation**: Run `npm run check-form`

### 📈 Monitoring

- **Segment Debugger**: Real-time event monitoring
- **Vercel Logs**: Webhook processing logs
- **Refersion Dashboard**: Successful conversions
- **HubSpot Contacts**: Check `refersionid` property

This approach provides robust tracking while respecting user privacy and maintaining simplicity.