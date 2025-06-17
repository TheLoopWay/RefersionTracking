# Refersion + HubSpot Integration

A lightweight JavaScript integration that captures Refersion affiliate tracking parameters and automatically populates HubSpot forms with referral data.

## 🎯 Purpose

This integration enables seamless tracking of affiliate referrals from Refersion into HubSpot, allowing you to:
- Track which affiliates are driving form submissions
- Attribute leads and customers to specific referral partners
- Maintain referral data across multiple page visits

## 📁 Project Structure

```
refersion/
├── src/                      # Source code
│   └── hubspot-integration.js    # Main integration script
├── demo/                     # Demo and examples
│   ├── index.html               # Interactive demo page
│   ├── style.css                # Demo styles
│   ├── server.js                # Local development server
│   └── squarespace-embed-guide.html  # Squarespace implementation guide
├── tests/                    # Test scripts
│   ├── test-theloopway.js       # TheLoopWay.com specific tests
│   ├── test-loop-quick.js       # Quick connectivity test
│   ├── test-integration.js      # Generic integration test
│   ├── test-integration-puppeteer.js  # Browser automation tests
│   └── test-page.html           # Manual test page
├── docs/                     # Documentation
│   ├── DEPLOY.md                # Deployment instructions
│   ├── TEST-GUIDE.md            # Testing guide
│   └── README-GITHUB-ACTIONS.md # CI/CD documentation
├── .github/workflows/        # GitHub Actions
│   ├── simple-test.yml          # Basic test workflow
│   └── test-integration.yml     # Comprehensive test workflow
├── package.json             # Node.js dependencies
├── vercel.json             # Vercel deployment config
└── CLAUDE.md               # AI assistant context
```

## 🚀 Quick Start

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/refersion-hubspot-integration.git
cd refersion-hubspot-integration
```

2. Install dependencies (for testing):
```bash
npm install
```

3. Run the demo:
```bash
npm start
```

Visit http://localhost:3000 to see the integration in action.

## 🔧 Implementation

### For Squarespace

1. **Upload the integration script**:
   - Use `src/hubspot-integration-v2.js` for best compatibility with new HubSpot forms
   - Or use `src/hubspot-integration.js` for the original version
   - Upload to Settings > Advanced > Developer Tools

2. **Add Refersion tracking** (if not already present):
```html
<script>
  (function(a,b,c,d,e,f,g){e['refersion']=c;e[c]=e[c]||function(){(e[c].q=e[c].q||[]).push(arguments)};f=b.createElement(a);g=b.getElementsByTagName(a)[0];f.async=1;f.src=d;g.parentNode.insertBefore(f,g)}('script',document,'r','https://cdn.refersion.com/refersion.js');
  r("pubkey", "YOUR-REFERSION-PUBLIC-KEY");
</script>
```

3. **Include the integration script**:
   - Add to Settings > Advanced > Code Injection > Header:
```html
<script src="/s/hubspot-integration-v2.js"></script>
```

4. **Configure HubSpot forms** to include these hidden fields:
   - `refersionid` - The affiliate ID
   - `refersion_timestamp` - When the referral was captured
   - `refersion_source_url` - The landing page URL

### For Other Platforms

Include the integration script after your Refersion tracking code:

**Option 1: From CDN (Easiest)**
```html
<script src="https://refersion.vercel.app/src/hubspot-integration-v2.js"></script>
```

**Option 2: Self-hosted**
```html
<script src="path/to/hubspot-integration-v2.js"></script>
```

## 🧪 Testing

### Quick Test (No Browser)
```bash
npm run test:loop:quick
```

### Full Browser Test
```bash
npm run test:loop
```

### Run All Tests
```bash
npm test
```

See [docs/TEST-GUIDE.md](docs/TEST-GUIDE.md) for detailed testing instructions.

## 📦 Deployment

The project is configured for easy deployment to:
- **Vercel** (recommended) - `vercel.json` included
- **Any static hosting** - Upload contents of `src/` and configure paths
- **CDN** - Host `hubspot-integration.js` and reference via URL

See [docs/DEPLOY.md](docs/DEPLOY.md) for detailed deployment instructions.

## 🔍 How It Works

1. **Captures** - Detects `?rfsn=XXXXX` parameters in URLs
2. **Stores** - Saves data in BOTH localStorage AND cookies for maximum reliability
3. **Persists** - Maintains tracking for 30 days
4. **Populates** - Automatically fills HubSpot form fields
5. **Tracks** - Attributes form submissions to affiliates

### Storage Redundancy

The integration uses dual storage for reliability:
- **Primary**: localStorage (faster, more storage)
- **Backup**: Cookies (works in more restrictive environments)

This ensures tracking works even if:
- localStorage is disabled
- Cookies are blocked (falls back to localStorage)
- User switches between HTTP/HTTPS
- Site has strict privacy settings

## 📝 HubSpot Form Compatibility

The integration supports both HubSpot form formats:

### New Embed Format (v2 recommended)
```html
<script src="https://js-na2.hsforms.net/forms/embed/242518594.js" defer></script>
<div class="hs-form-frame" data-region="na2" data-form-id="YOUR-FORM-ID" data-portal-id="242518594"></div>
```

### Traditional API Format
```javascript
hbspt.forms.create({
    region: "na2",
    portalId: "242518594",
    formId: "YOUR-FORM-ID"
});
```

## 🛠️ Configuration

Edit `src/hubspot-integration.js` to customize:
- Storage duration (default: 30 days)
- Field mappings
- Debug logging

## 🤝 Support

- Create an issue for bugs or feature requests
- See [docs/](docs/) for additional documentation
- Check [tests/](tests/) for implementation examples

## 📄 License

This project is provided as-is for use with Refersion and HubSpot services.