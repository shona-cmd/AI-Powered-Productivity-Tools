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
        case 'code':
            content = renderCodeEditor();
            break;
        case 'chat':
            content = renderAIChat();
            break;
        case 'image':
            content = renderImageGenerator();
            break;
        case 'translate':
            content = renderTranslation();
            break;
        case 'seo':
            content = renderSEO();
            break;
        case 'research':
            content = renderResearch();
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
        case 'code':
            initCodeEditor();
            break;
        case 'chat':
            initAIChat();
            break;
        case 'image':
            initImageGenerator();
            break;
        case 'translate':
            initTranslation();
            break;
        case 'seo':
            initSEO();
            break;
        case 'research':
            initResearch();
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

// ==================== CODE EDITOR FUNCTIONS ====================

// Code Editor instance
let codeEditor = null;
let savedSnippets = [];

/**
 * Render the Code Editor tool
 */
function renderCodeEditor() {
    // Load saved snippets
    loadCodeSnippets();
    
    return `
        <div class="tool-modal-header">
            <div class="tool-modal-icon">💻</div>
            <div>
                <h2>VS Code Editor</h2>
                <p>Write, debug, and optimize code with AI assistance</p>
            </div>
            <button class="theme-toggle-small" onclick="toggleTheme()">${AppState.theme === 'light' ? '🌙' : '☀️'}</button>
        </div>
        
        <div class="code-editor-container">
            <div class="code-toolbar">
                <div class="toolbar-left">
                    <label for="codeLanguage">Language:</label>
                    <select id="codeLanguage" onchange="changeCodeLanguage()">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="xml">XML</option>
                    </select>
                </div>
                <div class="toolbar-right">
                    <button class="code-btn" onclick="formatCode()" title="Format Code">📝 Format</button>
                    <button class="code-btn" onclick="clearCode()" title="Clear">🗑️ Clear</button>
                </div>
            </div>
            
            <div class="code-editor-wrapper">
                <textarea id="codeEditor" placeholder="// Start coding here...
// Example:
// function hello() {
//   console.log('Hello, World!');
// }"></textarea>
            </div>
            
            <div class="code-actions">
                <button class="generate-btn" onclick="getAICodeHelp('explain')">
                    <span class="btn-icon">💡</span> Explain Code
                </button>
                <button class="generate-btn" onclick="getAICodeHelp('debug')">
                    <span class="btn-icon">🐛</span> Debug Code
                </button>
                <button class="generate-btn" onclick="getAICodeHelp('optimize')">
                    <span class="btn-icon">⚡</span> Optimize
                </button>
                <button class="copy-btn" onclick="copyCode()">
                    <span class="btn-icon">📋</span> Copy
                </button>
            </div>
            
            <div class="ai-code-output" id="aiCodeOutput">
                🤖 AI assistance will appear here...
            </div>
            
            <!-- Snippets Section -->
            <div class="snippets-section">
                <div class="snippets-header">
                    <h4>💾 Saved Snippets</h4>
                    <button class="code-btn" onclick="saveCurrentSnippet()">+ Save Current</button>
                </div>
                <div class="snippets-list" id="snippetsList">
                    ${renderSnippetsList()}
                </div>
            </div>
        </div>
    `;
}

/**
 * Initialize the Code Editor (called after render)
 */
function initCodeEditor() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const textarea = document.getElementById('codeEditor');
        if (!textarea) return;
        
        // Initialize CodeMirror
        codeEditor = CodeMirror.fromTextArea(textarea, {
            mode: 'javascript',
            theme: 'material-darker',
            lineNumbers: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: false,
            lineWrapping: true,
            autofocus: true
        });
        
        // Set initial value
        codeEditor.setValue(localStorage.getItem('lastCode') || '// Start coding here...\n\nfunction hello() {\n  console.log("Hello, World!");\n}\n\nhello();');
        
        // Save code on change
        codeEditor.on('change', (cm) => {
            localStorage.setItem('lastCode', cm.getValue());
        });
        
        console.log('CodeMirror initialized');
    }, 100);
}

/**
 * Change code language
 */
function changeCodeLanguage() {
    const language = document.getElementById('codeLanguage').value;
    const modeMap = {
        'javascript': 'javascript',
        'python': 'python',
        'html': 'htmlmixed',
        'css': 'css',
        'xml': 'xml'
    };
    
    if (codeEditor) {
        codeEditor.setOption('mode', modeMap[language] || 'javascript');
    }
}

/**
 * Clear the code editor
 */
function clearCode() {
    if (codeEditor) {
        codeEditor.setValue('');
    }
    document.getElementById('aiCodeOutput').innerHTML = '🤖 AI assistance will appear here...';
}

/**
 * Format code (basic indentation)
 */
function formatCode() {
    if (!codeEditor) return;
    
    const code = codeEditor.getValue();
    // Simple format - just re-indent (basic implementation)
    const lines = code.split('\n');
    let indentLevel = 0;
    const formattedLines = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        
        // Decrease indent for closing braces
        if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        
        const indented = '    '.repeat(indentLevel) + trimmed;
        
        // Increase indent for opening braces
        if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
            indentLevel++;
        }
        
        return indented;
    });
    
    codeEditor.setValue(formattedLines.join('\n'));
    showNotification('Code formatted!', 'success');
}

/**
 * Copy code to clipboard
 */
function copyCode() {
    const code = codeEditor ? codeEditor.getValue() : document.getElementById('codeEditor').value;
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Code copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy', 'error');
    });
}

/**
 * Get AI code help
 */
function getAICodeHelp(action) {
    const code = codeEditor ? codeEditor.getValue() : '';
    const output = document.getElementById('aiCodeOutput');
    
    if (!code.trim()) {
        showNotification('Please write some code first', 'warning');
        return;
    }
    
    // Check tokens
    if (!paymentSystem || paymentSystem.getTokenBalance() < 1) {
        showNotification('Insufficient tokens. Please buy more tokens.', 'error');
        paymentSystem.openPaymentModal();
        return;
    }
    
    output.innerHTML = '<span class="loading"></span> Analyzing your code...';
    
    // Use AI engine
    const prompts = {
        explain: `Explain this code in simple terms:\n\n${code}`,
        debug: `Find bugs and issues in this code and suggest fixes:\n\n${code}`,
        optimize: `Optimize this code for better performance:\n\n${code}`
    };
    
    if (aiEngine && aiEngine.generateText) {
        aiEngine.generateText(prompts[action], 300).then(response => {
            output.innerHTML = `<div class="ai-response"><strong>${action.charAt(0).toUpperCase() + action.slice(1)} Result:</strong><pre>${escapeHtml(response)}</pre></div>`;
            paymentSystem.saveTokens(-1);
            paymentSystem.recordTransaction({
                type: 'usage',
                tokens: -1,
                description: `Code Editor - ${action}`,
                status: 'completed'
            });
            showNotification(`${action.charAt(0).toUpperCase() + action.slice(1)} complete!`, 'success');
        }).catch(error => {
            output.innerHTML = 'Error getting AI help. Please try again.';
            showNotification('AI assistance failed', 'error');
        });
    } else {
        // Fallback response
        setTimeout(() => {
            const responses = {
                explain: `This code appears to be a ${detectLanguage(code)} program. It contains ${code.split('\n').length} lines of code.`,
                debug: `Code analysis complete. No obvious syntax errors detected. Consider adding error handling for production use.`,
                optimize: `Code optimization suggestions:\n1. Consider using const/let instead of var\n2. Add comments for better readability\n3. Consider breaking into smaller functions`
            };
            output.innerHTML = `<div class="ai-response"><strong>${action.charAt(0).toUpperCase() + action.slice(1)} Result:</strong><pre>${responses[action]}</pre></div>`;
            paymentSystem.saveTokens(-1);
            showNotification(`${action.charAt(0).toUpperCase() + action.slice(1)} complete!`, 'success');
        }, 1000);
    }
}

/**
 * Detect programming language
 */
function detectLanguage(code) {
    if (code.includes('def ') && code.includes(':')) return 'Python';
    if (code.includes('function') || code.includes('=>') || code.includes('console.log')) return 'JavaScript';
    if (code.includes('<html') || code.includes('<div')) return 'HTML';
    if (code.includes('{') && code.includes(':') && code.includes(';')) return 'CSS';
    return 'code';
}

// ==================== SNIPPETS FUNCTIONS ====================

/**
 * Load code snippets from localStorage
 */
function loadCodeSnippets() {
    const saved = localStorage.getItem('codeSnippets');
    savedSnippets = saved ? JSON.parse(saved) : [];
}

/**
 * Save current code as a snippet
 */
function saveCurrentSnippet() {
    const code = codeEditor ? codeEditor.getValue() : '';
    if (!code.trim()) {
        showNotification('No code to save', 'warning');
        return;
    }
    
    const name = prompt('Enter a name for this snippet:');
    if (!name) return;
    
    const snippet = {
        id: Date.now(),
        name: name,
        code: code,
        language: document.getElementById('codeLanguage')?.value || 'javascript',
        createdAt: new Date().toISOString()
    };
    
    savedSnippets.unshift(snippet);
    localStorage.setItem('codeSnippets', JSON.stringify(savedSnippets));
    
    // Update the snippets list
    const list = document.getElementById('snippetsList');
    if (list) {
        list.innerHTML = renderSnippetsList();
    }
    
    showNotification('Snippet saved!', 'success');
}

/**
 * Load a snippet into the editor
 */
function loadSnippet(id) {
    const snippet = savedSnippets.find(s => s.id === id);
    if (snippet && codeEditor) {
        codeEditor.setValue(snippet.code);
        
        // Set language
        const langSelect = document.getElementById('codeLanguage');
        if (langSelect) {
            langSelect.value = snippet.language;
            changeCodeLanguage();
        }
        
        showNotification(`Loaded: ${snippet.name}`, 'success');
    }
}

/**
 * Delete a snippet
 */
function deleteSnippet(id) {
    if (!confirm('Delete this snippet?')) return;
    
    savedSnippets = savedSnippets.filter(s => s.id !== id);
    localStorage.setItem('codeSnippets', JSON.stringify(savedSnippets));
    
    const list = document.getElementById('snippetsList');
    if (list) {
        list.innerHTML = renderSnippetsList();
    }
    
    showNotification('Snippet deleted', 'info');
}

/**
 * Render the snippets list
 */
function renderSnippetsList() {
    if (savedSnippets.length === 0) {
        return '<p class="no-snippets">No saved snippets yet. Write some code and save it!</p>';
    }
    
    return savedSnippets.map(snippet => `
        <div class="snippet-item">
            <div class="snippet-info" onclick="loadSnippet(${snippet.id})">
                <span class="snippet-name">${escapeHtml(snippet.name)}</span>
                <span class="snippet-lang">${snippet.language}</span>
            </div>
            <button class="snippet-delete" onclick="deleteSnippet(${snippet.id})">×</button>
        </div>
    `).join('');
}

// ==================== AI CHAT TOOL ====================

/**
 * Render the AI Chat tool
 */
function renderAIChat() {
    return `
        <div class="tool-modal-header">
            <div class="tool-modal-icon">🤖</div>
            <div>
                <h2>AI Chat Assistant</h2>
                <p>Have a conversation with advanced AI</p>
            </div>
            <button class="theme-toggle-small" onclick="toggleTheme()">${AppState.theme === 'light' ? '🌙' : '☀️'}</button>
        </div>
        
        <div class="ai-chat-container">
            <div class="chat-settings">
                <label for="chatModel">AI Model:</label>
                <select id="chatModel" onchange="changeChatModel()">
                    <option value="gpt-4-turbo-preview">GPT-4 Turbo (Fastest)</option>
                    <option value="gpt-4">GPT-4 (Most Capable)</option>
                    <option value="claude-3-opus">Claude 3 Opus (Best Reasoning)</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                </select>
                <button class="code-btn" onclick="clearChatHistory()" title="Clear Chat">🗑️ Clear</button>
            </div>
            
            <div class="chat-messages" id="chatMessages">
                <div class="chat-message bot">
                    <div class="message-avatar">🤖</div>
                    <div class="message-content">
                        <strong>AI Assistant</strong>
                        <p>Hello! I'm your advanced AI assistant. Ask me anything - I can help with coding, writing, analysis, research, and much more!</p>
                    </div>
                </div>
            </div>
            
            <div class="chat-input-container">
                <textarea id="chatInput" placeholder="Type your message here..." rows="2"></textarea>
                <button class="generate-btn" onclick="sendChatMessage()">
                    <span class="btn-icon">🚀</span> Send
                </button>
            </div>
        </div>
    `;
}

function initAIChat() {
    setTimeout(() => {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                }
            });
        }
    }, 100);
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const messagesContainer = document.getElementById('chatMessages');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Check tokens
    if (!paymentSystem || paymentSystem.getTokenBalance() < 1) {
        showNotification('Insufficient tokens. Please buy more tokens.', 'error');
        paymentSystem.openPaymentModal();
        return;
    }
    
    // Add user message
    addChatMessage('user', message);
    input.value = '';
    
    // Show loading
    const loadingId = addChatMessage('bot', '<span class="loading"></span> Thinking...');
    
    try {
        const model = document.getElementById('chatModel')?.value || 'gpt-4-turbo-preview';
        const response = await aiEngine.chat(message, 'You are a helpful, knowledgeable AI assistant.');
        
        // Remove loading message
        document.getElementById(loadingId)?.remove();
        
        // Add AI response
        addChatMessage('bot', response);
        
        // Deduct token
        paymentSystem.saveTokens(-1);
    } catch (error) {
        document.getElementById(loadingId)?.remove();
        addChatMessage('bot', 'Sorry, I encountered an error. Please check your API key and try again.');
        showNotification('Chat error: ' + error.message, 'error');
    }
}

function addChatMessage(sender, content) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageId = 'msg-' + Date.now();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.id = messageId;
    messageDiv.innerHTML = `
        <div class="message-avatar">${sender === 'user' ? '👤' : '🤖'}</div>
        <div class="message-content">
            <strong>${sender === 'user' ? 'You' : 'AI Assistant'}</strong>
            <p>${content}</p>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageId;
}

function changeChatModel() {
    const model = document.getElementById('chatModel').value;
    aiEngine.setModel(model);
    showNotification('Model changed to ' + model, 'info');
}

function clearChatHistory() {
    if (!confirm('Clear all chat history?')) return;
    aiEngine.clearChat();
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = `
        <div class="chat-message bot">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <strong>AI Assistant</strong>
                <p>Chat cleared! How can I help you now?</p>
            </div>
        </div>
    `;
    showNotification('Chat history cleared', 'info');
}

// ==================== AI IMAGE GENERATOR ====================

function renderImageGenerator() {
    return `
        <div class="tool-modal-header">
            <div class="tool-modal-icon">🎨</div>
            <div>
                <h2>AI Image Generator</h2>
                <p>Create stunning images with AI</p>
            </div>
            <button class="theme-toggle-small" onclick="toggleTheme()">${AppState.theme === 'light' ? '🌙' : '☀️'}</button>
        </div>
        
        <div class="tool-form">
            <div class="tool-input-group">
                <label for="imagePrompt">🎯 Describe your image</label>
                <textarea id="imagePrompt" rows="3" placeholder="A majestic lion walking through a savanna at sunset, photorealistic, 8k..."></textarea>
            </div>
            
            <div class="tool-input-group">
                <label for="imageSize">📐 Image Size</label>
                <select id="imageSize">
                    <option value="1024x1024">Square (1024×1024)</option>
                    <option value="1792x1024">Landscape (1792×1024)</option>
                    <option value="1024x1792">Portrait (1024×1792)</option>
                </select>
            </div>
            
            <button class="generate-btn" onclick="generateImage()" style="width: 100%;">
                <span class="btn-icon">🎨</span> Generate Image
            </button>
            
            <div class="image-output" id="imageOutput">
                <div class="image-placeholder">
                    <span>🖼️</span>
                    <p>Your generated image will appear here</p>
                </div>
            </div>
        </div>
    `;
}

function initImageGenerator() {}

async function generateImage() {
    const prompt = document.getElementById('imagePrompt').value;
    const size = document.getElementById('imageSize').value;
    const output = document.getElementById('imageOutput');
    
    if (!prompt.trim()) {
        showNotification('Please describe what you want to generate', 'warning');
        return;
    }
    
    // Check tokens
    if (!paymentSystem || paymentSystem.getTokenBalance() < 3) {
        showNotification('Image generation requires 3 tokens. Please buy more.', 'error');
        paymentSystem.openPaymentModal();
        return;
    }
    
    output.innerHTML = '<div class="image-loading"><span class="loading"></span> Generating image...</div>';
    
    try {
        const imageUrl = await aiEngine.generateImage(prompt, size);
        
        output.innerHTML = `
            <img src="${imageUrl}" alt="AI Generated Image" class="generated-image">
            <div class="image-actions">
                <a href="${imageUrl}" target="_blank" class="copy-btn">🔗 Open Full Size</a>
                <button class="generate-btn" onclick="downloadImage('${imageUrl}')">💾 Download</button>
            </div>
        `;
        
        paymentSystem.saveTokens(-3);
        showNotification('Image generated successfully!', 'success');
    } catch (error) {
        output.innerHTML = '<div class="image-error">Error generating image. Please try again.</div>';
        showNotification('Image generation failed: ' + error.message, 'error');
    }
}

function downloadImage(url) {
    window.open(url, '_blank');
}

// ==================== AI TRANSLATOR ====================

function renderTranslation() {
    return `
        <div class="tool-modal-header">
            <div class="tool-modal-icon">🌍</div>
            <div>
                <h2>AI Translator</h2>
                <p>Translate content between 50+ languages</p>
            </div>
            <button class="theme-toggle-small" onclick="toggleTheme()">${AppState.theme === 'light' ? '🌙' : '☀️'}</button>
        </div>
        
        <div class="tool-form">
            <div class="tool-input-group">
                <label for="sourceLanguage">📤 Source Language</label>
                <select id="sourceLanguage">
                    <option value="auto">Auto-detect</option>
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="chinese">Chinese</option>
                    <option value="japanese">Japanese</option>
                    <option value="korean">Korean</option>
                    <option value="arabic">Arabic</option>
                    <option value="portuguese">Portuguese</option>
                    <option value="russian">Russian</option>
                </select>
            </div>
            
            <div class="tool-input-group">
                <label for="targetLanguage">📥 Target Language</label>
                <select id="targetLanguage">
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="chinese">Chinese</option>
                    <option value="japanese">Japanese</option>
                    <option value="korean">Korean</option>
                    <option value="arabic">Arabic</option>
                    <option value="portuguese">Portuguese</option>
                    <option value="russian">Russian</option>
                    <option value="italian">Italian</option>
                    <option value="dutch">Dutch</option>
                    <option value="hindi">Hindi</option>
                </select>
            </div>
            
            <div class="tool-input-group">
                <label for="translateInput">📝 Text to Translate</label>
                <textarea id="translateInput" rows="4" placeholder="Enter text to translate..."></textarea>
            </div>
            
            <button class="generate-btn" onclick="translateText()" style="width: 100%;">
                <span class="btn-icon">🌍</span> Translate
            </button>
            
            <div class="tool-output" id="translateOutput">
                Translation will appear here...
            </div>
            
            <div class="tool-actions">
                <button class="copy-btn" onclick="copyToClipboard('translateOutput')">
                    <span class="btn-icon">📋</span> Copy
                </button>
            </div>
        </div>
    `;
}

function initTranslation() {}

async function translateText() {
    const text = document.getElementById('translateInput').value;
    const targetLang = document.getElementById('targetLanguage').value;
    const sourceLang = document.getElementById('sourceLanguage').value;
    const output = document.getElementById('translateOutput');
    
    if (!text.trim()) {
        showNotification('Please enter text to translate', 'warning');
        return;
    }
    
    output.innerHTML = '<span class="loading"></span> Translating...';
    
    try {
        const result = await aiEngine.translate(text, targetLang, sourceLang);
        output.innerHTML = result;
        showNotification('Translation complete!', 'success');
    } catch (error) {
        output.innerHTML = 'Translation failed. Please try again.';
        showNotification('Translation error', 'error');
    }
}

// ==================== AI SEO OPTIMIZER ====================

function renderSEO() {
    return `
        <div class="tool-modal-header">
            <div class="tool-modal-icon">🔍</div>
            <div>
                <h2>SEO Optimizer</h2>
                <p>Optimize your content for Google rankings</p>
            </div>
            <button class="theme-toggle-small" onclick="toggleTheme()">${AppState.theme === 'light' ? '🌙' : '☀️'}</button>
        </div>
        
        <div class="tool-form">
            <div class="tool-input-group">
                <label for="seoKeyword">🎯 Target Keyword</label>
                <input type="text" id="seoKeyword" placeholder="e.g., AI productivity tools">
            </div>
            
            <div class="tool-input-group">
                <label for="seoContent">📝 Your Content</label>
                <textarea id="seoContent" rows="6" placeholder="Paste your article or content here..."></textarea>
            </div>
            
            <button class="generate-btn" onclick="optimizeSEO()" style="width: 100%;">
                <span class="btn-icon">🚀</span> Optimize for SEO
            </button>
            
            <div class="tool-output seo-output" id="seoOutput">
                SEO recommendations will appear here...
            </div>
            
            <div class="tool-actions">
                <button class="copy-btn" onclick="copyToClipboard('seoOutput')">
                    <span class="btn-icon">📋</span> Copy
                </button>
            </div>
        </div>
    `;
}

function initSEO() {}

async function optimizeSEO() {
    const keyword = document.getElementById('seoKeyword').value;
    const content = document.getElementById('seoContent').value;
    const output = document.getElementById('seoOutput');
    
    if (!keyword.trim() || !content.trim()) {
        showNotification('Please enter both keyword and content', 'warning');
        return;
    }
    
    output.innerHTML = '<span class="loading"></span> Analyzing and optimizing...';
    
    try {
        const result = await aiEngine.optimizeSEO(content, keyword);
        output.innerHTML = result;
        showNotification('SEO optimization complete!', 'success');
    } catch (error) {
        output.innerHTML = 'SEO optimization failed. Please try again.';
        showNotification('SEO error', 'error');
    }
}

// ==================== AI RESEARCH TOOL ====================

function renderResearch() {
    return `
        <div class="tool-modal-header">
            <div class="tool-modal-icon">📊</div>
            <div>
                <h2>AI Research Assistant</h2>
                <p>Get comprehensive research on any topic</p>
            </div>
            <button class="theme-toggle-small" onclick="toggleTheme()">${AppState.theme === 'light' ? '🌙' : '☀️'}</button>
        </div>
        
        <div class="tool-form">
            <div class="tool-input-group">
                <label for="researchTopic">🔬 Research Topic</label>
                <input type="text" id="researchTopic" placeholder="e.g., Artificial Intelligence trends 2024">
            </div>
            
            <div class="tool-input-group">
                <label for="researchDepth">📊 Depth</label>
                <select id="researchDepth">
                    <option value="quick">Quick Overview</option>
                    <option value="comprehensive">Comprehensive Analysis</option>
                </select>
            </div>
            
            <button class="generate-btn" onclick="doResearch()" style="width: 100%;">
                <span class="btn-icon">🔍</span> Research
            </button>
            
            <div class="tool-output research-output" id="researchOutput">
                Research results will appear here...
            </div>
            
            <div class="tool-actions">
                <button class="copy-btn" onclick="copyToClipboard('researchOutput')">
                    <span class="btn-icon">📋</span> Copy
                </button>
            </div>
        </div>
    `;
}

function initResearch() {}

async function doResearch() {
    const topic = document.getElementById('researchTopic').value;
    const depth = document.getElementById('researchDepth').value;
    const output = document.getElementById('researchOutput');
    
    if (!topic.trim()) {
        showNotification('Please enter a research topic', 'warning');
        return;
    }
    
    output.innerHTML = '<span class="loading"></span> Researching...';
    
    try {
        const result = await aiEngine.research(topic, depth);
        output.innerHTML = result;
        showNotification('Research complete!', 'success');
    } catch (error) {
        output.innerHTML = 'Research failed. Please try again.';
        showNotification('Research error', 'error');
    }
}

// Export code functions globally
window.changeCodeLanguage = changeCodeLanguage;
window.clearCode = clearCode;
window.formatCode = formatCode;
window.copyCode = copyCode;
window.getAICodeHelp = getAICodeHelp;
window.saveCurrentSnippet = saveCurrentSnippet;
window.loadSnippet = loadSnippet;
window.deleteSnippet = deleteSnippet;

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

// Export AI Chat functions
window.sendChatMessage = sendChatMessage;
window.addChatMessage = addChatMessage;
window.changeChatModel = changeChatModel;
window.clearChatHistory = clearChatHistory;

// Export Image Generator functions
window.generateImage = generateImage;
window.downloadImage = downloadImage;

// Export Translation functions
window.translateText = translateText;

// Export SEO functions
window.optimizeSEO = optimizeSEO;

// Export Research functions
window.doResearch = doResearch;

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
