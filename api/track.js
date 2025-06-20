/**
 * Server-Side Tracking Backup Endpoint
 * 
 * Purpose:
 * This endpoint serves as a backup tracking mechanism for scenarios where
 * client-side tracking might fail (ad blockers, JavaScript disabled, etc.).
 * Currently, it's a simple logging endpoint that could be extended to
 * provide more robust server-side tracking.
 * 
 * Use Cases:
 * 1. Backup when localStorage is blocked
 * 2. Server-side cookie setting (future)
 * 3. Direct server-to-server tracking
 * 4. Tracking for users with strict privacy settings
 * 
 * Current Implementation:
 * - Receives tracking data via POST
 * - Logs to Vercel Functions logs
 * - Returns success response
 * 
 * Future Enhancements:
 * - Store in Vercel KV for persistence
 * - Set HTTP-only cookies for better security
 * - Forward to analytics services server-side
 * - Implement rate limiting
 * 
 * Usage:
 * POST /api/track
 * Body: { rfsn: "ABC123", timestamp: "2024-01-01T00:00:00Z", page: "landing" }
 * 
 * @param {Request} request - POST request with tracking data
 * @returns {Response} Success/error response
 */

export const runtime = 'edge';

export default async function handler(request) {
  // CORS headers to allow cross-origin requests from TheLoopWay/LoopBioLabs
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests for CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only accept POST requests with tracking data
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    // Parse the tracking data from request body
    const data = await request.json();
    
    // Log the tracking data for debugging and analytics
    // In Vercel, these logs are accessible in the Functions tab
    console.log('[Server Track] Received:', {
      rfsn: data.rfsn,
      timestamp: data.timestamp || new Date().toISOString(),
      page: data.page,
      referrer: data.referrer,
      // Don't log sensitive data
    });
    
    // TODO: Future implementations could include:
    // 1. Store in Vercel KV: await kv.set(`track:${data.rfsn}`, data)
    // 2. Set secure cookie: Set-Cookie: rfsn=${data.rfsn}; HttpOnly; Secure; SameSite=Strict
    // 3. Forward to Segment: await analytics.track({...})
    // 4. Rate limiting: Check IP-based rate limits
    
    // Return success response
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Tracking data received',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    // Log errors for debugging
    console.error('[Server Track] Error:', error);
    
    // Return error response
    return new Response(JSON.stringify({ 
      error: 'Invalid request',
      message: 'Tracking data must be valid JSON'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}