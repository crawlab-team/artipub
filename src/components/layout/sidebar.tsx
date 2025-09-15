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
      "relative bg-card border-r transition-all duration-300 ease-in-out",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-lg">ArtiPub AI</h2>
                <p className="text-xs text-muted-foreground">AI Publishing Platform</p>
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
                    "w-full justify-start gap-3 h-11",
                    collapsed && "px-3 justify-center",
                    isActive && "bg-primary/10 text-primary border-r-2 border-primary"
                  )}
                  onClick={() => onTabChange(item.id)}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
                  {!collapsed && (
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Collapse Toggle */}
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full"
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