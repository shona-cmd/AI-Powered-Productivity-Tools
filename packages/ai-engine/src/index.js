/**
 * AI Engine - Multi-Provider AI Integration
 * Supports OpenAI GPT-4, Anthropic Claude, and Google Gemini
 * 
 * @module ai-engine
 */

class AIEngine {
    constructor(options = {}) {
        this.apiKey = options.apiKey || '';
        this.anthropicKey = options.anthropicKey || '';
        this.geminiKey = options.geminiKey || '';
        this.model = options.model || 'gpt-4-turbo-preview';
        this.maxTokens = options.maxTokens || 4000;
        this.temperature = options.temperature || 0.7;
        this.cache = new Map();
        
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

    /**
     * Set OpenAI API key
     * @param {string} key - OpenAI API key
     */
    setApiKey(key) {
        this.apiKey = key;
    }

    /**
     * Set Anthropic API key
     * @param {string} key - Anthropic API key
     */
    setAnthropicKey(key) {
        this.anthropicKey = key;
    }

    /**
     * Set Google Gemini API key
     * @param {string} key - Gemini API key
     */
    setGeminiKey(key) {
        this.geminiKey = key;
    }

    /**
     * Set the model to use
     * @param {string} model - Model name
     */
    setModel(model) {
        this.model = model;
    }

    /**
     * Check if the engine is configured with any API key
     * @returns {boolean}
     */
    isConfigured() {
        return this.apiKey.length > 0 || this.anthropicKey.length > 0 || this.geminiKey.length > 0;
    }

    /**
     * Get available providers based on configured keys
     * @returns {string[]}
     */
    getAvailableProviders() {
        const providers = [];
        if (this.apiKey) providers.push('OpenAI');
        if (this.anthropicKey) providers.push('Anthropic');
        if (this.geminiKey) providers.push('Google Gemini');
        return providers;
    }

    /**
     * Generate a unique key for caching requests
     * @param {string} systemPrompt - System prompt
     * @param {string} userPrompt - User prompt
     * @returns {string}
     */
    generateRequestKey(systemPrompt, userPrompt) {
        return btoa(systemPrompt.substring(0, 25) + userPrompt.substring(0, 25)).substring(0, 50);
    }

    /**
     * Main AI generation with automatic model selection
     * @param {string} systemPrompt - System prompt
     * @param {string} userPrompt - User prompt
     * @param {object} options - Additional options
     * @returns {Promise<string>}
     */
    async generate(systemPrompt, userPrompt, options = {}) {
        const model = options.model || this.model;
        
        // Check which provider to use
        if (model.startsWith('claude') && this.anthropicKey) {
            return this.generateWithClaude(systemPrompt, userPrompt, model, options);
        } else if (model === 'gemini-pro' && this.geminiKey) {
            return this.generateWithGemini(systemPrompt, userPrompt, options);
        } else if (this.apiKey) {
            return this.generateWithOpenAI(systemPrompt, userPrompt, model, options);
        } else if (this.anthropicKey) {
            return this.generateWithClaude(systemPrompt, userPrompt, 'claude-3-opus', options);
        }
        
        throw new Error('No API key configured. Please add your API key.');
    }

    /**
     * Generate using OpenAI API
     * @param {string} systemPrompt - System prompt
     * @param {string} userPrompt - User prompt
     * @param {string} model - Model name
     * @param {object} options - Additional options
     * @returns {Promise<string>}
     */
    async generateWithOpenAI(systemPrompt, userPrompt, model = 'gpt-4-turbo-preview', options = {}) {
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
                    max_tokens: options.maxTokens || this.maxTokens,
                    temperature: options.temperature || this.temperature,
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

    /**
     * Generate using Anthropic Claude API
     * @param {string} systemPrompt - System prompt
     * @param {string} userPrompt - User prompt
     * @param {string} model - Model name
     * @param {object} options - Additional options
     * @returns {Promise<string>}
     */
    async generateWithClaude(systemPrompt, userPrompt, model = 'claude-3-opus', options = {}) {
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
                    max_tokens: options.maxTokens || this.maxTokens,
                    system: systemPrompt,
                    messages: [
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: options.temperature || this.temperature
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

    /**
     * Generate using Google Gemini API
     * @param {string} systemPrompt - System prompt
     * @param {string} userPrompt - User prompt
     * @param {object} options - Additional options
     * @returns {Promise<string>}
     */
    async generateWithGemini(systemPrompt, userPrompt, options = {}) {
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
                        temperature: options.temperature || this.temperature,
                        maxOutputTokens: options.maxTokens || this.maxTokens
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

    /**
     * Generate text (simple interface)
     * @param {string} prompt - User prompt
     * @param {number} maxTokens - Maximum tokens
     * @returns {Promise<string>}
     */
    async generateText(prompt, maxTokens = 500) {
        return this.generate(
            'You are a helpful AI assistant. Provide concise and accurate responses.',
            prompt,
            { maxTokens }
        );
    }

    /**
     * Translate text
     * @param {string} text - Text to translate
     * @param {string} targetLanguage - Target language
     * @param {string} sourceLanguage - Source language (default: auto)
     * @returns {Promise<string>}
     */
    async translate(text, targetLanguage, sourceLanguage = 'auto') {
        const systemPrompt = `You are a PROFESSIONAL translator. Translate accurately while preserving the original meaning, tone, and nuance.`;
        const userPrompt = `Translate from ${sourceLanguage === 'auto' ? 'any language' : sourceLanguage} to ${targetLanguage}:\n\n${text}`;
        
        return this.generate(systemPrompt, userPrompt, { maxTokens: 2000 });
    }

    /**
     * Generate image using OpenAI DALL-E
     * @param {string} prompt - Image prompt
     * @param {string} size - Image size (default: 1024x1024)
     * @returns {Promise<string>}
     */
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

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIEngine;
} else if (typeof window !== 'undefined') {
    window.AIEngine = AIEngine;
}

export default AIEngine;
export { AIEngine };
