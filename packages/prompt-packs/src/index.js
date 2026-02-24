/**
 * Prompt Packs Module
 * AI prompt collections for various productivity tools
 * 
 * @module @ai-productivity/prompt-packs
 */

// Writing Prompts
const writingPrompts = {
    email: {
        cold: {
            name: 'Cold Outreach Email',
            description: 'Professional cold email for outreach',
            template: `Act as a professional copywriter. Write a cold outreach email that:
- Opens with a personalized hook relevant to {{industry}}
- Clearly states the value proposition in 2-3 sentences
- Includes one specific, relevant case study or statistic
- Ends with a clear, low-commitment call to action
- Keeps the total length under 150 words

Topic/Niche: {{product}}
Target Audience: {{audience}}
Key Benefit: {{benefit}}`
        },
        followUp: {
            name: 'Follow-Up Email',
            description: 'Professional follow-up email',
            template: `Write a professional follow-up email for someone who:
- Received my initial email about {{topic}} {{days}} days ago
- Hasn't responded yet
- Is a {{role}} at {{company}}
- Our solution specifically helps with {{painPoint}}

The email should:
- Acknowledge their busy schedule
- Add one new piece of value or insight
- Keep it short (under 100 words)
- End with a specific meeting time offer`
        },
        intro: {
            name: 'Introduction Email',
            description: 'New connection introduction email',
            template: `Act as a networking expert. Write an introduction email that:
- Introduces me as {{title}} from {{company}}
- Explains why I'm reaching out specifically to them
- Offers genuine value (not just self-promotion)
- Suggests a brief 15-minute call
- Has a warm, professional tone

My Background: {{background}}
Why Them: {{reason}}
Value I Can Offer: {{value}}`
        },
        apology: {
            name: 'Apology Email',
            description: 'Customer service apology email',
            template: `Write a professional customer service apology email that:
- Acknowledges the customer's issue with {{problem}}
- Takes full responsibility without excuses
- Explains what went wrong briefly and honestly
- Offers a specific solution or compensation
- Ends with appreciation and invitation for feedback

Customer Issue: {{issue}}
Solution Offered: {{solution}}
Compensation: {{compensation}}`
        },
        interviewFollowUp: {
            name: 'Interview Follow-Up',
            description: 'Post-interview thank you email',
            template: `Write a post-interview thank you email that:
- References specific topics discussed in the interview
- Reiterates enthusiasm for the {{role}} position
- Adds one new insight or value I can bring
- References connection made with {{interviewer}}
- Keeps it concise and memorable

Position: {{position}}
Company: {{company}}
Key Discussion Points: {{topics}}
Interviewer: {{name}}
Additional Insight: {{insight}}`
        }
    },
    blog: {
        howTo: {
            name: 'How-To Blog Post',
            description: 'Comprehensive how-to article',
            template: `Act as an expert content writer. Write a comprehensive how-to blog post about:

Title: "How to {{outcome}} in {{timeframe}}"

Structure:
1. Compelling hook (problem-solution format)
2. Brief explanation of why this matters
3. Step-by-step guide with clear headings
4. Pro tips for best results
5. Common mistakes to avoid
6. Conclusion with call to action

Target Audience: {{audience}}
Desired Outcome: {{result}}
Tone: {{tone}}
Word Count: {{wordCount}}`
        },
        listicle: {
            name: 'Listicle Article',
            description: 'Numbered list article',
            template: `Act as a viral content creator. Write a listicle article:

Title: "{{number}} {{adjective}} Ways to {{benefit}}"

Include:
- Attention-grabbing introduction
- {{number}} actionable items
- Each item should have 2-3 sentences of explanation
- Real-world examples where possible
- Inspiring conclusion

Topic: {{topic}}
Reader Level: {{level}}
Unique Angle: {{angle}}`
        },
        comparison: {
            name: 'Comparison Article',
            description: 'Side-by-side comparison',
            template: `Act as an industry analyst. Write a comprehensive comparison article:

Title: "{{optionA}} vs {{optionB}}: Which Is Better for {{audience}}?"

Include:
- Brief introduction to both options
- Side-by-side comparison of key features
- Pros and cons of each
- Best use cases for each
- Final recommendation based on specific scenarios

Option A: {{optionA}}
Option B: {{optionB}}
Primary Decision Factor: {{factor}}`
        },
        thoughtLeadership: {
            name: 'Thought Leadership',
            description: 'Opinion piece with contrarian view',
            template: `Act as a thought leader in {{industry}}. Write an opinion piece that:

Title: "The Truth About {{myth}} in {{industry}}"

Structure:
- Start with a bold, contrarian statement
- Back up with data and real-world examples
- Challenge conventional wisdom
- Provide evidence for alternative view
- End with actionable takeaways

Common Myth: {{myth}}
Your Position: {{position}}
Evidence: {{evidence}}
Call to Action: {{cta}}`
        }
    },
    resume: {
        summary: {
            name: 'Professional Summary',
            description: 'Compelling resume summary',
            template: `Act as a professional resume writer. Write a compelling professional summary that:

- Highlights {{years}} years of experience in {{field}}
- Showcases key achievements with metrics
- Uses strong action verbs
- Matches the target job description
- Stays within 3-4 sentences

Current Role: {{role}}
Key Skills: {{skills}}
Major Achievement: {{achievement}}
Target Job: {{targetJob}}`
        },
        coverLetter: {
            name: 'Cover Letter',
            description: 'Persuasive cover letter',
            template: `Write a persuasive cover letter that:
- Opens with a specific reason for writing
- Connects my experience to the job requirements
- Includes one impressive achievement with metrics
- Shows knowledge of the company culture
- Enthusiasm for the opportunity

Position: {{position}}
Company: {{company}}
Job Requirements: {{requirements}}
My Relevant Experience: {{experience}}
Unique Value: {{uniqueValue}}`
        },
        linkedin: {
            name: 'LinkedIn About Section',
            description: 'Professional LinkedIn summary',
            template: `Write a compelling LinkedIn "About" section that:
- Tells my professional story in first person
- Highlights my journey and passion
- Showcases expertise and specializations
- Includes call to action for networking

My Story: {{story}}
Expertise: {{expertise}}
Passion: {{passion}}
Specialization: {{specialization}}
Services/Offerings: {{services}}
Call to Action: {{cta}}`
        }
    },
    social: {
        linkedin: {
            name: 'LinkedIn Post',
            description: 'Professional LinkedIn content',
            template: `Write an engaging LinkedIn post that:
- Opens with a hook that stops the scroll
- Shares a valuable insight or lesson
- Includes a relevant personal story
- Ends with a question to encourage engagement
- Uses 3-5 relevant hashtags

Topic: {{topic}}
Personal Story: {{story}}
Key Insight: {{insight}}
Question: {{question}}
Hashtags: {{hashtags}}`
        },
        twitter: {
            name: 'Twitter Thread',
            description: 'Twitter/X thread (5-7 tweets)',
            template: `Create a Twitter thread (5-7 tweets) about:

Title: "{{topic}}: {{subtitle}}"

Format:
- Tweet 1: Hook that demands attention
- Tweet 2-5: Valuable content broken down
- Tweet 6: Key takeaway or summary
- Tweet 7: Call to action + question

Topic: {{topic}}
Key Points: {{points}}
Audience: {{audience}}
Angle: {{angle}}`
        },
        instagram: {
            name: 'Instagram Caption',
            description: 'Engaging Instagram post',
            template: `Write an Instagram caption that:
- Matches the visual/photo perfectly
- Uses storytelling to connect
- Includes a clear call to action
- Uses line breaks for readability
- Adds 10-15 relevant hashtags

Image Description: {{description}}
Story Behind It: {{story}}
Message: {{message}}
CTA: {{cta}}
Hashtags: {{hashtags}}`
        }
    },
    business: {
        proposal: {
            name: 'Business Proposal Executive Summary',
            description: 'Executive summary for proposals',
            template: `Write an executive summary for a business proposal that:
- Fits on one page
- Highlights the opportunity clearly
- States the requested action
- Previews key benefits
- Creates urgency without desperation

Project Name: {{projectName}}
Opportunity: {{opportunity}}
Proposed Solution: {{solution}}
Key Benefits: {{benefits}}
Requested Action: {{action}}
Timeline: {{timeline}}`
        },
        mission: {
            name: 'Mission Statement',
            description: 'Compelling mission statement',
            template: `Write a compelling mission statement for {{organization}} that:
- Captures the core purpose
- Reflects company values
- Inspires employees and customers
- Differentiates from competitors
- Is memorable and concise

Organization Type: {{type}}
Core Purpose: {{purpose}}
Values: {{values}}
Target Audience: {{audience}}
Differentiator: {{differentiator}}`
        },
        productDescription: {
            name: 'Product Description',
            description: 'E-commerce product writeup',
            template: `Write a product description for {{product}} that:
- Opens with a benefit-focused headline
- Describes features with emotional benefits
- Uses sensory language
- Addresses common objections
- Ends with clear CTA

Product Name: {{name}}
Key Features: {{features}}
Benefits: {{benefits}}
Target Customer: {{customer}}
Price: {{price}}`
        },
        pressRelease: {
            name: 'Press Release',
            description: 'Professional news release',
            template: `Write a press release for {{announcement}} that:
- Follows inverted pyramid structure
- Includes all essential info in first paragraph
- Uses professional but engaging tone
- Includes quote from key stakeholder
- Has clear media contact info

Announcement: {{announcement}}
Date: {{date}}
Organization: {{organization}}
Key Details: {{details}}
Quote: {{quote}}
Contact: {{contact}}`
        }
    },
    creative: {
        brandStory: {
            name: 'Brand Story',
            description: 'Compelling brand narrative',
            template: `Write a brand story for {{brand}} that:
- Tells the founding story compellingly
- Connects to customer pain points
- Shows the "aha" moment
- Aligns with brand values
- Inspires emotional connection

Founder: {{founder}}
Why Started: {{why}}
Journey: {{journey}}
Values: {{values}}
Customer Promise: {{promise}}`
        },
        videoScript: {
            name: 'Video Script (30 seconds)',
            description: 'Short promotional video',
            template: `Write a 30-second video script for {{product}} that:
- Opens with a problem/hook
- Shows the solution
- Ends with CTA

Product: {{product}}
Target Pain Point: {{painPoint}}
Solution: {{solution}}
CTA: {{cta}}`
        },
        podcastIntro: {
            name: 'Podcast Intro Script',
            description: 'Podcast opening segment',
            template: `Write a podcast intro script that:
- Introduces the show and host
- Teases episode topic
- Sets the tone
- Welcomes listeners

Podcast Name: {{podcastName}}
Host Name: {{hostName}}
Episode Topic: {{episodeTopic}}
Guest: {{guest}}
Tone: {{tone}}`
        }
    }
};

// Business Document Prompts
const businessPrompts = {
    invoice: {
        name: 'Invoice',
        description: 'Professional invoice generation',
        template: `You are a FINANCIAL EXPERT. Create professional, legally-compliant invoices that ensure fast payment. Include:
- Company details and logo space
- Client information
- Itemized list of services/products
- Payment terms and methods
- Total amount with tax calculation`
    },
    quote: {
        name: 'Quote/Proposal',
        description: 'Sales quote creation',
        template: `You are a SALES professional. Create quotes that win deals and justify your pricing. Include:
- Quote number and date
- Client details
- Detailed scope of work
- Pricing breakdown
- Validity period
- Terms and conditions`
    },
    proposal: {
        name: 'Business Proposal',
        description: 'Comprehensive business proposal',
        template: `You are a PROPOSAL MASTER. Write winning proposals that address pain points and showcase value. Include:
- Executive summary
- Problem statement
- Proposed solution
- Timeline and milestones
- Pricing and payment terms
- Case studies/references
- Next steps`
    },
    contract: {
        name: 'Contract',
        description: 'Legal contract draft',
        template: `You are a LEGAL expert. Draft clear, enforceable contracts. Include:
- Parties involved
- Terms and conditions
- Payment terms
- Confidentiality clause
- Termination conditions
- Signatures`
    },
    businessPlan: {
        name: 'Business Plan',
        description: 'Comprehensive business plan',
        template: `You are a BUSINESS STRATEGIST. Create comprehensive business plans that attract investors. Include:
- Executive summary
- Market analysis
- Products/services
- Marketing strategy
- Financial projections
- Team overview`
    }
};

// Student Tools Prompts
const studentPrompts = {
    summary: {
        name: 'Content Summary',
        description: 'Generate concise summaries',
        template: `You are a LEARNING EXPERT. Create crystal-clear summaries that capture essential concepts. Use bullet points and visual formatting. Include:
- Key points
- Definitions
- Examples
- Visual aids where possible`
    },
    questions: {
        name: 'Practice Questions',
        description: 'Generate quiz questions',
        template: `You are an EXPERT EDUCATOR. Create challenging practice questions that test deep understanding. Include:
- 3 easy questions
- 4 medium questions
- 3 hard questions
- Answer key with explanations`
    },
    studyPlan: {
        name: 'Study Plan',
        description: 'Personalized study schedule',
        template: `You are a PRODUCTIVITY coach. Create detailed study plans optimized for retention and performance. Include:
- Daily goals
- Weekly milestones
- Recommended breaks
- Subject rotation
- Assessment dates`
    },
    essayOutline: {
        name: 'Essay Outline',
        description: 'Structured essay framework',
        template: `You are a PROFESSIONAL EDITOR. Help structure essays with compelling arguments and perfect flow. Include:
- Thesis statement
- Introduction hook
- Body paragraphs (topic sentences, evidence)
- Counterarguments
- Conclusion`
    },
    flashcards: {
        name: 'Flashcards',
        description: 'Memory technique cards',
        template: `You are a MEMORY expert. Create flashcards that use proven memory techniques like spaced repetition. Format:
- Front: Question/term
- Back: Answer/definition
- Memory cue (optional)`
    },
    notes: {
        name: 'Study Notes',
        description: 'Comprehensive note-taking',
        template: `You are a NOTE-TAKING expert. Create organized, comprehensive notes that make learning easy. Include:
- Main headings
- Subheadings
- Key concepts
- Examples
- Mnemonics`
    }
};

// Task Management Prompts
const taskPrompts = {
    prioritization: {
        name: 'Task Prioritization',
        description: 'Eisenhower Matrix analysis',
        template: `You are the WORLD'S BEST productivity expert. Analyze tasks and provide:
1. Optimal prioritization (Eisenhower Matrix - Urgent/Important)
2. Time blocking suggestions
3. Dependencies and sequencing
4. Energy management tips
5. Quick wins identification

Be specific, actionable, and data-driven.`
    },
    suggestions: {
        name: 'Smart Task Suggestions',
        description: 'AI-powered recommendations',
        template: `Analyze these tasks and provide smart recommendations:
{{tasks}}

Consider:
- Priority levels
- Estimated time
- Dependencies
- Energy requirements
- Deadline constraints`
    }
};

// Code Editor Prompts
const codePrompts = {
    explain: {
        name: 'Code Explanation',
        description: 'Detailed code analysis',
        template: `You are a SOFTWARE ARCHITECT and coding expert. Explain this code in detail:
{{code}}

Include:
- What the code does
- How it works
- Examples
- Best practices
- Potential improvements`
    },
    debug: {
        name: 'Bug Detection',
        description: 'Find and fix bugs',
        template: `You are a DEBUGGING MASTER. Find all bugs, errors, and issues in this code:
{{code}}

Provide:
- List of issues found
- Severity level
- Specific fixes with line numbers
- Security concerns`
    },
    optimize: {
        name: 'Code Optimization',
        description: 'Performance improvements',
        template: `You are a PERFORMANCE OPTIMIZATION expert. Optimize this code for:
{{code}}

Focus on:
- Speed
- Memory usage
- Readability
- Best practices`
    },
    review: {
        name: 'Code Review',
        description: 'Comprehensive code feedback',
        template: `Provide a comprehensive code review for:
{{code}}

Include:
- Code quality assessment
- Security analysis
- Potential bugs
- Improvement suggestions
- Rating (1-10)`
    },
    test: {
        name: 'Unit Tests',
        description: 'Generate test cases',
        template: `You are a TESTING expert. Write comprehensive unit tests for:
{{code}}

Include:
- Happy path tests
- Edge cases
- Error handling
- Mock setups
- Expected assertions`
    }
};

// PromptPacks class
class PromptPacks {
    constructor() {
        this.writing = writingPrompts;
        this.business = businessPrompts;
        this.student = studentPrompts;
        this.tasks = taskPrompts;
        this.code = codePrompts;
    }

    /**
     * Get all writing prompts
     * @returns {object}
     */
    getWritingPrompts() {
        return this.writing;
    }

    /**
     * Get all business prompts
     * @returns {object}
     */
    getBusinessPrompts() {
        return this.business;
    }

    /**
     * Get all student prompts
     * @returns {object}
     */
    getStudentPrompts() {
        return this.student;
    }

    /**
     * Get all task prompts
     * @returns {object}
     */
    getTaskPrompts() {
        return this.tasks;
    }

    /**
     * Get all code prompts
     * @returns {object}
     */
    getCodePrompts() {
        return this.code;
    }

    /**
     * Get all prompts
     * @returns {object}
     */
    getAllPrompts() {
        return {
            writing: this.writing,
            business: this.business,
            student: this.student,
            tasks: this.tasks,
            code: this.code
        };
    }

    /**
     * Get prompt by category and key
     * @param {string} category - Category (writing, business, student, tasks, code)
     * @param {string} key - Prompt key
     * @returns {object|null}
     */
    getPrompt(category, key) {
        const categories = {
            writing: this.writing,
            business: this.business,
            student: this.student,
            tasks: this.tasks,
            code: this.code
        };
        
        return categories[category]?.[key] || null;
    }

    /**
     * Fill template with variables
     * @param {string} template - Template string
     * @param {object} variables - Variables to fill
     * @returns {string}
     */
    fillTemplate(template, variables) {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return result;
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PromptPacks;
} else if (typeof window !== 'undefined') {
    window.PromptPacks = PromptPacks;
}

export default PromptPacks;
export { PromptPacks };
