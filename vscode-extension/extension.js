const vscode = require('vscode');
const axios = require('axios');

// AI Engine class for VS Code extension
class AIEngine {
    constructor() {
        this.apiKey = vscode.workspace.getConfiguration('aiProductivityTools').get('apiKey');
        this.anthropicKey = vscode.workspace.getConfiguration('aiProductivityTools').get('anthropicKey');
        this.model = vscode.workspace.getConfiguration('aiProductivityTools').get('defaultModel') || 'gpt-4';
    }

    async generate(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured. Go to Settings > AI Productivity Tools.');
        }

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: this.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 2000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.choices[0].message.content;
        } catch (error) {
            throw new Error(`AI request failed: ${error.message}`);
        }
    }

    async improveWriting(text, type = 'general') {
        const prompts = {
            general: `Improve this text for clarity and professionalism:\n\n${text}`,
            email: `Write a professional email based on this:\n\n${text}`,
            code: `Review and improve this code:\n\n${text}`,
            blog: `Enhance this blog content:\n\n${text}`
        };
        return this.generate(prompts[type] || prompts.general);
    }

    async generateCode(task, language = 'javascript') {
        const prompt = `Write ${language} code for the following task:\n\n${task}`;
        return this.generate(prompt, { maxTokens: 3000 });
    }
}

// Create and show the AI Productivity Tools panel
function createAIPanel(context) {
    const panel = vscode.window.createWebviewPanel(
        'aiProductivityTools',
        'AI Productivity Tools',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    panel.webview.html = getWebviewContent();

    // Handle messages from webview
    panel.webview.onDidReceiveMessage(async (message) => {
        const engine = new AIEngine();
        
        try {
            let result;
            switch (message.command) {
                case 'improveWriting':
                    result = await engine.improveWriting(message.text, message.type);
                    break;
                case 'generateCode':
                    result = await engine.generateCode(message.task, message.language);
                    break;
                case 'generateContent':
                    result = await engine.generate(message.prompt);
                    break;
                default:
                    throw new Error(`Unknown command: ${message.command}`);
            }
            panel.webview.postMessage({ command: 'result', result });
        } catch (error) {
            panel.webview.postMessage({ command: 'error', error: error.message });
        }
    });

    return panel;
}

// Get webview HTML content
function getWebviewContent() {
    const html = `<!DOCTYPE html>
<html>
<head>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; background: #1e1e1e; color: #ccc; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { color: #4fc3f7; font-size: 24px; }
        .tool-section { background: #2d2d2d; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
        .tool-section h2 { color: #4fc3f7; margin-bottom: 12px; font-size: 16px; }
        textarea, input, select { width: 100%; padding: 10px; margin-bottom: 10px; background: #3c3c3c; border: 1px solid #555; color: #fff; border-radius: 4px; }
        textarea { min-height: 100px; resize: vertical; }
        button { background: #0e639c; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        button:hover { background: #1177bb; }
        button:disabled { background: #555; cursor: not-allowed; }
        .result { background: #1e1e1e; padding: 12px; border-radius: 4px; margin-top: 12px; white-space: pre-wrap; }
        .loading { color: #4fc3f7; }
        .error { color: #f44336; }
    </style>
</head>
<body>
    <div class="header">
        <h1>AI Productivity Tools</h1>
    </div>

    <div class="tool-section">
        <h2>Writing Assistant</h2>
        <textarea id="writingInput" placeholder="Enter text to improve..."></textarea>
        <select id="writingType">
            <option value="general">General Improvement</option>
            <option value="email">Professional Email</option>
            <option value="blog">Blog Content</option>
        </select>
        <button onclick="improveWriting()">Improve Writing</button>
        <div id="writingResult"></div>
    </div>

    <div class="tool-section">
        <h2>Code Generator</h2>
        <textarea id="codeTask" placeholder="Describe the code you need..."></textarea>
        <select id="codeLanguage">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="csharp">C#</option>
        </select>
        <button onclick="generateCode()">Generate Code</button>
        <div id="codeResult"></div>
    </div>

    <div class="tool-section">
        <h2>AI Chat</h2>
        <textarea id="chatPrompt" placeholder="Ask anything..."></textarea>
        <button onclick="sendChat()">Send</button>
        <div id="chatResult"></div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function improveWriting() {
            const text = document.getElementById('writingInput').value;
            const type = document.getElementById('writingType').value;
            const resultDiv = document.getElementById('writingResult');
            
            if (!text.trim()) return;
            
            resultDiv.innerHTML = '<p class="loading">Processing...</p>';
            vscode.postMessage({ command: 'improveWriting', text: text, type: type });
        }

        function generateCode() {
            const task = document.getElementById('codeTask').value;
            const language = document.getElementById('codeLanguage').value;
            const resultDiv = document.getElementById('codeResult');
            
            if (!task.trim()) return;
            
            resultDiv.innerHTML = '<p class="loading">Generating code...</p>';
            vscode.postMessage({ command: 'generateCode', task: task, language: language });
        }

        function sendChat() {
            const prompt = document.getElementById('chatPrompt').value;
            const resultDiv = document.getElementById('chatResult');
            
            if (!prompt.trim()) return;
            
            resultDiv.innerHTML = '<p class="loading">Thinking...</p>';
            vscode.postMessage({ command: 'generateContent', prompt: prompt });
        }

        window.addEventListener('message', function(event) {
            const data = event.data;
            
            if (data.command === 'result') {
                var result = data.result;
                var safeResult = result.replace(/&/g, '&amp;').replace(/</g, '<').replace(/>/g, '>');
                
                var resultDivs = document.querySelectorAll('.result');
                for (var i = 0; i < resultDivs.length; i++) {
                    if (!resultDivs[i].innerHTML) {
                        resultDivs[i].innerHTML = '<pre>' + safeResult + '</pre>';
                        break;
                    }
                }
                
                var loadingEls = document.querySelectorAll('.loading');
                for (var j = 0; j < loadingEls.length; j++) {
                    if (loadingEls[j].parentElement.classList.contains('result')) {
                        loadingEls[j].parentElement.innerHTML = '';
                    }
                }
            }
            
            if (data.command === 'error') {
                var errorDivs = document.querySelectorAll('.result');
                for (var k = 0; k < errorDivs.length; k++) {
                    if (!errorDivs[k].innerHTML) {
                        errorDivs[k].innerHTML = '<div class="error">' + data.error + '</div>';
                        break;
                    }
                }
            }
        });
    </script>
</body>
</html>`;
    return html;
}

// Activation function
function activate(context) {
    // Register command
    const disposable = vscode.commands.registerCommand(
        'ai-productivity-tools.openPanel',
        function() {
            createAIPanel(context);
        }
    );

    context.subscriptions.push(disposable);
    
    // Show welcome message
    vscode.window.showInformationMessage('AI Productivity Tools installed! Run "AI Productivity Tools: Open Panel" to start.');
}

// Deactivation function
function deactivate() {}

module.exports = { activate: activate, deactivate: deactivate };
