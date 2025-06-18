/**
 * HubSpot-Powered Cross-Domain Attribution
 * For Bubble workflows on LoopBioLabs
 */

// 1. ON PAGE LOAD - Check if user has HubSpot tracking
async function checkHubSpotTracking() {
  const userEmail = 'Current User Email'; // Bubble dynamic expression
  
  if (!userEmail) return null;
  
  try {
    // Call your server endpoint that queries HubSpot
    const response = await fetch('/api/check-hubspot-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail })
    });
    
    const data = await response.json();
    
    if (data.contact && data.contact.properties.refersionid) {
      // Store the affiliate ID locally
      localStorage.setItem('rfsn', data.contact.properties.refersionid);
      localStorage.setItem('rfsn_source', 'hubspot_lookup');
      
      return data.contact.properties.refersionid;
    }
  } catch (error) {
    console.error('HubSpot lookup failed:', error);
  }
  
  return null;
}

// 2. ON USER SIGNUP/LOGIN - Sync tracking
async function syncUserTracking() {
  // First check localStorage
  let rfsn = localStorage.getItem('rfsn');
  
  // If not found, check HubSpot
  if (!rfsn) {
    rfsn = await checkHubSpotTracking();
  }
  
  // If found, update Bubble user
  if (rfsn) {
    return {
      refersion_id: rfsn,
      refersion_synced: new Date().toISOString()
    };
  }
  
  return null;
}

// 3. ON PURCHASE - Track with proper attribution
function trackPurchaseWithAttribution(orderData) {
  // Priority order for finding affiliate ID:
  // 1. Current URL parameter
  // 2. Bubble Current User's refersion_id
  // 3. localStorage
  // 4. HubSpot lookup (already done on login)
  
  const urlParams = new URLSearchParams(window.location.search);
  const rfsn = urlParams.get('rfsn') || 
               'Current User refersion_id' || // Bubble expression
               localStorage.getItem('rfsn');
  
  if (rfsn && window.r) {
    // Track the conversion
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
      'price': orderData.totalPrice,
      'quantity': orderData.quantity
    });
    
    r.sendConversion();
    
    // Also update HubSpot
    return {
      email: orderData.customerEmail,
      refersionid: rfsn,
      last_purchase_date: new Date().toISOString(),
      last_purchase_amount: orderData.totalPrice,
      total_revenue: orderData.totalRevenue,
      lifecycle_stage: 'customer'
    };
  }
  
  return null;
}

// 4. SMART LINK GENERATOR - Include all available tracking
function generateSmartLink(destinationUrl) {
  const tracking = {
    // URL parameter (highest priority)
    url: new URLSearchParams(window.location.search).get('rfsn'),
    // Bubble user data
    user: 'Current User refersion_id', // Bubble expression
    // localStorage
    stored: localStorage.getItem('rfsn'),
    // Cookie
    cookie: document.cookie.match(/rfsn=([^;]+)/)?.[1]
  };
  
  // Use first available tracking
  const rfsn = tracking.url || tracking.user || tracking.stored || tracking.cookie;
  
  if (rfsn) {
    const url = new URL(destinationUrl);
    url.searchParams.set('rfsn', rfsn);
    
    // Add source for debugging
    url.searchParams.set('source', window.location.hostname);
    
    return url.toString();
  }
  
  return destinationUrl;
}

// 5. UNIFIED TRACKING CHECK - For Bubble workflows
window.getUnifiedTracking = async function() {
  // Check all sources
  const tracking = {
    url: new URLSearchParams(window.location.search).get('rfsn'),
    user: 'Current User refersion_id', // Bubble expression
    localStorage: localStorage.getItem('rfsn'),
    cookie: document.cookie.match(/rfsn=([^;]+)/)?.[1]
  };
  
  // Return first valid source
  const rfsn = tracking.url || tracking.user || tracking.localStorage || tracking.cookie;
  
  if (!rfsn && 'Current User Email') {
    // Last resort: check HubSpot
    const hubspotRfsn = await checkHubSpotTracking();
    if (hubspotRfsn) {
      tracking.hubspot = hubspotRfsn;
      return {
        rfsn: hubspotRfsn,
        source: 'hubspot_lookup'
      };
    }
  }
  
  return {
    rfsn: rfsn || null,
    source: rfsn ? Object.keys(tracking).find(key => tracking[key] === rfsn) : null,
    all: tracking
  };
};