import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';

vi.mock('./components/jobProfileRequirementsTable', () => ({
  default: () => <div data-testid="job-profile-main">Mock JobProfileTable</div>,
}));

import JobProfile from './page';

describe('JobProfile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing and shows JobProfileTable', () => {
    render(<JobProfile />);
    expect(screen.getByTestId('job-profile-main')).toBeInTheDocument();
  });

  it('renders inside a wrapper div', () => {
    const { container } = render(<JobProfile />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
