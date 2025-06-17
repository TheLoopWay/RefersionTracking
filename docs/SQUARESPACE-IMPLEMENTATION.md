# Squarespace Implementation Guide

## Recommended Solution: AJAX Form with Light JavaScript ✅

Use `squarespace-ajax-form.html` in a Code Block for silent form submission:

### Features:
- ✅ Submits silently (no page redirect)
- ✅ Shows success/error messages
- ✅ Captures Refersion tracking
- ✅ Matches your LOOP design exactly
- ✅ Light JavaScript (works in Squarespace)

### Installation:
1. Edit your page in Squarespace
2. Add a **Code Block** where you want the form
3. Copy ALL contents from `src/squarespace-ajax-form.html`
4. Paste into the Code Block
5. Save and publish

### How it works:
- Uses static HTML/CSS for the form layout
- Light JavaScript only for form submission
- No heavy DOM manipulation
- Submits via AJAX to stay on the same page

---

## Alternative Methods

### Method 1: Static Form (No JavaScript)

If JavaScript still doesn't work, use `squarespace-static-form.html` for a pure HTML solution.

**Steps:**

1. **Edit your page** in Squarespace
2. **Add a Code Block** where you want the form to appear
3. **Copy the entire contents** of `src/squarespace-static-form.html`
4. **Paste into the Code Block**
5. **Save and publish**

### Benefits:
- Works within Squarespace's security model
- Full control over form styling
- Direct API submission (no iframe issues)
- Tracks affiliate data properly

### Method 2: Embed Block with External Script

1. **Upload the script** to Squarespace's Files area:
   - Go to Settings → Website → Files
   - Upload `src/hubspot-forms-api.js`
   - Copy the file URL

2. **Add an Embed Block** to your page:
```html
<div id="custom-hubspot-form"></div>
<script src="YOUR_UPLOADED_FILE_URL"></script>
```

### Method 3: Developer Platform

If you have Squarespace Developer access:

1. **Upload via Git/SFTP**:
   - Place scripts in `/scripts/` folder
   - Reference in template files

2. **Use in templates**:
```html
<script src="{@|url}/scripts/hubspot-forms-api.js"></script>
```

### Method 4: HubSpot Native Embed + URL Parameters

Keep your existing HubSpot embed and use URL parameters:

1. **Keep your current embed code**:
```html
<script src="https://js-na2.hsforms.net/forms/embed/242518594.js" defer></script>
<div class="hs-form-frame" data-region="na2" data-form-id="09ab75f6-bfbc-4d1c-8761-9ff764b650ca" data-portal-id="242518594"></div>
```

2. **Add this tracking script** in Settings → Advanced → Code Injection → Footer:
```javascript
<script>
(function() {
    // Capture affiliate tracking
    const urlParams = new URLSearchParams(window.location.search);
    const rfsn = urlParams.get('rfsn');
    
    if (rfsn) {
        // Store for 30 days
        document.cookie = `rfsn=${rfsn}; max-age=${30*24*60*60}; path=/`;
        
        // Redirect to form with parameters
        if (window.location.pathname.includes('peptide-coaching-inquiry-page')) {
            const currentUrl = new URL(window.location.href);
            if (!currentUrl.searchParams.has('refersionid')) {
                currentUrl.searchParams.set('refersionid', rfsn);
                window.history.replaceState({}, '', currentUrl);
            }
        }
    }
})();
</script>
```

3. **Configure HubSpot** to capture URL parameters:
   - In HubSpot Forms, edit your form
   - Go to Options → Form and field options
   - Enable "Pre-populate fields with known values"
   - The `refersionid` parameter will auto-populate

## Troubleshooting

### "Script disabled" error
- This means you're trying to use Code Injection with complex scripts
- Use Code Block instead (Method 1)

### Form not appearing
- Check browser console for errors
- Ensure all script URLs are HTTPS
- Verify form IDs match

### Tracking not working
- Test with `?rfsn=TEST123` in URL
- Check browser cookies for `rfsn_tracking`
- Verify HubSpot field names

## Testing Your Implementation

1. Visit your site with tracking: `https://yoursite.com?rfsn=TEST123`
2. Navigate to the form page
3. Submit the form
4. Check in HubSpot that the contact has `refersionid` field populated

## Support

For Squarespace-specific issues:
- Use their support chat for Code Block questions
- Check their [Code Injection guide](https://support.squarespace.com/hc/en-us/articles/205815908)

For integration issues:
- Check browser console for errors
- Verify all IDs and configuration match