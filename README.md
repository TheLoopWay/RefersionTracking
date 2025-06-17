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

1. **Add Refersion tracking** (if not already present):
```html
<script>
  (function(a,b,c,d,e,f,g){e['refersion']=c;e[c]=e[c]||function(){(e[c].q=e[c].q||[]).push(arguments)};f=b.createElement(a);g=b.getElementsByTagName(a)[0];f.async=1;f.src=d;g.parentNode.insertBefore(f,g)}('script',document,'r','https://cdn.refersion.com/refersion.js');
  r("pubkey", "YOUR-REFERSION-PUBLIC-KEY");
</script>
```

2. **Add the integration script**:
   - Upload `src/hubspot-integration.js` to your Squarespace site
   - Add to Settings > Advanced > Code Injection > Header:
```html
<script src="/s/hubspot-integration.js"></script>
```

3. **Configure HubSpot forms** to include these hidden fields:
   - `refersionid` - The affiliate ID
   - `refersion_timestamp` - When the referral was captured
   - `refersion_source_url` - The landing page URL

### For Other Platforms

Include the integration script after your Refersion tracking code:
```html
<script src="path/to/hubspot-integration.js"></script>
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
2. **Stores** - Saves data in localStorage with cookie fallback
3. **Persists** - Maintains tracking for 30 days
4. **Populates** - Automatically fills HubSpot form fields
5. **Tracks** - Attributes form submissions to affiliates

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