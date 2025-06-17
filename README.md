# LOOP Forms Platform

A lightweight, deployable forms platform with built-in Refersion affiliate tracking. Works on all LOOP properties including TheLoopWay.com and LoopBioLabs.com.

## Features

- 🚀 Fast, lightweight forms (Vite + Vanilla JS)
- 📊 Automatic Refersion tracking integration
- 🔒 Server-side cookie backup (Vercel Edge Functions)
- 📱 Responsive, embeddable forms
- 🎨 Clean, customizable design
- 🌐 Multi-site support

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
npm run deploy
```

## Installation Guide

### ⚠️ IMPORTANT: Understand the Two Scripts

**Before installing**, read [SCRIPTS-EXPLAINED.md](SCRIPTS-EXPLAINED.md) to understand:
- 📋 **Form Embed Script** - Shows the actual form (required)
- 🌐 **Global Tracking Script** - Captures tracking site-wide (optional)

### For Squarespace (TheLoopWay.com & LoopBioLabs.com)

1. **Go to your Squarespace page** where you want the form
2. **Add a Code Block** (NOT Code Injection!)
3. **Paste the FORM EMBED code**:

```html
<div id="loop-form"></div>
<script src="https://forms.theloopway.com/embed.js" data-form="peptide-inquiry"></script>
```

That's it! The form will:
- Load in an iframe (no script conflicts)
- Auto-resize to fit content
- Track Refersion affiliates automatically
- Submit to HubSpot with proper form ID

### Advanced Options

```html
<!-- Custom container ID -->
<div id="my-custom-form"></div>
<script src="https://forms.theloopway.com/embed.js" 
        data-form="peptide-inquiry"
        data-container="my-custom-form">
</script>

<!-- Different forms -->
<script src="https://forms.theloopway.com/embed.js" data-form="consultation"></script>
<script src="https://forms.theloopway.com/embed.js" data-form="contact"></script>
```

## Creating New Forms

1. Copy `forms/peptide-inquiry.html` as a template
2. Update the form fields and HubSpot form ID
3. Deploy to see changes live

## How Tracking Works

1. **URL Parameters**: Captures `?rfsn=XXXXX` from the parent page URL
2. **localStorage Bridge**: Embed script reads parent page's localStorage and passes to iframe
3. **Cross-Domain**: Works even when form is on different domain
4. **Multi-Storage**: Saves to cookies and localStorage  
5. **Server Backup**: Sends to edge function (optional)
6. **Form Integration**: Automatically adds to HubSpot submissions

### Example Flow
```
User visits: theloopway.com/page?rfsn=ABC123
             ↓
Global script stores in localStorage
             ↓
Embed script reads localStorage + passes to iframe
             ↓
Form loads with tracking preserved
             ↓
Submission includes refersionid: ABC123
```

## Project Structure

```
├── forms/              # Form pages
│   ├── css/           # Styles
│   ├── js/            # Form logic & tracking
│   └── *.html         # Individual forms
├── public/            # Static assets
│   └── embed.js       # Embeddable script
├── api/               # Vercel edge functions
│   └── track.js       # Server-side tracking
└── vercel.json        # Deployment config
```

## Deployment

The platform is configured to deploy to `forms.theloopway.com`:

1. Push to main branch
2. Vercel auto-deploys
3. Forms are available at `forms.theloopway.com/[form-name].html`

## HubSpot Configuration

Each form needs:
- Portal ID: `242518594`
- Form ID: Get from HubSpot
- Custom properties: `refersionid`, `refersion_timestamp`, `refersion_source_url`

## Multi-Site Support

This platform works seamlessly across all LOOP properties:

- **TheLoopWay.com** - Main site
- **LoopBioLabs.com** - E-commerce site  
- **Any other domain** - Just embed and go

The tracking works cross-domain, so affiliates are tracked even when the form is hosted on a different domain.

## Creating New Forms

1. **Copy a template**:
   ```bash
   cp forms/peptide-inquiry.html forms/my-new-form.html
   ```

2. **Update the form**:
   - Change form fields
   - Update text content
   - Replace the HubSpot form ID

3. **Embed on any site**:
   ```html
   <div id="loop-form"></div>
   <script src="https://forms.theloopway.com/embed.js" data-form="my-new-form"></script>
   ```

## Documentation

- [SCRIPTS EXPLAINED](SCRIPTS-EXPLAINED.md) - **READ THIS FIRST!** Visual guide to the two scripts
- [Installation Guide](INSTALLATION.md) - Detailed setup instructions
- [Squarespace Guide](SQUARESPACE-GUIDE.md) - Quick start for Squarespace
- [Calendar Tracking](CALENDAR-TRACKING.md) - HubSpot meeting scheduler integration
- [CLAUDE.md](CLAUDE.md) - AI assistant documentation

## Support

For issues or questions, contact LOOP support.