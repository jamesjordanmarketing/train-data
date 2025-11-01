import { Bell, User, Plus, Layers, LayoutDashboard, FileText, GitBranch, AlertTriangle, CheckCircle, Settings, BarChart3, Cpu, Database } from 'lucide-react';
import { Button } from '../ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { useAppStore } from '../../stores/useAppStore';
import { cn } from '../../lib/utils';

const navigationItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
  },
  { 
    id: 'templates', 
    label: 'Scenario Prompts', 
    icon: FileText,
  },
  { 
    id: 'scenarios', 
    label: 'Scenarios', 
    icon: GitBranch,
  },
  { 
    id: 'edge_cases', 
    label: 'Edge Cases', 
    icon: AlertTriangle,
  },
  { 
    id: 'review', 
    label: 'Review Queue', 
    icon: CheckCircle,
  },
  { 
    id: 'feedback', 
    label: 'Quality Feedback', 
    icon: BarChart3,
  },
];

export function Header() {
  const { openGenerationModal, openBatchModal, currentView, setCurrentView } = useAppStore();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-16 items-center px-6 gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Layers className="h-6 w-6 text-blue-600" />
        </div>
        
        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("gap-2", isActive && "bg-gray-100")}
                onClick={() => setCurrentView(item.id as any)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
        
        {/* Spacer */}
        <div className="flex-1" />
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button onClick={openGenerationModal} className="gap-2">
            <Plus className="h-4 w-4" />
            New Conversation
          </Button>
          <Button onClick={openBatchModal} variant="outline" className="gap-2">
            <Layers className="h-4 w-4" />
            Batch Generate
          </Button>
        </div>
        
        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>
        </div>
        
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
                <span>Sarah Johnson</span>
                <span className="text-xs text-gray-500">sarah.johnson@example.com</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentView('settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentView('ai-config')}>
              <Cpu className="h-4 w-4 mr-2" />
              AI Configuration
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentView('database')}>
              <Database className="h-4 w-4 mr-2" />
              Database Health
            </DropdownMenuItem>
            <DropdownMenuItem>Keyboard Shortcuts</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
