/**
 * AI Productivity Tools - Main Application
 * Complete JavaScript application with all AI-powered tools
 */

// Application State
const AppState = {
    currentTool: null,
    userData: {},
    settings: {
        apiKey: '',
        model: 'gpt-3.5-turbo',
        maxTokens: 500,
        temperature: 0.7
    }
};

// DOM Elements
const Elements = {};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    cacheElements();
    setupEventListeners();
    initAnimations();
}

function cacheElements() {
    Elements.modal = document.getElementById('toolModal');
    Elements.modalBody = document.getElementById('modalBody');
    Elements.contactForm = document.getElementById('contactForm');
    Elements.navLinks = document.querySelectorAll('.nav-links a');
}

function setupEventListeners() {
    // Smooth scrolling for navigation
    Elements.navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // Contact form submission
    if (Elements.contactForm) {
        Elements.contactForm.addEventListener('submit', handleContactSubmit);
    }

    // CTA buttons
    document.querySelectorAll('.cta-button, .primary-btn').forEach(btn => {
        btn.addEventListener('click', handleCTAClick);
    });

    // Pricing buttons
    document.querySelectorAll('.pricing-btn').forEach(btn => {
        btn.addEventListener('click', handlePricingClick);
    });

    // Intersection Observer for scroll animations
    setupScrollAnimations();
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
    
    // Show success message
    showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
    e.target.reset();
}

function handleCTAClick(e) {
    // Scroll to tools section
    document.getElementById('tools').scrollIntoView({ behavior: 'smooth' });
}

function handlePricingClick(e) {
    const card = e.target.closest('.pricing-card');
    const planName = card.querySelector('h3').textContent;
    
    showNotification(`You've selected the ${planName} plan!`, 'info');
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.tool-card, .feature, .testimonial, .pricing-card').forEach(el => {
        observer.observe(el);
    });
}

function initAnimations() {
    // Add hover effects to cards
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// Tool Modal Functions
function openTool(toolName) {
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

    // Initialize the specific tool
    initTool(toolName);
}

function closeModal() {
    Elements.modal.classList.remove('active');
    document.body.style.overflow = '';
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

// Tool Render Functions
function renderWritingAssistant() {
    return `
        <div class="tool-modal-header">
            <div class="tool-modal-icon">✍️</div>
            <div>
                <h2>AI Writing Assistant</h2>
                <p>Create professional content in seconds</p>
            </div>
        </div>
        
        <div class="tool-template-grid">
            <button class="template-btn active" data-template="email">📧 Email</button>
            <button class="template-btn" data-template="blog">📝 Blog</button>
            <button class="template-btn" data-template="resume">📄 Resume</button>
            <button class="template-btn" data-template="social">📱 Social Media</button>
            <button class="template-btn" data-template="business">💼 Business</button>
            <button class="template-btn" data-template="creative">🎨 Creative</button>
        </div>

        <div class="tool-form">
            <div class="tool-input-group">
                <label for="writingTopic">Topic or Subject</label>
                <input type="text" id="writingTopic" placeholder="e.g., Introduction email for new client">
            </div>
            
            <div class="tool-input-group">
                <label for="writingTone">Tone</label>
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
                <label for="writingDetails">Additional Details</label>
                <textarea id="writingDetails" rows="3" placeholder="Any specific points or requirements..."></textarea>
            </div>
            
            <div class="tool-output" id="writingOutput">
                Your AI-generated content will appear here...
            </div>
            
            <div class="tool-actions">
                <button class="generate-btn" onclick="generateWriting()">
                    ✨ Generate Content
                </button>
                <button class="copy-btn" onclick="copyToClipboard('writingOutput')">
                    📋 Copy
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
                <label for="newTask">Add New Task</label>
                <div style="display: flex; gap: 0.5rem;">
                    <input type="text" id="newTask" placeholder="What needs to be done?">
                    <select id="taskPriority">
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <button class="generate-btn" onclick="addTask()">Add</button>
                </div>
            </div>
            
            <div class="task-list" id="taskList">
                <!-- Tasks will be rendered here -->
            </div>
            
            <div class="tool-output" id="aiSuggestions">
                🤖 AI Suggestions will appear here based on your tasks...
            </div>
            
            <div class="tool-actions">
                <button class="generate-btn" onclick="getAITaskSuggestions()">
                    💡 Get AI Suggestions
                </button>
                <button class="copy-btn" onclick="copyToClipboard('aiSuggestions')">
                    📋 Copy
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
            <button class="template-btn" data-template="email">💬 Email</button>
            <button class="template-btn" data-template="marketing">📢 Marketing</button>
            <button class="template-btn" data-template="proposal">📋 Proposal</button>
        </div>

        <div class="tool-form">
            <div class="tool-input-group">
                <label for="businessType">Business Document Type</label>
                <select id="businessType">
                    <option value="invoice">Invoice</option>
                    <option value="quote">Quote</option>
                    <option value="proposal">Business Proposal</option>
                    <option value="email">Customer Email</option>
                    <option value="marketing">Marketing Copy</option>
                    <option value="description">Product Description</option>
                </select>
            </div>
            
            <div class="tool-input-group">
                <label for="businessDetails">Details</label>
                <textarea id="businessDetails" rows="4" placeholder="Provide details about what you need..."></textarea>
            </div>
            
            <div class="tool-output" id="businessOutput">
                Your business document will appear here...
            </div>
            
            <div class="tool-actions">
                <button class="generate-btn" onclick="generateBusinessDoc()">
                    ✨ Generate Document
                </button>
                <button class="copy-btn" onclick="copyToClipboard('businessOutput')">
                    📋 Copy
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
                <p>Study smarter, not harder</p>
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
                <label for="studentToolType">What do you need?</label>
                <select id="studentToolType">
                    <option value="summary">Summarize Notes/Text</option>
                    <option value="questions">Generate Exam Questions</option>
                    <option value="plan">Create Study Plan</option>
                    <option value="essay">Essay Assistance</option>
                    <option value="flashcards">Create Flashcards</option>
                </select>
            </div>
            
            <div class="tool-input-group">
                <label for="studentContent">Your Content</label>
                <textarea id="studentContent" class="notes-input" placeholder="Paste your notes, text, or describe what you need..."></textarea>
            </div>
            
            <div class="tool-output" id="studentOutput">
                Your AI-generated study content will appear here...
            </div>
            
            <div class="tool-actions">
                <button class="generate-btn" onclick="generateStudentContent()">
                    ✨ Generate
                </button>
                <button class="copy-btn" onclick="copyToClipboard('studentOutput')">
                    📋 Copy
                </button>
            </div>
        </div>
    `;
}

// Tool Initialization Functions
function initTool(toolName) {
    switch(toolName) {
        case 'writing':
            initWritingAssistant();
            break;
        case 'tasks':
            initTaskManager();
            break;
        case 'business':
            initBusinessToolkit();
            break;
        case 'student':
            initStudentTool();
            break;
    }
}

function initWritingAssistant() {
    // Set up template buttons
    document.querySelectorAll('#modalBody .template-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#modalBody .template-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Update placeholder based on template
            const template = e.target.dataset.template;
            const topicInput = document.getElementById('writingTopic');
            if (template === 'email') {
                topicInput.placeholder = 'e.g., Follow-up email after interview';
            } else if (template === 'blog') {
                topicInput.placeholder = 'e.g., 5 Tips for Better Productivity';
            } else if (template === 'resume') {
                topicInput.placeholder = 'e.g., Software Developer resume for tech startup';
            } else if (template === 'social') {
                topicInput.placeholder = 'e.g., Instagram post about new product launch';
            } else if (template === 'business') {
                topicInput.placeholder = 'e.g., Mission statement for eco-friendly company';
            } else if (template === 'creative') {
                topicInput.placeholder = 'e.g., Short story about time travel';
            }
        });
    });
}

function initTaskManager() {
    // Load saved tasks
    loadTasks();
    
    // Set up enter key for adding tasks
    const taskInput = document.getElementById('newTask');
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
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
    
    // Show loading state
    output.innerHTML = '<span class="loading"></span> Generating content...';
    
    // Simulate AI generation (in production, this would call an API)
    setTimeout(() => {
        const content = generateAIContent('writing', { topic, tone, details });
        output.innerHTML = content;
        showNotification('Content generated successfully!', 'success');
    }, 1500);
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
    
    output.innerHTML = '<span class="loading"></span> Analyzing your tasks...';
    
    setTimeout(() => {
        const suggestions = generateAISuggestions(pendingTasks);
        output.innerHTML = suggestions;
        showNotification('AI suggestions ready!', 'success');
    }, 1500);
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
    
    output.innerHTML = '<span class="loading"></span> Generating document...';
    
    setTimeout(() => {
        const content = generateAIContent('business', { type, details });
        output.innerHTML = content;
        showNotification('Document generated successfully!', 'success');
    }, 1500);
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

// AI Content Generation (Simulated - Replace with real API calls in production)
function generateAIContent(type, data) {
    // This is a simulation. In production, integrate with OpenAI API
    
    const templates = {
        writing: {
            professional: `Dear [Recipient],

I hope this message finds you well. I'm writing regarding ${data.topic.toLowerCase()}.

${data.details ? `Additional context: ${data.details}\n\n` : ''}I wanted to reach out to discuss this matter further and explore how we can move forward together.

Please let me know if you would be available for a brief call or meeting to discuss this in more detail.

Best regards,
[Your Name]`,
            
            casual: `Hey there! 👋

So, ${data.topic.toLowerCase()} - been on my mind lately!

${data.details ? `Here's the deal: ${data.details}\n\n` : ''}Would love to hear your thoughts on this. Let me know what you think!

Cheers!`,
            
            friendly: `Hi there! 🌟

I'm excited to share something with you about ${data.topic.toLowerCase()}!

${data.details ? `Here's what I wanted to mention: ${data.details}\n\n` : ''}Looking forward to hearing from you soon!

Best wishes`
        },
        
        business: {
            invoice: `INVOICE
═══════════════════════════════════════

Invoice #: INV-${Date.now().toString().slice(-6)}
Date: ${new Date().toLocaleDateString()}

Bill To:
[Client Name]
[Client Address]

Description                          Amount
─────────────────────────────────────────────
${data.details || 'Professional Services'}    $XXX.XX

═══════════════════════════════════════
Subtotal:                          $XXX.XX
Tax:                                $XX.XX
─────────────────────────────────────────────
TOTAL:                              $XXX.XX

Payment due within 30 days.
Thank you for your business!`,
            
            quote: `QUOTE
═══════════════════════════════════════

Quote #: QT-${Date.now().toString().slice(-6)}
Date: ${new Date().toLocaleDateString()}

Prepared for:
[Client Name]

${data.details ? `Project: ${data.details}\n\n` : ''}
Item/Service                       Price
─────────────────────────────────────────────
[Service Description]              $X,XXX.XX

═══════════════════════════════════════
Total:                              $X,XXX.XX

Valid for 30 days from date of quote.`,
            
            email: `Subject: ${data.details ? data.details.split('\n')[0] : 'Quick Question'}}

Hi [Name],

${data.details || 'I hope you\'re doing well!'}

${data.details ? data.details.split('\n').slice(1).join('\n') : '\n\nLooking forward to hearing from you.\n\nBest regards,\n[Your Name]'}`
        },
        
        student: {
            summary: `📚 SUMMARY

Key Points from Your Content:

1. [Main Point 1 - Generated from your content]
2. [Main Point 2 - Generated from your content]
3. [Main Point 3 - Generated from your content]

Takeaway: ${data.content.substring(0, 100)}...

💡 Tip: Focus on understanding the core concepts rather than memorizing details.`,
            
            questions: `📝 PRACTICE QUESTIONS

Based on your material:

1. What are the key concepts discussed in your content?
   → Answer: [Key concepts extracted from content]

2. How do [concept from content] relate to [related concept]?
   → Answer: [AI-generated explanation]

3. Can you explain the significance of [topic from content]?
   → Answer: [Detailed explanation]

4. What are the main arguments presented?
   → Answer: [Summary of arguments]

5. How would you apply [concept] in a practical scenario?
   → Answer: [Real-world application]`,
            
            plan: `📅 PERSONALIZED STUDY PLAN

Recommended Schedule:

Week 1: Foundation
- Day 1-2: Review core concepts
- Day 3-4: Practice basic exercises
- Day 5: Self-assessment quiz

Week 2: Deep Dive
- Day 1-2: Advanced topics
- Day 3-4: Application practice
- Day 5: Review & reinforce

Week 3: Mastery
- Day 1-2: Complex problems
- Day 3-4: Past papers/practice tests
- Day 5: Final review

💡 Study Tips:
- Take breaks every 45 minutes
- Use active recall techniques
- Teach concepts to others`
        }
    };
    
    if (type === 'writing') {
        return templates.writing[data.tone] || templates.writing.professional;
    } else if (type === 'business') {
        return templates.business[data.type] || templates.business.email;
    } else if (type === 'student') {
        return templates.student[data.toolType] || templates.student.summary;
    }
    
    return 'Content generation failed. Please try again.';
}

function generateAISuggestions(pendingTasks) {
    const highPriority = pendingTasks.filter(t => t.priority === 'high' && !t.completed);
    const mediumPriority = pendingTasks.filter(t => t.priority === 'medium' && !t.completed);
    const lowPriority = pendingTasks.filter(t => t.priority === 'low' && !t.completed);
    
    let suggestions = `🤖 **AI Productivity Analysis**

📊 **Task Overview:**
• Total pending: ${pendingTasks.length}
• High priority: ${highPriority.length}
• Medium priority: ${mediumPriority.length}
• Low priority: ${lowPriority.length}

💡 **Recommendations:**

1. **Start with:** ${highPriority.length > 0 ? highPriority[0].text : 'No high priority tasks'}

2. **Best time to work:** Morning (9 AM - 12 PM) for complex tasks

3. **Suggested approach:**
   • Complete high-priority tasks first
   • Take a 15-minute break
   • Tackle medium tasks
   • Finish with low-priority items

4. **Productivity tip:** Try the Pomodoro technique - 25 minutes work, 5 minutes break.

${highPriority.length > 0 ? `\n🎯 **Focus Area:** ${highPriority[0].text}` : ''}
`;
    
    return suggestions;
}

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
window.generateWriting = generateWriting;
window.addTask = addTask;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.getAITaskSuggestions = getAITaskSuggestions;
window.generateBusinessDoc = generateBusinessDoc;
window.generateStudentContent = generateStudentContent;
window.copyToClipboard = copyToClipboard;

