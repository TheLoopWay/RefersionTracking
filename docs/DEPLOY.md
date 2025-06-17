# Deployment Guide

## Vercel Deployment

This project is ready to deploy to Vercel as a static site.

### Quick Deploy

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Set up and deploy: Yes
   - Which scope: Your account
   - Link to existing project: No (first time) or Yes (updates)
   - Project name: refersion-hubspot-demo (or your choice)
   - Directory: ./ (current directory)
   - Override settings: No

### What Gets Deployed

The following files will be served:
- `index.html` - Main demo page
- `squarespace-embed-guide.html` - Implementation guide
- `style.css` - Styles
- `hubspot-integration.js` - Integration script
- All other static assets

**Note**: The `server.js` is only for local development and is not used in Vercel deployment.

### Environment Variables

No environment variables are required for the demo pages. However, remember to:
- Replace `YOUR-REFERSION-PUBLIC-KEY` in the HTML files with your actual key
- The HubSpot tracking code is already configured with your portal ID

### Custom Domain

To add a custom domain:
1. Go to your Vercel dashboard
2. Select the project
3. Go to Settings → Domains
4. Add your domain

### Updates

To deploy updates:
```bash
vercel --prod
```

## Alternative: Static Hosting

Since this is a static site, you can also host it on:
- **GitHub Pages**: Push to a repo and enable Pages
- **Netlify**: Drag and drop the folder
- **AWS S3**: Upload as static website
- **Cloudflare Pages**: Connect to your repo

The files work anywhere that can serve static HTML/CSS/JS.

## Important Notes

1. **API Keys**: Never commit real API keys. The current files have placeholders.
2. **HTTPS Required**: Refersion tracking requires HTTPS in production.
3. **Cross-Origin**: All scripts must be served from the same protocol (HTTP/HTTPS).

## Demo vs Production

This is a **demo/testing environment**. For production:
1. Remove the visual tracking panel
2. Remove debug console.log statements
3. Set `debug: false` in the integration script
4. Minify the JavaScript files
5. Implement proper error handling