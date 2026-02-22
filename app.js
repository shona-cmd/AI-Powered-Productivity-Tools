/**
 * AI Productivity Tools - Enhanced Main Application
 * Phase 1 + Phase 2 Implementation
 */

// Application State
const AppState = {
    currentTool: null,
    userData: {},
    settings: {
        apiKey: localStorage.getItem('openai_api_key') || '',
        model: 'gpt-3.5-turbo',
        maxTokens: 500,
        temperature: 0.7
    },
    theme: localStorage.getItem('theme') || 'light'
};

// DOM Elements
const Elements = {};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    cacheElements();
    setupTheme();
    setupEventListeners();
    initAnimations();
    initSmoothScroll();
    initScrollAnimations();
    registerServiceWorker();

    // Set welcome message with token offer
    const welcomeDiv = document.getElementById("welcome");
    if (welcomeDiv) {
        welcomeDiv.innerHTML = `
            <div class="welcome-banner">
                <div class="welcome-content">
                    <h1>🚀 Welcome to AI Productivity Tools</h1>
                    <p class="welcome-subtitle">Work smarter, not harder with AI-powered assistance</p>
                    <div class="welcome-offer">
                        <span class="offer-badge">🎁 NEW USER OFFER</span>
                        <p class="offer-text">Get <strong>300 FREE TOKENS</strong> when you sign up!</p>
                        <p class="offer-note">Try all AI tools risk-free. No credit card required.</p>
                    </div>
                    <button class="btn btn-primary btn-lg" onclick="authSystem.openAuthModal('register')">
                        Claim Your Free Tokens
                    </button>
                </div>
            </div>
        `;
    }
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        });
    }
}

function cacheElements() {
    Elements.modal = document.getElementById('toolModal');
    Elements.modalBody = document.getElementById('modalBody');
    Elements.contactForm = document.getElementById('contactForm');
    Elements.navLinks = document.querySelectorAll('.nav-links a');
    Elements.themeToggle = document.getElementById('themeToggle');
    Elements.app = document.getElementById('app');
}

// ==================== DARK MODE ====================
function setupTheme() {
    document.documentElement.setAttribute('data-theme', AppState.theme);
    updateThemeIcon();
    
    if (Elements.themeToggle) {
        Elements.themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', AppState.theme);
    document.documentElement.setAttribute('data-theme', AppState.theme);
    updateThemeIcon();
}

function updateThemeIcon() {
    if (Elements.themeToggle) {
        Elements.themeToggle.innerHTML = AppState.theme === 'light' ? '🌙' : '☀️';
    }
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Navigation links
    Elements.navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // Contact form
    if (Elements.contactForm) {
        Elements.contactForm.addEventListener('submit', handleContactSubmit);
    }

    // CTA buttons
    document.querySelectorAll('.cta-button, .primary-btn, .btn-primary').forEach(btn => {
        btn.addEventListener('click', handleCTAClick);
    });

    // Pricing buttons
    document.querySelectorAll('.pricing-btn, .btn-outline').forEach(btn => {
        btn.addEventListener('click', handlePricingClick);
    });

    // Mobile menu
    setupMobileMenu();
}

function setupMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navAuth = document.querySelector('.nav-auth-buttons');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            if (navAuth) navAuth.classList.toggle('active');
            menuBtn.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking on a nav link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                if (navAuth) navAuth.classList.remove('active');
                menuBtn.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !menuBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                if (navAuth) navAuth.classList.remove('active');
                menuBtn.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Handle window resize - close menu on desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (navAuth) navAuth.classList.remove('active');
                menuBtn.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

function handleNavClick(e) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function handleContactSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    showNotification('Message sent successfully!', 'success');
    e.target.reset();
}

function handleCTAClick(e) {
    const toolsSection = document.getElementById('tools') || document.getElementById('tools-section');
    if (toolsSection) {
        toolsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function handlePricingClick(e) {
    const card = e.target.closest('.pricing-card');
    if (card) {
        const planName = card.querySelector('h3')?.textContent || 'Plan';
        showNotification(`You've selected ${planName}!`, 'info');
    }
}

// ==================== ANIMATIONS ====================
function initAnimations() {
    // Add hover effects with transform
    document.querySelectorAll('.tool-card, .feature-card, .testimonial-card, .pricing-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // Button ripple effect
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', createRipple);
    });
}

function createRipple(e) {
    const btn = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
    ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
    
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// ==================== SCROLL ANIMATIONS ====================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.tool-card, .feature-card, .testimonial-card, .pricing-card, .section-header').forEach(el => {
        observer.observe(el);
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ==================== TOOL MODAL ====================
function openTool(toolName) {
    // Check if user is logged in before opening tool
    if (!authSystem || !authSystem.isLoggedIn()) {
        showNotification('Please login to access the tools', 'warning');
        authSystem.openAuthModal('login');
        return;
    }
    
    AppState.currentTool = toolName;
    let content = '';

    switch(toolName) {
        case 'writing':
            content = renderWritingAssistant();
            break;
        case 'tasks':
            content = renderTaskManager();
            break;
        case 'business':
            content = renderBusinessToolkit();
            break;
        case 'student':
            content = renderStudentTool();
            break;
        default:
            content = '<p>Tool not found</p>';
    }

    Elements.modalBody.innerHTML = content;
    Elements.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Prevent body scroll on mobile
    if (window.innerWidth < 768) {
        document.body.style.position = 'fixed';
    }

    // Initialize the specific tool
    initTool(toolName);
    
    // Focus first input
    setTimeout(() => {
        const firstInput = Elements.modalBody.querySelector('input, textarea, select');
        if (firstInput) firstInput.focus();
    }, 100);
}

function closeModal() {
    Elements.modal.classList.remove('active');
    document.body.style.overflow = '';
    document.body.style.position = '';
    AppState.currentTool = null;
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Close modal on backdrop click
Elements.modal.addEventListener('click', (e) => {
    if (e.target === Elements.modal) closeModal();
});

// ==================== TOOL RENDER FUNCTIONS ====================
function renderWritingAssistant() {
    return `
        <div class="tool-modal-header">
            <div class="tool-modal-icon">✍️</div>
            <div>
                <h2>AI Writing Assistant</h2>
                <p>Create professional content in seconds</p>
            </div>
            <button class="theme-toggle-small" onclick="toggleTheme()">${AppState.theme === 'light' ? '🌙' : '☀️'}</button>
        </div>
        
        <div class="tool-template-grid">
            <button class="template-btn active" data-template="email">📧 Email</button>
            <button class="template-btn" data-template="blog">📝 Blog</button>
            <button class="template-btn" data-template="resume">📄 Resume</button>
            <button class="template-btn" data-template="social">📱 Social</button>
            <button class="template-btn" data-template="business">💼 Business</button>
            <button class="template-btn" data-template="creative">🎨 Creative</button>
        </div>

        <div class="tool-form">
            <div class="tool-input-group">
                <label for="writingTopic">📌 Topic or Subject</label>
                <input type="text" id="writingTopic" placeholder="e.g., Introduction email for new client">
            </div>
            
            <div class="tool-input-group">
                <label for="writingTone">🎨 Tone</label>
                <select id="writingTone">
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                    <option value="persuasive">Persuasive</option>
                    <option value="informative">Informative</option>
                </select>
            </div>
            
            <div class="tool-input-group">
                <label for="writingDetails">📝 Additional Details</label>
                <textarea id="writingDetails" rows="3" placeholder="Any specific points or requirements..."></textarea>
            </div>
            
            <div class="tool-output" id="writingOutput">
                Your AI-generated content will appear here...
            </div>
            
            <div class="tool-actions">
                <button class="generate-btn" onclick="generateWriting()">
                    <span class="btn-icon">✨</span> Generate
                </button>
                <button class="copy-btn" onclick="copyToClipboard('writingOutput')">
                    <span class="btn-icon">📋</span> Copy
                </button>
            </div>
        </div>
    `;
}

function renderTaskManager() {
    return `
        <div class="tool-modal-header">
            <div class="tool-modal-icon">📋</div>
            <div>
                <h2>AI Task Manager</h2>
                <p>Smart prioritization and planning</p>
            </div>
        </div>
        
        <div class="tool-form">
            <div class="tool-input-group">
                <label for="newTask">📌 Add New Task</label>
                <div class="task-input-row">
                    <input type="text" id="newTask" placeholder="What needs to be done?">
                    <select id="taskPriority">
                        <option value="high">🔴 High</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="low">🟢 Low</option>
                    </select>
                    <button class="generate-btn" onclick="addTask()">Add</button>
                </div>
            </div>
            
            <div class="task-stats">
                <span class="stat-badge">Total: <strong id="totalTasks">0</strong></span>
                <span class="stat-badge">Pending: <strong id="pendingTasks">0</strong></span>
                <span class="stat-badge">Done: <strong id="completedTasks">0</strong></span>
            </div>
            
            <div class="task-list" id="taskList">
                <!-- Tasks will be rendered here -->
            </div>
            
            <div class="tool-output ai-suggestions" id="aiSuggestions">
                🤖 AI Suggestions will appear here based on your tasks...
            </div>
            
            <div class="tool-actions">
                <button class="generate-btn" onclick="getAITaskSuggestions()">
                    <span class="btn-icon">💡</span> AI Suggestions
                </button>
                <button class="copy-btn" onclick="copyToClipboard('aiSuggestions')">
                    <span class="btn-icon">📋</span> Copy
                </button>
            </div>
        </div>
    `;
}

function renderBusinessToolkit() {
    return `
        <div class="tool-modal-header">
            <div class="tool-modal-icon">💼</div>
            <div>
                <h2>AI Business Toolkit</h2>
                <p>Everything your business needs</p>
            </div>
        </div>
        
        <div class="tool-template-grid">
            <button class="template-btn active" data-template="invoice">📄 Invoice</button>
            <button class="template-btn" data-template="quote">💰 Quote</button>
            <button class="template-btn" data-template="proposal">📋 Proposal</button>
            <button class="template-btn" data-template="email">💬 Email</button>
            <button class="template-btn" data-template="marketing">📢 Marketing</button>
            <button class="template-btn" data-template="contract">📝 Contract</button>
        </div>

        <div class="tool-form">
            <div class="tool-input-group">
                <label for="businessType">📋 Document Type</label>
                <select id="businessType">
                    <option value="invoice">Invoice</option>
                    <option value="quote">Quote</option>
                    <option value="proposal">Proposal</option>
                    <option value="email">Business Email</option>
                    <option value="marketing">Marketing Copy</option>
                    <option value="contract">Contract</option>
                </select>
            </div>
            
            <div class="tool-input-group">
                <label for="businessDetails">📝 Details</label>
                <textarea id="businessDetails" rows="4" placeholder="Provide the details for your document..."></textarea>
            </div>
            
            <div class="tool-output" id="businessOutput">
                Your AI-generated document will appear here...
            </div>
            
            <div class="tool-actions">
                <button class="generate-btn" onclick="generateBusinessDoc()">
                    <span class="btn-icon">✨</span> Generate
                </button>
                <button class="copy-btn" onclick="copyToClipboard('businessOutput')">
                    <span class="btn-icon">📋</span> Copy
                </button>
            </div>
        </div>
    `;
}

function renderStudentTool() {
    return `
        <div class="tool-modal-header">
            <div class="tool-modal-icon">📚</div>
            <div>
                <h2>AI Student Tool</h2>
                <p>Study smarter, not longer</p>
            </div>
        </div>
        
        <div class="tool-template-grid">
            <button class="template-btn active" data-template="summary">📝 Summary</button>
            <button class="template-btn" data-template="questions">❓ Questions</button>
            <button class="template-btn" data-template="study">📅 Study Plan</button>
            <button class="template-btn" data-template="essay">✍️ Essay Help</button>
        </div>

        <div class="tool-form">
            <div class="tool-input-group">
                <label for="studentToolType">🛠️ Tool</label>
                <select id="studentToolType">
                    <option value="summary">Summarize Content</option>
                    <option value="questions">Generate Practice Questions</option>
                    <option value="plan">Create Study Plan</option>
                    <option value="essay">Essay Assistance</option>
                </select>
            </div>
            
            <div class="tool-input-group">
                <label for="studentContent">📄 Your Content</label>
                <textarea id="studentContent" rows="5" placeholder="Paste your notes, article, or study material here..."></textarea>
            </div>
            
            <div class="tool-output" id="studentOutput">
                AI-generated study help will appear here...
            </div>
            
            <div class="tool-actions">
                <button class="generate-btn" onclick="generateStudentContent()">
                    <span class="btn-icon">✨</span> Generate
                </button>
                <button class="copy-btn" onclick="copyToClipboard('studentOutput')">
                    <span class="btn-icon">📋</span> Copy
                </button>
            </div>
        </div>
    `;
}

function initTaskManager() {
    // Load saved tasks
    loadTasks();
    
    // Set up enter key for adding tasks
    const taskInput = document.getElementById('newTask');
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });
    }
}

function initTool(toolName) {
    switch(toolName) {
        case 'tasks':
            initTaskManager();
            break;
        case 'business':
            initBusinessToolkit();
            break;
        case 'student':
            initStudentTool();
            break;
        case 'writing':
            // Writing assistant doesn't need special initialization
            break;
    }
}

function initBusinessToolkit() {
    document.querySelectorAll('#modalBody .template-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#modalBody .template-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

function initStudentTool() {
    document.querySelectorAll('#modalBody .template-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#modalBody .template-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Update select based on template
            const template = e.target.dataset.template;
            const select = document.getElementById('studentToolType');
            if (template === 'summary') select.value = 'summary';
            else if (template === 'questions') select.value = 'questions';
            else if (template === 'study') select.value = 'plan';
            else if (template === 'essay') select.value = 'essay';
        });
    });
}

// Writing Assistant Functions
function generateWriting() {
    const topic = document.getElementById('writingTopic').value;
    const tone = document.getElementById('writingTone').value;
    const details = document.getElementById('writingDetails').value;
    const output = document.getElementById('writingOutput');

    if (!topic.trim()) {
        showNotification('Please enter a topic or subject', 'warning');
        return;
    }

    // Check tokens
    if (!paymentSystem || paymentSystem.getTokenBalance() < 1) {
        showNotification('Insufficient tokens. Please buy more tokens.', 'error');
        paymentSystem.openPaymentModal();
        return;
    }

    // Show loading state
    output.innerHTML = '<span class="loading"></span> Generating content...';

    // Use AI engine
    aiEngine.generateWriting('writing', topic, tone, details).then(content => {
        output.innerHTML = content;
        paymentSystem.saveTokens(-1); // Deduct 1 token
        paymentSystem.recordTransaction({
            type: 'usage',
            tokens: -1,
            description: 'Writing Assistant - ' + topic.substring(0, 30) + '...',
            status: 'completed'
        });
        showNotification('Content generated successfully!', 'success');
    }).catch(error => {
        output.innerHTML = 'Error generating content. Please try again.';
        showNotification('Generation failed. Please check your API key.', 'error');
    });
}

// Task Manager Functions
let tasks = [];

function loadTasks() {
    const saved = localStorage.getItem('aiTasks');
    if (saved) {
        tasks = JSON.parse(saved);
    }
    renderTasks();
}

function saveTasks() {
    localStorage.setItem('aiTasks', JSON.stringify(tasks));
}

function addTask() {
    const input = document.getElementById('newTask');
    const priority = document.getElementById('taskPriority');
    
    if (!input.value.trim()) return;
    
    const task = {
        id: Date.now(),
        text: input.value.trim(),
        priority: priority.value,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(task);
    saveTasks();
    renderTasks();
    input.value = '';
    
    showNotification('Task added successfully!', 'success');
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    showNotification('Task deleted', 'info');
}

function renderTasks() {
    const container = document.getElementById('taskList');
    if (!container) return;
    
    if (tasks.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <p>📝 No tasks yet. Add your first task above!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div class="task-item">
            <input type="checkbox" class="task-checkbox" 
                ${task.completed ? 'checked' : ''} 
                onchange="toggleTask(${task.id})">
            <div class="task-content ${task.completed ? 'completed' : ''}">
                <span class="task-text">${escapeHtml(task.text)}</span>
            </div>
            <span class="task-priority ${task.priority}">${task.priority}</span>
            <button onclick="deleteTask(${task.id})" style="background: none; border: none; cursor: pointer; font-size: 1.2rem;">🗑️</button>
        </div>
    `).join('');
}

function getAITaskSuggestions() {
    const pendingTasks = tasks.filter(t => !t.completed);
    const output = document.getElementById('aiSuggestions');

    if (pendingTasks.length === 0) {
        output.innerHTML = '🤖 Add some tasks to get AI suggestions!';
        return;
    }

    // Check tokens
    if (!paymentSystem || paymentSystem.getTokenBalance() < 1) {
        showNotification('Insufficient tokens. Please buy more tokens.', 'error');
        paymentSystem.openPaymentModal();
        return;
    }

    output.innerHTML = '<span class="loading"></span> Analyzing your tasks...';

    // Use AI engine
    aiEngine.getTaskSuggestions(pendingTasks).then(suggestions => {
        output.innerHTML = suggestions;
        paymentSystem.saveTokens(-1); // Deduct 1 token
        paymentSystem.recordTransaction({
            type: 'usage',
            tokens: -1,
            description: 'Task Manager AI Suggestions',
            status: 'completed'
        });
        showNotification('AI suggestions ready!', 'success');
    }).catch(error => {
        output.innerHTML = 'Error generating suggestions. Please try again.';
        showNotification('Generation failed. Please check your API key.', 'error');
    });
}

// Business Toolkit Functions
function generateBusinessDoc() {
    const type = document.getElementById('businessType').value;
    const details = document.getElementById('businessDetails').value;
    const output = document.getElementById('businessOutput');

    if (!details.trim()) {
        showNotification('Please provide details for the document', 'warning');
        return;
    }

    // Check tokens
    if (!paymentSystem || paymentSystem.getTokenBalance() < 1) {
        showNotification('Insufficient tokens. Please buy more tokens.', 'error');
        paymentSystem.openPaymentModal();
        return;
    }

    output.innerHTML = '<span class="loading"></span> Generating document...';

    // Use AI engine
    aiEngine.generateBusinessDoc(type, details).then(content => {
        output.innerHTML = content;
        paymentSystem.saveTokens(-1); // Deduct 1 token
        paymentSystem.recordTransaction({
            type: 'usage',
            tokens: -1,
            description: 'Business Toolkit - ' + type,
            status: 'completed'
        });
        showNotification('Document generated successfully!', 'success');
    }).catch(error => {
        output.innerHTML = 'Error generating document. Please try again.';
        showNotification('Generation failed. Please check your API key.', 'error');
    });
}

// Student Tool Functions
function generateStudentContent() {
    const toolType = document.getElementById('studentToolType').value;
    const content = document.getElementById('studentContent').value;
    const output = document.getElementById('studentOutput');
    
    if (!content.trim()) {
        showNotification('Please enter or paste your content', 'warning');
        return;
    }
    
    output.innerHTML = '<span class="loading"></span> Processing...';
    
    setTimeout(() => {
        const result = generateAIContent('student', { toolType, content });
        output.innerHTML = result;
        showNotification('Content generated successfully!', 'success');
    }, 1500);
}

// AI Content Generation (Now handled by ai-engine.js)

// Utility Functions
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const text = element.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(err => {
        showNotification('Failed to copy', 'error');
    });
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        animation: 'slideIn 0.3s ease',
        background: type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#4f46e5'
    });
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    .visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    .tool-card, .feature, .testimonial, .pricing-card {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.5s ease;
    }
`;
document.head.appendChild(style);

// Export for global access
window.openTool = openTool;
window.closeModal = closeModal;
window.initTool = initTool;
window.generateWriting = generateWriting;
window.addTask = addTask;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.getAITaskSuggestions = getAITaskSuggestions;
window.generateBusinessDoc = generateBusinessDoc;
window.generateStudentContent = generateStudentContent;
window.copyToClipboard = copyToClipboard;

// ============================================
// WHATSAPP FEATURE REQUEST INTEGRATION
// ============================================

// Configuration - Your WhatsApp number
const WHATSAPP_NUMBER = '256761485613'; // Uganda number

/**
 * Opens WhatsApp with a pre-filled feature request message
 * This function is called when customers click the "Send Feature Request" button
 */
function openFeatureRequest() {
    // Simplified message template (no newlines to avoid URL issues)
    const message = `Hi! I have a feature suggestion for AI Productivity Tools. Please describe the feature and how it would help. Thanks!`;
    
    // Create the WhatsApp URL - simplified format
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in a new tab/window
    window.open(whatsappURL, '_blank');
    
    // Show notification
    showNotification('Opening WhatsApp...', 'info');
}

/**
 * Alternative function with customizable message
 * @param {string} customMessage - Optional custom message to pre-fill
 */
function sendFeatureRequest(customMessage = null) {
    let message;
    
    if (customMessage) {
        message = `Hi! I have a feature suggestion for your AI Productivity Tools:\n\n${customMessage}\n\nThanks!`;
    } else {
        message = `Hi! I have a feature suggestion for your AI Productivity Tools:

[Describe the feature you'd like us to add]

This would help me because:
[Explain how this feature would benefit you]

Thanks!`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
}

/**
 * Quick feature request with category
 * @param {string} category - The tool/category the feature is for
 */
function requestFeatureForTool(category) {
    const message = `Hi! I'd like to suggest a feature for the ${category} tool:

[Describe the feature]

This would help because:
[Explain the benefit]

Thanks!`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
}

// Export functions globally
window.openFeatureRequest = openFeatureRequest;
window.sendFeatureRequest = sendFeatureRequest;
window.requestFeatureForTool = requestFeatureForTool;
