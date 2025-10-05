# Developer Guide: Workflow Management System

This guide explains how to use ArtiPub's AI-powered workflow management system to create and maintain automation workflows for article publishing.

## Overview

The workflow management system consists of four main components:

1. **Workflow Specifications** - Markdown documents describing automation workflows
2. **AI Workflow Generator** - Converts specifications into executable TypeScript code
3. **Workflow Execution Engine** - Executes workflows with retry and error handling
4. **AI Workflow Guardian** - Monitors executions and automatically maintains workflows

## Getting Started

### 1. Understanding Workflow Specifications

Workflow specifications are markdown documents that describe how to automate article publishing for a platform. They include:

- Platform information (URLs, authentication method, content format)
- Sequential steps to publish an article
- DOM selectors for UI elements
- Error handling strategies
- Validation rules

Example specification structure:

```markdown
### Platform Information
- **Platform ID**: myplatform
- **Base URL**: https://platform.com
- **Editor URL**: https://platform.com/editor
- **Authentication**: cookie
- **Content Format**: markdown

### Workflow Steps

#### Step 1: Navigate to Editor
- Action: navigate
- URL: https://platform.com/editor
- Validation: Editor container is visible

#### Step 2: Input Title
- Action: fill
- Selector: input[name="title"]
- Value: {{article.title}}
- Validation: Title appears in input

#### Step 3: Input Content
- Action: fill
- Selector: .editor-content
- Value: {{article.content}}
- Validation: Content appears in editor

#### Step 4: Publish
- Action: click
- Selector: button.publish
- Timeout: 5000
- Validation: Success message appears

### Selectors
{
  "editor": {
    "title": "input[name='title']",
    "content": ".editor-content",
    "publishButton": "button.publish"
  }
}

### Error Handling
- **Selector not found**
  - Detection: Element not found error
  - Recovery: Try fallback selectors
  - Max Retries: 3

### Validation Rules
- **Title required**
  - Article must have a title
  - Check: article.title.length > 0
```

### 2. Creating a Workflow Programmatically

```typescript
import { workflowManagement } from '@/lib/workflow-management';
import { WorkflowSpec } from '@/lib/workflow-types';

const spec: WorkflowSpec = {
  version: '1.0.0',
  platform: {
    platformId: 'myplatform',
    name: 'My Platform',
    baseUrl: 'https://platform.com',
    editorUrl: 'https://platform.com/editor',
    authType: 'cookie',
    contentFormat: 'markdown'
  },
  steps: [
    {
      stepNumber: 1,
      name: 'Navigate to Editor',
      action: 'navigate',
      url: 'https://platform.com/editor',
      validation: 'Editor loaded'
    },
    // ... more steps
  ],
  selectors: {
    editor: {
      title: 'input[name="title"]',
      content: '.editor-content',
      publishButton: 'button.publish'
    }
  },
  errorHandling: [
    {
      errorType: 'Selector not found',
      detection: 'Element not found',
      recoveryStrategy: 'Try alternative selectors',
      maxRetries: 3,
      retryDelay: 2000
    }
  ],
  validationRules: [
    {
      name: 'Title required',
      description: 'Article must have a title',
      check: 'article.title.length > 0',
      required: true
    }
  ]
};

const workflow = await workflowManagement.createWorkflow(spec);
console.log(`Created workflow v${workflow.version}`);
```

### 3. Loading Workflow from Markdown

```typescript
import { workflowManagement } from '@/lib/workflow-management';
import fs from 'fs';

const markdown = fs.readFileSync('.kiro/specs/automation-workflow/workflow.md', 'utf-8');
const workflow = await workflowManagement.loadWorkflowFromMarkdown('myplatform', markdown);

console.log(`Loaded workflow: ${workflow.spec.platform.name}`);
console.log(`Generated code: ${workflow.generatedCode?.code.slice(0, 200)}...`);
```

### 4. Executing a Workflow

```typescript
import { workflowManagement } from '@/lib/workflow-management';

const result = await workflowManagement.executeWorkflow('myplatform', {
  article: {
    id: '123',
    title: 'My Article Title',
    content: 'Article content here...',
    tags: ['technology', 'ai'],
    category: 'Development'
  },
  platform: 'myplatform'
});

if (result.success) {
  console.log(`Published: ${result.publishedUrl}`);
} else {
  console.error(`Failed: ${result.error}`);
  
  // View failed steps
  result.steps
    .filter(s => s.status === 'failed')
    .forEach(s => console.log(`Step ${s.stepNumber} failed: ${s.error}`));
}
```

### 5. Handling Failures with AI Guardian

The AI Workflow Guardian automatically analyzes failures and attempts to fix them:

```typescript
import { workflowManagement } from '@/lib/workflow-management';

const result = await workflowManagement.executeWorkflow('myplatform', context);

if (!result.success) {
  // Guardian automatically:
  // 1. Analyzes the failure
  // 2. Identifies possible causes
  // 3. Attempts to fix the workflow
  // 4. Creates a new version with fixes
  
  console.log('Workflow failed, AI Guardian is analyzing...');
  // Check maintenance log to see what actions were taken
  const stats = workflowManagement.getStatistics();
  stats.maintenanceLog.forEach(entry => {
    console.log(`[${entry.changeType}] ${entry.description}`);
  });
}
```

## Advanced Usage

### Version Management

```typescript
// Get all versions for a platform
const versions = workflowManagement.getAllVersions('myplatform');
versions.forEach(v => {
  console.log(`v${v.version} - ${v.status}`);
});

// Get active version
const active = workflowManagement.getActiveVersion('myplatform');

// Rollback to previous version
const success = workflowManagement.rollbackToVersion('myplatform', '1.0.0');
```

### Monitoring and Statistics

```typescript
const stats = workflowManagement.getStatistics();

console.log('Execution Statistics:');
console.log(`  Total executions: ${stats.executionStats.totalExecutions}`);
console.log(`  Success rate: ${(stats.executionStats.successRate * 100).toFixed(2)}%`);
console.log(`  Average duration: ${stats.executionStats.averageDuration}ms`);

// Identify problematic steps
Object.entries(stats.executionStats.failuresByStep).forEach(([step, count]) => {
  console.log(`  Step ${step}: ${count} failures`);
});
```

### Exporting Workflows

```typescript
// Export workflow as markdown for documentation
const markdown = workflowManagement.exportWorkflowAsMarkdown('myplatform');

// Save to file
fs.writeFileSync('workflow-backup.md', markdown);
```

## Workflow Actions Reference

### Supported Actions

- **navigate**: Navigate to a URL
  ```typescript
  {
    action: 'navigate',
    url: 'https://platform.com/page',
    timeout: 5000
  }
  ```

- **fill**: Fill an input field
  ```typescript
  {
    action: 'fill',
    selector: 'input[name="field"]',
    value: '{{article.title}}'
  }
  ```

- **click**: Click an element
  ```typescript
  {
    action: 'click',
    selector: 'button.submit',
    timeout: 3000
  }
  ```

- **wait**: Wait for a duration
  ```typescript
  {
    action: 'wait',
    timeout: 2000
  }
  ```

- **extract**: Extract data from page
  ```typescript
  {
    action: 'extract',
    selector: '.article-url',
    value: 'href'
  }
  ```

### Template Variables

Use template variables in action values:

- `{{article.title}}` - Article title
- `{{article.content}}` - Article content
- `{{article.id}}` - Article ID

## Best Practices

### 1. Use Descriptive Step Names

```typescript
// Good
{ name: 'Navigate to Article Editor' }

// Bad
{ name: 'Step 1' }
```

### 2. Always Include Validation

```typescript
{
  stepNumber: 2,
  name: 'Input Title',
  action: 'fill',
  selector: 'input[name="title"]',
  value: '{{article.title}}',
  validation: 'Title appears in input field' // Always specify expected result
}
```

### 3. Provide Fallback Selectors

```typescript
{
  selector: '.editor-content',
  fallback: [
    { selector: '#editor-content' },
    { selector: '[contenteditable="true"]' }
  ]
}
```

### 4. Configure Appropriate Timeouts

```typescript
// Quick actions
{ action: 'click', timeout: 1000 }

// Page navigation
{ action: 'navigate', timeout: 10000 }

// Publishing
{ action: 'click', selector: '.publish', timeout: 5000 }
```

### 5. Document Error Recovery Strategies

```typescript
errorHandling: [
  {
    errorType: 'Authentication required',
    detection: 'Login form appears',
    recoveryStrategy: 'Throw error - user must re-authenticate',
    maxRetries: 0 // Don't retry auth errors
  }
]
```

## Troubleshooting

### Workflow Execution Fails

1. Check execution logs:
   ```typescript
   const result = await workflowManagement.executeWorkflow(...);
   result.steps.forEach(s => {
     console.log(`${s.name}: ${s.status} - ${s.error || 'OK'}`);
   });
   ```

2. Review maintenance log:
   ```typescript
   const stats = workflowManagement.getStatistics();
   stats.maintenanceLog.forEach(entry => {
     console.log(entry.description);
   });
   ```

3. Test selectors manually in browser console

### Workflow Generated Code Issues

1. Check the generated code:
   ```typescript
   const workflow = await workflowManagement.getActiveVersion('platform');
   console.log(workflow.generatedCode?.code);
   ```

2. Review workflow specification for errors

3. Update workflow and regenerate code

### Performance Issues

1. Check statistics:
   ```typescript
   const stats = workflowManagement.getStatistics();
   console.log(`Average duration: ${stats.executionStats.averageDuration}ms`);
   ```

2. Identify slow steps and optimize selectors

3. Reduce unnecessary wait times

## Example: Complete Workflow Implementation

See `src/lib/workflow-examples.ts` for complete working examples demonstrating all features of the workflow management system.

To run the examples:

```typescript
import { runWorkflowExamples } from '@/lib/workflow-examples';

await runWorkflowExamples();
```

## Support

For issues or questions:

1. Check the [workflow specification examples](.kiro/specs/automation-workflow/workflow.md)
2. Review the [test suite](src/__tests__/workflow-management.test.ts)
3. Open an issue on GitHub

## Contributing

To add support for a new platform:

1. Create workflow specification in `.kiro/specs/automation-workflow/`
2. Test the workflow with the execution engine
3. Document any platform-specific quirks
4. Submit a pull request

---

*This guide is part of the ArtiPub AI Workflow Management System*
