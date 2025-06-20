/**
 * Debug Endpoint for Conversion Tracking Visibility
 * 
 * Purpose:
 * This endpoint provides a way to debug conversion tracking issues without
 * needing a full database. It returns helpful information about where to
 * look for conversion data and common troubleshooting steps.
 * 
 * Usage:
 * GET /api/conversion-debug?key=YOUR_DEBUG_KEY
 * 
 * Security:
 * Protected by DEBUG_KEY environment variable. In production, you should
 * implement proper authentication (e.g., admin user check).
 * 
 * Why this exists:
 * Since we don't store conversions in our own database (Segment and Refersion
 * handle that), this endpoint helps developers quickly understand where to
 * look when debugging attribution issues.
 * 
 * @param {Request} req - Incoming request with debug key in query params
 * @returns {Response} JSON response with debugging instructions
 */

export const runtime = 'edge';

export default async function handler(req) {
  // Extract debug key from URL query parameters
  // Example: /api/conversion-debug?key=your-secret-debug-key
  const url = new URL(req.url);
  const debugKey = url.searchParams.get('key');
  
  // Simple authentication - in production, consider using:
  // - Admin user session check
  // - IP allowlist
  // - More secure authentication method
  if (!debugKey || debugKey !== process.env.DEBUG_KEY) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }), 
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  // Return debugging information and instructions
  // Note: Since we don't store conversions locally (they're in Segment/Refersion),
  // this endpoint provides guidance on where to find the data for debugging
  return new Response(
    JSON.stringify({
      message: 'Conversion debugging guide',
      
      // Step-by-step debugging instructions
      instructions: {
        1: 'Check Vercel function logs for [Conversion Log] entries',
        2: 'Use Segment Debugger to see raw events',
        3: 'Check Refersion dashboard for successful conversions',
        4: 'Common issues: missing affiliateId, email mismatch, duplicate order IDs'
      },
      
      // Direct links to debugging tools (update these with your actual URLs)
      quickChecks: {
        segmentDebugger: 'https://app.segment.com/debugger',
        vercelLogs: 'https://vercel.com/your-team/your-project/logs',
        refersionDashboard: 'https://app.refersion.com/conversions'
      },
      
      // Common attribution failure scenarios and solutions
      commonIssues: {
        noAffiliate: {
          description: 'Order completed but no affiliate ID found',
          checkPoints: [
            'Was rfsn parameter in original landing URL?',
            'Is localStorage preserving rfsn value?',
            'Is Segment identify() called with refersionId trait?'
          ]
        },
        mismatchedEmail: {
          description: 'Email on order doesn\'t match HubSpot contact',
          solution: 'Ensure consistent email usage across forms and checkout'
        },
        duplicateOrderId: {
          description: 'Refersion rejecting duplicate order IDs',
          solution: 'Ensure unique order IDs for each transaction'
        }
      },
      
      // Helpful test command
      testCommand: 'npm run test-webhook',
      
      // Timestamp for debugging
      debuggedAt: new Date().toISOString()
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}