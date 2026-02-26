/**
 * AI Productivity Server
 * Express server that uses the @ai-productivity/ai-engine package
 */

import express from 'express';
import cors from 'cors';
import { AIEngine } from '@ai-productivity/ai-engine/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize AI Engine
const aiEngine = new AIEngine({
    apiKey: process.env.OPENAI_API_KEY || '',
    anthropicKey: process.env.ANTHROPIC_API_KEY || '',
    geminiKey: process.env.GEMINI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
    maxTokens: 4000,
    temperature: 0.7
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        providers: aiEngine.getAvailableProviders()
    });
});

// AI Generate endpoint
app.post('/api/generate', async (req, res) => {
    try {
        const { systemPrompt, userPrompt, model, maxTokens, temperature } = req.body;
        
        if (!userPrompt) {
            return res.status(400).json({ error: 'userPrompt is required' });
        }

        const options = {};
        if (model) options.model = model;
        if (maxTokens) options.maxTokens = maxTokens;
        if (temperature) options.temperature = temperature;

        const result = await aiEngine.generate(
            systemPrompt || 'You are a helpful AI assistant.',
            userPrompt,
            options
        );

        res.json({ result });
    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// AI Translate endpoint
app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLanguage, sourceLanguage } = req.body;
        
        if (!text || !targetLanguage) {
            return res.status(400).json({ error: 'text and targetLanguage are required' });
        }

        const result = await aiEngine.translate(text, targetLanguage, sourceLanguage || 'auto');
        res.json({ result });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// AI Generate Image endpoint
app.post('/api/image', async (req, res) => {
    try {
        const { prompt, size } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'prompt is required' });
        }

        const result = await aiEngine.generateImage(prompt, size || '1024x1024');
        res.json({ url: result });
    } catch (error) {
        console.error('Image generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get available models
app.get('/api/models', (req, res) => {
    res.json({ models: aiEngine.models });
});

// Check configuration status
app.get('/api/status', (req, res) => {
    res.json({
        configured: aiEngine.isConfigured(),
        providers: aiEngine.getAvailableProviders()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`AI Productivity Server running on port ${PORT}`);
    console.log(`AI Engine configured: ${aiEngine.isConfigured()}`);
    console.log(`Available providers: ${aiEngine.getAvailableProviders().join(', ')}`);
});

export default app;
