# Fixing Bubble Refersion Conversion Tracking

## 🚨 The Problem

Your current code loads the entire Refersion library every time a conversion happens. This:
- Slows down conversions
- Can cause duplicate tracking
- May lose affiliate attribution
- Creates race conditions

## ✅ The Solution

### Step 1: Update Header Code

Use the enhanced header code from `bubble-refersion-header.html`. This loads Refersion ONCE when the page loads.

### Step 2: Fix Your Conversion Workflow

Replace your custom event code with the improved version from `bubble-conversion-workflow.js`.

## 📝 Implementation Guide

### 1. Header Setup (One Time)

In Bubble Settings → SEO/metatags → Script in header:
- Paste the entire content from `bubble-refersion-header.html`
- This loads Refersion and captures affiliate tracking

### 2. Conversion Workflow (Per Order)

In your order completion workflow:

**Action**: Run JavaScript
```javascript
// Check if Refersion is loaded
if (window.r && window.r.pubKey) {
    try {
        // Clear previous data
        if (window.r.clearCart) {
            window.r.clearCart();
        }
        
        // Add transaction
        r.addTrans({
            'order_id': Order's unique id,
            'currency_code': 'USD'
        });

        // Add customer
        r.addCustomer({
            'first_name': Order's Customer's First Name,
            'email': Order's Customer's Email
        });
        
        // Add items
        r.addItems({
            'sku': Order's Product's SKU,
            'name': Order's Product's Name,
            'price': Order's Total Price,
            'quantity': Order's Quantity
        });

        // Send conversion
        r.sendConversion();
        
        console.log("Conversion tracked:", Order's unique id);
        true;
        
    } catch (error) {
        console.error("Conversion error:", error);
        false;
    }
} else {
    console.error("Refersion not loaded!");
    false;
}
```

### 3. For Multiple Line Items

If your orders have multiple products:

```javascript
// After r.addCustomer...

// Loop through line items
var items = Order's Line Items;
items.forEach(function(item) {
    r.addItems({
        'sku': item's Product's SKU,
        'name': item's Product's Name,
        'price': item's Price,
        'quantity': item's Quantity
    });
});
```

## 🔍 Testing Your Fix

### 1. Test Affiliate Click
- Visit your site with `?rfsn=TEST123`
- Open console and check for: `[Refersion] Affiliate tracked: TEST123`

### 2. Test Conversion
- Complete a test order
- Check console for: `Conversion tracked: [order-id]`
- Verify in Refersion dashboard

### 3. Debug Mode
To see detailed tracking info, enable debug mode in header:
```javascript
r.settings.dbg_mode = true;
```

## 📊 What Data to Send

### Required Fields:
- `order_id` - Must be unique
- `price` - Total order amount
- `quantity` - Number of items

### Recommended Fields:
- `email` - Customer email
- `first_name` - Customer name
- `sku` - Product identifier
- `name` - Product name

### Optional Fields:
- `last_name` - Customer last name
- `shipping` - Shipping cost
- `discount` - Discount amount
- `discount_code` - Coupon code used

## 🐛 Common Issues

### "Refersion not loaded!"
- Check header code is properly installed
- Ensure it's in Settings, not page-level
- Test in live mode, not just preview

### Conversions not showing in dashboard
- Verify order_id is unique
- Check price is a number, not text
- Ensure affiliate clicked link first

### Multiple conversions for same order
- Add logic to prevent duplicate tracking
- Store tracked order IDs in database

## 💡 Advanced: Conditional Tracking

Only track if there's an affiliate:
```javascript
var hasAffiliate = localStorage.getItem('rfsn');
if (hasAffiliate && window.r) {
    // Track conversion
}
```

## 🔄 Migration Checklist

- [ ] Install new header code
- [ ] Remove old Refersion loading from workflows
- [ ] Update conversion workflow with new code
- [ ] Test with `?rfsn=TEST123`
- [ ] Complete test order
- [ ] Verify in Refersion dashboard
- [ ] Deploy to live

## 📱 Mobile App Note

For Bubble mobile apps, you may need to:
1. Pass affiliate ID explicitly between screens
2. Store in Bubble database instead of localStorage
3. Include affiliate ID in API workflows