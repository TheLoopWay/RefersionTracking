/**
 * Simple Segment + Refersion Setup
 * Lightweight cross-domain tracking without Unify
 */

// ===========================================
// CORE TRACKING FUNCTIONS
// ===========================================

window.LoopTracking = {
  // Get or set affiliate ID
  getAffiliateId: function() {
    // Check URL first
    const urlParams = new URLSearchParams(window.location.search);
    const urlRfsn = urlParams.get('rfsn');
    if (urlRfsn) {
      this.setAffiliateId(urlRfsn);
      return urlRfsn;
    }
    
    // Check storage
    return localStorage.getItem('rfsn') || this.getCookie('rfsn') || null;
  },
  
  setAffiliateId: function(rfsn) {
    // Save everywhere
    localStorage.setItem('rfsn', rfsn);
    localStorage.setItem('rfsn_timestamp', new Date().toISOString());
    this.setCookie('rfsn', rfsn, 30);
    
    // Track with Segment
    if (window.analytics) {
      analytics.identify({
        refersionId: rfsn
      });
    }
  },
  
  // Cookie helpers
  setCookie: function(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`;
  },
  
  getCookie: function(name) {
    const match = document.cookie.match(new RegExp(`${name}=([^;]+)`));
    return match ? match[1] : null;
  },
  
  // Decorate URL with tracking
  decorateUrl: function(url) {
    const rfsn = this.getAffiliateId();
    if (!rfsn) return url;
    
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('rfsn', rfsn);
      
      // Add Segment anonymous ID for identity stitching
      if (window.analytics && analytics.user) {
        const anonId = analytics.user().anonymousId();
        if (anonId) {
          urlObj.searchParams.set('_sid', anonId);
        }
      }
      
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }
};

// ===========================================
// SEGMENT INTEGRATION
// ===========================================

// Wait for Segment to be ready
if (window.analytics) {
  analytics.ready(function() {
    // Capture affiliate on page load
    const rfsn = LoopTracking.getAffiliateId();
    if (rfsn) {
      analytics.track('Affiliate Link Clicked', {
        affiliateId: rfsn,
        landingPage: window.location.href,
        referrer: document.referrer
      });
    }
    
    // Auto-decorate cross-domain links
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (!link || !link.href) return;
      
      // Check if it's a cross-domain link
      const domains = ['theloopway.com', 'loopbiolabs.com', 'forms.theloopway.com'];
      const isExternal = domains.some(domain => 
        link.href.includes(domain) && !window.location.href.includes(domain)
      );
      
      if (isExternal) {
        e.preventDefault();
        window.location.href = LoopTracking.decorateUrl(link.href);
      }
    });
  });
}

// ===========================================
// FORM TRACKING (TheLoopWay)
// ===========================================

window.trackFormSubmission = function(formData) {
  // Get affiliate
  const rfsn = LoopTracking.getAffiliateId();
  
  // Identify user
  analytics.identify(formData.email, {
    email: formData.email,
    firstName: formData.firstName || formData.firstname,
    lastName: formData.lastName || formData.lastname,
    refersionId: rfsn
  });
  
  // Track event
  analytics.track('Form Submitted', {
    formName: formData.formName,
    formId: formData.formId,
    affiliateId: rfsn
  });
};

// ===========================================
// PURCHASE TRACKING (LoopBioLabs)
// ===========================================

window.trackPurchase = function(orderData) {
  // Get affiliate from all sources
  const rfsn = LoopTracking.getAffiliateId() || 
               (analytics.user && analytics.user().traits().refersionId);
  
  // Track with Segment
  analytics.track('Order Completed', {
    orderId: orderData.orderId,
    total: parseFloat(orderData.total || 0),
    revenue: parseFloat(orderData.total || 0), // Segment prefers 'revenue'
    currency: orderData.currency || 'USD',
    email: orderData.email,
    affiliateId: rfsn,
    refersionId: rfsn, // Include both just in case
    products: orderData.products || [{
      productId: orderData.productId || 'PRODUCT',
      sku: orderData.sku || orderData.productId || 'PRODUCT',
      name: orderData.productName || 'Product',
      price: parseFloat(orderData.total || 0),
      quantity: parseInt(orderData.quantity || 1)
    }]
  });
  
  // Also track directly with Refersion if loaded
  if (window.r && rfsn) {
    r.addTrans({
      order_id: orderData.orderId,
      currency_code: orderData.currency || 'USD'
    });
    
    if (orderData.email) {
      r.addCustomer({
        email: orderData.email,
        first_name: orderData.firstName || ''
      });
    }
    
    r.addItems({
      sku: orderData.sku || 'PRODUCT',
      price: orderData.total,
      quantity: orderData.quantity || 1
    });
    
    r.sendConversion();
  }
};

// ===========================================
// BUBBLE HELPERS
// ===========================================

window.BubbleHelpers = {
  // Call on user login/signup
  identifyUser: function(email, firstName, lastName) {
    // Check for stored affiliate
    const rfsn = LoopTracking.getAffiliateId();
    
    analytics.identify(email, {
      email: email,
      firstName: firstName,
      lastName: lastName,
      refersionId: rfsn
    });
    
    return rfsn; // Return for Bubble to store
  },
  
  // Simple purchase tracking
  trackOrder: function(orderId, total, email) {
    trackPurchase({
      orderId: orderId,
      total: total,
      email: email,
      quantity: 1
    });
  },
  
  // Get tracking for Bubble database
  getTracking: function() {
    return {
      affiliateId: LoopTracking.getAffiliateId(),
      anonymousId: analytics.user ? analytics.user().anonymousId() : null,
      timestamp: new Date().toISOString()
    };
  }
};

// ===========================================
// INITIALIZATION LOG
// ===========================================

console.log('[Loop Tracking] Initialized', {
  domain: window.location.hostname,
  hasSegment: !!window.analytics,
  hasRefersion: !!window.r,
  affiliate: LoopTracking.getAffiliateId()
});