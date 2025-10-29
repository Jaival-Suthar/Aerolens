import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddButton from './AddButton';

// Mock PrimeReact Button
vi.mock('primereact/button', () => ({
  Button: ({ children, onClick, disabled, tooltip, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={props['aria-label']}
      data-testid="add-button"
      title={tooltip}
    >
      {children}
    </button>
  ),
}));

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaPlus: () => <span data-testid="plus-icon">+</span>,
}));

describe('AddButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the button with correct aria-label', () => {
    render(<AddButton onClick={mockOnClick} />);
    
    const button = screen.getByLabelText('Add');
    expect(button).toBeInTheDocument();
  });

  it('renders the FaPlus icon', () => {
    render(<AddButton onClick={mockOnClick} />);
    
    const icon = screen.getByTestId('plus-icon');
    expect(icon).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup();
    render(<AddButton onClick={mockOnClick} />);
    
    const button = screen.getByTestId('add-button');
    await user.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('applies default tooltip when not provided', () => {
    render(<AddButton onClick={mockOnClick} />);
    
    const button = screen.getByTestId('add-button');
    expect(button).toHaveAttribute('title', 'Add');
  });

  it('applies custom tooltip when provided', () => {
    render(<AddButton onClick={mockOnClick} tooltip="Add new item" />);
    
    const button = screen.getByTestId('add-button');
    expect(button).toHaveAttribute('title', 'Add new item');
  });

  it('disables the button when disabled prop is true', () => {
    render(<AddButton onClick={mockOnClick} disabled={true} />);
    
    const button = screen.getByTestId('add-button');
    expect(button).toBeDisabled();
  });

  it('does not call onClick when button is disabled', async () => {
    const user = userEvent.setup();
    render(<AddButton onClick={mockOnClick} disabled={true} />);
    
    const button = screen.getByTestId('add-button');
    await user.click(button);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('enables the button when disabled prop is false', () => {
    render(<AddButton onClick={mockOnClick} disabled={false} />);
    
    const button = screen.getByTestId('add-button');
    expect(button).not.toBeDisabled();
  });
});