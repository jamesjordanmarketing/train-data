/**
 * Component tests for RecoveryWizard
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecoveryWizard } from '@/components/recovery/RecoveryWizard';
import * as recoveryDetection from '@/lib/recovery/detection';
import * as recoveryExecutor from '@/lib/recovery/executor';
import {
  RecoverableItem,
  RecoverableItemType,
  RecoveryStatus,
} from '@/lib/recovery/types';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/lib/recovery/detection');
vi.mock('@/lib/recovery/executor');
vi.mock('@/lib/errors/error-logger');
vi.mock('sonner');

describe('RecoveryWizard', () => {
  const mockItems: RecoverableItem[] = [
    {
      id: 'draft-1',
      type: RecoverableItemType.DRAFT_CONVERSATION,
      timestamp: new Date().toISOString(),
      description: 'Draft: "Test Draft" (5 turns)',
      priority: 80,
      data: {
        draftId: 'draft-1',
        topic: 'Test Draft',
        turns: 5,
        lastSaved: new Date().toISOString(),
      },
      status: RecoveryStatus.PENDING,
    },
    {
      id: 'batch-1',
      type: RecoverableItemType.INCOMPLETE_BATCH,
      timestamp: new Date().toISOString(),
      description: 'Batch job: 50% complete (50 done, 5 failed)',
      priority: 70,
      data: {
        jobId: 'batch-1',
        totalItems: 100,
        completedItems: 50,
        failedItems: 5,
        progressPercentage: 50,
        lastCheckpoint: new Date().toISOString(),
      },
      status: RecoveryStatus.PENDING,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not open wizard when no recoverable items are found', async () => {
    vi.mocked(recoveryDetection.detectRecoverableData).mockResolvedValue([]);

    render(<RecoveryWizard autoOpen={true} />);

    await waitFor(() => {
      expect(screen.queryByText('Data Recovery Available')).not.toBeInTheDocument();
    });
  });

  it('should automatically open wizard when items are detected', async () => {
    vi.mocked(recoveryDetection.detectRecoverableData).mockResolvedValue(mockItems);

    render(<RecoveryWizard autoOpen={true} />);

    await waitFor(() => {
      expect(screen.getByText('Data Recovery Available')).toBeInTheDocument();
    });

    expect(screen.getByText(/Test Draft/)).toBeInTheDocument();
    expect(screen.getByText(/Batch job/)).toBeInTheDocument();
  });

  it('should not auto-open wizard when autoOpen is false', async () => {
    vi.mocked(recoveryDetection.detectRecoverableData).mockResolvedValue(mockItems);

    render(<RecoveryWizard autoOpen={false} />);

    await waitFor(() => {
      expect(recoveryDetection.detectRecoverableData).toHaveBeenCalled();
    });

    expect(screen.queryByText('Data Recovery Available')).not.toBeInTheDocument();
  });

  it('should pre-select all items by default', async () => {
    vi.mocked(recoveryDetection.detectRecoverableData).mockResolvedValue(mockItems);

    render(<RecoveryWizard autoOpen={true} />);

    await waitFor(() => {
      expect(screen.getByText('Data Recovery Available')).toBeInTheDocument();
    });

    expect(screen.getByText('2 of 2 selected')).toBeInTheDocument();
  });

  it('should allow toggling item selection', async () => {
    const user = userEvent.setup();
    vi.mocked(recoveryDetection.detectRecoverableData).mockResolvedValue(mockItems);

    render(<RecoveryWizard autoOpen={true} />);

    await waitFor(() => {
      expect(screen.getByText('Data Recovery Available')).toBeInTheDocument();
    });

    // Find and click the first item card
    const firstItemCard = screen.getByText(/Test Draft/).closest('.cursor-pointer');
    if (firstItemCard) {
      await user.click(firstItemCard);
    }

    await waitFor(() => {
      expect(screen.getByText('1 of 2 selected')).toBeInTheDocument();
    });
  });

  it('should allow selecting all items', async () => {
    const user = userEvent.setup();
    vi.mocked(recoveryDetection.detectRecoverableData).mockResolvedValue(mockItems);

    render(<RecoveryWizard autoOpen={true} />);

    await waitFor(() => {
      expect(screen.getByText('Data Recovery Available')).toBeInTheDocument();
    });

    // Deselect all first
    const deselectAllButton = screen.getByText('Deselect All');
    await user.click(deselectAllButton);

    await waitFor(() => {
      expect(screen.getByText('0 of 2 selected')).toBeInTheDocument();
    });

    // Then select all
    const selectAllButton = screen.getByText('Select All');
    await user.click(selectAllButton);

    await waitFor(() => {
      expect(screen.getByText('2 of 2 selected')).toBeInTheDocument();
    });
  });

  it('should execute recovery when Recover button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(recoveryDetection.detectRecoverableData).mockResolvedValue(mockItems);
    vi.mocked(recoveryExecutor.recoverItems).mockResolvedValue({
      totalItems: 2,
      successCount: 2,
      failedCount: 0,
      skippedCount: 0,
      results: [
        { itemId: 'draft-1', success: true },
        { itemId: 'batch-1', success: true },
      ],
      timestamp: new Date().toISOString(),
    });

    render(<RecoveryWizard autoOpen={true} />);

    await waitFor(() => {
      expect(screen.getByText('Data Recovery Available')).toBeInTheDocument();
    });

    const recoverButton = screen.getByRole('button', { name: /Recover Selected/ });
    await user.click(recoverButton);

    await waitFor(() => {
      expect(screen.getByText('Recovering Your Data')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Recovery Complete')).toBeInTheDocument();
    });

    expect(screen.getByText('Recovery Complete!')).toBeInTheDocument();
  });

  it('should show recovery progress during execution', async () => {
    const user = userEvent.setup();
    vi.mocked(recoveryDetection.detectRecoverableData).mockResolvedValue(mockItems);
    
    let progressCallback: any;
    vi.mocked(recoveryExecutor.recoverItems).mockImplementation(async (items, onProgress) => {
      progressCallback = onProgress;
      
      // Simulate progress updates
      if (onProgress) {
        onProgress(items[0], 50);
        await new Promise(resolve => setTimeout(resolve, 100));
        onProgress(items[1], 100);
      }

      return {
        totalItems: 2,
        successCount: 2,
        failedCount: 0,
        skippedCount: 0,
        results: [
          { itemId: 'draft-1', success: true },
          { itemId: 'batch-1', success: true },
        ],
        timestamp: new Date().toISOString(),
      };
    });

    render(<RecoveryWizard autoOpen={true} />);

    await waitFor(() => {
      expect(screen.getByText('Data Recovery Available')).toBeInTheDocument();
    });

    const recoverButton = screen.getByRole('button', { name: /Recover Selected/ });
    await user.click(recoverButton);

    await waitFor(() => {
      expect(screen.getByText('Recovering Your Data')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Recovery Complete')).toBeInTheDocument();
    });
  });

  it('should handle recovery failure gracefully', async () => {
    const user = userEvent.setup();
    vi.mocked(recoveryDetection.detectRecoverableData).mockResolvedValue(mockItems);
    vi.mocked(recoveryExecutor.recoverItems).mockResolvedValue({
      totalItems: 2,
      successCount: 1,
      failedCount: 1,
      skippedCount: 0,
      results: [
        { itemId: 'draft-1', success: true },
        { itemId: 'batch-1', success: false, error: 'Recovery failed' },
      ],
      timestamp: new Date().toISOString(),
    });

    render(<RecoveryWizard autoOpen={true} />);

    await waitFor(() => {
      expect(screen.getByText('Data Recovery Available')).toBeInTheDocument();
    });

    const recoverButton = screen.getByRole('button', { name: /Recover Selected/ });
    await user.click(recoverButton);

    await waitFor(() => {
      expect(screen.getByText('Partial Recovery')).toBeInTheDocument();
    });

    expect(screen.getByText(/1 of 2 items recovered/)).toBeInTheDocument();
  });

  it('should allow skipping recovery', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    vi.mocked(recoveryDetection.detectRecoverableData).mockResolvedValue(mockItems);

    render(<RecoveryWizard autoOpen={true} onComplete={onComplete} />);

    await waitFor(() => {
      expect(screen.getByText('Data Recovery Available')).toBeInTheDocument();
    });

    const skipButton = screen.getByRole('button', { name: /Skip Recovery/ });
    await user.click(skipButton);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should show warning when trying to recover with no items selected', async () => {
    const user = userEvent.setup();
    vi.mocked(recoveryDetection.detectRecoverableData).mockResolvedValue(mockItems);

    render(<RecoveryWizard autoOpen={true} />);

    await waitFor(() => {
      expect(screen.getByText('Data Recovery Available')).toBeInTheDocument();
    });

    // Deselect all items
    const deselectAllButton = screen.getByText('Deselect All');
    await user.click(deselectAllButton);

    await waitFor(() => {
      expect(screen.getByText('0 of 2 selected')).toBeInTheDocument();
    });

    // Try to recover
    const recoverButton = screen.getByRole('button', { name: /Recover Selected/ });
    expect(recoverButton).toBeDisabled();
  });

  it('should call onComplete callback when wizard closes', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    vi.mocked(recoveryDetection.detectRecoverableData).mockResolvedValue(mockItems);
    vi.mocked(recoveryExecutor.recoverItems).mockResolvedValue({
      totalItems: 2,
      successCount: 2,
      failedCount: 0,
      skippedCount: 0,
      results: [
        { itemId: 'draft-1', success: true },
        { itemId: 'batch-1', success: true },
      ],
      timestamp: new Date().toISOString(),
    });

    render(<RecoveryWizard autoOpen={true} onComplete={onComplete} />);

    await waitFor(() => {
      expect(screen.getByText('Data Recovery Available')).toBeInTheDocument();
    });

    const recoverButton = screen.getByRole('button', { name: /Recover Selected/ });
    await user.click(recoverButton);

    await waitFor(() => {
      expect(screen.getByText('Recovery Complete')).toBeInTheDocument();
    });

    const doneButton = screen.getByRole('button', { name: /Done/ });
    await user.click(doneButton);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should handle detection errors gracefully', async () => {
    vi.mocked(recoveryDetection.detectRecoverableData).mockRejectedValue(new Error('Detection failed'));

    render(<RecoveryWizard autoOpen={true} />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to detect recoverable data');
    });
  });

  it('should handle recovery execution errors gracefully', async () => {
    const user = userEvent.setup();
    vi.mocked(recoveryDetection.detectRecoverableData).mockResolvedValue(mockItems);
    vi.mocked(recoveryExecutor.recoverItems).mockRejectedValue(new Error('Recovery failed'));

    render(<RecoveryWizard autoOpen={true} />);

    await waitFor(() => {
      expect(screen.getByText('Data Recovery Available')).toBeInTheDocument();
    });

    const recoverButton = screen.getByRole('button', { name: /Recover Selected/ });
    await user.click(recoverButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Recovery process failed');
    });

    // Should return to selection step
    await waitFor(() => {
      expect(screen.getByText('Data Recovery Available')).toBeInTheDocument();
    });
  });
});

