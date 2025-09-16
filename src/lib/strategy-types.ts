export interface PublishingStrategy {
  recommendedPlatforms: string[];
  publishingSchedule: {
    immediate: string[];
    delayed: Array<{
      platform: string;
      delayMinutes: number;
      reason: string;
    }>;
  };
  customizations: Record<string, string>;
}
