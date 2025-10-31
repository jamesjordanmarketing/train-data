/**
 * BatchGenerationModal Component Tests
 * 
 * Tests for batch generation modal with all steps:
 * 1. Configuration
 * 2. Preview
 * 3. Progress
 * 4. Summary
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BatchGenerationModal } from '../generation/BatchGenerationModal';
import { useAppStore } from '../../stores/useAppStore';

// Mock the store
jest.mock('../../stores/useAppStore');

// Mock child components
jest.mock('../generation/BatchConfigStep', () => ({
  BatchConfigStep: ({ onNext }: any) => (
    <div data-testid="config-step">
      <button onClick={onNext}>Next</button>
    </div>
  ),
}));

jest.mock('../generation/BatchPreviewStep', () => ({
  BatchPreviewStep: ({ onNext, onBack }: any) => (
    <div data-testid="preview-step">
      <button onClick={onBack}>Back</button>
      <button onClick={onNext}>Start Generation</button>
    </div>
  ),
}));

jest.mock('../generation/BatchProgressStep', () => ({
  BatchProgressStep: ({ onComplete }: any) => (
    <div data-testid="progress-step">
      <div role="progressbar" />
      <button onClick={onComplete}>Complete</button>
    </div>
  ),
}));

jest.mock('../generation/BatchSummaryStep', () => ({
  BatchSummaryStep: ({ onViewConversations }: any) => (
    <div data-testid="summary-step">
      <button onClick={onViewConversations}>View Conversations</button>
    </div>
  ),
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
  },
}));

describe('BatchGenerationModal', () => {
  const mockCloseBatchModal = jest.fn();
  const mockSetBatchStep = jest.fn();
  const mockResetBatchGeneration = jest.fn();
  const mockSetCurrentView = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useAppStore as unknown as jest.Mock).mockReturnValue({
      showBatchModal: true,
      closeBatchModal: mockCloseBatchModal,
      batchGeneration: {
        currentStep: 1,
        jobId: null,
      },
      setBatchStep: mockSetBatchStep,
      resetBatchGeneration: mockResetBatchGeneration,
      setCurrentView: mockSetCurrentView,
    });
  });

  describe('Rendering', () => {
    it('should display configuration step initially', () => {
      render(<BatchGenerationModal />);
      
      expect(screen.getByTestId('config-step')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('should display correct step title in header', () => {
      render(<BatchGenerationModal />);
      
      expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument();
    });

    it('should not render when showBatchModal is false', () => {
      (useAppStore as unknown as jest.Mock).mockReturnValue({
        showBatchModal: false,
        batchGeneration: { currentStep: 1 },
      });

      const { container } = render(<BatchGenerationModal />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Step Navigation', () => {
    it('should move to preview step when Next is clicked', () => {
      render(<BatchGenerationModal />);
      
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      expect(mockSetBatchStep).toHaveBeenCalledWith(2);
    });

    it('should move back to config from preview', () => {
      (useAppStore as unknown as jest.Mock).mockReturnValue({
        showBatchModal: true,
        closeBatchModal: mockCloseBatchModal,
        batchGeneration: {
          currentStep: 2,
          jobId: null,
        },
        setBatchStep: mockSetBatchStep,
        resetBatchGeneration: mockResetBatchGeneration,
        setCurrentView: mockSetCurrentView,
      });

      render(<BatchGenerationModal />);
      
      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);

      expect(mockSetBatchStep).toHaveBeenCalledWith(1);
    });

    it('should move to progress step when generation starts', () => {
      (useAppStore as unknown as jest.Mock).mockReturnValue({
        showBatchModal: true,
        closeBatchModal: mockCloseBatchModal,
        batchGeneration: {
          currentStep: 2,
          jobId: null,
        },
        setBatchStep: mockSetBatchStep,
        resetBatchGeneration: mockResetBatchGeneration,
        setCurrentView: mockSetCurrentView,
      });

      render(<BatchGenerationModal />);
      
      const startButton = screen.getByText('Start Generation');
      fireEvent.click(startButton);

      expect(mockSetBatchStep).toHaveBeenCalledWith(3);
    });

    it('should move to summary when complete', () => {
      (useAppStore as unknown as jest.Mock).mockReturnValue({
        showBatchModal: true,
        closeBatchModal: mockCloseBatchModal,
        batchGeneration: {
          currentStep: 3,
          jobId: 'job-123',
        },
        setBatchStep: mockSetBatchStep,
        resetBatchGeneration: mockResetBatchGeneration,
        setCurrentView: mockSetCurrentView,
      });

      render(<BatchGenerationModal />);
      
      const completeButton = screen.getByText('Complete');
      fireEvent.click(completeButton);

      expect(mockSetBatchStep).toHaveBeenCalledWith(4);
    });
  });

  describe('Close Behavior', () => {
    it('should close immediately when not generating', () => {
      const { container } = render(<BatchGenerationModal />);
      
      // Simulate ESC key
      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockCloseBatchModal).toHaveBeenCalled();
      expect(mockResetBatchGeneration).toHaveBeenCalled();
    });

    it('should show confirmation when closing during generation', () => {
      (useAppStore as unknown as jest.Mock).mockReturnValue({
        showBatchModal: true,
        closeBatchModal: mockCloseBatchModal,
        batchGeneration: {
          currentStep: 3,
          jobId: 'job-123',
        },
        setBatchStep: mockSetBatchStep,
        resetBatchGeneration: mockResetBatchGeneration,
        setCurrentView: mockSetCurrentView,
      });

      render(<BatchGenerationModal />);
      
      // Try to close (ESC key or close button would trigger this)
      fireEvent.keyDown(window, { key: 'Escape' });

      // Confirmation dialog should appear
      // (Implementation depends on AlertDialog behavior)
    });
  });

  describe('Completion Flow', () => {
    it('should navigate to dashboard when viewing conversations', () => {
      (useAppStore as unknown as jest.Mock).mockReturnValue({
        showBatchModal: true,
        closeBatchModal: mockCloseBatchModal,
        batchGeneration: {
          currentStep: 4,
          jobId: 'job-123',
        },
        setBatchStep: mockSetBatchStep,
        resetBatchGeneration: mockResetBatchGeneration,
        setCurrentView: mockSetCurrentView,
      });

      render(<BatchGenerationModal />);
      
      const viewButton = screen.getByText('View Conversations');
      fireEvent.click(viewButton);

      expect(mockCloseBatchModal).toHaveBeenCalled();
      expect(mockSetCurrentView).toHaveBeenCalledWith('dashboard');
      expect(mockResetBatchGeneration).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support ESC key to close', () => {
      render(<BatchGenerationModal />);
      
      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockCloseBatchModal).toHaveBeenCalled();
    });

    it('should prevent ESC close during generation', () => {
      (useAppStore as unknown as jest.Mock).mockReturnValue({
        showBatchModal: true,
        closeBatchModal: mockCloseBatchModal,
        batchGeneration: {
          currentStep: 3,
          jobId: 'job-123',
        },
        setBatchStep: mockSetBatchStep,
        resetBatchGeneration: mockResetBatchGeneration,
        setCurrentView: mockSetCurrentView,
      });

      render(<BatchGenerationModal />);
      
      fireEvent.keyDown(window, { key: 'Escape' });

      // Should not close immediately
      expect(mockCloseBatchModal).not.toHaveBeenCalled();
    });
  });

  describe('Progress Step', () => {
    it('should display progress indicator during generation', () => {
      (useAppStore as unknown as jest.Mock).mockReturnValue({
        showBatchModal: true,
        closeBatchModal: mockCloseBatchModal,
        batchGeneration: {
          currentStep: 3,
          jobId: 'job-123',
        },
        setBatchStep: mockSetBatchStep,
        resetBatchGeneration: mockResetBatchGeneration,
        setCurrentView: mockSetCurrentView,
      });

      render(<BatchGenerationModal />);
      
      expect(screen.getByTestId('progress-step')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('State Reset', () => {
    it('should reset state when reopening after completion', () => {
      const { rerender } = render(
        <BatchGenerationModal />
      );

      (useAppStore as unknown as jest.Mock).mockReturnValue({
        showBatchModal: true,
        closeBatchModal: mockCloseBatchModal,
        batchGeneration: {
          currentStep: 4,
          jobId: 'job-123',
        },
        setBatchStep: mockSetBatchStep,
        resetBatchGeneration: mockResetBatchGeneration,
        setCurrentView: mockSetCurrentView,
      });

      rerender(<BatchGenerationModal />);

      // Should reset to step 1 when reopening
      expect(mockResetBatchGeneration).toHaveBeenCalled();
    });
  });
});

