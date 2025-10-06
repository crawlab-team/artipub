/**
 * Workflow Management Service
 * 
 * Central service for managing automation workflows including:
 * - Loading and storing workflow specifications
 * - Generating code from specs
 * - Executing workflows
 * - Monitoring and maintenance
 */

import { WorkflowSpec, WorkflowVersion, WorkflowContext, WorkflowExecutionResult } from './workflow-types';
import { workflowGenerator } from './ai-workflow-generator';
import { workflowGuardian } from './ai-workflow-guardian';
import { workflowEngine } from './workflow-engine';
import { specDiscoveryService } from './ai-spec-discovery';

export class WorkflowManagementService {
  private workflows: Map<string, WorkflowVersion[]> = new Map();
  private activeVersions: Map<string, string> = new Map();

  /**
   * Discover workflow specification automatically using AI
   */
  async discoverWorkflow(
    platformUrl: string,
    options?: {
      supervisionMode?: 'none' | 'optional' | 'required';
      testArticle?: {
        title: string;
        content: string;
      };
    }
  ): Promise<string> {
    console.log(`Starting AI-powered workflow discovery for ${platformUrl}`);
    
    const sessionId = await specDiscoveryService.startDiscovery(platformUrl, options);
    
    return sessionId;
  }

  /**
   * Get discovery session status
   */
  getDiscoverySession(sessionId: string) {
    return specDiscoveryService.getSession(sessionId);
  }

  /**
   * Apply discovered workflow as active workflow
   */
  async applyDiscoveredWorkflow(sessionId: string): Promise<WorkflowVersion | null> {
    const session = specDiscoveryService.getSession(sessionId);
    
    if (!session || session.status !== 'completed' || !session.suggestedWorkflow) {
      console.error('Discovery session not completed or no workflow found');
      return null;
    }
    
    const spec = session.suggestedWorkflow;
    const workflow = await this.createWorkflow(spec);
    
    console.log(`Applied discovered workflow for ${spec.platform.name}`);
    return workflow;
  }

  /**
   * Export discovered workflow as markdown
   */
  exportDiscoveredWorkflow(sessionId: string): string {
    return specDiscoveryService.exportAsMarkdown(sessionId);
  }

  /**
   * Load workflow specification from markdown
   */
  async loadWorkflowFromMarkdown(
    platformId: string,
    markdown: string
  ): Promise<WorkflowVersion> {
    console.log(`Loading workflow for ${platformId} from markdown`);
    
    const spec = workflowGenerator.parseWorkflowMarkdown(markdown);
    const code = await workflowGenerator.generateCodeFromSpec(spec);

    const version: WorkflowVersion = {
      version: spec.version,
      spec,
      generatedCode: code,
      status: 'active',
      createdAt: new Date(),
      changelog: 'Initial version generated from markdown specification'
    };

    // Store workflow version
    if (!this.workflows.has(platformId)) {
      this.workflows.set(platformId, []);
    }
    this.workflows.get(platformId)!.push(version);
    
    // Set as active version
    this.activeVersions.set(platformId, spec.version);

    console.log(`Workflow ${platformId} v${spec.version} loaded successfully`);
    return version;
  }

  /**
   * Create a new workflow specification programmatically
   */
  async createWorkflow(spec: WorkflowSpec): Promise<WorkflowVersion> {
    console.log(`Creating workflow for ${spec.platform.platformId}`);
    
    const code = await workflowGenerator.generateCodeFromSpec(spec);

    const version: WorkflowVersion = {
      version: spec.version,
      spec,
      generatedCode: code,
      status: 'active',
      createdAt: new Date(),
      changelog: 'Workflow created programmatically'
    };

    const platformId = spec.platform.platformId;
    if (!this.workflows.has(platformId)) {
      this.workflows.set(platformId, []);
    }
    this.workflows.get(platformId)!.push(version);
    this.activeVersions.set(platformId, spec.version);

    return version;
  }

  /**
   * Execute workflow for a platform
   */
  async executeWorkflow(
    platformId: string,
    context: WorkflowContext
  ): Promise<WorkflowExecutionResult> {
    console.log(`Executing workflow for ${platformId}`);
    
    const version = this.getActiveVersion(platformId);
    if (!version) {
      throw new Error(`No active workflow found for platform: ${platformId}`);
    }

    const result = await workflowEngine.executeWorkflow(version.spec, context);

    // If execution failed, attempt analysis and auto-fix
    if (!result.success && result.error) {
      console.log('Workflow execution failed, analyzing...');
      
      const analysis = await workflowGuardian.analyzeFailure(version.spec, result);
      console.log('Failure analysis:', analysis);

      // Attempt automatic fix
      const fixResult = await workflowGuardian.attemptAutoFix(version.spec, analysis);
      
      if (fixResult.success && fixResult.updatedSpec) {
        console.log('Auto-fix successful, creating new workflow version...');
        
        // Create new version with fixes
        const newVersion = this.incrementVersion(version.version);
        await this.createWorkflow({
          ...fixResult.updatedSpec,
          version: newVersion,
          metadata: {
            createdAt: fixResult.updatedSpec.metadata?.createdAt || new Date(),
            updatedAt: new Date(),
            author: 'AI Workflow Guardian',
            description: `Auto-fixed version. Changes: ${fixResult.changes.join(', ')}`
          }
        });

        console.log(`New workflow version ${newVersion} created with fixes`);
      }
    }

    return result;
  }

  /**
   * Get active workflow version for a platform
   */
  getActiveVersion(platformId: string): WorkflowVersion | undefined {
    const versions = this.workflows.get(platformId);
    if (!versions || versions.length === 0) {
      return undefined;
    }

    const activeVersion = this.activeVersions.get(platformId);
    if (activeVersion) {
      return versions.find(v => v.version === activeVersion);
    }

    // Return latest version
    return versions[versions.length - 1];
  }

  /**
   * Get all versions for a platform
   */
  getAllVersions(platformId: string): WorkflowVersion[] {
    return this.workflows.get(platformId) || [];
  }

  /**
   * Rollback to a previous version
   */
  rollbackToVersion(platformId: string, version: string): boolean {
    const versions = this.workflows.get(platformId);
    if (!versions) {
      return false;
    }

    const targetVersion = versions.find(v => v.version === version);
    if (!targetVersion) {
      return false;
    }

    // Deprecate current active version
    const currentVersion = this.getActiveVersion(platformId);
    if (currentVersion) {
      currentVersion.status = 'deprecated';
    }

    // Set target version as active
    targetVersion.status = 'active';
    this.activeVersions.set(platformId, version);

    console.log(`Rolled back ${platformId} to version ${version}`);
    return true;
  }

  /**
   * Get workflow statistics
   */
  getStatistics() {
    return {
      totalPlatforms: this.workflows.size,
      totalVersions: Array.from(this.workflows.values()).reduce((sum, v) => sum + v.length, 0),
      activeWorkflows: this.activeVersions.size,
      executionStats: workflowEngine.getStatistics(),
      maintenanceLog: workflowGuardian.getMaintenanceLog()
    };
  }

  /**
   * Export workflow specification as markdown
   */
  exportWorkflowAsMarkdown(platformId: string, version?: string): string {
    const workflowVersion = version 
      ? this.workflows.get(platformId)?.find(v => v.version === version)
      : this.getActiveVersion(platformId);

    if (!workflowVersion) {
      throw new Error(`Workflow not found for ${platformId}`);
    }

    const spec = workflowVersion.spec;
    
    return `# ${spec.platform.name} Workflow Specification

## Version: ${spec.version}
## Status: ${workflowVersion.status}
## Last Updated: ${workflowVersion.spec.metadata?.updatedAt || workflowVersion.createdAt}

### Platform Information
- **Platform ID**: ${spec.platform.platformId}
- **Base URL**: ${spec.platform.baseUrl}
- **Editor URL**: ${spec.platform.editorUrl}
- **Authentication**: ${spec.platform.authType}
- **Content Format**: ${spec.platform.contentFormat}

### Workflow Steps

${spec.steps.map(step => `
#### Step ${step.stepNumber}: ${step.name}
- **Action**: ${step.action}
${step.selector ? `- **Selector**: \`${step.selector}\`` : ''}
${step.url ? `- **URL**: ${step.url}` : ''}
${step.value ? `- **Value**: ${step.value}` : ''}
${step.timeout ? `- **Timeout**: ${step.timeout}ms` : ''}
${step.validation ? `- **Validation**: ${step.validation}` : ''}
`).join('\n')}

### Selectors

\`\`\`json
${JSON.stringify(spec.selectors, null, 2)}
\`\`\`

### Error Handling

${spec.errorHandling.map(eh => `
- **${eh.errorType}**
  - Detection: ${eh.detection}
  - Recovery: ${eh.recoveryStrategy}
  ${eh.maxRetries ? `- Max Retries: ${eh.maxRetries}` : ''}
  ${eh.retryDelay ? `- Retry Delay: ${eh.retryDelay}ms` : ''}
`).join('\n')}

### Validation Rules

${spec.validationRules.map(rule => `
- **${rule.name}**${rule.required ? ' (Required)' : ''}
  - ${rule.description}
  - Check: \`${rule.check}\`
`).join('\n')}

---
*Generated by ArtiPub Workflow Management System*
`;
  }

  /**
   * Increment version number
   */
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0', 10) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }
}

export const workflowManagement = new WorkflowManagementService();
