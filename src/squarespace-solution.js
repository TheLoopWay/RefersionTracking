/**
 * Squarespace + HubSpot + Refersion Integration
 * Works with iframe-embedded forms using URL parameter passing
 */

(function() {
    'use strict';
    
    // Only run if we're not already initialized
    if (window.RefersionHubSpotInitialized) return;
    window.RefersionHubSpotInitialized = true;
    
    const config = {
        debug: true,
        storageKey: 'refersion_tracking'
    };
    
    function log(message, data) {
        if (config.debug && console && console.log) {
            console.log('[Refersion-Squarespace]', message, data || '');
        }
    }
    
    // Get URL parameter
    function getUrlParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name) || urlParams.get(name.toUpperCase());
    }
    
    // Main functionality
    function captureAndStoreTracking() {
        const rfsn = getUrlParam('rfsn');
        
        if (rfsn) {
            const trackingData = {
                rfsn: rfsn,
                timestamp: new Date().toISOString(),
                sourceUrl: window.location.href
            };
            
            // Store in localStorage
            try {
                localStorage.setItem(config.storageKey, JSON.stringify(trackingData));
                localStorage.setItem('rfsn', rfsn);
                localStorage.setItem('rfsn_timestamp', trackingData.timestamp);
                localStorage.setItem('rfsn_source_url', trackingData.sourceUrl);
                log('Captured tracking:', trackingData);
            } catch (e) {
                log('Storage error:', e);
            }
            
            // Track with Refersion if available
            if (window.r && typeof window.r === 'function') {
                try {
                    window.r('click', rfsn);
                    log('Tracked click with Refersion');
                } catch (e) {
                    log('Refersion click tracking error:', e);
                }
            }
            
            return trackingData;
        }
        
        // Try to get stored data
        try {
            const stored = localStorage.getItem(config.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            log('Error reading stored data:', e);
        }
        
        return null;
    }
    
    // Modify form URLs to include tracking
    function modifyFormUrls() {
        const trackingData = captureAndStoreTracking();
        if (!trackingData) {
            log('No tracking data to append to forms');
            return;
        }
        
        // Find all links to the form page
        const formLinks = document.querySelectorAll('a[href*="peptide-coaching-inquiry-page"]');
        formLinks.forEach(link => {
            try {
                const url = new URL(link.href);
                url.searchParams.set('refersionid', trackingData.rfsn);
                url.searchParams.set('rfsn', trackingData.rfsn); // Backup parameter
                link.href = url.toString();
                log('Updated form link:', link.href);
            } catch (e) {
                log('Error updating link:', e);
            }
        });
        
        // If we're on the form page, try to modify the iframe URL
        if (window.location.pathname.includes('peptide-coaching-inquiry-page')) {
            modifyIframeUrls(trackingData);
        }
    }
    
    // Try to modify iframe URLs before they load
    function modifyIframeUrls(trackingData) {
        // Monitor for iframes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'IFRAME' && node.src && node.src.includes('hsforms.com')) {
                        try {
                            const url = new URL(node.src);
                            url.searchParams.set('refersionid', trackingData.rfsn);
                            node.src = url.toString();
                            log('Modified iframe URL');
                        } catch (e) {
                            log('Error modifying iframe:', e);
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Also check existing iframes
        document.querySelectorAll('iframe[src*="hsforms.com"]').forEach(iframe => {
            if (!iframe.dataset.refersionModified) {
                iframe.dataset.refersionModified = 'true';
                try {
                    const url = new URL(iframe.src);
                    url.searchParams.set('refersionid', trackingData.rfsn);
                    iframe.src = url.toString();
                    log('Modified existing iframe URL');
                } catch (e) {
                    log('Error modifying existing iframe:', e);
                }
            }
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', modifyFormUrls);
    } else {
        modifyFormUrls();
    }
    
    // Also run after a delay for dynamically loaded content
    setTimeout(modifyFormUrls, 2000);
    
    // Expose API
    window.RefersionHubSpot = {
        getTrackingData: function() {
            try {
                const stored = localStorage.getItem(config.storageKey);
                return stored ? JSON.parse(stored) : null;
            } catch (e) {
                return null;
            }
        },
        clearTracking: function() {
            localStorage.removeItem(config.storageKey);
            localStorage.removeItem('rfsn');
            localStorage.removeItem('rfsn_timestamp');
            localStorage.removeItem('rfsn_source_url');
            log('Tracking cleared');
        }
    };
    
    log('Squarespace integration initialized');
})();