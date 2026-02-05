/**
 * Health Check API for Vercel Serverless
 */
export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime()
  });
}

