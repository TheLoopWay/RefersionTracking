/**
 * Minimal Refersion Tracking Script for Squarespace Code Injection
 * This is the simplest possible script that should work in Code Injection
 */

// Capture and store affiliate ID
var rfsn = new URLSearchParams(window.location.search).get('rfsn');
if (rfsn) {
    // Store in cookie for 30 days
    document.cookie = 'rfsn=' + rfsn + '; max-age=2592000; path=/';
    
    // Also try localStorage as backup
    try {
        localStorage.setItem('rfsn', rfsn);
    } catch(e) {}
    
    // Track with Refersion if available
    if (window.r) window.r('click', rfsn);
}

// For HubSpot tracking
if (window._hsq) {
    var storedRfsn = 
        new URLSearchParams(window.location.search).get('rfsn') ||
        (document.cookie.match(/rfsn=([^;]+)/) || [])[1] ||
        localStorage.getItem('rfsn');
    
    if (storedRfsn) {
        window._hsq.push(['identify', {
            refersionid: storedRfsn
        }]);
    }
}