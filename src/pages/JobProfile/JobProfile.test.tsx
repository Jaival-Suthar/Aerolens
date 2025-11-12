import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';

// ✅ Perfect mock path (matches import in JobProfile.tsx)
vi.mock('./components/jobProfileTable', () => {
  const MockJobProfileMain = vi.fn(() => (
    <div data-testid="job-profile-main">Mock JobProfileMain</div>
  ));
  return {
    __esModule: true,
    default: MockJobProfileMain,
  };
});

import JobProfile from './page';
import JobProfileMain from './components/jobProfileTable';

describe('JobProfile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing and shows JobProfileMain', () => {
    render(<JobProfile />);
    expect(screen.getByTestId('job-profile-main')).toBeInTheDocument();
  });

  it('renders inside a div with class p-2', () => {
    const { container } = render(<JobProfile />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('p-2');
  });

  it('calls JobProfileMain once during render', () => {
    render(<JobProfile />);
    expect(JobProfileMain).toHaveBeenCalledTimes(1);
  });

  it('matches the snapshot', () => {
    const { asFragment } = render(<JobProfile />);
    expect(asFragment()).toMatchSnapshot();
  });
});
