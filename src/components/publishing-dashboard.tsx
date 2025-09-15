'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlatformById } from "../lib/types";
import { publishingService } from '@/lib/ai-publishing-service';
import { PublishingTask } from '@/lib/types';

export function PublishingDashboard() {
  const [tasks, setTasks] = useState<PublishingTask[]>([]);

  useEffect(() => {
    loadTasks();
    
    // Auto-refresh every 3 seconds
    const interval = setInterval(loadTasks, 3000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadTasks = () => {
    const allTasks = publishingService.getAllTasks();
    setTasks(allTasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  };

  const handleCancelTask = (taskId: string) => {
    publishingService.cancelTask(taskId);
    loadTasks();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📊 Publishing Dashboard</h2>
        <Button onClick={loadTasks} variant="outline">
          🔄 Refresh
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">📝</div>
            <div className="text-gray-600">No publishing tasks yet</div>
            <div className="text-sm text-gray-500 mt-2">
              Create an article to see publishing tasks here
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      Task {task.id}
                    </CardTitle>
                    <div className="text-sm text-gray-500 mt-1">
                      Created: {task.createdAt.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.toUpperCase()}
                    </span>
                    {task.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancelTask(task.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* AI Strategy Display */}
                {task.strategy && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-900 mb-2">🤖 AI Publishing Strategy</div>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div>
                        <span className="font-medium">Recommended Platforms:</span>{' '}
                        {task.strategy.recommendedPlatforms?.join(', ') || 'Analyzing...'}
                      </div>
                      {task.strategy.publishingSchedule?.immediate?.length > 0 && (
                        <div>
                          <span className="font-medium">Immediate Publish:</span>{' '}
                          {task.strategy.publishingSchedule.immediate.join(', ')}
                        </div>
                      )}
                      {task.strategy.publishingSchedule?.delayed?.length > 0 && (
                        <div>
                          <span className="font-medium">Scheduled:</span>{' '}
                          {task.strategy.publishingSchedule.delayed.map(d => 
                            `${d.platform} (${d.delayMinutes}min delay)`
                          ).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Platform Results */}
                <div className="grid gap-3">
                  <div className="font-medium text-gray-900">Platform Publishing Status:</div>
                  {task.platforms.map((platformId) => {
                    const platform = getPlatformById(platformId);
                    const result = task.results[platformId];
                    
                    if (!platform) return null;

                    return (
                      <div key={platformId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: platform.color }}
                          />
                          <span className="font-medium">{platform.displayName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result?.status || 'pending')}`}>
                            {getStatusIcon(result?.status || 'pending')} {(result?.status || 'pending').toUpperCase()}
                          </span>
                          {result?.url && (
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View Post
                            </a>
                          )}
                          {result?.error && (
                            <span className="text-red-600 text-xs" title={result.error}>
                              Error
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Publishing Progress */}
                {task.status === 'processing' && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800">
                      <span className="animate-spin">⚙️</span>
                      <span className="font-medium">AI is optimizing and publishing your content...</span>
                    </div>
                    <div className="text-sm text-amber-700 mt-1">
                      This may take a few moments as AI analyzes your content and determines the best publishing strategy.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      {tasks.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle>📈 Publishing Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {tasks.filter(t => t.status === 'processing').length}
                </div>
                <div className="text-sm text-gray-600">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {tasks.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {tasks.filter(t => t.status === 'failed').length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
