/**
 * Health Check API for Vercel Serverless
 */
module.exports = (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "AI-Powered-Productivity-Tools",
    timestamp: new Date().toISOString()
  });
};

