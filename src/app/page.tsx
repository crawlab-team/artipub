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
          <div className="space-y-8">
            {/* Hero Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  🤖 AI-Powered Article Publishing
                </CardTitle>
                <CardDescription className="text-lg">
                  Let AI optimize your content for maximum engagement across multiple platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {PLATFORMS.map((platform) => (
                    <div
                      key={platform.id}
                      className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm"
                      style={{ borderTop: `3px solid ${platform.color}` }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        style={{ backgroundColor: platform.color }}
                      >
                        {platform.displayName.charAt(0)}
                      </div>
                      <span className="text-xs mt-1 font-medium">
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
