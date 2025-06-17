/**
 * Refersion + HubSpot Forms Integration v2
 * Enhanced to support new HubSpot form embed formats
 * 
 * This script automatically populates HubSpot forms with Refersion affiliate tracking data.
 * Supports both traditional and new data-attribute based form embeds.
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
            affiliateId: 'refersionid',
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
                if (c.indexOf(nameEQ) === 0) {
                    return c.substring(nameEQ.length, c.length);
                }
            }
            return null;
        }
    };
    
    // Refersion tracking management
    const RefersionTracker = {
        storageKey: 'refersion_tracking',
        
        getCurrentData: function() {
            // Try localStorage first
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                try {
                    const data = JSON.parse(stored);
                    const expiryTime = new Date(data.timestamp).getTime() + (CONFIG.cookieDays * 24 * 60 * 60 * 1000);
                    if (new Date().getTime() < expiryTime) {
                        return data;
                    }
                } catch (e) {
                    utils.log('Error parsing stored data', e);
                }
            }
            
            // Fallback to cookie
            const cookieData = utils.getCookie(this.storageKey);
            if (cookieData) {
                try {
                    return JSON.parse(decodeURIComponent(cookieData));
                } catch (e) {
                    utils.log('Error parsing cookie data', e);
                }
            }
            
            return null;
        },
        
        captureFromUrl: function() {
            const rfsn = utils.getUrlParameter('rfsn');
            
            if (rfsn) {
                const trackingData = {
                    rfsn: rfsn,
                    affiliateId: rfsn,
                    timestamp: new Date().toISOString(),
                    sourceUrl: window.location.href
                };
                
                // Store in BOTH localStorage and cookies for redundancy
                
                // 1. Store in localStorage
                try {
                    localStorage.setItem(this.storageKey, JSON.stringify(trackingData));
                    utils.log('Stored in localStorage');
                } catch (e) {
                    utils.log('localStorage not available', e);
                }
                
                // 2. Store in cookies (as backup)
                try {
                    utils.setCookie(this.storageKey, encodeURIComponent(JSON.stringify(trackingData)), CONFIG.cookieDays);
                    utils.log('Stored in cookies');
                } catch (e) {
                    utils.log('Cookie storage failed', e);
                }
                
                utils.log('Captured tracking data', trackingData);
                
                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('refersion:tracking:captured', {
                    detail: trackingData
                }));
                
                return trackingData;
            }
            
            return null;
        },
        
        clearTracking: function() {
            localStorage.removeItem(this.storageKey);
            utils.setCookie(this.storageKey, '', -1);
            utils.log('Tracking data cleared');
        }
    };
    
    // HubSpot form integration
    const HubSpotIntegration = {
        initialized: false,
        processedForms: new WeakSet(),
        
        init: function() {
            if (this.initialized) return;
            this.initialized = true;
            
            // Capture tracking data from URL
            RefersionTracker.captureFromUrl();
            
            // Get current tracking data
            const trackingData = RefersionTracker.getCurrentData();
            
            if (trackingData) {
                utils.log('Active tracking data found', trackingData);
                this.setupFormDetection(trackingData);
                this.interceptHubSpotAPI(trackingData);
            } else {
                utils.log('No tracking data available');
            }
        },
        
        setupFormDetection: function(trackingData) {
            // Method 1: Listen for HubSpot form events
            window.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormReady') {
                    utils.log('HubSpot form ready event detected');
                    setTimeout(() => {
                        this.findAndPopulateForms(trackingData);
                    }, 100);
                }
            });
            
            // Method 2: Watch for DOM changes (handles dynamically loaded forms)
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) { // Element node
                            // Check for HubSpot form containers
                            if (this.isHubSpotFormElement(node)) {
                                utils.log('HubSpot form element detected via MutationObserver');
                                setTimeout(() => {
                                    this.processFormElement(node, trackingData);
                                }, 500);
                            }
                            
                            // Also check children
                            const formElements = node.querySelectorAll ? node.querySelectorAll('.hs-form, .hs-form-frame, [id*="hsForm"], iframe[src*="forms.hsforms.com"]') : [];
                            formElements.forEach(el => {
                                if (!this.processedForms.has(el)) {
                                    this.processFormElement(el, trackingData);
                                }
                            });
                        }
                    }
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Method 3: Check for existing forms on page load
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.findAndPopulateForms(trackingData);
                });
            } else {
                this.findAndPopulateForms(trackingData);
            }
            
            // Method 4: Periodic check for new forms (fallback)
            let checkCount = 0;
            const checkInterval = setInterval(() => {
                this.findAndPopulateForms(trackingData);
                checkCount++;
                if (checkCount > 10) { // Stop after 10 seconds
                    clearInterval(checkInterval);
                }
            }, 1000);
        },
        
        interceptHubSpotAPI: function(trackingData) {
            // Intercept hbspt.forms.create if it exists
            if (window.hbspt && window.hbspt.forms && window.hbspt.forms.create) {
                const originalCreate = window.hbspt.forms.create;
                window.hbspt.forms.create = function(options) {
                    utils.log('Intercepting hbspt.forms.create', options);
                    
                    // Add our callback to onFormReady
                    const originalOnFormReady = options.onFormReady;
                    options.onFormReady = function($form) {
                        utils.log('Form ready via intercepted create');
                        
                        // Populate our fields
                        if (trackingData) {
                            const fields = [
                                { name: CONFIG.fieldMapping.affiliateId, value: trackingData.rfsn },
                                { name: CONFIG.fieldMapping.timestamp, value: trackingData.timestamp },
                                { name: CONFIG.fieldMapping.sourceUrl, value: trackingData.sourceUrl }
                            ];
                            
                            fields.forEach(field => {
                                const $input = $form.find(`input[name="${field.name}"]`);
                                if ($input.length) {
                                    $input.val(field.value).trigger('change');
                                    utils.log(`Set ${field.name} to ${field.value}`);
                                } else {
                                    // Try to add as hidden field if not present
                                    const hiddenInput = `<input type="hidden" name="${field.name}" value="${field.value}" />`;
                                    $form.append(hiddenInput);
                                    utils.log(`Added hidden field ${field.name}`);
                                }
                            });
                        }
                        
                        // Call original callback if exists
                        if (originalOnFormReady) {
                            originalOnFormReady.call(this, $form);
                        }
                    };
                    
                    // Call original create
                    return originalCreate.call(this, options);
                };
            }
        },
        
        isHubSpotFormElement: function(element) {
            if (!element || !element.tagName) return false;
            
            // Check various indicators
            const indicators = [
                element.classList && (
                    element.classList.contains('hs-form') ||
                    element.classList.contains('hs-form-frame') ||
                    element.classList.contains('hbspt-form')
                ),
                element.id && element.id.includes('hsForm'),
                element.tagName === 'IFRAME' && element.src && element.src.includes('forms.hsforms.com'),
                element.dataset && (element.dataset.formId || element.dataset.portalId),
                element.querySelector && element.querySelector('.hs-form, form[data-form-id]')
            ];
            
            return indicators.some(indicator => indicator);
        },
        
        findAndPopulateForms: function(trackingData) {
            // Find all possible form containers
            const selectors = [
                '.hs-form',
                '.hs-form-frame',
                '[data-form-id]',
                '[id*="hsForm"]',
                'iframe[src*="forms.hsforms.com"]',
                'form[action*="hsforms.com"]',
                '.hbspt-form'
            ];
            
            const forms = document.querySelectorAll(selectors.join(', '));
            
            forms.forEach(form => {
                if (!this.processedForms.has(form)) {
                    this.processFormElement(form, trackingData);
                }
            });
        },
        
        processFormElement: function(element, trackingData) {
            if (this.processedForms.has(element)) return;
            this.processedForms.add(element);
            
            utils.log('Processing form element', element);
            
            // Handle iframe forms
            if (element.tagName === 'IFRAME') {
                this.handleIframeForm(element, trackingData);
            } else {
                // Handle direct forms
                this.populateFormFields(element, trackingData);
            }
        },
        
        handleIframeForm: function(iframe, trackingData) {
            utils.log('Handling iframe form');
            
            // Try to access iframe content (same-origin only)
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc) {
                    // Wait for iframe to load
                    if (iframeDoc.readyState === 'complete') {
                        this.populateFormFields(iframeDoc.body, trackingData);
                    } else {
                        iframe.onload = () => {
                            this.populateFormFields(iframeDoc.body, trackingData);
                        };
                    }
                }
            } catch (e) {
                utils.log('Cannot access iframe content (cross-origin)', e);
                // For cross-origin iframes, we rely on postMessage
            }
        },
        
        populateFormFields: function(container, trackingData) {
            if (!container || !trackingData) return;
            
            const fields = [
                { name: CONFIG.fieldMapping.affiliateId, value: trackingData.rfsn },
                { name: CONFIG.fieldMapping.timestamp, value: trackingData.timestamp },
                { name: CONFIG.fieldMapping.sourceUrl, value: trackingData.sourceUrl }
            ];
            
            fields.forEach(field => {
                // Try multiple selectors including HubSpot's prefixed names
                const selectors = [
                    `input[name="${field.name}"]`,
                    `input[name$="/${field.name}"]`, // Matches "0-1/refersionid"
                    `input[name*="${field.name}"]`,
                    `input[id="${field.name}"]`,
                    `input[id*="${field.name}"]`,
                    `textarea[name="${field.name}"]`,
                    `textarea[name$="/${field.name}"]`,
                    `select[name="${field.name}"]`,
                    `select[name$="/${field.name}"]`
                ];
                
                let fieldElement = null;
                for (const selector of selectors) {
                    fieldElement = container.querySelector(selector);
                    if (fieldElement) break;
                }
                
                if (fieldElement) {
                    // Set value
                    fieldElement.value = field.value;
                    
                    // For hidden fields, also set the value attribute
                    if (fieldElement.type === 'hidden') {
                        fieldElement.setAttribute('value', field.value);
                    }
                    
                    // Trigger multiple events to ensure HubSpot registers the change
                    fieldElement.dispatchEvent(new Event('change', { bubbles: true }));
                    fieldElement.dispatchEvent(new Event('input', { bubbles: true }));
                    fieldElement.dispatchEvent(new Event('blur', { bubbles: true }));
                    
                    utils.log(`Populated ${field.name} with ${field.value} (found as ${fieldElement.name})`);
                } else {
                    utils.log(`Field ${field.name} not found in form`);
                }
            });
        }
    };
    
    // Public API
    window.RefersionHubSpot = {
        init: () => HubSpotIntegration.init(),
        getTrackingData: () => RefersionTracker.getCurrentData(),
        clearTracking: () => RefersionTracker.clearTracking(),
        populateForm: (formElement) => {
            const data = RefersionTracker.getCurrentData();
            if (data && formElement) {
                HubSpotIntegration.populateFormFields(formElement, data);
            }
        },
        getDebugInfo: () => ({
            trackingData: RefersionTracker.getCurrentData(),
            config: CONFIG,
            processedForms: HubSpotIntegration.processedForms.size
        })
    };
    
    // Auto-initialize
    HubSpotIntegration.init();
    
    utils.log('Refersion-HubSpot Integration v2 loaded and initialized');
})();