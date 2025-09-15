## v2.0.0 (2025-09-15) - ArtiPub AI

#### 🚀 Major Release - Complete Platform Rebuild

**ArtiPub AI**: A revolutionary transformation from browser automation to AI-powered content publishing.

#### ✨ New Features
- **🤖 AI-Powered Content Optimization**: Complete integration with advanced LLMs (OpenAI, Anthropic) for intelligent content adaptation
- **🧠 Intelligent Publishing Strategy**: AI analyzes content and determines optimal publishing schedules and platform selection
- **⚡ Modern Tech Stack**: Complete rebuild with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui
- **📊 Real-time Dashboard**: Live publishing task monitoring with detailed insights and progress tracking
- **🎯 Smart Scheduling**: AI-determined optimal publishing times for maximum engagement
- **🌟 Modern UI/UX**: Beautiful, responsive interface with dark mode support

#### 🔄 Breaking Changes
- **Migration from Browser Automation**: Replaced Puppeteer-based automation with AI-powered content processing
- **New Architecture**: Complete codebase rewrite with modern React patterns and TypeScript
- **Updated Dependencies**: Latest versions of all major dependencies

#### 🛠 Technology Improvements
- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **AI Integration**: Vercel AI SDK with multi-provider support
- **Performance**: Optimized bundle size and improved loading times

#### 📈 Enhanced Capabilities
- **Platform Support**: Enhanced support for 知乎, 掘金, CSDN, 简书, SegmentFault, 开源中国
- **Content Adaptation**: AI automatically adapts content for each platform's audience and requirements
- **SEO Optimization**: Automatic keyword optimization and metadata generation
- **Batch Processing**: Simultaneous publishing to multiple platforms

#### 🎯 User Experience
- **Simplified Workflow**: Streamlined article creation and publishing process
- **Real-time Feedback**: Live updates on publishing progress and results
- **Intelligent Recommendations**: AI suggests optimal platforms and timing
- **Error Handling**: Improved error messages and recovery mechanisms

This release represents a complete paradigm shift from traditional browser automation to intelligent AI-powered content optimization and distribution.

## v0.1.4 (2019-10-12)

#### Features / Enhancement
- Integrated Wechat platform (very basic, still under development)
- Tag selector for Juejin.

#### Bug Fixes
- Fixed failure to publish on Segmentfault issue. [#54](https://github.com/crawlab-team/artipub/issues/54)
- Fixed unable to save URL in the Chrome extension. [#38](https://github.com/crawlab-team/artipub/issues/38)
- Fixed web page style inconsistency when using the Chrome extension. [#37](https://github.com/crawlab-team/artipub/issues/37)
- Fixed failure to publish on Jianshu issue. [#32](https://github.com/crawlab-team/artipub/issues/32)

## v0.1.3 (2019-09-25)

#### Features / Enhancement

- Multi-Title Publish
- Better Editor ([react-markdown-editor-lite](https://www.npmjs.com/package/react-markdown-editor-lite))
- Cookie Login Status Validation
- Better Documentation (README)
- Platform Integration
    - [V2ex](https://v2ex.com)

#### Bug Fixes
- Fixed missing MongoDB parameter `authenticationDatabase` issue.
- Fixed failure to publish articles on Zhihu (actually published successfully). [#27](https://github.com/crawlab-team/artipub/issues/27)
- Fixed missing HTML content issue. [#26](https://github.com/crawlab-team/artipub/issues/26) 
- Close `Chrome Browser Debug Mode` by default. [#22](https://github.com/crawlab-team/artipub/issues/22)

## v0.1.2 (2019-09-20)

#### Features / Enhancement

- Article Edit
- Article Publish
- Article Stats 
- Login Helper
- Platform Management
- System Settings
- Docker Deployment
- NPM Package
- Platform Integration
    - [掘金](https://juejin.cn)
    - [SegmentFault](https://segmentfault.com)
    - [CSDN](https://csdn.net)
    - [简书](https://jianshu.com)
    - [知乎](https://zhihu.com)
    - [开源中国](https://oschina.net)
    - [今日头条](https://toutiao.com)
    - [博客园](https://cnblogs.com)
