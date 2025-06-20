/**
 * Smart Redirect Endpoint for Cross-Domain Tracking
 * 
 * Purpose:
 * Since TheLoopWay.com and LoopBioLabs.com cannot directly link to each other
 * for legal reasons, this endpoint acts as an intermediary that preserves
 * tracking parameters when users need to move between sites.
 * 
 * How it works:
 * 1. User clicks a "Shop Now" button on TheLoopWay
 * 2. Instead of linking directly to LoopBioLabs, link goes to this endpoint
 * 3. This endpoint captures tracking data and redirects with parameters preserved
 * 
 * Usage:
 * <a href="/api/redirect?destination=https://loopbiolabs.com/shop">Shop Now</a>
 * 
 * Query Parameters:
 * - destination (required): The URL to redirect to
 * - rfsn (optional): Refersion affiliate ID
 * - sid (optional): Segment anonymous ID
 * - uid (optional): User ID or bridge ID
 * 
 * Example:
 * /api/redirect?destination=https://loopbiolabs.com&rfsn=ABC123&sid=segment-123
 * 
 * @param {Request} req - Request with destination and tracking params
 * @param {Response} res - Redirects to destination with tracking preserved
 */

export default async function handler(req, res) {
  // Extract parameters from query string
  const { destination, rfsn, sid, uid } = req.query;
  
  // Destination is required - we need to know where to send the user
  if (!destination) {
    return res.status(400).json({ error: 'Missing destination parameter' });
  }
  
  // Generate a unique bridge ID for this redirect
  // This helps track the same user across domains even without other IDs
  const bridgeId = uid || `bridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Note: In production with high traffic, you might want to:
  // - Store bridge mappings in Vercel KV or Redis
  // - Log redirects for analytics
  // - Validate destination domain for security
  
  // Build the final redirect URL with all tracking parameters
  const redirectUrl = new URL(destination);
  
  // Preserve all tracking parameters in the destination URL
  if (rfsn) redirectUrl.searchParams.set('rfsn', rfsn);        // Affiliate ID
  if (sid) redirectUrl.searchParams.set('_sid', sid);          // Segment ID
  redirectUrl.searchParams.set('_bid', bridgeId);              // Bridge ID
  
  // Set a cookie on the forms domain for future reference
  // This helps if the user comes back to forms.theloopway.com later
  res.setHeader('Set-Cookie', `bridge_id=${bridgeId}; Max-Age=2592000; Path=/; HttpOnly; SameSite=Lax`);
  
  // Perform the redirect
  // Using 302 (temporary) redirect to ensure tracking parameters aren't cached
  res.redirect(302, redirectUrl.toString());
}