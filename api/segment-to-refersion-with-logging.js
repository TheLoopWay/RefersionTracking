/**
 * Enhanced Segment → Refersion Webhook with In-Memory Logging
 * 
 * Purpose:
 * This is an enhanced version of the segment-to-refersion webhook that includes
 * in-memory logging of conversion attempts. This helps debug attribution issues
 * without needing a full database setup.
 * 
 * Features:
 * - Logs last 100 conversion attempts in memory
 * - Tracks success/failure status for each attempt
 * - Provides debug endpoint to view recent conversions
 * - Helps identify patterns in attribution failures
 * 
 * Usage:
 * 1. Replace segment-to-refersion.js with this file for enhanced logging
 * 2. Access debug info at: /api/conversion-debug?key=YOUR_DEBUG_KEY
 * 
 * Note:
 * In-memory storage resets on deploy. For persistent logging, consider:
 * - Vercel KV for simple key-value storage
 * - PostgreSQL for complex queries
 * - CloudWatch/Datadog for proper logging infrastructure
 * 
 * @see segment-to-refersion.js for the simpler version without logging
 */

export const runtime = 'nodejs';

// In-memory store for recent conversion attempts
// This resets when the function cold starts or redeploys
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
      const affiliateId =
        // Standard mapping from our front-end
        properties.affiliateId ||
        properties.refersionId ||
        // HubSpot style snake_case
        properties.refersion_affiliate_id ||
        properties.refersion_affiliateId ||
        // Legacy camelCase in traits
        context.traits?.refersionId ||
        context.traits?.refersion_affiliate_id ||
        // Old `refersionid` field sometimes used in HubSpot exports
        properties.refersionid ||
        // Occasionally merchants attach affiliate at line-item level (take first)
        (Array.isArray(properties.products) && properties.products.length > 0
          ? properties.products.find((p) => p.affiliateId || p.refersionId)?.affiliateId ||
            properties.products.find((p) => p.refersionId)?.refersionId || null
          : null);
      
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
      console.log('[Refersion] Using keys:', {
        hasPublic: !!process.env.REFERSION_PUBLIC_KEY,
        hasSecret: !!process.env.REFERSION_API_KEY,
        pubPrefix: process.env.REFERSION_PUBLIC_KEY ? process.env.REFERSION_PUBLIC_KEY.slice(0, 6) + '***' : 'undefined',
        secPrefix: process.env.REFERSION_API_KEY ? process.env.REFERSION_API_KEY.slice(0, 6) + '***' : 'undefined',
      });

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
      
      const refersionResponse = await fetch('https://api.refersion.com/v2/conversion', {
        method: 'POST',
        headers: {
          'Refersion-Public-Key': process.env.REFERSION_PUBLIC_KEY,
          'Refersion-Secret-Key': process.env.REFERSION_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
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