# Train - Settings & Administration Module Implementation Execution Instructions (E08 - Part 3)
**Generated**: 2025-01-29  
**Segment**: E08 - Settings & Administration Module (Prompts 5-6)  
**Total Prompts**: 2 (5-6 of 8 total)  
**Estimated Implementation Time**: 20-24 hours

## Context

This document contains the detailed execution instructions for **Prompts 5-6** of the Settings & Administration Module (E08). These prompts focus on:

- **Prompt 5**: Settings View UI Enhancement (T-3.1.0)
- **Prompt 6**: AI Configuration Settings UI (T-3.2.0)

**Prerequisites**: 
- Prompts 1-4 have been completed successfully
- Database migrations from E08 have been applied
- User preferences and AI configuration systems are operational
- Configuration change management system is working
- Database health monitoring foundation is in place

**Reference Documents**:
- Main E08 document: `04-FR-wireframes-execution-E08.md`
- Part 2 (Prompts 3-4): `04-FR-wireframes-execution-E08-part2.md`
- Task Inventory: `04-train-FR-wireframes-E08-output.md`
- Functional Requirements: `03-train-functional-requirements.md` (FR8.1.1, FR8.2.1)

---

## Implementation Prompts

### Prompt 5: Settings View UI Enhancement (T-3.1.0)
**Scope**: Complete user preferences UI with all sections  
**Dependencies**: T-1.1.0 (User Preferences Foundation)  
**Estimated Time**: 12-14 hours  
**Risk Level**: Low-Medium

========================


You are a senior full-stack developer implementing the complete Settings View UI for the Train platform (Interactive LoRA Training Data Generation). This critical user interface enables comprehensive customization of user preferences across display settings, notifications, filters, export options, keyboard shortcuts, and quality thresholds.

**CONTEXT AND REQUIREMENTS:**

**Product Context:**
The Train platform is a workflow tool for generating 90-100 high-quality training conversations for LoRA fine-tuning. Users spend hours reviewing and managing conversations, so workspace customization is essential for productivity. The Settings View provides a comprehensive interface for personalizing the platform experience.

**Functional Requirements (FR8.1.1):**
- Settings view accessible from user menu
- User preferences stored per-user in database with JSONB flexibility
- Theme selection: light, dark, system
- Display preferences: sidebar collapsed, table density, rows per page, animations
- Notification preferences: toast, email, in-app notifications, frequency
- Default filters: tier, status, quality range - auto-applied on load
- Export preferences: default format, metadata inclusion, auto-compression
- Keyboard shortcuts: customizable mappings
- Quality thresholds: auto-approval, flagging, minimum acceptable
- Settings auto-save on change with debouncing (300ms)
- Reset to defaults functionality per section
- Complete audit trail of preference changes

**Technical Architecture:**
- **Frontend**: Next.js 14 App Router, TypeScript, React 18, Tailwind CSS, Shadcn/UI
- **State Management**: Zustand store (`train-wireframe/src/stores/useAppStore.ts`)
- **Backend**: Next.js API routes from Prompt 1
- **Type Safety**: Strict TypeScript mode throughout

**CURRENT CODEBASE STATE:**

**Existing Implementation:**
1. **Basic SettingsView** (`train-wireframe/src/components/views/SettingsView.tsx`):
   - Currently has only 2 switches: enableAnimations, keyboardShortcuts.enabled
   - Has retry configuration section (complete)
   - Uses Shadcn/UI components (Card, Label, Switch, Button, Input, Select)
   - Connected to Zustand store: `const { preferences, updatePreferences } = useAppStore();`
   - RetrySimulationModal integration exists

2. **UserPreferences Type** (`train-wireframe/src/lib/types/user-preferences.ts`):
   - Complete type definitions from Prompt 1
   - Includes: NotificationPreferences, DefaultFilterPreferences, ExportPreferences, KeyboardShortcuts, QualityThresholds, RetryConfig
   - DEFAULT_USER_PREFERENCES constant with sensible defaults
   - validateUserPreferences() validation function

3. **Zustand Store Integration** (`train-wireframe/src/stores/useAppStore.ts`):
   - preferences state (UserPreferences type)
   - preferencesLoaded flag
   - updatePreferences(updates: Partial<UserPreferences>) action
   - resetPreferences() action
   - loadPreferences() action for initialization

4. **API Routes** (from Prompt 1):
   - GET /api/user-preferences - fetch preferences
   - PATCH /api/user-preferences - update preferences (auto-saves with debouncing)
   - POST /api/user-preferences (action=reset) - reset to defaults

5. **Shadcn/UI Components Available**:
   - Card, Label, Switch, Button, Input, Select
   - Slider (for numeric ranges)
   - Tabs (for section organization)
   - Separator (for visual dividers)
   - RadioGroup (for single-choice options)
   - Checkbox (for multi-select)
   - Badge (for visual tags)
   - Alert (for notifications)

**Gaps to Fill:**
- Expand SettingsView to include ALL preference sections
- Theme selection dropdown (light/dark/system)
- Sidebar and table display preferences
- Complete notification preferences UI
- Default filters configuration
- Export preferences configuration
- Keyboard shortcuts customization UI
- Quality thresholds with sliders and validation
- Reset to defaults button per section
- Visual feedback for auto-save status
- Preference change confirmation where appropriate

**IMPLEMENTATION TASKS:**

**Task T-3.1.1: Theme and Display Preferences Section**

Update `train-wireframe/src/components/views/SettingsView.tsx` to add comprehensive display preferences:

```typescript
// Theme Selection Section
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
          updatePreferences({ theme: value as 'light' | 'dark' | 'system' })
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
          updatePreferences({ sidebarCollapsed: checked })
        }
      />
    </div>
    
    {/* Table Density */}
    <div className="space-y-2">
      <Label htmlFor="table-density">Table Row Density</Label>
      <RadioGroup
        value={preferences.tableDensity}
        onValueChange={(value) => 
          updatePreferences({ tableDensity: value as 'compact' | 'comfortable' | 'spacious' })
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
          updatePreferences({ rowsPerPage: parseInt(value) as 10 | 25 | 50 | 100 })
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
          updatePreferences({ enableAnimations: checked })
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
        updatePreferences({
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
```

**Task T-3.1.2: Notification Preferences Section**

Add comprehensive notification preferences configuration:

```typescript
// Notification Preferences Section
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
              updatePreferences({ 
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
              updatePreferences({ 
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
              updatePreferences({ 
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
          updatePreferences({ 
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
              updatePreferences({ 
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
              updatePreferences({ 
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
              updatePreferences({ 
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
              updatePreferences({ 
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
        updatePreferences({
          notifications: DEFAULT_USER_PREFERENCES.notifications
        });
      }}
    >
      <RotateCcw className="w-4 h-4 mr-2" />
      Reset Notification Settings
    </Button>
  </div>
</div>
```

**Task T-3.1.3: Default Filters Section**

Add default filter preferences that auto-apply on dashboard load:

```typescript
// Default Filters Section
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
          updatePreferences({ 
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
                updatePreferences({ 
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
              
              updatePreferences({ 
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
              
              updatePreferences({ 
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
              
              updatePreferences({ 
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
                updatePreferences({ 
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
                
                updatePreferences({ 
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
              updatePreferences({ 
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
              updatePreferences({ 
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
        updatePreferences({
          defaultFilters: DEFAULT_USER_PREFERENCES.defaultFilters
        });
      }}
    >
      <RotateCcw className="w-4 h-4 mr-2" />
      Reset Filter Settings
    </Button>
  </div>
</div>
```

**Task T-3.1.4: Export Preferences Section**

Add export preference configuration:

```typescript
// Export Preferences Section
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
          updatePreferences({ 
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
              updatePreferences({ 
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
              updatePreferences({ 
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
              updatePreferences({ 
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
              updatePreferences({ 
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
            updatePreferences({ 
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
                updatePreferences({ 
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
        updatePreferences({
          exportPreferences: DEFAULT_USER_PREFERENCES.exportPreferences
        });
      }}
    >
      <RotateCcw className="w-4 h-4 mr-2" />
      Reset Export Settings
    </Button>
  </div>
</div>
```

**Task T-3.1.5: Keyboard Shortcuts Section**

Add keyboard shortcuts customization UI:

```typescript
// Keyboard Shortcuts Section
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
          updatePreferences({ 
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
        updatePreferences({
          keyboardShortcuts: DEFAULT_USER_PREFERENCES.keyboardShortcuts
        });
      }}
    >
      <RotateCcw className="w-4 h-4 mr-2" />
      Reset Keyboard Shortcuts
    </Button>
  </div>
</div>

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
```

**Task T-3.1.6: Quality Thresholds Section**

Add quality thresholds configuration with validation:

```typescript
// Quality Thresholds Section
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
            updatePreferences({ 
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
            updatePreferences({ 
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
            updatePreferences({ 
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
        updatePreferences({
          qualityThresholds: DEFAULT_USER_PREFERENCES.qualityThresholds
        });
      }}
    >
      <RotateCcw className="w-4 h-4 mr-2" />
      Reset Quality Thresholds
    </Button>
  </div>
</div>
```

**Task T-3.1.7: Auto-Save Status Indicator**

Add visual feedback for auto-save functionality:

```typescript
// Add to imports
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

// Add state for save status
const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
const [saveMessage, setSaveMessage] = useState('');

// Override updatePreferences to show save status
const handlePreferenceUpdate = async (updates: Partial<UserPreferences>) => {
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

// Add save status indicator to the top of the view
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
            updatePreferences(DEFAULT_USER_PREFERENCES);
          }
        }}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset All
      </Button>
    </div>
  </Card>
  
  {/* Rest of the sections... */}
</div>
```

**Task T-3.1.8: Add Required Imports**

Add all necessary imports to the top of SettingsView.tsx:

```typescript
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
```

**ACCEPTANCE CRITERIA:**

1. **UI Components:**
   - [ ] Theme & Display section includes all display preferences
   - [ ] Theme selector supports light/dark/system with icons
   - [ ] Table density uses radio group with clear labels
   - [ ] Rows per page dropdown works correctly
   - [ ] Sidebar collapsed and animations toggles work
   - [ ] All controls update state immediately (optimistic UI)
   
2. **Notification Preferences:**
   - [ ] All notification channels (toast, email, in-app) have toggles
   - [ ] Notification frequency dropdown works (immediate/daily/weekly)
   - [ ] Notification categories all have checkboxes
   - [ ] Settings properly nested in preferences.notifications object
   - [ ] All toggles update correctly
   
3. **Default Filters:**
   - [ ] Auto-apply filter toggle works
   - [ ] Tier selection supports multi-select (checkboxes)
   - [ ] Status selection supports multi-select (checkboxes)
   - [ ] "All" options clear individual selections
   - [ ] Quality range sliders work with min/max validation
   - [ ] Validation error appears when min > max
   - [ ] Filter settings saved correctly
   
4. **Export Preferences:**
   - [ ] Default format dropdown includes all formats
   - [ ] All include options have toggles
   - [ ] Auto-compression toggle controls threshold visibility
   - [ ] Compression threshold accepts valid numbers (1-10000)
   - [ ] All export settings update correctly
   
5. **Keyboard Shortcuts:**
   - [ ] Enable shortcuts toggle shows/hides bindings section
   - [ ] All default shortcuts displayed with kbd styling
   - [ ] Shortcut descriptions accurate
   - [ ] Edit buttons present for each shortcut
   - [ ] Helper function returns correct descriptions
   - [ ] Settings update correctly when changed
   
6. **Quality Thresholds:**
   - [ ] Visual gradient indicator shows all three thresholds
   - [ ] Threshold markers position correctly (0-10 scale)
   - [ ] All three sliders work independently
   - [ ] Numeric values display next to each threshold
   - [ ] Validation errors appear for invalid configurations
   - [ ] Explanation box shows current threshold ranges
   - [ ] Sliders use appropriate colors (red/yellow/green)
   
7. **Auto-Save Functionality:**
   - [ ] Save status indicator appears on preference change
   - [ ] Saving state shows spinner and "Saving..." message
   - [ ] Saved state shows checkmark and "Saved successfully"
   - [ ] Error state shows X icon and error message
   - [ ] Status clears after 2 seconds (saved) or 3 seconds (error)
   - [ ] Debouncing works (300ms delay before API call)
   
8. **Reset Functionality:**
   - [ ] Each section has individual "Reset" button
   - [ ] Reset buttons restore section-specific defaults
   - [ ] Global "Reset All" button in prominent position
   - [ ] Global reset asks for confirmation
   - [ ] All resets update UI immediately
   - [ ] Resets trigger save indicator
   
9. **State Management:**
   - [ ] All changes call updatePreferences from Zustand store
   - [ ] Partial updates preserve other preference values
   - [ ] Nested objects update correctly (notifications, defaultFilters, etc.)
   - [ ] Store properly connected to API routes
   - [ ] Optimistic updates work (UI updates before server confirms)
   
10. **Validation:**
    - [ ] validateUserPreferences() called before save
    - [ ] Validation errors displayed inline near invalid fields
    - [ ] Invalid configurations prevented from saving
    - [ ] Quality threshold ordering enforced
    - [ ] Numeric ranges enforced (rowsPerPage, compression threshold)
    
11. **Styling & UX:**
    - [ ] All sections use consistent spacing (space-y-6)
    - [ ] Border-top separates sections visually
    - [ ] Labels and descriptions use consistent typography
    - [ ] Switches, checkboxes, and sliders use Shadcn/UI styling
    - [ ] Help text uses text-sm text-gray-500
    - [ ] Alert boxes use appropriate variants (info, warning, error)
    - [ ] Reset buttons use outline variant
    - [ ] Responsive layout works on all screen sizes

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
train-wireframe/src/components/views/SettingsView.tsx (UPDATE - major expansion)
train-wireframe/src/lib/types/user-preferences.ts (EXISTING - no changes)
train-wireframe/src/stores/useAppStore.ts (EXISTING - no changes)
train-wireframe/src/lib/services/user-preferences-service.ts (EXISTING - no changes)
```

**Component Architecture:**
- Single comprehensive SettingsView component
- Each preference category in its own section
- Consistent section structure:
  - Section header (h3 title + description)
  - Section content (preference controls)
  - Section reset button
  - Border-top separator between sections

**State Management:**
- All state managed through Zustand store
- updatePreferences action handles optimistic updates
- Automatic debouncing (300ms) in API layer
- Save status tracked locally in component
- No local state for preference values (single source of truth)

**Validation Strategy:**
- Client-side validation before API call
- Real-time validation feedback for invalid configurations
- Validation errors displayed inline near controls
- Submit blocked if validation fails
- Server-side validation as backup (API routes)

**Styling Approach:**
- Tailwind CSS utility classes throughout
- Shadcn/UI components for consistency
- Color-coded visual indicators (red/yellow/green for thresholds)
- Consistent spacing with Tailwind space-y utilities
- Responsive design with grid and flex layouts

**Error Handling:**
- Try-catch around updatePreferences calls
- Error state shown in save status indicator
- Validation errors shown inline
- Console logs for debugging
- User-friendly error messages

**Performance:**
- Debounced API calls prevent excessive requests
- Optimistic UI updates for instant feedback
- No unnecessary re-renders (proper React patterns)
- Efficient state updates (partial updates only)

**VALIDATION REQUIREMENTS:**

1. **Manual Testing:**
   - Open Settings view → verify all sections render
   - Change theme → verify updates and saves
   - Toggle all switches → verify state updates
   - Adjust all sliders → verify numeric values update
   - Set invalid quality thresholds → verify validation error
   - Reset individual sections → verify defaults restored
   - Reset all settings → verify confirmation and reset
   - Rapid changes → verify debouncing (single save after 300ms)
   
2. **Integration Testing:**
   - Change preferences → verify user_preferences table updated
   - Reload page → verify preferences persist
   - Change theme → verify applies across application
   - Change rowsPerPage → verify tables update
   - Set default filters → verify dashboard applies them
   - Disable animations → verify transitions stop
   
3. **Visual Testing:**
   - Verify consistent spacing between sections
   - Verify all labels aligned correctly
   - Verify switches, checkboxes, sliders styled correctly
   - Verify quality threshold gradient displays properly
   - Verify save status indicator visible and clear
   - Verify responsive layout on mobile screens
   
4. **Validation Testing:**
   - Set autoApproval < flagging → verify error
   - Set flagging < minimumAcceptable → verify error
   - Set quality range min > max → verify error
   - Set invalid rowsPerPage (e.g., 30) → verify error/correction
   - Set compression threshold < 1 → verify error/correction
   
5. **State Testing:**
   - Verify preferences loaded on component mount
   - Verify updatePreferences calls API
   - Verify optimistic updates work
   - Verify error handling reverts state
   - Verify partial updates preserve other values

**DELIVERABLES:**

1. [ ] `train-wireframe/src/components/views/SettingsView.tsx` - Complete enhanced Settings View
2. [ ] All sections implemented: Theme & Display, Notifications, Default Filters, Export, Keyboard Shortcuts, Quality Thresholds
3. [ ] Auto-save status indicator functional
4. [ ] Reset buttons functional (individual and global)
5. [ ] All Shadcn/UI components properly imported
6. [ ] All validation working correctly
7. [ ] Manual testing completed with all scenarios passing
8. [ ] Visual testing confirmed consistent styling
9. [ ] Integration testing with backend API completed

Implement this comprehensive Settings View UI completely, ensuring all preference categories are accessible, all controls work correctly, validation prevents invalid states, and the auto-save functionality provides clear feedback to users.


++++++++++++++++++


### Prompt 6: AI Configuration Settings UI (T-3.2.0)
**Scope**: Complete AI configuration management UI with tabs  
**Dependencies**: T-1.2.0 (AI Configuration Foundation), T-2.1.0 (Configuration Change Management)  
**Estimated Time**: 10-12 hours  
**Risk Level**: Medium

========================


You are a senior full-stack developer implementing the AI Configuration Settings UI for the Train platform (Interactive LoRA Training Data Generation). This critical interface enables comprehensive control over Claude API parameters, rate limiting, retry strategies, cost management, and API key rotation at the user level.

**CONTEXT AND REQUIREMENTS:**

**Product Context:**
The Train platform uses Claude API to generate 90-100 training conversations. Different generation scenarios require different AI parameters (temperature, model selection, etc.). Users need fine-grained control over generation quality, cost management, and error handling. The AI Configuration UI provides this control with real-time validation and preview capabilities.

**Functional Requirements (FR8.2.1):**
- AI config specifies model, temperature, max tokens, top_p, streaming
- Rate limiting configuration: requests per minute, concurrent requests, burst allowance
- Retry strategy configuration: max retries, backoff strategy, delays
- Cost budget alerts: daily/weekly/monthly budgets with thresholds
- API key rotation support (primary/secondary keys)
- Model selection from available Claude models
- Generation timeout configuration
- Configuration preview showing effective settings
- Rollback/version history functionality
- Configuration validation before save
- Real-time cost estimation

**Technical Architecture:**
- **Frontend**: Next.js 14 App Router, TypeScript, React 18, Tailwind CSS, Shadcn/UI
- **State Management**: React state + API integration (no Zustand needed for this view)
- **Backend**: Next.js API routes from Prompt 2
- **Type Safety**: Strict TypeScript mode throughout

**CURRENT CODEBASE STATE:**

**Existing Implementation:**
1. **AI Configuration Types** (`src/lib/types/ai-config.ts` - from Prompt 2):
   - Complete AIConfiguration interface with all sub-interfaces
   - ModelConfiguration, RateLimitConfiguration, RetryStrategyConfiguration, CostBudgetConfiguration, APIKeyConfiguration, TimeoutConfiguration
   - DEFAULT_AI_CONFIGURATION constant
   - AVAILABLE_MODELS mapping with capabilities
   - validateAIConfiguration() validation function
   - calculateCost() utility function

2. **AI Configuration Service** (`src/lib/services/ai-config-service.ts` - from Prompt 2):
   - getEffectiveConfiguration(userId) - returns configuration with fallback chain
   - updateConfiguration(userId, configName, updates) - updates and validates
   - getUserConfigurations(userId) - lists all user configs
   - toggleConfiguration(configId, isActive) - activate/deactivate
   - rotateAPIKey(userId, newPrimaryKey) - key rotation

3. **API Routes** (from Prompt 2):
   - GET /api/ai-configuration - returns effective config + user configs
   - PATCH /api/ai-configuration - updates configuration with validation
   - DELETE /api/ai-configuration - removes configuration

4. **Configuration Change Management** (from Prompt 4):
   - GET /api/config/change-history - configuration change history
   - POST /api/config/rollback - rollback functionality
   - Preview, validate, and execute rollback actions

5. **Shadcn/UI Components Available**:
   - Tabs, TabsList, TabsTrigger, TabsContent (for tab organization)
   - Card, Label, Switch, Button, Input, Select
   - Slider (for numeric controls)
   - Badge (for status indicators)
   - Alert (for warnings and errors)
   - Dialog (for confirmations)

**Gaps to Fill:**
- Create new AIConfigView component
- Model Configuration tab UI
- Rate Limiting & Retry tab UI
- Cost Management tab UI
- API Keys tab UI
- Timeout Configuration tab UI
- Configuration preview pane showing effective settings
- Validation feedback UI
- Change history modal
- Rollback confirmation dialog
- Navigation integration

**IMPLEMENTATION TASKS:**

**Task T-3.2.1: Create AIConfigView Component Foundation**

Create new file `train-wireframe/src/components/views/AIConfigView.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../ui/tabs';
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
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { 
  Settings, 
  Cpu, 
  Timer, 
  DollarSign, 
  Key, 
  Clock,
  Save,
  RotateCcw,
  History,
  CheckCircle2,
  Loader2,
  XCircle,
  AlertCircle,
  Info,
  TrendingUp
} from 'lucide-react';
import { AIConfiguration, AVAILABLE_MODELS } from '../../lib/types/ai-config';

export function AIConfigView() {
  const [effectiveConfig, setEffectiveConfig] = useState<AIConfiguration | null>(null);
  const [configDraft, setConfigDraft] = useState<Partial<AIConfiguration>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  useEffect(() => {
    loadConfiguration();
  }, []);
  
  const loadConfiguration = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ai-configuration');
      const data = await response.json();
      setEffectiveConfig(data.effective);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load AI configuration:', error);
      setIsLoading(false);
    }
  };
  
  const handleSave = async () => {
    // Validate configuration
    const errors = validateConfiguration();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setSaveStatus('saving');
    setValidationErrors([]);
    
    try {
      const response = await fetch('/api/ai-configuration', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configName: 'default',
          updates: configDraft
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save configuration');
      }
      
      setSaveStatus('saved');
      setConfigDraft({});
      await loadConfiguration();
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving configuration:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };
  
  const validateConfiguration = (): string[] => {
    const errors: string[] = [];
    
    // Validate model configuration
    if (configDraft.model) {
      if (configDraft.model.temperature !== undefined) {
        if (configDraft.model.temperature < 0 || configDraft.model.temperature > 1) {
          errors.push('Temperature must be between 0 and 1');
        }
      }
      if (configDraft.model.maxTokens !== undefined) {
        if (configDraft.model.maxTokens < 1 || configDraft.model.maxTokens > 4096) {
          errors.push('Max tokens must be between 1 and 4096');
        }
      }
    }
    
    // Validate rate limiting
    if (configDraft.rateLimiting) {
      if (configDraft.rateLimiting.requestsPerMinute !== undefined) {
        if (configDraft.rateLimiting.requestsPerMinute < 1) {
          errors.push('Requests per minute must be at least 1');
        }
      }
    }
    
    // Validate retry strategy
    if (configDraft.retryStrategy) {
      if (configDraft.retryStrategy.maxRetries !== undefined) {
        if (configDraft.retryStrategy.maxRetries < 0 || configDraft.retryStrategy.maxRetries > 10) {
          errors.push('Max retries must be between 0 and 10');
        }
      }
      if (configDraft.retryStrategy.maxDelay !== undefined && configDraft.retryStrategy.baseDelay !== undefined) {
        if (configDraft.retryStrategy.maxDelay < configDraft.retryStrategy.baseDelay) {
          errors.push('Max delay must be greater than or equal to base delay');
        }
      }
    }
    
    return errors;
  };
  
  const updateDraft = (updates: Partial<AIConfiguration>) => {
    setConfigDraft(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-600">Loading AI configuration...</span>
      </div>
    );
  }
  
  if (!effectiveConfig) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Failed to load AI configuration. Please refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const displayConfig = {
    ...effectiveConfig,
    ...configDraft
  };
  
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">AI Configuration</h1>
          <p className="text-gray-600">
            Configure Claude API parameters and generation settings
          </p>
        </div>
        
        {/* Save Status & Actions */}
        <div className="flex items-center gap-4">
          {saveStatus !== 'idle' && (
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm text-blue-600">Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Saved</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600">Save failed</span>
                </>
              )}
            </div>
          )}
          
          <Button
            variant="outline"
            onClick={() => setShowHistory(true)}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={Object.keys(configDraft).length === 0 || saveStatus === 'saving'}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
      
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-1">
              {validationErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Tabs Container */}
      <Tabs defaultValue="model" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="model">
            <Cpu className="w-4 h-4 mr-2" />
            Model
          </TabsTrigger>
          <TabsTrigger value="rate-retry">
            <Timer className="w-4 h-4 mr-2" />
            Rate & Retry
          </TabsTrigger>
          <TabsTrigger value="cost">
            <DollarSign className="w-4 h-4 mr-2" />
            Cost
          </TabsTrigger>
          <TabsTrigger value="keys">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="timeouts">
            <Clock className="w-4 h-4 mr-2" />
            Timeouts
          </TabsTrigger>
        </TabsList>
        
        {/* Tab contents will be added in subsequent tasks */}
      </Tabs>
      
      {/* Configuration Preview Pane */}
      <Card className="p-6 bg-gray-50 border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Effective Configuration Preview</h3>
        <pre className="text-sm bg-white p-4 rounded-lg overflow-auto max-h-96 border">
          {JSON.stringify(displayConfig, null, 2)}
        </pre>
        <p className="text-sm text-gray-500 mt-2">
          This shows your current configuration merged with any unsaved changes
        </p>
      </Card>
    </div>
  );
}
```

**Task T-3.2.2: Model Configuration Tab**

Add Model Configuration tab content:

```typescript
<TabsContent value="model" className="space-y-6">
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Model Configuration</h3>
    <p className="text-sm text-gray-600 mb-6">
      Configure Claude API model and generation parameters
    </p>
    
    <div className="space-y-6">
      {/* Model Selection */}
      <div className="space-y-2">
        <Label htmlFor="model-select">Claude Model</Label>
        <Select
          value={displayConfig.model.model}
          onValueChange={(value) => 
            updateDraft({ 
              model: { 
                ...displayConfig.model, 
                model: value 
              } 
            })
          }
        >
          <SelectTrigger id="model-select" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(AVAILABLE_MODELS).map(([modelName, capabilities]) => (
              <SelectItem key={modelName} value={modelName}>
                <div className="flex flex-col">
                  <span className="font-medium">{modelName}</span>
                  <span className="text-xs text-gray-500">
                    {capabilities.contextWindow.toLocaleString()} tokens context | 
                    ${capabilities.costPer1kInputTokens}/1k in, ${capabilities.costPer1kOutputTokens}/1k out
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Selected model capabilities: {AVAILABLE_MODELS[displayConfig.model.model]?.supportedFeatures.join(', ')}
        </p>
      </div>
      
      {/* Temperature Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="temperature">Temperature</Label>
          <span className="text-sm font-medium">{displayConfig.model.temperature.toFixed(2)}</span>
        </div>
        <Slider
          id="temperature"
          min={0}
          max={1}
          step={0.05}
          value={[displayConfig.model.temperature]}
          onValueChange={([value]) => 
            updateDraft({ 
              model: { 
                ...displayConfig.model, 
                temperature: value 
              } 
            })
          }
        />
        <p className="text-xs text-gray-500">
          Lower values (0.0-0.3): More deterministic, focused | 
          Medium values (0.4-0.7): Balanced | 
          Higher values (0.8-1.0): More creative, varied
        </p>
      </div>
      
      {/* Max Tokens */}
      <div className="space-y-2">
        <Label htmlFor="max-tokens">Max Output Tokens</Label>
        <Input
          id="max-tokens"
          type="number"
          min={1}
          max={4096}
          value={displayConfig.model.maxTokens}
          onChange={(e) => 
            updateDraft({ 
              model: { 
                ...displayConfig.model, 
                maxTokens: parseInt(e.target.value) || 4096 
              } 
            })
          }
        />
        <p className="text-xs text-gray-500">
          Maximum number of tokens in generated response (1-4096)
        </p>
      </div>
      
      {/* Top P */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="top-p">Top P (Nucleus Sampling)</Label>
          <span className="text-sm font-medium">{displayConfig.model.topP.toFixed(2)}</span>
        </div>
        <Slider
          id="top-p"
          min={0}
          max={1}
          step={0.05}
          value={[displayConfig.model.topP]}
          onValueChange={([value]) => 
            updateDraft({ 
              model: { 
                ...displayConfig.model, 
                topP: value 
              } 
            })
          }
        />
        <p className="text-xs text-gray-500">
          Alternative to temperature. Recommended: use temperature OR top_p, not both
        </p>
      </div>
      
      {/* Streaming */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="streaming">Enable Streaming</Label>
          <p className="text-sm text-gray-500">Stream responses token-by-token</p>
        </div>
        <Switch
          id="streaming"
          checked={displayConfig.model.streaming}
          onCheckedChange={(checked) => 
            updateDraft({ 
              model: { 
                ...displayConfig.model, 
                streaming: checked 
              } 
            })
          }
        />
      </div>
      
      {/* Cost Estimation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Cost Estimation
        </h4>
        <div className="text-sm text-blue-800 space-y-1">
          <div className="flex justify-between">
            <span>Input cost (1000 tokens):</span>
            <span className="font-medium">${AVAILABLE_MODELS[displayConfig.model.model]?.costPer1kInputTokens}</span>
          </div>
          <div className="flex justify-between">
            <span>Output cost (1000 tokens):</span>
            <span className="font-medium">${AVAILABLE_MODELS[displayConfig.model.model]?.costPer1kOutputTokens}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t border-blue-300">
            <span>Est. cost per conversation:</span>
            <span>${(AVAILABLE_MODELS[displayConfig.model.model]?.costPer1kInputTokens * 2 + 
              AVAILABLE_MODELS[displayConfig.model.model]?.costPer1kOutputTokens * 
              (displayConfig.model.maxTokens / 1000)).toFixed(4)}</span>
          </div>
        </div>
      </div>
    </div>
  </Card>
</TabsContent>
```

**NOTE**: Due to the comprehensive nature of this prompt, the remaining tab implementations (Rate & Retry, Cost, API Keys, Timeouts) follow similar patterns to the Model tab shown above. The key implementation requirements are:

1. **Rate & Retry Tab**: Configure rate limiting (requests/minute, concurrent requests, burst allowance) and retry strategy (max retries, backoff type, delays) with visual backoff progression chart.

2. **Cost Management Tab**: Set daily/weekly/monthly budgets with alert thresholds (50%, 75%, 90%), display spending history, and show cost projections.

3. **API Keys Tab**: Masked display of primary/secondary keys, rotation interface, key version tracking, and rotation schedule configuration.

4. **Timeouts Tab**: Configure generation timeout, connection timeout, and total request timeout with explanations of each.

All tabs should follow the same structure as the Model tab: Card wrapper, section header with description, form controls with Labels, help text, and update draft state on change.

**ACCEPTANCE CRITERIA:**

1. **Component Structure:**
   - [ ] AIConfigView component loads effective configuration on mount
   - [ ] Configuration draft state tracks unsaved changes
   - [ ] Save button disabled when no changes present
   - [ ] Save status indicator shows saving/saved/error states
   - [ ] Validation runs before save attempt
   - [ ] Validation errors display in Alert component above tabs
   
2. **Tab Implementation:**
   - [ ] All 5 tabs render correctly (Model, Rate & Retry, Cost, API Keys, Timeouts)
   - [ ] Tab navigation works smoothly
   - [ ] Each tab Card contains relevant configuration section
   - [ ] All form controls update configDraft state
   - [ ] Display config shows merged effective + draft values
   
3. **Model Configuration Tab:**
   - [ ] Model selector shows all AVAILABLE_MODELS with pricing info
   - [ ] Temperature slider works (0-1, step 0.05)
   - [ ] Max tokens input accepts valid range (1-4096)
   - [ ] Top P slider works (0-1, step 0.05)
   - [ ] Streaming toggle works
   - [ ] Cost estimation calculates correctly
   - [ ] Model capabilities display correctly
   
4. **Validation:**
   - [ ] Temperature validates 0-1 range
   - [ ] Max tokens validates 1-4096 range
   - [ ] Requests per minute validates >= 1
   - [ ] Max retries validates 0-10 range
   - [ ] Max delay >= base delay validated
   - [ ] All validation errors display clearly
   - [ ] Invalid configurations blocked from saving
   
5. **Save Functionality:**
   - [ ] Save button calls handleSave function
   - [ ] API request includes configName and updates
   - [ ] Success response clears draft and reloads config
   - [ ] Error response shows error status
   - [ ] Save status clears after 2-3 seconds
   
6. **Configuration Preview:**
   - [ ] Preview pane shows JSON of display config
   - [ ] Preview updates in real-time as changes made
   - [ ] Preview includes all configuration properties
   - [ ] Preview formatted with 2-space indentation
   - [ ] Scrollable for large configurations
   
7. **History Integration:**
   - [ ] History button present in header
   - [ ] Clicking History opens history modal (to be implemented)
   - [ ] History modal shows configuration change log
   - [ ] History modal allows rollback to previous versions
   
8. **UI/UX:**
   - [ ] Loading state shows spinner during initial load
   - [ ] Error state shows alert if configuration fails to load
   - [ ] All labels have descriptive help text
   - [ ] Consistent spacing using Tailwind utilities
   - [ ] Icons enhance visual hierarchy
   - [ ] Responsive layout works on all screen sizes

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
train-wireframe/src/components/views/AIConfigView.tsx (NEW)
src/lib/types/ai-config.ts (EXISTING - from Prompt 2)
src/lib/services/ai-config-service.ts (EXISTING - from Prompt 2)
src/app/api/ai-configuration/route.ts (EXISTING - from Prompt 2)
```

**Component Architecture:**
- Single comprehensive AIConfigView component
- Local state for configuration management (not Zustand)
- Tab-based organization with Shadcn/UI Tabs
- Draft state pattern for unsaved changes
- Real-time validation feedback
- Save confirmation with visual feedback

**State Management:**
- effectiveConfig: Loaded from API (user + org + env + defaults merged)
- configDraft: Tracks unsaved changes (partial updates)
- displayConfig: Merge of effective + draft for real-time preview
- saveStatus: Tracks save operation state
- validationErrors: Array of validation error messages
- isLoading: Controls initial loading state

**Validation Strategy:**
- Client-side validation before save
- Inline validation for critical fields
- Validation error summary above tabs
- Server-side validation as backup
- Type-safe validation using TypeScript

**Error Handling:**
- Try-catch around API calls
- Error status shown in save indicator
- Validation errors displayed prominently
- Console logging for debugging
- User-friendly error messages

**Performance:**
- Configuration loaded once on mount
- Draft updates don't trigger API calls
- Save only when user explicitly clicks Save
- Optimized re-renders with proper React patterns
- JSON preview uses pre element for performance

**VALIDATION REQUIREMENTS:**

1. **Manual Testing:**
   - Open AI Config view → verify loads configuration
   - Change model → verify updates display config
   - Adjust temperature → verify slider and display update
   - Change multiple settings → verify all tracked in draft
   - Click Save → verify API call and success state
   - Set invalid value → verify validation error
   - Save with errors → verify save blocked
   
2. **Integration Testing:**
   - Save configuration → verify ai_configurations table updated
   - Reload page → verify saved configuration persists
   - Change configuration → verify change logged in audit trail
   - Test with no user config → verify falls back to defaults
   - Test validation → verify server rejects invalid configs
   
3. **Visual Testing:**
   - Verify tabs display correctly
   - Verify save status indicator visible
   - Verify preview pane updates in real-time
   - Verify error alerts display prominently
   - Verify responsive layout on mobile
   - Verify icons enhance UI clarity
   
4. **Functional Testing:**
   - Test all form controls update draft state
   - Test Save button enables/disables correctly
   - Test validation runs before save
   - Test successful save clears draft
   - Test error handling shows appropriate messages
   - Test History button opens modal (placeholder)

**DELIVERABLES:**

1. [ ] `train-wireframe/src/components/views/AIConfigView.tsx` - Complete AI Config View component
2. [ ] All 5 tabs implemented with configuration controls
3. [ ] Configuration preview pane functional
4. [ ] Save functionality working with validation
5. [ ] History button present (modal implementation separate)
6. [ ] Navigation integration (add route/link to AIConfigView)
7. [ ] All Shadcn/UI components properly imported
8. [ ] All validation working correctly
9. [ ] Manual testing completed with all scenarios passing
10. [ ] Integration testing with backend API completed

Implement this comprehensive AI Configuration Settings UI completely, ensuring all configuration parameters are accessible, all validation works correctly, and users can effectively manage their AI generation settings with confidence.


++++++++++++++++++


## Document Summary

This Part 3 document provides detailed execution instructions for **Prompts 5-6** of the Settings & Administration Module (E08):

**Prompt 5: Settings View UI Enhancement (T-3.1.0)**
- Comprehensive enhancement of existing SettingsView component
- Seven major preference sections: Theme & Display, Notifications, Default Filters, Export, Keyboard Shortcuts, Quality Thresholds, plus existing Retry Configuration
- Auto-save status indicator with visual feedback
- Reset functionality per section and global
- Complete integration with Zustand store and API routes
- Real-time validation with inline error display
- **Estimated Time**: 12-14 hours

**Prompt 6: AI Configuration Settings UI (T-3.2.0)**
- New AIConfigView component from scratch
- Tab-based organization: Model, Rate & Retry, Cost, API Keys, Timeouts
- Configuration preview pane showing effective merged settings
- Real-time validation before save
- Save status indicator with clear feedback
- History button for configuration change management
- Draft state pattern for unsaved changes
- **Estimated Time**: 10-12 hours

**Total Implementation Time**: 22-26 hours (3-4 days)

**Dependencies:**
- Prompts 1-4 must be completed first (Foundation and Change Management systems)
- Database migrations from main E08 document must be applied
- User preferences types and services from Prompt 1
- AI configuration types and services from Prompt 2
- Configuration change management from Prompt 4

**Integration Points:**
- Settings View integrates with user preferences service
- AI Config View integrates with AI configuration service
- Both views integrate with configuration audit trail
- History functionality leverages change management system
- Both provide comprehensive UIs for backend services

**Success Criteria:**
- All preference categories accessible and functional
- All AI configuration parameters configurable
- Real-time validation prevents invalid configurations
- Auto-save and manual save work correctly
- Visual feedback clear and helpful
- Reset functionality restores defaults safely
- Configuration preview accurate
- Change history accessible (via History button)

**Next Steps:**
- Prompt 7: Database Health Dashboard UI (T-3.3.0)
- Prompt 8: Integration, Testing & Deployment (T-4.1.0, T-5.1.0, T-6.1.0)

---

**Document Status**: Complete (Prompts 5-6 Detailed)  
**Output Location**: `pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E08-part3.md`  
**Ready for**: Implementation by development team using Claude-4.5-sonnet
