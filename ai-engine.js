
/**
 * AI Engine - Professional AI Integration Module
 * Multi-provider AI capabilities with caching and offline support
 * 
 * @version 2.0.0
 * @author AI Productivity Tools
 * @description Features: GPT-4, Claude, Gemini, Image Generation, Code Analysis, and more
 */

import { createLogger } from './src/core/logger.js';
import { debounce, throttle } from './src/core/validation.js';

const logger = createLogger('AIEngine');

/**
 * AI Model configurations
 * @typedef {Object} ModelConfig
 * @property {string} name - Display name
 * @property {string} provider - Provider name
 * @property {number} strength - Capability score (0-100)
 * @property {string} endpoint - API endpoint
 */

/**
 * AI Engine class providing multi-provider AI integration
 */
class AIEngine {
    constructor() {
        this.apiKey = localStorage.getItem('openai_api_key') || '';
        this.anthropicKey = localStorage.getItem('anthropic_api_key') || '';
        this.geminiKey = localStorage.getItem('gemini_api_key') || '';
        this.model = 'gpt-4-turbo-preview';
        this.maxTokens = 4000;
        this.temperature = 0.7;
        this.cache = new Map();
        this.chatHistory = [];
        this.offlineResponses = this.loadOfflineResponses();
        
        // Available models
        this.models = {
            'gpt-4-turbo-preview': { name: 'GPT-4 Turbo', provider: 'OpenAI', strength: 95 },
            'gpt-4': { name: 'GPT-4', provider: 'OpenAI', strength: 93 },
            'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', provider: 'OpenAI', strength: 75 },
            'claude-3-opus': { name: 'Claude 3 Opus', provider: 'Anthropic', strength: 97 },
            'claude-3-sonnet': { name: 'Claude 3 Sonnet', provider: 'Anthropic', strength: 90 },
            'gemini-pro': { name: 'Gemini Pro', provider: 'Google', strength: 88 }
        };
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('openai_api_key', key);
    }

    setAnthropicKey(key) {
        this.anthropicKey = key;
        localStorage.setItem('anthropic_api_key', key);
    }

    setGeminiKey(key) {
        this.geminiKey = key;
        localStorage.setItem('gemini_api_key', key);
    }

    setModel(model) {
        this.model = model;
    }

    isConfigured() {
        return this.apiKey.length > 0 || this.anthropicKey.length > 0 || this.geminiKey.length > 0;
    }

    getAvailableProviders() {
        const providers = [];
        if (this.apiKey) providers.push('OpenAI');
        if (this.anthropicKey) providers.push('Anthropic');
        if (this.geminiKey) providers.push('Google Gemini');
        return providers;
    }

    // Load cached offline responses
    loadOfflineResponses() {
        try {
            const stored = localStorage.getItem('offline_ai_responses');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.warn('Failed to load offline responses:', error);
            return {};
        }
    }

    // Save response for offline use
    saveOfflineResponse(key, response) {
        try {
            this.offlineResponses[key] = {
                response,
                timestamp: Date.now()
            };
            localStorage.setItem('offline_ai_responses', JSON.stringify(this.offlineResponses));
        } catch (error) {
            console.warn('Failed to save offline response:', error);
        }
    }

    // Get offline response if available and recent
    getOfflineResponse(key) {
        const cached = this.offlineResponses[key];
        if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
            return cached.response;
        }
        return null;
    }

    // Generate a unique key for caching requests
    generateRequestKey(systemPrompt, userPrompt) {
        return btoa(systemPrompt.substring(0, 25) + userPrompt.substring(0, 25)).substring(0, 50);
    }

    // Main AI generation with model selection
    async generate(systemPrompt, userPrompt, options = {}) {
        const model = options.model || this.model;
        const modelInfo = this.models[model] || this.models['gpt-4-turbo-preview'];
        
        // Check which provider to use
        if (model.startsWith('claude') && this.anthropicKey) {
            return this.generateWithClaude(systemPrompt, userPrompt, model);
        } else if (model === 'gemini-pro' && this.geminiKey) {
            return this.generateWithGemini(systemPrompt, userPrompt);
        } else if (this.apiKey) {
            return this.generateWithOpenAI(systemPrompt, userPrompt, model);
        } else if (this.anthropicKey) {
            return this.generateWithClaude(systemPrompt, userPrompt, 'claude-3-opus');
        }
        
        throw new Error('No API key configured. Please add your API key in settings.');
    }

    // OpenAI API
    async generateWithOpenAI(systemPrompt, userPrompt, model = 'gpt-4-turbo-preview') {
        const cacheKey = `${model}|${systemPrompt.substring(0, 50)}|${userPrompt.substring(0, 50)}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    max_tokens: options?.maxTokens || this.maxTokens,
                    temperature: options?.temperature || this.temperature,
                    top_p: 0.95,
                    frequency_penalty: 0.1,
                    presence_penalty: 0.1
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API request failed');
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content || '';

            this.cache.set(cacheKey, content);
            return content;
        } catch (error) {
            console.error('OpenAI Generation Error:', error);
            throw error;
        }
    }

    // Anthropic Claude API
    async generateWithClaude(systemPrompt, userPrompt, model = 'claude-3-opus') {
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.anthropicKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: model,
                    max_tokens: options?.maxTokens || this.maxTokens,
                    system: systemPrompt,
                    messages: [
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: options?.temperature || this.temperature
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Claude API request failed');
            }

            const data = await response.json();
            return data.content[0]?.text || '';
        } catch (error) {
            console.error('Claude Generation Error:', error);
            throw error;
        }
    }

    // Google Gemini API
    async generateWithGemini(systemPrompt, userPrompt) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.geminiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${systemPrompt}\n\n${userPrompt}`
                        }]
                    }],
                    generationConfig: {
                        temperature: options?.temperature || this.temperature,
                        maxOutputTokens: options?.maxTokens || this.maxTokens
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Gemini API request failed');
            }

            const data = await response.json();
            return data.candidates[0]?.content?.parts[0]?.text || '';
        } catch (error) {
            console.error('Gemini Generation Error:', error);
            throw error;
        }
    }

    // Chat with AI (conversation style)
    async chat(message, context = '') {
        this.chatHistory.push({ role: 'user', content: message });
        
        const systemPrompt = context || 'You are a helpful AI assistant. Provide detailed, accurate, and well-structured responses.';
        
        const response = await this.generate(systemPrompt, message);
        
        this.chatHistory.push({ role: 'assistant', content: response });
        
        // Keep history manageable
        if (this.chatHistory.length > 20) {
            this.chatHistory = this.chatHistory.slice(-20);
        }
        
        return response;
    }

    // Clear chat history
    clearChat() {
        this.chatHistory = [];
    }

    // Generate Text (for code editor and other tools)
    async generateText(prompt, maxTokens = 500) {
        return this.generate(
            'You are a helpful AI assistant. Provide concise and accurate responses.',
            prompt,
            { maxTokens }
        );
    }

    // ==================== WRITING ASSISTANT ====================
    async generateWriting(type, topic, tone, details) {
        const systemPrompts = {
            email: 'You are a WORLD-CLASS professional email writer. Write crystal-clear, compelling emails that get results. Use perfect grammar and persuasive techniques.',
            blog: 'You are an SEO MASTER and viral content creator. Write scroll-stopping blog posts that rank #1 on Google and engage readers to the last word.',
            resume: 'You are a CAREER COACH and ATS expert. Create resumes that bypass ATS systems and impress hiring managers. Highlight achievements with metrics.',
            social: 'You are a VIRAL social media strategist. Create content that stops the scroll, sparks engagement, and builds a loyal following.',
            business: 'You are a BUSINESS COMMUNICATIONS expert. Write professional documents that close deals and build relationships.',
            creative: 'You are an AWARD-WINNING creative writer. Craft compelling narratives that captivate and inspire.',
            press: 'You are a PR expert. Write professional press releases that get media coverage.',
            speech: 'You are a SPEECHWRITER for world leaders. Craft powerful speeches that move audiences.'
        };

        const enhancedPrompt = `${tone ? `Use a ${tone} tone. ` : ''}${details ? `Additional requirements: ${details}\n\n` : ''}Topic: ${topic}`;

        return this.generate(systemPrompts[type] || systemPrompts.email, enhancedPrompt, { maxTokens: 2000 });
    }

    // ==================== BUSINESS DOCUMENTS ====================
    async generateBusinessDoc(type, details) {
        const systemPrompts = {
            invoice: 'You are a FINANCIAL EXPERT. Create professional, legally-compliant invoices that ensure fast payment.',
            quote: 'You are a SALES professional. Create quotes that win deals and justify your pricing.',
            proposal: 'You are a PROPOSAL MASTER. Write winning proposals that address pain points and showcase value.',
            email: 'You are a BUSINESS COMMUNICATIONS expert. Write emails that drive action.',
            marketing: 'You are a DIRECT RESPONSE copywriter. Write marketing that converts browsers to buyers.',
            contract: 'You are a LEGAL expert. Draft clear, enforceable contracts.',
            business_plan: 'You are a BUSINESS STRATEGIST. Create comprehensive business plans that attract investors.',
            meeting: 'You are a MEETING facilitator. Create structured meeting agendas that maximize productivity.'
        };

        return this.generate(systemPrompts[type] || systemPrompts.email, details, { maxTokens: 2000 });
    }

    // ==================== STUDENT TOOLS ====================
    async generateStudentContent(type, content) {
        const systemPrompts = {
            summary: 'You are a LEARNING EXPERT. Create crystal-clear summaries that capture essential concepts. Use bullet points and visual formatting.',
            questions: 'You are an EXPERT EDUCATOR. Create challenging practice questions that test deep understanding. Include various difficulty levels.',
            plan: 'You are a PRODUCTIVITY coach. Create detailed study schedules optimized for retention and performance.',
            essay: 'You are a PROFESSIONAL EDITOR. Help structure essays with compelling arguments and perfect flow.',
            flashcards: 'You are a MEMORY expert. Create flashcards that use proven memory techniques like spaced repetition.',
            notes: 'You are a NOTE-TAKING expert. Create organized, comprehensive notes that make learning easy.'
        };

        const userPrompts = {
            summary: `Create a comprehensive summary with key points, definitions, and examples:\n\n${content}`,
            questions: `Generate 10 practice questions (3 easy, 4 medium, 3 hard) with answers:\n\n${content}`,
            plan: `Create a personalized study plan with daily/weekly goals:\n\n${content}`,
            essay: `Help create a structured essay outline with thesis, arguments, and conclusion:\n\n${content}`,
            flashcards: `Create 15 effective flashcards using memory techniques:\n\n${content}`,
            notes: `Create detailed, organized notes with headings and key concepts:\n\n${content}`
        };

        return this.generate(systemPrompts[type] || systemPrompts.summary, userPrompts[type], { maxTokens: 2000 });
    }

    // ==================== TASK MANAGEMENT AI ====================
    async getTaskSuggestions(tasks) {
        const pendingTasks = tasks.filter(t => !t.completed);
        const systemPrompt = `You are the WORLD'S BEST productivity expert. Analyze tasks and provide:
1. Optimal prioritization (Eisenhower Matrix)
2. Time blocking suggestions
3. Dependencies and sequencing
4. Energy management tips
5. Quick wins identification

Be specific, actionable, and data-driven.`;
        
        const userPrompt = `Analyze these ${pendingTasks.length} tasks and provide smart recommendations:\n\n${pendingTasks.map(t => `- [${t.priority.toUpperCase()}] ${t.text}`).join('\n')}\n\nAlso consider my schedule and energy levels.`;

        return this.generate(systemPrompt, userPrompt, { maxTokens: 1500 });
    }

    // ==================== CODE EDITOR AI ====================
    async getCodeHelp(code, action) {
        const systemPrompts = {
            explain: 'You are a SOFTWARE ARCHITECT and coding expert. Explain code clearly with examples, diagrams (using text), and best practices.',
            debug: 'You are a DEBUGGING MASTER. Find bugs, security issues, and errors. Provide specific fixes with line numbers.',
            optimize: 'You are a PERFORMANCE OPTIMIZATION expert. Improve code for speed, memory, readability, and best practices.',
            review: 'You are a CODE REVIEW expert. Provide comprehensive feedback on code quality, security, and improvements.',
            complete: 'You are an AI CODE COMPLETION engine. Complete the code intelligently, maintaining the same style and patterns.',
            test: 'You are a TESTING expert. Write comprehensive unit tests with good coverage.'
        };

        const actionPrompts = {
            explain: `Explain this code in detail:\n\n${code}`,
            debug: `Find all bugs, errors, and issues. Provide fixes:\n\n${code}`,
            optimize: `Optimize this code for best performance:\n\n${code}`,
            review: `Provide a comprehensive code review:\n\n${code}`,
            test: `Write unit tests for this code:\n\n${code}`
        };

        return this.generate(systemPrompts[action] || systemPrompts.explain, actionPrompts[action] || code, { maxTokens: 2000 });
    }

    // ==================== AI IMAGE GENERATION ====================
    async generateImage(prompt, size = '1024x1024') {
        if (!this.apiKey) {
            throw new Error('OpenAI API key required for image generation');
        }

        try {
            const response = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    prompt: prompt,
                    n: 1,
                    size: size,
                    quality: 'hd'
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Image generation failed');
            }

            const data = await response.json();
            return data.data[0]?.url || '';
        } catch (error) {
            console.error('Image Generation Error:', error);
            throw error;
        }
    }

    // ==================== AI TRANSLATION ====================
    async translate(text, targetLanguage, sourceLanguage = 'auto') {
        const systemPrompt = `You are a PROFESSIONAL translator. Translate accurately while preserving the original meaning, tone, and nuance.`;
        const userPrompt = `Translate from ${sourceLanguage === 'auto' ? 'any language' : sourceLanguage} to ${targetLanguage}:\n\n${text}`;
        
        return this.generate(systemPrompt, userPrompt, { maxTokens: 2000 });
    }

    // ==================== AI DATA ANALYSIS ====================
    async analyzeData(data, analysisType) {
        const systemPrompts = {
            trends: 'You are a DATA SCIENTIST. Analyze trends, patterns, and insights from data. Use statistical reasoning.',
            visualization: 'You are a DATA VISUALIZATION expert. Suggest the best charts and graphs for presenting this data.',
            summary: 'You are a BUSINESS ANALYST. Provide executive summaries with key metrics and KPIs.',
            forecast: 'You are a FORECASTING expert. Predict future trends based on historical data patterns.'
        };

        return this.generate(
            systemPrompts[analysisType] || systemPrompts.summary,
            `Analyze this data:\n\n${data}`,
            { maxTokens: 2000 }
        );
    }

    // ==================== AI RESEARCH ====================
    async research(topic, depth = 'comprehensive') {
        const systemPrompt = depth === 'quick' 
            ? 'You are a research assistant. Provide quick, accurate answers with sources.'
            : 'You are a SENIOR RESEARCH ANALYST. Provide comprehensive research with citations, statistics, and expert insights.';

        const userPrompt = `Research: ${topic}\n\nProvide ${depth} findings with:\n- Key facts\n- Statistics\n- Expert opinions\n- Related topics\n- Sources`;

        return this.generate(systemPrompt, userPrompt, { maxTokens: 3000 });
    }

    // ==================== AI CONTENT REPURPOSING ====================
    async repurpose(content, targetFormat) {
        const formats = {
            twitter: 'Create engaging Twitter threads (5-10 tweets) that capture key points.',
            linkedin: 'Create a professional LinkedIn post that showcases expertise.',
            video: 'Create a video script with hooks, main points, and CTA.',
            podcast: 'Create a podcast outline with talking points and segments.',
            infographic: 'Create content structured for visual infographic design.',
            newsletter: 'Create an engaging newsletter with sections and highlights.'
        };

        return this.generate(
            formats[targetFormat] || formats.linkedin,
            `Repurpose this content:\n\n${content}`,
            { maxTokens: 1500 }
        );
    }

    // ==================== AI SEO OPTIMIZATION ====================
    async optimizeSEO(content, keyword) {
        const systemPrompt = 'You are an SEO MASTER. Optimize content for Google rankings with keyword placement, meta tags, and semantic keywords.';
        
        const userPrompt = `Optimize this content for the keyword "${keyword}":
        
${content}

Provide:
1. SEO Title (50-60 chars)
2. Meta Description (150-160 chars)
3. H2/H3 headings
4. Keyword density recommendations
5. Internal linking suggestions
6. Content improvements`;

        return this.generate(systemPrompt, userPrompt, { maxTokens: 1500 });
    }

    // ==================== AI EMAIL OUTREACH ====================
    async generateOutreach(type, recipient, goal) {
        const systemPrompts = {
            cold: 'You are a COLD EMAIL expert. Write personalized cold emails that get responses.',
            follow: 'You are a SALES professional. Write effective follow-up sequences.',
            networking: 'You are a NETWORKING expert. Create genuine connection requests.',
            partnership: 'You are a PARTNERSHIP director. Write compelling partnership proposals.',
            investor: 'You are a PITCH expert. Write investor emails that get meetings.'
        };

        return this.generate(
            systemPrompts[type] || systemPrompts.cold,
            `Recipient: ${recipient}\nGoal: ${goal}\n\nWrite a compelling outreach email.`,
            { maxTokens: 1000 }
        );
    }

    // ==================== AI INTERVIEW PREP ====================
    async interviewPrep(role, company, experience) {
        const systemPrompt = 'You are a CAREER COACH and interview expert. Prepare candidates for success with specific, actionable responses.';
        
        const userPrompt = `Prepare me for a ${role} interview at ${company}.
        
My background: ${experience}

Provide:
1. Likely technical questions with sample answers
2. Behavioral questions (STAR method)
3. Questions to ask the interviewer
4. Company-specific preparation tips
5. Body language tips`;

        return this.generate(systemPrompt, userPrompt, { maxTokens: 2500 });
    }

    // ==================== AI LEGAL DOCUMENTS ====================
    async generateLegal(documentType, details) {
        const systemPrompt = 'You are a LEGAL EXPERT. Draft professional, legally-sound documents. Include necessary disclaimers and clauses.';
        
        const userPrompt = `Create a ${documentType} with these details:\n\n${details}\n\nEnsure it follows best practices and includes standard clauses.`;

        return this.generate(systemPrompt, userPrompt, { maxTokens: 2500 });
    }
}

// Export instance
window.aiEngine = new AIEngine();

