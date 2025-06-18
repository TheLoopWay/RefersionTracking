/**
 * Segment Analytics Integration for Forms
 * Complements the existing Refersion tracking
 */

// Initialize Segment for forms.theloopway.com
(function() {
  // Only initialize if not already loaded
  if (window.analytics && window.analytics.initialized) {
    console.log('[Segment] Already initialized');
    return;
  }

  // Initialize Segment with TheLoopWay write key (forms are part of TheLoopWay)
  !function(){var i="analytics",analytics=window[i]=window[i]||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","screen","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware","register"];analytics.factory=function(e){return function(){if(window[i].initialized)return window[i][e].apply(window[i],arguments);var n=Array.prototype.slice.call(arguments);if(["track","screen","alias","group","page","identify"].indexOf(e)>-1){var c=document.querySelector("link[rel='canonical']");n.push({__t:"bpc",c:c&&c.getAttribute("href")||void 0,p:location.pathname,u:location.href,s:location.search,t:document.title,r:document.referrer})}n.unshift(e);analytics.push(n);return analytics}};for(var n=0;n<analytics.methods.length;n++){var key=analytics.methods[n];analytics[key]=analytics.factory(key)}analytics.load=function(key,n){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.setAttribute("data-global-segment-analytics-key",i);t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r);analytics._loadOptions=n};analytics._writeKey="WAwgCVzGN82fhGNl8u4Ap3xjdqALerZW";;analytics.SNIPPET_VERSION="5.2.0";
  analytics.load("WAwgCVzGN82fhGNl8u4Ap3xjdqALerZW");
  }}();

  // Track page view with form context
  analytics.ready(function() {
    // Get form name from the page
    const form = document.querySelector('form');
    const formName = form?.dataset.formName || form?.id || 'unknown-form';
    
    // Track form page view
    analytics.page('Form View', {
      formName: formName,
      source: 'forms.theloopway.com',
      referrer: document.referrer,
      url: window.location.href
    });
    
    // Check for affiliate tracking
    const urlParams = new URLSearchParams(window.location.search);
    const rfsn = urlParams.get('rfsn') || localStorage.getItem('rfsn');
    
    if (rfsn) {
      analytics.track('Form View with Affiliate', {
        formName: formName,
        affiliateId: rfsn,
        source: 'forms.theloopway.com'
      });
    }
    
    console.log('[Segment] Initialized for form:', formName);
  });
})();

// Export helper for form submission tracking
window.trackFormWithSegment = function(formData, formName) {
  if (!window.analytics) {
    console.warn('[Segment] Analytics not loaded');
    return;
  }
  
  // Identify the user if we have email
  if (formData.email) {
    analytics.identify(formData.email, {
      email: formData.email,
      firstName: formData.first_name || formData.firstname,
      lastName: formData.last_name || formData.lastname,
      source: 'forms.theloopway.com',
      formSubmitted: formName
    });
  }
  
  // Track the form submission
  analytics.track('Form Submitted', {
    formName: formName,
    formId: formData.formId,
    source: 'forms.theloopway.com',
    ...formData
  });
  
  console.log('[Segment] Form submission tracked:', formName);
};