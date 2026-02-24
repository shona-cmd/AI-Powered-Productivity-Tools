# @ai-productivity/ai-engine

Multi-provider AI integration library supporting OpenAI GPT-4, Anthropic Claude, and Google Gemini.

## Features

- 🚀 **Multi-Provider Support**: OpenAI GPT-4, Anthropic Claude, Google Gemini
- 💾 **Built-in Caching**: Automatic request caching for efficiency
- 🎯 **Automatic Model Selection**: Automatically chooses available provider
- 🖼️ **Image Generation**: DALL-E image generation support
- 🌐 **Translation**: Multi-language translation capabilities

## Installation

```
bash
npm install @ai-productivity/ai-engine
```

## Usage

### Basic Usage

```
javascript
import AIEngine from '@ai-productivity/ai-engine';

// Initialize with your API key
const ai = new AIEngine({
    apiKey: 'your-openai-api-key',
    model: 'gpt-4-turbo-preview'
});

// Generate text
const response = await ai.generate(
    'You are a helpful assistant.',
    'What is the capital of France?'
);
console.log(response);
```

### Using Different Providers

```
javascript
// Using Anthropic Claude
const ai = new AIEngine({
    anthropicKey: 'your-anthropic-api-key',
    model: 'claude-3-opus'
});

const response = await ai.generate(
    'You are a helpful assistant.',
    'Write a haiku about coding'
);
```

```
javascript
// Using Google Gemini
const ai = new AIEngine({
    geminiKey: 'your-gemini-api-key',
    model: 'gemini-pro'
});
```

### Image Generation

```
javascript
const ai = new AIEngine({
    apiKey: 'your-openai-api-key'
});

const imageUrl = await ai.generateImage(
    'A futuristic city with flying cars',
    '1024x1024'
);
console.log(imageUrl);
```

### Translation

```
javascript
const translated = await ai.translate(
    'Hello, how are you?',
    'Spanish'
);
console.log(translated);
```

## API

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| apiKey | string | '' | OpenAI API key |
| anthropicKey | string | '' | Anthropic API key |
| geminiKey | string | '' | Google Gemini API key |
| model | string | 'gpt-4-turbo-preview' | Default model to use |
| maxTokens | number | 4000 | Maximum tokens to generate |
| temperature | number | 0.7 | Generation temperature |

### Methods

- `setApiKey(key)` - Set OpenAI API key
- `setAnthropicKey(key)` - Set Anthropic API key
- `setGeminiKey(key)` - Set Gemini API key
- `setModel(model)` - Set default model
- `generate(systemPrompt, userPrompt, options)` - Generate text
- `generateText(prompt, maxTokens)` - Simple text generation
- `generateImage(prompt, size)` - Generate image
- `translate(text, targetLanguage, sourceLanguage)` - Translate text
- `clearCache()` - Clear request cache

## Available Models

| Model | Provider | Strength |
|-------|----------|----------|
| gpt-4-turbo-preview | OpenAI | 95 |
| gpt-4 | OpenAI | 93 |
| gpt-3.5-turbo | OpenAI | 75 |
| claude-3-opus | Anthropic | 97 |
| claude-3-sonnet | Anthropic | 90 |
| gemini-pro | Google | 88 |

## License

MIT

## Author

AI Productivity Tools
