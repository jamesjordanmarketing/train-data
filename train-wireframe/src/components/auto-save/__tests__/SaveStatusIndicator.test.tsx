import React from 'react';
import { render, screen } from '@testing-library/react';
import { SaveStatusIndicator } from '../SaveStatusIndicator';
import { SaveStatus } from '../../../hooks/useAutoSave';

describe('SaveStatusIndicator', () => {
  describe('idle status', () => {
    it('should show "Not saved" when idle with no lastSaved', () => {
      render(<SaveStatusIndicator status="idle" lastSaved={null} />);
      
      expect(screen.getByText(/Not saved/i)).toBeInTheDocument();
    });
    
    it('should show time when idle with lastSaved', () => {
      const lastSaved = new Date(Date.now() - 30 * 1000); // 30 seconds ago
      
      render(<SaveStatusIndicator status="idle" lastSaved={lastSaved} />);
      
      expect(screen.getByText(/Saved 30s ago/i)).toBeInTheDocument();
    });
    
    it('should use Clock icon for idle status', () => {
      render(<SaveStatusIndicator status="idle" lastSaved={null} />);
      
      const icon = screen.getByText(/Not saved/i).previousSibling;
      expect(icon).toHaveClass('lucide-clock');
    });
  });
  
  describe('saving status', () => {
    it('should show "Saving..." when saving', () => {
      render(<SaveStatusIndicator status="saving" lastSaved={null} />);
      
      expect(screen.getByText(/Saving\.\.\./i)).toBeInTheDocument();
    });
    
    it('should use Loader icon with animation for saving status', () => {
      render(<SaveStatusIndicator status="saving" lastSaved={null} />);
      
      const icon = screen.getByText(/Saving\.\.\./i).previousSibling;
      expect(icon).toHaveClass('lucide-loader-2');
      expect(icon).toHaveClass('animate-spin');
    });
  });
  
  describe('saved status', () => {
    it('should show "Saved" with time', () => {
      const lastSaved = new Date(Date.now() - 5 * 1000); // 5 seconds ago
      
      render(<SaveStatusIndicator status="saved" lastSaved={lastSaved} />);
      
      expect(screen.getByText(/Saved Just now/i)).toBeInTheDocument();
    });
    
    it('should use CheckCircle icon for saved status', () => {
      const lastSaved = new Date();
      
      render(<SaveStatusIndicator status="saved" lastSaved={lastSaved} />);
      
      const icon = screen.getByText(/Saved/i).previousSibling;
      expect(icon).toHaveClass('lucide-check-circle');
    });
  });
  
  describe('error status', () => {
    it('should show "Failed to save" when error', () => {
      render(<SaveStatusIndicator status="error" lastSaved={null} />);
      
      expect(screen.getByText(/Failed to save/i)).toBeInTheDocument();
    });
    
    it('should show error message in title attribute', () => {
      const error = new Error('Network error');
      
      render(<SaveStatusIndicator status="error" lastSaved={null} error={error} />);
      
      const errorText = screen.getByText(/Failed to save/i);
      expect(errorText).toHaveAttribute('title', 'Network error');
    });
    
    it('should use AlertCircle icon for error status', () => {
      render(<SaveStatusIndicator status="error" lastSaved={null} />);
      
      const icon = screen.getByText(/Failed to save/i).previousSibling;
      expect(icon).toHaveClass('lucide-alert-circle');
    });
  });
  
  describe('time formatting', () => {
    it('should show "Just now" for recent saves (< 10 seconds)', () => {
      const lastSaved = new Date(Date.now() - 5 * 1000);
      
      render(<SaveStatusIndicator status="saved" lastSaved={lastSaved} />);
      
      expect(screen.getByText(/Just now/i)).toBeInTheDocument();
    });
    
    it('should show seconds for saves within a minute', () => {
      const lastSaved = new Date(Date.now() - 45 * 1000);
      
      render(<SaveStatusIndicator status="saved" lastSaved={lastSaved} />);
      
      expect(screen.getByText(/45s ago/i)).toBeInTheDocument();
    });
    
    it('should show minutes for saves within an hour', () => {
      const lastSaved = new Date(Date.now() - 15 * 60 * 1000);
      
      render(<SaveStatusIndicator status="saved" lastSaved={lastSaved} />);
      
      expect(screen.getByText(/15m ago/i)).toBeInTheDocument();
    });
    
    it('should show time for saves over an hour', () => {
      const lastSaved = new Date(Date.now() - 2 * 60 * 60 * 1000);
      
      render(<SaveStatusIndicator status="saved" lastSaved={lastSaved} />);
      
      // Should show formatted time like "10:30 AM"
      expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
    });
  });
  
  describe('custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <SaveStatusIndicator status="idle" lastSaved={null} className="custom-class" />
      );
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });
    
    it('should preserve default classes with custom className', () => {
      const { container } = render(
        <SaveStatusIndicator status="idle" lastSaved={null} className="custom-class" />
      );
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('items-center');
      expect(wrapper).toHaveClass('custom-class');
    });
  });
  
  describe('status transitions', () => {
    it('should update display when status changes', () => {
      const { rerender } = render(
        <SaveStatusIndicator status="idle" lastSaved={null} />
      );
      
      expect(screen.getByText(/Not saved/i)).toBeInTheDocument();
      
      rerender(<SaveStatusIndicator status="saving" lastSaved={null} />);
      
      expect(screen.getByText(/Saving\.\.\./i)).toBeInTheDocument();
      expect(screen.queryByText(/Not saved/i)).not.toBeInTheDocument();
      
      const lastSaved = new Date();
      rerender(<SaveStatusIndicator status="saved" lastSaved={lastSaved} />);
      
      expect(screen.getByText(/Saved/i)).toBeInTheDocument();
      expect(screen.queryByText(/Saving\.\.\./i)).not.toBeInTheDocument();
    });
  });
  
  describe('styling', () => {
    it('should use correct color classes for idle status', () => {
      render(<SaveStatusIndicator status="idle" lastSaved={null} />);
      
      const text = screen.getByText(/Not saved/i);
      expect(text).toHaveClass('text-muted-foreground');
    });
    
    it('should use correct color classes for saving status', () => {
      render(<SaveStatusIndicator status="saving" lastSaved={null} />);
      
      const text = screen.getByText(/Saving\.\.\./i);
      expect(text).toHaveClass('text-blue-500');
    });
    
    it('should use correct color classes for saved status', () => {
      const lastSaved = new Date();
      render(<SaveStatusIndicator status="saved" lastSaved={lastSaved} />);
      
      const text = screen.getByText(/Saved/i);
      expect(text).toHaveClass('text-green-500');
    });
    
    it('should use correct color classes for error status', () => {
      render(<SaveStatusIndicator status="error" lastSaved={null} />);
      
      const text = screen.getByText(/Failed to save/i);
      expect(text).toHaveClass('text-destructive');
    });
  });
});

