'use client';

import { useEffect, useState, useCallback } from 'react';
import { Conversation } from '@/lib/types/conversations';
import { useConversationStore } from '@/stores/conversation-store';

export function useTableKeyboardNavigation(conversations: Conversation[]) {
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);
  const toggleSelection = useConversationStore((state) => state.toggleConversationSelection);
  const openConversationDetail = useConversationStore((state) => state.openConversationDetail);
  
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
      // Don't navigate if typing in input
      if (isInputFocused()) {
        return;
      }
      
      const { key } = event;
      
      // Arrow Up: Move focus up
      if (key === 'ArrowUp') {
        event.preventDefault();
        setFocusedRowIndex((current) => {
          if (current <= 0) return 0;
          return current - 1;
        });
        return;
      }
      
      // Arrow Down: Move focus down
      if (key === 'ArrowDown') {
        event.preventDefault();
        setFocusedRowIndex((current) => {
          if (current >= conversations.length - 1) return conversations.length - 1;
          return current + 1;
        });
        return;
      }
      
      // Space: Toggle selection of focused row
      if (key === ' ' && focusedRowIndex >= 0) {
        event.preventDefault();
        const conversation = conversations[focusedRowIndex];
        if (conversation) {
          toggleSelection(conversation.id);
        }
        return;
      }
      
      // Enter: Open focused row
      if (key === 'Enter' && focusedRowIndex >= 0) {
        event.preventDefault();
        const conversation = conversations[focusedRowIndex];
        if (conversation) {
          openConversationDetail(conversation.id);
        }
        return;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [conversations, focusedRowIndex, isInputFocused, toggleSelection, openConversationDetail]);
  
  // Apply focus styling to focused row
  useEffect(() => {
    if (focusedRowIndex >= 0) {
      const row = document.querySelector(`[data-row-index="${focusedRowIndex}"]`);
      if (row) {
        (row as HTMLElement).focus();
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedRowIndex]);
  
  return {
    focusedRowIndex,
    setFocusedRowIndex
  };
}

