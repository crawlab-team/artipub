/**
 * AI Workflow Guardian Service
 * 
 * This service monitors workflow execution, detects failures, and automatically
 * maintains and fixes automation workflows when issues are detected.
 */

import { 
  WorkflowSpec, 
  WorkflowExecutionResult, 
  WorkflowFailureAnalysis,
  MaintenanceLogEntry
} from './workflow-types';

export class AIWorkflowGuardian {
  private maintenanceLog: MaintenanceLogEntry[] = [];

  /**
   * Analyze workflow execution failure
   */
  async analyzeFailure(
    spec: WorkflowSpec,
    result: WorkflowExecutionResult
  ): Promise<WorkflowFailureAnalysis> {
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 500));

    const failedStep = result.steps.find(s => s.status === 'failed');
    if (!failedStep) {
      throw new Error('No failed step found');
    }

    const analysis: WorkflowFailureAnalysis = {
      failedStep: spec.steps[failedStep.stepNumber - 1],
      errorType: this.categorizeError(failedStep.error || ''),
      errorMessage: failedStep.error || 'Unknown error',
      possibleCauses: [],
      suggestedFixes: [],
      confidence: 0.8
    };

    // Analyze based on error type
    switch (analysis.errorType) {
      case 'selector-not-found':
        analysis.possibleCauses = [
          'Platform UI has changed',
          'Page not fully loaded',
          'Incorrect selector syntax'
        ];
        analysis.suggestedFixes = [
          'Update selector to match new UI',
          'Increase wait time before action',
          'Add fallback selectors'
        ];
        break;

      case 'timeout':
        analysis.possibleCauses = [
          'Network latency',
          'Server response delay',
          'Browser performance issues'
        ];
        analysis.suggestedFixes = [
          'Increase timeout duration',
          'Add retry logic',
          'Check network connection'
        ];
        break;

      case 'authentication':
        analysis.possibleCauses = [
          'Session expired',
          'Invalid credentials',
          'Platform requires re-authentication'
        ];
        analysis.suggestedFixes = [
          'Refresh authentication cookies',
          'Re-login to platform',
          'Verify credentials are valid'
        ];
        break;

      default:
        analysis.possibleCauses = ['Unknown error occurred'];
        analysis.suggestedFixes = ['Manual investigation required'];
    }

    return analysis;
  }

  /**
   * Attempt to fix workflow automatically
   */
  async attemptAutoFix(
    spec: WorkflowSpec,
    analysis: WorkflowFailureAnalysis
  ): Promise<{ success: boolean; updatedSpec?: WorkflowSpec; changes: string[] }> {
    // Simulate AI fix attempt
    await new Promise(resolve => setTimeout(resolve, 800));

    const changes: string[] = [];

    if (analysis.errorType === 'selector-not-found') {
      // Attempt to find alternative selectors
      const updatedSpec = { ...spec };
      const failedStep = analysis.failedStep;
      
      if (failedStep.selector) {
        // Generate alternative selectors
        const alternativeSelectors = this.generateAlternativeSelectors(failedStep.selector);
        
        if (alternativeSelectors.length > 0) {
          const stepIndex = updatedSpec.steps.findIndex(s => s.stepNumber === failedStep.stepNumber);
          if (stepIndex !== -1) {
            updatedSpec.steps[stepIndex] = {
              ...failedStep,
              selector: alternativeSelectors[0],
              fallback: alternativeSelectors.slice(1).map(selector => ({
                ...failedStep,
                selector
              }))
            };
            
            changes.push(`Updated selector for step ${failedStep.stepNumber}: ${alternativeSelectors[0]}`);
            changes.push(`Added ${alternativeSelectors.length - 1} fallback selectors`);
          }
        }
      }

      // Log maintenance action
      this.logMaintenance({
        timestamp: new Date(),
        workflowVersion: spec.version,
        changeType: 'selector-update',
        description: `Updated selectors for ${spec.platform.name} workflow`,
        changedBy: 'ai',
        changes: {
          before: analysis.failedStep,
          after: updatedSpec.steps.find(s => s.stepNumber === analysis.failedStep.stepNumber)
        },
        reason: `Selector not found: ${analysis.errorMessage}`
      });

      return {
        success: true,
        updatedSpec,
        changes
      };
    }

    if (analysis.errorType === 'timeout') {
      // Increase timeout durations
      const updatedSpec = { ...spec };
      const stepIndex = updatedSpec.steps.findIndex(s => s.stepNumber === analysis.failedStep.stepNumber);
      
      if (stepIndex !== -1) {
        const currentTimeout = updatedSpec.steps[stepIndex].timeout || 5000;
        updatedSpec.steps[stepIndex].timeout = currentTimeout * 2;
        
        changes.push(`Increased timeout for step ${analysis.failedStep.stepNumber} to ${currentTimeout * 2}ms`);
      }

      // Log maintenance action
      this.logMaintenance({
        timestamp: new Date(),
        workflowVersion: spec.version,
        changeType: 'optimization',
        description: `Increased timeout for ${spec.platform.name} workflow`,
        changedBy: 'ai',
        changes: {
          before: { timeout: updatedSpec.steps[stepIndex].timeout! / 2 },
          after: { timeout: updatedSpec.steps[stepIndex].timeout }
        },
        reason: `Timeout error: ${analysis.errorMessage}`
      });

      return {
        success: true,
        updatedSpec,
        changes
      };
    }

    return {
      success: false,
      changes: ['No automatic fix available']
    };
  }

  /**
   * Monitor workflow execution and detect anomalies
   */
  async monitorExecution(result: WorkflowExecutionResult): Promise<{
    isAnomalous: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    // Simulate monitoring
    await new Promise(resolve => setTimeout(resolve, 300));

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check execution duration
    if (result.totalDuration > 60000) {
      issues.push('Execution took longer than expected (>60s)');
      recommendations.push('Consider optimizing slow steps or increasing parallel execution');
    }

    // Check for repeated failures
    const failedSteps = result.steps.filter(s => s.status === 'failed');
    if (failedSteps.length > 0) {
      issues.push(`${failedSteps.length} step(s) failed during execution`);
      recommendations.push('Review failed steps and update workflow specification');
    }

    // Check for slow steps
    const slowSteps = result.steps.filter(s => s.duration > 10000);
    if (slowSteps.length > 0) {
      issues.push(`${slowSteps.length} step(s) took longer than 10 seconds`);
      recommendations.push('Investigate slow steps for optimization opportunities');
    }

    return {
      isAnomalous: issues.length > 0,
      issues,
      recommendations
    };
  }

  /**
   * Detect platform UI changes
   */
  async detectUIChanges(
    _spec: WorkflowSpec,
    _executionLogs: unknown[]
  ): Promise<{
    changesDetected: boolean;
    affectedSelectors: string[];
    suggestedUpdates: Record<string, string>;
  }> {
    // Simulate UI change detection
    await new Promise(resolve => setTimeout(resolve, 500));

    // In production, this would analyze execution logs and compare
    // with expected behavior to detect UI changes
    
    return {
      changesDetected: false,
      affectedSelectors: [],
      suggestedUpdates: {}
    };
  }

  /**
   * Get maintenance log
   */
  getMaintenanceLog(): MaintenanceLogEntry[] {
    return [...this.maintenanceLog];
  }

  /**
   * Log maintenance action
   */
  private logMaintenance(entry: MaintenanceLogEntry): void {
    this.maintenanceLog.push(entry);
    console.log(`[Maintenance] ${entry.changeType}: ${entry.description}`);
  }

  /**
   * Categorize error type
   */
  private categorizeError(errorMessage: string): string {
    if (errorMessage.includes('not found') || errorMessage.includes('selector')) {
      return 'selector-not-found';
    }
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return 'timeout';
    }
    if (errorMessage.includes('login') || errorMessage.includes('auth')) {
      return 'authentication';
    }
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'network';
    }
    return 'unknown';
  }

  /**
   * Generate alternative selectors
   */
  private generateAlternativeSelectors(originalSelector: string): string[] {
    // In production, this would use AI to generate smart alternatives
    // based on the original selector and common patterns
    
    const alternatives: string[] = [];

    // If it's a class selector, try ID and data attributes
    if (originalSelector.startsWith('.')) {
      const className = originalSelector.slice(1);
      alternatives.push(`#${className}`);
      alternatives.push(`[data-testid="${className}"]`);
      alternatives.push(`[class*="${className}"]`);
    }

    // If it's an ID selector, try class and data attributes
    if (originalSelector.startsWith('#')) {
      const id = originalSelector.slice(1);
      alternatives.push(`.${id}`);
      alternatives.push(`[data-testid="${id}"]`);
      alternatives.push(`[id*="${id}"]`);
    }

    // Add generic fallbacks
    alternatives.push(originalSelector.replace(/>/g, ' '));
    alternatives.push(originalSelector + ':first-child');
    
    return alternatives;
  }
}

export const workflowGuardian = new AIWorkflowGuardian();
