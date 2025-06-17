# Testing Guide for TheLoopWay.com Refersion Integration

This guide explains how to test the Refersion + HubSpot integration on TheLoopWay.com.

## Quick Test (No Installation Required)

Run a basic connectivity test without any dependencies:

```bash
npm run test:loop:quick
```

This checks:
- Site accessibility
- Basic integration presence
- HubSpot form detection
- Tracking parameter acceptance

## Full Browser Test

For comprehensive testing with Puppeteer:

```bash
# Install dependencies (only needed once)
npm install

# Run the test
npm run test:loop

# Or run with visible browser
npm run test:loop -- --headed
```

The full test validates:
1. **Tracking Capture**: Verifies affiliate ID is captured from URL parameters
2. **Data Persistence**: Ensures tracking survives page navigation
3. **Form Integration**: Confirms HubSpot forms are present on the inquiry page
4. **Cross-Domain**: Tests tracking persistence across different pages

## What the Tests Check

### Functional Requirements (Not Implementation Details)

The tests focus on **functionality** rather than specific code:

- ✅ **Does tracking work?** - Not how it's implemented
- ✅ **Is data stored?** - Not which specific method is used
- ✅ **Are forms detected?** - Not the exact form structure
- ✅ **Does data persist?** - Not the storage mechanism

### Success Criteria

The integration is working if:
1. Visiting `https://www.theloopway.com?rfsn=ABC123` captures the affiliate ID
2. The ID persists when navigating to other pages
3. HubSpot forms are present on the inquiry page
4. Tracking data is available for form population

## Test URLs

- **Home Page**: https://www.theloopway.com
- **Form Page**: https://www.theloopway.com/peptide-coaching-inquiry-page
- **Test with Tracking**: https://www.theloopway.com?rfsn=TEST123

## Interpreting Results

### All Tests Pass ✅
The integration is working correctly. Affiliate tracking will be captured and available for HubSpot forms.

### Warnings ⚠️
Minor issues that don't prevent functionality:
- Forms loading dynamically (normal for HubSpot)
- Different storage methods (localStorage vs cookies)

### Failures ❌
Critical issues that need attention:
- Tracking not captured
- Data not persisting
- No forms detected

## Manual Testing

You can also manually verify:

1. Visit: https://www.theloopway.com?rfsn=TESTMANUAL
2. Open browser DevTools (F12)
3. Check Application > Local Storage for `refersion_tracking`
4. Navigate to the inquiry page
5. Verify the data is still present

## Screenshots

The browser test saves screenshots for debugging:
- `test-tracking-capture-*.png` - Shows initial tracking
- `test-form-page-*.png` - Shows the form page

These help diagnose any visual issues or confirm proper form loading.