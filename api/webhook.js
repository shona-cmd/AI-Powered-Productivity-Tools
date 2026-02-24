require('dotenv').config();

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-GitHub-Event, X-Hub-Signature-256');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Verify webhook signature (optional - for production, implement secret verification)
  const signature = req.headers['x-hub-signature-256'];
  const event = req.headers['x-github-event'];
  
  console.log(`Received GitHub webhook event: ${event}`);
  
  // Handle different webhook events
  switch (event) {
    case 'marketplace_purchase':
      handleMarketplacePurchase(req.body);
      break;
    case 'issues':
      handleIssuesEvent(req.body);
      break;
    case 'pull_request':
      handlePullRequestEvent(req.body);
      break;
    case 'push':
      handlePushEvent(req.body);
      break;
    default:
      console.log(`Unhandled event: ${event}`);
  }

  // Respond to GitHub
  res.status(200).json({ received: true });
};

function handleMarketplacePurchase(body) {
  console.log('Marketplace purchase event:', body);
  // Handle new purchases, cancellations, plan changes
  const { action, marketplace_purchase } = body;
  
  if (marketplace_purchase) {
    console.log(`Marketplace action: ${action}`);
    console.log(`Account: ${marketplace_purchase.account.login}`);
    console.log(`Plan: ${marketplace_purchase.plan.name}`);
  }
}

function handleIssuesEvent(body) {
  const { action, issue, repository } = body;
  console.log(`Issue ${action}: ${issue.title} in ${repository.full_name}`);
}

function handlePullRequestEvent(body) {
  const { action, pull_request, repository } = body;
  console.log(`PR ${action}: #${pull_request.number} in ${repository.full_name}`);
}

function handlePushEvent(body) {
  const { ref, commits, repository } = body;
  console.log(`Push to ${ref} in ${repository.full_name}`);
  if (commits) {
    console.log(`Commits: ${commits.length}`);
  }
}
