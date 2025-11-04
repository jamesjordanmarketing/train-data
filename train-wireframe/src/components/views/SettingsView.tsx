import { useState } from 'react';
import { 
  Settings, 
  RefreshCw, 
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  Loader2,
  XCircle,
  AlertCircle,
  Info,
  Edit2
} from 'lucide-react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useAppStore } from '../../stores/useAppStore';
import { RetrySimulationModal } from '../modals/RetrySimulationModal';
import { DEFAULT_USER_PREFERENCES, validateUserPreferences } from '../../lib/types/user-preferences';
import { detectRecoverableData } from '../../lib/recovery/detection';
import { toast } from 'sonner';

// Helper function for shortcut descriptions
function getShortcutDescription(action: string): string {
  const descriptions: Record<string, string> = {
    openSearch: 'Open global search',
    generateAll: 'Start batch generation',
    export: 'Open export dialog',
    approve: 'Approve selected conversation',
    reject: 'Reject selected conversation',
    nextItem: 'Navigate to next item',
    previousItem: 'Navigate to previous item',
  };
  return descriptions[action] || '';
}

export function SettingsView() {
  const { preferences, updatePreferences } = useAppStore();
  const [showRetrySimulation, setShowRetrySimulation] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  
  // Default retry config if not set
  const retryConfig = preferences.retryConfig || {
    strategy: 'exponential' as const,
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 300000,
    continueOnError: false,
  };
  
  // Enhanced update handler with save status feedback
  const handlePreferenceUpdate = async (updates: Partial<typeof preferences>) => {
    setSaveStatus('saving');
    setSaveMessage('Saving...');
    
    try {
      await updatePreferences(updates);
      setSaveStatus('saved');
      setSaveMessage('Saved successfully');
      
      // Clear status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 2000);
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage('Failed to save preferences');
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 3000);
    }
  };
  
  // Handle manual recovery trigger
  const handleManualRecovery = async () => {
    try {
      toast.info('Scanning for recoverable data...');
      const items = await detectRecoverableData();
      
      if (items.length > 0) {
        toast.success(`Found ${items.length} recoverable item${items.length > 1 ? 's' : ''}! Opening recovery wizard...`);
        // The RecoveryWizard component in App.tsx will handle the actual recovery
        // For now, we just inform the user
        toast.info('Recovery wizard will open automatically if items are found on next app load.');
      } else {
        toast.success('No recoverable data found. All your data is safe and up to date!');
      }
    } catch (error) {
      toast.error('Failed to scan for recoverable data. Please try again.');
    }
  };
  
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Settings</h1>
          <p className="text-gray-600">
            Configure your preferences and application settings
          </p>
        </div>
        
        {/* Save Status Indicator */}
        {saveStatus !== 'idle' && (
          <div className="flex items-center gap-2">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm text-blue-600">{saveMessage}</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">{saveMessage}</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">{saveMessage}</span>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Global Reset All Settings */}
      <Card className="p-6 bg-gray-50 border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Reset All Settings</h3>
            <p className="text-sm text-gray-600">
              Restore all preferences to their default values
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
                handlePreferenceUpdate(DEFAULT_USER_PREFERENCES);
              }
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </Button>
        </div>
      </Card>
      
      {/* Data Recovery */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              Data Recovery
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Scan for and recover lost drafts, incomplete batches, and backups
            </p>
            <Alert className="mt-3 bg-white">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                The recovery wizard automatically detects recoverable data when you open the app.
                Use this button to manually check for recoverable items.
              </AlertDescription>
            </Alert>
          </div>
          <Button
            onClick={handleManualRecovery}
            className="ml-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Scan for Recoverable Data
          </Button>
        </div>
      </Card>
      
      <Card className="p-6 space-y-6">
        {/* Theme & Display Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Theme & Display</h3>
          <p className="text-sm text-gray-600 mb-4">
            Customize the visual appearance and layout of the application
          </p>
          
          <div className="space-y-6">
            {/* Theme Selection */}
            <div className="space-y-2">
              <Label htmlFor="theme">Color Theme</Label>
              <Select
                value={preferences.theme}
                onValueChange={(value) => 
                  handlePreferenceUpdate({ theme: value as 'light' | 'dark' | 'system' })
                }
              >
                <SelectTrigger id="theme" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      <span>System Default</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Choose your preferred color theme or match your system settings
              </p>
            </div>
            
            {/* Sidebar Collapsed State */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sidebar-collapsed">Collapsed Sidebar by Default</Label>
                <p className="text-sm text-gray-500">Start with sidebar minimized</p>
              </div>
              <Switch
                id="sidebar-collapsed"
                checked={preferences.sidebarCollapsed}
                onCheckedChange={(checked) => 
                  handlePreferenceUpdate({ sidebarCollapsed: checked })
                }
              />
            </div>
            
            {/* Table Density */}
            <div className="space-y-2">
              <Label htmlFor="table-density">Table Row Density</Label>
              <RadioGroup
                value={preferences.tableDensity}
                onValueChange={(value) => 
                  handlePreferenceUpdate({ tableDensity: value as 'compact' | 'comfortable' | 'spacious' })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compact" id="density-compact" />
                  <Label htmlFor="density-compact" className="font-normal">
                    Compact - Maximum data per screen
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comfortable" id="density-comfortable" />
                  <Label htmlFor="density-comfortable" className="font-normal">
                    Comfortable - Balanced (recommended)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spacious" id="density-spacious" />
                  <Label htmlFor="density-spacious" className="font-normal">
                    Spacious - Maximum readability
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Rows Per Page */}
            <div className="space-y-2">
              <Label htmlFor="rows-per-page">Rows Per Page</Label>
              <Select
                value={preferences.rowsPerPage.toString()}
                onValueChange={(value) => 
                  handlePreferenceUpdate({ rowsPerPage: parseInt(value) as 10 | 25 | 50 | 100 })
                }
              >
                <SelectTrigger id="rows-per-page" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="25">25 rows (default)</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                  <SelectItem value="100">100 rows</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Number of conversations to display per page in tables
              </p>
            </div>
            
            {/* Enable Animations */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="animations">Enable Animations</Label>
                <p className="text-sm text-gray-500">Use smooth transitions and animations</p>
              </div>
              <Switch
                id="animations"
                checked={preferences.enableAnimations}
                onCheckedChange={(checked) => 
                  handlePreferenceUpdate({ enableAnimations: checked })
                }
              />
            </div>
          </div>
          
          {/* Section Reset Button */}
          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handlePreferenceUpdate({
                  theme: DEFAULT_USER_PREFERENCES.theme,
                  sidebarCollapsed: DEFAULT_USER_PREFERENCES.sidebarCollapsed,
                  tableDensity: DEFAULT_USER_PREFERENCES.tableDensity,
                  rowsPerPage: DEFAULT_USER_PREFERENCES.rowsPerPage,
                  enableAnimations: DEFAULT_USER_PREFERENCES.enableAnimations,
                });
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Display Settings
            </Button>
          </div>
        </div>
        
        {/* Notification Preferences Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          <p className="text-sm text-gray-600 mb-4">
            Control how and when you receive notifications
          </p>
          
          <div className="space-y-6">
            {/* Notification Channels */}
            <div className="space-y-4">
              <Label className="text-base">Notification Channels</Label>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notif-toast">Toast Notifications</Label>
                    <p className="text-sm text-gray-500">In-app pop-up notifications</p>
                  </div>
                  <Switch
                    id="notif-toast"
                    checked={preferences.notifications.toast}
                    onCheckedChange={(checked) => 
                      handlePreferenceUpdate({ 
                        notifications: { 
                          ...preferences.notifications, 
                          toast: checked 
                        } 
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notif-email">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Send notifications to your email</p>
                  </div>
                  <Switch
                    id="notif-email"
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked) => 
                      handlePreferenceUpdate({ 
                        notifications: { 
                          ...preferences.notifications, 
                          email: checked 
                        } 
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notif-inapp">In-App Notifications</Label>
                    <p className="text-sm text-gray-500">Show notifications in notification center</p>
                  </div>
                  <Switch
                    id="notif-inapp"
                    checked={preferences.notifications.inApp}
                    onCheckedChange={(checked) => 
                      handlePreferenceUpdate({ 
                        notifications: { 
                          ...preferences.notifications, 
                          inApp: checked 
                        } 
                      })
                    }
                  />
                </div>
              </div>
            </div>
            
            {/* Notification Frequency */}
            <div className="space-y-2">
              <Label htmlFor="notif-frequency">Notification Frequency</Label>
              <Select
                value={preferences.notifications.frequency}
                onValueChange={(value) => 
                  handlePreferenceUpdate({ 
                    notifications: { 
                      ...preferences.notifications, 
                      frequency: value as 'immediate' | 'daily' | 'weekly' 
                    } 
                  })
                }
              >
                <SelectTrigger id="notif-frequency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate - Real-time notifications</SelectItem>
                  <SelectItem value="daily">Daily - Once per day digest</SelectItem>
                  <SelectItem value="weekly">Weekly - Weekly summary</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                How often to batch and send notifications
              </p>
            </div>
            
            {/* Notification Categories */}
            <div className="space-y-2">
              <Label className="text-base">Notification Types</Label>
              <p className="text-sm text-gray-500 mb-3">Choose which events trigger notifications</p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notif-generation"
                    checked={preferences.notifications.categories.generationComplete}
                    onCheckedChange={(checked) => 
                      handlePreferenceUpdate({ 
                        notifications: { 
                          ...preferences.notifications, 
                          categories: {
                            ...preferences.notifications.categories,
                            generationComplete: !!checked
                          }
                        } 
                      })
                    }
                  />
                  <Label htmlFor="notif-generation" className="font-normal">
                    Generation Complete - Batch generation finished
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notif-approval"
                    checked={preferences.notifications.categories.approvalRequired}
                    onCheckedChange={(checked) => 
                      handlePreferenceUpdate({ 
                        notifications: { 
                          ...preferences.notifications, 
                          categories: {
                            ...preferences.notifications.categories,
                            approvalRequired: !!checked
                          }
                        } 
                      })
                    }
                  />
                  <Label htmlFor="notif-approval" className="font-normal">
                    Approval Required - Conversations ready for review
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notif-errors"
                    checked={preferences.notifications.categories.errors}
                    onCheckedChange={(checked) => 
                      handlePreferenceUpdate({ 
                        notifications: { 
                          ...preferences.notifications, 
                          categories: {
                            ...preferences.notifications.categories,
                            errors: !!checked
                          }
                        } 
                      })
                    }
                  />
                  <Label htmlFor="notif-errors" className="font-normal">
                    Errors - Generation failures and critical issues
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notif-system"
                    checked={preferences.notifications.categories.systemAlerts}
                    onCheckedChange={(checked) => 
                      handlePreferenceUpdate({ 
                        notifications: { 
                          ...preferences.notifications, 
                          categories: {
                            ...preferences.notifications.categories,
                            systemAlerts: !!checked
                          }
                        } 
                      })
                    }
                  />
                  <Label htmlFor="notif-system" className="font-normal">
                    System Alerts - Platform updates and maintenance
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section Reset Button */}
          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handlePreferenceUpdate({
                  notifications: DEFAULT_USER_PREFERENCES.notifications
                });
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Notification Settings
            </Button>
          </div>
        </div>
        
        {/* Default Filters Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Default Filters</h3>
          <p className="text-sm text-gray-600 mb-4">
            Configure filters that automatically apply when you load the dashboard
          </p>
          
          <div className="space-y-6">
            {/* Auto-Apply Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="filter-auto-apply">Auto-Apply Filters</Label>
                <p className="text-sm text-gray-500">Automatically apply these filters on dashboard load</p>
              </div>
              <Switch
                id="filter-auto-apply"
                checked={preferences.defaultFilters.autoApply}
                onCheckedChange={(checked) => 
                  handlePreferenceUpdate({ 
                    defaultFilters: { 
                      ...preferences.defaultFilters, 
                      autoApply: checked 
                    } 
                  })
                }
              />
            </div>
            
            <Separator />
            
            {/* Tier Filter */}
            <div className="space-y-2">
              <Label className="text-base">Filter by Tier</Label>
              <p className="text-sm text-gray-500 mb-3">Select which conversation tiers to show</p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-tier-all"
                    checked={preferences.defaultFilters.tier === null}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handlePreferenceUpdate({ 
                          defaultFilters: { 
                            ...preferences.defaultFilters, 
                            tier: null 
                          } 
                        });
                      }
                    }}
                  />
                  <Label htmlFor="filter-tier-all" className="font-normal">
                    All Tiers
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-tier-template"
                    checked={preferences.defaultFilters.tier?.includes('template') || false}
                    onCheckedChange={(checked) => {
                      const currentTiers = preferences.defaultFilters.tier || [];
                      const newTiers = checked
                        ? [...currentTiers, 'template']
                        : currentTiers.filter(t => t !== 'template');
                      
                      handlePreferenceUpdate({ 
                        defaultFilters: { 
                          ...preferences.defaultFilters, 
                          tier: newTiers.length > 0 ? newTiers : null 
                        } 
                      });
                    }}
                  />
                  <Label htmlFor="filter-tier-template" className="font-normal">
                    Template Tier
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-tier-scenario"
                    checked={preferences.defaultFilters.tier?.includes('scenario') || false}
                    onCheckedChange={(checked) => {
                      const currentTiers = preferences.defaultFilters.tier || [];
                      const newTiers = checked
                        ? [...currentTiers, 'scenario']
                        : currentTiers.filter(t => t !== 'scenario');
                      
                      handlePreferenceUpdate({ 
                        defaultFilters: { 
                          ...preferences.defaultFilters, 
                          tier: newTiers.length > 0 ? newTiers : null 
                        } 
                      });
                    }}
                  />
                  <Label htmlFor="filter-tier-scenario" className="font-normal">
                    Scenario Tier
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-tier-edge"
                    checked={preferences.defaultFilters.tier?.includes('edge_case') || false}
                    onCheckedChange={(checked) => {
                      const currentTiers = preferences.defaultFilters.tier || [];
                      const newTiers = checked
                        ? [...currentTiers, 'edge_case']
                        : currentTiers.filter(t => t !== 'edge_case');
                      
                      handlePreferenceUpdate({ 
                        defaultFilters: { 
                          ...preferences.defaultFilters, 
                          tier: newTiers.length > 0 ? newTiers : null 
                        } 
                      });
                    }}
                  />
                  <Label htmlFor="filter-tier-edge" className="font-normal">
                    Edge Case Tier
                  </Label>
                </div>
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-base">Filter by Status</Label>
              <p className="text-sm text-gray-500 mb-3">Select which conversation statuses to show</p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-status-all"
                    checked={preferences.defaultFilters.status === null}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handlePreferenceUpdate({ 
                          defaultFilters: { 
                            ...preferences.defaultFilters, 
                            status: null 
                          } 
                        });
                      }
                    }}
                  />
                  <Label htmlFor="filter-status-all" className="font-normal">
                    All Statuses
                  </Label>
                </div>
                
                {['draft', 'generated', 'pending_review', 'approved', 'rejected', 'needs_revision'].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filter-status-${status}`}
                      checked={preferences.defaultFilters.status?.includes(status) || false}
                      onCheckedChange={(checked) => {
                        const currentStatuses = preferences.defaultFilters.status || [];
                        const newStatuses = checked
                          ? [...currentStatuses, status]
                          : currentStatuses.filter(s => s !== status);
                        
                        handlePreferenceUpdate({ 
                          defaultFilters: { 
                            ...preferences.defaultFilters, 
                            status: newStatuses.length > 0 ? newStatuses : null 
                          } 
                        });
                      }}
                    />
                    <Label htmlFor={`filter-status-${status}`} className="font-normal capitalize">
                      {status.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quality Range Filter */}
            <div className="space-y-4">
              <div>
                <Label className="text-base">Quality Score Range</Label>
                <p className="text-sm text-gray-500 mb-3">
                  Show conversations with quality scores between {preferences.defaultFilters.qualityRange[0].toFixed(1)} and {preferences.defaultFilters.qualityRange[1].toFixed(1)}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="quality-min">Minimum Score</Label>
                    <span className="text-sm font-medium">{preferences.defaultFilters.qualityRange[0].toFixed(1)}</span>
                  </div>
                  <Slider
                    id="quality-min"
                    min={0}
                    max={10}
                    step={0.5}
                    value={[preferences.defaultFilters.qualityRange[0]]}
                    onValueChange={([value]) => 
                      handlePreferenceUpdate({ 
                        defaultFilters: { 
                          ...preferences.defaultFilters, 
                          qualityRange: [value, preferences.defaultFilters.qualityRange[1]] 
                        } 
                      })
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="quality-max">Maximum Score</Label>
                    <span className="text-sm font-medium">{preferences.defaultFilters.qualityRange[1].toFixed(1)}</span>
                  </div>
                  <Slider
                    id="quality-max"
                    min={0}
                    max={10}
                    step={0.5}
                    value={[preferences.defaultFilters.qualityRange[1]]}
                    onValueChange={([value]) => 
                      handlePreferenceUpdate({ 
                        defaultFilters: { 
                          ...preferences.defaultFilters, 
                          qualityRange: [preferences.defaultFilters.qualityRange[0], value] 
                        } 
                      })
                    }
                  />
                </div>
              </div>
              
              {/* Validation Warning */}
              {preferences.defaultFilters.qualityRange[0] > preferences.defaultFilters.qualityRange[1] && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Minimum quality score cannot be greater than maximum score
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          
          {/* Section Reset Button */}
          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handlePreferenceUpdate({
                  defaultFilters: DEFAULT_USER_PREFERENCES.defaultFilters
                });
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Filter Settings
            </Button>
          </div>
        </div>
        
        {/* Export Preferences Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Export Preferences</h3>
          <p className="text-sm text-gray-600 mb-4">
            Configure default options for exporting conversation data
          </p>
          
          <div className="space-y-6">
            {/* Default Export Format */}
            <div className="space-y-2">
              <Label htmlFor="export-format">Default Export Format</Label>
              <Select
                value={preferences.exportPreferences.defaultFormat}
                onValueChange={(value) => 
                  handlePreferenceUpdate({ 
                    exportPreferences: { 
                      ...preferences.exportPreferences, 
                      defaultFormat: value as 'json' | 'jsonl' | 'csv' | 'markdown' 
                    } 
                  })
                }
              >
                <SelectTrigger id="export-format" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON - Standard format</SelectItem>
                  <SelectItem value="jsonl">JSONL - Line-delimited JSON</SelectItem>
                  <SelectItem value="csv">CSV - Spreadsheet format</SelectItem>
                  <SelectItem value="markdown">Markdown - Human-readable</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Default file format when exporting conversations
              </p>
            </div>
            
            {/* Export Options */}
            <div className="space-y-2">
              <Label className="text-base">Include in Exports</Label>
              <p className="text-sm text-gray-500 mb-3">Select which data to include by default</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="export-metadata">Conversation Metadata</Label>
                    <p className="text-sm text-gray-500">Persona, emotion, topic, intent, tone, tier</p>
                  </div>
                  <Switch
                    id="export-metadata"
                    checked={preferences.exportPreferences.includeMetadata}
                    onCheckedChange={(checked) => 
                      handlePreferenceUpdate({ 
                        exportPreferences: { 
                          ...preferences.exportPreferences, 
                          includeMetadata: checked 
                        } 
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="export-quality">Quality Scores</Label>
                    <p className="text-sm text-gray-500">Include quality metrics and scores</p>
                  </div>
                  <Switch
                    id="export-quality"
                    checked={preferences.exportPreferences.includeQualityScores}
                    onCheckedChange={(checked) => 
                      handlePreferenceUpdate({ 
                        exportPreferences: { 
                          ...preferences.exportPreferences, 
                          includeQualityScores: checked 
                        } 
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="export-timestamps">Timestamps</Label>
                    <p className="text-sm text-gray-500">Creation and modification dates</p>
                  </div>
                  <Switch
                    id="export-timestamps"
                    checked={preferences.exportPreferences.includeTimestamps}
                    onCheckedChange={(checked) => 
                      handlePreferenceUpdate({ 
                        exportPreferences: { 
                          ...preferences.exportPreferences, 
                          includeTimestamps: checked 
                        } 
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="export-approval">Approval History</Label>
                    <p className="text-sm text-gray-500">Review actions and comments</p>
                  </div>
                  <Switch
                    id="export-approval"
                    checked={preferences.exportPreferences.includeApprovalHistory}
                    onCheckedChange={(checked) => 
                      handlePreferenceUpdate({ 
                        exportPreferences: { 
                          ...preferences.exportPreferences, 
                          includeApprovalHistory: checked 
                        } 
                      })
                    }
                  />
                </div>
              </div>
            </div>
            
            {/* Auto-Compression */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="export-compression">Auto-Compression</Label>
                  <p className="text-sm text-gray-500">Automatically compress large exports</p>
                </div>
                <Switch
                  id="export-compression"
                  checked={preferences.exportPreferences.autoCompression}
                  onCheckedChange={(checked) => 
                    handlePreferenceUpdate({ 
                      exportPreferences: { 
                        ...preferences.exportPreferences, 
                        autoCompression: checked 
                      } 
                    })
                  }
                />
              </div>
              
              {preferences.exportPreferences.autoCompression && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="compression-threshold">Compression Threshold</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="compression-threshold"
                      type="number"
                      min={1}
                      max={10000}
                      value={preferences.exportPreferences.autoCompressionThreshold}
                      onChange={(e) => 
                        handlePreferenceUpdate({ 
                          exportPreferences: { 
                            ...preferences.exportPreferences, 
                            autoCompressionThreshold: parseInt(e.target.value) || 1000 
                          } 
                        })
                      }
                      className="w-32"
                    />
                    <span className="text-sm text-gray-500">conversations</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Compress exports with more than this many conversations
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Section Reset Button */}
          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handlePreferenceUpdate({
                  exportPreferences: DEFAULT_USER_PREFERENCES.exportPreferences
                });
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Export Settings
            </Button>
          </div>
        </div>
        
        {/* Keyboard Shortcuts Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
          <p className="text-sm text-gray-600 mb-4">
            Customize keyboard shortcuts for faster navigation
          </p>
          
          <div className="space-y-6">
            {/* Enable Shortcuts Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="shortcuts-enabled">Enable Keyboard Shortcuts</Label>
                <p className="text-sm text-gray-500">Use keyboard shortcuts for navigation</p>
              </div>
              <Switch
                id="shortcuts-enabled"
                checked={preferences.keyboardShortcuts.enabled}
                onCheckedChange={(checked) => 
                  handlePreferenceUpdate({ 
                    keyboardShortcuts: { 
                      ...preferences.keyboardShortcuts, 
                      enabled: checked 
                    } 
                  })
                }
              />
            </div>
            
            {preferences.keyboardShortcuts.enabled && (
              <>
                <Separator />
                
                <div className="space-y-4">
                  <Label className="text-base">Shortcut Bindings</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    Click on a binding to edit. Use modifiers: Ctrl, Alt, Shift
                  </p>
                  
                  <div className="space-y-3">
                    {Object.entries(preferences.keyboardShortcuts.customBindings).map(([action, binding]) => (
                      <div key={action} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label className="font-medium capitalize">
                            {action.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <p className="text-sm text-gray-500">
                            {getShortcutDescription(action)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <kbd className="px-2 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
                            {binding}
                          </kbd>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Open shortcut editor dialog
                              setEditingShortcut(action);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Shortcuts are case-insensitive. Use + to combine keys (e.g., Ctrl+Shift+G)
                    </AlertDescription>
                  </Alert>
                </div>
              </>
            )}
          </div>
          
          {/* Section Reset Button */}
          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handlePreferenceUpdate({
                  keyboardShortcuts: DEFAULT_USER_PREFERENCES.keyboardShortcuts
                });
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Keyboard Shortcuts
            </Button>
          </div>
        </div>
        
        {/* Quality Thresholds Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Quality Thresholds</h3>
          <p className="text-sm text-gray-600 mb-4">
            Configure quality score thresholds for automatic actions
          </p>
          
          <div className="space-y-6">
            {/* Visual Threshold Indicator */}
            <div className="relative h-16 bg-gradient-to-r from-red-100 via-yellow-100 to-green-100 rounded-lg p-4">
              <div className="absolute inset-x-0 top-0 flex justify-between px-4 pt-2">
                <span className="text-xs font-medium">0</span>
                <span className="text-xs font-medium">10</span>
              </div>
              
              {/* Threshold Markers */}
              <div className="relative h-8 mt-6">
                {/* Minimum Acceptable */}
                <div 
                  className="absolute top-0 flex flex-col items-center"
                  style={{ left: `${preferences.qualityThresholds.minimumAcceptable * 10}%` }}
                >
                  <div className="w-0.5 h-8 bg-red-500" />
                  <Badge variant="destructive" className="text-xs mt-1">Min</Badge>
                </div>
                
                {/* Flagging */}
                <div 
                  className="absolute top-0 flex flex-col items-center"
                  style={{ left: `${preferences.qualityThresholds.flagging * 10}%` }}
                >
                  <div className="w-0.5 h-8 bg-yellow-500" />
                  <Badge className="bg-yellow-500 text-xs mt-1">Flag</Badge>
                </div>
                
                {/* Auto-Approval */}
                <div 
                  className="absolute top-0 flex flex-col items-center"
                  style={{ left: `${preferences.qualityThresholds.autoApproval * 10}%` }}
                >
                  <div className="w-0.5 h-8 bg-green-500" />
                  <Badge variant="default" className="bg-green-500 text-xs mt-1">Auto</Badge>
                </div>
              </div>
            </div>
            
            {/* Threshold Sliders */}
            <div className="space-y-6">
              {/* Auto-Approval Threshold */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="threshold-auto">Auto-Approval Threshold</Label>
                    <p className="text-sm text-gray-500">Automatically approve conversations above this score</p>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {preferences.qualityThresholds.autoApproval.toFixed(1)}
                  </span>
                </div>
                <Slider
                  id="threshold-auto"
                  min={0}
                  max={10}
                  step={0.1}
                  value={[preferences.qualityThresholds.autoApproval]}
                  onValueChange={([value]) => 
                    handlePreferenceUpdate({ 
                      qualityThresholds: { 
                        ...preferences.qualityThresholds, 
                        autoApproval: value 
                      } 
                    })
                  }
                  className="[&_[role=slider]]:bg-green-500"
                />
              </div>
              
              {/* Flagging Threshold */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="threshold-flag">Flagging Threshold</Label>
                    <p className="text-sm text-gray-500">Flag conversations below this score for review</p>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">
                    {preferences.qualityThresholds.flagging.toFixed(1)}
                  </span>
                </div>
                <Slider
                  id="threshold-flag"
                  min={0}
                  max={10}
                  step={0.1}
                  value={[preferences.qualityThresholds.flagging]}
                  onValueChange={([value]) => 
                    handlePreferenceUpdate({ 
                      qualityThresholds: { 
                        ...preferences.qualityThresholds, 
                        flagging: value 
                      } 
                    })
                  }
                  className="[&_[role=slider]]:bg-yellow-500"
                />
              </div>
              
              {/* Minimum Acceptable Threshold */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="threshold-min">Minimum Acceptable Threshold</Label>
                    <p className="text-sm text-gray-500">Reject conversations below this score</p>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    {preferences.qualityThresholds.minimumAcceptable.toFixed(1)}
                  </span>
                </div>
                <Slider
                  id="threshold-min"
                  min={0}
                  max={10}
                  step={0.1}
                  value={[preferences.qualityThresholds.minimumAcceptable]}
                  onValueChange={([value]) => 
                    handlePreferenceUpdate({ 
                      qualityThresholds: { 
                        ...preferences.qualityThresholds, 
                        minimumAcceptable: value 
                      } 
                    })
                  }
                  className="[&_[role=slider]]:bg-red-500"
                />
              </div>
            </div>
            
            {/* Validation Warnings */}
            {(() => {
              const errors = validateUserPreferences({ qualityThresholds: preferences.qualityThresholds });
              const thresholdErrors = errors.filter(e => 
                e.includes('autoApproval') || e.includes('flagging') || e.includes('minimumAcceptable')
              );
              
              if (thresholdErrors.length > 0) {
                return (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Invalid Threshold Configuration</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-4 space-y-1">
                        {thresholdErrors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                );
              }
              
              return null;
            })()}
            
            {/* Threshold Explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">How Thresholds Work</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Auto-Approval ({preferences.qualityThresholds.autoApproval.toFixed(1)}+):</strong> Conversations automatically approved</li>
                <li>• <strong>Review Range ({preferences.qualityThresholds.flagging.toFixed(1)}-{preferences.qualityThresholds.autoApproval.toFixed(1)}):</strong> Requires manual review</li>
                <li>• <strong>Flagged (&lt;{preferences.qualityThresholds.flagging.toFixed(1)}):</strong> Flagged for attention</li>
                <li>• <strong>Rejected (&lt;{preferences.qualityThresholds.minimumAcceptable.toFixed(1)}):</strong> Automatically rejected</li>
              </ul>
            </div>
          </div>
          
          {/* Section Reset Button */}
          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handlePreferenceUpdate({
                  qualityThresholds: DEFAULT_USER_PREFERENCES.qualityThresholds
                });
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Quality Thresholds
            </Button>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg">Retry Configuration</h3>
              <p className="text-sm text-gray-600">
                Configure how the system handles API failures and retries
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRetrySimulation(true)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Test Retry Logic
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retry-strategy">Retry Strategy</Label>
                <Select
                  value={retryConfig.strategy}
                  onValueChange={(value) => 
                    handlePreferenceUpdate({ 
                      retryConfig: { ...retryConfig, strategy: value as 'exponential' | 'linear' | 'fixed' }
                    })
                  }
                >
                  <SelectTrigger id="retry-strategy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exponential">Exponential Backoff</SelectItem>
                    <SelectItem value="linear">Linear Backoff</SelectItem>
                    <SelectItem value="fixed">Fixed Delay</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {retryConfig.strategy === 'exponential' && 'Delay doubles after each retry (recommended)'}
                  {retryConfig.strategy === 'linear' && 'Delay increases linearly after each retry'}
                  {retryConfig.strategy === 'fixed' && 'Constant delay between all retries'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-attempts">Max Retry Attempts</Label>
                <Input
                  id="max-attempts"
                  type="number"
                  min={1}
                  max={10}
                  value={retryConfig.maxAttempts}
                  onChange={(e) => 
                    handlePreferenceUpdate({ 
                      retryConfig: { ...retryConfig, maxAttempts: parseInt(e.target.value) || 3 }
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Number of retry attempts after initial failure (1-10)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="base-delay">Base Delay (ms)</Label>
                <Input
                  id="base-delay"
                  type="number"
                  min={100}
                  max={10000}
                  step={100}
                  value={retryConfig.baseDelayMs}
                  onChange={(e) => 
                    handlePreferenceUpdate({ 
                      retryConfig: { ...retryConfig, baseDelayMs: parseInt(e.target.value) || 1000 }
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Initial delay before first retry (100-10000ms)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-delay">Max Delay (ms)</Label>
                <Input
                  id="max-delay"
                  type="number"
                  min={1000}
                  max={300000}
                  step={1000}
                  value={retryConfig.maxDelayMs}
                  onChange={(e) => 
                    handlePreferenceUpdate({ 
                      retryConfig: { ...retryConfig, maxDelayMs: parseInt(e.target.value) || 300000 }
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Maximum delay cap (1s-5min)
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="continue-on-error">Continue Batch on Error</Label>
                <p className="text-sm text-gray-500">
                  Continue processing remaining items if one fails
                </p>
              </div>
              <Switch
                id="continue-on-error"
                checked={retryConfig.continueOnError}
                onCheckedChange={(checked) => 
                  handlePreferenceUpdate({ 
                    retryConfig: { ...retryConfig, continueOnError: checked }
                  })
                }
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-blue-900 mb-2">Current Configuration Summary</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Strategy: <strong>{retryConfig.strategy}</strong></li>
                <li>• Max Attempts: <strong>{retryConfig.maxAttempts}</strong></li>
                <li>• Base Delay: <strong>{retryConfig.baseDelayMs}ms</strong></li>
                <li>• Max Delay: <strong>{retryConfig.maxDelayMs}ms</strong></li>
                <li>• Error Handling: <strong>{retryConfig.continueOnError ? 'Continue' : 'Stop'} on error</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Retry Simulation Modal */}
      <RetrySimulationModal
        open={showRetrySimulation}
        onClose={() => setShowRetrySimulation(false)}
        initialConfig={{
          strategy: retryConfig.strategy,
          maxAttempts: retryConfig.maxAttempts,
          baseDelayMs: retryConfig.baseDelayMs,
        }}
      />
    </div>
  );
}
