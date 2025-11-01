import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutRowProps {
  shortcut: string;
  description: string;
  category?: string;
}

function ShortcutRow({ shortcut, description }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700">{description}</span>
      <kbd className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded text-sm font-mono font-semibold text-gray-800 shadow-sm">
        {shortcut}
      </kbd>
    </div>
  );
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-blue-600" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Use these keyboard shortcuts to review conversations faster
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Review Actions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Review Actions</h3>
            <div className="space-y-1">
              <ShortcutRow shortcut="A" description="Approve conversation" />
              <ShortcutRow shortcut="R" description="Reject conversation" />
              <ShortcutRow shortcut="C" description="Request changes" />
            </div>
          </div>

          <Separator />

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Navigation</h3>
            <div className="space-y-1">
              <ShortcutRow shortcut="N" description="Next conversation" />
              <ShortcutRow shortcut="P" description="Previous conversation" />
              <ShortcutRow shortcut="ESC" description="Close modal" />
            </div>
          </div>

          <Separator />

          {/* Help */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Help</h3>
            <div className="space-y-1">
              <ShortcutRow shortcut="?" description="Show this help dialog" />
            </div>
          </div>

          {/* Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Keyboard shortcuts are disabled when typing in input fields.
              Rejection and change requests require comments, so shortcuts will prompt you to provide them.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

