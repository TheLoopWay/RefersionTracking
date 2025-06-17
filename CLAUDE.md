# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the LOOP Forms Platform.

## Project Overview

This is a lightweight forms platform built with Vite and vanilla JavaScript that:
- Hosts forms at forms.theloopway.com
- Provides embeddable forms for Squarespace and other sites
- Automatically tracks Refersion affiliate data
- Submits forms to HubSpot with tracking included

## Key Technologies

- **Build Tool**: Vite
- **Language**: Vanilla JavaScript (ES6 modules)
- **Deployment**: Vercel with Edge Functions
- **Form Backend**: HubSpot Forms API v3
- **Tracking**: Refersion affiliate tracking

## Important Files

- `forms/peptide-inquiry.html` - Example form template
- `forms/js/tracking.js` - Refersion tracking logic
- `forms/js/forms.js` - Form submission handler
- `public/embed.js` - Embeddable script for external sites
- `api/track.js` - Vercel edge function for server-side tracking

## Common Tasks

### Creating a New Form
1. Copy `forms/peptide-inquiry.html` to `forms/new-form.html`
2. Update the form fields and content
3. Change the HubSpot form ID in the script section
4. Test locally with `npm run dev`

### Testing Tracking
Visit any form with `?rfsn=TEST123` in the URL to test tracking capture.

### Deployment
Push to main branch - Vercel automatically deploys to forms.theloopway.com

## HubSpot Integration

- Portal ID: 242518594
- Required fields: refersionid, refersion_timestamp, refersion_source_url
- Uses Forms API v3 for submissions

## Design Principles

1. **Lightweight**: No heavy frameworks, minimal dependencies
2. **Reliable**: Dual storage (cookies + localStorage), server backup
3. **Embeddable**: Works in iframes with proper height adjustment
4. **Tracked**: Every form submission includes affiliate data