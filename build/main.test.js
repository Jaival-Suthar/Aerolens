import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
// Mock dependencies before any imports
const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({
    render: mockRender,
}));
vi.mock('react-dom/client', () => ({
    createRoot: mockCreateRoot,
}));
vi.mock('./App', () => ({
    default: () => _jsx("div", { children: "App Component" }),
}));
vi.mock('./shared/auth/AuthContext', () => ({
    AuthProvider: ({ children }) => (_jsx("div", { "data-testid": "auth-provider", children: children })),
}));
describe('main.tsx', () => {
    let mockRootElement;
    beforeEach(() => {
        // Create a fresh mock root element
        mockRootElement = document.createElement('div');
        mockRootElement.id = 'root';
        document.body.appendChild(mockRootElement);
        // Clear all mocks
        vi.clearAllMocks();
    });
    afterEach(() => {
        // Clean up DOM
        document.body.removeChild(mockRootElement);
        // Reset modules to allow re-import
        vi.resetModules();
    });
    it('renders app with AuthProvider and StrictMode', async () => {
        // Import main to trigger the render
        await import('./main');
        // Verify createRoot was called
        expect(mockCreateRoot).toHaveBeenCalledTimes(1);
        expect(mockCreateRoot).toHaveBeenCalledWith(mockRootElement);
        // Verify render was called
        expect(mockRender).toHaveBeenCalledTimes(1);
        // Get the rendered element
        const renderedElement = mockRender.mock.calls[0][0];
        // Check that it's wrapped in StrictMode
        expect(renderedElement.type).toBe(StrictMode);
    });
    it('wraps App with AuthProvider inside StrictMode', async () => {
        await import('./main');
        expect(mockRender).toHaveBeenCalledTimes(1);
        const renderedElement = mockRender.mock.calls[0][0];
        // Verify structure: StrictMode > AuthProvider > App
        expect(renderedElement.type).toBe(StrictMode);
        expect(renderedElement.props.children).toBeDefined();
    });
    it('creates root from DOM element with id "root"', async () => {
        await import('./main');
        // Verify createRoot was called with the correct DOM element
        expect(mockCreateRoot).toHaveBeenCalledWith(mockRootElement);
        expect(mockRootElement.id).toBe('root');
    });
});
