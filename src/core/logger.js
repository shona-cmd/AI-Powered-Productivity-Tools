/**
 * Logger Module - Professional Logging System
 * Provides structured logging with different log levels
 */

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4
};

class Logger {
    constructor(context = 'App') {
        this.context = context;
        this.level = this.getLogLevel();
    }

    getLogLevel() {
        const stored = localStorage.getItem('log_level');
        if (stored) return LOG_LEVELS[stored] ?? LOG_LEVELS.INFO;
        
        // Default to WARN in production, DEBUG in development
        return import.meta?.env?.DEV ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;
    }

    setLevel(level) {
        this.level = LOG_LEVELS[level] ?? LOG_LEVELS.INFO;
        localStorage.setItem('log_level', level);
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const formatted = {
            timestamp,
            level,
            context: this.context,
            message,
            ...(data && { data })
        };
        return formatted;
    }

    debug(message, data) {
        if (this.level <= LOG_LEVELS.DEBUG) {
            console.debug(`[${this.context}]`, message, data || '');
        }
    }

    info(message, data) {
        if (this.level <= LOG_LEVELS.INFO) {
            console.info(`[${this.context}]`, message, data || '');
        }
    }

    warn(message, data) {
        if (this.level <= LOG_LEVELS.WARN) {
            console.warn(`[${this.context}]`, message, data || '');
        }
    }

    error(message, error, data) {
        if (this.level <= LOG_LEVELS.ERROR) {
            const errorInfo = error instanceof Error 
                ? { name: error.name, message: error.message, stack: error.stack }
                : error;
            console.error(`[${this.context}]`, message, errorInfo, data || '');
        }
    }

    fatal(message, error, data) {
        if (this.level <= LOG_LEVELS.FATAL) {
            const errorInfo = error instanceof Error 
                ? { name: error.name, message: error.message, stack: error.stack }
                : error;
            console.error(`[${this.context}] FATAL:`, message, errorInfo, data || '');
        }
    }

    /**
     * Log API requests
     */
    logRequest(url, options, response, duration) {
        this.info('API Request', {
            url,
            method: options?.method,
            status: response?.status,
            duration: `${duration}ms`
        });
    }

    /**
     * Log user actions
     */
    logAction(action, details) {
        this.info(`User Action: ${action}`, details);
    }

    /**
     * Log performance metrics
     */
    logPerformance(metric, value) {
        this.debug(`Performance: ${metric}`, { value });
    }
}

// Export factory function
export function createLogger(context) {
    return new Logger(context);
}

// Export Logger class
export { Logger, LOG_LEVELS };

// Export default instance
export default new Logger('App');
