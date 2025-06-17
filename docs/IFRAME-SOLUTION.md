# HubSpot Iframe Form Solution

Since HubSpot forms are loaded in cross-origin iframes, we cannot directly manipulate their fields from JavaScript. Here are the working solutions:

## Solution 1: URL Parameters (Recommended)

Instead of trying to populate fields after the form loads, pass the tracking data through URL parameters that HubSpot can read.

### Implementation:

1. **Modify your form page URL** to include tracking parameters:
```javascript
// When linking to your form page
const formPageUrl = 'https://www.theloopway.com/peptide-coaching-inquiry-page';
const trackingData = JSON.parse(localStorage.getItem('refersion_tracking') || '{}');

if (trackingData.rfsn) {
    window.location.href = `${formPageUrl}?refersionid=${trackingData.rfsn}`;
}
```

2. **Configure HubSpot form** to capture URL parameters:
   - In HubSpot, go to your form settings
   - Enable "Pre-populate form fields with known values"
   - Map URL parameters to hidden fields:
     - `refersionid` → refersionid field
     - `rfsn` → refersionid field (as backup)

## Solution 2: Server-Side Integration

Use HubSpot's Forms API to submit the data server-side:

```javascript
// Capture form submission on your page
document.addEventListener('submit', async (e) => {
    const form = e.target;
    if (form.action.includes('hsforms.com')) {
        // Get tracking data
        const trackingData = JSON.parse(localStorage.getItem('refersion_tracking') || '{}');
        
        if (trackingData.rfsn) {
            // Add hidden fields to form data
            const formData = new FormData(form);
            formData.append('refersionid', trackingData.rfsn);
            formData.append('refersion_timestamp', trackingData.timestamp);
            formData.append('refersion_source_url', trackingData.sourceUrl);
        }
    }
});
```

## Solution 3: HubSpot Tracking Code Events

Use HubSpot's tracking code to set contact properties:

```html
<script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/YOUR_PORTAL_ID.js"></script>
<script>
// After HubSpot loads
var _hsq = window._hsq = window._hsq || [];
_hsq.push(['identify', {
    refersionid: localStorage.getItem('rfsn'),
    refersion_timestamp: localStorage.getItem('rfsn_timestamp'),
    refersion_source_url: localStorage.getItem('rfsn_source_url')
}]);
</script>
```

## Solution 4: Custom Form Handler

Instead of using the embedded form, use HubSpot's Forms API directly:

```html
<form id="custom-hubspot-form">
    <!-- Your form fields -->
    <input type="email" name="email" required>
    <input type="text" name="firstname" required>
    <input type="text" name="lastname" required>
    <button type="submit">Submit</button>
</form>

<script>
document.getElementById('custom-hubspot-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const trackingData = JSON.parse(localStorage.getItem('refersion_tracking') || '{}');
    
    // Add tracking fields
    if (trackingData.rfsn) {
        formData.append('refersionid', trackingData.rfsn);
        formData.append('refersion_timestamp', trackingData.timestamp);
        formData.append('refersion_source_url', trackingData.sourceUrl);
    }
    
    // Submit to HubSpot
    const response = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/YOUR_PORTAL_ID/YOUR_FORM_ID`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fields: Array.from(formData.entries()).map(([name, value]) => ({
                name: name,
                value: value
            })),
            context: {
                pageUri: window.location.href,
                pageName: document.title
            }
        })
    });
    
    if (response.ok) {
        // Success!
        window.location.href = '/thank-you';
    }
});
</script>
```

## Recommended Approach for Squarespace

Since you're using Squarespace with the new HubSpot embed format, the best approach is:

1. **Use Solution 1** - Pass tracking via URL parameters
2. **Configure HubSpot** to read URL parameters
3. **Use the iframe integration script** as a fallback

This way, the tracking data will be available to HubSpot even though the form is in an iframe.