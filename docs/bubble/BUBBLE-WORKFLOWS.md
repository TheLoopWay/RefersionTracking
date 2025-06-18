# Bubble Workflow Setup for Cross-Site Tracking

## Key Workflows You Need

### 1. On Page Load - Capture Tracking

**Event**: Page is loaded  
**Actions**:

1. **Run JavaScript**
   ```javascript
   // Capture cross-domain tracking
   var tracking = window.getRefersionTracking();
   var crossDomain = checkCrossDomainsource();
   
   return {
     rfsn: tracking.rfsn || '',
     from_loopway: crossDomain ? crossDomain.from_site : ''
   };
   ```

2. **Only when** Result of step 1's rfsn is not empty  
   **Make changes to Current User**
   - refersion_id = Result of step 1's rfsn
   - refersion_source = "loopbiolabs.com"
   - refersion_captured_date = Current date/time

### 2. On Purchase Complete

**Event**: Custom event (after payment success)  
**Actions**:

1. **Run JavaScript** (Track Conversion)
   ```javascript
   if (window.r && window.r.pubKey) {
     r.addTrans({
       'order_id': 'Order unique id',
       'currency_code': 'USD'
     });
     
     r.addCustomer({
       'first_name': 'Customer first name',
       'email': 'Customer email'
     });
     
     r.addItems({
       'sku': 'Product SKU',
       'price': 'Order total',
       'quantity': 'Order quantity'
     });
     
     r.sendConversion();
   }
   ```

2. **Create API Call to HubSpot** (Update Contact)
   - Endpoint: `https://api.hubapi.com/crm/v3/objects/contacts`
   - Method: PATCH
   - Body:
   ```json
   {
     "properties": {
       "email": "Customer email",
       "refersionid": "Current User's refersion_id",
       "lifecycle_stage": "customer",
       "last_purchase_date": "Current date/time",
       "last_purchase_amount": "Order total"
     }
   }
   ```

### 3. Link to TheLoopWay - Preserve Tracking

**Event**: Button clicked  
**Actions**:

1. **Run JavaScript**
   ```javascript
   var rfsn = 'Current User refersion_id' || localStorage.getItem('rfsn');
   var targetUrl = 'https://theloopway.com/peptides';
   
   if (rfsn) {
     targetUrl += '?rfsn=' + encodeURIComponent(rfsn);
   }
   
   targetUrl; // Return the URL
   ```

2. **Open external website**
   - URL = Result of step 1

### 4. Form Submission to HubSpot

**Event**: Button "Submit Form" is clicked  
**Actions**:

1. **Run JavaScript** (Prepare form data)
   ```javascript
   var formData = {
     email: 'Input Email value',
     firstname: 'Input First Name value',
     lastname: 'Input Last Name value',
     // ... other fields
     refersionid: 'Current User refersion_id' || localStorage.getItem('rfsn'),
     source_site: 'loopbiolabs.com'
   };
   
   JSON.stringify(formData);
   ```

2. **API Call to HubSpot Forms API**
   - URL: `https://api.hsforms.com/submissions/v3/integration/submit/YOUR_PORTAL_ID/YOUR_FORM_ID`
   - Body: Result of step 1

## Database Setup

### User Data Type Fields

Add these fields:
- `refersion_id` (text)
- `refersion_source` (text) 
- `refersion_captured_date` (date)
- `hubspot_contact_id` (text)
- `hubspot_last_sync` (date)

### Order Data Type Fields

Add these fields:
- `refersion_tracked` (yes/no)
- `affiliate_id` (text)
- `hubspot_synced` (yes/no)

## Testing Checklist

- [ ] Visit LoopBioLabs with `?rfsn=BUBBLE123`
- [ ] Check Current User has `refersion_id = BUBBLE123`
- [ ] Complete a test purchase
- [ ] Check Refersion dashboard for conversion
- [ ] Click link to TheLoopWay
- [ ] Verify URL contains `?rfsn=BUBBLE123`
- [ ] Submit form on TheLoopWay
- [ ] Check HubSpot contact has `refersionid = BUBBLE123`

## API Connector Setup

### HubSpot Contact Update

**Name**: Update HubSpot Contact  
**Method**: PATCH  
**URL**: `https://api.hubapi.com/crm/v3/objects/contacts/[email]`  
**Headers**:
- Authorization: `Bearer YOUR_PRIVATE_APP_TOKEN`
- Content-Type: `application/json`

**Body**:
```json
{
  "properties": {
    "refersionid": "<refersionid>",
    "lifecycle_stage": "<stage>",
    "last_purchase_date": "<date>",
    "last_purchase_amount": "<amount>"
  }
}
```

## Privacy Rules

Make sure these fields are visible:
- Current User's refersion_id
- Current User's refersion_source

## Common Issues

**Tracking not saving to user:**
- Check privacy rules
- Verify JavaScript is returning data
- Check "Only when" conditions

**Cross-domain links not working:**
- Ensure refersion_id is saved to User
- Check URL encoding
- Test in live mode (not dev)

**HubSpot not updating:**
- Verify API token has correct scopes
- Check email exists in HubSpot
- Review API response for errors