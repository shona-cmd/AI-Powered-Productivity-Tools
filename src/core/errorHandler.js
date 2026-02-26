/**
 * Error Handler Module - Professional Error Management
 * Provides centralized error handling with user-friendly messages
 */

import { createLogger } from './logger.js';

const logger = createLogger('ErrorHandler');

/**
 * Custom error classes for different error types
 */
export class AppError extends Error {
    constructor(message, code, statusCode = 500, isOperational = true) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, 'VALIDATION_ERROR', 400);
        this.errors = errors;
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 'AUTH_ERROR', 401);
    }
}

export class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 'AUTHZ_ERROR', 403);
    }
}

export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 'NOT_FOUND', 404);
    }
}

export class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 'RATE_LIMIT', 429);
        this.retryAfter = 60;
    }
}

export class APIError extends AppError {
    constructor(message, provider) {
        super(message, 'API_ERROR', 502);
        this.provider = provider;
    }
}

/**
 * Error Handler Class
 */
class ErrorHandler {
    constructor() {
        this.errorQueue = [];
        this.maxQueueSize = 10;
        this.listeners = [];
    }

    /**
     * Handle error with appropriate logging and user feedback
     */
    handle(error, context = {}) {
        // Log the error
        this.logError(error, context);

        // Add to queue for analytics
        this.queueError(error, context);

        // Notify listeners
        this.notifyListeners(error, context);

        // Return user-friendly message
        return this.getUserMessage(error);
    }

    /**
     * Log error appropriately based on type
     */
    logError(error, context) {
        if (error instanceof ValidationError) {
            logger.warn('Validation Error', { message: error.message, errors: error.errors, context });
        } else if (error instanceof AuthenticationError) {
            logger.warn('Authentication Error', { message: error.message, context });
        } else if (error instanceof RateLimitError) {
            logger.warn('Rate Limit Error', { message: error.message, context });
        } else if (error instanceof AppError) {
            logger.error(error.message, error, context);
        } else {
            logger.fatal('Unexpected Error', error, context);
        }
    }

    /**
     * Get user-friendly error message
     */
    getUserMessage(error) {
        if (error instanceof ValidationError) {
            return {
                message: 'Please check your input and try again.',
                details: error.errors,
                type: 'validation'
            };
        }

        if (error instanceof AuthenticationError) {
            return {
                message: 'Please log in to continue.',
                type: 'auth'
            };
        }

        if (error instanceof AuthorizationError) {
            return {
                message: "You don't have permission to perform this action.",
                type: 'auth'
            };
        }

        if (error instanceof NotFoundError) {
            return {
                message: 'The requested resource was not found.',
                type: 'not_found'
            };
        }

        if (error instanceof RateLimitError) {
            return {
                message: 'Too many requests. Please wait a moment and try again.',
                type: 'rate_limit',
                retryAfter: error.retryAfter
            };
        }

        if (error instanceof APIError) {
            return {
                message: `Service temporarily unavailable. Please try again later.`,
                type: 'api'
            };
        }

        // Generic error message
        return {
            message: 'An unexpected error occurred. Please try again.',
            type: 'generic'
        };
    }

    /**
     * Queue error for analytics
     */
    queueError(error, context) {
        const errorData = {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString()
        };

        this.errorQueue.push(errorData);

        // Keep queue size limited
        if (this.errorQueue.length > this.maxQueueSize) {
            this.errorQueue.shift();
        }
    }

    /**
     * Add error listener
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Remove error listener
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    /**
     * Notify all listeners
     */
    notifyListeners(error, context) {
        this.listeners.forEach(callback => {
            try {
                callback(error, context);
            } catch (e) {
                logger.error('Error in error listener', e);
            }
        });
    }

    /**
     * Get error queue for debugging
     */
    getErrorQueue() {
        return [...this.errorQueue];
    }

    /**
     * Clear error queue
     */
    clearQueue() {
        this.errorQueue = [];
    }

    /**
     * Setup global error handlers
     */
    setupGlobalHandlers() {
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            const error = new Error(event.message);
            error.stack = event.error?.stack;
            this.handle(error, { type: 'uncaught', filename: event.filename, lineno: event.lineno });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            const error = event.reason instanceof Error 
                ? event.reason 
                : new Error(event.reason);
            this.handle(error, { type: 'unhandled_rejection' });
        });

        logger.info('Global error handlers initialized');
    }
}

// Export singleton instance
const errorHandler = new ErrorHandler();
export default errorHandler;
