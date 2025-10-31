'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const activeElement = document.activeElement;
        const isInputFocused = activeElement?.tagName === 'INPUT' || 
                              activeElement?.tagName === 'TEXTAREA';
        
        if (!isInputFocused) {
          e.preventDefault();
          setOpen(true);
        }
      }
    };
    
    const handleCustomEvent = () => {
      setOpen(true);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('show-keyboard-shortcuts', handleCustomEvent);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('show-keyboard-shortcuts', handleCustomEvent);
    };
  }, []);
  
  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: ['↑', '↓'], description: 'Navigate table rows' },
        { keys: ['Enter'], description: 'Open conversation details' },
        { keys: ['1-5'], description: 'Switch between views' },
        { keys: ['ESC'], description: 'Close modal / Clear selection' },
      ]
    },
    {
      category: 'Selection',
      items: [
        { keys: ['Space'], description: 'Toggle row selection' },
        { keys: ['Cmd', 'A'], description: 'Select all conversations' },
        { keys: ['Cmd', 'D'], description: 'Deselect all' },
      ]
    },
    {
      category: 'Actions',
      items: [
        { keys: ['Cmd', 'E'], description: 'Export selected conversations' },
        { keys: ['?'], description: 'Show keyboard shortcuts' },
      ]
    },
    {
      category: 'Modal Navigation',
      items: [
        { keys: ['←', '→'], description: 'Previous/Next conversation' },
        { keys: ['ESC'], description: 'Close modal' },
      ]
    }
  ];
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Boost your productivity with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="text-sm font-semibold mb-3">{category.category}</h3>
              <div className="space-y-2">
                {category.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <Badge variant="secondary" className="font-mono text-xs px-2 py-1">
                            {key}
                          </Badge>
                          {keyIndex < item.keys.length - 1 && (
                            <span className="text-xs text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          Press <Badge variant="secondary" className="font-mono mx-1">?</Badge> anytime to open this dialog
        </div>
      </DialogContent>
    </Dialog>
  );
}

