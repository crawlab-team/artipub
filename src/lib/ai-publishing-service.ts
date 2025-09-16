import { aiProcessor } from './ai-processor';
import { Platform, Article, PublishingTask, PLATFORMS } from './types';
import { generateId } from './utils';

export class AIPublishingService {
  private tasks: Map<string, PublishingTask> = new Map();

  async createPublishingTask(article: Article, platformIds: string[]): Promise<string> {
    const taskId = generateId();
    const platforms = PLATFORMS.filter(p => platformIds.includes(p.id));

    const task: PublishingTask = {
      id: taskId,
      articleId: article.id,
      platforms: platformIds,
      status: 'pending',
      results: {},
      createdAt: new Date(),
    };

    platforms.forEach(platform => {
      task.results[platform.id] = { status: 'pending' };
    });

    this.tasks.set(taskId, task);
    this.processTask(taskId, article, platforms);
    return taskId;
  }

  private async processTask(taskId: string, article: Article, platforms: Platform[]) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    try {
      task.status = 'processing';
      
      const strategy = await aiProcessor.generatePublishingStrategy(
        article.content, article.title, platforms.map(p => p.name)
      );
      task.strategy = strategy;

      
      const immediatePublish = strategy.publishingSchedule.immediate || [];
      
      for (const platformId of immediatePublish) {
        if (platforms.find(p => p.id === platformId)) {
          await this.publishToPlatform(taskId, article, platformId);
        }
      }

      task.status = 'completed';
    } catch (error) {
      task.status = 'failed';
      Object.keys(task.results).forEach(platformId => {
        if (task.results[platformId].status === 'pending') {
          task.results[platformId] = {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });
    }
  }

  private async publishToPlatform(taskId: string, article: Article, platformId: string) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform) return;

    try {
      const publishResult = await this.simulateAIPublishing(platform);
      task.results[platformId] = {
        status: 'success',
        url: publishResult.url,
        publishedAt: new Date()
      };
    } catch (error) {
      task.results[platformId] = {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Publishing failed'
      };
    }
  }

  private async simulateAIPublishing(platform: Platform): Promise<{ url: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    if (Math.random() < 0.1) {
      throw new Error(`Platform ${platform.displayName} is temporarily unavailable`);
    }

    return { url: `https://${platform.name}.com/article/${generateId()}` };
  }

  getTaskStatus(taskId: string): PublishingTask | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): PublishingTask[] {
    return Array.from(this.tasks.values());
  }

  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'pending') {
      task.status = 'failed';
      Object.keys(task.results).forEach(platformId => {
        if (task.results[platformId].status === 'pending') {
          task.results[platformId] = {
            status: 'failed',
            error: 'Task cancelled by user'
          };
        }
      });
      return true;
    }
    return false;
  }
}

export const publishingService = new AIPublishingService();
