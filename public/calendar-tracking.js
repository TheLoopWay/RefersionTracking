/**
 * LOOP Calendar Tracking for HubSpot Meeting Scheduler
 * 
 * This script captures Refersion tracking and passes it to HubSpot's calendar widget
 * Usage: Add this script BEFORE your HubSpot meeting embed code
 */

(function() {
  'use strict';
  
  // Get tracking from localStorage or URL
  function getRefersionTracking() {
    // Check URL first
    const urlParams = new URLSearchParams(window.location.search);
    const urlRfsn = urlParams.get('rfsn');
    
    if (urlRfsn) {
      return urlRfsn;
    }
    
    // Check localStorage
    try {
      const stored = localStorage.getItem('rfsn');
      if (stored) {
        return stored;
      }
    } catch (e) {
      // localStorage might not be available
    }
    
    // Check cookies
    const cookieMatch = document.cookie.match(/rfsn=([^;]+)/);
    if (cookieMatch) {
      return cookieMatch[1];
    }
    
    return null;
  }
  
  // Wait for HubSpot meetings widget to load
  function injectTracking() {
    const rfsn = getRefersionTracking();
    if (!rfsn) return;
    
    // Method 1: URL parameter injection
    // If your meeting link supports custom fields, add to URL
    const meetingLinks = document.querySelectorAll('a[href*="meetings.hubspot.com"], a[href*="meetings.hubspotpagebuilder.com"]');
    meetingLinks.forEach(link => {
      const url = new URL(link.href);
      // Add as custom property
      url.searchParams.set('refersionid', rfsn);
      link.href = url.toString();
    });
    
    // Method 2: Listen for HubSpot form events
    window.addEventListener('message', function(event) {
      // HubSpot meetings widget uses postMessage
      if (event.origin.includes('hubspot')) {
        // When the meeting form loads, we'll try to inject the tracking
        if (event.data && event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormReady') {
          // Send tracking data back to the iframe
          if (event.source) {
            event.source.postMessage({
              type: 'hsFormUpdate',
              data: {
                refersionid: rfsn
              }
            }, event.origin);
          }
        }
      }
    });
    
    // Method 3: Global HubSpot settings
    window._hsq = window._hsq || [];
    window._hsq.push(['identify', {
      refersionid: rfsn
    }]);
    
    // Method 4: Add to hutk cookie context
    const hutkMatch = document.cookie.match(/hubspotutk=([^;]+)/);
    if (hutkMatch) {
      // Store mapping for server-side processing
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hutk: hutkMatch[1],
          rfsn: rfsn,
          type: 'calendar-booking'
        })
      }).catch(() => {
        // Silent fail - this is just backup
      });
    }
  }
  
  // Run immediately
  injectTracking();
  
  // Also run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectTracking);
  }
  
  // Watch for dynamically added meeting links
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        injectTracking();
      }
    });
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Expose function for manual use
  window.LoopCalendarTracking = {
    getTracking: getRefersionTracking,
    inject: injectTracking
  };
})();