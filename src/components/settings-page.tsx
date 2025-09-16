'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Key, 
  Bell, 
  User
} from 'lucide-react';
import { PLATFORMS } from '@/lib/types';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and platform configurations.
        </p>
      </div>

      {/* Platform Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Platform Configuration
          </CardTitle>
          <CardDescription>
            Configure your publishing platforms and API credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {PLATFORMS.map((platform) => (
              <div key={platform.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                    style={{ backgroundColor: platform.color }}
                  >
                    {platform.displayName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium">{platform.displayName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {platform.id === 'zhihu' ? 'Connected' : 'Not configured'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {platform.id === 'zhihu' ? 'Reconfigure' : 'Connect'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Manage your AI service API keys and authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">OpenAI API Key</h4>
                <p className="text-sm text-muted-foreground">sk-••••••••••••••••••••••••••••••••••••••••••••••••••••</p>
              </div>
              <Button variant="outline" size="sm">Update</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Anthropic API Key</h4>
                <p className="text-sm text-muted-foreground">sk-••••••••••••••••••••••••••••••••••••••••••••••••••••</p>
              </div>
              <Button variant="outline" size="sm">Update</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you want to be notified about publishing activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">Get notified when articles are published</p>
              </div>
              <Button variant="outline" size="sm">Enabled</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Publishing Alerts</h4>
                <p className="text-sm text-muted-foreground">Alert when publishing fails</p>
              </div>
              <Button variant="outline" size="sm">Enabled</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Weekly Reports</h4>
                <p className="text-sm text-muted-foreground">Weekly publishing performance summary</p>
              </div>
              <Button variant="outline" size="sm">Disabled</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Manage your account information and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Display Name</label>
                <p className="text-sm text-muted-foreground mt-1">ArtiPub User</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground mt-1">user@artipub.ai</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}