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
      "relative flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-sidebar-foreground">ArtiPub AI</h2>
            <p className="text-xs text-sidebar-foreground/70">AI Publishing Platform</p>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                  collapsed && "px-3 justify-center",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-primary"
                )}
                onClick={() => onTabChange(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn(
                  "h-4 w-4 shrink-0",
                  isActive && "text-primary"
                )} />
                {!collapsed && (
                  <div className="flex flex-col items-start text-left min-w-0">
                    <span className="font-medium text-sm truncate">{item.label}</span>
                    <span className="text-xs text-sidebar-foreground/70 truncate">{item.description}</span>
                  </div>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Collapse
            </>
          )}
        </Button>
      </div>
    </div>
  );
}