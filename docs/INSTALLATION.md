# Installation Guide

## ⚠️ Important: Two Different Scripts!

Before you start, understand these are **TWO COMPLETELY DIFFERENT** scripts:

### 📋 Script #1: FORM EMBED (Required)
- **What it does**: Shows the actual form on your page
- **Where it goes**: Code Block on specific pages
- **When to use**: On pages where you want a form

### 🌐 Script #2: GLOBAL TRACKING (Optional)
- **What it does**: Captures affiliate IDs site-wide
- **Where it goes**: Settings → Code Injection
- **When to use**: If you want tracking on ALL pages

---

## For Squarespace Sites (TheLoopWay.com & LoopBioLabs.com)

### Step 1: Add the Form (Required) ✅

1. **Edit your Squarespace page**
   - Navigate to the page where you want the form
   - Enter edit mode

2. **Add a Code Block**
   - Click the "+" button to add a new block
   - Choose "Code" from the menu
   - **Important**: Use Code Block, NOT Code Injection

3. **Paste the FORM EMBED code**:
```html
<!-- This is the FORM EMBED script -->
<div id="loop-form"></div>
<script src="https://forms.theloopway.com/embed.js" data-form="peptide-inquiry"></script>
```

4. **Save and publish**

That's it! The form will automatically:
- ✅ Load without conflicts
- ✅ Track Refersion affiliates from the URL
- ✅ Submit to HubSpot with the correct form ID
- ✅ Auto-resize to fit content

### Step 2: Global Tracking (Optional)

**Only if you want tracking on pages WITHOUT forms**, add this to **Settings → Advanced → Code Injection → Footer**:

```html
<!-- This is the GLOBAL TRACKING script -->
<script>
// Capture Refersion tracking site-wide
(function() {
  var rfsn = new URLSearchParams(window.location.search).get('rfsn');
  if (rfsn) {
    document.cookie = 'rfsn=' + rfsn + '; max-age=2592000; path=/; domain=.theloopway.com';
    if (window.r) window.r('click', rfsn);
  }
})();
</script>
```

## For LoopBioLabs.com

The same embed code works! Just update the cookie domain:

```html
<!-- In Code Block on LoopBioLabs.com -->
<div id="loop-form"></div>
<script src="https://forms.theloopway.com/embed.js" data-form="peptide-inquiry"></script>

<!-- In Code Injection for site-wide tracking -->
<script>
(function() {
  var rfsn = new URLSearchParams(window.location.search).get('rfsn');
  if (rfsn) {
    document.cookie = 'rfsn=' + rfsn + '; max-age=2592000; path=/; domain=.loopbiolabs.com';
    if (window.r) window.r('click', rfsn);
  }
})();
</script>
```

## Testing Your Installation

1. **Visit your page with tracking**: 
   ```
   https://yoursite.com/page?rfsn=TEST123
   ```

2. **Fill out and submit the form**

3. **Check in HubSpot**:
   - Find the new contact
   - Verify `refersionid` field = `TEST123`

## Available Forms

Current forms you can embed:

- `peptide-inquiry` - Peptide coaching inquiry form
- `consultation` - General consultation form (coming soon)
- `contact` - Contact form (coming soon)

## Troubleshooting

### Form not appearing?
- Make sure you're using a Code Block, not Code Injection
- Check browser console for errors
- Verify the form name is correct

### Tracking not working?
- Test with `?rfsn=TEST123` in the URL
- Check cookies in browser DevTools
- Ensure Refersion script is installed on your site

### Form looks wrong?
- The form inherits some styles from your site
- Contact support for custom styling

## Advanced Usage

### Multiple Forms on One Page

```html
<!-- First form -->
<div id="peptide-form"></div>
<script src="https://forms.theloopway.com/embed.js" 
        data-form="peptide-inquiry"
        data-container="peptide-form">
</script>

<!-- Second form -->
<div id="contact-form"></div>
<script src="https://forms.theloopway.com/embed.js" 
        data-form="contact"
        data-container="contact-form">
</script>
```

### Custom Styling

Add CSS to your site:

```css
/* Make form container full width */
#loop-form {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

/* Adjust iframe height */
#loop-form iframe {
  min-height: 600px;
}
```

## Support

Need help? Contact LOOP support with:
- Your site URL
- Which form you're trying to embed
- Any error messages from the browser console