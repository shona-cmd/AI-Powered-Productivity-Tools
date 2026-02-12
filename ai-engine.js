/**
 * AI Engine - OpenAI API Integration
 * Handles all AI-powered generation requests
 */

class AIEngine {
    constructor() {
        this.apiKey = localStorage.getItem('openai_api_key') || '';
        this.model = 'gpt-3.5-turbo';
        this.maxTokens = 1000;
        this.temperature = 0.7;
        this.cache = new Map();
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('openai_api_key', key);
    }

    isConfigured() {
        return this.apiKey.length > 0;
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

    async generate(systemPrompt, userPrompt) {
        if (!this.isConfigured()) {
            throw new Error('API key not configured');
        }

        const cacheKey = `${systemPrompt.substring(0, 50)}|${userPrompt.substring(0, 50)}`;
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
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    max_tokens: this.maxTokens,
                    temperature: this.temperature
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API request failed');
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content || '';

            this.cache.set(cacheKey, content);

            // Save for offline use
            const requestKey = this.generateRequestKey(systemPrompt, userPrompt);
            this.saveOfflineResponse(requestKey, content);

            return content;
        } catch (error) {
            // If network fails, try offline response
            if (!navigator.onLine) {
                const requestKey = this.generateRequestKey(systemPrompt, userPrompt);
                const offlineResponse = this.getOfflineResponse(requestKey);
                if (offlineResponse) {
                    console.log('Using offline AI response');
                    showNotification('Using cached response (offline mode)', 'info');
                    return offlineResponse;
                }
            }
            console.error('AI Generation Error:', error);
            throw error;
        }
    }

    // Writing Assistant
    async generateWriting(type, topic, tone, details) {
        const systemPrompts = {
            email: 'You are a professional email writer. Write clear, concise, and effective emails.',
            blog: 'You are an expert blog writer. Create engaging, SEO-friendly blog content.',
            resume: 'You are a professional resume writer. Create ATS-optimized resumes.',
            social: 'You are a social media expert. Create engaging posts for social platforms.',
            business: 'You are a business communications expert.',
            creative: 'You are a creative writer. Be imaginative and engaging.'
        };

        const userPrompt = `Write a ${tone} piece about: ${topic}${details ? `\n\nAdditional details: ${details}` : ''}`;

        return this.generate(systemPrompts[type] || systemPrompts.email, userPrompt);
    }

    // Business Documents
    async generateBusinessDoc(type, details) {
        const systemPrompts = {
            invoice: 'You are a professional business writer. Create clean, professional invoices.',
            quote: 'You are a business development professional. Create compelling quotes.',
            proposal: 'You are a business proposal expert. Write persuasive proposals.',
            email: 'You are a professional business email writer.',
            marketing: 'You are a marketing copywriter. Create compelling marketing content.',
            description: 'You are a product description expert. Write engaging descriptions.'
        };

        const userPrompt = `Create a ${type} with these details: ${details}`;
        return this.generate(systemPrompts[type] || systemPrompts.email, userPrompt);
    }

    // Student Tools
    async generateStudentContent(type, content) {
        const systemPrompts = {
            summary: 'You are an expert at summarizing complex content into key points.',
            questions: 'You are an educator who creates practice questions from study materials.',
            plan: 'You are a study planner who creates effective learning schedules.',
            essay: 'You are a writing tutor who helps structure essays.',
            flashcards: 'You are an educator who creates effective flashcards.'
        };

        const userPrompts = {
            summary: `Summarize this content into key points:\n\n${content}`,
            questions: `Generate 5 practice questions from this material:\n\n${content}`,
            plan: `Create a study plan based on this content:\n\n${content}`,
            essay: `Help me structure an essay from this:\n\n${content}`,
            flashcards: `Create 10 flashcards from this content:\n\n${content}`
        };

        return this.generate(systemPrompts[type], userPrompts[type]);
    }

    // Task Management AI
    async getTaskSuggestions(tasks) {
        const pendingTasks = tasks.filter(t => !t.completed);
        const systemPrompt = 'You are a productivity expert. Analyze tasks and provide smart suggestions.';
        const userPrompt = `Analyze these tasks and provide recommendations:\n\n${pendingTasks.map(t => `- [${t.priority.toUpperCase()}] ${t.text}`).join('\n')}`;

        return this.generate(systemPrompt, userPrompt);
    }
}

// Export instance
window.aiEngine = new AIEngine();

