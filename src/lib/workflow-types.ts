/**
 * Types and interfaces for the Automation Workflow Management System
 */

/**
 * Platform configuration for automation workflows
 */
export interface PlatformConfig {
  platformId: string;
  name: string;
  baseUrl: string;
  editorUrl: string;
  authType: 'cookie' | 'oauth' | 'api-key';
  contentFormat: 'markdown' | 'html' | 'richtext';
}

/**
 * Workflow step action types
 */
export type WorkflowAction = 
  | 'navigate'
  | 'fill'
  | 'click'
  | 'wait'
  | 'extract'
  | 'select'
  | 'type'
  | 'evaluate';

/**
 * Single step in a workflow
 */
export interface WorkflowStep {
  stepNumber: number;
  name: string;
  action: WorkflowAction;
  selector?: string;
  value?: string;
  url?: string;
  timeout?: number;
  validation?: string;
  fallback?: WorkflowStep[];
}

/**
 * Selector configuration for a platform
 */
export interface WorkflowSelectors {
  editor: {
    container?: string;
    title: string;
    content: string;
    publishButton: string;
    successMessage?: string;
    [key: string]: string | undefined;
  };
  [key: string]: Record<string, string | undefined> | undefined;
}

/**
 * Error handling strategy
 */
export interface ErrorHandling {
  errorType: string;
  detection: string;
  recoveryStrategy: string;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Validation rule
 */
export interface ValidationRule {
  name: string;
  description: string;
  check: string;
  required: boolean;
}

/**
 * Complete workflow specification
 */
export interface WorkflowSpec {
  version: string;
  platform: PlatformConfig;
  steps: WorkflowStep[];
  selectors: WorkflowSelectors;
  errorHandling: ErrorHandling[];
  validationRules: ValidationRule[];
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    author: string;
    description: string;
  };
}

/**
 * Workflow execution context
 */
export interface WorkflowContext {
  article: {
    id: string;
    title: string;
    content: string;
    tags?: string[];
    category?: string;
  };
  platform: string;
  userCredentials?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

/**
 * Workflow execution result
 */
export interface WorkflowExecutionResult {
  success: boolean;
  publishedUrl?: string;
  error?: string;
  steps: {
    stepNumber: number;
    name: string;
    status: 'success' | 'failed' | 'skipped';
    error?: string;
    duration: number;
  }[];
  totalDuration: number;
  timestamp: Date;
}

/**
 * Workflow failure analysis
 */
export interface WorkflowFailureAnalysis {
  failedStep: WorkflowStep;
  errorType: string;
  errorMessage: string;
  possibleCauses: string[];
  suggestedFixes: string[];
  confidence: number;
}

/**
 * Generated automation code
 */
export interface GeneratedWorkflowCode {
  platform: string;
  version: string;
  code: string;
  language: 'typescript' | 'javascript';
  dependencies: string[];
  generatedAt: Date;
}

/**
 * Workflow version information
 */
export interface WorkflowVersion {
  version: string;
  spec: WorkflowSpec;
  generatedCode?: GeneratedWorkflowCode;
  status: 'draft' | 'active' | 'deprecated';
  createdAt: Date;
  changelog?: string;
}

/**
 * Workflow maintenance log entry
 */
export interface MaintenanceLogEntry {
  timestamp: Date;
  workflowVersion: string;
  changeType: 'selector-update' | 'step-modification' | 'error-fix' | 'optimization';
  description: string;
  changedBy: 'ai' | 'developer';
  changes: {
    before: unknown;
    after: unknown;
  };
  reason: string;
}
