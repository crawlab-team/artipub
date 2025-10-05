# ArtiPub AI - AI-Powered Article Publishing Platform

![ArtiPub AI - AI-Powered Article Publishing Platform](https://github.com/user-attachments/assets/8708b705-320d-43e3-a704-0e9b1007d278)

ArtiPub AI is a revolutionary AI-powered article publishing platform that leverages advanced language models to automatically optimize and distribute your content across multiple platforms with maximum engagement potential.

## 🚀 What's New in ArtiPub AI

ArtiPub has been completely rebuilt from the ground up with modern AI technology:

- **🤖 AI-Powered Content Optimization**: Uses advanced LLMs to automatically adapt your content for each platform's unique audience and requirements
- **🧠 Intelligent Publishing Strategy**: AI analyzes your content and determines optimal publishing schedules and platform selection
- **⚡ Modern Tech Stack**: Built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui for a superior user experience
- **🎯 Smart Scheduling**: AI determines the best times to publish for maximum engagement
- **📊 Real-time Analytics Dashboard**: Monitor your publishing tasks with live updates and detailed insights

## 🔄 Migration from Browser Automation

The new ArtiPub AI replaces the previous browser automation approach with intelligent AI agents:

- **Before**: Used Puppeteer to automate browser interactions
- **After**: Uses AI to understand platform requirements and optimize content accordingly
- **Benefits**: More reliable, faster, and produces better-optimized content

## 🤖 AI-Powered Workflow Management

ArtiPub now features an innovative multi-stage automation workflow system:

### 1. Workflow Specification (Markdown)
- Describe automation workflows in human-readable markdown format
- Specifications include platform details, interaction steps, selectors, and validation rules
- Easy to understand, modify, and version control
- AI can read and understand the specifications

### 2. AI Code Generation
- AI automatically generates TypeScript automation code from workflow specifications
- Follows existing patterns (BaseSpider class) for consistency
- Includes error handling, logging, and retry logic
- Reduces manual coding and potential errors

### 3. AI Workflow Guardian
- Continuously monitors workflow execution
- Detects failures and analyzes root causes
- Automatically fixes broken workflows when platform UIs change
- Updates selectors and retry strategies as needed
- Maintains audit log of all changes

### 4. Workflow Execution Engine
- Executes workflows with intelligent retry strategies
- Handles errors gracefully with fallback options
- Reports detailed execution status
- Tracks statistics and performance metrics

### Benefits of Workflow Management System
- **Maintainability**: Workflows are documented and versioned
- **Adaptability**: AI automatically adapts to platform changes
- **Reliability**: Automated error detection and recovery
- **Scalability**: Easy to add new platforms using templates
- **Transparency**: All changes are logged and auditable

## ✨ Key Features

### AI-Powered Content Optimization
- Automatically adapts titles, content, and metadata for each platform
- Platform-specific formatting (Markdown for Juejin, HTML for others)
- SEO optimization with keyword analysis
- Audience-targeted content variations

### Intelligent Multi-Platform Publishing
- **Supported Platforms**: 知乎 (Zhihu), 掘金 (Juejin), CSDN, 简书 (Jianshu), SegmentFault, 开源中国 (OSCHINA)
- Smart platform recommendation based on content analysis
- Automated scheduling with optimal timing
- Real-time publishing status tracking

### Modern User Interface
- Clean, intuitive design with shadcn/ui components
- Real-time publishing dashboard
- Mobile-responsive design
- Dark mode support

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Framework**: Tailwind CSS, shadcn/ui
- **AI Integration**: AI SDK with support for OpenAI and Anthropic
- **State Management**: React Hooks
- **Styling**: Modern design system with consistent theming

## 📸 Screenshots

### Main Interface
![ArtiPub AI Homepage](https://github.com/user-attachments/assets/8708b705-320d-43e3-a704-0e9b1007d278)

### Publishing Dashboard
![Publishing Dashboard](https://github.com/user-attachments/assets/f50d7f25-25a4-4883-92fd-a04b38d2d3a2)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/crawlab-team/artipub
cd artipub

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

## 🎯 Usage

1. **Create Article**: Write your article with title and content (Markdown supported)
2. **Select Platforms**: Choose which platforms to publish to
3. **AI Optimization**: Let AI analyze and optimize your content
4. **Publish**: AI handles the publishing process with intelligent scheduling
5. **Monitor**: Track progress in the real-time dashboard

## 🧪 AI Features in Detail

### Content Optimization
- **Platform Adaptation**: AI modifies content style for each platform's audience
- **SEO Enhancement**: Automatic keyword optimization and meta descriptions
- **Engagement Optimization**: A/B testing variations for better performance

### Publishing Strategy
- **Platform Analysis**: AI recommends best platforms for your content type
- **Timing Optimization**: Determines optimal publishing times
- **Batch Processing**: Handles multiple platforms simultaneously

## 🔧 Configuration

### AI Provider Setup
The platform supports multiple AI providers. Configure in your environment:

```bash
# OpenAI
OPENAI_API_KEY=your_key_here

# Anthropic
ANTHROPIC_API_KEY=your_key_here
```

### Workflow Management

ArtiPub uses a specification-driven approach for automation workflows. Workflow specifications are stored in `.kiro/specs/automation-workflow/`.

#### Creating a New Workflow

1. **Create Workflow Specification** (Markdown):
   ```markdown
   ### Platform Information
   - **Platform ID**: myplatform
   - **Base URL**: https://platform.com
   - **Editor URL**: https://platform.com/editor
   
   ### Workflow Steps
   
   #### Step 1: Navigate to Editor
   - Action: navigate
   - URL: https://platform.com/editor
   
   #### Step 2: Input Title
   - Action: fill
   - Selector: input[name="title"]
   - Value: {{article.title}}
   ```

2. **Load and Generate Code**:
   ```typescript
   import { workflowManagement } from '@/lib/workflow-management';
   
   // Load workflow from markdown
   const workflow = await workflowManagement.loadWorkflowFromMarkdown(
     'myplatform',
     markdownContent
   );
   
   // The system automatically generates TypeScript code
   console.log(workflow.generatedCode.code);
   ```

3. **Execute Workflow**:
   ```typescript
   const result = await workflowManagement.executeWorkflow('myplatform', {
     article: {
       id: '123',
       title: 'My Article',
       content: 'Article content...'
     },
     platform: 'myplatform'
   });
   ```

#### Workflow Maintenance

The AI Workflow Guardian automatically:
- Monitors workflow execution
- Detects when platform UIs change
- Updates selectors and recovery strategies
- Creates new workflow versions with fixes
- Logs all maintenance actions

#### Version Management

```typescript
// Get all versions for a platform
const versions = workflowManagement.getAllVersions('zhihu');

// Rollback to a previous version
workflowManagement.rollbackToVersion('zhihu', '1.0.0');

// Export workflow as markdown
const markdown = workflowManagement.exportWorkflowAsMarkdown('zhihu');
```

### Platform Integration
Configure platform-specific settings in `src/lib/types.ts`:

```typescript
export const PLATFORMS: Platform[] = [
  {
    id: 'zhihu',
    name: 'zhihu',
    displayName: '知乎',
    // ... configuration
  }
  // ... more platforms
];
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the BSD-3-Clause License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original ArtiPub project by the Crawlab team
- AI SDK by Vercel
- shadcn/ui for the beautiful component library
- Next.js team for the amazing framework

---

**ArtiPub AI** - Revolutionizing content publishing with artificial intelligence