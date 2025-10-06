/**
 * AI Spec Discovery Service
 * 
 * This service uses AI agents to automatically discover and generate workflow specifications
 * for publishing platforms. It can analyze platform UIs, identify selectors, and determine
 * the optimal publishing workflow with optional human supervision.
 */

import { WorkflowSpec, WorkflowStep, WorkflowSelectors, PlatformConfig, WorkflowAction } from './workflow-types';

export interface DiscoverySession {
  sessionId: string;
  platformUrl: string;
  status: 'initializing' | 'analyzing' | 'discovering' | 'validating' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  discoveredElements?: DiscoveredElement[];
  discoveredPages?: DiscoveredPage[];
  suggestedWorkflow?: WorkflowSpec;
  humanReviewRequired?: boolean;
  errors?: string[];
  visionAnalysis?: VisionAnalysisResult[];
}

export interface DiscoveredPage {
  pageNumber: number;
  url: string;
  title: string;
  purpose: 'editor' | 'settings' | 'preview' | 'publish' | 'confirmation' | 'unknown';
  elements: DiscoveredElement[];
  screenshot?: string;
  visionDescription?: string;
  navigationTo?: {
    nextPage?: string;
    trigger: string; // selector or action that navigates to next page
  };
}

export interface VisionAnalysisResult {
  pageUrl: string;
  timestamp: Date;
  description: string;
  identifiedElements: {
    type: string;
    purpose: string;
    location: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    confidence: number;
  }[];
  suggestedActions: string[];
  screenshot: string;
}

export interface DiscoveredElement {
  type: 'input' | 'button' | 'editor' | 'dropdown' | 'checkbox' | 'link' | 'form';
  purpose: 'title' | 'content' | 'publish' | 'category' | 'tags' | 'settings' | 'navigation' | 'unknown';
  selector: string;
  alternativeSelectors: string[];
  confidence: number;
  label?: string;
  placeholder?: string;
  attributes: Record<string, string>;
  pageNumber?: number; // Which page this element belongs to
  visualLocation?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface SupervisionRequest {
  sessionId: string;
  question: string;
  options?: string[];
  context: {
    screenshot?: string;
    currentStep: string;
    discoveredElements: DiscoveredElement[];
  };
}

export class AISpecDiscoveryService {
  private sessions: Map<string, DiscoverySession> = new Map();
  private supervisionRequests: Map<string, SupervisionRequest> = new Map();

  /**
   * Start a new spec discovery session for a platform
   */
  async startDiscovery(
    platformUrl: string,
    options?: {
      supervisionMode?: 'none' | 'optional' | 'required';
      useVisionAI?: boolean;
      multiPage?: boolean;
      maxPages?: number;
      testArticle?: {
        title: string;
        content: string;
      };
    }
  ): Promise<string> {
    const sessionId = this.generateSessionId();
    
    const session: DiscoverySession = {
      sessionId,
      platformUrl,
      status: 'initializing',
      progress: 0,
      discoveredElements: [],
      discoveredPages: [],
      visionAnalysis: [],
      humanReviewRequired: options?.supervisionMode === 'required'
    };

    this.sessions.set(sessionId, session);

    // Start discovery process asynchronously
    this.runDiscovery(sessionId, options);

    return sessionId;
  }

  /**
   * Main discovery process
   */
  private async runDiscovery(
    sessionId: string,
    options?: {
      supervisionMode?: 'none' | 'optional' | 'required';
      useVisionAI?: boolean;
      multiPage?: boolean;
      maxPages?: number;
      testArticle?: {
        title: string;
        content: string;
      };
    }
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    try {
      // Phase 1: Analyze platform
      session.status = 'analyzing';
      session.currentStep = 'Analyzing platform structure';
      session.progress = 10;
      
      const platformInfo = await this.analyzePlatform(session.platformUrl);
      
      // Phase 1.5: Vision AI Analysis (if enabled)
      if (options?.useVisionAI) {
        session.currentStep = 'Performing vision AI analysis';
        session.progress = 15;
        
        const visionResults = await this.performVisionAnalysis(session.platformUrl);
        session.visionAnalysis = visionResults;
      }
      
      // Phase 2: Discover elements (single or multi-page)
      session.status = 'discovering';
      session.currentStep = 'Discovering interactive elements';
      session.progress = 30;
      
      if (options?.multiPage) {
        // Multi-page discovery
        const pages = await this.discoverMultiPageWorkflow(
          session.platformUrl,
          options.maxPages || 5,
          options.useVisionAI || false
        );
        session.discoveredPages = pages;
        
        // Flatten all elements from all pages
        session.discoveredElements = pages.flatMap(page => 
          page.elements.map(el => ({ ...el, pageNumber: page.pageNumber }))
        );
      } else {
        // Single-page discovery (original behavior)
        const elements = await this.discoverElements(
          session.platformUrl,
          options?.useVisionAI || false
        );
        session.discoveredElements = elements;
        
        // Create a single page entry
        session.discoveredPages = [{
          pageNumber: 1,
          url: session.platformUrl,
          title: 'Editor Page',
          purpose: 'editor',
          elements: elements
        }];
      }
      
      // Phase 3: Identify workflow steps
      session.currentStep = 'Identifying workflow steps';
      session.progress = 50;
      
      const workflow = await this.identifyWorkflowSteps(
        platformInfo,
        session.discoveredElements,
        session.discoveredPages
      );
      
      // Phase 4: Human supervision if needed
      if (options?.supervisionMode !== 'none') {
        session.currentStep = 'Requesting human review';
        session.progress = 70;
        session.humanReviewRequired = true;
        
        await this.requestSupervision(sessionId, workflow, session.discoveredElements);
      }
      
      // Phase 5: Generate specification
      session.currentStep = 'Generating workflow specification';
      session.progress = 90;
      
      const spec = await this.generateSpecification(
        platformInfo,
        workflow,
        session.discoveredElements,
        session.discoveredPages
      );
      session.suggestedWorkflow = spec;
      
      // Phase 6: Validate with test article (if provided)
      if (options?.testArticle) {
        session.currentStep = 'Validating with test article';
        const validationResult = await this.validateWorkflow(spec, options.testArticle);
        
        if (!validationResult.success) {
          session.errors = validationResult.errors;
          if (options?.supervisionMode !== 'none') {
            await this.requestSupervisionForErrors(sessionId, validationResult.errors);
          }
        }
      }
      
      session.status = 'completed';
      session.progress = 100;
      session.currentStep = 'Discovery complete';
      
    } catch (error) {
      session.status = 'failed';
      session.errors = [error instanceof Error ? error.message : 'Unknown error'];
      console.error('Discovery failed:', error);
    }
  }

  /**
   * Analyze platform to identify type and structure
   */
  private async analyzePlatform(platformUrl: string): Promise<PlatformConfig> {
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, this would:
    // 1. Load the platform page
    // 2. Analyze the DOM structure
    // 3. Identify the platform type (blogging, CMS, forum, etc.)
    // 4. Detect authentication requirements
    // 5. Identify the editor type (rich text, markdown, WYSIWYG)
    
    const url = new URL(platformUrl);
    const domain = url.hostname.replace('www.', '');
    const platformName = domain.split('.')[0];
    
    return {
      platformId: platformName,
      name: platformName.charAt(0).toUpperCase() + platformName.slice(1),
      baseUrl: `${url.protocol}//${url.hostname}`,
      editorUrl: platformUrl,
      authType: 'cookie', // Most platforms use cookie-based auth
      contentFormat: 'markdown' // Default to markdown, will be refined
    };
  }

  /**
   * Discover interactive elements on the page
   */
  private async discoverElements(
    platformUrl: string,
    useVisionAI: boolean = false
  ): Promise<DiscoveredElement[]> {
    // Simulate AI element discovery
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production, this would:
    // 1. Use browser automation to load the page
    // 2. Identify all interactive elements (inputs, buttons, editors)
    // 3. Use AI vision to understand element purposes from labels/placeholders
    // 4. Generate multiple selector strategies (CSS, XPath, data attributes)
    // 5. Score each element by confidence based on context
    
    const elements: DiscoveredElement[] = [
      {
        type: 'input',
        purpose: 'title',
        selector: 'input[placeholder*="title"], input[name="title"], .title-input',
        alternativeSelectors: [
          '#article-title',
          '[data-testid="article-title"]',
          '.editor-title input'
        ],
        confidence: 0.95,
        placeholder: 'Enter article title',
        attributes: {
          type: 'text',
          maxLength: '100'
        }
      },
      {
        type: 'editor',
        purpose: 'content',
        selector: '.editor-content, [contenteditable="true"], textarea.content',
        alternativeSelectors: [
          '#editor',
          '.markdown-editor',
          '[role="textbox"]'
        ],
        confidence: 0.92,
        attributes: {
          contenteditable: 'true'
        }
      },
      {
        type: 'button',
        purpose: 'publish',
        selector: 'button:has-text("Publish"), button.publish, [type="submit"]',
        alternativeSelectors: [
          '#publish-btn',
          '.publish-button',
          'button[data-action="publish"]'
        ],
        confidence: 0.90,
        label: 'Publish',
        attributes: {
          type: 'button'
        }
      },
      {
        type: 'input',
        purpose: 'tags',
        selector: 'input[placeholder*="tag"], .tag-input',
        alternativeSelectors: [
          '#tags',
          '[data-testid="tags-input"]'
        ],
        confidence: 0.75,
        placeholder: 'Add tags',
        attributes: {
          type: 'text'
        }
      }
    ];
    
    // If vision AI is enabled, enhance with visual information
    if (useVisionAI) {
      elements.forEach(el => {
        el.visualLocation = {
          x: Math.random() * 1000,
          y: Math.random() * 800,
          width: 200 + Math.random() * 300,
          height: 30 + Math.random() * 50
        };
      });
    }
    
    return elements;
  }

  /**
   * Perform vision AI analysis on a page
   */
  private async performVisionAnalysis(pageUrl: string): Promise<VisionAnalysisResult[]> {
    // Simulate vision AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In production, this would:
    // 1. Capture screenshot of the page
    // 2. Send to vision AI (GPT-4 Vision, Claude with vision, etc.)
    // 3. Get description of UI elements and their purposes
    // 4. Identify visual relationships and layout
    // 5. Suggest optimal interaction flow
    
    return [{
      pageUrl,
      timestamp: new Date(),
      description: 'The page contains a modern article editor with a clean layout. ' +
                  'At the top is a title input field, followed by a large content editor area. ' +
                  'On the right side are metadata fields for tags and categories. ' +
                  'A prominent "Publish" button is located at the bottom right.',
      identifiedElements: [
        {
          type: 'input',
          purpose: 'title',
          location: { x: 50, y: 100, width: 800, height: 40 },
          confidence: 0.98
        },
        {
          type: 'editor',
          purpose: 'content',
          location: { x: 50, y: 160, width: 800, height: 400 },
          confidence: 0.95
        },
        {
          type: 'button',
          purpose: 'publish',
          location: { x: 750, y: 600, width: 100, height: 40 },
          confidence: 0.93
        }
      ],
      suggestedActions: [
        'Fill title field first',
        'Then add content to main editor',
        'Optionally add tags/categories',
        'Click publish button to submit'
      ],
      screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    }];
  }

  /**
   * Discover multi-page workflow
   */
  private async discoverMultiPageWorkflow(
    startUrl: string,
    maxPages: number,
    useVisionAI: boolean
  ): Promise<DiscoveredPage[]> {
    // Simulate multi-page discovery
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In production, this would:
    // 1. Start from the initial URL
    // 2. Discover elements on the current page
    // 3. Identify navigation elements (Next, Continue, etc.)
    // 4. Follow navigation to discover subsequent pages
    // 5. Build a complete multi-page workflow map
    
    const pages: DiscoveredPage[] = [];
    
    // Page 1: Editor page
    pages.push({
      pageNumber: 1,
      url: startUrl,
      title: 'Article Editor',
      purpose: 'editor',
      elements: [
        {
          type: 'input',
          purpose: 'title',
          selector: 'input[name="title"]',
          alternativeSelectors: ['#title', '.title-input'],
          confidence: 0.95,
          placeholder: 'Enter article title',
          attributes: { type: 'text' },
          pageNumber: 1,
          visualLocation: useVisionAI ? { x: 50, y: 100, width: 800, height: 40 } : undefined
        },
        {
          type: 'editor',
          purpose: 'content',
          selector: '[contenteditable="true"]',
          alternativeSelectors: ['#editor', '.content-editor'],
          confidence: 0.92,
          attributes: { contenteditable: 'true' },
          pageNumber: 1,
          visualLocation: useVisionAI ? { x: 50, y: 160, width: 800, height: 400 } : undefined
        },
        {
          type: 'button',
          purpose: 'navigation',
          selector: 'button:has-text("Next"), button.next',
          alternativeSelectors: ['#next-btn', '[data-action="next"]'],
          confidence: 0.88,
          label: 'Next',
          attributes: { type: 'button' },
          pageNumber: 1
        }
      ],
      navigationTo: {
        nextPage: `${startUrl}/settings`,
        trigger: 'button:has-text("Next")'
      },
      visionDescription: useVisionAI ? 'Editor page with title and content fields' : undefined
    });
    
    // Page 2: Settings/Metadata page
    if (maxPages >= 2) {
      pages.push({
        pageNumber: 2,
        url: `${startUrl}/settings`,
        title: 'Article Settings',
        purpose: 'settings',
        elements: [
          {
            type: 'input',
            purpose: 'tags',
            selector: 'input[name="tags"]',
            alternativeSelectors: ['#tags', '.tags-input'],
            confidence: 0.85,
            placeholder: 'Add tags',
            attributes: { type: 'text' },
            pageNumber: 2
          },
          {
            type: 'dropdown',
            purpose: 'category',
            selector: 'select[name="category"]',
            alternativeSelectors: ['#category', '.category-select'],
            confidence: 0.83,
            attributes: { type: 'select' },
            pageNumber: 2
          },
          {
            type: 'button',
            purpose: 'navigation',
            selector: 'button:has-text("Preview"), button.preview',
            alternativeSelectors: ['#preview-btn'],
            confidence: 0.87,
            label: 'Preview',
            attributes: { type: 'button' },
            pageNumber: 2
          }
        ],
        navigationTo: {
          nextPage: `${startUrl}/preview`,
          trigger: 'button:has-text("Preview")'
        },
        visionDescription: useVisionAI ? 'Settings page with metadata fields' : undefined
      });
    }
    
    // Page 3: Preview page
    if (maxPages >= 3) {
      pages.push({
        pageNumber: 3,
        url: `${startUrl}/preview`,
        title: 'Preview & Publish',
        purpose: 'preview',
        elements: [
          {
            type: 'button',
            purpose: 'publish',
            selector: 'button:has-text("Publish"), button.publish',
            alternativeSelectors: ['#publish-btn', '[data-action="publish"]'],
            confidence: 0.95,
            label: 'Publish',
            attributes: { type: 'button' },
            pageNumber: 3
          },
          {
            type: 'button',
            purpose: 'navigation',
            selector: 'button:has-text("Back"), button.back',
            alternativeSelectors: ['#back-btn'],
            confidence: 0.80,
            label: 'Back to Edit',
            attributes: { type: 'button' },
            pageNumber: 3
          }
        ],
        navigationTo: {
          nextPage: `${startUrl}/confirmation`,
          trigger: 'button:has-text("Publish")'
        },
        visionDescription: useVisionAI ? 'Preview page with final publish button' : undefined
      });
    }
    
    // Page 4: Confirmation page
    if (maxPages >= 4) {
      pages.push({
        pageNumber: 4,
        url: `${startUrl}/confirmation`,
        title: 'Published Successfully',
        purpose: 'confirmation',
        elements: [
          {
            type: 'link',
            purpose: 'navigation',
            selector: 'a.article-link, a[href*="/article/"]',
            alternativeSelectors: ['.published-url'],
            confidence: 0.90,
            label: 'View Published Article',
            attributes: { href: '/article/123' },
            pageNumber: 4
          }
        ],
        visionDescription: useVisionAI ? 'Success page with link to published article' : undefined
      });
    }
    
    return pages;
  }

  /**
   * Identify the workflow steps based on discovered elements
   */
  private async identifyWorkflowSteps(
    platform: PlatformConfig,
    elements: DiscoveredElement[],
    pages?: DiscoveredPage[]
  ): Promise<WorkflowStep[]> {
    // Simulate AI workflow identification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, this would:
    // 1. Analyze the logical flow of publishing
    // 2. Determine dependencies between elements
    // 3. Identify required vs optional steps
    // 4. Detect validation requirements
    // 5. Identify wait conditions and timing
    // 6. Handle multi-page navigation
    
    const steps: WorkflowStep[] = [];
    let stepNumber = 1;
    
    // If multi-page, build workflow across pages
    if (pages && pages.length > 1) {
      for (const page of pages) {
        // Navigation step to page (except first page)
        if (page.pageNumber > 1) {
          const prevPage = pages[page.pageNumber - 2];
          if (prevPage.navigationTo) {
            steps.push({
              stepNumber: stepNumber++,
              name: `Navigate to ${page.title}`,
              action: 'click',
              selector: prevPage.navigationTo.trigger,
              timeout: 5000,
              validation: `${page.title} page loaded`
            });
            
            steps.push({
              stepNumber: stepNumber++,
              name: `Wait for ${page.title}`,
              action: 'wait',
              timeout: 2000
            });
          }
        }
        
        // Add steps for elements on this page
        for (const element of page.elements) {
          if (element.purpose === 'navigation') continue; // Skip nav elements
          
          const stepName = this.getStepNameForElement(element, page);
          const step: WorkflowStep = {
            stepNumber: stepNumber++,
            name: stepName,
            action: this.getActionForElement(element),
            selector: element.selector,
            validation: `${stepName} completed`
          };
          
          if (element.purpose === 'title' || element.purpose === 'content' || element.purpose === 'tags') {
            step.value = `{{article.${element.purpose}}}`;
          }
          
          if (element.alternativeSelectors.length > 0) {
            step.fallback = element.alternativeSelectors.map(selector => ({
              stepNumber: step.stepNumber,
              name: `${stepName} (fallback)`,
              action: step.action,
              selector
            }));
          }
          
          steps.push(step);
        }
      }
      
      // Extract published URL (final step)
      steps.push({
        stepNumber: stepNumber++,
        name: 'Extract Published URL',
        action: 'extract',
        selector: 'meta[property="og:url"], .article-url, a.permalink, a[href*="/article/"]',
        validation: 'URL extracted'
      });
      
    } else {
      // Single-page workflow (original logic)
      // Step 1: Navigate to editor
      steps.push({
        stepNumber: stepNumber++,
        name: 'Navigate to Editor',
        action: 'navigate',
        url: platform.editorUrl,
        timeout: 10000,
        validation: 'Editor page loaded'
      });
      
      // Step 2: Input title
      const titleElement = elements.find(e => e.purpose === 'title');
      if (titleElement) {
        steps.push({
          stepNumber: stepNumber++,
          name: 'Input Article Title',
          action: 'fill',
          selector: titleElement.selector,
          value: '{{article.title}}',
          validation: 'Title input completed',
          fallback: titleElement.alternativeSelectors.map(selector => ({
            stepNumber: stepNumber - 1,
            name: 'Input Article Title (fallback)',
            action: 'fill',
            selector,
            value: '{{article.title}}'
          }))
        });
      }
      
      // Step 3: Input content
      const contentElement = elements.find(e => e.purpose === 'content');
      if (contentElement) {
        steps.push({
          stepNumber: stepNumber++,
          name: 'Input Article Content',
          action: 'fill',
          selector: contentElement.selector,
          value: '{{article.content}}',
          validation: 'Content input completed',
          fallback: contentElement.alternativeSelectors.map(selector => ({
            stepNumber: stepNumber - 1,
            name: 'Input Article Content (fallback)',
            action: 'fill',
            selector,
            value: '{{article.content}}'
          }))
        });
      }
      
      // Step 4: Input tags (optional)
      const tagsElement = elements.find(e => e.purpose === 'tags');
      if (tagsElement && tagsElement.confidence > 0.7) {
        steps.push({
          stepNumber: stepNumber++,
          name: 'Add Tags',
          action: 'fill',
          selector: tagsElement.selector,
          value: '{{article.tags}}',
          validation: 'Tags added'
        });
      }
      
      // Step 5: Publish
      const publishElement = elements.find(e => e.purpose === 'publish');
      if (publishElement) {
        steps.push({
          stepNumber: stepNumber++,
          name: 'Publish Article',
          action: 'click',
          selector: publishElement.selector,
          timeout: 5000,
          validation: 'Article published successfully',
          fallback: publishElement.alternativeSelectors.map(selector => ({
            stepNumber: stepNumber - 1,
            name: 'Publish Article (fallback)',
            action: 'click',
            selector,
            timeout: 5000
          }))
        });
      }
      
      // Step 6: Extract published URL
      steps.push({
        stepNumber: stepNumber++,
        name: 'Extract Published URL',
        action: 'extract',
        selector: 'meta[property="og:url"], .article-url, a.permalink',
        validation: 'URL extracted'
      });
    }
    
    return steps;
  }

  /**
   * Get step name for an element
   */
  private getStepNameForElement(element: DiscoveredElement, page: DiscoveredPage): string {
    const purposeMap: Record<string, string> = {
      title: 'Input Article Title',
      content: 'Input Article Content',
      tags: 'Add Tags',
      category: 'Select Category',
      publish: 'Publish Article',
      settings: 'Configure Settings'
    };
    
    return purposeMap[element.purpose] || `Interact with ${element.type}`;
  }

  /**
   * Get action type for an element
   */
  private getActionForElement(element: DiscoveredElement): WorkflowAction {
    if (element.type === 'button') return 'click';
    if (element.type === 'input' || element.type === 'editor') return 'fill';
    if (element.type === 'dropdown') return 'select';
    if (element.type === 'checkbox') return 'click';
    return 'fill';
  }

  /**
   * Generate complete workflow specification
   */
  private async generateSpecification(
    platform: PlatformConfig,
    steps: WorkflowStep[],
    elements: DiscoveredElement[],
    pages?: DiscoveredPage[]
  ): Promise<WorkflowSpec> {
    // Build selectors object
    const selectors: WorkflowSelectors = {
      editor: {
        title: elements.find(e => e.purpose === 'title')?.selector || '',
        content: elements.find(e => e.purpose === 'content')?.selector || '',
        publishButton: elements.find(e => e.purpose === 'publish')?.selector || ''
      }
    };
    
    // Add optional selectors
    const tagsElement = elements.find(e => e.purpose === 'tags');
    if (tagsElement) {
      selectors.editor.tags = tagsElement.selector;
    }
    
    const categoryElement = elements.find(e => e.purpose === 'category');
    if (categoryElement) {
      selectors.editor.category = categoryElement.selector;
    }
    
    const description = pages && pages.length > 1
      ? `Auto-discovered multi-page workflow for ${platform.name} (${pages.length} pages)`
      : `Auto-discovered workflow for ${platform.name}`;
    
    return {
      version: '1.0.0',
      platform,
      steps,
      selectors,
      errorHandling: [
        {
          errorType: 'Selector not found',
          detection: 'Element not found error',
          recoveryStrategy: 'Try alternative selectors from fallback list',
          maxRetries: 3,
          retryDelay: 2000
        },
        {
          errorType: 'Timeout',
          detection: 'Action timeout',
          recoveryStrategy: 'Increase timeout and retry',
          maxRetries: 2,
          retryDelay: 3000
        },
        {
          errorType: 'Authentication required',
          detection: 'Login page detected',
          recoveryStrategy: 'Throw error - user must authenticate',
          maxRetries: 0
        },
        {
          errorType: 'Navigation failed',
          detection: 'Page navigation timeout or error',
          recoveryStrategy: 'Retry navigation with increased timeout',
          maxRetries: 2,
          retryDelay: 5000
        }
      ],
      validationRules: [
        {
          name: 'Title required',
          description: 'Article must have a title',
          check: 'article.title && article.title.length > 0',
          required: true
        },
        {
          name: 'Content required',
          description: 'Article must have content',
          check: 'article.content && article.content.length > 0',
          required: true
        }
      ],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'AI Spec Discovery',
        description
      }
    };
  }

  /**
   * Validate workflow with a test article
   */
  private async validateWorkflow(
    spec: WorkflowSpec,
    testArticle: { title: string; content: string }
  ): Promise<{ success: boolean; errors?: string[] }> {
    // Simulate validation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In production, this would:
    // 1. Execute the workflow with the test article
    // 2. Verify each step completes successfully
    // 3. Check that the article was published
    // 4. Validate the published content matches input
    
    // For now, return success with some random chance of issues
    const success = Math.random() > 0.2; // 80% success rate
    
    if (!success) {
      return {
        success: false,
        errors: [
          'Publish button selector needs adjustment',
          'Content editor requires different input method'
        ]
      };
    }
    
    return { success: true };
  }

  /**
   * Request human supervision for workflow review
   */
  private async requestSupervision(
    sessionId: string,
    workflow: WorkflowStep[],
    elements: DiscoveredElement[]
  ): Promise<void> {
    const request: SupervisionRequest = {
      sessionId,
      question: 'Please review the discovered workflow and elements',
      context: {
        currentStep: 'Workflow review',
        discoveredElements: elements
      }
    };
    
    this.supervisionRequests.set(sessionId, request);
    
    // In production, this would:
    // 1. Send notification to user
    // 2. Display UI for review
    // 3. Wait for user approval/modifications
    // 4. Apply user feedback to workflow
  }

  /**
   * Request supervision for validation errors
   */
  private async requestSupervisionForErrors(
    sessionId: string,
    errors: string[]
  ): Promise<void> {
    const request: SupervisionRequest = {
      sessionId,
      question: 'Validation errors detected. Please review and provide corrections.',
      options: ['Adjust selectors', 'Modify workflow steps', 'Retry validation', 'Accept as-is'],
      context: {
        currentStep: 'Error resolution',
        discoveredElements: this.sessions.get(sessionId)?.discoveredElements || []
      }
    };
    
    this.supervisionRequests.set(sessionId, request);
  }

  /**
   * Get session status
   */
  getSession(sessionId: string): DiscoverySession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get pending supervision requests
   */
  getSupervisionRequests(): SupervisionRequest[] {
    return Array.from(this.supervisionRequests.values());
  }

  /**
   * Respond to supervision request
   */
  async respondToSupervision(
    sessionId: string,
    approved: boolean,
    modifications?: {
      elements?: DiscoveredElement[];
      steps?: WorkflowStep[];
    }
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    if (!approved) {
      session.status = 'failed';
      session.errors = ['Workflow rejected by human supervisor'];
      return;
    }
    
    // Apply modifications if provided
    if (modifications?.elements) {
      session.discoveredElements = modifications.elements;
    }
    
    if (modifications?.steps && session.suggestedWorkflow) {
      session.suggestedWorkflow.steps = modifications.steps;
    }
    
    // Continue processing
    session.humanReviewRequired = false;
    this.supervisionRequests.delete(sessionId);
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): DiscoverySession[] {
    return Array.from(this.sessions.values()).filter(
      s => s.status !== 'completed' && s.status !== 'failed'
    );
  }

  /**
   * Export discovered specification as markdown
   */
  exportAsMarkdown(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session || !session.suggestedWorkflow) {
      throw new Error('No completed workflow found for session');
    }
    
    const spec = session.suggestedWorkflow;
    const isMultiPage = session.discoveredPages && session.discoveredPages.length > 1;
    const hasVisionAI = session.visionAnalysis && session.visionAnalysis.length > 0;
    
    let markdown = `# ${spec.platform.name} Workflow Specification

## Auto-Discovered Workflow
**Generated**: ${new Date().toISOString()}
**Discovery Session**: ${sessionId}
**Confidence**: ${this.calculateOverallConfidence(session)}%
**Workflow Type**: ${isMultiPage ? `Multi-Page (${session.discoveredPages?.length} pages)` : 'Single-Page'}
**Vision AI**: ${hasVisionAI ? 'Enabled' : 'Disabled'}

### Platform Information
- **Platform ID**: ${spec.platform.platformId}
- **Base URL**: ${spec.platform.baseUrl}
- **Editor URL**: ${spec.platform.editorUrl}
- **Authentication**: ${spec.platform.authType}
- **Content Format**: ${spec.platform.contentFormat}
`;

    // Vision AI analysis section
    if (hasVisionAI && session.visionAnalysis) {
      markdown += `\n### Vision AI Analysis\n`;
      session.visionAnalysis.forEach((analysis, idx) => {
        markdown += `\n#### Analysis ${idx + 1}\n`;
        markdown += `**Page**: ${analysis.pageUrl}\n`;
        markdown += `**Description**: ${analysis.description}\n\n`;
        markdown += `**Identified Elements**:\n`;
        analysis.identifiedElements.forEach(el => {
          markdown += `- ${el.type} (${el.purpose}) - Confidence: ${(el.confidence * 100).toFixed(1)}%\n`;
          markdown += `  Location: (${el.location.x}, ${el.location.y}) ${el.location.width}x${el.location.height}\n`;
        });
        markdown += `\n**Suggested Actions**:\n`;
        analysis.suggestedActions.forEach(action => {
          markdown += `- ${action}\n`;
        });
      });
    }

    // Multi-page workflow section
    if (isMultiPage && session.discoveredPages) {
      markdown += `\n### Multi-Page Workflow\n`;
      session.discoveredPages.forEach(page => {
        markdown += `\n#### Page ${page.pageNumber}: ${page.title}\n`;
        markdown += `- **URL**: ${page.url}\n`;
        markdown += `- **Purpose**: ${page.purpose}\n`;
        if (page.visionDescription) {
          markdown += `- **Vision Description**: ${page.visionDescription}\n`;
        }
        markdown += `- **Elements**: ${page.elements.length}\n`;
        if (page.navigationTo) {
          markdown += `- **Next Page**: ${page.navigationTo.nextPage}\n`;
          markdown += `- **Navigation Trigger**: \`${page.navigationTo.trigger}\`\n`;
        }
      });
    }

    markdown += `\n### Discovered Elements\n`;
    session.discoveredElements?.forEach(e => {
      markdown += `\n#### ${e.purpose.charAt(0).toUpperCase() + e.purpose.slice(1)} Element`;
      if (e.pageNumber) {
        markdown += ` (Page ${e.pageNumber})`;
      }
      markdown += `\n- **Type**: ${e.type}\n`;
      markdown += `- **Selector**: \`${e.selector}\`\n`;
      markdown += `- **Confidence**: ${(e.confidence * 100).toFixed(1)}%\n`;
      markdown += `- **Alternative Selectors**: ${e.alternativeSelectors.map(s => `\`${s}\``).join(', ')}\n`;
      if (e.visualLocation) {
        markdown += `- **Visual Location**: (${e.visualLocation.x}, ${e.visualLocation.y}) ${e.visualLocation.width}x${e.visualLocation.height}\n`;
      }
    });

    markdown += `\n### Workflow Steps\n`;
    spec.steps.forEach(step => {
      markdown += `\n#### Step ${step.stepNumber}: ${step.name}\n`;
      markdown += `- **Action**: ${step.action}\n`;
      if (step.selector) markdown += `- **Selector**: \`${step.selector}\`\n`;
      if (step.url) markdown += `- **URL**: ${step.url}\n`;
      if (step.value) markdown += `- **Value**: ${step.value}\n`;
      if (step.timeout) markdown += `- **Timeout**: ${step.timeout}ms\n`;
      if (step.validation) markdown += `- **Validation**: ${step.validation}\n`;
      if (step.fallback && step.fallback.length > 0) {
        markdown += `- **Fallback Selectors**: ${step.fallback.length}\n`;
      }
    });

    markdown += `\n### Selectors\n\`\`\`json\n${JSON.stringify(spec.selectors, null, 2)}\n\`\`\`\n`;

    markdown += `\n### Error Handling\n`;
    spec.errorHandling.forEach(eh => {
      markdown += `\n- **${eh.errorType}**\n`;
      markdown += `  - Detection: ${eh.detection}\n`;
      markdown += `  - Recovery: ${eh.recoveryStrategy}\n`;
      markdown += `  - Max Retries: ${eh.maxRetries}\n`;
      if (eh.retryDelay) markdown += `  - Retry Delay: ${eh.retryDelay}ms\n`;
    });

    markdown += `\n### Validation Rules\n`;
    spec.validationRules.forEach(rule => {
      markdown += `\n- **${rule.name}**${rule.required ? ' (Required)' : ''}\n`;
      markdown += `  - ${rule.description}\n`;
      markdown += `  - Check: \`${rule.check}\`\n`;
    });

    markdown += `\n---\n`;
    markdown += `*This workflow was automatically discovered by AI Spec Discovery Service*\n`;
    if (hasVisionAI) {
      markdown += `*Vision AI was used to enhance element detection and workflow understanding*\n`;
    }
    if (isMultiPage) {
      markdown += `*This is a multi-page workflow spanning ${session.discoveredPages?.length} pages*\n`;
    }
    markdown += `*Human review recommended before production use*\n`;

    return markdown;
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(session: DiscoverySession): number {
    if (!session.discoveredElements || session.discoveredElements.length === 0) {
      return 0;
    }
    
    const totalConfidence = session.discoveredElements.reduce(
      (sum, e) => sum + e.confidence,
      0
    );
    
    return Math.round((totalConfidence / session.discoveredElements.length) * 100);
  }
}

export const specDiscoveryService = new AISpecDiscoveryService();
