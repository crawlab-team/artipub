# AI-Powered Workflow Management System

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ArtiPub Workflow Management                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  1. Workflow     │
│  Specification   │  (Markdown)
│  (.md files)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  2. AI Workflow  │
│  Generator       │  Parses spec → Generates TypeScript code
│                  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  3. Workflow     │
│  Execution       │  Executes steps → Handles retries
│  Engine          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  4. AI Workflow  │
│  Guardian        │  Monitors → Analyzes → Auto-fixes
│                  │
└──────────────────┘
```

## Three-Stage Approach

### Stage 1: Specification (Markdown)
- **Purpose**: Describe automation workflow in human-readable format
- **Location**: `.kiro/specs/automation-workflow/`
- **Format**: Structured markdown with sections for platform info, steps, selectors, error handling
- **Benefits**: Easy to read, modify, and version control

Example:
```markdown
### Platform Information
- **Platform ID**: zhihu
- **Base URL**: https://www.zhihu.com

### Workflow Steps
#### Step 1: Navigate to Editor
- Action: navigate
- URL: https://zhuanlan.zhihu.com/write
```

### Stage 2: AI Code Generation
- **Purpose**: Convert specifications into executable TypeScript code
- **Component**: `AIWorkflowGenerator`
- **Process**: 
  1. Parse markdown specification
  2. Extract platform config, steps, selectors
  3. Generate TypeScript class extending BaseSpider
  4. Include error handling and logging
- **Output**: Production-ready TypeScript automation code

Generated code example:
```typescript
export default class ZhihuSpider extends BaseSpider {
  async inputEditor() {
    await this.inputTitle();
    await this.inputContent();
    await this.inputFooter();
  }
  // ... more methods
}
```

### Stage 3: AI Guardian & Maintenance
- **Purpose**: Monitor and maintain workflows automatically
- **Components**: 
  - `AIWorkflowGuardian`: Analyzes failures and proposes fixes
  - `WorkflowEngine`: Executes workflows with monitoring
- **Process**:
  1. Execute workflow and track results
  2. Detect failures and anomalies
  3. Analyze root causes
  4. Generate and apply fixes automatically
  5. Create new workflow version
  6. Log all maintenance actions

## Key Features

### 1. Specification-Driven Development
- Workflows defined in markdown, not hardcoded
- Easy to understand and modify
- Version controlled
- AI-readable for code generation

### 2. Automatic Code Generation
- No manual coding required
- Consistent patterns across platforms
- Built-in error handling
- Proper logging and monitoring

### 3. Intelligent Error Recovery
- Automatic retry with exponential backoff
- Fallback selectors when primary fails
- Platform UI change detection
- Self-healing workflows

### 4. Version Management
- Track all workflow changes
- Rollback to previous versions
- Changelog for each version
- Active/deprecated status tracking

### 5. Comprehensive Monitoring
- Execution statistics (success rate, duration)
- Failure analysis by step
- Performance metrics
- Maintenance audit log

## Usage Examples

### Create Workflow from Spec
```typescript
import { workflowManagement } from '@/lib/workflow-management';

const workflow = await workflowManagement.createWorkflow(spec);
```

### Execute Workflow
```typescript
const result = await workflowManagement.executeWorkflow('zhihu', {
  article: {
    id: '123',
    title: 'My Article',
    content: 'Content here...'
  },
  platform: 'zhihu'
});
```

### Monitor Statistics
```typescript
const stats = workflowManagement.getStatistics();
console.log(`Success rate: ${stats.executionStats.successRate * 100}%`);
```

### Version Management
```typescript
// Get all versions
const versions = workflowManagement.getAllVersions('zhihu');

// Rollback if needed
workflowManagement.rollbackToVersion('zhihu', '1.0.0');
```

## File Structure

```
artipub/
├── .kiro/specs/automation-workflow/
│   ├── requirements.md      # System requirements
│   ├── workflow.md          # Workflow specifications and templates
│   └── tasks.md            # Implementation tasks
│
├── src/lib/
│   ├── workflow-types.ts           # TypeScript interfaces
│   ├── ai-workflow-generator.ts    # Code generation
│   ├── ai-workflow-guardian.ts     # Monitoring & maintenance
│   ├── workflow-engine.ts          # Execution engine
│   ├── workflow-management.ts      # Central service
│   └── workflow-examples.ts        # Usage examples
│
├── src/__tests__/
│   └── workflow-management.test.ts # Test suite
│
├── WORKFLOW_GUIDE.md       # Developer guide
└── README.md              # Updated with workflow info
```

## Benefits

### Maintainability
- Workflows are documented and versioned
- Easy to update when platforms change
- Clear separation of concerns
- Comprehensive audit trail

### Adaptability
- AI automatically adapts to platform changes
- Self-healing when selectors break
- Continuous improvement through monitoring
- Learning from failure patterns

### Reliability
- Automated error detection and recovery
- Multiple fallback strategies
- Detailed execution logging
- Performance monitoring

### Scalability
- Easy to add new platforms using templates
- Reusable workflow patterns
- Parallel execution support
- Resource-efficient

### Transparency
- All changes logged and auditable
- Clear workflow specifications
- Detailed execution reports
- Version history

## Technical Stack

- **TypeScript**: Type-safe implementation
- **Markdown**: Specification format
- **AI-Powered**: Code generation and maintenance
- **Puppeteer-Compatible**: Works with existing automation
- **Version Control**: Git-based workflow tracking

## Comparison: Before vs After

### Before (Hardcoded Automation)
```typescript
// Hardcoded in jianshu.ts
async inputContent(article, editorSel) {
  const footerContent = `\n\n> 本篇文章由一文多发平台[ArtiPub]...`
  const content = article.content + footerContent
  document.execCommand('insertText', false, content)
}
```

**Issues:**
- Hardcoded logic
- Difficult to modify
- No version control
- Manual fixes when platforms change

### After (Workflow-Based)
```markdown
#### Step 3: Input Content
- Action: fill
- Selector: .editor-content
- Value: {{article.content}}
- Validation: Content appears

#### Step 4: Add Footer
- Action: append
- Content: "本篇文章由一文多发平台..."
```

**Benefits:**
- Specification-driven
- Easy to modify
- Version controlled
- AI auto-fixes issues

## Future Enhancements

1. **AI Learning**: Learn optimal workflows from execution data
2. **Platform Detection**: Auto-detect new platforms and generate workflows
3. **Visual Editor**: GUI for creating workflow specifications
4. **Real-time Monitoring**: Live dashboard for workflow execution
5. **A/B Testing**: Test multiple workflow variations
6. **ML-Based Optimization**: Machine learning for performance tuning

## Documentation

- **Developer Guide**: See [WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md)
- **Examples**: See [src/lib/workflow-examples.ts](./src/lib/workflow-examples.ts)
- **Tests**: See [src/__tests__/workflow-management.test.ts](./src/__tests__/workflow-management.test.ts)
- **Specifications**: See [.kiro/specs/automation-workflow/](./.kiro/specs/automation-workflow/)

## Getting Started

1. Review the workflow specifications in `.kiro/specs/automation-workflow/`
2. Read the [Developer Guide](./WORKFLOW_GUIDE.md)
3. Run the examples: `import { runWorkflowExamples } from '@/lib/workflow-examples'`
4. Create your first workflow using the templates provided

---

*ArtiPub AI - Intelligent Workflow Management for Article Publishing*
