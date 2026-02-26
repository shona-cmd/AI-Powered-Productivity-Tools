/**
 * Keyboard Shortcuts Module
 * Provides keyboard navigation and shortcuts for power users
 */

import { createLogger } from '../core/logger.js';

const logger = createLogger('Keyboard');

/**
 * Default keyboard shortcuts
 */
const DEFAULT_SHORTCUTS = {
    // Navigation
    '?': { action: 'showHelp', description: 'Show keyboard shortcuts' },
    'g h': { action: 'goHome', description: 'Go to home' },
    'g t': { action: 'goTools', description: 'Go to tools' },
    'g p': { action: 'goPricing', description: 'Go to pricing' },
    'g d': { action: 'goDashboard', description: 'Go to dashboard' },
    'Escape': { action: 'closeModal', description: 'Close modal' },
    
    // Actions
    '/': { action: 'focusSearch', description: 'Focus search' },
    'n': { action: 'newTask', description: 'New task' },
    's': { action: 'save', description: 'Save' },
    'c': { action: 'copy', description: 'Copy' },
    't': { action: 'toggleTheme', description: 'Toggle theme' },
    
    // Auth
    'l': { action: 'openLogin', description: 'Open login' },
    'r': { action: 'openRegister', description: 'Open register' },
    
    // Tools
    '1': { action: 'openTool', params: 'writing', description: 'Open Writing Assistant' },
    '2': { action: 'openTool', params: 'tasks', description: 'Open Task Manager' },
    '3': { action: 'openTool', params: 'business', description: 'Open Business Toolkit' },
    '4': { action: 'openTool', params: 'student', description: 'Open Student Tool' },
    '5': { action: 'openTool', params: 'code', description: 'Open Code Editor' },
    '6': { action: 'openTool', params: 'chat', description: 'Open AI Chat' },
    '7': { action: 'openTool', params: 'image', description: 'Open Image Generator' },
    '8': { action: 'openTool', params: 'translate', description: 'Open Translator' },
    '9': { action: 'openTool', params: 'seo', description: 'Open SEO Optimizer' },
    '0': { action: 'openTool', params: 'research', description: 'Open Research Tool' }
};

/**
 * Keyboard Manager class
 */
class KeyboardManager {
    constructor() {
        this.shortcuts = { ...DEFAULT_SHORTCUTS };
        this.enabled = true;
        this.sequence = [];
        this.sequenceTimeout = null;
        this.sequenceDelay = 500;
        this.listeners = new Map();
    }

    /**
     * Initialize keyboard manager
     */
    init() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Don't capture in input fields
        document.addEventListener('keydown', (e) => {
            const tag = e.target.tagName.toLowerCase();
            const isInput = ['input', 'textarea', 'select'].includes(tag);
            
            if (isInput && e.key !== 'Escape') {
                return;
            }
        });

        logger.info('Keyboard shortcuts initialized');
    }

    /**
     * Handle keydown events
     */
    handleKeyDown(event) {
        if (!this.enabled) return;
        
        // Don't capture when typing in inputs (except for specific keys)
        const tag = event.target.tagName.toLowerCase();
        const isInput = ['input', 'textarea', 'select'].includes(tag);
        
        // Allow Escape in inputs
        if (isInput && event.key !== 'Escape') return;
        
        // Build key sequence
        const key = event.key.toLowerCase();
        
        // Clear sequence timeout
        if (this.sequenceTimeout) {
            clearTimeout(this.sequenceTimeout);
        }
        
        // Add to sequence
        this.sequence.push(key);
        
        // Set timeout to clear sequence
        this.sequenceTimeout = setTimeout(() => {
            this.sequence = [];
        }, this.sequenceDelay);
        
        // Check for matching shortcut
        const sequenceStr = this.sequence.join(' ');
        
        // Check direct match
        let shortcut = this.shortcuts[sequenceStr];
        
        // Also check single key
        if (!shortcut && this.sequence.length === 1) {
            shortcut = this.shortcuts[key];
        }
        
        if (shortcut) {
            event.preventDefault();
            this.execute(shortcut, event);
            
            // Clear sequence after execution
            this.sequence = [];
        }
    }

    /**
     * Execute shortcut action
     */
    execute(shortcut, event) {
        const { action, params } = shortcut;
        
        logger.debug('Executing shortcut', { action, params });
        
        // Emit event
        this.emit(action, { params, event });
        
        // Execute built-in actions
        switch (action) {
            case 'showHelp':
                this.showHelp();
                break;
            case 'goHome':
                this.scrollTo('home');
                break;
            case 'goTools':
                this.scrollTo('tools');
                break;
            case 'goPricing':
                this.scrollTo('pricing');
                break;
            case 'goDashboard':
                this.openDashboard();
                break;
            case 'closeModal':
                this.closeCurrentModal();
                break;
            case 'focusSearch':
                this.focusSearch();
                break;
            case 'newTask':
                this.newTask();
                break;
            case 'save':
                this.save();
                break;
            case 'copy':
                this.copy();
                break;
            case 'toggleTheme':
                this.toggleTheme();
                break;
            case 'openLogin':
                this.openAuth('login');
                break;
            case 'openRegister':
                this.openAuth('register');
                break;
            case 'openTool':
                this.openTool(params);
                break;
        }
    }

    /**
     * Show help modal
     */
    showHelp() {
        const existing = document.getElementById('keyboardHelpModal');
        if (existing) {
            existing.remove();
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'keyboardHelpModal';
        modal.className = 'modal active';
        
        const shortcutsHtml = Object.entries(this.shortcuts)
            .filter(([_, s]) => s.description)
            .map(([key, shortcut]) => `
                <div class="shortcut-item">
                    <kbd>${key.replace(' ', ' + ')}</kbd>
                    <span>${shortcut.description}</span>
                </div>
            `).join('');

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <span class="close-btn" onclick="this.closest('.modal').remove()">×</span>
                <h2>⌨️ Keyboard Shortcuts</h2>
                <div class="shortcuts-grid">
                    ${shortcutsHtml}
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .shortcuts-grid {
                display: grid;
                gap: 0.75rem;
                margin-top: 1.5rem;
            }
            .shortcut-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem;
                background: var(--bg-secondary, #f9fafb);
                border-radius: 8px;
            }
            kbd {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 0.25rem 0.5rem;
                font-family: monospace;
                font-size: 0.875rem;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }
            .shortcut-item span {
                color: var(--text-secondary, #6b7280);
                font-size: 0.9rem;
            }
        `;
        modal.querySelector('.modal-content').appendChild(style);

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    /**
     * Scroll to section
     */
    scrollTo(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Open dashboard
     */
    openDashboard() {
        if (typeof transactionSystem?.showDashboard === 'function') {
            transactionSystem.showDashboard();
        }
    }

    /**
     * Close current modal
     */
    closeCurrentModal() {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            const closeBtn = activeModal.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.click();
            } else {
                activeModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    }

    /**
     * Focus search
     */
    focusSearch() {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search"]');
        if (searchInput) {
            searchInput.focus();
        }
    }

    /**
     * New task
     */
    newTask() {
        const taskInput = document.getElementById('newTask');
        if (taskInput) {
            this.openTool('tasks');
            setTimeout(() => taskInput.focus(), 100);
        }
    }

    /**
     * Save action
     */
    save() {
        // Trigger save functionality if available
        window.dispatchEvent(new CustomEvent('keyboard:save'));
    }

    /**
     * Copy action
     */
    copy() {
        const selected = window.getSelection().toString();
        if (selected) {
            navigator.clipboard.writeText(selected);
        }
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        if (typeof toggleTheme === 'function') {
            toggleTheme();
        }
    }

    /**
     * Open auth modal
     */
    openAuth(type) {
        if (typeof authSystem?.openAuthModal === 'function') {
            authSystem.openAuthModal(type);
        }
    }

    /**
     * Open tool
     */
    openTool(toolName) {
        if (typeof openTool === 'function') {
            openTool(toolName);
        }
    }

    /**
     * Add custom shortcut
     */
    addShortcut(keys, action, description = '') {
        this.shortcuts[keys.toLowerCase()] = { action, description };
        logger.debug('Shortcut added', { keys, action });
    }

    /**
     * Remove shortcut
     */
    removeShortcut(keys) {
        delete this.shortcuts[keys.toLowerCase()];
        logger.debug('Shortcut removed', { keys });
    }

    /**
     * Enable/disable shortcuts
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        logger.info('Keyboard shortcuts', { enabled });
    }

    /**
     * Add event listener
     */
    on(action, callback) {
        if (!this.listeners.has(action)) {
            this.listeners.set(action, []);
        }
        this.listeners.get(action).push(callback);
    }

    /**
     * Remove event listener
     */
    off(action, callback) {
        const callbacks = this.listeners.get(action);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit event
     */
    emit(action, data) {
        const callbacks = this.listeners.get(action);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }
}

// Export singleton
const keyboard = new KeyboardManager();
export default keyboard;
export { KeyboardManager };
