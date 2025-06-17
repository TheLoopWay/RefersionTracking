/**
 * LOOP Forms Embed Script
 * Usage: <script src="https://forms.theloopway.com/embed.js" data-form="peptide-inquiry"></script>
 */

(function() {
  'use strict';
  
  // Get script tag and configuration
  const script = document.currentScript;
  const formName = script.getAttribute('data-form') || 'peptide-inquiry';
  const containerId = script.getAttribute('data-container') || 'loop-form';
  const container = document.getElementById(containerId) || createContainer();
  
  // Base URL (update for production)
  const baseUrl = script.src.replace('/embed.js', '');
  
  function createContainer() {
    const div = document.createElement('div');
    div.id = 'loop-form';
    script.parentNode.insertBefore(div, script);
    return div;
  }
  
  // Create iframe
  const iframe = document.createElement('iframe');
  
  // Preserve tracking parameters
  const params = new URLSearchParams(window.location.search);
  const trackingParams = ['rfsn', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const iframeParams = new URLSearchParams();
  
  trackingParams.forEach(param => {
    const value = params.get(param);
    if (value) {
      iframeParams.set(param, value);
    }
  });
  
  // Build iframe URL
  const paramString = iframeParams.toString();
  iframe.src = `${baseUrl}/${formName}.html${paramString ? '?' + paramString : ''}`;
  
  // Style iframe
  iframe.style.width = '100%';
  iframe.style.height = '800px';
  iframe.style.border = 'none';
  iframe.style.overflow = 'hidden';
  iframe.setAttribute('scrolling', 'no');
  
  // Handle responsive height
  iframe.onload = function() {
    // Listen for height messages from iframe
    window.addEventListener('message', function(e) {
      if (e.origin === baseUrl && e.data.type === 'resize') {
        iframe.style.height = e.data.height + 'px';
      }
    });
  };
  
  // Append iframe
  container.appendChild(iframe);
  
  // Also capture tracking in parent page
  const rfsn = params.get('rfsn');
  if (rfsn) {
    // Store in parent page cookie
    document.cookie = `rfsn=${rfsn}; max-age=${30*24*60*60}; path=/; SameSite=Lax`;
    
    // Track with Refersion if available
    if (window.r && typeof window.r === 'function') {
      window.r('click', rfsn);
    }
  }
  
  // Check localStorage for existing tracking
  try {
    const storedRfsn = localStorage.getItem('rfsn');
    if (storedRfsn && !iframeParams.has('rfsn')) {
      // Add stored tracking to iframe URL
      iframe.src = iframe.src + (iframe.src.includes('?') ? '&' : '?') + 'rfsn=' + encodeURIComponent(storedRfsn);
    }
  } catch (e) {
    // localStorage might not be available
  }
})();