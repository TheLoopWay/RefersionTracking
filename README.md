# Refersion + HubSpot Integration for Squarespace

This integration tracks Refersion affiliate referrals and automatically populates HubSpot forms with tracking data.

**Quick Start:** Open `squarespace-embed-guide.html` in your browser for a complete visual guide with copy-paste code blocks.

## Overview

The integration captures Refersion referral parameters (`?rfsn=XXXXX`) from URLs and stores them in the browser's localStorage. When a visitor fills out a HubSpot form, the referral data is automatically added to hidden fields in the form submission.

## Files Included

- `squarespace-embed-guide.html` - **START HERE** - Visual guide with all embed codes
- `hubspot-integration.js` - Standalone integration script for production use
- `index.html` - Demo page showing the integration in action
- `style.css` - Styles for the demo page
- `server.js` - Local development server
- `package.json` - Node.js dependencies for local testing

## HubSpot Properties Used

The integration uses these existing HubSpot contact properties:

- `refersionid` - Stores the Refersion affiliate ID
- `refersion_timestamp` - When the referral was captured
- `refersion_source_url` - The landing page URL with referral parameters

## Squarespace Deployment Guide

### Step 1: Add the Refersion Tracking Script

In Squarespace, go to **Settings > Advanced > Code Injection** and add this to the **Header**:

```html
<!-- Refersion v4 Tracking Script -->
<script>
  (function (a, b, c, d, e, f, g) {
    e["refersion"] = c;
    e[c] =
      e[c] ||
      function () {
        (e[c].q = e[c].q || []).push(arguments);
      };
    f = b.createElement(a);
    g = b.getElementsByTagName(a)[0];
    f.async = 1;
    f.src = d;
    g.parentNode.insertBefore(f, g);
  })("script", document, "r", "https://cdn.refersion.com/refersion.js");
  r("pubkey", "YOUR-REFERSION-PUBLIC-KEY");
</script>

<!-- HubSpot Tracking Code (if not already added) -->
<script
  type="text/javascript"
  id="hs-script-loader"
  async
  defer
  src="//js.hs-scripts.com/242518594.js"
></script>
```

**Important**: Replace `YOUR-REFERSION-PUBLIC-KEY` with your actual Refersion public API key.

### Step 2: Add the Integration Script

#### Option A: External Script (Recommended)

1. Upload `hubspot-integration.js` to Squarespace:

   - Go to **Settings > Advanced > Developer Tools**
   - Click **Manage Developer Tools**
   - Upload the file to your site

2. Add to Code Injection Header:

```html
<script src="/s/hubspot-integration.js"></script>
```

#### Option B: Inline Script

Add this condensed version directly to Code Injection:

```html
<script>
  // Refersion + HubSpot Integration for Squarespace
  (function () {
    "use strict";

    function captureRefersion() {
      const urlParams = new URLSearchParams(window.location.search);
      const rfsnParam = urlParams.get("rfsn") || urlParams.get("RFSN");

      if (rfsnParam) {
        localStorage.setItem("rfsn", rfsnParam);
        localStorage.setItem("rfsn_timestamp", new Date().toISOString());
        localStorage.setItem("rfsn_source_url", window.location.href);

        if (typeof r !== "undefined") {
          r("click", rfsnParam);
        }
      }
    }

    // Capture on page load
    captureRefersion();

    // Listen for HubSpot forms
    window.addEventListener("message", function (event) {
      if (
        event.data.type === "hsFormCallback" &&
        event.data.eventName === "onFormReady"
      ) {
        const rfsnId = localStorage.getItem("rfsn");
        const timestamp = localStorage.getItem("rfsn_timestamp");
        const sourceUrl = localStorage.getItem("rfsn_source_url");

        if (rfsnId) {
          // Find form in iframe or on page
          setTimeout(function () {
            const forms = document.querySelectorAll(".hs-form");
            forms.forEach(function (form) {
              // Try to set values
              const fields = [
                { name: "refersionid", value: rfsnId },
                { name: "refersion_timestamp", value: timestamp },
                { name: "refersion_source_url", value: sourceUrl },
              ];

              fields.forEach(function (field) {
                const input = form.querySelector(
                  'input[name="' + field.name + '"]'
                );
                if (input) {
                  input.value = field.value;
                  // Trigger change event
                  const event = new Event("change", { bubbles: true });
                  input.dispatchEvent(event);
                }
              });
            });
          }, 100);
        }
      }
    });
  })();
</script>
```

### Step 3: Configure HubSpot Forms

For each HubSpot form on your Squarespace site:

1. Add these hidden fields to the form in HubSpot:

   - `RefersionID` (refersionid) - Already exists
   - `Refersion Timestamp` (refersion_timestamp)
   - `Refersion Source URL` (refersion_source_url)

2. Use the HubSpot Forms API embed method instead of iframe:

```html
<script
  charset="utf-8"
  type="text/javascript"
  src="//js.hsforms.net/forms/v2.js"
></script>
<script>
  hbspt.forms.create({
    region: "na2",
    portalId: "242518594",
    formId: "YOUR-FORM-ID",
    onFormReady: function ($form) {
      // Integration will automatically populate fields
    },
  });
</script>
```

## Best Practices

### ✅ Current Implementation IS Best Practice

1. **localStorage over Cookies**: Refersion recommends using localStorage for better persistence and to avoid cookie restrictions
2. **HubSpot Forms API**: Using the Forms API (not iframe) provides better control and reliability
3. **Automatic Population**: Hidden fields are populated automatically without user interaction
4. **Cross-Session Persistence**: Referral data persists across multiple visits until cleared

### Squarespace-Specific Considerations

1. **Code Injection Limits**: Squarespace has character limits in Code Injection. Use external files if your code is too long.

2. **Page Load Timing**: Squarespace pages may load scripts asynchronously. The integration handles this with:

   - Event listeners for form readiness
   - Retry logic for form detection
   - Timeout delays for DOM updates

3. **Form Placement**: HubSpot forms work best in Code Blocks rather than embedded in text blocks.

4. **Testing**: Use Squarespace's preview mode to test without affecting live traffic.

## Testing Your Integration

1. **Visit with Test Referral**:

   ```
   https://theloopway.com?rfsn=TEST123.affiliate
   ```

2. **Check Browser Console**:

   - Open Developer Tools (F12)
   - Look for `[Refersion]` and `[HubSpot]` log messages

3. **Verify localStorage**:

   - In Console, type: `localStorage.getItem('rfsn')`
   - Should return: `TEST123.affiliate`

4. **Submit a Test Form**:
   - Fill out a form
   - Check the contact in HubSpot
   - Verify the three Refersion fields are populated

## Troubleshooting

### Form Fields Not Populating

1. **Check Field Names**: Ensure hidden fields use exact names:

   - `refersionid` (not `refersion_affiliate_id`)
   - `refersion_timestamp`
   - `refersion_source_url`

2. **Verify Script Order**: Refersion and HubSpot tracking scripts must load before the integration script

3. **Test localStorage**: Run in console:
   ```javascript
   console.log({
     rfsn: localStorage.getItem("rfsn"),
     timestamp: localStorage.getItem("rfsn_timestamp"),
     source: localStorage.getItem("rfsn_source_url"),
   });
   ```

### Squarespace-Specific Issues

1. **Scripts Not Loading**: Check if scripts are in the correct Code Injection area (Header vs Footer)

2. **Form Not Found**: Some Squarespace templates may delay form rendering. The integration includes retry logic.

3. **Cross-Domain Issues**: Ensure all scripts use HTTPS and match your site's protocol

## Security Considerations

- The integration only reads URL parameters and stores them locally
- No sensitive data is transmitted to third parties
- All data stays within HubSpot's secure environment
- Use HTTPS for all production deployments

## Support

For issues or questions:

- Refersion API Docs: https://www.refersion.dev/reference/javascript-v4-tracking
- HubSpot Forms API: https://developers.hubspot.com/docs/methods/forms/forms_overview
- This integration: [Your support contact]

## License

This integration is provided as-is for use with Refersion and HubSpot services.
