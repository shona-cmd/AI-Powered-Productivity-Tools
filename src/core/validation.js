/**
 * Validation Module - Input Validation & Sanitization
 * Provides comprehensive input validation and sanitization
 */

import { ValidationError } from './errorHandler.js';

/**
 * Validation rules
 */
const RULES = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^(\+256|0)[7-9][0-9]{8}$/,
    username: /^[a-zA-Z0-9_]{3,20}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    url: /^https?:\/\/.+/,
    slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
};

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

/**
 * Sanitize string for safe display
 */
export function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>\"'&]/g, char => {
        const entities = {
            '<': '<',
            '>': '>',
            '"': '"',
            "'": '&#x27;',
            '&': '&amp;'
        };
        return entities[char] || char;
    });
}

/**
 * Validate email
 */
export function validateEmail(email) {
    if (!email) return 'Email is required';
    if (!RULES.email.test(email)) return 'Please enter a valid email address';
    return null;
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return null;
}

/**
 * Validate phone number (Uganda format)
 */
export function validatePhone(phone) {
    if (!phone) return null; // Phone is optional
    if (!RULES.phone.test(phone)) return 'Please enter a valid Uganda phone number';
    return null;
}

/**
 * Validate required field
 */
export function required(value, fieldName = 'Field') {
    if (value === null || value === undefined || value === '') {
        return `${fieldName} is required`;
    }
    if (Array.isArray(value) && value.length === 0) {
        return `${fieldName} is required`;
    }
    return null;
}

/**
 * Validate minimum length
 */
export function minLength(value, min, fieldName = 'Field') {
    if (value && value.length < min) {
        return `${fieldName} must be at least ${min} characters`;
    }
    return null;
}

/**
 * Validate maximum length
 */
export function maxLength(value, max, fieldName = 'Field') {
    if (value && value.length > max) {
        return `${fieldName} must be no more than ${max} characters`;
    }
    return null;
}

/**
 * Validate range
 */
export function range(value, min, max, fieldName = 'Field') {
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be a number`;
    if (num < min || num > max) {
        return `${fieldName} must be between ${min} and ${max}`;
    }
    return null;
}

/**
 * Validate URL
 */
export function validateURL(url) {
    if (!url) return 'URL is required';
    if (!RULES.url.test(url)) return 'Please enter a valid URL';
    return null;
}

/**
 * Validate against pattern
 */
export function pattern(value, regex, message) {
    if (value && !regex.test(value)) {
        return message || 'Invalid format';
    }
    return null;
}

/**
 * Validate confirm matching
 */
export function confirm(value, confirmValue, fieldName = 'Field') {
    if (value !== confirmValue) {
        return `${fieldName} does not match`;
    }
    return null;
}

/**
 * Validator class for form validation
 */
export class Validator {
    constructor() {
        this.errors = {};
    }

    /**
     * Add field validation
     */
    add(field, ...validators) {
        this.errors[field] = [];
        
        return {
            validate: (value) => {
                for (const validator of validators) {
                    const error = validator(value);
                    if (error) {
                        this.errors[field].push(error);
                        return false;
                    }
                }
                return true;
            }
        };
    }

    /**
     * Validate all fields
     */
    validate(data) {
        this.errors = {};
        let isValid = true;

        for (const [field, validators] of Object.entries(this._validators || {})) {
            this.errors[field] = [];
            const value = data[field];

            for (const validator of validators) {
                const error = validator(value);
                if (error) {
                    this.errors[field].push(error);
                    isValid = false;
                }
            }
        }

        return isValid;
    }

    /**
     * Get errors
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Get first error for field
     */
    getError(field) {
        return this.errors[field]?.[0] || null;
    }

    /**
     * Clear errors
     */
    clear() {
        this.errors = {};
    }

    /**
     * Set validators (internal)
     */
    setValidators(validators) {
        this._validators = validators;
    }
}

/**
 * Create form validator with predefined rules
 */
export function createFormValidator(fields) {
    const validator = new Validator();
    const validators = {};

    for (const [field, rules] of Object.entries(fields)) {
        const fieldValidators = [];

        for (const rule of rules) {
            if (rule.required) {
                fieldValidators.push(v => required(v, formatFieldName(field)));
            }
            if (rule.email) {
                fieldValidators.push(validateEmail);
            }
            if (rule.password) {
                fieldValidators.push(validatePassword);
            }
            if (rule.phone) {
                fieldValidators.push(validatePhone);
            }
            if (rule.minLength) {
                fieldValidators.push(v => minLength(v, rule.minLength, formatFieldName(field)));
            }
            if (rule.maxLength) {
                fieldValidators.push(v => maxLength(v, rule.maxLength, formatFieldName(field)));
            }
            if (rule.pattern) {
                fieldValidators.push(v => pattern(v, rule.pattern, rule.message));
            }
            if (rule.confirm) {
                fieldValidators.push(v => confirm(v, rule.confirmValue, formatFieldName(field)));
            }
            if (rule.custom) {
                fieldValidators.push(rule.custom);
            }
        }

        validators[field] = fieldValidators;
    }

    validator.setValidators(validators);
    return validator;
}

/**
 * Format field name for display
 */
function formatFieldName(field) {
    return field
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
}

/**
 * Validate API key format
 */
export function validateAPIKey(key, type = 'openai') {
    if (!key) return 'API key is required';
    
    const patterns = {
        openai: /^sk-[A-Za-z0-9-_]{20,}$/,
        anthropic: /^sk-ant-[A-Za-z0-9-_]{20,}$/,
        gemini: /^[A-Za-z0-9_-]{30,}$/
    };

    const pattern = patterns[type];
    if (pattern && !pattern.test(key)) {
        return `Invalid ${type} API key format`;
    }

    return null;
}

/**
 * Debounce function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export default {
    sanitizeHTML,
    sanitizeString,
    validateEmail,
    validatePassword,
    validatePhone,
    required,
    minLength,
    maxLength,
    range,
    validateURL,
    pattern,
    confirm,
    Validator,
    createFormValidator,
    validateAPIKey,
    debounce,
    throttle
};
