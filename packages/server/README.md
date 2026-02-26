# @ai-productivity/server

Server application that uses the @ai-productivity/ai-engine package to provide AI-powered endpoints.

## Description

This is an Express.js server that provides REST API endpoints for AI text generation, translation, and image generation using the @ai-productivity/ai-engine package.

## Features

- **AI Text Generation**: Generate text using OpenAI GPT-4, Anthropic Claude, or Google Gemini
- **Translation**: Translate text between languages
- **Image Generation**: Generate images using OpenAI DALL-E
- **Health Check**: Monitor server status and available providers

## Installation

```
bash
npm install
```

## Configuration

Set the following environment variables:

- `OPENAI_API_KEY` - OpenAI API key (for GPT-4 and DALL-E)
- `ANTHROPIC_API_KEY` - Anthropic API key (for Claude)
- `GEMINI_API_KEY` - Google Gemini API key
- `PORT` - Server port (default: 3000)

## Usage

```
bash
# Start the server
npm start

# Development mode with hot reload
npm run dev
```

## API Endpoints

### GET /health
Health check endpoint

**Response:**
```
json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "providers": ["OpenAI", "Anthropic", "Google Gemini"]
}
```

### POST /api/generate
Generate text using AI

**Request:**
```
json
{
  "systemPrompt": "You are a helpful assistant.",
  "userPrompt": "What is AI?",
  "model": "gpt-4-turbo-preview",
  "maxTokens": 1000,
  "temperature": 0.7
}
```

**Response:**
```
json
{
  "result": "AI stands for Artificial Intelligence..."
}
```

### POST /api/translate
Translate text

**Request:**
```
json
{
  "text": "Hello world",
  "targetLanguage": "Spanish",
  "sourceLanguage": "English"
}
```

**Response:**
```
json
{
  "result": "Hola mundo"
}
```

### POST /api/image
Generate an image

**Request:**
```
json
{
  "prompt": "A beautiful sunset over mountains",
  "size": "1024x1024"
}
```

**Response:**
```
json
{
  "url": "https://..."
}
```

### GET /api/models
Get available AI models

**Response:**
```
json
{
  "models": {
    "gpt-4-turbo-preview": { "name": "GPT-4 Turbo", "provider": "OpenAI", "strength": 95 },
    ...
  }
}
```

### GET /api/status
Check configuration status

**Response:**
```
json
{
  "configured": true,
  "providers": ["OpenAI"]
}
```

## License

MIT
