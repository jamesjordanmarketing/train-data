'use client';

import Link from 'next/link';
import { useConversationStore } from '@/stores/conversation-store';
import { Button } from '@/components/ui/button';
import { MessageSquare, Settings, Bell, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const currentView = useConversationStore((state) => state.currentView);
  const setCurrentView = useConversationStore((state) => state.setCurrentView);
  
  type ViewType = 'dashboard' | 'bulk-generator' | 'templates' | 'review-queue';
  
  const navigationItems: { id: ViewType; label: string; href: string }[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/conversations' },
    { id: 'bulk-generator', label: 'Bulk Generator', href: '/bulk-generator' },
    { id: 'templates', label: 'Templates', href: '/conversations/templates' },
    { id: 'review-queue', label: 'Review Queue', href: '/conversations/review-queue' },
  ];
  
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/conversations" className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6" />
            <span className="font-bold text-xl">Training Data</span>
          </Link>
          
          <nav className="flex space-x-6">
            {navigationItems.map((item) => (
              <Link 
                key={item.id}
                href={item.href}
                className={
                  currentView === item.id 
                    ? 'font-medium text-foreground' 
                    : 'text-muted-foreground hover:text-foreground transition-colors'
                }
                onClick={() => setCurrentView(item.id)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>
          
          {/* Settings */}
          <Button variant="outline" size="sm" asChild>
            <Link href="/conversations/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>User Account</span>
                  <span className="text-xs text-muted-foreground">user@example.com</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrentView('settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>Keyboard Shortcuts</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

