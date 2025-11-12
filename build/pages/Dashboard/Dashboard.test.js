import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
// ✅ Mock primereact Card
vi.mock('primereact/card', () => ({
    Card: vi.fn(({ children, ...props }) => (_jsx("div", { "data-testid": "mock-card", ...props, children: children }))),
}));
// ✅ Mock icons from react-icons/fa
vi.mock('react-icons/fa', () => ({
    FaUsers: () => _jsx("span", { "data-testid": "icon-users" }),
    FaUser: () => _jsx("span", { "data-testid": "icon-user" }),
    FaClock: () => _jsx("span", { "data-testid": "icon-clock" }),
    FaArrowUp: () => _jsx("span", { "data-testid": "icon-up" }),
    FaArrowDown: () => _jsx("span", { "data-testid": "icon-down" }),
}));
import Dashboard from './page';
import { Card } from 'primereact/card';
describe('Dashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('renders the dashboard heading', () => {
        render(_jsx(Dashboard, {}));
        expect(screen.getByText('Welcome to the Aerolens Portal')).toBeInTheDocument();
    });
    it('renders all dashboard cards', () => {
        render(_jsx(Dashboard, {}));
        const cards = screen.getAllByTestId('mock-card');
        expect(cards.length).toBe(3);
    });
    it('renders each card with correct titles and descriptions', () => {
        render(_jsx(Dashboard, {}));
        expect(screen.getByText('Active Clients')).toBeInTheDocument();
        expect(screen.getByText('Available Candidates')).toBeInTheDocument();
        expect(screen.getByText('Pending Reviews')).toBeInTheDocument();
        expect(screen.getByText('Total active clients')).toBeInTheDocument();
        expect(screen.getByText('Ready for placement')).toBeInTheDocument();
        expect(screen.getByText('Awaiting review')).toBeInTheDocument();
    });
    it('renders correct numeric values and trends', () => {
        render(_jsx(Dashboard, {}));
        expect(screen.getByText('46')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
        expect(screen.getByText('+12% from last month')).toBeInTheDocument();
        expect(screen.getByText('+8% from last month')).toBeInTheDocument();
        expect(screen.getByText('-2% from last month')).toBeInTheDocument();
    });
    it('renders upward and downward trend icons correctly', () => {
        render(_jsx(Dashboard, {}));
        expect(screen.getAllByTestId('icon-up').length).toBe(2);
        expect(screen.getAllByTestId('icon-down').length).toBe(1);
    });
    it('applies hover styles on mouse events', () => {
        render(_jsx(Dashboard, {}));
        const card = screen.getAllByTestId('mock-card')[0];
        const originalTransform = card.style.transform;
        const originalBoxShadow = card.style.boxShadow;
        // simulate hover
        fireEvent.mouseEnter(card);
        expect(card.style.transform).toBe('translateY(-2px)');
        expect(card.style.boxShadow).toBe('0 10px 25px rgba(0,0,0,0.1)');
        // simulate leave
        fireEvent.mouseLeave(card);
        expect(card.style.transform).toBe('translateY(0)');
        expect(card.style.boxShadow).toBe('0 1px 3px rgba(0,0,0,0.1)');
        // ensure values changed from original
        expect(card.style.transform).not.toBe(originalTransform);
        expect(card.style.boxShadow).not.toBe(originalBoxShadow);
    });
    it('matches snapshot', () => {
        const { asFragment } = render(_jsx(Dashboard, {}));
        expect(asFragment()).toMatchSnapshot();
    });
    it('renders Card component 3 times', () => {
        render(_jsx(Dashboard, {}));
        expect(Card).toHaveBeenCalledTimes(3);
    });
});
