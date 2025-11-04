/**
 * ValidationErrorToast Component Tests
 * 
 * Tests for validation error toast component:
 * - Rendering error message
 * - Field-level error display
 * - Accessibility
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValidationErrorToast } from '../ValidationErrorToast';

describe('ValidationErrorToast', () => {
  it('should render error message', () => {
    render(<ValidationErrorToast message="Please fix validation errors" />);

    expect(screen.getByText('Validation Error')).toBeInTheDocument();
    expect(screen.getByText('Please fix validation errors')).toBeInTheDocument();
  });

  it('should render field errors', () => {
    const errors = {
      email: 'Email is required',
      password: 'Password must be at least 8 characters',
    };

    render(
      <ValidationErrorToast
        message="Please fix validation errors"
        errors={errors}
      />
    );

    expect(screen.getByText('email:')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('password:')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  it('should not render error list when errors empty', () => {
    const { container } = render(
      <ValidationErrorToast
        message="Please fix validation errors"
        errors={{}}
      />
    );

    const errorList = container.querySelector('ul');
    expect(errorList).not.toBeInTheDocument();
  });

  it('should not render error list when errors not provided', () => {
    const { container } = render(
      <ValidationErrorToast message="Please fix validation errors" />
    );

    const errorList = container.querySelector('ul');
    expect(errorList).not.toBeInTheDocument();
  });

  it('should render multiple field errors', () => {
    const errors = {
      firstName: 'First name is required',
      lastName: 'Last name is required',
      email: 'Email is invalid',
      phone: 'Phone number is required',
    };

    render(
      <ValidationErrorToast
        message="Please fix validation errors"
        errors={errors}
      />
    );

    expect(screen.getByText('firstName:')).toBeInTheDocument();
    expect(screen.getByText('lastName:')).toBeInTheDocument();
    expect(screen.getByText('email:')).toBeInTheDocument();
    expect(screen.getByText('phone:')).toBeInTheDocument();
  });

  it('should have proper ARIA labels', () => {
    render(<ValidationErrorToast message="Test error" />);

    const container = screen.getByRole('alert');
    expect(container).toHaveAttribute('aria-live', 'assertive');
    expect(container).toHaveAttribute('aria-atomic', 'true');
  });

  it('should display alert circle icon', () => {
    const { container } = render(<ValidationErrorToast message="Test error" />);
    
    // Check for alert circle icon
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});

