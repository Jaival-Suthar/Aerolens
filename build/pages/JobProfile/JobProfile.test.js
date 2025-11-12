import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
// ✅ Perfect mock path (matches import in JobProfile.tsx)
vi.mock('./components/jobProfileTable', () => {
    const MockJobProfileMain = vi.fn(() => (_jsx("div", { "data-testid": "job-profile-main", children: "Mock JobProfileMain" })));
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
        render(_jsx(JobProfile, {}));
        expect(screen.getByTestId('job-profile-main')).toBeInTheDocument();
    });
    it('renders inside a div with class p-2', () => {
        const { container } = render(_jsx(JobProfile, {}));
        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass('p-2');
    });
    it('calls JobProfileMain once during render', () => {
        render(_jsx(JobProfile, {}));
        expect(JobProfileMain).toHaveBeenCalledTimes(1);
    });
    it('matches the snapshot', () => {
        const { asFragment } = render(_jsx(JobProfile, {}));
        expect(asFragment()).toMatchSnapshot();
    });
});
