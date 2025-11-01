# Settings View - Quick Reference Guide

## Overview
Complete user preferences UI with 8 sections, 40+ controls, auto-save, and validation.

**File**: `train-wireframe/src/components/views/SettingsView.tsx`  
**Lines**: 1,407 lines  
**Status**: ✅ Production Ready

---

## Component Structure

```
SettingsView
├── Header with Save Status Indicator
├── Global Reset All Card
└── Main Settings Card
    ├── Theme & Display (6 preferences)
    ├── Notifications (8 preferences)
    ├── Default Filters (4 filter types)
    ├── Export Preferences (7 preferences)
    ├── Keyboard Shortcuts (7 shortcuts)
    ├── Quality Thresholds (3 thresholds)
    └── Retry Configuration (5 settings)
```

---

## Key Functions

### handlePreferenceUpdate()
```typescript
const handlePreferenceUpdate = async (updates: Partial<typeof preferences>) => {
  setSaveStatus('saving');
  try {
    await updatePreferences(updates);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  } catch (error) {
    setSaveStatus('error');
    setTimeout(() => setSaveStatus('idle'), 3000);
  }
};
```

**Usage**: Call for ALL preference updates (replaces direct `updatePreferences`)  
**Features**: Auto-save feedback, error handling, auto-dismiss

### getShortcutDescription()
```typescript
function getShortcutDescription(action: string): string {
  const descriptions: Record<string, string> = {
    openSearch: 'Open global search',
    generateAll: 'Start batch generation',
    // ... more shortcuts
  };
  return descriptions[action] || '';
}
```

**Usage**: Get human-readable descriptions for keyboard shortcuts  
**Extend**: Add new shortcuts to descriptions object

---

## Preference Sections

### 1. Theme & Display
**Preferences**:
- `theme`: 'light' | 'dark' | 'system'
- `sidebarCollapsed`: boolean
- `tableDensity`: 'compact' | 'comfortable' | 'spacious'
- `rowsPerPage`: 10 | 25 | 50 | 100
- `enableAnimations`: boolean

**Components**: Select, Switch, RadioGroup

### 2. Notifications
**Preferences**:
- `notifications.toast`: boolean
- `notifications.email`: boolean
- `notifications.inApp`: boolean
- `notifications.frequency`: 'immediate' | 'daily' | 'weekly'
- `notifications.categories.generationComplete`: boolean
- `notifications.categories.approvalRequired`: boolean
- `notifications.categories.errors`: boolean
- `notifications.categories.systemAlerts`: boolean

**Components**: Switch, Select, Checkbox

### 3. Default Filters
**Preferences**:
- `defaultFilters.autoApply`: boolean
- `defaultFilters.tier`: string[] | null
- `defaultFilters.status`: string[] | null
- `defaultFilters.qualityRange`: [number, number]

**Components**: Switch, Checkbox, Slider  
**Validation**: Quality range min ≤ max

### 4. Export Preferences
**Preferences**:
- `exportPreferences.defaultFormat`: 'json' | 'jsonl' | 'csv' | 'markdown'
- `exportPreferences.includeMetadata`: boolean
- `exportPreferences.includeQualityScores`: boolean
- `exportPreferences.includeTimestamps`: boolean
- `exportPreferences.includeApprovalHistory`: boolean
- `exportPreferences.autoCompression`: boolean
- `exportPreferences.autoCompressionThreshold`: number (1-10000)

**Components**: Select, Switch, Input  
**Conditional**: Threshold input only shown if autoCompression enabled

### 5. Keyboard Shortcuts
**Preferences**:
- `keyboardShortcuts.enabled`: boolean
- `keyboardShortcuts.customBindings`: Record<string, string>

**Default Bindings**:
- openSearch: Ctrl+K
- generateAll: Ctrl+G
- export: Ctrl+E
- approve: A
- reject: R
- nextItem: ArrowRight
- previousItem: ArrowLeft

**Components**: Switch, Button (edit)  
**Note**: Edit functionality UI present, dialog not yet implemented

### 6. Quality Thresholds
**Preferences**:
- `qualityThresholds.autoApproval`: number (0-10)
- `qualityThresholds.flagging`: number (0-10)
- `qualityThresholds.minimumAcceptable`: number (0-10)

**Components**: Slider, Badge  
**Validation**: autoApproval ≥ flagging ≥ minimumAcceptable  
**Visual**: Color gradient with threshold markers

### 7. Retry Configuration
**Preferences**:
- `retryConfig.strategy`: 'exponential' | 'linear' | 'fixed'
- `retryConfig.maxAttempts`: number (1-10)
- `retryConfig.baseDelayMs`: number (100-10000)
- `retryConfig.maxDelayMs`: number (1000-300000)
- `retryConfig.continueOnError`: boolean

**Components**: Select, Input, Switch  
**Features**: Test simulation modal

---

## Common Patterns

### Update Simple Preference
```typescript
handlePreferenceUpdate({ enableAnimations: checked })
```

### Update Nested Preference
```typescript
handlePreferenceUpdate({ 
  notifications: { 
    ...preferences.notifications, 
    toast: checked 
  } 
})
```

### Update Deeply Nested Preference
```typescript
handlePreferenceUpdate({ 
  notifications: { 
    ...preferences.notifications, 
    categories: {
      ...preferences.notifications.categories,
      errors: !!checked
    }
  } 
})
```

### Reset Section to Defaults
```typescript
handlePreferenceUpdate({
  theme: DEFAULT_USER_PREFERENCES.theme,
  sidebarCollapsed: DEFAULT_USER_PREFERENCES.sidebarCollapsed,
  // ... other section preferences
})
```

### Multi-Select Checkbox Logic
```typescript
const currentItems = preferences.defaultFilters.tier || [];
const newItems = checked
  ? [...currentItems, 'template']
  : currentItems.filter(t => t !== 'template');

handlePreferenceUpdate({ 
  defaultFilters: { 
    ...preferences.defaultFilters, 
    tier: newItems.length > 0 ? newItems : null 
  } 
});
```

---

## Validation Examples

### Quality Threshold Validation
```typescript
const errors = validateUserPreferences({ 
  qualityThresholds: preferences.qualityThresholds 
});

const thresholdErrors = errors.filter(e => 
  e.includes('autoApproval') || 
  e.includes('flagging') || 
  e.includes('minimumAcceptable')
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
```

### Quality Range Validation
```typescript
{preferences.defaultFilters.qualityRange[0] > preferences.defaultFilters.qualityRange[1] && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      Minimum quality score cannot be greater than maximum score
    </AlertDescription>
  </Alert>
)}
```

---

## State Variables

```typescript
const [showRetrySimulation, setShowRetrySimulation] = useState(false);
const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
const [saveMessage, setSaveMessage] = useState('');
const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
```

**Purpose**:
- `showRetrySimulation`: Controls retry simulation modal visibility
- `saveStatus`: Tracks current save operation state
- `saveMessage`: Text to display with save status
- `editingShortcut`: Currently editing shortcut (future use)

---

## Reset Patterns

### Individual Section Reset
```typescript
<Button
  variant="outline"
  size="sm"
  onClick={() => {
    handlePreferenceUpdate({
      theme: DEFAULT_USER_PREFERENCES.theme,
      sidebarCollapsed: DEFAULT_USER_PREFERENCES.sidebarCollapsed,
      // ... all section preferences
    });
  }}
>
  <RotateCcw className="w-4 h-4 mr-2" />
  Reset Display Settings
</Button>
```

### Global Reset
```typescript
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
```

---

## Styling Classes

### Section Structure
```jsx
<div className="border-t pt-6">
  <h3 className="text-lg font-semibold mb-4">Section Title</h3>
  <p className="text-sm text-gray-600 mb-4">Section description</p>
  
  <div className="space-y-6">
    {/* Section content */}
  </div>
  
  <div className="mt-6 flex justify-end">
    {/* Reset button */}
  </div>
</div>
```

### Form Control
```jsx
<div className="flex items-center justify-between">
  <div>
    <Label htmlFor="control-id">Control Label</Label>
    <p className="text-sm text-gray-500">Helper text</p>
  </div>
  <Switch id="control-id" checked={value} onCheckedChange={handler} />
</div>
```

### Info Alert
```jsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <h4 className="font-medium text-blue-900 mb-2">Title</h4>
  <ul className="text-sm text-blue-800 space-y-1">
    <li>• Item 1</li>
    <li>• Item 2</li>
  </ul>
</div>
```

---

## Integration Points

### Zustand Store
```typescript
import { useAppStore } from '../../stores/useAppStore';

const { preferences, updatePreferences } = useAppStore();
```

### Type System
```typescript
import { 
  DEFAULT_USER_PREFERENCES, 
  validateUserPreferences 
} from '../../lib/types/user-preferences';
```

### API Layer
- Updates debounced automatically (300ms)
- Optimistic updates for instant feedback
- Error handling with status feedback

---

## Adding New Preferences

### 1. Update Type Definition
```typescript
// train-wireframe/src/lib/types/user-preferences.ts
export interface UserPreferences {
  // ... existing preferences
  newPreference: string;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  // ... existing defaults
  newPreference: 'default_value',
};
```

### 2. Add UI Control
```typescript
<div className="border-t pt-6">
  <h3 className="text-lg font-semibold mb-4">New Section</h3>
  
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor="new-pref">New Preference</Label>
        <p className="text-sm text-gray-500">Description</p>
      </div>
      <Switch
        id="new-pref"
        checked={preferences.newPreference === 'value'}
        onCheckedChange={(checked) => 
          handlePreferenceUpdate({ newPreference: checked ? 'value' : 'default' })
        }
      />
    </div>
  </div>
  
  <div className="mt-6 flex justify-end">
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        handlePreferenceUpdate({
          newPreference: DEFAULT_USER_PREFERENCES.newPreference
        });
      }}
    >
      <RotateCcw className="w-4 h-4 mr-2" />
      Reset New Section
    </Button>
  </div>
</div>
```

### 3. Add Validation (if needed)
```typescript
// train-wireframe/src/lib/types/user-preferences.ts
export function validateUserPreferences(preferences: Partial<UserPreferences>): string[] {
  const errors: string[] = [];
  
  // ... existing validation
  
  if (preferences.newPreference && /* validation logic */) {
    errors.push('Validation error message');
  }
  
  return errors;
}
```

---

## Troubleshooting

### Save Status Not Showing
- Check `handlePreferenceUpdate` is being called (not `updatePreferences` directly)
- Verify `saveStatus` and `saveMessage` state variables exist
- Check save status indicator JSX is present in header

### Validation Not Working
- Ensure `validateUserPreferences` imported from types
- Check validation logic matches preference structure
- Verify validation errors are being rendered conditionally

### Reset Button Not Working
- Confirm `DEFAULT_USER_PREFERENCES` is imported
- Check correct preferences are being passed to `handlePreferenceUpdate`
- Verify preference keys match type definition exactly

### Nested Updates Not Saving
- Use spread operator for parent objects: `{ ...preferences.parent, field: value }`
- For deeply nested: spread all levels
- Check partial update logic in Zustand store

---

## Performance Considerations

1. **Debouncing**: Updates automatically debounced (300ms) by service layer
2. **Optimistic Updates**: UI updates immediately, API call async
3. **Conditional Rendering**: Use conditional display to reduce DOM nodes
4. **Memoization**: Consider `useMemo` for expensive computations (if added)

---

## Accessibility

- All form controls have associated `<Label>` elements
- Label `htmlFor` matches control `id`
- Keyboard navigation supported on all controls
- Color contrast meets WCAG standards
- Screen reader friendly with semantic HTML

---

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- CSS Grid and Flexbox support required
- No IE11 support (uses modern React features)

---

## Future Enhancements

1. **Shortcut Editor Dialog**: Allow custom key binding changes
2. **Theme Live Preview**: Apply theme changes without reload
3. **Preference Import/Export**: JSON backup/restore functionality
4. **Advanced Validation**: More real-time validation feedback
5. **Preference History**: Track and revert changes
6. **Profile Presets**: Save/load preference profiles

---

## Related Files

- Types: `train-wireframe/src/lib/types/user-preferences.ts`
- Store: `train-wireframe/src/stores/useAppStore.ts`
- Service: `train-wireframe/src/lib/services/user-preferences-service.ts`
- API: `train-wireframe/src/app/api/user-preferences/route.ts`

---

## Support

For issues or questions:
1. Check linting errors: `read_lints(['train-wireframe/src/components/views/SettingsView.tsx'])`
2. Review type definitions in `user-preferences.ts`
3. Test with default preferences: `DEFAULT_USER_PREFERENCES`
4. Check browser console for runtime errors

---

**Last Updated**: November 1, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅

