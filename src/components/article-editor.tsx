'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PLATFORMS, Article } from '@/lib/types';
import { publishingService } from '@/lib/ai-publishing-service';
import { generateId } from '@/lib/utils';

export function ArticleEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingResult, setPublishingResult] = useState<string | null>(null);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim() || selectedPlatforms.length === 0) {
      alert('Please fill in all fields and select at least one platform');
      return;
    }

    setIsPublishing(true);
    setPublishingResult(null);

    try {
      const article: Article = {
        id: generateId(),
        title,
        content,
        tags: [],
        author: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft'
      };

      const taskId = await publishingService.createPublishingTask(article, selectedPlatforms);
      setPublishingResult(taskId);
      
      // Clear form
      setTitle('');
      setContent('');
      setSelectedPlatforms([]);
    } catch (error) {
      console.error('Publishing failed:', error);
      alert('Publishing failed. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>✍️ Create New Article</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Article Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your article title..."
              className="w-full p-3 border border-border bg-background text-foreground rounded focus:ring-1 focus:ring-ring focus:border-ring"
            />
          </div>

          {/* Content Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Article Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article content here... (Markdown supported)"
              rows={12}
              className="w-full p-3 border border-border bg-background text-foreground rounded focus:ring-1 focus:ring-ring focus:border-ring resize-none"
            />
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Select Publishing Platforms</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PLATFORMS.map((platform) => (
                <div
                  key={platform.id}
                  className={`p-3 border rounded cursor-pointer transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handlePlatformToggle(platform.id)}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: platform.color }}
                    />
                    <span className="font-medium">{platform.displayName}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {platform.supportsMarkdown ? 'Markdown' : 'HTML'} • Max {platform.maxTitleLength} chars
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Publish Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handlePublish}
              disabled={isPublishing || !title.trim() || !content.trim() || selectedPlatforms.length === 0}
              size="lg"
            >
              {isPublishing ? (
                <>
                  <span className="animate-spin mr-2">⚙️</span>
                  Publishing with AI...
                </>
              ) : (
                <>
                  🚀 Publish with AI
                </>
              )}
            </Button>
          </div>

          {/* Publishing Result */}
          {publishingResult && (
            <div className="mt-4 p-4 bg-accent border border-border rounded">
              <div className="text-accent-foreground font-medium">
                ✅ Publishing task created successfully!
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Task ID: {publishingResult}
              </div>
              <div className="text-sm text-muted-foreground">
                Switch to the Publishing Dashboard to monitor progress.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Features Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <h3 className="font-semibold text-foreground mb-3">🤖 AI-Powered Features</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <div className="font-medium text-foreground">Smart Content Optimization</div>
              <div>AI adapts your content for each platform&apos;s audience and format</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Intelligent Scheduling</div>
              <div>AI determines optimal posting times for maximum engagement</div>
            </div>
            <div>
              <div className="font-medium text-foreground">SEO Enhancement</div>
              <div>Automatic keyword optimization and metadata generation</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Multi-Platform Publishing</div>
              <div>Simultaneous publishing to all selected platforms</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
