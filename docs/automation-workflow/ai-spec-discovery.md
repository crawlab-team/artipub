# AI Spec Discovery Guide

## Overview

The AI Spec Discovery Service automatically discovers and generates workflow specifications for article publishing platforms. Instead of manually analyzing platforms and writing specifications, AI agents can explore platform UIs, identify interactive elements, and determine the optimal publishing workflow.

## Key Benefits

### 🚀 Zero Configuration
- No need to manually inspect platform HTML
- No need to write selectors or workflow steps
- Just provide the platform URL and let AI do the work

### 🧠 Intelligent Discovery
- AI understands common UI patterns for publishing platforms
- Identifies title inputs, content editors, publish buttons automatically
- Generates robust selectors with confidence scores
- Creates fallback strategies for reliability

### 👁️ Human Supervision
- Three supervision modes: none, optional, required
- Review AI discoveries before activation
- Correct any mistakes AI makes
- Build trust through transparency

### ✅ Validation
- Tests workflows with sample articles
- Validates each step before finalizing
- Identifies and reports issues
- Iterates until workflow is reliable

## How It Works

### Phase 1: Platform Analysis
AI loads the platform's editor page and analyzes:
- DOM structure and hierarchy
- Page type (blog, CMS, forum, etc.)
- Authentication requirements
- Editor type (WYSIWYG, markdown, rich text)

### Phase 2: Element Discovery
AI identifies interactive elements:
- **Input fields**: Title, tags, categories
- **Editors**: Content editors, text areas
- **Buttons**: Publish, save, schedule
- **Dropdowns**: Categories, visibility settings
- **Checkboxes**: Options and settings

For each element, AI determines:
- **Purpose**: What the element is for (title, content, publish, etc.)
- **Selector**: Primary CSS selector
- **Alternatives**: Fallback selectors for reliability
- **Confidence**: How certain AI is about the purpose (0-1)

### Phase 3: Workflow Identification
AI determines the publishing sequence:
1. Navigation steps (if needed)
2. Input steps (title, content, metadata)
3. Configuration steps (tags, categories)
4. Publishing action
5. URL extraction

AI also identifies:
- Required vs optional steps
- Step dependencies
- Wait conditions
- Validation requirements

### Phase 4: Human Supervision (Optional)
Depending on supervision mode:
- **None**: AI completes fully automatically
- **Optional**: Human reviews final workflow
- **Required**: Human approves each phase

Human can:
- Review discovered elements
- Adjust selectors
- Modify workflow steps
- Request re-analysis

### Phase 5: Specification Generation
AI generates a complete workflow specification:
- Platform configuration
- Workflow steps with actions
- Selectors with fallbacks
- Error handling strategies
- Validation rules

### Phase 6: Validation
If a test article is provided:
- Executes the workflow with test data
- Verifies each step succeeds
- Checks published content
- Reports any issues

## Usage Examples

### Example 1: Automatic Discovery

```typescript
import { workflowManagement } from '@/lib/workflow-management';

// Discover workflow with no human intervention
const sessionId = await workflowManagement.discoverWorkflow(
  'https://dev.to/new',
  { supervisionMode: 'none' }
);

// Wait for completion
await waitForDiscovery(sessionId);

// Apply discovered workflow
const workflow = await workflowManagement.applyDiscoveredWorkflow(sessionId);
console.log('Workflow ready:', workflow.spec.platform.name);
```

### Example 2: Discovery with Review

```typescript
// Discover with human review
const sessionId = await workflowManagement.discoverWorkflow(
  'https://medium.com/new-story',
  {
    supervisionMode: 'optional',
    testArticle: {
      title: 'Testing AI Discovery',
      content: 'This validates the workflow works correctly.'
    }
  }
);

// Monitor progress
const session = workflowManagement.getDiscoverySession(sessionId);
console.log(`Progress: ${session.progress}%`);
console.log(`Current: ${session.currentStep}`);

// Review discovered elements
if (session.discoveredElements) {
  session.discoveredElements.forEach(element => {
    console.log(`${element.purpose}: ${element.selector}`);
    console.log(`  Confidence: ${(element.confidence * 100).toFixed(1)}%`);
  });
}

// When review is needed
if (session.humanReviewRequired) {
  // Present UI for review
  showReviewUI(session);
  
  // After human review
  await specDiscoveryService.respondToSupervision(
    sessionId,
    true, // approved
    modifiedWorkflow // optional modifications
  );
}

// Apply workflow
const workflow = await workflowManagement.applyDiscoveredWorkflow(sessionId);
```

### Example 3: Step-by-Step Supervision

```typescript
// Require human approval at each step
const sessionId = await workflowManagement.discoverWorkflow(
  'https://hashnode.com/create',
  { supervisionMode: 'required' }
);

// Check for supervision requests
const requests = specDiscoveryService.getSupervisionRequests();

for (const request of requests) {
  console.log('Question:', request.question);
  
  // Present to user for decision
  const approved = await askUser(request);
  
  await specDiscoveryService.respondToSupervision(
    sessionId,
    approved
  );
}
```

### Example 4: Export and Version Control

```typescript
// Discover workflow
const sessionId = await workflowManagement.discoverWorkflow(
  'https://ghost.org/editor'
);

// Wait for completion
await waitForDiscovery(sessionId);

// Export as markdown
const markdown = workflowManagement.exportDiscoveredWorkflow(sessionId);

// Save to file for version control
import fs from 'fs';
fs.writeFileSync(
  'docs/automation-workflow/ghost.md',
  markdown
);

console.log('Workflow specification saved to docs/');
```

## Discovery Session API

### Start Discovery

```typescript
const sessionId = await workflowManagement.discoverWorkflow(
  platformUrl: string,
  options?: {
    supervisionMode?: 'none' | 'optional' | 'required';
    testArticle?: {
      title: string;
      content: string;
    };
  }
): Promise<string>
```

### Get Session Status

```typescript
const session = workflowManagement.getDiscoverySession(sessionId);

// Session properties:
// - sessionId: string
// - platformUrl: string
// - status: 'initializing' | 'analyzing' | 'discovering' | 'validating' | 'completed' | 'failed'
// - progress: number (0-100)
// - currentStep?: string
// - discoveredElements?: DiscoveredElement[]
// - suggestedWorkflow?: WorkflowSpec
// - humanReviewRequired?: boolean
// - errors?: string[]
```

### Apply Discovered Workflow

```typescript
const workflow = await workflowManagement.applyDiscoveredWorkflow(
  sessionId: string
): Promise<WorkflowVersion | null>
```

### Export as Markdown

```typescript
const markdown = workflowManagement.exportDiscoveredWorkflow(
  sessionId: string
): string
```

### Respond to Supervision Request

```typescript
import { specDiscoveryService } from '@/lib/ai-spec-discovery';

await specDiscoveryService.respondToSupervision(
  sessionId: string,
  approved: boolean,
  modifications?: {
    elements?: DiscoveredElement[];
    steps?: WorkflowStep[];
  }
): Promise<void>
```

## Discovered Element Structure

```typescript
interface DiscoveredElement {
  type: 'input' | 'button' | 'editor' | 'dropdown' | 'checkbox';
  purpose: 'title' | 'content' | 'publish' | 'category' | 'tags' | 'settings' | 'unknown';
  selector: string; // Primary CSS selector
  alternativeSelectors: string[]; // Fallback selectors
  confidence: number; // 0-1 confidence score
  label?: string; // Element label text
  placeholder?: string; // Placeholder text
  attributes: Record<string, string>; // HTML attributes
}
```

## Best Practices

### 1. Use Test Articles for Validation

Always provide a test article when discovering new platforms:

```typescript
const sessionId = await workflowManagement.discoverWorkflow(url, {
  testArticle: {
    title: 'Test Article - Please Delete',
    content: 'This is a test to validate the workflow.'
  }
});
```

This helps AI validate the workflow actually works before activation.

### 2. Start with Optional Supervision

For new platforms, use optional supervision:

```typescript
const sessionId = await workflowManagement.discoverWorkflow(url, {
  supervisionMode: 'optional' // Review before activating
});
```

Once you trust the AI for a platform type, switch to `none`.

### 3. Export Specifications for Version Control

Always export and commit discovered specifications:

```typescript
const markdown = workflowManagement.exportDiscoveredWorkflow(sessionId);
fs.writeFileSync(`docs/automation-workflow/${platform}.md`, markdown);
```

This creates a backup and allows manual refinement.

### 4. Monitor Discovery Progress

For long-running discoveries, monitor progress:

```typescript
const interval = setInterval(() => {
  const session = workflowManagement.getDiscoverySession(sessionId);
  console.log(`${session.progress}% - ${session.currentStep}`);
  
  if (session.status === 'completed' || session.status === 'failed') {
    clearInterval(interval);
  }
}, 1000);
```

### 5. Handle Errors Gracefully

Discovery might fail for various reasons:

```typescript
const session = workflowManagement.getDiscoverySession(sessionId);

if (session.status === 'failed') {
  console.error('Discovery failed:', session.errors);
  
  // Retry with different options
  const retrySessionId = await workflowManagement.discoverWorkflow(url, {
    supervisionMode: 'required' // Get human help
  });
}
```

## Troubleshooting

### Discovery Fails to Find Elements

**Problem**: AI can't identify key elements (title, content, publish button).

**Solutions**:
- Use `supervisionMode: 'required'` to guide AI
- Provide clear test article to help AI understand context
- Try discovering from different entry points (e.g., draft editor vs. new post page)

### Low Confidence Scores

**Problem**: Discovered elements have confidence < 0.7.

**Solutions**:
- Review elements manually before applying
- Modify selectors to be more specific
- Add additional validation in workflow steps

### Validation Fails

**Problem**: Test article publishing fails during validation.

**Solutions**:
- Check if platform requires authentication
- Verify test article meets platform requirements
- Review error messages in session.errors
- Use supervision to manually correct workflow

### Wrong Elements Identified

**Problem**: AI identifies wrong purpose for elements.

**Solutions**:
- Use supervision mode to correct mistakes
- Manually adjust element purposes
- Export and refine specification manually

## Future Enhancements

- **Vision-based discovery**: Use AI vision to understand UI visually
- **Multi-page workflows**: Support complex publishing flows
- **Learning from history**: Improve discovery based on past sessions
- **Platform templates**: Use known patterns for platform types
- **Interactive debugging**: Step through discovery interactively

## Related Documentation

- [Workflow Management Guide](../WORKFLOW_GUIDE.md) - General workflow usage
- [Architecture Overview](./ARCHITECTURE.md) - System architecture
- [Workflow Specification](./workflow.md) - Spec format reference

---

*AI Spec Discovery Service - Making platform integration effortless*
