/**
 * Send height updates to parent window
 * For iframe auto-resizing
 */

function sendHeight() {
  const height = document.body.scrollHeight;
  
  // Send to parent if we're in an iframe
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'resize',
      height: height
    }, '*');
  }
}

// Send height on load and resize
window.addEventListener('load', sendHeight);
window.addEventListener('resize', sendHeight);

// Monitor for content changes
const observer = new MutationObserver(sendHeight);
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true
});

export { sendHeight };