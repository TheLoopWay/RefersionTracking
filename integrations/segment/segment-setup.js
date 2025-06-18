/**
 * Segment Setup for Loop Cross-Domain Tracking
 * Without Unify - Custom Identity Resolution
 */

// ===========================================
// SHARED UTILITIES (Both Sites)
// ===========================================

class LoopIdentityManager {
  constructor() {
    this.STORAGE_KEY = 'loop_identity';
    this.COOKIE_NAME = 'loop_uid';
    this.DOMAIN = '.theloopway.com'; // Use parent domain for cross-subdomain
  }

  // Generate a stable anonymous ID
  generateAnonymousId() {
    // Use timestamp + random for uniqueness
    return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  // Get or create a persistent anonymous ID
  getAnonymousId() {
    // Check URL parameter first (for cross-domain)
    const urlParams = new URLSearchParams(window.location.search);
    const urlAnonId = urlParams.get('loop_aid');
    if (urlAnonId) {
      this.saveAnonymousId(urlAnonId);
      return urlAnonId;
    }

    // Check localStorage
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.anonymousId) return data.anonymousId;
      }
    } catch (e) {}

    // Check cookie
    const cookieId = this.getCookie(this.COOKIE_NAME);
    if (cookieId) return cookieId;

    // Generate new
    const newId = this.generateAnonymousId();
    this.saveAnonymousId(newId);
    return newId;
  }

  // Save anonymous ID to multiple storage locations
  saveAnonymousId(id) {
    // localStorage
    try {
      const existing = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
      existing.anonymousId = id;
      existing.updatedAt = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {}

    // Cookie (cross-subdomain)
    this.setCookie(this.COOKIE_NAME, id, 365);
  }

  // Get user identity (email or anonymous)
  getUserId() {
    // Check for email first
    const identity = this.getStoredIdentity();
    if (identity.email) {
      return {
        userId: identity.email,
        anonymousId: this.getAnonymousId(),
        traits: identity
      };
    }

    // Fall back to anonymous
    return {
      userId: null,
      anonymousId: this.getAnonymousId(),
      traits: {}
    };
  }

  // Store user identity when known
  identify(email, traits = {}) {
    const identity = {
      email,
      ...traits,
      identifiedAt: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        ...existing,
        ...identity
      }));
    } catch (e) {}

    return identity;
  }

  // Get stored identity
  getStoredIdentity() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  // Cookie helpers
  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;domain=${this.DOMAIN};SameSite=Lax`;
  }

  getCookie(name) {
    const match = document.cookie.match(new RegExp(`${name}=([^;]+)`));
    return match ? match[1] : null;
  }

  // Add anonymous ID to cross-domain URLs
  decorateUrl(url) {
    try {
      const urlObj = new URL(url);
      // Only decorate cross-domain URLs
      if (urlObj.hostname.includes('loopway.com') || urlObj.hostname.includes('loopbiolabs.com')) {
        urlObj.searchParams.set('loop_aid', this.getAnonymousId());
        
        // Also preserve Refersion tracking
        const rfsn = localStorage.getItem('rfsn') || urlObj.searchParams.get('rfsn');
        if (rfsn) {
          urlObj.searchParams.set('rfsn', rfsn);
        }
      }
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }
}

// ===========================================
// SEGMENT INITIALIZATION
// ===========================================

// Initialize identity manager
window.loopIdentity = new LoopIdentityManager();

// Configure Segment
window.analytics = window.analytics || [];

// Custom middleware to add our identity
analytics.addSourceMiddleware(({ payload, next }) => {
  // Get our identity
  const identity = loopIdentity.getUserId();
  
  // Add to all calls
  if (identity.userId) {
    payload.obj.userId = identity.userId;
  }
  payload.obj.anonymousId = identity.anonymousId;
  
  // Add custom context
  payload.obj.context = payload.obj.context || {};
  payload.obj.context.loop = {
    hasStoredIdentity: !!identity.userId,
    domain: window.location.hostname
  };
  
  next(payload);
});

// ===========================================
// REFERSION INTEGRATION
// ===========================================

class RefersionSegmentBridge {
  constructor() {
    this.tracked = false;
  }

  // Capture and track affiliate
  captureAffiliate() {
    const urlParams = new URLSearchParams(window.location.search);
    const rfsn = urlParams.get('rfsn');
    
    if (rfsn && !this.tracked) {
      // Store locally
      localStorage.setItem('rfsn', rfsn);
      localStorage.setItem('rfsn_timestamp', new Date().toISOString());
      
      // Track with Segment
      analytics.track('Affiliate Link Clicked', {
        affiliateId: rfsn,
        landingPage: window.location.href,
        referrer: document.referrer
      });
      
      // Add to user traits
      analytics.identify({
        refersionId: rfsn,
        refersionTimestamp: new Date().toISOString()
      });
      
      this.tracked = true;
      console.log('[Segment] Affiliate tracked:', rfsn);
    }
  }

  // Get stored affiliate
  getAffiliate() {
    return localStorage.getItem('rfsn') || null;
  }
}

window.refersionBridge = new RefersionSegmentBridge();

// ===========================================
// PAGE-SPECIFIC IMPLEMENTATIONS
// ===========================================

// FOR THELOOPWAY.COM
function setupTheLoopWay() {
  // Track affiliate on page load
  analytics.ready(() => {
    refersionBridge.captureAffiliate();
    
    // Decorate all cross-domain links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.href.includes('loopbiolabs.com')) {
        e.preventDefault();
        window.location.href = window.loopIdentity.decorateUrl(link.href);
      }
    });
  });

  // On form submission
  window.trackFormSubmission = function(formData) {
    // Identify user
    window.loopIdentity.identify(formData.email, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      formName: formData.formName
    });

    // Track event with Segment
    analytics.track('Form Submitted', {
      formName: formData.formName,
      email: formData.email,
      affiliateId: refersionBridge.getAffiliate()
    });

    // Update identity with affiliate
    if (refersionBridge.getAffiliate()) {
      analytics.identify(formData.email, {
        email: formData.email,
        refersionId: refersionBridge.getAffiliate()
      });
    }
  };
}

// FOR LOOPBIOLABS.COM  
function setupLoopBioLabs() {
  // Capture cross-domain identity
  analytics.ready(() => {
    refersionBridge.captureAffiliate();
    
    // For Bubble - expose functions
    window.segmentTrackPurchase = function(orderData) {
      
      // Track purchase
      analytics.track('Order Completed', {
        orderId: orderData.id,
        total: orderData.total,
        currency: 'USD',
        products: orderData.products,
        affiliateId: refersionBridge.getAffiliate()
      });

      // Also send to Refersion if we have an affiliate
      const rfsn = refersionBridge.getAffiliate();
      if (rfsn && window.r) {
        r.addTrans({
          order_id: orderData.id,
          currency_code: 'USD'
        });
        r.addCustomer({
          email: orderData.email,
          first_name: orderData.firstName
        });
        r.addItems({
          sku: orderData.sku,
          price: orderData.total,
          quantity: orderData.quantity
        });
        r.sendConversion();
      }
    };

    // Identify on login/signup
    window.segmentIdentifyUser = function(email, traits) {
      window.loopIdentity.identify(email, traits);
      analytics.identify(email, traits);
      
      // Check if this user has an affiliate in their traits
      if (traits.refersionId) {
        localStorage.setItem('rfsn', traits.refersionId);
      }
    };
  });
}

// ===========================================
// AUTO-INITIALIZATION
// ===========================================

// Detect which site we're on and initialize
if (window.location.hostname.includes('theloopway.com')) {
  setupTheLoopWay();
} else if (window.location.hostname.includes('loopbiolabs.com')) {
  setupLoopBioLabs();
}

// Track page views
analytics.page();