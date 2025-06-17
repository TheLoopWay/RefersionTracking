# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a JavaScript integration tool that captures Refersion affiliate tracking parameters and automatically populates HubSpot forms. It's designed for easy implementation on Squarespace sites.

## Commands

```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm start

# Deploy to Vercel
vercel
```

## Architecture

### Core Integration Logic
The entire integration is contained in `hubspot-integration.js`. This script:
1. Captures Refersion parameters from URL (`?rfsn=XXXXX`)
2. Stores data redundantly in localStorage and cookies
3. Automatically populates HubSpot form fields when forms are detected
4. Uses multiple detection methods (DOM events, MutationObserver) for reliability

### Key Implementation Details

**Form Field Mapping:**
- `refersionid` - The affiliate ID from URL parameter
- `refersion_timestamp` - ISO timestamp when captured
- `refersion_source_url` - Full URL where tracking was captured

**Data Persistence:**
- Primary: localStorage with 30-day expiration
- Fallback: Browser cookies with same expiration
- Cross-session tracking maintained

**Form Detection:**
- Works with both HubSpot iframe embeds and API-loaded forms
- Uses event listeners for `message` events from HubSpot iframes
- MutationObserver watches for dynamically loaded forms
- Multiple retry mechanisms for reliability

### Configuration

Replace placeholder values in `hubspot-integration.js`:
- `YOUR-REFERSION-PUBLIC-KEY` with actual Refersion API key

Current HubSpot configuration:
- Portal ID: `242518594`
- Demo Form ID: `565af379-e462-4953-8aa3-0def5da100ca`

### Testing

Use the demo page (`index.html`) to test:
1. Click test affiliate links to simulate tracking
2. Submit the HubSpot form to verify field population
3. Check browser console for debug output
4. Use "Clear Tracking Data" to reset state

### Deployment

The project is configured for Vercel deployment with security headers. For Squarespace implementation, follow the guide in `squarespace-embed-guide.html`.

## Important Notes

- HTTPS is required for production use
- The script is self-contained with no external dependencies
- Debug mode logs to console - disable for production
- Cross-origin limitations apply to iframe-embedded forms