'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Bot,
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  {
    id: 'create',
    label: 'Create Article',
    icon: FileText,
    description: 'Write and publish content'
  },
  {
    id: 'dashboard',
    label: 'Publishing Dashboard',
    icon: BarChart3,
    description: 'Monitor publishing status'
  },
  {
    id: 'ai-features',
    label: 'AI Features',
    icon: Bot,
    description: 'AI optimization tools'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'Configure platforms'
  }
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "relative bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-lg text-sidebar-foreground">ArtiPub AI</h2>
                <p className="text-xs text-sidebar-foreground/70">AI Publishing Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "px-3 justify-center",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-blue-500"
                  )}
                  onClick={() => onTabChange(item.id)}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn("w-4 h-4", isActive && "text-blue-500")} />
                  {!collapsed && (
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-sidebar-foreground/70">{item.description}</span>
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}