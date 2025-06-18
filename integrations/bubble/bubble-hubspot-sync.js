// BUBBLE + HUBSPOT SYNC FOR REFERSION TRACKING
// Add this to your Bubble workflows to keep HubSpot in sync

// 1. ON USER SIGNUP OR LOGIN - Capture and store tracking
function captureRefersionForUser() {
    const tracking = window.getRefersionTracking(); // From our header script
    
    if (tracking.rfsn) {
        // Return data to save to Bubble User
        return {
            refersion_id: tracking.rfsn,
            refersion_timestamp: tracking.timestamp || new Date().toISOString(),
            refersion_source: tracking.source_url || window.location.href
        };
    }
    return null;
}

// 2. ON PURCHASE COMPLETION - Sync to HubSpot
function syncPurchaseToHubSpot(orderData) {
    // Get tracking from localStorage or Current User
    const rfsn = localStorage.getItem('rfsn') || 
                 'Current User refersion_id' || // Bubble dynamic data
                 '';
    
    // Track conversion with Refersion
    if (rfsn && window.r) {
        r.addTrans({
            'order_id': orderData.id,
            'currency_code': 'USD'
        });
        
        r.addCustomer({
            'first_name': orderData.customerFirstName,
            'email': orderData.customerEmail
        });
        
        r.addItems({
            'sku': orderData.productSku,
            'name': orderData.productName,
            'price': orderData.totalPrice,
            'quantity': orderData.quantity
        });
        
        r.sendConversion();
    }
    
    // Return data for HubSpot API call
    return {
        email: orderData.customerEmail,
        properties: {
            refersionid: rfsn,
            last_purchase_date: new Date().toISOString(),
            last_purchase_amount: orderData.totalPrice,
            total_revenue: orderData.customerTotalSpent, // If you track this
            lifecycle_stage: 'customer'
        }
    };
}

// 3. FORM SUBMISSION FROM BUBBLE - Include tracking
function addTrackingToFormData(formData) {
    const rfsn = localStorage.getItem('rfsn') || 
                 'Current User refersion_id' || // Bubble dynamic data
                 '';
    
    // Add tracking fields to form data
    return {
        ...formData,
        refersionid: rfsn,
        refersion_timestamp: localStorage.getItem('rfsn_timestamp') || '',
        refersion_source_url: localStorage.getItem('rfsn_source_url') || '',
        source_site: 'loopbiolabs.com'
    };
}

// 4. LINK TO THELOOPWAY - Preserve tracking
function createLoopWayLink(path) {
    const rfsn = localStorage.getItem('rfsn') || 
                 'Current User refersion_id' || // Bubble dynamic data
                 '';
    
    const baseUrl = 'https://theloopway.com';
    if (rfsn) {
        const separator = path.includes('?') ? '&' : '?';
        return `${baseUrl}${path}${separator}rfsn=${encodeURIComponent(rfsn)}`;
    }
    return `${baseUrl}${path}`;
}

// 5. HUBSPOT CONTACT UPDATE - Via API Workflow
// Use this data structure in your Bubble API Connector
function buildHubSpotContactUpdate() {
    const rfsn = localStorage.getItem('rfsn') || 
                 'Current User refersion_id' || // Bubble dynamic data
                 '';
    
    return {
        email: 'Current User Email', // Bubble dynamic data
        properties: {
            refersionid: rfsn,
            last_seen_site: 'loopbiolabs.com',
            last_activity_date: new Date().toISOString(),
            // Add any LoopBioLabs-specific properties
            customer_type: 'ecommerce',
            preferred_products: 'Current User Purchased Products List' // Bubble dynamic
        }
    };
}

// 6. CHECK IF USER CAME FROM THELOOPWAY
function checkCrossDomainsource() {
    const referrer = document.referrer;
    const fromLoopWay = referrer.includes('theloopway.com');
    const fromForms = referrer.includes('forms.theloopway.com');
    
    if (fromLoopWay || fromForms) {
        // User came from your other site
        // Capture any URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const rfsn = urlParams.get('rfsn');
        
        if (rfsn) {
            // Store it everywhere
            localStorage.setItem('rfsn', rfsn);
            sessionStorage.setItem('rfsn', rfsn);
            document.cookie = `rfsn=${rfsn}; max-age=${30*24*60*60}; path=/`;
            
            return {
                from_site: fromForms ? 'forms.theloopway.com' : 'theloopway.com',
                affiliate_id: rfsn,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    return null;
}