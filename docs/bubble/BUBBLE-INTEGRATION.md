# Bubble + Refersion Integration Guide

## 🚀 Quick Start

Replace your current header code with the enhanced version from `bubble-refersion-header.html`.

## 🎯 What's New

The enhanced tracking code adds:

1. **Better Storage** - Saves to localStorage, sessionStorage, AND cookies
2. **Persistence** - Tracking survives page refreshes and navigation
3. **Bubble Integration** - Global functions you can call from Bubble workflows
4. **SPA Support** - Detects Bubble page changes and re-captures tracking

## 📊 Using in Bubble Workflows

### 1. Get Current Tracking Data

In any Bubble workflow, use "Run JavaScript":
```javascript
// Returns object with rfsn, timestamp, and source_url
var tracking = window.getRefersionTracking();
```

You can then use `tracking.rfsn` in your workflows.

### 2. Track a Conversion

After a successful purchase:
```javascript
// Basic conversion
window.trackRefersionConversion('ORDER-123', 99.99);

// With more details
window.trackRefersionConversion(
  'ORDER-123',     // Order ID
  99.99,           // Amount
  'USD',           // Currency
  'user@email.com' // Customer email
);
```

### 3. Add Tracking to URLs

When redirecting to external pages:
```javascript
// Adds ?rfsn=XXX to any URL
var urlWithTracking = window.addRefersionToUrl('https://example.com/page');
```

## 🔧 Bubble Workflow Examples

### Example 1: Save Tracking to Database

1. **When**: Page is loaded
2. **Action**: Run JavaScript
   ```javascript
   var tracking = window.getRefersionTracking();
   if (tracking.rfsn) {
     // Return the affiliate ID
     tracking.rfsn;
   }
   ```
3. **Action**: Make changes to Current User
   - Set `refersion_id` = Result of step 2

### Example 2: Track Purchase Conversion

1. **When**: Payment successful
2. **Action**: Run JavaScript
   ```javascript
   window.trackRefersionConversion(
     'ORDER-' + Current User's Order ID,
     Current User's Order Amount
   );
   ```

### Example 3: Pass Tracking to External Form

1. **When**: Button clicked
2. **Action**: Run JavaScript
   ```javascript
   var formUrl = window.addRefersionToUrl('https://forms.theloopway.com/peptide-inquiry.html');
   window.open(formUrl);
   ```

## 🛠️ Bubble Database Setup

Add these fields to your User data type:
- `refersion_id` (text) - The affiliate ID
- `refersion_timestamp` (text) - When they clicked the link
- `refersion_source_url` (text) - Which page they came from

## 🎨 Display Tracking Status (Optional)

Create a text element with dynamic content:
```
Referred by: Current User's refersion_id is not empty:formatted as yes/no
Affiliate ID: Current User's refersion_id
```

## 🐛 Testing

1. Add `?rfsn=TEST123` to your Bubble app URL
2. Check browser console for `[Refersion]` messages
3. Run `window.getRefersionTracking()` in console
4. Verify the data is stored in localStorage

## 📱 Mobile App Considerations

For Bubble mobile apps, the tracking works but with limitations:
- Cookies don't persist in WebView
- Use localStorage as primary storage
- Pass tracking explicitly between screens

## 🔒 Security Notes

- The affiliate ID is public information (visible in URLs)
- Don't use it for authentication
- Validate conversions server-side when possible

## 💡 Advanced: Custom Events

Listen for when Refersion loads:
```javascript
document.addEventListener('refersion-loaded', function() {
  // Refersion is ready
  // Run any custom tracking logic here
});
```

## 🆘 Troubleshooting

**Tracking not capturing?**
- Check URL has `?rfsn=` parameter
- Open console and look for `[Refersion]` logs
- Run `localStorage.getItem('rfsn')` to check storage

**Conversions not tracking?**
- Ensure purchase happens AFTER tracking is captured
- Check amount is a number, not a string
- Verify order ID is unique

**Works in preview but not live?**
- Check domain settings in Refersion dashboard
- Ensure header code is in Settings → SEO → Script/meta tags
- Clear cache and test in incognito mode