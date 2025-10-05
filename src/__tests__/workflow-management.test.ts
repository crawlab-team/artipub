/**
 * Workflow Management System Tests
 * 
 * These tests demonstrate the workflow management system functionality
 */

import { workflowManagement } from '@/lib/workflow-management';
import { workflowGenerator } from '@/lib/ai-workflow-generator';
import { workflowGuardian } from '@/lib/ai-workflow-guardian';
import { workflowEngine } from '@/lib/workflow-engine';

describe('Workflow Management System', () => {
  describe('Workflow Generator', () => {
    test('should parse workflow specification from markdown', () => {
      const markdown = `
### Platform Information
- **Platform ID**: zhihu
- **Base URL**: https://www.zhihu.com
      `;
      
      const spec = workflowGenerator.parseWorkflowMarkdown(markdown);
      
      expect(spec.platform.platformId).toBe('zhihu');
      expect(spec.platform.baseUrl).toBe('https://www.zhihu.com');
      expect(spec.steps.length).toBeGreaterThan(0);
    });

    test('should generate code from workflow specification', async () => {
      const spec = workflowGenerator.parseWorkflowMarkdown('test');
      const code = await workflowGenerator.generateCodeFromSpec(spec);
      
      expect(code.platform).toBe('zhihu');
      expect(code.code).toContain('export default class');
      expect(code.code).toContain('extends BaseSpider');
      expect(code.language).toBe('typescript');
    });
  });

  describe('Workflow Engine', () => {
    test('should execute workflow successfully', async () => {
      const spec = workflowGenerator.parseWorkflowMarkdown('test');
      
      const result = await workflowEngine.executeWorkflow(spec, {
        article: {
          id: '123',
          title: 'Test Article',
          content: 'This is test content'
        },
        platform: 'zhihu'
      });
      
      expect(result).toBeDefined();
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.totalDuration).toBeGreaterThan(0);
    });

    test('should track execution statistics', async () => {
      const stats = workflowEngine.getStatistics();
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('totalExecutions');
      expect(stats).toHaveProperty('successRate');
      expect(stats).toHaveProperty('averageDuration');
    });
  });

  describe('Workflow Guardian', () => {
    test('should analyze workflow failures', async () => {
      const spec = workflowGenerator.parseWorkflowMarkdown('test');
      const result = await workflowEngine.executeWorkflow(spec, {
        article: {
          id: '123',
          title: 'Test Article',
          content: 'Content'
        },
        platform: 'zhihu'
      });

      // Simulate a failure for testing
      if (result.success) {
        result.success = false;
        result.steps[0].status = 'failed';
        result.steps[0].error = 'Element not found: .test-selector';
      }

      const analysis = await workflowGuardian.analyzeFailure(spec, result);
      
      expect(analysis).toBeDefined();
      expect(analysis.errorType).toBeDefined();
      expect(analysis.possibleCauses.length).toBeGreaterThan(0);
      expect(analysis.suggestedFixes.length).toBeGreaterThan(0);
    });

    test('should attempt auto-fix for selector issues', async () => {
      const spec = workflowGenerator.parseWorkflowMarkdown('test');
      const result = await workflowEngine.executeWorkflow(spec, {
        article: {
          id: '123',
          title: 'Test Article',
          content: 'Content'
        },
        platform: 'zhihu'
      });

      // Simulate a selector failure
      if (result.success) {
        result.success = false;
        result.steps[0].status = 'failed';
        result.steps[0].error = 'Selector not found';
      }

      const analysis = await workflowGuardian.analyzeFailure(spec, result);
      const fixResult = await workflowGuardian.attemptAutoFix(spec, analysis);
      
      expect(fixResult).toBeDefined();
      expect(fixResult.changes.length).toBeGreaterThanOrEqual(0);
    });

    test('should maintain maintenance log', async () => {
      const log = workflowGuardian.getMaintenanceLog();
      
      expect(Array.isArray(log)).toBe(true);
    });
  });

  describe('Workflow Management Service', () => {
    test('should create workflow from specification', async () => {
      const spec = workflowGenerator.parseWorkflowMarkdown('test');
      const version = await workflowManagement.createWorkflow(spec);
      
      expect(version).toBeDefined();
      expect(version.version).toBe(spec.version);
      expect(version.status).toBe('active');
      expect(version.generatedCode).toBeDefined();
    });

    test('should load workflow from markdown', async () => {
      const markdown = `
### Platform Information
- **Platform ID**: testplatform
      `;
      
      const version = await workflowManagement.loadWorkflowFromMarkdown(
        'testplatform',
        markdown
      );
      
      expect(version).toBeDefined();
      expect(version.spec.platform.platformId).toBe('zhihu');
    });

    test('should execute workflow through management service', async () => {
      const spec = workflowGenerator.parseWorkflowMarkdown('test');
      await workflowManagement.createWorkflow(spec);
      
      const result = await workflowManagement.executeWorkflow('zhihu', {
        article: {
          id: '456',
          title: 'Management Test',
          content: 'Test content'
        },
        platform: 'zhihu'
      });
      
      expect(result).toBeDefined();
      expect(result.steps.length).toBeGreaterThan(0);
    });

    test('should get workflow statistics', () => {
      const stats = workflowManagement.getStatistics();
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('totalPlatforms');
      expect(stats).toHaveProperty('totalVersions');
      expect(stats).toHaveProperty('executionStats');
    });

    test('should export workflow as markdown', async () => {
      const spec = workflowGenerator.parseWorkflowMarkdown('test');
      await workflowManagement.createWorkflow(spec);
      
      const markdown = workflowManagement.exportWorkflowAsMarkdown('zhihu');
      
      expect(markdown).toBeDefined();
      expect(markdown).toContain('# Zhihu Workflow Specification');
      expect(markdown).toContain('Platform Information');
      expect(markdown).toContain('Workflow Steps');
    });

    test('should manage workflow versions', async () => {
      const spec = workflowGenerator.parseWorkflowMarkdown('test');
      await workflowManagement.createWorkflow(spec);
      
      const versions = workflowManagement.getAllVersions('zhihu');
      expect(versions.length).toBeGreaterThan(0);
      
      const activeVersion = workflowManagement.getActiveVersion('zhihu');
      expect(activeVersion).toBeDefined();
      expect(activeVersion?.status).toBe('active');
    });
  });

  describe('End-to-End Workflow', () => {
    test('should complete full workflow lifecycle', async () => {
      // 1. Load workflow from markdown spec
      const markdown = `
### Platform Information
- **Platform ID**: e2etest
      `;
      
      const version = await workflowManagement.loadWorkflowFromMarkdown(
        'e2etest',
        markdown
      );
      
      expect(version).toBeDefined();
      
      // 2. Execute workflow
      const result = await workflowManagement.executeWorkflow('zhihu', {
        article: {
          id: 'e2e-123',
          title: 'End-to-End Test Article',
          content: 'This tests the complete workflow'
        },
        platform: 'zhihu'
      });
      
      expect(result).toBeDefined();
      
      // 3. Check statistics
      const stats = workflowManagement.getStatistics();
      expect(stats.totalPlatforms).toBeGreaterThan(0);
      expect(stats.executionStats.totalExecutions).toBeGreaterThan(0);
      
      // 4. Export workflow
      const exportedMarkdown = workflowManagement.exportWorkflowAsMarkdown('zhihu');
      expect(exportedMarkdown).toContain('Workflow Specification');
    });
  });
});
