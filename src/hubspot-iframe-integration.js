/**
 * Refersion + HubSpot Integration for Iframe Forms
 * 
 * This version works with HubSpot forms embedded in iframes by intercepting
 * the form submission at the parent level.
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        debug: true,
        cookieDays: 30,
        storageKey: 'refersion_tracking'
    };
    
    // Utility functions
    const utils = {
        log: function(message, data) {
            if (CONFIG.debug && typeof console !== 'undefined' && console.log) {
                console.log('[Refersion-HubSpot-Iframe]', message, data || '');
            }
        },
        
        getUrlParameter: function(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name) || urlParams.get(name.toUpperCase());
        }
    };
    
    // Main integration
    const RefersionIframeIntegration = {
        init: function() {
            utils.log('Initializing Refersion iframe integration');
            
            // Capture tracking from URL
            this.captureTracking();
            
            // Set up iframe monitoring
            this.monitorIframes();
            
            // Listen for HubSpot events
            this.listenForHubSpotEvents();
        },
        
        captureTracking: function() {
            const rfsn = utils.getUrlParameter('rfsn');
            
            if (rfsn) {
                const trackingData = {
                    rfsn: rfsn,
                    timestamp: new Date().toISOString(),
                    sourceUrl: window.location.href
                };
                
                // Store in localStorage
                try {
                    localStorage.setItem(CONFIG.storageKey, JSON.stringify(trackingData));
                    utils.log('Stored tracking data in localStorage', trackingData);
                } catch (e) {
                    utils.log('localStorage error:', e);
                }
                
                // Also store individual values for compatibility
                try {
                    localStorage.setItem('rfsn', rfsn);
                    localStorage.setItem('rfsn_timestamp', trackingData.timestamp);
                    localStorage.setItem('rfsn_source_url', trackingData.sourceUrl);
                } catch (e) {
                    utils.log('Error storing individual values:', e);
                }
                
                utils.log('Captured tracking:', trackingData);
                return trackingData;
            }
            
            return this.getStoredTracking();
        },
        
        getStoredTracking: function() {
            try {
                // Try JSON format first
                const stored = localStorage.getItem(CONFIG.storageKey);
                if (stored) {
                    return JSON.parse(stored);
                }
                
                // Try individual values
                const rfsn = localStorage.getItem('rfsn');
                if (rfsn) {
                    return {
                        rfsn: rfsn,
                        timestamp: localStorage.getItem('rfsn_timestamp'),
                        sourceUrl: localStorage.getItem('rfsn_source_url')
                    };
                }
            } catch (e) {
                utils.log('Error reading stored tracking:', e);
            }
            
            return null;
        },
        
        monitorIframes: function() {
            const trackingData = this.getStoredTracking();
            if (!trackingData) {
                utils.log('No tracking data to append');
                return;
            }
            
            // Find all HubSpot iframes
            const checkForIframes = () => {
                const iframes = document.querySelectorAll('iframe[src*="forms.hsforms.com"], iframe[src*="hubspot"]');
                
                iframes.forEach(iframe => {
                    if (!iframe.dataset.refersionProcessed) {
                        iframe.dataset.refersionProcessed = 'true';
                        this.processIframe(iframe, trackingData);
                    }
                });
            };
            
            // Check immediately
            checkForIframes();
            
            // Check periodically for dynamically added iframes
            setInterval(checkForIframes, 2000);
            
            // Also use MutationObserver
            const observer = new MutationObserver(() => {
                checkForIframes();
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        },
        
        processIframe: function(iframe, trackingData) {
            utils.log('Processing iframe:', iframe.src);
            
            // Method 1: Try to append parameters to iframe URL
            try {
                const url = new URL(iframe.src);
                
                // Add tracking parameters to the iframe URL
                url.searchParams.set('refersionid', trackingData.rfsn);
                url.searchParams.set('refersion_timestamp', trackingData.timestamp);
                url.searchParams.set('refersion_source_url', trackingData.sourceUrl);
                
                // Some HubSpot forms accept custom parameters
                url.searchParams.set('rfsn', trackingData.rfsn);
                
                iframe.src = url.toString();
                utils.log('Updated iframe URL with tracking parameters');
            } catch (e) {
                utils.log('Could not modify iframe URL:', e);
            }
            
            // Method 2: Try postMessage when iframe loads
            iframe.addEventListener('load', () => {
                try {
                    iframe.contentWindow.postMessage({
                        type: 'refersion-tracking',
                        data: trackingData
                    }, '*');
                    utils.log('Sent tracking data via postMessage');
                } catch (e) {
                    utils.log('Could not send postMessage:', e);
                }
            });
        },
        
        listenForHubSpotEvents: function() {
            const trackingData = this.getStoredTracking();
            if (!trackingData) return;
            
            // Listen for HubSpot form events
            window.addEventListener('message', (event) => {
                // Check if it's a HubSpot message
                if (event.data && (
                    event.data.type === 'hsFormCallback' ||
                    event.data.eventName === 'onFormReady' ||
                    event.data.eventName === 'onFormSubmit'
                )) {
                    utils.log('HubSpot event received:', event.data);
                    
                    // Try to send tracking data back
                    if (event.source) {
                        event.source.postMessage({
                            type: 'refersion-data',
                            fields: {
                                refersionid: trackingData.rfsn,
                                refersion_timestamp: trackingData.timestamp,
                                refersion_source_url: trackingData.sourceUrl
                            }
                        }, event.origin);
                    }
                }
            });
        }
    };
    
    // Alternative: Modify HubSpot's global configuration if available
    const modifyHubSpotConfig = function() {
        const trackingData = RefersionIframeIntegration.getStoredTracking();
        if (!trackingData) return;
        
        // If HubSpot forms API is available
        if (window.hbspt && window.hbspt.forms) {
            const originalCreate = window.hbspt.forms.create;
            
            window.hbspt.forms.create = function(config) {
                utils.log('Intercepting HubSpot form creation');
                
                // Add hidden fields to the configuration
                if (!config.onFormReady) {
                    config.onFormReady = function() {};
                }
                
                const originalOnFormReady = config.onFormReady;
                config.onFormReady = function($form) {
                    utils.log('Form ready, adding tracking fields');
                    
                    // Add hidden fields
                    const fields = [
                        { name: 'refersionid', value: trackingData.rfsn },
                        { name: 'refersion_timestamp', value: trackingData.timestamp },
                        { name: 'refersion_source_url', value: trackingData.sourceUrl }
                    ];
                    
                    fields.forEach(field => {
                        if (!$form.find(`input[name="${field.name}"]`).length) {
                            $form.append(`<input type="hidden" name="${field.name}" value="${field.value}">`);
                            utils.log(`Added hidden field: ${field.name}`);
                        }
                    });
                    
                    // Call original callback
                    if (originalOnFormReady) {
                        originalOnFormReady.call(this, $form);
                    }
                };
                
                return originalCreate.call(this, config);
            };
        }
    };
    
    // Initialize
    RefersionIframeIntegration.init();
    modifyHubSpotConfig();
    
    // Also try to modify config after a delay
    setTimeout(modifyHubSpotConfig, 2000);
    
    // Expose API
    window.RefersionHubSpot = {
        getTrackingData: () => RefersionIframeIntegration.getStoredTracking(),
        clearTracking: () => {
            localStorage.removeItem(CONFIG.storageKey);
            localStorage.removeItem('rfsn');
            localStorage.removeItem('rfsn_timestamp');
            localStorage.removeItem('rfsn_source_url');
            utils.log('Tracking cleared');
        }
    };
    
    utils.log('Refersion iframe integration loaded');
})();