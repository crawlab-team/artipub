/**
 * Workflow Management System Example
 * 
 * This example demonstrates how to use the workflow management system
 * to create, execute, and maintain automation workflows.
 */

import { workflowManagement } from './workflow-management';
import { WorkflowSpec } from './workflow-types';

/**
 * Example 1: Create a workflow from a specification object
 */
async function example1_CreateWorkflowFromSpec() {
  console.log('=== Example 1: Create Workflow from Specification ===\n');

  const spec: WorkflowSpec = {
    version: '1.0.0',
    platform: {
      platformId: 'juejin',
      name: 'Juejin',
      baseUrl: 'https://juejin.cn',
      editorUrl: 'https://juejin.cn/editor/drafts/new',
      authType: 'cookie',
      contentFormat: 'markdown'
    },
    steps: [
      {
        stepNumber: 1,
        name: 'Navigate to Editor',
        action: 'navigate',
        url: 'https://juejin.cn/editor/drafts/new',
        timeout: 5000,
        validation: 'Editor loaded'
      },
      {
        stepNumber: 2,
        name: 'Input Title',
        action: 'fill',
        selector: 'input[placeholder*="输入文章标题"]',
        value: '{{article.title}}',
        validation: 'Title appears'
      },
      {
        stepNumber: 3,
        name: 'Input Content',
        action: 'fill',
        selector: '.CodeMirror textarea',
        value: '{{article.content}}',
        validation: 'Content appears'
      },
      {
        stepNumber: 4,
        name: 'Publish Article',
        action: 'click',
        selector: 'button:has-text("发布")',
        timeout: 3000,
        validation: 'Article published'
      }
    ],
    selectors: {
      editor: {
        title: 'input[placeholder*="输入文章标题"]',
        content: '.CodeMirror textarea',
        publishButton: 'button:has-text("发布")'
      }
    },
    errorHandling: [
      {
        errorType: 'Selector not found',
        detection: 'Element not found error',
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
      },
      {
        name: 'Content required',
        description: 'Article must have content',
        check: 'article.content.length > 0',
        required: true
      }
    ]
  };

  const workflow = await workflowManagement.createWorkflow(spec);
  console.log(`Workflow created: ${workflow.spec.platform.name} v${workflow.version}`);
  console.log(`Status: ${workflow.status}`);
  console.log(`Generated code: ${workflow.generatedCode?.code.length} characters\n`);
}

/**
 * Example 2: Execute a workflow
 */
async function example2_ExecuteWorkflow() {
  console.log('=== Example 2: Execute Workflow ===\n');

  // First, ensure we have a workflow
  await example1_CreateWorkflowFromSpec();

  // Execute the workflow
  const result = await workflowManagement.executeWorkflow('juejin', {
    article: {
      id: 'demo-123',
      title: 'Getting Started with ArtiPub AI Workflows',
      content: `
# Introduction

ArtiPub AI now supports automated workflow management powered by AI.

## Key Features

- Specification-driven workflows
- AI-powered code generation
- Automatic error detection and recovery
- Workflow version management

## Usage

\`\`\`typescript
import { workflowManagement } from '@/lib/workflow-management';

const result = await workflowManagement.executeWorkflow('platform', context);
\`\`\`

> This article was published using ArtiPub AI's workflow management system.
      `.trim()
    },
    platform: 'juejin'
  });

  console.log(`Execution completed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Total duration: ${result.totalDuration}ms`);
  console.log(`Steps executed: ${result.steps.length}`);
  
  if (result.publishedUrl) {
    console.log(`Published URL: ${result.publishedUrl}`);
  }
  
  if (result.error) {
    console.log(`Error: ${result.error}`);
  }

  console.log('\nStep details:');
  result.steps.forEach(step => {
    console.log(`  ${step.stepNumber}. ${step.name}: ${step.status} (${step.duration}ms)`);
    if (step.error) {
      console.log(`     Error: ${step.error}`);
    }
  });
  
  console.log('');
}

/**
 * Example 3: Monitor and get statistics
 */
async function example3_GetStatistics() {
  console.log('=== Example 3: Workflow Statistics ===\n');

  const stats = workflowManagement.getStatistics();
  
  console.log('Overall Statistics:');
  console.log(`  Total platforms: ${stats.totalPlatforms}`);
  console.log(`  Total workflow versions: ${stats.totalVersions}`);
  console.log(`  Active workflows: ${stats.activeWorkflows}`);
  
  console.log('\nExecution Statistics:');
  console.log(`  Total executions: ${stats.executionStats.totalExecutions}`);
  console.log(`  Success rate: ${(stats.executionStats.successRate * 100).toFixed(2)}%`);
  console.log(`  Average duration: ${stats.executionStats.averageDuration.toFixed(0)}ms`);
  
  if (Object.keys(stats.executionStats.failuresByStep).length > 0) {
    console.log('\nFailures by step:');
    Object.entries(stats.executionStats.failuresByStep).forEach(([step, count]) => {
      console.log(`  Step ${step}: ${count} failure(s)`);
    });
  }
  
  console.log('\nMaintenance Log:');
  if (stats.maintenanceLog.length === 0) {
    console.log('  No maintenance actions recorded yet');
  } else {
    stats.maintenanceLog.slice(-5).forEach(entry => {
      console.log(`  [${entry.timestamp.toISOString()}] ${entry.changeType}: ${entry.description}`);
    });
  }
  
  console.log('');
}

/**
 * Example 4: Export workflow as markdown
 */
async function example4_ExportWorkflow() {
  console.log('=== Example 4: Export Workflow as Markdown ===\n');

  // Ensure we have a workflow
  await example1_CreateWorkflowFromSpec();

  const markdown = workflowManagement.exportWorkflowAsMarkdown('juejin');
  
  console.log('Exported workflow specification:');
  console.log('---');
  console.log(markdown);
  console.log('---\n');
}

/**
 * Example 5: Version management
 */
async function example5_ManageVersions() {
  console.log('=== Example 5: Workflow Version Management ===\n');

  // Ensure we have a workflow
  await example1_CreateWorkflowFromSpec();

  const versions = workflowManagement.getAllVersions('juejin');
  console.log(`Total versions for Juejin: ${versions.length}`);
  
  versions.forEach(v => {
    console.log(`  v${v.version} - ${v.status} (created: ${v.createdAt.toISOString()})`);
    if (v.changelog) {
      console.log(`    ${v.changelog}`);
    }
  });

  const activeVersion = workflowManagement.getActiveVersion('juejin');
  if (activeVersion) {
    console.log(`\nActive version: ${activeVersion.version}`);
  }
  
  console.log('');
}

/**
 * Main function to run all examples
 */
export async function runWorkflowExamples() {
  console.log('\n🤖 ArtiPub AI - Workflow Management System Examples\n');
  console.log('This demonstration shows the complete workflow lifecycle:\n');

  try {
    await example1_CreateWorkflowFromSpec();
    await example2_ExecuteWorkflow();
    await example3_GetStatistics();
    await example4_ExportWorkflow();
    await example5_ManageVersions();
    
    console.log('✅ All examples completed successfully!\n');
    console.log('Key Takeaways:');
    console.log('  1. Workflows are defined using structured specifications');
    console.log('  2. AI generates executable code from specifications');
    console.log('  3. The system automatically monitors and maintains workflows');
    console.log('  4. All changes are versioned and can be rolled back');
    console.log('  5. Detailed statistics help optimize workflow performance\n');
    
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export individual examples for testing
export {
  example1_CreateWorkflowFromSpec,
  example2_ExecuteWorkflow,
  example3_GetStatistics,
  example4_ExportWorkflow,
  example5_ManageVersions
};
