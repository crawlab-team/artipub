'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Zap, 
  Target, 
  Lightbulb,
  TrendingUp,
  BarChart
} from 'lucide-react';

export function AIFeaturesPage() {
  const features = [
    {
      icon: Brain,
      title: 'Smart Content Optimization',
      description: 'AI analyzes your content and suggests improvements for better engagement',
      status: 'Active'
    },
    {
      icon: Target,
      title: 'Audience Targeting',
      description: 'Automatically adapt content for different platform audiences',
      status: 'Active'
    },
    {
      icon: Lightbulb,
      title: 'SEO Enhancement',
      description: 'Generate optimized keywords and metadata for better search rankings',
      status: 'Active'
    },
    {
      icon: TrendingUp,
      title: 'Engagement Prediction',
      description: 'Predict content performance before publishing',
      status: 'Coming Soon'
    },
    {
      icon: BarChart,
      title: 'Analytics Integration',
      description: 'Deep insights into content performance across platforms',
      status: 'Coming Soon'
    },
    {
      icon: Zap,
      title: 'Auto-Publishing',
      description: 'Schedule and publish content automatically at optimal times',
      status: 'Active'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI Features</h2>
        <p className="text-muted-foreground">
          Discover and manage AI-powered features to enhance your content publishing experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`
                        text-xs px-2 py-1 rounded-full
                        ${feature.status === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                        }
                      `}>
                        {feature.status}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 w-full"
                  disabled={feature.status !== 'Active'}
                >
                  {feature.status === 'Active' ? 'Configure' : 'Coming Soon'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Model Configuration</CardTitle>
          <CardDescription>
            Configure which AI models to use for different optimization tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Content Optimization Model</h4>
                <p className="text-sm text-muted-foreground">GPT-4 Turbo</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">SEO Enhancement Model</h4>
                <p className="text-sm text-muted-foreground">Claude 3.5 Sonnet</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}