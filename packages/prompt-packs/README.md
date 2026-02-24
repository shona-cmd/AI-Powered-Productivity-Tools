# @ai-productivity/prompt-packs

AI prompt collections for writing, business, student, and task management tools.

## Features

- 📝 **Writing Prompts** - Emails, blog posts, resumes, social media
- 💼 **Business Documents** - Proposals, invoices, contracts
- 📚 **Student Tools** - Summaries, study plans, flashcards
- ✅ **Task Management** - Prioritization and suggestions
- 💻 **Code Editor** - Explanation, debugging, optimization
- 🔧 **Template Filling** - Easy variable substitution

## Installation

```
bash
npm install @ai-productivity/prompt-packs
```

## Usage

### Basic Usage

```
javascript
import PromptPacks from '@ai-productivity/prompt-packs';

// Initialize
const prompts = new PromptPacks();

// Get all writing prompts
const writingPrompts = prompts.getWritingPrompts();

// Get business prompts
const businessPrompts = prompts.getBusinessPrompts();
```

### Using a Specific Prompt

```
javascript
const prompts = new PromptPacks();

// Get a specific prompt
const coldEmail = prompts.getPrompt('writing', 'cold');
console.log(coldEmail.name); // "Cold Outreach Email"
console.log(coldEmail.template); // Template string...
```

### Filling Templates

```
javascript
const prompts = new PromptPacks();

// Get the template
const template = prompts.getPrompt('writing', 'cold').template;

// Fill in variables
const filled = prompts.fillTemplate(template, {
    industry: 'SaaS',
    product: 'Project Management Software',
    audience: 'Startup founders',
    benefit: 'Save 10 hours per week'
});

console.log(filled);
```

## Prompt Categories

### Writing Prompts

| Key | Description |
|-----|-------------|
| cold | Cold outreach email |
| followUp | Follow-up email |
| intro | Introduction email |
| apology | Apology email |
| interviewFollowUp | Interview thank you |
| howTo | How-to blog post |
| listicle | Listicle article |
| comparison | Comparison article |
| thoughtLeadership | Opinion piece |
| summary | Resume summary |
| coverLetter | Cover letter |
| linkedin | LinkedIn About section |
| linkedinPost | LinkedIn post |
| twitter | Twitter thread |
| instagram | Instagram caption |

### Business Prompts

| Key | Description |
|-----|-------------|
| invoice | Professional invoice |
| quote | Sales quote |
| proposal | Business proposal |
| contract | Legal contract |
| businessPlan | Business plan |
| proposal | Executive summary |
| mission | Mission statement |
| productDescription | Product description |
| pressRelease | Press release |
| brandStory | Brand story |
| videoScript | Video script |
| podcastIntro | Podcast intro |

### Student Prompts

| Key | Description |
|-----|-------------|
| summary | Content summary |
| questions | Practice questions |
| studyPlan | Study schedule |
| essayOutline | Essay structure |
| flashcards | Memory cards |
| notes | Study notes |

### Task Management Prompts

| Key | Description |
|-----|-------------|
| prioritization | Eisenhower Matrix |
| suggestions | Smart recommendations |

### Code Prompts

| Key | Description |
|-----|-------------|
| explain | Code explanation |
| debug | Bug detection |
| optimize | Performance optimization |
| review | Code review |
| test | Unit test generation |

## Example: Generate Cold Email

```
javascript
import PromptPacks from '@ai-productivity/prompt-packs';

const prompts = new PromptPacks();

// Get the cold email template
const template = prompts.getPrompt('writing', 'cold').template;

// Fill in the variables
const prompt = prompts.fillTemplate(template, {
    industry: 'E-commerce',
    product: 'AI-powered customer service',
    audience: 'E-commerce business owners',
    benefit: 'Increase customer satisfaction by 30%'
});

// Use with AI Engine
const ai = new AIEngine({ apiKey: 'your-key' });
const response = await ai.generate('You are a professional copywriter.', prompt);
```

## API

### Methods

- `getWritingPrompts()` - Get all writing prompts
- `getBusinessPrompts()` - Get all business prompts
- `getStudentPrompts()` - Get all student prompts
- `getTaskPrompts()` - Get all task prompts
- `getCodePrompts()` - Get all code prompts
- `getAllPrompts()` - Get all prompts
- `getPrompt(category, key)` - Get specific prompt
- `fillTemplate(template, variables)` - Fill template variables

### Prompt Object

```
javascript
{
    name: 'Cold Outreach Email',
    description: 'Professional cold email for outreach',
    template: 'Act as a professional copywriter...'
}
```

## License

MIT

## Author

AI Productivity Tools
