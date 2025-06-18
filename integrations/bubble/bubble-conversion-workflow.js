// IMPROVED BUBBLE CONVERSION TRACKING
// This assumes Refersion is already loaded in your header

// First, check if Refersion is already loaded
if (window.r && window.r.pubKey) {
    console.log("Using existing Refersion instance for conversion tracking");
    
    try {
        // Clear any previous transaction data
        if (window.r.clearCart) {
            window.r.clearCart();
        }
        
        // Add transaction details
        r.addTrans({
            'order_id': 'Orders unique id',      // Replace with Bubble dynamic: Order's unique id
            'currency_code': 'USD',
            'discount': 0,                       // Add if you have discounts
            'discount_code': '',                 // Add if you have discount codes
            'shipping': 0                        // Add shipping if applicable
        });

        // Add customer information
        r.addCustomer({
            'first_name': 'Orders Name',         // Replace with Bubble dynamic: Order's Customer's First Name
            'last_name': '',                     // Add if you have last name
            'email': 'Orders Email',             // Replace with Bubble dynamic: Order's Customer's Email
            'ip_address': ''                     // Optional
        });
        
        // Add items - if you have multiple items, you'll need to loop through them
        // For single item:
        r.addItems({
            'sku': 'Orders SKU',                 // Replace with Bubble dynamic: Order's Product's SKU
            'name': 'Orders Product Name',       // Replace with Bubble dynamic: Order's Product's Name
            'price': 'Orders Price',             // Replace with Bubble dynamic: Order's Total Price
            'quantity': 'Orders Quantity'        // Replace with Bubble dynamic: Order's Quantity
        });
        
        // For multiple items, you'd need a loop:
        /*
        var items = 'Orders Line Items';         // Get your line items list
        items.forEach(function(item) {
            r.addItems({
                'sku': item.sku,
                'name': item.name,
                'price': item.price,
                'quantity': item.quantity
            });
        });
        */

        // Send the conversion
        r.sendConversion();
        
        console.log("Conversion sent successfully!", {
            orderId: 'Orders unique id',
            amount: 'Orders Price',
            affiliate: localStorage.getItem('rfsn') || 'none'
        });
        
        // Return success for Bubble workflow
        true;
        
    } catch (error) {
        console.error("Error sending conversion:", error);
        // Return false for Bubble workflow
        false;
    }
    
} else {
    console.error("Refersion not loaded! Make sure the tracking script is in your header.");
    
    // Fallback: Try to track with stored affiliate ID
    var storedRfsn = localStorage.getItem('rfsn');
    if (storedRfsn) {
        console.log("Attempting fallback pixel tracking for affiliate:", storedRfsn);
        
        // Create a fallback conversion pixel
        var img = new Image();
        img.src = 'https://refersion.com/tracker/v4/pub_ee6ba2b9f9295e53f4eb.gif?aid=' + 
                  encodeURIComponent(storedRfsn) + 
                  '&oid=' + encodeURIComponent('Orders unique id') +
                  '&amt=' + encodeURIComponent('Orders Price') +
                  '&cur=USD';
        
        document.body.appendChild(img);
        img.style.display = 'none';
    }
    
    false;
}