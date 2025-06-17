# Squarespace Quick Start Guide

## 🎯 Two Different Scripts - Know The Difference!

### 1️⃣ FORM EMBED SCRIPT (Shows the form)
**Where**: Code Block on specific page  
**Purpose**: Displays the actual form

```html
<div id="loop-form"></div>
<script src="https://forms.theloopway.com/embed.js" data-form="peptide-inquiry"></script>
```

### 2️⃣ GLOBAL TRACKING SCRIPT (Optional - captures tracking site-wide)
**Where**: Settings → Advanced → Code Injection → Footer  
**Purpose**: Captures affiliate tracking on ALL pages

```html
<script>
// Global Refersion tracking capture
(function() {
  var rfsn = new URLSearchParams(window.location.search).get('rfsn');
  if (rfsn) {
    document.cookie = 'rfsn=' + rfsn + '; max-age=2592000; path=/';
    if (window.r) window.r('click', rfsn);
  }
})();
</script>
```

## 🚀 Basic Installation (Just the Form)

### Step 1: Go to Your Page
Navigate to the Squarespace page where you want the form.

### Step 2: Add a Code Block
1. Click the **+** button where you want the form
2. Select **Code** from the menu
3. Make sure it says "Code Block" at the top

### Step 3: Paste the FORM EMBED CODE

**Option A: Simple Iframe (If JavaScript is blocked)**
```html
<iframe 
  src="https://forms.theloopway.com/peptide-inquiry.html" 
  width="100%" 
  height="1200" 
  frameborder="0" 
  style="border: none;">
</iframe>
```

**Option B: JavaScript Embed (If allowed)**
```html
<div id="loop-form"></div>
<script src="https://forms.theloopway.com/embed.js" data-form="peptide-inquiry"></script>
```

### Step 4: Save & Publish
That's it! Your form now has automatic Refersion tracking.

## 🎯 How It Works

When someone visits your page with an affiliate link:
```
theloopway.com/page?rfsn=AFFILIATE123
```

The form automatically:
1. Captures the `rfsn` parameter
2. Stores it for 30 days
3. Includes it in every form submission
4. Shows the correct form ID in HubSpot

## 🔧 For Both Sites

This same code works on:
- ✅ TheLoopWay.com
- ✅ LoopBioLabs.com
- ✅ Any other domain

## 📊 Testing

1. Add `?rfsn=TEST123` to your page URL
2. Fill out the form
3. Check HubSpot - the contact should have `refersionid: TEST123`

## ⚠️ Important Notes

- **Use Code Block** - NOT Code Injection
- **No configuration needed** - It just works
- **Cross-domain safe** - Form can be on different domain
- **Mobile friendly** - Auto-resizes on all devices

## 🆘 Troubleshooting

**Form not showing?**
- Make sure you used Code Block (not Code Injection)
- Check that you copied the code exactly

**Tracking not working?**
- Test with `?rfsn=TEST` in the URL
- Make sure Refersion is installed on your site

**Need a different form?**
Change `data-form="peptide-inquiry"` to:
- `data-form="consultation"`
- `data-form="contact"`
- etc.

## 🎨 Optional: Custom Styling

Add to your Custom CSS:
```css
/* Center the form */
#loop-form {
  max-width: 800px;
  margin: 0 auto;
}
```

---

**That's all!** No complex setup, no iframe issues, no JavaScript conflicts. Just paste and go.