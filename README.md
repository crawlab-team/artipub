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