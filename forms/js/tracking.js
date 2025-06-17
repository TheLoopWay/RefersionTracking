/**
 * Refersion Tracking Module
 * Handles all tracking capture and storage
 */

export class RefersionTracker {
  constructor() {
    this.storageKey = 'rfsn_data';
    this.cookieDays = 30;
  }

  /**
   * Initialize tracking on page load
   */
  init() {
    const trackingData = this.captureFromUrl() || this.getStored();
    
    if (trackingData) {
      this.track(trackingData.rfsn);
      return trackingData;
    }
    
    return null;
  }

  /**
   * Capture tracking from URL parameters
   */
  captureFromUrl() {
    // Try current window first
    let params = new URLSearchParams(window.location.search);
    let rfsn = params.get('rfsn');
    
    // If in iframe and no tracking, try parent URL
    if (!rfsn && window !== window.parent) {
      try {
        params = new URLSearchParams(window.parent.location.search);
        rfsn = params.get('rfsn');
      } catch (e) {
        // Cross-origin, can't access parent
      }
    }
    
    if (rfsn) {
      const data = {
        rfsn,
        timestamp: new Date().toISOString(),
        sourceUrl: window.location.href,
        utmSource: params.get('utm_source'),
        utmMedium: params.get('utm_medium'),
        utmCampaign: params.get('utm_campaign')
      };
      
      this.store(data);
      return data;
    }
    
    return null;
  }

  /**
   * Store tracking data in multiple locations
   */
  store(data) {
    // Cookie
    const cookieData = encodeURIComponent(JSON.stringify(data));
    document.cookie = `${this.storageKey}=${cookieData}; max-age=${this.cookieDays * 24 * 60 * 60}; path=/; SameSite=Lax`;
    
    // LocalStorage
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage not available:', e);
    }
    
    // Send to server for backup
    this.sendToServer(data);
  }

  /**
   * Get stored tracking data
   */
  getStored() {
    // Try cookie first
    const cookieMatch = document.cookie.match(new RegExp(`${this.storageKey}=([^;]+)`));
    if (cookieMatch) {
      try {
        return JSON.parse(decodeURIComponent(cookieMatch[1]));
      } catch (e) {
        console.warn('Failed to parse cookie data:', e);
      }
    }
    
    // Try localStorage
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to get localStorage data:', e);
    }
    
    return null;
  }

  /**
   * Track with Refersion pixel
   */
  track(rfsn) {
    if (window.r && typeof window.r === 'function') {
      window.r('click', rfsn);
    }
  }

  /**
   * Send tracking to server (backup)
   */
  async sendToServer(data) {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {
      // Silent fail - this is just backup
    }
  }

  /**
   * Get tracking data for form submission
   */
  getFormData() {
    const data = this.getStored();
    if (!data) return {};
    
    return {
      refersionid: data.rfsn,
      refersion_timestamp: data.timestamp,
      refersion_source_url: data.sourceUrl,
      utm_source: data.utmSource,
      utm_medium: data.utmMedium,
      utm_campaign: data.utmCampaign
    };
  }
}

// Export singleton instance
export const tracker = new RefersionTracker();