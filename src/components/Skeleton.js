/**
 * Skeleton Loader Component
 * Provides loading skeleton states for better UX
 */

import { createLogger } from '../core/logger.js';

const logger = createLogger('Skeleton');

/**
 * Skeleton themes
 */
const THEMES = {
    light: {
        background: '#f3f4f6',
        highlight: '#e5e7eb'
    },
    dark: {
        background: '#374151',
        highlight: '#4b5563'
    }
};

/**
 * Get current theme
 */
function getTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark ? THEMES.dark : THEMES.light;
}

/**
 * Create skeleton element
 */
export function createSkeleton(type = 'text', options = {}) {
    const {
        width = '100%',
        height = '1em',
        rounded = '8px',
        lines = 1,
        className = ''
    } = options;

    const theme = getTheme();
    const skeletons = [];

    for (let i = 0; i < lines; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = `skeleton skeleton-${type} ${className}`;
        
        Object.assign(skeleton.style, {
            width: i === lines - 1 && lines > 1 ? '70%' : width,
            height,
            borderRadius: rounded,
            background: `linear-gradient(90deg, ${theme.background} 25%, ${theme.highlight} 50%, ${theme.background} 75%)`,
            backgroundSize: '200% 100%',
            animation: 'skeleton-shimmer 1.5s ease-in-out infinite'
        });

        skeletons.push(skeleton);
    }

    return lines === 1 ? skeletons[0] : skeletons;
}

/**
 * Create card skeleton
 */
export function createCardSkeleton(count = 1) {
    const container = document.createElement('div');
    container.className = 'skeleton-cards';
    
    for (let i = 0; i < count; i++) {
        const card = document.createElement('div');
        card.className = 'skeleton-card';
        
        card.innerHTML = `
            <div class="skeleton-card-header">
                ${createSkeleton('circle', { width: '48px', height: '48px', rounded: '50%' }).outerHTML}
                <div style="flex: 1;">
                    ${createSkeleton('text', { width: '60%', height: '20px' }).outerHTML}
                    ${createSkeleton('text', { width: '40%', height: '14px' }).outerHTML}
                </div>
            </div>
            ${createSkeleton('text', { lines: 3 }).outerHTML}
            <div class="skeleton-card-footer">
                ${createSkeleton('button', { width: '120px', height: '40px', rounded: '8px' }).outerHTML}
            </div>
        `;
        
        Object.assign(card.style, {
            padding: '1.5rem',
            borderRadius: '12px',
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        });
        
        container.appendChild(card);
    }

    return container;
}

/**
 * Create table skeleton
 */
export function createTableSkeleton(rows = 5, cols = 4) {
    const table = document.createElement('div');
    table.className = 'skeleton-table';
    
    // Header
    const header = document.createElement('div');
    header.className = 'skeleton-table-header';
    
    for (let i = 0; i < cols; i++) {
        const cell = createSkeleton('text', { width: `${100 / cols}%`, height: '16px' });
        header.appendChild(cell);
    }
    table.appendChild(header);
    
    // Rows
    for (let r = 0; r < rows; r++) {
        const row = document.createElement('div');
        row.className = 'skeleton-table-row';
        
        for (let c = 0; c < cols; c++) {
            const cell = createSkeleton('text', { width: `${100 / cols}%`, height: '14px' });
            row.appendChild(cell);
        }
        
        table.appendChild(row);
    }

    return table;
}

/**
 * Create form skeleton
 */
export function createFormSkeleton(fields = 3) {
    const form = document.createElement('div');
    form.className = 'skeleton-form';
    
    for (let i = 0; i < fields; i++) {
        const field = document.createElement('div');
        field.className = 'skeleton-form-field';
        
        field.innerHTML = `
            ${createSkeleton('text', { width: '30%', height: '14px' }).outerHTML}
            ${createSkeleton('input', { width: '100%', height: '44px' }).outerHTML}
        `;
        
        Object.assign(field.style, {
            marginBottom: '1.5rem'
        });
        
        form.appendChild(field);
    }

    return form;
}

/**
 * Create tool modal skeleton
 */
export function createToolModalSkeleton() {
    const modal = document.createElement('div');
    modal.className = 'skeleton-modal';
    
    modal.innerHTML = `
        <div class="skeleton-modal-header">
            ${createSkeleton('circle', { width: '56px', height: '56px', rounded: '50%' }).outerHTML}
            <div style="flex: 1;">
                ${createSkeleton('text', { width: '50%', height: '28px' }).outerHTML}
                ${createSkeleton('text', { width: '35%', height: '16px' }).outerHTML}
            </div>
        </div>
        
        <div class="skeleton-modal-body">
            ${createSkeleton('text', { lines: 2 }).outerHTML}
            
            <div class="skeleton-inputs">
                ${createSkeleton('input', { width: '100%', height: '48px' }).outerHTML}
                ${createSkeleton('textarea', { width: '100%', height: '120px' }).outerHTML}
            </div>
            
            <div class="skeleton-buttons">
                ${createSkeleton('button', { width: '200px', height: '48px', rounded: '8px' }).outerHTML}
                ${createSkeleton('button', { width: '120px', height: '48px', rounded: '8px' }).outerHTML}
            </div>
            
            ${createSkeleton('text', { lines: 4 }).outerHTML}
        </div>
    `;

    return modal;
}

/**
 * Initialize skeleton styles
 */
export function initSkeletonStyles() {
    if (document.getElementById('skeleton-styles')) return;

    const style = document.createElement('style');
    style.id = 'skeleton-styles';
    style.textContent = `
        @keyframes skeleton-shimmer {
            0% {
                background-position: 200% 0;
            }
            100% {
                background-position: -200% 0;
            }
        }

        .skeleton {
            display: inline-block;
        }

        .skeleton-text {
            line-height: 1.5;
        }

        .skeleton-circle {
            border-radius: 50%;
        }

        .skeleton-button {
            border-radius: 8px;
        }

        .skeleton-input {
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .skeleton-card {
            margin-bottom: 1rem;
        }

        .skeleton-card-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .skeleton-card-footer {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: flex-end;
        }

        .skeleton-table {
            width: 100%;
        }

        .skeleton-table-header {
            display: flex;
            gap: 1rem;
            padding: 1rem 0;
            border-bottom: 2px solid #e5e7eb;
            margin-bottom: 1rem;
        }

        .skeleton-table-row {
            display: flex;
            gap: 1rem;
            padding: 0.75rem 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .skeleton-form-field {
            margin-bottom: 1.5rem;
        }

        .skeleton-modal-header {
            display: flex;
            align-items: center;
            gap: 1.25rem;
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
        }

        .skeleton-modal-body {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .skeleton-inputs {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .skeleton-buttons {
            display: flex;
            gap: 1rem;
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
            .skeleton-card,
            .skeleton-modal {
                background: #1f2937 !important;
            }

            .skeleton-input {
                border-color: #374151 !important;
            }

            .skeleton-table-header {
                border-color: #374151 !important;
            }

            .skeleton-table-row {
                border-color: #374151 !important;
            }

            .skeleton-modal-header {
                border-color: #374151 !important;
            }
        }
    `;

    document.head.appendChild(style);
    logger.info('Skeleton styles initialized');
}

export default {
    createSkeleton,
    createCardSkeleton,
    createTableSkeleton,
    createFormSkeleton,
    createToolModalSkeleton,
    initSkeletonStyles
};
