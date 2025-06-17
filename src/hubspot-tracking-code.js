/**
 * Simplest Solution: Use HubSpot Tracking Code
 * This identifies visitors with custom properties
 */

(function() {
    'use strict';
    
    // Capture affiliate tracking
    function captureAffiliate() {
        const urlParams = new URLSearchParams(window.location.search);
        const rfsn = urlParams.get('rfsn');
        
        if (rfsn) {
            // Store in cookie
            document.cookie = `rfsn=${rfsn}; max-age=${30*24*60*60}; path=/`;
            document.cookie = `rfsn_timestamp=${new Date().toISOString()}; max-age=${30*24*60*60}; path=/`;
            document.cookie = `rfsn_landing=${window.location.href}; max-age=${30*24*60*60}; path=/`;
            
            // Track with Refersion
            if (window.r && typeof window.r === 'function') {
                window.r('click', rfsn);
            }
            
            return {
                rfsn: rfsn,
                timestamp: new Date().toISOString(),
                landing: window.location.href
            };
        }
        
        // Get from cookies
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        };
        
        const stored_rfsn = getCookie('rfsn');
        if (stored_rfsn) {
            return {
                rfsn: stored_rfsn,
                timestamp: getCookie('rfsn_timestamp'),
                landing: getCookie('rfsn_landing')
            };
        }
        
        return null;
    }
    
    // Send to HubSpot using their tracking code
    function sendToHubSpot() {
        const trackingData = captureAffiliate();
        if (!trackingData) return;
        
        // Initialize HubSpot queue
        window._hsq = window._hsq || [];
        
        // Method 1: Identify the visitor
        window._hsq.push(['identify', {
            refersionid: trackingData.rfsn,
            refersion_timestamp: trackingData.timestamp,
            refersion_source_url: trackingData.landing
        }]);
        
        // Method 2: Track custom event
        window._hsq.push(['trackEvent', {
            id: 'Affiliate Referral',
            value: trackingData.rfsn
        }]);
        
        console.log('[HubSpot] Sent affiliate tracking:', trackingData);
    }
    
    // Wait for HubSpot to load
    function waitForHubSpot() {
        if (window._hsq) {
            sendToHubSpot();
        } else {
            // Retry in 500ms
            setTimeout(waitForHubSpot, 500);
        }
    }
    
    // Start
    waitForHubSpot();
    
})();