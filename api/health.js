/**
 * Health Check API for Vercel Serverless
 * 
 * Properly exports handler for Vercel Serverless Functions
 * with comprehensive error handling
 * 
 * @vercel { runtime: "nodejs18.x" }
 */

// Using CommonJS for Vercel serverless behavior
const crypto = require('crypto');

/**
 * Parse URL safely for Vercel serverless
 */
function parseUrl(url) {
  const result = {
    path: '/',
    query: {}
  };
  
  if (!url) {
    return result;
  }
  
  try {
    const urlObj = new URL(url);
    result.path = urlObj.pathname;
    const queryString = urlObj.search.substring(1);
    if (queryString) {
      const params = new URLSearchParams(queryString);
      for (const [key, value] of params) {
        result.query[key] = value;
      }
    }
  } catch (e) {
    try {
      const parts = url.split('?');
      result.path = parts[0] || '/';
      if (parts[1]) {
        const params = new URLSearchParams(parts[1]);
        for (const [key, value] of params) {
          result.query[key] = value;
        }
      }
    } catch (e2) {
      console.warn('URL parsing failed:', e2.message);
    }
  }
  
  return result;
}

/**
 * Main handler - Fixed: Using module.exports instead of export default
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
      console.error('Failed to send error response:', e);
    }
  }
}

// Export for Vercel Serverless (CommonJS)
module.exports = handler;

