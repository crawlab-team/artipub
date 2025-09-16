'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  title: string;
  subtitle?: string;
}

export function AdminLayout({ 
  children, 
  activeTab, 
  onTabChange, 
  title, 
  subtitle 
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
        </aside>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content area */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Topbar */}
          <Topbar 
            title={title} 
            subtitle={subtitle}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Main content */}
          <main className="flex-1 overflow-auto bg-muted/20">
            <div className="container mx-auto px-6 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}