/**
 * Debug endpoint for viewing recent conversion attempts
 * Provides visibility into attribution without needing a database
 */

export const runtime = 'edge';

export default async function handler(req) {
  // Simple auth check - replace with your preferred method
  const url = new URL(req.url);
  const debugKey = url.searchParams.get('key');
  
  if (!debugKey || debugKey !== process.env.DEBUG_KEY) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }), 
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  // For now, return instructions since we'd need shared state
  // In production, you'd use Vercel KV or similar
  return new Response(
    JSON.stringify({
      message: 'Conversion debugging',
      instructions: {
        1: 'Check Vercel function logs for [Conversion Log] entries',
        2: 'Use Segment Debugger to see raw events',
        3: 'Check Refersion dashboard for successful conversions',
        4: 'Common issues: missing affiliateId, email mismatch, duplicate order IDs'
      },
      quickChecks: {
        segmentDebugger: 'https://app.segment.com/debugger',
        vercelLogs: 'https://vercel.com/your-team/your-project/logs',
        refersionDashboard: 'https://app.refersion.com/conversions'
      },
      testCommand: 'npm run test-webhook'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}