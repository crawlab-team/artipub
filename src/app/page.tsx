'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PLATFORMS } from '@/lib/types';
import { ArticleEditor } from '@/components/article-editor';
import { PublishingDashboard } from '@/components/publishing-dashboard';
import { AIFeaturesPage } from '@/components/ai-features-page';
import { SettingsPage } from '@/components/settings-page';
import { AdminLayout } from '@/components/layout/admin-layout';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('create');

  const getPageTitle = () => {
    switch (activeTab) {
      case 'create':
        return 'Create Article';
      case 'dashboard':
        return 'Publishing Dashboard';
      case 'ai-features':
        return 'AI Features';
      case 'settings':
        return 'Settings';
      default:
        return 'ArtiPub AI';
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'create':
        return 'Write and publish AI-optimized content';
      case 'dashboard':
        return 'Monitor your publishing activities';
      case 'ai-features':
        return 'Manage AI-powered optimization tools';
      case 'settings':
        return 'Configure your account and platforms';
      default:
        return 'AI-powered article publishing platform';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero Section */}
            <Card className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/20 dark:to-purple-950/20 border border-border">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  🤖 AI-Powered Article Publishing
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  Let AI optimize your content for maximum engagement across multiple platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {PLATFORMS.map((platform) => (
                    <div
                      key={platform.id}
                      className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow"
                      style={{ borderTop: `3px solid ${platform.color}` }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm"
                        style={{ backgroundColor: platform.color }}
                      >
                        {platform.displayName.charAt(0)}
                      </div>
                      <span className="text-xs mt-2 font-medium text-center">
                        {platform.displayName}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Article Editor */}
            <ArticleEditor />
          </div>
        );
      case 'dashboard':
        return <PublishingDashboard />;
      case 'ai-features':
        return <AIFeaturesPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title={getPageTitle()}
      subtitle={getPageSubtitle()}
    >
      {renderContent()}
    </AdminLayout>
  );
}
