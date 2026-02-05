/**
 * Health Check API for Vercel Serverless
 * 
 * Properly exports handler for Vercel Serverless Functions
 * with comprehensive error handling
 */

async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Only allow GET requests
    if (req.method && req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Safe health check - don't crash on any errors
    let uptime = 0;
    let nodeVersion = 'unknown';
    
    try {
      uptime = process.uptime?.() || 0;
      nodeVersion = process.version || 'unknown';
    } catch (e) {
      // Process properties might not be available in some contexts
      console.warn('Health check metrics unavailable:', e.message);
    }

    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion
    });
  } catch (error) {
    console.error('Health check error:', error);
    // Never crash - always return a response
    try {
      res.status(500).json({ 
        error: 'Health check failed',
        status: 'degraded'
      });
    } catch (e) {
      // If even error response fails, log and exit
      console.error('Failed to send error response:', e);
    }
  }
}

// Export for Vercel Serverless (ESM)
export default handler;

