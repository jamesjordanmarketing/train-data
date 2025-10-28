import { Settings } from 'lucide-react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { useAppStore } from '../../stores/useAppStore';

export function SettingsView() {
  const { preferences, updatePreferences } = useAppStore();
  
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Settings</h1>
        <p className="text-gray-600">
          Configure your preferences and application settings
        </p>
      </div>
      
      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-lg mb-4">User Preferences</h3>
          
          <div className="space-y-4">
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
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="shortcuts">Keyboard Shortcuts</Label>
                <p className="text-sm text-gray-500">Enable keyboard shortcuts for navigation</p>
              </div>
              <Switch
                id="shortcuts"
                checked={preferences.keyboardShortcutsEnabled}
                onCheckedChange={(checked) => 
                  updatePreferences({ keyboardShortcutsEnabled: checked })
                }
              />
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-lg mb-4">Quality Thresholds</h3>
          <p className="text-sm text-gray-600">
            Minimum quality score for auto-approval and other thresholds coming soon.
          </p>
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-lg mb-4">Integration Setup</h3>
          <p className="text-sm text-gray-600">
            API keys, webhooks, and external service connections coming soon.
          </p>
        </div>
      </Card>
    </div>
  );
}
