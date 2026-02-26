/**
 * Core Module Index
 * Exports all core utilities
 */

// Logger
export { default as logger, createLogger, Logger, LOG_LEVELS } from './logger.js';

// Error Handling
export { 
    default as errorHandler, 
    AppError, 
    ValidationError, 
    AuthenticationError, 
    AuthorizationError, 
    NotFoundError, 
    RateLimitError, 
    APIError 
} from './errorHandler.js';

// Validation
export { 
    sanitizeHTML, 
    sanitizeString, 
    validateEmail, 
    validatePassword, 
    validatePhone,
    validateURL,
    required, 
    minLength, 
    maxLength, 
    range,
    confirm,
    pattern,
    Validator, 
    createFormValidator,
    validateAPIKey,
    debounce,
    throttle 
} from './validation.js';

// Notifications
export { 
    default as toast, 
    Toast, 
    ToastContainer, 
    ToastManager, 
    ToastType 
} from './notifications.js';

// Storage
export { 
    default as storage, 
    SecureStorage, 
    SessionStorage,
    storage as defaultStorage,
    session,
    STORAGE_KEYS 
} from './storage.js';

// Subscription Management
export { 
    default as subscriptionManager, 
    SubscriptionManager 
} from './subscription.js';
