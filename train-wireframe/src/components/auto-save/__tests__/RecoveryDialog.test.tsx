import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecoveryDialog } from '../RecoveryDialog';
import {
  checkForRecoverableDrafts,
  recoverDraft,
  discardDraft,
  detectConflict,
  RecoveryItem,
} from '../../../lib/auto-save/recovery';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('../../../lib/auto-save/recovery');
jest.mock('../../../lib/errors/error-logger');
jest.mock('sonner');

describe('RecoveryDialog', () => {
  const mockOnRecover = jest.fn();
  const mockOnDiscard = jest.fn();
  const mockGetServerData = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('initial state', () => {
    it('should not show dialog when no drafts exist', async () => {
      (checkForRecoverableDrafts as jest.Mock).mockResolvedValue([]);
      
      render(<RecoveryDialog />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Unsaved Changes Detected/i)).not.toBeInTheDocument();
      });
    });
    
    it('should show dialog when drafts exist', async () => {
      const mockDrafts: RecoveryItem[] = [
        {
          id: 'conversation_123',
          data: { content: 'test' },
          savedAt: new Date(),
          type: 'conversation',
          description: 'Conversation: Assistant (5 turns)',
        },
      ];
      
      (checkForRecoverableDrafts as jest.Mock).mockResolvedValue(mockDrafts);
      
      render(<RecoveryDialog />);
      
      await waitFor(() => {
        expect(screen.getByText(/Unsaved Changes Detected/i)).toBeInTheDocument();
      });
    });
  });
  
  describe('draft list display', () => {
    it('should display all recoverable drafts', async () => {
      const mockDrafts: RecoveryItem[] = [
        {
          id: 'conversation_123',
          data: { content: 'test1' },
          savedAt: new Date(),
          type: 'conversation',
          description: 'Conversation: Assistant (5 turns)',
        },
        {
          id: 'batch_456',
          data: { content: 'test2' },
          savedAt: new Date(),
          type: 'batch',
          description: 'Batch Job: 100 items (50 completed)',
        },
      ];
      
      (checkForRecoverableDrafts as jest.Mock).mockResolvedValue(mockDrafts);
      
      render(<RecoveryDialog />);
      
      await waitFor(() => {
        expect(screen.getByText(/Conversation: Assistant \(5 turns\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Batch Job: 100 items \(50 completed\)/i)).toBeInTheDocument();
      });
    });
    
    it('should show correct plural form for multiple drafts', async () => {
      const mockDrafts: RecoveryItem[] = [
        {
          id: 'conversation_123',
          data: {},
          savedAt: new Date(),
          type: 'conversation',
          description: 'Draft 1',
        },
        {
          id: 'conversation_456',
          data: {},
          savedAt: new Date(),
          type: 'conversation',
          description: 'Draft 2',
        },
      ];
      
      (checkForRecoverableDrafts as jest.Mock).mockResolvedValue(mockDrafts);
      
      render(<RecoveryDialog />);
      
      await waitFor(() => {
        expect(screen.getByText(/We found 2 drafts/i)).toBeInTheDocument();
      });
    });
  });
  
  describe('draft recovery', () => {
    it('should recover draft when Recover button is clicked', async () => {
      const mockDraft: RecoveryItem = {
        id: 'conversation_123',
        data: { content: 'test' },
        savedAt: new Date(),
        type: 'conversation',
        description: 'Test Conversation',
      };
      
      (checkForRecoverableDrafts as jest.Mock).mockResolvedValue([mockDraft]);
      (recoverDraft as jest.Mock).mockResolvedValue(mockDraft.data);
      (detectConflict as jest.Mock).mockResolvedValue(null);
      
      render(<RecoveryDialog onRecover={mockOnRecover} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Test Conversation/i)).toBeInTheDocument();
      });
      
      const recoverButton = screen.getByRole('button', { name: /Recover/i });
      fireEvent.click(recoverButton);
      
      await waitFor(() => {
        expect(recoverDraft).toHaveBeenCalledWith(mockDraft.id);
        expect(mockOnRecover).toHaveBeenCalledWith(mockDraft, mockDraft.data);
        expect(toast.success).toHaveBeenCalledWith(
          'Draft recovered successfully',
          expect.any(Object)
        );
      });
    });
    
    it('should close dialog when last draft is recovered', async () => {
      const mockDraft: RecoveryItem = {
        id: 'conversation_123',
        data: { content: 'test' },
        savedAt: new Date(),
        type: 'conversation',
        description: 'Test Conversation',
      };
      
      (checkForRecoverableDrafts as jest.Mock).mockResolvedValue([mockDraft]);
      (recoverDraft as jest.Mock).mockResolvedValue(mockDraft.data);
      (detectConflict as jest.Mock).mockResolvedValue(null);
      
      render(<RecoveryDialog onRecover={mockOnRecover} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Test Conversation/i)).toBeInTheDocument();
      });
      
      const recoverButton = screen.getByRole('button', { name: /Recover/i });
      fireEvent.click(recoverButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/Unsaved Changes Detected/i)).not.toBeInTheDocument();
      });
    });
    
    it('should show error toast when recovery fails', async () => {
      const mockDraft: RecoveryItem = {
        id: 'conversation_123',
        data: { content: 'test' },
        savedAt: new Date(),
        type: 'conversation',
        description: 'Test Conversation',
      };
      
      (checkForRecoverableDrafts as jest.Mock).mockResolvedValue([mockDraft]);
      (recoverDraft as jest.Mock).mockRejectedValue(new Error('Recovery failed'));
      
      render(<RecoveryDialog />);
      
      await waitFor(() => {
        expect(screen.getByText(/Test Conversation/i)).toBeInTheDocument();
      });
      
      const recoverButton = screen.getByRole('button', { name: /Recover/i });
      fireEvent.click(recoverButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to recover draft. Please try again.');
      });
    });
  });
  
  describe('draft discard', () => {
    it('should discard draft when Discard button is clicked', async () => {
      const mockDraft: RecoveryItem = {
        id: 'conversation_123',
        data: { content: 'test' },
        savedAt: new Date(),
        type: 'conversation',
        description: 'Test Conversation',
      };
      
      (checkForRecoverableDrafts as jest.Mock).mockResolvedValue([mockDraft]);
      (discardDraft as jest.Mock).mockResolvedValue(undefined);
      
      render(<RecoveryDialog onDiscard={mockOnDiscard} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Test Conversation/i)).toBeInTheDocument();
      });
      
      const discardButton = screen.getByRole('button', { name: /^Discard$/i });
      fireEvent.click(discardButton);
      
      await waitFor(() => {
        expect(discardDraft).toHaveBeenCalledWith(mockDraft.id);
        expect(mockOnDiscard).toHaveBeenCalledWith(mockDraft);
        expect(toast.success).toHaveBeenCalledWith('Draft discarded');
      });
    });
    
    it('should discard all drafts when Discard All is clicked', async () => {
      const mockDrafts: RecoveryItem[] = [
        {
          id: 'conversation_123',
          data: { content: 'test1' },
          savedAt: new Date(),
          type: 'conversation',
          description: 'Draft 1',
        },
        {
          id: 'conversation_456',
          data: { content: 'test2' },
          savedAt: new Date(),
          type: 'conversation',
          description: 'Draft 2',
        },
      ];
      
      (checkForRecoverableDrafts as jest.Mock).mockResolvedValue(mockDrafts);
      (discardDraft as jest.Mock).mockResolvedValue(undefined);
      
      render(<RecoveryDialog />);
      
      await waitFor(() => {
        expect(screen.getByText(/Draft 1/i)).toBeInTheDocument();
      });
      
      const discardAllButton = screen.getByRole('button', { name: /Discard All/i });
      fireEvent.click(discardAllButton);
      
      await waitFor(() => {
        expect(discardDraft).toHaveBeenCalledTimes(2);
      });
    });
  });
  
  describe('conflict resolution', () => {
    it('should show conflict UI when conflict is detected', async () => {
      const mockDraft: RecoveryItem = {
        id: 'conversation_123',
        data: { content: 'draft' },
        savedAt: new Date('2024-01-01T10:00:00Z'),
        type: 'conversation',
        description: 'Test Conversation',
      };
      
      const mockConflict = {
        draftData: { content: 'draft' },
        serverData: { content: 'server' },
        draftSavedAt: new Date('2024-01-01T10:00:00Z'),
        serverUpdatedAt: new Date('2024-01-01T11:00:00Z'),
      };
      
      (checkForRecoverableDrafts as jest.Mock).mockResolvedValue([mockDraft]);
      (detectConflict as jest.Mock).mockResolvedValue(mockConflict);
      mockGetServerData.mockResolvedValue({
        data: mockConflict.serverData,
        updatedAt: mockConflict.serverUpdatedAt,
      });
      
      render(<RecoveryDialog getServerData={mockGetServerData} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Test Conversation/i)).toBeInTheDocument();
      });
      
      const recoverButton = screen.getByRole('button', { name: /Recover/i });
      fireEvent.click(recoverButton);
      
      await waitFor(() => {
        expect(screen.getByText(/This draft conflicts with newer data/i)).toBeInTheDocument();
        expect(screen.getByText(/Your Draft/i)).toBeInTheDocument();
        expect(screen.getByText(/Server Version/i)).toBeInTheDocument();
      });
    });
    
    it('should resolve conflict when Use Draft is clicked', async () => {
      const mockDraft: RecoveryItem = {
        id: 'conversation_123',
        data: { content: 'draft' },
        savedAt: new Date('2024-01-01T10:00:00Z'),
        type: 'conversation',
        description: 'Test Conversation',
      };
      
      const mockConflict = {
        draftData: { content: 'draft' },
        serverData: { content: 'server' },
        draftSavedAt: new Date('2024-01-01T10:00:00Z'),
        serverUpdatedAt: new Date('2024-01-01T11:00:00Z'),
      };
      
      (checkForRecoverableDrafts as jest.Mock).mockResolvedValue([mockDraft]);
      (detectConflict as jest.Mock).mockResolvedValue(mockConflict);
      mockGetServerData.mockResolvedValue({
        data: mockConflict.serverData,
        updatedAt: mockConflict.serverUpdatedAt,
      });
      
      render(<RecoveryDialog onRecover={mockOnRecover} getServerData={mockGetServerData} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Test Conversation/i)).toBeInTheDocument();
      });
      
      const recoverButton = screen.getByRole('button', { name: /Recover/i });
      fireEvent.click(recoverButton);
      
      await waitFor(() => {
        expect(screen.getByText(/This draft conflicts/i)).toBeInTheDocument();
      });
      
      const useDraftButton = screen.getByRole('button', { name: /Use Draft/i });
      fireEvent.click(useDraftButton);
      
      await waitFor(() => {
        expect(mockOnRecover).toHaveBeenCalledWith(mockDraft, mockConflict.draftData);
        expect(toast.success).toHaveBeenCalledWith(
          'Conflict resolved',
          expect.objectContaining({ description: expect.stringContaining('draft') })
        );
      });
    });
  });
  
  describe('time formatting', () => {
    it('should format recent times correctly', async () => {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      
      const mockDraft: RecoveryItem = {
        id: 'conversation_123',
        data: { content: 'test' },
        savedAt: oneMinuteAgo,
        type: 'conversation',
        description: 'Test Conversation',
      };
      
      (checkForRecoverableDrafts as jest.Mock).mockResolvedValue([mockDraft]);
      
      render(<RecoveryDialog />);
      
      await waitFor(() => {
        expect(screen.getByText(/1 minutes ago/i)).toBeInTheDocument();
      });
    });
  });
  
  describe('Decide Later button', () => {
    it('should close dialog without recovering or discarding', async () => {
      const mockDraft: RecoveryItem = {
        id: 'conversation_123',
        data: { content: 'test' },
        savedAt: new Date(),
        type: 'conversation',
        description: 'Test Conversation',
      };
      
      (checkForRecoverableDrafts as jest.Mock).mockResolvedValue([mockDraft]);
      
      render(<RecoveryDialog />);
      
      await waitFor(() => {
        expect(screen.getByText(/Test Conversation/i)).toBeInTheDocument();
      });
      
      const decideLaterButton = screen.getByRole('button', { name: /Decide Later/i });
      fireEvent.click(decideLaterButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/Unsaved Changes Detected/i)).not.toBeInTheDocument();
      });
      
      expect(recoverDraft).not.toHaveBeenCalled();
      expect(discardDraft).not.toHaveBeenCalled();
    });
  });
});

