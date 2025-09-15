'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PLATFORMS } from '@/lib/types';
import { ArticleEditor } from '@/components/article-editor';
import { PublishingDashboard } from '@/components/publishing-dashboard';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'create' | 'dashboard'>('create');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                ArtiPub AI
              </h1>
              <p className="text-muted-foreground mt-1">
                AI-powered article publishing platform
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'create' ? 'default' : 'outline'}
                onClick={() => setActiveTab('create')}
              >
                Create Article
              </Button>
              <Button
                variant={activeTab === 'dashboard' ? 'default' : 'outline'}
                onClick={() => setActiveTab('dashboard')}
              >
                Publishing Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'create' ? (
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
        ) : (
          <PublishingDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-muted-foreground">
            ArtiPub AI - Revolutionizing content publishing with artificial intelligence
          </p>
        </div>
      </footer>
    </div>
  );
}
