/**
 * Segment to Refersion Webhook Handler
 * 
 * Purpose:
 * This is the critical integration point between Segment analytics and Refersion
 * affiliate tracking. It receives "Order Completed" events from Segment and
 * creates conversions in Refersion to ensure affiliates get credited.
 * 
 * Flow:
 * 1. LoopBioLabs.com → Segment track('Order Completed')
 * 2. Segment → POST to this webhook
 * 3. This webhook → Refersion API (create conversion)
 * 4. Affiliate gets credited in Refersion
 * 
 * Configuration:
 * - Set up in Segment as a webhook destination
 * - URL: https://forms.theloopway.com/api/segment-to-refersion
 * - Requires REFERSION_API_KEY environment variable
 * 
 * Testing:
 * Use `npm run test-webhook` to simulate an order event
 * 
 * @param {Request} req - Segment webhook POST with order data
 * @param {Response} res - Success/failure response to Segment
 */

// Use Edge Runtime for better performance and reliability
export const runtime = 'edge';

// For Node.js environment (dev) - Vercel automatically uses the Edge version in production
export default async function handler(req, res) {
  // CORS headers allow Segment to send events from their servers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Signature');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests from Segment
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the Segment event data
    // Vercel automatically parses JSON bodies
    const body = req.body;
    
    // Handle both direct events and wrapped events (Segment webhooks wrap in "event")
    const data = body.event || body;
    
    // Log for debugging (visible in Vercel Functions logs)
    console.log(`[Segment Webhook] Received event: ${data.type} - ${data.event}`);

    // Only process "Order Completed" events - all other events are ignored
    // This is the standard Segment e-commerce event name
    if (data.type === 'track' && data.event === 'Order Completed') {
      const { properties = {}, context = {} } = data;
      
      // Try to find affiliate ID from multiple possible locations
      // Segment events can have the affiliate ID in different places depending
      // on how the tracking was implemented
      const affiliateId = 
        properties.affiliateId ||      // Direct property
        properties.refersionId ||      // Alternative property name
        context.traits?.refersionId || // User trait (from identify call)
        properties.rfsn ||             // Short form
        context.traits?.rfsn;          // User trait (short form)
      
      // If no affiliate ID found, this is a non-affiliate order
      // We return success (200) because the webhook processed correctly
      if (!affiliateId) {
        console.log('[Segment Webhook] No affiliate ID found for order:', properties.orderId);
        return res.status(200).json({ 
          success: true, 
          message: 'No affiliate to track',
          orderId: properties.orderId
        });
      }

      console.log(`[Segment Webhook] Processing order ${properties.orderId} for affiliate ${affiliateId}`);

      // Check if we have Refersion API key
      if (!process.env.REFERSION_API_KEY) {
        console.log('[Segment Webhook] REFERSION_API_KEY not set - skipping API call');
        return res.status(200).json({ 
          success: true,
          message: 'Conversion would be tracked (API key not set)',
          orderId: properties.orderId,
          affiliateId: affiliateId,
          note: 'Add REFERSION_API_KEY environment variable to enable actual tracking'
        });
      }

      // Prepare Refersion API payload
      const refersionPayload = {
        affiliate_code: affiliateId,
        commission: parseFloat(properties.total || properties.revenue || 0),
        currency_code: properties.currency || 'USD',
        order_id: properties.orderId,
        customer: {
          customer_id: data.userId || properties.email,
          email: properties.email || context.traits?.email,
          first_name: properties.firstName || context.traits?.firstName || '',
          last_name: properties.lastName || context.traits?.lastName || '',
          ip_address: context.ip || null
        },
        cart_items: (properties.products || []).map(product => ({
          sku: product.sku || product.productId || 'PRODUCT',
          name: product.name || 'Product',
          quantity: parseInt(product.quantity || 1),
          price: parseFloat(product.price || 0),
          product_id: product.productId || product.sku || 'PRODUCT'
        }))
      };

      console.log('[Segment Webhook] Sending to Refersion:', JSON.stringify(refersionPayload));

      // Call Refersion API
      try {
        const refersionResponse = await fetch('https://api.refersion.com/v2/manual_credit', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.REFERSION_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(refersionPayload)
        });

        const refersionResult = await refersionResponse.json();

        if (refersionResponse.ok) {
          console.log('[Segment Webhook] Refersion conversion created:', refersionResult);
          return res.status(200).json({ 
            success: true,
            message: 'Conversion tracked successfully',
            orderId: properties.orderId,
            affiliateId: affiliateId,
            refersionResponse: refersionResult
          });
        } else {
          // Refersion API returned an error
          console.error('[Segment Webhook] Refersion API error:', refersionResult);
          
          // Still return 200 to Segment to prevent retries for business logic errors
          // (e.g., duplicate order ID, invalid affiliate code)
          return res.status(200).json({ 
            success: false,
            message: 'Refersion API error',
            orderId: properties.orderId,
            affiliateId: affiliateId,
            error: refersionResult.error || refersionResult.message || 'Unknown error',
            details: refersionResult
          });
        }
      } catch (apiError) {
        // Network or parsing error - this should trigger a retry
        console.error('[Segment Webhook] Refersion API call failed:', apiError);
        throw apiError; // Re-throw to trigger 500 response and Segment retry
      }
    }

    // Not an Order Completed event - acknowledge receipt but don't process
    // Segment may send other events to this webhook (page views, etc.)
    // We return 200 to prevent Segment from retrying
    return res.status(200).json({ 
      success: true, 
      message: 'Event acknowledged but not processed',
      type: data.type,
      event: data.event
    });

  } catch (error) {
    // Log errors for debugging
    console.error('[Segment Webhook] Error:', error);
    
    // Return 500 to trigger Segment retry logic
    // Segment will retry failed webhooks with exponential backoff
    return res.status(500).json({ 
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
}