import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Resume from './page';
import ResumeTable from './components/resumeTable';

// Mock the ResumeTable component
vi.mock('./components/resumeTable', () => ({
  default: vi.fn(() => <div data-testid="resume-table">Mocked ResumeTable</div>),
}));

describe('Resume Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Resume />);
    expect(screen.getByTestId('resume-table')).toBeInTheDocument();
  });

  it('renders ResumeTable component', () => {
    render(<Resume />);
    expect(ResumeTable).toHaveBeenCalled();
    expect(screen.getByTestId('resume-table')).toHaveTextContent('Mocked ResumeTable');
  });

  it('applies correct CSS class to the container div', () => {
    const { container } = render(<Resume />);
    const div = container.firstChild;
    expect(div).toHaveClass('p-2');
  });
});