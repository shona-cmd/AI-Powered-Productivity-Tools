/**
 * Toast Notification System
 * Professional notification queue management
 */

import { createLogger } from './logger.js';
import { throttle } from './validation.js';

const logger = createLogger('Notifications');

/**
 * Toast notification types
 */
export const ToastType = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    LOADING: 'loading'
};

/**
 * Default toast configuration
 */
const DEFAULT_CONFIG = {
    duration: 4000,
    position: 'top-right',
    maxToasts: 5,
    dismissible: true,
    pauseOnHover: true
};

/**
 * Toast class
 */
class Toast {
    constructor(message, type = ToastType.INFO, config = {}) {
        this.id = Date.now() + Math.random().toString(36).substr(2, 9);
        this.message = message;
        this.type = type;
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.element = null;
        this.timeout = null;
    }

    /**
     * Create toast element
     */
    create() {
        const toast = document.createElement('div');
        toast.className = `toast toast-${this.type}`;
        toast.dataset.id = this.id;

        // Icon mapping
        const icons = {
            [ToastType.SUCCESS]: '✓',
            [ToastType.ERROR]: '✕',
            [ToastType.WARNING]: '⚠',
            [ToastType.INFO]: 'ℹ',
            [ToastType.LOADING]: '⟳'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[this.type]}</div>
            <div class="toast-content">
                <p class="toast-message">${this.escapeHTML(this.message)}</p>
            </div>
            ${this.config.dismissible ? '<button class="toast-close" aria-label="Dismiss">×</button>' : ''}
        `;

        // Event listeners
        if (this.config.dismissible) {
            toast.querySelector('.toast-close')?.addEventListener('click', () => this.remove());
        }

        if (this.config.pauseOnHover) {
            toast.addEventListener('mouseenter', () => this.pause());
            toast.addEventListener('mouseleave', () => this.resume());
        }

        this.element = toast;
        return toast;
    }

    /**
     * Escape HTML
     */
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Show toast
     */
    show() {
        if (!this.element) this.create();
        
        document.body.appendChild(this.element);
        
        // Trigger animation
        requestAnimationFrame(() => {
            this.element.classList.add('toast-visible');
        });

        // Auto dismiss
        if (this.config.duration > 0) {
            this.timeout = setTimeout(() => this.remove(), this.config.duration);
        }

        logger.debug('Toast shown', { type: this.type, message: this.message });
    }

    /**
     * Remove toast
     */
    remove() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        if (this.element) {
            this.element.classList.remove('toast-visible');
            this.element.classList.add('toast-exit');
            
            setTimeout(() => {
                this.element?.remove();
                this.element = null;
            }, 300);
        }

        logger.debug('Toast removed', { type: this.type });
    }

    /**
     * Pause auto dismiss
     */
    pause() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    /**
     * Resume auto dismiss
     */
    resume() {
        if (this.config.duration > 0) {
            this.timeout = setTimeout(() => this.remove(), this.config.duration);
        }
    }

    /**
     * Update message
     */
    updateMessage(message) {
        this.message = message;
        if (this.element) {
            const msgEl = this.element.querySelector('.toast-message');
            if (msgEl) msgEl.textContent = message;
        }
    }

    /**
     * Update loading state
     */
    setLoading(isLoading) {
        if (isLoading) {
            this.type = ToastType.LOADING;
            if (this.element) {
                this.element.classList.add('toast-loading');
            }
        }
    }
}

/**
 * Toast Container class
 */
class ToastContainer {
    constructor() {
        this.toasts = [];
        this.container = null;
        this.position = DEFAULT_CONFIG.position;
        this.maxToasts = DEFAULT_CONFIG.maxToasts;
    }

    /**
     * Initialize container
     */
    init() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.className = `toast-container toast-container-${this.position}`;
        document.body.appendChild(this.container);

        // Add styles
        this.addStyles();

        logger.info('Toast container initialized', { position: this.position });
    }

    /**
     * Add toast styles
     */
    addStyles() {
        if (document.getElementById('toast-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast-container {
                position: fixed;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                padding: 1rem;
                pointer-events: none;
                max-width: 400px;
            }

            .toast-container-top-right {
                top: 0;
                right: 0;
            }

            .toast-container-top-left {
                top: 0;
                left: 0;
            }

            .toast-container-bottom-right {
                bottom: 0;
                right: 0;
            }

            .toast-container-bottom-left {
                bottom: 0;
                left: 0;
            }

            .toast-container-top-center {
                top: 0;
                left: 50%;
                transform: translateX(-50%);
            }

            .toast-container-bottom-center {
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
            }

            .toast {
                display: flex;
                align-items: flex-start;
                gap: 0.75rem;
                padding: 1rem;
                border-radius: 12px;
                background: white;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                pointer-events: auto;
                transform: translateX(120%);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .toast-visible {
                transform: translateX(0);
                opacity: 1;
            }

            .toast-exit {
                transform: translateX(120%);
                opacity: 0;
            }

            .toast-icon {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                flex-shrink: 0;
            }

            .toast-success .toast-icon {
                background: #d1fae5;
                color: #059669;
            }

            .toast-error .toast-icon {
                background: #fee2e2;
                color: #dc2626;
            }

            .toast-warning .toast-icon {
                background: #fef3c7;
                color: #d97706;
            }

            .toast-info .toast-icon {
                background: #dbeafe;
                color: #2563eb;
            }

            .toast-loading .toast-icon {
                background: #e0e7ff;
                color: #4f46e5;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .toast-content {
                flex: 1;
                min-width: 0;
            }

            .toast-message {
                margin: 0;
                font-size: 14px;
                font-weight: 500;
                color: #1f2937;
                line-height: 1.5;
            }

            .toast-close {
                background: none;
                border: none;
                font-size: 20px;
                color: #9ca3af;
                cursor: pointer;
                padding: 0;
                line-height: 1;
                transition: color 0.2s;
            }

            .toast-close:hover {
                color: #4b5563;
            }

            /* Dark mode */
            @media (prefers-color-scheme: dark) {
                .toast {
                    background: #1f2937;
                }

                .toast-message {
                    color: #f9fafb;
                }

                .toast-close {
                    color: #9ca3af;
                }

                .toast-close:hover {
                    color: #d1d5db;
                }
            }

            /* Mobile */
            @media (max-width: 480px) {
                .toast-container {
                    left: 0.5rem;
                    right: 0.5rem;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Add toast to container
     */
    add(toast) {
        this.init();

        // Remove excess toasts
        while (this.toasts.length >= this.maxToasts) {
            const oldest = this.toasts.shift();
            oldest?.remove();
        }

        this.toasts.push(toast);
        toast.show();

        return toast;
    }

    /**
     * Remove toast from container
     */
    remove(toast) {
        const index = this.toasts.indexOf(toast);
        if (index > -1) {
            this.toasts.splice(index, 1);
        }
        toast.remove();
    }

    /**
     * Clear all toasts
     */
    clear() {
        this.toasts.forEach(toast => toast.remove());
        this.toasts = [];
    }

    /**
     * Set position
     */
    setPosition(position) {
        this.position = position;
        if (this.container) {
            this.container.className = `toast-container toast-container-${position}`;
        }
    }
}

/**
 * Toast Manager
 */
class ToastManager {
    constructor() {
        this.container = new ToastContainer();
        this.showThrottled = throttle(this.show.bind(this), 300);
    }

    /**
     * Show toast
     */
    show(message, type = ToastType.INFO, config = {}) {
        const toast = new Toast(message, type, config);
        this.container.add(toast);
        return toast;
    }

    /**
     * Show success toast
     */
    success(message, config = {}) {
        return this.show(message, ToastType.SUCCESS, config);
    }

    /**
     * Show error toast
     */
    error(message, config = {}) {
        return this.show(message, ToastType.ERROR, { ...config, duration: 6000 });
    }

    /**
     * Show warning toast
     */
    warning(message, config = {}) {
        return this.show(message, ToastType.WARNING, config);
    }

    /**
     * Show info toast
     */
    info(message, config = {}) {
        return this.show(message, ToastType.INFO, config);
    }

    /**
     * Show loading toast
     */
    loading(message, config = {}) {
        return this.show(message, ToastType.LOADING, { ...config, duration: 0 });
    }

    /**
     * Promise toast - show loading, then success/error
     */
    async promise(promise, messages = {}) {
        const loadingToast = this.loading(messages.loading || 'Loading...');
        
        try {
            const result = await promise;
            loadingToast.updateMessage(messages.success || 'Success!');
            loadingToast.type = ToastType.SUCCESS;
            setTimeout(() => loadingToast.remove(), 2000);
            return result;
        } catch (error) {
            loadingToast.updateMessage(error.message || messages.error || 'An error occurred');
            loadingToast.type = ToastType.ERROR;
            setTimeout(() => loadingToast.remove(), 4000);
            throw error;
        }
    }

    /**
     * Clear all toasts
     */
    clear() {
        this.container.clear();
    }

    /**
     * Set default position
     */
    setPosition(position) {
        this.container.setPosition(position);
    }
}

// Export singleton instance
const toast = new ToastManager();
export default toast;
export { Toast, ToastContainer, ToastManager, ToastType };
