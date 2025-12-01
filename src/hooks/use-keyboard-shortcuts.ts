'use client';

import { useEffect, useCallback } from 'react';
import { useConversationStore } from '@/stores/conversation-store';
import { useFilteredConversations } from './use-filtered-conversations';

export function useKeyboardShortcuts() {
  const selectedIds = useConversationStore((state) => state.selectedConversationIds);
  const selectAllConversations = useConversationStore((state) => state.selectAllConversations);
  const clearSelection = useConversationStore((state) => state.clearSelection);
  const openExportModal = useConversationStore((state) => state.openExportModal);
  const setCurrentView = useConversationStore((state) => state.setCurrentView);
  
  const { conversations } = useFilteredConversations();
  
  const isInputFocused = useCallback(() => {
    const activeElement = document.activeElement;
    return (
      activeElement?.tagName === 'INPUT' ||
      activeElement?.tagName === 'TEXTAREA' ||
      activeElement?.getAttribute('contenteditable') === 'true'
    );
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (isInputFocused()) {
        return;
      }
      
      const { key, ctrlKey, metaKey, shiftKey } = event;
      const modKey = ctrlKey || metaKey;
      
      // Cmd/Ctrl+A: Select all conversations
      if (modKey && key === 'a') {
        event.preventDefault();
        selectAllConversations(conversations.map(c => c.conversationId));
        return;
      }
      
      // Cmd/Ctrl+D: Deselect all
      if (modKey && key === 'd') {
        event.preventDefault();
        clearSelection();
        return;
      }
      
      // Cmd/Ctrl+E: Open export modal
      if (modKey && key === 'e') {
        event.preventDefault();
        if (selectedIds.length > 0) {
          openExportModal();
        }
        return;
      }
      
      // ESC: Clear selection and close modals
      if (key === 'Escape') {
        clearSelection();
        return;
      }
      
      // ?: Show keyboard shortcuts help
      if (key === '?' && !modKey && !shiftKey) {
        event.preventDefault();
        // Trigger custom event that KeyboardShortcutsHelp will listen to
        window.dispatchEvent(new CustomEvent('show-keyboard-shortcuts'));
        return;
      }
      
      // 1-5: Quick filter by tier/status
      if (!modKey && ['1', '2', '3', '4', '5'].includes(key)) {
        event.preventDefault();
        const viewMap: Record<string, any> = {
          '1': 'dashboard',
          '2': 'templates',
          '3': 'scenarios',
          '4': 'edge-cases',
          '5': 'review-queue',
        };
        setCurrentView(viewMap[key]);
        return;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [conversations, selectedIds, isInputFocused, selectAllConversations, clearSelection, openExportModal, setCurrentView]);
}

