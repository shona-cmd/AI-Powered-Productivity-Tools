/**
 * Subscription Management Module
 * Handles GitHub Marketplace subscription state and user provisioning
 */

import logger from './logger.js';
import storage from './storage.js';

class SubscriptionManager {
  constructor() {
    this.subscriptions = new Map();
    this.loadSubscriptions();
  }

  /**
   * Load existing subscriptions from storage
   */
  async loadSubscriptions() {
    try {
      const data = await storage.get('subscriptions');
      if (data) {
        this.subscriptions = new Map(Object.entries(data));
        logger.info(`Loaded ${this.subscriptions.size} subscriptions`);
      }
    } catch (error) {
      logger.error('Failed to load subscriptions:', error);
    }
  }

  /**
   * Save subscriptions to storage
   */
  async saveSubscriptions() {
    try {
      const data = Object.fromEntries(this.subscriptions);
      await storage.set('subscriptions', data);
    } catch (error) {
      logger.error('Failed to save subscriptions:', error);
    }
  }

  /**
   * Create a new subscription from GitHub Marketplace purchase
   * @param {Object} purchaseData - GitHub marketplace purchase data
   * @returns {Object} Created subscription
   */
  async createSubscription(purchaseData) {
    const { account, plan, billing_cycle, unit_count, free_trial_days, on_free_trial, next_billing_date } = purchaseData;
    
    const subscription = {
      accountId: account.id,
      accountLogin: account.login,
      accountType: account.type, // 'User' or 'Organization'
      plan: plan.name,
      planId: plan.id,
      status: on_free_trial ? 'trial' : 'active',
      tokens: this.getTokenAllocation(plan.name),
      billingCycle: billing_cycle || 'monthly',
      unitCount: unit_count || 1,
      freeTrialDays: free_trial_days || 0,
      onFreeTrial: on_free_trial || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nextBillingDate: next_billing_date,
      lastPurchaseData: purchaseData,
    };

    this.subscriptions.set(account.id, subscription);
    await this.saveSubscriptions();

    logger.info(`Subscription created for ${account.login}: ${plan.name}`);
    
    // Trigger provisioning
    await this.provisionUser(subscription);
    
    return subscription;
  }

  /**
   * Cancel a subscription
   * @param {number} accountId - GitHub account ID
   * @param {Object} purchaseData - GitHub marketplace purchase data
   * @returns {Object|null} Updated subscription or null if not found
   */
  async cancelSubscription(accountId, purchaseData) {
    const subscription = this.subscriptions.get(accountId);
    
    if (!subscription) {
      logger.warn(`No subscription found for cancellation: ${accountId}`);
      return null;
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date().toISOString();
    subscription.updatedAt = new Date().toISOString();
    subscription.accessUntil = purchaseData.next_billing_date;

    await this.saveSubscriptions();

    logger.info(`Subscription cancelled for ${subscription.accountLogin}`);
    
    // Schedule deprovisioning for end of billing period
    await this.scheduleDeprovisioning(subscription);
    
    return subscription;
  }

  /**
   * Change subscription plan
   * @param {number} accountId - GitHub account ID
   * @param {Object} newPlan - New plan details
   * @param {Object} oldPlan - Old plan details
   * @param {Object} purchaseData - GitHub marketplace purchase data
   * @returns {Object|null} Updated subscription or null if not found
   */
  async changePlan(accountId, newPlan, oldPlan, purchaseData) {
    const subscription = this.subscriptions.get(accountId);
    
    if (!subscription) {
      logger.warn(`No subscription found for plan change: ${accountId}`);
      return null;
    }

    const isUpgrade = this.isPlanUpgrade(oldPlan, newPlan);
    const oldPlanName = subscription.plan;

    subscription.plan = newPlan.name;
    subscription.planId = newPlan.id;
    subscription.tokens = this.getTokenAllocation(newPlan.name);
    subscription.updatedAt = new Date().toISOString();
    subscription.lastPurchaseData = purchaseData;

    await this.saveSubscriptions();

    logger.info(`Plan changed for ${subscription.accountLogin}: ${oldPlanName} -> ${newPlan.name}`);
    
    // Handle upgrade/downgrade logic
    if (isUpgrade) {
      await this.handleUpgrade(subscription, oldPlan, newPlan);
    } else {
      await this.handleDowngrade(subscription, oldPlan, newPlan);
    }
    
    return subscription;
  }

  /**
   * Schedule a pending plan change
   * @param {number} accountId - GitHub account ID
   * @param {Object} pendingPlan - Pending plan details
   * @param {Object} purchaseData - GitHub marketplace purchase data
   * @returns {Object|null} Updated subscription or null if not found
   */
  async schedulePendingChange(accountId, pendingPlan, purchaseData) {
    const subscription = this.subscriptions.get(accountId);
    
    if (!subscription) {
      logger.warn(`No subscription found for pending change: ${accountId}`);
      return null;
    }

    subscription.pendingPlan = pendingPlan.name;
    subscription.pendingPlanId = pendingPlan.id;
    subscription.pendingChangeDate = purchaseData.next_billing_date;
    subscription.updatedAt = new Date().toISOString();

    await this.saveSubscriptions();

    logger.info(`Pending change scheduled for ${subscription.accountLogin}: ${pendingPlan.name} on ${purchaseData.next_billing_date}`);
    
    return subscription;
  }

  /**
   * Cancel a pending plan change
   * @param {number} accountId - GitHub account ID
   * @returns {Object|null} Updated subscription or null if not found
   */
  async cancelPendingChange(accountId) {
    const subscription = this.subscriptions.get(accountId);
    
    if (!subscription) {
      logger.warn(`No subscription found for pending change cancellation: ${accountId}`);
      return null;
    }

    delete subscription.pendingPlan;
    delete subscription.pendingPlanId;
    delete subscription.pendingChangeDate;
    subscription.updatedAt = new Date().toISOString();

    await this.saveSubscriptions();

    logger.info(`Pending change cancelled for ${subscription.accountLogin}`);
    
    return subscription;
  }

  /**
   * Get subscription by account ID
   * @param {number} accountId - GitHub account ID
   * @returns {Object|undefined} Subscription object
   */
  getSubscription(accountId) {
    return this.subscriptions.get(accountId);
  }

  /**
   * Get subscription by GitHub login
   * @param {string} login - GitHub username
   * @returns {Object|undefined} Subscription object
   */
  getSubscriptionByLogin(login) {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.accountLogin === login) {
        return subscription;
      }
    }
    return undefined;
  }

  /**
   * Get all active subscriptions
   * @returns {Array} Array of active subscriptions
   */
  getActiveSubscriptions() {
    return Array.from(this.subscriptions.values()).filter(
      sub => sub.status === 'active' || sub.status === 'trial'
    );
  }

  /**
   * Check if user has active subscription
   * @param {number} accountId - GitHub account ID
   * @returns {boolean} True if has active subscription
   */
  hasActiveSubscription(accountId) {
    const subscription = this.subscriptions.get(accountId);
    return subscription && (subscription.status === 'active' || subscription.status === 'trial');
  }

  /**
   * Get remaining tokens for user
   * @param {number} accountId - GitHub account ID
   * @returns {number} Token count
   */
  getUserTokens(accountId) {
    const subscription = this.subscriptions.get(accountId);
    return subscription ? subscription.tokens : 0;
  }

  /**
   * Deduct tokens from user
   * @param {number} accountId - GitHub account ID
   * @param {number} amount - Amount to deduct
   * @returns {boolean} True if successful
   */
  async deductTokens(accountId, amount) {
    const subscription = this.subscriptions.get(accountId);
    
    if (!subscription) {
      return false;
    }

    if (subscription.tokens < amount) {
      return false;
    }

    subscription.tokens -= amount;
    subscription.updatedAt = new Date().toISOString();
    
    await this.saveSubscriptions();
    
    return true;
  }

  /**
   * Get token allocation for a plan
   * @param {string} planName - Plan name
   * @returns {number} Token allocation
   */
  getTokenAllocation(planName) {
    const planTokens = {
      'Free': 300,
      'Free Plan': 300,
      'Pro Bundle': 10000,
      'Pro': 10000,
      'Team License': 50000,
      'Team': 50000,
    };
    
    return planTokens[planName] || 300;
  }

  /**
   * Check if plan change is an upgrade
   * @param {Object} oldPlan - Old plan
   * @param {Object} newPlan - New plan
   * @returns {boolean} True if upgrade
   */
  isPlanUpgrade(oldPlan, newPlan) {
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

  /**
   * Provision user account
   * @param {Object} subscription - Subscription object
   */
  async provisionUser(subscription) {
    logger.info(`Provisioning user account for ${subscription.accountLogin}`);
    
    // TODO: Create user in auth system
    // TODO: Send welcome email
    // TODO: Initialize user preferences
    
    // For now, just log the provisioning
    logger.info(`User provisioned: ${subscription.accountLogin} with ${subscription.tokens} tokens`);
  }

  /**
   * Handle upgrade logic
   * @param {Object} subscription - Subscription object
   * @param {Object} oldPlan - Old plan
   * @param {Object} newPlan - New plan
   */
  async handleUpgrade(subscription, oldPlan, newPlan) {
    logger.info(`Processing upgrade for ${subscription.accountLogin}`);
    
    // Apply upgrade benefits immediately
    // TODO: Send upgrade confirmation email
    // TODO: Grant immediate access to new features
    
    logger.info(`Upgrade processed: ${oldPlan.name} -> ${newPlan.name}`);
  }

  /**
   * Handle downgrade logic
   * @param {Object} subscription - Subscription object
   * @param {Object} oldPlan - Old plan
   * @param {Object} newPlan - New plan
   */
  async handleDowngrade(subscription, oldPlan, newPlan) {
    logger.info(`Processing downgrade for ${subscription.accountLogin}`);
    
    // Schedule downgrade for end of billing period
    // TODO: Send downgrade notification email
    // TODO: Schedule feature restrictions
    
    logger.info(`Downgrade scheduled: ${oldPlan.name} -> ${newPlan.name}`);
  }

  /**
   * Schedule deprovisioning
   * @param {Object} subscription - Subscription object
   */
  async scheduleDeprovisioning(subscription) {
    logger.info(`Scheduling deprovisioning for ${subscription.accountLogin} on ${subscription.accessUntil}`);
    
    // TODO: Schedule account deprovisioning for end of billing period
    // TODO: Send reminder emails before deprovisioning
    
    logger.info(`Deprovisioning scheduled for ${subscription.accountLogin}`);
  }

  /**
   * Get subscription statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const all = Array.from(this.subscriptions.values());
    
    return {
      total: all.length,
      active: all.filter(s => s.status === 'active').length,
      trial: all.filter(s => s.status === 'trial').length,
      cancelled: all.filter(s => s.status === 'cancelled').length,
      byPlan: {
        free: all.filter(s => s.plan.includes('Free')).length,
        pro: all.filter(s => s.plan.includes('Pro')).length,
        team: all.filter(s => s.plan.includes('Team')).length,
      },
    };
  }
}

// Create singleton instance
const subscriptionManager = new SubscriptionManager();

export default subscriptionManager;
export { SubscriptionManager };
