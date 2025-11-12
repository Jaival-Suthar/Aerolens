import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignupPage from './page';
// 1. Mock the child component (SignupForm)
// This allows us to test SignupPage without needing the actual implementation of SignupForm.
// We replace it with a simple function component that renders a unique test identifier.
vi.mock('./components/SignupForm', () => ({
    // The default export of the module is the component itself
    default: () => _jsx("div", { "data-testid": "signup-form-mock", children: "SignupForm Component" }),
}));
describe('SignupPage', () => {
    it('should render the SignupForm component', () => {
        // Arrange
        render(_jsx(SignupPage, {}));
        // Assert
        // Check if the mock component's unique test ID is present in the document
        const signupFormElement = screen.getByTestId('signup-form-mock');
        // The SignupPage renders its child component inside a simple <div>, 
        // so we expect the child component to be in the document.
        expect(signupFormElement).toBeInTheDocument();
        // Optional: Check the content of the mock for clarity
        expect(signupFormElement).toHaveTextContent('SignupForm Component');
    });
    it('should be wrapped in a main container div', () => {
        // Arrange
        const { container } = render(_jsx(SignupPage, {}));
        // Assert
        // Check if the structure contains the outer div element
        expect(container.firstChild?.nodeName).toBe('DIV');
    });
});
