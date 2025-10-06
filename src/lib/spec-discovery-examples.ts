/**
 * AI Spec Discovery Examples
 * 
 * This file demonstrates how to use the AI-powered spec discovery service
 * to automatically discover and generate workflow specifications for platforms.
 */

import { specDiscoveryService } from './ai-spec-discovery';
import { workflowManagement } from './workflow-management';

/**
 * Example 1: Discover workflow with no human supervision
 */
export async function example1_AutomaticDiscovery() {
  console.log('=== Example 1: Automatic Workflow Discovery ===\n');

  // Start automatic discovery
  const sessionId = await workflowManagement.discoverWorkflow(
    'https://medium.com/new-story',
    {
      supervisionMode: 'none', // Fully automatic
      testArticle: {
        title: 'Test Article for Discovery',
        content: 'This is test content to validate the workflow'
      }
    }
  );

  console.log(`Discovery session started: ${sessionId}`);
  console.log('AI is analyzing the platform...\n');

  // Poll for completion (in production, use callbacks or events)
  await new Promise(resolve => setTimeout(resolve, 5000));

  const session = workflowManagement.getDiscoverySession(sessionId);
  if (session) {
    console.log(`Status: ${session.status}`);
    console.log(`Progress: ${session.progress}%`);
    console.log(`Current Step: ${session.currentStep}`);
    
    if (session.discoveredElements) {
      console.log(`\nDiscovered ${session.discoveredElements.length} elements:`);
      session.discoveredElements.forEach(e => {
        console.log(`  - ${e.purpose}: ${e.selector} (${(e.confidence * 100).toFixed(1)}% confidence)`);
      });
    }
    
    if (session.status === 'completed' && session.suggestedWorkflow) {
      console.log(`\nWorkflow discovered with ${session.suggestedWorkflow.steps.length} steps`);
      
      // Apply the discovered workflow
      const workflow = await workflowManagement.applyDiscoveredWorkflow(sessionId);
      if (workflow) {
        console.log(`Workflow activated: v${workflow.version}`);
      }
    }
  }
  
  console.log('');
}

/**
 * Example 2: Discovery with optional human supervision
 */
export async function example2_SupervisedDiscovery() {
  console.log('=== Example 2: Supervised Workflow Discovery ===\n');

  const sessionId = await workflowManagement.discoverWorkflow(
    'https://dev.to/new',
    {
      supervisionMode: 'optional', // AI discovers, human reviews
      testArticle: {
        title: 'AI-Discovered Workflow Test',
        content: 'Testing the discovery process...'
      }
    }
  );

  console.log(`Discovery session started: ${sessionId}`);
  
  // Wait for AI to complete discovery
  await new Promise(resolve => setTimeout(resolve, 6000));

  const session = workflowManagement.getDiscoverySession(sessionId);
  
  if (session?.humanReviewRequired) {
    console.log('\n🔍 Human review requested');
    console.log('Please review the discovered workflow:');
    
    if (session.suggestedWorkflow) {
      console.log(`\nPlatform: ${session.suggestedWorkflow.platform.name}`);
      console.log(`Steps: ${session.suggestedWorkflow.steps.length}`);
      session.suggestedWorkflow.steps.forEach(step => {
        console.log(`  ${step.stepNumber}. ${step.name} (${step.action})`);
      });
    }
    
    // In a real application, present UI for review
    // For this example, auto-approve after review
    console.log('\n✅ Workflow approved by supervisor');
    
    await specDiscoveryService.respondToSupervision(sessionId, true);
    
    // Apply the workflow
    const workflow = await workflowManagement.applyDiscoveredWorkflow(sessionId);
    if (workflow) {
      console.log(`\nWorkflow applied: ${workflow.spec.platform.name} v${workflow.version}`);
    }
  }
  
  console.log('');
}

/**
 * Example 3: Discovery with mandatory human supervision
 */
export async function example3_RequiredSupervision() {
  console.log('=== Example 3: Discovery with Required Supervision ===\n');

  const sessionId = await workflowManagement.discoverWorkflow(
    'https://hashnode.com/create',
    {
      supervisionMode: 'required', // Human must approve each step
    }
  );

  console.log(`Discovery session started: ${sessionId}`);
  console.log('Human supervision is required for this discovery.\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  const session = workflowManagement.getDiscoverySession(sessionId);
  
  if (session) {
    console.log('AI Discovery Progress:');
    console.log(`  Status: ${session.status}`);
    console.log(`  Progress: ${session.progress}%`);
    console.log(`  Discovered Elements: ${session.discoveredElements?.length || 0}`);
    
    // Check for pending supervision requests
    const requests = specDiscoveryService.getSupervisionRequests();
    if (requests.length > 0) {
      console.log(`\n📋 ${requests.length} supervision request(s) pending`);
      requests.forEach(req => {
        console.log(`  Question: ${req.question}`);
        console.log(`  Context: ${req.context.currentStep}`);
      });
    }
  }
  
  console.log('');
}

/**
 * Example 4: Export discovered workflow
 */
export async function example4_ExportDiscoveredWorkflow() {
  console.log('=== Example 4: Export Discovered Workflow ===\n');

  // Discover workflow
  const sessionId = await workflowManagement.discoverWorkflow(
    'https://blog.example.com/editor',
    { supervisionMode: 'none' }
  );

  await new Promise(resolve => setTimeout(resolve, 5000));

  const session = workflowManagement.getDiscoverySession(sessionId);
  
  if (session?.status === 'completed') {
    console.log('Workflow discovery completed successfully!');
    console.log('Exporting as markdown...\n');
    
    const markdown = workflowManagement.exportDiscoveredWorkflow(sessionId);
    
    console.log('Exported Workflow Specification:');
    console.log('---');
    console.log(markdown.substring(0, 500) + '...');
    console.log('---');
    console.log(`\nFull specification: ${markdown.length} characters`);
    
    // In production, save to file
    // fs.writeFileSync(`docs/automation-workflow/${platform}.md`, markdown);
  }
  
  console.log('');
}

/**
 * Example 5: Monitor active discovery sessions
 */
export async function example5_MonitorDiscoverySessions() {
  console.log('=== Example 5: Monitor Discovery Sessions ===\n');

  // Start multiple discoveries
  const sessions = [
    await workflowManagement.discoverWorkflow('https://platform1.com/editor'),
    await workflowManagement.discoverWorkflow('https://platform2.com/write'),
    await workflowManagement.discoverWorkflow('https://platform3.com/new-post'),
  ];

  console.log(`Started ${sessions.length} discovery sessions\n`);

  // Wait a bit for processing
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Check status of all sessions
  const activeSessions = specDiscoveryService.getActiveSessions();
  
  console.log(`Active Discovery Sessions: ${activeSessions.length}\n`);
  
  activeSessions.forEach((session, index) => {
    console.log(`Session ${index + 1}:`);
    console.log(`  ID: ${session.sessionId}`);
    console.log(`  Platform: ${session.platformUrl}`);
    console.log(`  Status: ${session.status}`);
    console.log(`  Progress: ${session.progress}%`);
    console.log(`  Step: ${session.currentStep || 'N/A'}`);
    
    if (session.errors && session.errors.length > 0) {
      console.log(`  Errors: ${session.errors.join(', ')}`);
    }
    
    console.log('');
  });
}

/**
 * Example 6: Complete workflow discovery lifecycle
 */
export async function example6_CompleteDiscoveryLifecycle() {
  console.log('=== Example 6: Complete Discovery Lifecycle ===\n');

  // Step 1: Start discovery
  console.log('Step 1: Starting AI-powered discovery...');
  const sessionId = await workflowManagement.discoverWorkflow(
    'https://example-blog.com/create',
    {
      supervisionMode: 'optional',
      testArticle: {
        title: 'Automated Workflow Discovery in Action',
        content: `
# Introduction

This article demonstrates the AI-powered workflow discovery system.

## Features

- Automatic element detection
- Intelligent selector generation
- Workflow step identification
- Human supervision support

## Conclusion

The system can automatically discover publishing workflows!
        `.trim()
      }
    }
  );

  console.log(`✓ Session created: ${sessionId}\n`);

  // Step 2: Monitor progress
  console.log('Step 2: Monitoring discovery progress...');
  
  // Simulate monitoring with multiple checks
  for (let i = 0; i < 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const session = workflowManagement.getDiscoverySession(sessionId);
    if (session) {
      console.log(`  Progress: ${session.progress}% - ${session.currentStep}`);
      
      if (session.status === 'completed' || session.status === 'failed') {
        break;
      }
    }
  }

  // Step 3: Review results
  console.log('\nStep 3: Reviewing discovery results...');
  const session = workflowManagement.getDiscoverySession(sessionId);
  
  if (session?.status === 'completed') {
    console.log(`✓ Discovery completed successfully`);
    console.log(`  Elements discovered: ${session.discoveredElements?.length}`);
    console.log(`  Workflow steps: ${session.suggestedWorkflow?.steps.length}`);
    
    // Step 4: Export specification
    console.log('\nStep 4: Exporting specification...');
    const markdown = workflowManagement.exportDiscoveredWorkflow(sessionId);
    console.log(`✓ Specification exported (${markdown.length} characters)`);
    
    // Step 5: Apply workflow
    console.log('\nStep 5: Applying discovered workflow...');
    const workflow = await workflowManagement.applyDiscoveredWorkflow(sessionId);
    
    if (workflow) {
      console.log(`✓ Workflow applied: ${workflow.spec.platform.name} v${workflow.version}`);
      console.log(`  Status: ${workflow.status}`);
      console.log(`  Code generated: ${workflow.generatedCode?.code.length} characters`);
    }
    
    // Step 6: Execute workflow
    console.log('\nStep 6: Testing discovered workflow...');
    const result = await workflowManagement.executeWorkflow(
      workflow!.spec.platform.platformId,
      {
        article: {
          id: 'test-123',
          title: 'First Article Using Discovered Workflow',
          content: 'This article is published using an AI-discovered workflow!'
        },
        platform: workflow!.spec.platform.platformId
      }
    );
    
    console.log(`✓ Workflow execution ${result.success ? 'succeeded' : 'failed'}`);
    console.log(`  Duration: ${result.totalDuration}ms`);
    console.log(`  Steps completed: ${result.steps.filter(s => s.status === 'success').length}/${result.steps.length}`);
    
    if (result.publishedUrl) {
      console.log(`  Published URL: ${result.publishedUrl}`);
    }
  } else if (session?.status === 'failed') {
    console.log('✗ Discovery failed');
    console.log(`  Errors: ${session.errors?.join(', ')}`);
  }
  
  console.log('\n✅ Complete lifecycle demonstration finished!');
}

/**
 * Main function to run all examples
 */
export async function runSpecDiscoveryExamples() {
  console.log('\n🤖 AI Spec Discovery Service - Examples\n');
  console.log('Demonstrating automatic workflow discovery with AI:\n');

  try {
    await example1_AutomaticDiscovery();
    await example2_SupervisedDiscovery();
    await example3_RequiredSupervision();
    await example4_ExportDiscoveredWorkflow();
    await example5_MonitorDiscoverySessions();
    await example6_CompleteDiscoveryLifecycle();
    
    console.log('\n✅ All examples completed successfully!\n');
    console.log('Key Capabilities Demonstrated:');
    console.log('  1. Automatic platform analysis and element discovery');
    console.log('  2. Intelligent workflow step identification');
    console.log('  3. Confidence scoring for discovered elements');
    console.log('  4. Human supervision support (none/optional/required)');
    console.log('  5. Workflow validation with test articles');
    console.log('  6. Export to markdown specifications');
    console.log('  7. Seamless integration with workflow management');
    console.log('  8. Complete discovery-to-execution lifecycle\n');
    
  } catch (error) {
    console.error('Error running examples:', error);
  }
}
