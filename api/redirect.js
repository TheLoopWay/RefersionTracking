/**
 * Cross-Domain Identity Bridge
 * Maintains user identity when moving between sites
 */

export default async function handler(req, res) {
  const { destination, rfsn, sid, uid } = req.query;
  
  if (!destination) {
    return res.status(400).json({ error: 'Missing destination' });
  }
  
  // Generate a unique bridge ID if we don't have one
  const bridgeId = uid || `bridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Store the mapping (in production, use KV store or database)
  // For now, we'll just pass everything through URL params
  
  // Build redirect URL
  const redirectUrl = new URL(destination);
  
  // Preserve all tracking parameters
  if (rfsn) redirectUrl.searchParams.set('rfsn', rfsn);
  if (sid) redirectUrl.searchParams.set('_sid', sid);
  redirectUrl.searchParams.set('_bid', bridgeId);
  
  // Set cookie on forms domain
  res.setHeader('Set-Cookie', `bridge_id=${bridgeId}; Max-Age=2592000; Path=/; HttpOnly; SameSite=Lax`);
  
  // Redirect
  res.redirect(302, redirectUrl.toString());
}