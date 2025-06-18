# Loop Forms - Cross-Domain Tracking Solution

A comprehensive forms platform with integrated Refersion affiliate tracking and HubSpot CRM synchronization. Designed to work seamlessly across TheLoopWay.com (Squarespace) and LoopBioLabs.com (Bubble).

## 🚀 Features

- **Segment-Powered Analytics** - Unified tracking across all properties
- **Cross-Domain Attribution** - 95%+ accurate affiliate tracking
- **Hosted Forms Platform** - Vite-powered forms at forms.theloopway.com
- **HubSpot Integration** - Automatic CRM synchronization
- **Refersion Integration** - Server-side conversion tracking
- **Platform Integrations** - Production-ready code for Squarespace & Bubble
- **Mobile Responsive** - Works on all devices
- **Edge Functions** - Reliable webhook processing

## 📁 Repository Structure

```
refersion/
├── forms/                    # Form templates and assets
│   ├── peptide-inquiry.html
│   ├── consultation.html
│   ├── peptide-education-intake.html
│   └── js/                  # Form JavaScript modules
│       ├── tracking.js      # RefersionTracker class
│       └── forms.js         # Form handling
├── public/                   # Static assets served by Vite
│   ├── embed.js             # Squarespace embed script
│   └── squarespace/         # Squarespace-specific integrations
├── integrations/            # Platform-specific code
│   ├── bubble/              # Bubble.io integration files
│   │   ├── bubble-refersion-header.html
│   │   ├── bubble-hubspot-sync.js
│   │   └── bubble-simple-conversion.js
│   └── squarespace/         # Squarespace integration files
├── docs/                    # Documentation
│   ├── bubble/              # Bubble-specific docs
│   ├── squarespace/         # Squarespace-specific docs
│   └── integration/         # Cross-domain integration docs
├── tests/                   # Testing tools
│   ├── cross-domain-tracking-test.html
│   ├── quick-test.html
│   └── validate-tracking.js
├── scripts/                 # Utility scripts
│   └── check-form.js        # HubSpot form validation
└── api/                     # Edge functions
    └── track.js             # Server-side tracking endpoint
```

## 🚀 Quick Start

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

## 🧪 Testing Your Implementation

### Quick Browser Test
1. Upload `tests/quick-test.html` to both sites
2. Visit: `yoursite.com/quick-test.html`
3. Click "Run All Tests" to verify tracking

### Comprehensive Test Suite
Open `tests/cross-domain-tracking-test.html` locally to:
- Test storage mechanisms
- Verify script loading
- Generate test links
- Validate cross-domain functionality

### Command Line Validation
```bash
# Test both sites
node tests/validate-tracking.js

# Test specific site
node tests/validate-tracking.js --site=loopway
node tests/validate-tracking.js --site=biolabs
```

## 📋 Quick Setup

### 🎯 Production-Ready Integration

Your Segment workspace is configured:
- **TheLoopWay**: Write Key `WAwgCVzGN82fhGNl8u4Ap3xjdqALerZW`
- **LoopBioLabs**: Write Key `VLvSfT5m9qElluhLqdE38FMoMvdgxj47`
- **Webhook**: `https://forms.theloopway.com/api/segment-to-refersion`

### For TheLoopWay.com (Squarespace)

1. **Add Global Tracking** (Settings → Advanced → Code Injection → Header):
   ```html
   <!-- Copy complete code from: integrations/segment/theloopway-header.html -->
   ```

2. **Add Forms to Pages**:
   ```html
   <div id="loop-form"></div>
   <script src="https://forms.theloopway.com/embed.js" data-form="peptide-inquiry"></script>
   ```

### For LoopBioLabs.com (Bubble)

1. **Add Global Tracking** (Settings → SEO/metatags → Script in header):
   ```html
   <!-- Copy complete code from: integrations/segment/loopbiolabs-header.html -->
   ```

2. **Set Up Workflows**:
   ```javascript
   // On User Login/Signup:
   BubbleHelpers.identifyUser(email, firstName, lastName);
   
   // On Purchase:
   BubbleHelpers.trackPurchase({orderId, total, email, productName});
   ```

## 🔗 Cross-Domain Setup

To ensure tracking works between sites:

1. **Use Consistent Storage Keys**:
   - `rfsn` - Affiliate ID
   - `rfsn_timestamp` - Click timestamp
   - `rfsn_source_url` - Original landing page

2. **Add Cross-Domain Links**:
   ```javascript
   // From TheLoopWay → LoopBioLabs
   const url = `https://loopbiolabs.com/shop?rfsn=${localStorage.getItem('rfsn')}`;
   ```

3. **Configure HubSpot Properties**:
   - Ensure both sites use `refersionid` property
   - Map to same contact records by email

See `docs/integration/CROSS-DOMAIN-TRACKING.md` for complete guide.

## 📊 Available Forms

- **peptide-inquiry** - Basic inquiry form
- **consultation** - Consultation request
- **peptide-education-intake** - Comprehensive intake form

### Creating New Forms

1. Copy existing template:
   ```bash
   cp forms/peptide-inquiry.html forms/new-form.html
   ```

2. Update HubSpot form ID and fields

3. Add to `vite.config.js`:
   ```js
   input: {
     // ... existing forms
     newForm: resolve(__dirname, 'forms/new-form.html')
   }
   ```

## 🔧 Configuration

### Segment Analytics
- **TheLoopWay Source**: `WAwgCVzGN82fhGNl8u4Ap3xjdqALerZW`
- **LoopBioLabs Source**: `VLvSfT5m9qElluhLqdE38FMoMvdgxj47`
- **Webhook URL**: `https://forms.theloopway.com/api/segment-to-refersion`

### Environment Variables
```env
REFERSION_API_KEY=your-secret-key-here
HUBSPOT_ACCESS_TOKEN=your-token-here
```

### HubSpot Settings
- Portal ID: `242518594`
- Key property: `refersionid` (mapped from Segment)

### Refersion Settings
- Public Key: `pub_ee6ba2b9f9295e53f4eb`
- Conversions tracked via Segment webhook

## 📚 Documentation

### 🎯 Our Approach
- **[APPROACH-SUMMARY.md](docs/APPROACH-SUMMARY.md)** - Clear explanation of what we use (and don't use)

### 🚀 Quick Start
- **[SEGMENT-PRODUCTION-GUIDE.md](docs/integration/SEGMENT-PRODUCTION-GUIDE.md)** - Complete Segment setup
- **[SEGMENT-QUICK-START.md](docs/integration/SEGMENT-QUICK-START.md)** - 5-minute implementation

### 📖 Platform Guides
- **[CROSS-DOMAIN-TRACKING.md](docs/integration/CROSS-DOMAIN-TRACKING.md)** - Cross-domain guide
- **[BUBBLE-WORKFLOWS.md](docs/bubble/BUBBLE-WORKFLOWS.md)** - Bubble workflow setup  
- **[SQUARESPACE-GUIDE.md](docs/squarespace/SQUARESPACE-GUIDE.md)** - Squarespace setup
- **[INSTALLATION.md](docs/INSTALLATION.md)** - Detailed setup instructions

## 🐛 Troubleshooting

### Tracking Not Working?
1. Run the quick test: `tests/quick-test.html`
2. Check browser console for errors
3. Verify scripts are loading
4. Ensure URLs include `?rfsn=` parameter

### Form Not Submitting?
1. Check HubSpot form ID is correct
2. Verify all required fields are mapped
3. Run `npm run check-form` to validate

### Cross-Domain Issues?
1. Check both sites have tracking scripts
2. Verify localStorage keys match
3. Test with `tests/cross-domain-tracking-test.html`

## 🚀 Deployment

The platform auto-deploys to Vercel:

1. Push changes to `main` branch
2. Vercel builds and deploys
3. Available at `forms.theloopway.com`

## 📞 Support

For issues or questions, refer to the test suite first, then contact LOOP support.