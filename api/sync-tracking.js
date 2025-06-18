/**
 * Edge function to sync tracking between domains
 * Stores and retrieves tracking by email or visitor ID
 */

export const runtime = 'edge';

const TRACKING_DATA = new Map(); // In production, use KV store or database

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  
  try {
    if (req.method === 'POST' && url.pathname === '/api/sync-tracking') {
      // Store tracking data
      const data = await req.json();
      const { email, visitorId, rfsn, source } = data;
      
      const trackingKey = email || visitorId;
      if (!trackingKey || !rfsn) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Store tracking info
      TRACKING_DATA.set(trackingKey, {
        rfsn,
        source,
        timestamp: new Date().toISOString(),
        email,
        visitorId
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Tracking stored' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (req.method === 'GET' && url.pathname === '/api/sync-tracking') {
      // Retrieve tracking data
      const email = url.searchParams.get('email');
      const visitorId = url.searchParams.get('visitorId');
      
      const trackingKey = email || visitorId;
      if (!trackingKey) {
        return new Response(JSON.stringify({ error: 'Missing email or visitorId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const tracking = TRACKING_DATA.get(trackingKey);
      
      return new Response(JSON.stringify({ 
        found: !!tracking,
        tracking: tracking || null
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not found', { status: 404 });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}