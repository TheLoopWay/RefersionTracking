// SIMPLE BUBBLE CONVERSION TRACKING
// Copy this into your Bubble workflow "Run JavaScript" action

// Make sure Refersion is loaded (from header)
if (window.r && window.r.pubKey) {
    try {
        // Add transaction - UPDATE THESE WITH BUBBLE DYNAMIC DATA
        r.addTrans({
            'order_id': 'Order unique id',        // Click here and select from Bubble
            'currency_code': 'USD'
        });

        // Add customer - UPDATE THESE WITH BUBBLE DYNAMIC DATA
        r.addCustomer({
            'first_name': 'Customer first name',  // Click here and select from Bubble
            'email': 'Customer email'             // Click here and select from Bubble
        });
        
        // Add product - UPDATE THESE WITH BUBBLE DYNAMIC DATA
        r.addItems({
            'sku': 'Product SKU',                 // Click here and select from Bubble
            'name': 'Product name',               // Click here and select from Bubble  
            'price': 'Order total price',         // Click here and select from Bubble
            'quantity': 'Order quantity'          // Click here and select from Bubble (or just 1)
        });

        // Send the conversion
        r.sendConversion();
        
        // Log success
        console.log("✅ Refersion conversion tracked!");
        
    } catch (error) {
        console.error("❌ Refersion conversion error:", error);
    }
} else {
    console.error("❌ Refersion not loaded - check header code!");
}