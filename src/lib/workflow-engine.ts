/**
 * Workflow Execution Engine
 * 
 * This engine executes automation workflows based on specifications.
 * It handles step execution, retries, error handling, and reporting.
 */

import {
  WorkflowSpec,
  WorkflowStep,
  WorkflowContext,
  WorkflowExecutionResult
} from './workflow-types';
import { workflowGuardian } from './ai-workflow-guardian';

export class WorkflowEngine {
  private executionHistory: WorkflowExecutionResult[] = [];

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    spec: WorkflowSpec,
    context: WorkflowContext
  ): Promise<WorkflowExecutionResult> {
    const startTime = Date.now();
    
    const result: WorkflowExecutionResult = {
      success: true,
      steps: [],
      totalDuration: 0,
      timestamp: new Date()
    };

    console.log(`Starting workflow execution for ${spec.platform.name}`);

    try {
      // Validate context before execution
      this.validateContext(context, spec);

      // Execute each step
      for (const step of spec.steps) {
        const stepResult = await this.executeStep(step, context, spec);
        result.steps.push(stepResult);

        if (stepResult.status === 'failed') {
          result.success = false;
          
          // Try to recover using error handling strategies
          const recovered = await this.tryRecover(step, spec, context);
          if (!recovered) {
            result.error = stepResult.error;
            break;
          }
        }
      }

      // Extract result if successful
      if (result.success) {
        result.publishedUrl = await this.extractPublishedUrl(spec, context);
      }

    } catch (error) {
      result.success = false;
      result.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Workflow execution failed:', error);
    }

    result.totalDuration = Date.now() - startTime;
    
    // Store execution history
    this.executionHistory.push(result);

    // Monitor execution for anomalies
    const monitoring = await workflowGuardian.monitorExecution(result);
    if (monitoring.isAnomalous) {
      console.warn('Anomalies detected:', monitoring.issues);
      console.log('Recommendations:', monitoring.recommendations);
    }

    return result;
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(
    step: WorkflowStep,
    context: WorkflowContext,
    _spec: WorkflowSpec
  ): Promise<{
    stepNumber: number;
    name: string;
    status: 'success' | 'failed' | 'skipped';
    error?: string;
    duration: number;
  }> {
    const startTime = Date.now();
    
    console.log(`Executing step ${step.stepNumber}: ${step.name}`);

    try {
      await this.performAction(step, context);
      
      // Validate step completion
      if (step.validation) {
        await this.validateStep(step, context);
      }

      return {
        stepNumber: step.stepNumber,
        name: step.name,
        status: 'success',
        duration: Date.now() - startTime
      };

    } catch (error) {
      console.error(`Step ${step.stepNumber} failed:`, error);
      
      // Try fallback steps if available
      if (step.fallback && step.fallback.length > 0) {
        console.log(`Trying ${step.fallback.length} fallback option(s)...`);
        
        for (const fallbackStep of step.fallback) {
          try {
            await this.performAction(fallbackStep, context);
            console.log(`Fallback succeeded for step ${step.stepNumber}`);
            
            return {
              stepNumber: step.stepNumber,
              name: step.name,
              status: 'success',
              duration: Date.now() - startTime
            };
          } catch (_fallbackError) {
            console.log('Fallback failed, trying next...');
          }
        }
      }

      return {
        stepNumber: step.stepNumber,
        name: step.name,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Step execution failed',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Perform the action specified in a step
   */
  private async performAction(step: WorkflowStep, context: WorkflowContext): Promise<void> {
    // Simulate action execution
    await new Promise(resolve => setTimeout(resolve, 300));

    switch (step.action) {
      case 'navigate':
        console.log(`Navigating to ${step.url}`);
        // In production: await page.goto(step.url);
        break;

      case 'fill':
        console.log(`Filling ${step.selector} with value`);
        // Replace template variables
        // const value = this.replaceTemplateVars(step.value || '', context);
        // In production: await page.type(step.selector, value);
        break;

      case 'click':
        console.log(`Clicking ${step.selector}`);
        // In production: await page.click(step.selector);
        break;

      case 'wait':
        console.log(`Waiting ${step.timeout || 1000}ms`);
        await new Promise(resolve => setTimeout(resolve, step.timeout || 1000));
        break;

      case 'extract':
        console.log(`Extracting data from ${step.selector}`);
        // In production: return await page.evaluate(...);
        break;

      default:
        console.log(`Action ${step.action} not implemented`);
    }

    // Simulate potential random failures (10% chance)
    if (Math.random() < 0.1) {
      throw new Error(`Simulated failure for step: ${step.name}`);
    }
  }

  /**
   * Validate step completion
   */
  private async validateStep(step: WorkflowStep, _context: WorkflowContext): Promise<void> {
    // Simulate validation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production, this would check if the expected result occurred
    console.log(`Validating: ${step.validation}`);
  }

  /**
   * Try to recover from step failure using error handling strategies
   */
  private async tryRecover(
    step: WorkflowStep,
    spec: WorkflowSpec,
    context: WorkflowContext
  ): Promise<boolean> {
    console.log(`Attempting recovery for step ${step.stepNumber}...`);

    // Find applicable error handling strategy
    const errorHandling = spec.errorHandling.find(eh => 
      eh.errorType.toLowerCase().includes(step.name.toLowerCase())
    );

    if (!errorHandling) {
      return false;
    }

    const maxRetries = errorHandling.maxRetries || 3;
    const retryDelay = errorHandling.retryDelay || 1000;

    for (let i = 0; i < maxRetries; i++) {
      console.log(`Retry attempt ${i + 1}/${maxRetries}`);
      
      await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));

      try {
        await this.performAction(step, context);
        console.log('Recovery successful!');
        return true;
      } catch (_error) {
        console.log(`Retry ${i + 1} failed`);
      }
    }

    return false;
  }

  /**
   * Validate workflow context
   */
  private validateContext(context: WorkflowContext, spec: WorkflowSpec): void {
    for (const rule of spec.validationRules) {
      if (rule.required) {
        // Simple validation - in production would use proper expression evaluation
        if (rule.check.includes('title') && !context.article.title) {
          throw new Error(`Validation failed: ${rule.description}`);
        }
        if (rule.check.includes('content') && !context.article.content) {
          throw new Error(`Validation failed: ${rule.description}`);
        }
      }
    }
  }

  /**
   * Extract published URL after successful execution
   */
  private async extractPublishedUrl(
    spec: WorkflowSpec,
    context: WorkflowContext
  ): Promise<string> {
    // Simulate URL extraction
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In production, this would extract the actual URL from the page
    return `https://${spec.platform.platformId}.com/article/${context.article.id}`;
  }

  /**
   * Replace template variables in strings
   */
  private replaceTemplateVars(template: string, context: WorkflowContext): string {
    return template
      .replace(/\{\{article\.title\}\}/g, context.article.title)
      .replace(/\{\{article\.content\}\}/g, context.article.content)
      .replace(/\{\{article\.id\}\}/g, context.article.id);
  }

  /**
   * Get execution history
   */
  getExecutionHistory(): WorkflowExecutionResult[] {
    return [...this.executionHistory];
  }

  /**
   * Get workflow statistics
   */
  getStatistics(): {
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
    failuresByStep: Record<number, number>;
  } {
    const total = this.executionHistory.length;
    const successful = this.executionHistory.filter(r => r.success).length;
    const totalDuration = this.executionHistory.reduce((sum, r) => sum + r.totalDuration, 0);
    
    const failuresByStep: Record<number, number> = {};
    this.executionHistory.forEach(result => {
      result.steps.forEach(step => {
        if (step.status === 'failed') {
          failuresByStep[step.stepNumber] = (failuresByStep[step.stepNumber] || 0) + 1;
        }
      });
    });

    return {
      totalExecutions: total,
      successRate: total > 0 ? successful / total : 0,
      averageDuration: total > 0 ? totalDuration / total : 0,
      failuresByStep
    };
  }
}

export const workflowEngine = new WorkflowEngine();
