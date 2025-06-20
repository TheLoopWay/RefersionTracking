/**
 * Cross-Domain Tracking Sync API
 * 
 * Purpose:
 * This endpoint enables tracking synchronization between TheLoopWay.com and
 * LoopBioLabs.com by storing and retrieving affiliate IDs based on email
 * or visitor ID. This is crucial for maintaining attribution when users
 * don't click direct links between sites.
 * 
 * How it works:
 * 1. When a user submits a form on TheLoopWay with affiliate tracking
 * 2. POST to this endpoint with email + affiliate ID
 * 3. When the same user logs in on LoopBioLabs
 * 4. GET from this endpoint using their email to recover affiliate ID
 * 
 * Endpoints:
 * POST /api/sync-tracking - Store tracking data
 * GET /api/sync-tracking?email=user@example.com - Retrieve tracking data
 * 
 * Security Note:
 * In production, this should be protected with:
 * - API keys or authentication
 * - Rate limiting
 * - Data encryption for PII (email addresses)
 * 
 * Storage Note:
 * Currently uses in-memory Map (resets on deploy)
 * In production, use Vercel KV, Redis, or database
 * 
 * @param {Request} req - Request with tracking data
 * @returns {Response} Stored/retrieved tracking data
 */

export const runtime = 'edge';

// In-memory storage - replace with persistent storage in production
// Options: Vercel KV, Redis, DynamoDB, PostgreSQL
const TRACKING_DATA = new Map();

export default async function handler(req) {
  // CORS configuration for cross-domain requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  
  try {
    // POST: Store tracking data when user provides email
    if (req.method === 'POST' && url.pathname === '/api/sync-tracking') {
      const data = await req.json();
      const { email, visitorId, rfsn, source } = data;
      
      // Validate required fields
      // We need either email or visitorId as a key, and rfsn is required
      const trackingKey = email || visitorId;
      if (!trackingKey || !rfsn) {
        return new Response(JSON.stringify({ 
          error: 'Missing required fields',
          required: 'email or visitorId, and rfsn'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Store tracking information
      // In production, this would be stored in a persistent database
      TRACKING_DATA.set(trackingKey, {
        rfsn,                                    // Affiliate ID
        source: source || 'unknown',            // Which site stored this
        timestamp: new Date().toISOString(),    // When it was stored
        email,                                  // User email (if provided)
        visitorId                               // Anonymous ID (if provided)
      });
      
      console.log(`[Sync Tracking] Stored: ${trackingKey} → ${rfsn}`);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Tracking stored',
        key: trackingKey
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // GET: Retrieve tracking data when user logs in on other site
    if (req.method === 'GET' && url.pathname === '/api/sync-tracking') {
      const email = url.searchParams.get('email');
      const visitorId = url.searchParams.get('visitorId');
      
      // Need at least one identifier
      const trackingKey = email || visitorId;
      if (!trackingKey) {
        return new Response(JSON.stringify({ 
          error: 'Missing email or visitorId parameter' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Look up tracking data
      const tracking = TRACKING_DATA.get(trackingKey);
      
      if (tracking) {
        console.log(`[Sync Tracking] Retrieved: ${trackingKey} → ${tracking.rfsn}`);
      } else {
        console.log(`[Sync Tracking] Not found: ${trackingKey}`);
      }
      
      return new Response(JSON.stringify({ 
        found: !!tracking,
        tracking: tracking || null
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Unknown endpoint
    return new Response('Not found', { 
      status: 404,
      headers: corsHeaders 
    });
    
  } catch (error) {
    console.error('[Sync Tracking] Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check server logs'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}