/**
 * Storage Module - Secure Data Storage
 * Provides encrypted localStorage with fallback
 */

import { createLogger } from './logger.js';

const logger = createLogger('Storage');

/**
 * Storage keys enumeration
 */
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'ai_prod_auth_token',
    USER_DATA: 'ai_prod_user_data',
    USER_TOKENS: 'ai_prod_tokens',
    API_KEYS: 'ai_prod_api_keys',
    SETTINGS: 'ai_prod_settings',
    THEME: 'ai_prod_theme',
    LANGUAGE: 'ai_prod_language',
    CACHE: 'ai_prod_cache'
};

/**
 * Secure Storage class
 */
class SecureStorage {
    constructor(prefix = 'ai_prod_') {
        this.prefix = prefix;
        this.isAvailable = this.checkAvailability();
    }

    /**
     * Check if localStorage is available
     */
    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            logger.warn('localStorage not available');
            return false;
        }
    }

    /**
     * Get full key with prefix
     */
    getKey(key) {
        return `${this.prefix}${key}`;
    }

    /**
     * Set item
     */
    set(key, value) {
        if (!this.isAvailable) {
            logger.warn('Storage not available');
            return false;
        }

        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.getKey(key), serialized);
            logger.debug('Storage set', { key });
            return true;
        } catch (error) {
            logger.error('Storage set error', error, { key });
            return false;
        }
    }

    /**
     * Get item
     */
    get(key, defaultValue = null) {
        if (!this.isAvailable) {
            return defaultValue;
        }

        try {
            const item = localStorage.getItem(this.getKey(key));
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            logger.error('Storage get error', error, { key });
            return defaultValue;
        }
    }

    /**
     * Remove item
     */
    remove(key) {
        if (!this.isAvailable) return false;

        try {
            localStorage.removeItem(this.getKey(key));
            logger.debug('Storage removed', { key });
            return true;
        } catch (error) {
            logger.error('Storage remove error', error, { key });
            return false;
        }
    }

    /**
     * Clear all items with prefix
     */
    clear() {
        if (!this.isAvailable) return false;

        try {
            const keys = Object.values(STORAGE_KEYS);
            keys.forEach(key => {
                localStorage.removeItem(this.getKey(key));
            });
            
            // Also clear legacy keys
            const legacyKeys = [
                'aiProductivityAuthToken',
                'aiProductivityUser',
                'aiProductivityUsers',
                'aiProductivityTokens',
                'aiTasks',
                'codeSnippets',
                'lastCode',
                'offline_ai_responses'
            ];
            
            legacyKeys.forEach(key => {
                try {
                    localStorage.removeItem(key);
                } catch (e) {}
            });

            logger.info('Storage cleared');
            return true;
        } catch (error) {
            logger.error('Storage clear error', error);
            return false;
        }
    }

    /**
     * Get all keys
     */
    keys() {
        if (!this.isAvailable) return [];

        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(this.prefix)) {
                keys.push(key.replace(this.prefix, ''));
            }
        }
        return keys;
    }

    /**
     * Check if key exists
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Set item with expiry
     */
    setExpiring(key, value, expiryMs = 24 * 60 * 60 * 1000) {
        const data = {
            value,
            expiry: Date.now() + expiryMs
        };
        return this.set(key, data);
    }

    /**
     * Get item if not expired
     */
    getExpiring(key, defaultValue = null) {
        const data = this.get(key);
        
        if (!data || !data.expiry) {
            return defaultValue;
        }

        if (Date.now() > data.expiry) {
            this.remove(key);
            return defaultValue;
        }

        return data.value;
    }

    /**
     * Get storage usage
     */
    getUsage() {
        if (!this.isAvailable) return { used: 0, total: 0 };

        let used = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            used += key.length + value.length;
        }

        // Estimate 5MB limit
        const total = 5 * 1024 * 1024;

        return {
            used,
            total,
            percentage: ((used / total) * 100).toFixed(2)
        };
    }
}

/**
 * Session Storage class (for sensitive temp data)
 */
class SessionStorage {
    constructor(prefix = 'ai_sess_') {
        this.prefix = prefix;
    }

    getKey(key) {
        return `${this.prefix}${key}`;
    }

    set(key, value) {
        try {
            sessionStorage.setItem(this.getKey(key), JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    }

    get(key, defaultValue = null) {
        try {
            const item = sessionStorage.getItem(this.getKey(key));
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }

    remove(key) {
        try {
            sessionStorage.removeItem(this.getKey(key));
            return true;
        } catch (e) {
            return false;
        }
    }

    clear() {
        try {
            const keys = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key?.startsWith(this.prefix)) {
                    keys.push(key);
                }
            }
            keys.forEach(key => sessionStorage.removeItem(key));
            return true;
        } catch (e) {
            return false;
        }
    }
}

// Export instances
const storage = new SecureStorage();
const session = new SessionStorage();

export default storage;
export { SecureStorage, SessionStorage, storage, session };
export { STORAGE_KEYS };
