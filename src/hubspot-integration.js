/**
 * Refersion + HubSpot Forms Integration
 * 
 * This script automatically populates HubSpot forms with Refersion affiliate tracking data.
 * Include this script on any page where you have HubSpot forms that need affiliate tracking.
 * 
 * Required HubSpot form fields (add as hidden fields):
 * - refersionid (existing property)
 * - refersion_timestamp
 * - refersion_source_url
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        debug: true, // Set to false in production
        cookieDays: 30,
        fieldMapping: {
            affiliateId: 'refersionid',  // Using existing HubSpot property
            timestamp: 'refersion_timestamp',
            sourceUrl: 'refersion_source_url'
        }
    };
    
    // Utility functions
    const utils = {
        log: function(message, data) {
            if (CONFIG.debug) {
                console.log('[Refersion-HubSpot]', message, data || '');
            }
        },
        
        getUrlParameter: function(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name) || urlParams.get(name.toUpperCase());
        },
        
        setCookie: function(name, value, days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
        },
        
        getCookie: function(name) {
            const nameEQ = name + '=';
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i].trim();
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
            }
            return null;
        }
    };
    
    // Refersion tracking object
    const RefersionTracker = {
        // Capture and store Refersion data
        captureReferral: function() {
            const rfsnParam = utils.getUrlParameter('rfsn');
            
            if (rfsnParam) {
                const trackingData = {
                    affiliateId: rfsnParam,
                    timestamp: new Date().toISOString(),
                    sourceUrl: window.location.href,
                    landingPage: window.location.pathname
                };
                
                // Store in multiple places for redundancy
                
                // 1. Store in localStorage
                try {
                    localStorage.setItem('rfsn', trackingData.affiliateId);
                    localStorage.setItem('rfsn_timestamp', trackingData.timestamp);
                    localStorage.setItem('rfsn_source_url', trackingData.sourceUrl);
                    utils.log('Stored in localStorage');
                } catch (e) {
                    utils.log('localStorage not available', e);
                }
                
                // 2. Also set cookies as backup
                try {
                    utils.setCookie('rfsn', trackingData.affiliateId, CONFIG.cookieDays);
                    utils.setCookie('rfsn_timestamp', trackingData.timestamp, CONFIG.cookieDays);
                    utils.setCookie('rfsn_source_url', trackingData.sourceUrl, CONFIG.cookieDays);
                    utils.log('Stored in cookies');
                } catch (e) {
                    utils.log('Cookie storage failed', e);
                }
                
                utils.log('New referral captured:', trackingData);
                return trackingData;
            }
            
            return null;
        },
        
        // Get stored Refersion data
        getStoredData: function() {
            const affiliateId = localStorage.getItem('rfsn') || utils.getCookie('rfsn');
            const timestamp = localStorage.getItem('rfsn_timestamp') || utils.getCookie('rfsn_timestamp');
            const sourceUrl = localStorage.getItem('rfsn_source_url') || '';
            
            if (affiliateId) {
                return {
                    affiliateId: affiliateId,
                    timestamp: timestamp,
                    sourceUrl: sourceUrl
                };
            }
            
            return null;
        },
        
        // Get current tracking data (check for new or use stored)
        getCurrentData: function() {
            const newData = this.captureReferral();
            return newData || this.getStoredData();
        }
    };
    
    // HubSpot form integration
    const HubSpotIntegration = {
        // Wait for HubSpot forms to load
        waitForHubSpot: function(callback) {
            if (window.hbspt && window.hbspt.forms) {
                callback();
            } else {
                setTimeout(() => this.waitForHubSpot(callback), 100);
            }
        },
        
        // Populate form fields with Refersion data
        populateFormFields: function(form, data) {
            if (!data) return;
            
            const fields = [
                { name: CONFIG.fieldMapping.affiliateId, value: data.affiliateId },
                { name: CONFIG.fieldMapping.timestamp, value: data.timestamp },
                { name: CONFIG.fieldMapping.sourceUrl, value: data.sourceUrl }
            ];
            
            fields.forEach(field => {
                // Try multiple selectors to handle HubSpot's prefixed names
                const selectors = [
                    `input[name="${field.name}"]`,
                    `input[name$="/${field.name}"]`, // Matches "0-1/refersionid"
                    `input[name*="${field.name}"]`
                ];
                
                let input = null;
                for (const selector of selectors) {
                    input = form.querySelector(selector);
                    if (input) break;
                }
                
                if (input) {
                    input.value = field.value;
                    // For hidden fields, also set attribute
                    if (input.type === 'hidden') {
                        input.setAttribute('value', field.value);
                    }
                    // Trigger events to ensure HubSpot registers the change
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    utils.log(`Set field ${field.name} to: ${field.value} (found as ${input.name})`);
                } else {
                    // Create hidden field if it doesn't exist
                    const hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.name = field.name;
                    hiddenInput.value = field.value;
                    form.appendChild(hiddenInput);
                    utils.log(`Created hidden field ${field.name} with value:`, field.value);
                }
            });
        },
        
        // Initialize integration
        init: function() {
            const trackingData = RefersionTracker.getCurrentData();
            
            if (!trackingData) {
                utils.log('No Refersion tracking data found');
                return;
            }
            
            utils.log('Tracking data available:', trackingData);
            
            // Method 1: Listen for HubSpot form events
            window.addEventListener('message', (event) => {
                if (event.data.type === 'hsFormCallback') {
                    if (event.data.eventName === 'onFormReady') {
                        utils.log('HubSpot form ready event received');
                        
                        // Find all HubSpot forms on the page
                        setTimeout(() => {
                            const forms = document.querySelectorAll('.hs-form');
                            forms.forEach(form => {
                                this.populateFormFields(form, trackingData);
                            });
                        }, 100);
                    }
                    
                    if (event.data.eventName === 'onFormSubmit') {
                        utils.log('Form submitted with tracking data');
                    }
                }
            });
            
            // Method 2: Use MutationObserver to detect form injection
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.classList && node.classList.contains('hs-form')) {
                            utils.log('HubSpot form detected via MutationObserver');
                            this.populateFormFields(node, trackingData);
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Method 3: Check for existing forms
            document.addEventListener('DOMContentLoaded', () => {
                const forms = document.querySelectorAll('.hs-form');
                forms.forEach(form => {
                    this.populateFormFields(form, trackingData);
                });
            });
        }
    };
    
    // Global API for manual integration
    window.RefersionHubSpot = {
        getTrackingData: RefersionTracker.getCurrentData.bind(RefersionTracker),
        populateForm: function(formElement) {
            const data = RefersionTracker.getCurrentData();
            if (data && formElement) {
                HubSpotIntegration.populateFormFields(formElement, data);
            }
        },
        // For programmatic form creation
        getHiddenFields: function() {
            const data = RefersionTracker.getCurrentData();
            if (!data) return [];
            
            return [
                { name: CONFIG.fieldMapping.affiliateId, value: data.affiliateId },
                { name: CONFIG.fieldMapping.timestamp, value: data.timestamp },
                { name: CONFIG.fieldMapping.sourceUrl, value: data.sourceUrl }
            ];
        }
    };
    
    // Initialize
    HubSpotIntegration.init();
    
    // Log initialization
    utils.log('Refersion-HubSpot integration initialized');
})();