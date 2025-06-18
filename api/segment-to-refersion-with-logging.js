/**
 * Enhanced Segment → Refersion webhook with lightweight logging
 * Logs conversion attempts for debugging without needing a database
 */

export const runtime = 'edge';

// Simple in-memory store for recent conversions (last 100)
const recentConversions = [];
const MAX_CONVERSIONS = 100;

export default async function handler(req, res) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(204).setHeader('Access-Control-Allow-Origin', '*').end();
  }
  
  try {
    const data = req.body;
    
    // Log the attempt
    const conversionAttempt = {
      timestamp: new Date().toISOString(),
      eventType: data.type,
      eventName: data.event,
      userId: data.userId,
      anonymousId: data.anonymousId,
      affiliateId: null,
      status: 'received',
      error: null
    };
    
    // Only process Order Completed events
    if (data.type === 'track' && data.event === 'Order Completed') {
      const { properties = {}, context = {} } = data;
      
      // Try to find affiliate ID from multiple sources
      const affiliateId = properties.affiliateId || 
                         properties.refersionId ||
                         context.traits?.refersionId ||
                         null;
      
      conversionAttempt.affiliateId = affiliateId;
      conversionAttempt.orderId = properties.orderId;
      conversionAttempt.total = properties.total;
      conversionAttempt.email = properties.email || context.traits?.email;
      
      if (!affiliateId) {
        conversionAttempt.status = 'no_affiliate';
        conversionAttempt.error = 'No affiliate ID found';
        logConversion(conversionAttempt);
        
        return res.json({ 
          success: false, 
          message: 'No affiliate ID found',
          searchedFields: ['properties.affiliateId', 'properties.refersionId', 'context.traits.refersionId']
        });
      }
      
      // Call Refersion API
      const refersionData = {
        order_id: properties.orderId,
        currency_code: properties.currency || 'USD',
        total: properties.total || properties.revenue || 0,
        affiliate_code: affiliateId,
        email: properties.email || context.traits?.email,
        first_name: properties.firstName || context.traits?.firstName || '',
        last_name: properties.lastName || context.traits?.lastName || '',
        customer_id: data.userId || properties.customerId || null,
        items: (properties.products || []).map(product => ({
          sku: product.sku || product.productId || 'PRODUCT',
          name: product.name || 'Product',
          price: product.price || 0,
          quantity: product.quantity || 1
        }))
      };
      
      const refersionResponse = await fetch('https://api.refersion.com/v2/conversions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REFERSION_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(refersionData)
      });
      
      const refersionResult = await refersionResponse.json();
      
      if (refersionResponse.ok) {
        conversionAttempt.status = 'success';
        conversionAttempt.refersionId = refersionResult.id;
        logConversion(conversionAttempt);
        
        console.log(`[Webhook] Success - Order: ${properties.orderId}, Affiliate: ${affiliateId}`);
        
        return res.json({ 
          success: true, 
          message: 'Conversion tracked',
          orderId: properties.orderId,
          affiliateId: affiliateId,
          refersionId: refersionResult.id
        });
      } else {
        conversionAttempt.status = 'refersion_error';
        conversionAttempt.error = refersionResult.error || 'Refersion API error';
        logConversion(conversionAttempt);
        
        console.error(`[Webhook] Refersion error:`, refersionResult);
        
        return res.status(400).json({ 
          success: false, 
          error: refersionResult 
        });
      }
    }
    
    // Not an order event
    return res.json({ 
      success: true, 
      message: 'Event received but not processed',
      reason: 'Not an Order Completed event'
    });
    
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

function logConversion(attempt) {
  // Add to in-memory store
  recentConversions.unshift(attempt);
  
  // Keep only last 100
  if (recentConversions.length > MAX_CONVERSIONS) {
    recentConversions.pop();
  }
  
  // Log to console for Vercel logs
  console.log('[Conversion Log]', JSON.stringify(attempt));
}

// Debug endpoint to view recent conversions (protect this in production!)
export async function getRecentConversions(req, res) {
  // In production, add authentication here
  const debugKey = req.headers['x-debug-key'];
  if (process.env.NODE_ENV === 'production' && debugKey !== process.env.DEBUG_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  return res.json({
    conversions: recentConversions,
    summary: {
      total: recentConversions.length,
      successful: recentConversions.filter(c => c.status === 'success').length,
      noAffiliate: recentConversions.filter(c => c.status === 'no_affiliate').length,
      errors: recentConversions.filter(c => c.status === 'refersion_error').length
    }
  });
}