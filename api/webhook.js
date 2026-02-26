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

  // Verify webhook signature for security
  const signature = req.headers['x-hub-signature-256'];
  const event = req.headers['x-github-event'];
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
  
  // Verify the request comes from GitHub
  if (webhookSecret && signature) {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
    
    if (signature !== digest) {
      console.log('WARNING: Invalid webhook signature!');
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }
  }
  
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

// In-memory storage for subscriptions (replace with database in production)
const subscriptions = new Map();

function handleMarketplacePurchase(body) {
  console.log('Marketplace purchase event:', body);
  
  const { action, marketplace_purchase, previous_marketplace_purchase } = body;
  
  if (!marketplace_purchase) {
    console.error('No marketplace_purchase data in webhook');
    return;
  }
  
  const account = marketplace_purchase.account;
  const plan = marketplace_purchase.plan;
  const accountId = account.id;
  const accountLogin = account.login;
  const accountType = account.type; // 'User' or 'Organization'
  
  console.log(`[MARKETPLACE] Action: ${action}`);
  console.log(`[MARKETPLACE] Account: ${accountLogin} (${accountType})`);
  console.log(`[MARKETPLACE] Plan: ${plan.name} ($${plan.monthly_price_in_cents / 100}/month)`);
  
  try {
    switch (action) {
      case 'purchased':
        handleNewPurchase(accountId, accountLogin, accountType, plan, marketplace_purchase);
        break;
      case 'cancelled':
        handleCancellation(accountId, accountLogin, plan, marketplace_purchase);
        break;
      case 'changed':
        handlePlanChange(accountId, accountLogin, plan, previous_marketplace_purchase?.plan, marketplace_purchase);
        break;
      case 'pending_change':
        handlePendingChange(accountId, accountLogin, plan, marketplace_purchase);
        break;
      case 'pending_change_cancelled':
        handlePendingChangeCancelled(accountId, accountLogin, marketplace_purchase);
        break;
      default:
        console.log(`[MARKETPLACE] Unhandled action: ${action}`);
    }
  } catch (error) {
    console.error(`[MARKETPLACE] Error handling ${action}:`, error);
    // In production, send error notification to admin
  }
}

function handleNewPurchase(accountId, accountLogin, accountType, plan, purchaseData) {
  console.log(`[MARKETPLACE] New purchase for ${accountLogin}`);
  
  // Determine token allocation based on plan
  const tokenAllocation = getTokenAllocationForPlan(plan.name);
  
  // Create subscription record
  const subscription = {
    accountId,
    accountLogin,
    accountType,
    plan: plan.name,
    planId: plan.id,
    status: 'active',
    tokens: tokenAllocation,
    billingCycle: purchaseData.billing_cycle || 'monthly',
    unitCount: purchaseData.unit_count || 1,
    freeTrialDays: purchaseData.free_trial_days || 0,
    onFreeTrial: purchaseData.on_free_trial || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nextBillingDate: purchaseData.next_billing_date,
  };
  
  // Store subscription (replace with database insert)
  subscriptions.set(accountId, subscription);
  
  console.log(`[MARKETPLACE] Subscription created for ${accountLogin}`);
  console.log(`[MARKETPLACE] Tokens allocated: ${tokenAllocation}`);
  
  // TODO: Send welcome email
  // TODO: Provision user account in auth system
  // TODO: Notify user of successful subscription
  
  return subscription;
}

function handleCancellation(accountId, accountLogin, plan, purchaseData) {
  console.log(`[MARKETPLACE] Cancellation for ${accountLogin}`);
  
  const subscription = subscriptions.get(accountId);
  if (subscription) {
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date().toISOString();
    subscription.updatedAt = new Date().toISOString();
    
    console.log(`[MARKETPLACE] Subscription cancelled for ${accountLogin}`);
    console.log(`[MARKETPLACE] Access will continue until: ${purchaseData.next_billing_date}`);
    
    // TODO: Send cancellation confirmation email
    // TODO: Schedule account deprovisioning for end of billing period
  } else {
    console.warn(`[MARKETPLACE] No active subscription found for ${accountLogin}`);
  }
}

function handlePlanChange(accountId, accountLogin, newPlan, oldPlan, purchaseData) {
  console.log(`[MARKETPLACE] Plan change for ${accountLogin}`);
  console.log(`[MARKETPLACE] From: ${oldPlan?.name || 'unknown'} To: ${newPlan.name}`);
  
  const subscription = subscriptions.get(accountId);
  if (subscription) {
    const oldPlanName = subscription.plan;
    const newTokenAllocation = getTokenAllocationForPlan(newPlan.name);
    
    subscription.plan = newPlan.name;
    subscription.planId = newPlan.id;
    subscription.tokens = newTokenAllocation;
    subscription.updatedAt = new Date().toISOString();
    
    console.log(`[MARKETPLACE] Plan updated from ${oldPlanName} to ${newPlan.name}`);
    console.log(`[MARKETPLACE] New token allocation: ${newTokenAllocation}`);
    
    // TODO: Send plan change confirmation email
    // TODO: Handle upgrade/downgrade logic (prorating, etc.)
    
    if (isUpgrade(oldPlan, newPlan)) {
      console.log(`[MARKETPLACE] Upgrade detected for ${accountLogin}`);
      // TODO: Apply upgrade benefits immediately
    } else {
      console.log(`[MARKETPLACE] Downgrade detected for ${accountLogin}`);
      // TODO: Schedule downgrade for end of billing period
    }
  } else {
    console.warn(`[MARKETPLACE] No subscription found for plan change: ${accountLogin}`);
  }
}

function handlePendingChange(accountId, accountLogin, pendingPlan, purchaseData) {
  console.log(`[MARKETPLACE] Pending change for ${accountLogin} to ${pendingPlan.name}`);
  
  const subscription = subscriptions.get(accountId);
  if (subscription) {
    subscription.pendingPlan = pendingPlan.name;
    subscription.pendingPlanId = pendingPlan.id;
    subscription.pendingChangeDate = purchaseData.next_billing_date;
    subscription.updatedAt = new Date().toISOString();
    
    console.log(`[MARKETPLACE] Pending change scheduled for ${purchaseData.next_billing_date}`);
    
    // TODO: Send pending change notification email
  }
}

function handlePendingChangeCancelled(accountId, accountLogin, purchaseData) {
  console.log(`[MARKETPLACE] Pending change cancelled for ${accountLogin}`);
  
  const subscription = subscriptions.get(accountId);
  if (subscription) {
    delete subscription.pendingPlan;
    delete subscription.pendingPlanId;
    delete subscription.pendingChangeDate;
    subscription.updatedAt = new Date().toISOString();
    
    console.log(`[MARKETPLACE] Pending change cleared for ${accountLogin}`);
    
    // TODO: Send pending change cancellation email
  }
}

function getTokenAllocationForPlan(planName) {
  const planTokens = {
    'Free': 300,
    'Free Plan': 300,
    'Pro Bundle': 10000,
    'Pro': 10000,
    'Team License': 50000,
    'Team': 50000,
  };
  
  return planTokens[planName] || 300; // Default to free tier
}

function isUpgrade(oldPlan, newPlan) {
  const planHierarchy = {
    'Free': 1,
    'Free Plan': 1,
    'Pro': 2,
    'Pro Bundle': 2,
    'Team': 3,
    'Team License': 3,
  };
  
  const oldLevel = planHierarchy[oldPlan?.name] || 1;
  const newLevel = planHierarchy[newPlan?.name] || 1;
  
  return newLevel > oldLevel;
}

// Export for testing and external use
module.exports.getSubscription = (accountId) => subscriptions.get(accountId);
module.exports.getAllSubscriptions = () => Array.from(subscriptions.values());

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
