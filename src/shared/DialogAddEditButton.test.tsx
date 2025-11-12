import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DialogButton from './DialogAddEditButton';

// Mock PrimeReact Button
vi.mock('primereact/button', () => ({
  Button: ({ label, severity, icon, onClick, disabled, loading, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="dialog-button"
      data-severity={severity}
      data-loading={loading}
      className={className}
    >
      {loading && <span data-testid="loading-spinner">Loading...</span>}
      {icon && <span data-testid="button-icon">{icon}</span>}
      {label}
    </button>
  ),
}));

describe('DialogButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the button with label', () => {
    render(<DialogButton label="Submit" onClick={mockOnClick} />);
    
    const button = screen.getByTestId('dialog-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Submit');
  });

  it('applies default severity as success', () => {
    render(<DialogButton label="Submit" onClick={mockOnClick} />);
    
    const button = screen.getByTestId('dialog-button');
    expect(button).toHaveAttribute('data-severity', 'success');
  });

  it('applies custom severity when provided', () => {
    render(<DialogButton label="Cancel" severity="secondary" onClick={mockOnClick} />);
    
    const button = screen.getByTestId('dialog-button');
    expect(button).toHaveAttribute('data-severity', 'secondary');
  });

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup();
    render(<DialogButton label="Submit" onClick={mockOnClick} />);
    
    const button = screen.getByTestId('dialog-button');
    await user.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders with icon when provided', () => {
    const icon = <span>Icon</span>;
    render(<DialogButton label="Submit" icon={icon} onClick={mockOnClick} />);
    
    const buttonIcon = screen.getByTestId('button-icon');
    expect(buttonIcon).toBeInTheDocument();
    expect(buttonIcon).toHaveTextContent('Icon');
  });

  it('does not render icon when not provided', () => {
    render(<DialogButton label="Submit" onClick={mockOnClick} />);
    
    const buttonIcon = screen.queryByTestId('button-icon');
    expect(buttonIcon).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<DialogButton label="Submit" onClick={mockOnClick} className="custom-class" />);
    
    const button = screen.getByTestId('dialog-button');
    expect(button).toHaveClass('custom-class');
  });

  it('disables the button when disabled prop is true', () => {
    render(<DialogButton label="Submit" onClick={mockOnClick} disabled={true} />);
    
    const button = screen.getByTestId('dialog-button');
    expect(button).toBeDisabled();
  });

  it('does not call onClick when button is disabled', async () => {
    const user = userEvent.setup();
    render(<DialogButton label="Submit" onClick={mockOnClick} disabled={true} />);
    
    const button = screen.getByTestId('dialog-button');
    await user.click(button);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('shows loading state when loading prop is true', () => {
    render(<DialogButton label="Submit" onClick={mockOnClick} loading={true} />);
    
    const button = screen.getByTestId('dialog-button');
    expect(button).toHaveAttribute('data-loading', 'true');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('does not show loading state by default', () => {
    render(<DialogButton label="Submit" onClick={mockOnClick} />);
    
    const button = screen.getByTestId('dialog-button');
    expect(button).toHaveAttribute('data-loading', 'false');
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });
});