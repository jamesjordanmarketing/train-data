/**
 * ConversationTable Component Tests
 * 
 * Tests for conversation table with sorting, filtering, and bulk actions
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConversationTable } from '../dashboard/ConversationTable';
import type { Conversation } from '../../lib/types';

// Mock child components
jest.mock('../ui/table', () => ({
  Table: ({ children, ...props }: any) => <table {...props}>{children}</table>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableHead: ({ children, ...props }: any) => <th {...props}>{children}</th>,
  TableRow: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  TableCell: ({ children, ...props }: any) => <td {...props}>{children}</td>,
}));

jest.mock('../ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  ),
}));

jest.mock('../ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-variant={variant}>{children}</span>
  ),
}));

describe('ConversationTable', () => {
  const mockConversations: Conversation[] = [
    {
      id: 'conv-1',
      title: 'Conversation 1',
      persona: 'Anxious Investor',
      emotion: 'Worried',
      tier: 'template',
      status: 'approved',
      qualityScore: 85,
      turnCount: 4,
      totalTokens: 500,
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
      createdBy: 'user-1',
      category: ['finance'],
      parameters: {},
      reviewHistory: [],
    },
    {
      id: 'conv-2',
      title: 'Conversation 2',
      persona: 'Confident CEO',
      emotion: 'Optimistic',
      tier: 'scenario',
      status: 'pending_review',
      qualityScore: 72,
      turnCount: 6,
      totalTokens: 800,
      createdAt: '2025-01-16T11:00:00Z',
      updatedAt: '2025-01-16T11:00:00Z',
      createdBy: 'user-2',
      category: ['business'],
      parameters: {},
      reviewHistory: [],
    },
  ];

  const mockOnSelectionChange = jest.fn();
  const mockOnBulkAction = jest.fn();
  const mockOnSort = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all conversations', () => {
      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText('Conversation 1')).toBeInTheDocument();
      expect(screen.getByText('Conversation 2')).toBeInTheDocument();
    });

    it('should display conversation details correctly', () => {
      render(
        <ConversationTable
          conversations={[mockConversations[0]]}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText('Anxious Investor')).toBeInTheDocument();
      expect(screen.getByText('Worried')).toBeInTheDocument();
      expect(screen.getByText('template')).toBeInTheDocument();
      expect(screen.getByText('approved')).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument();
    });

    it('should show empty state when no conversations', () => {
      render(
        <ConversationTable
          conversations={[]}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText(/no conversations/i)).toBeInTheDocument();
    });

    it('should display loading state', () => {
      render(
        <ConversationTable
          conversations={[]}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
          isLoading={true}
        />
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should allow selecting individual conversations', () => {
      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      // First checkbox is "select all", skip it
      fireEvent.click(checkboxes[1]);

      expect(mockOnSelectionChange).toHaveBeenCalledWith(['conv-1']);
    });

    it('should allow selecting all conversations', () => {
      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);

      expect(mockOnSelectionChange).toHaveBeenCalledWith(['conv-1', 'conv-2']);
    });

    it('should allow deselecting all', () => {
      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={['conv-1', 'conv-2']}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);

      expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
    });

    it('should show selected count', () => {
      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={['conv-1']}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
    });

    it('should handle partial selection state', () => {
      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={['conv-1']}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement;
      // Checkbox should be in indeterminate state
      expect(selectAllCheckbox.indeterminate || selectAllCheckbox.checked).toBeTruthy();
    });
  });

  describe('Sorting', () => {
    it('should sort by quality score', () => {
      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
          onSort={mockOnSort}
        />
      );

      const qualityHeader = screen.getByText(/quality/i);
      fireEvent.click(qualityHeader);

      expect(mockOnSort).toHaveBeenCalledWith('qualityScore', 'desc');
    });

    it('should toggle sort direction', () => {
      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
          onSort={mockOnSort}
          sortBy="qualityScore"
          sortDirection="desc"
        />
      );

      const qualityHeader = screen.getByText(/quality/i);
      fireEvent.click(qualityHeader);

      expect(mockOnSort).toHaveBeenCalledWith('qualityScore', 'asc');
    });

    it('should display sort indicator', () => {
      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
          sortBy="qualityScore"
          sortDirection="desc"
        />
      );

      expect(screen.getByText(/↓/)).toBeInTheDocument();
    });
  });

  describe('Row Actions', () => {
    it('should handle row click to view details', () => {
      const mockOnRowClick = jest.fn();

      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
          onRowClick={mockOnRowClick}
        />
      );

      const firstRow = screen.getByText('Conversation 1').closest('tr');
      if (firstRow) fireEvent.click(firstRow);

      expect(mockOnRowClick).toHaveBeenCalledWith('conv-1');
    });

    it('should show action menu on hover', async () => {
      const user = userEvent.setup();

      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const firstRow = screen.getByText('Conversation 1').closest('tr');
      if (firstRow) {
        await user.hover(firstRow);
        expect(screen.getByLabelText(/actions/i)).toBeInTheDocument();
      }
    });
  });

  describe('Bulk Actions', () => {
    it('should show bulk action bar when items selected', () => {
      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={['conv-1']}
          onSelectionChange={mockOnSelectionChange}
          onBulkAction={mockOnBulkAction}
        />
      );

      expect(screen.getByText(/bulk actions/i)).toBeInTheDocument();
    });

    it('should perform bulk approve action', () => {
      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={['conv-1', 'conv-2']}
          onSelectionChange={mockOnSelectionChange}
          onBulkAction={mockOnBulkAction}
        />
      );

      const approveButton = screen.getByText(/approve/i);
      fireEvent.click(approveButton);

      expect(mockOnBulkAction).toHaveBeenCalledWith('approve', ['conv-1', 'conv-2']);
    });

    it('should perform bulk reject action', () => {
      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={['conv-1']}
          onSelectionChange={mockOnSelectionChange}
          onBulkAction={mockOnBulkAction}
        />
      );

      const rejectButton = screen.getByText(/reject/i);
      fireEvent.click(rejectButton);

      expect(mockOnBulkAction).toHaveBeenCalledWith('reject', ['conv-1']);
    });

    it('should confirm before bulk delete', async () => {
      window.confirm = jest.fn(() => true);

      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={['conv-1']}
          onSelectionChange={mockOnSelectionChange}
          onBulkAction={mockOnBulkAction}
        />
      );

      const deleteButton = screen.getByText(/delete/i);
      fireEvent.click(deleteButton);

      expect(window.confirm).toHaveBeenCalled();
      expect(mockOnBulkAction).toHaveBeenCalledWith('delete', ['conv-1']);
    });
  });

  describe('Filtering', () => {
    it('should filter by tier', () => {
      const mockOnFilter = jest.fn();

      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
          onFilter={mockOnFilter}
        />
      );

      const tierFilter = screen.getByLabelText(/tier/i);
      fireEvent.change(tierFilter, { target: { value: 'template' } });

      expect(mockOnFilter).toHaveBeenCalledWith('tier', 'template');
    });

    it('should filter by status', () => {
      const mockOnFilter = jest.fn();

      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
          onFilter={mockOnFilter}
        />
      );

      const statusFilter = screen.getByLabelText(/status/i);
      fireEvent.change(statusFilter, { target: { value: 'approved' } });

      expect(mockOnFilter).toHaveBeenCalledWith('status', 'approved');
    });
  });

  describe('Quality Score Display', () => {
    it('should show quality score with color coding', () => {
      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const highScore = screen.getByText('85');
      const mediumScore = screen.getByText('72');

      expect(highScore).toHaveClass(/high|success|green/i);
      expect(mediumScore).toHaveClass(/medium|warning|yellow/i);
    });

    it('should show quality score badge for low scores', () => {
      const lowScoreConv = {
        ...mockConversations[0],
        qualityScore: 45,
      };

      render(
        <ConversationTable
          conversations={[lowScoreConv]}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const lowScore = screen.getByText('45');
      expect(lowScore).toHaveClass(/low|danger|red/i);
    });
  });

  describe('Pagination Info', () => {
    it('should display pagination information', () => {
      render(
        <ConversationTable
          conversations={mockConversations}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
          totalCount={100}
          page={1}
          pageSize={20}
        />
      );

      expect(screen.getByText(/1-20 of 100/i)).toBeInTheDocument();
    });
  });
});

