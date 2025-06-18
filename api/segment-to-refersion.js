/**
 * Segment Webhook → Refersion Conversion Handler
 * Receives Order Completed events from Segment and tracks with Refersion
 */

// For Node.js environment (dev)
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // req.body should already be parsed by Vercel
    const data = req.body;
    
    console.log(`[Segment Webhook] Received event: ${data.type} - ${data.event}`);

    // Only process Order Completed events
    if (data.type === 'track' && data.event === 'Order Completed') {
      const { properties = {}, context = {} } = data;
      
      // Try to find affiliate ID from multiple sources
      const affiliateId = 
        properties.affiliateId || 
        properties.refersionId ||
        context.traits?.refersionId ||
        properties.rfsn ||
        context.traits?.rfsn;
      
      if (!affiliateId) {
        console.log('[Segment Webhook] No affiliate ID found for order:', properties.orderId);
        return res.status(200).json({ 
          success: true, 
          message: 'No affiliate to track',
          orderId: properties.orderId
        });
      }

      console.log(`[Segment Webhook] Processing order ${properties.orderId} for affiliate ${affiliateId}`);

      // For now, just return success (add Refersion API call later)
      return res.status(200).json({ 
        success: true,
        message: 'Conversion would be tracked',
        orderId: properties.orderId,
        affiliateId: affiliateId,
        note: 'Add REFERSION_API_KEY environment variable to enable actual tracking'
      });
    }

    // Not an Order Completed event - acknowledge but don't process
    return res.status(200).json({ 
      success: true, 
      message: 'Event acknowledged',
      type: data.type,
      event: data.event
    });

  } catch (error) {
    console.error('[Segment Webhook] Error:', error);
    return res.status(500).json({ 
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
}

// For Edge Runtime (production)
export const runtime = 'edge';