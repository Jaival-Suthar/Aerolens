import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import LoginPage from './Login';
import { AuthContext } from '../../shared/auth/AuthContext';
const STORAGE_KEY = 'auth_email_history';
describe('LoginPage - edge cases for 100% coverage', () => {
    let getItemSpy;
    let setItemSpy;
    let removeItemSpy;
    const makeAuth = (overrides = {}) => ({
        accessToken: 'mock-token',
        isAuthenticated: true,
        login: vi.fn().mockResolvedValue(undefined),
        logout: vi.fn().mockResolvedValue(undefined),
        logoutAll: vi.fn().mockResolvedValue(undefined),
        refreshAccessToken: vi.fn().mockResolvedValue('mock-token'),
        ...overrides,
    });
    beforeEach(() => {
        // Reset spies on Storage prototype
        getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
        setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
        // default behaviors
        getItemSpy.mockImplementation((key) => {
            if (key === STORAGE_KEY)
                return null;
            return null;
        });
        setItemSpy.mockImplementation(() => undefined);
        removeItemSpy.mockImplementation(() => undefined);
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    it('renders form and basic controls', () => {
        render(_jsx(AuthContext.Provider, { value: makeAuth(), children: _jsx(LoginPage, {}) }));
        expect(screen.getByText('Login to Aerolens Portal')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        // PrimeReact Button has role="button" and label text "Login"
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
    //   it('toggles password visibility when icon clicked', async () => {
    //     render(
    //       <AuthContext.Provider value={makeAuth()}>
    //         <LoginPage />
    //       </AuthContext.Provider>
    //     );
    //     const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    //     // initial is password
    //     expect(passwordInput.type).toBe('password');
    //     // the eye icon is a <span> with click handler; find it by role-less query
    //     const span = screen.getByText((content, el) => el?.tagName.toLowerCase() === 'span');
    //     fireEvent.click(span);
    //     expect(passwordInput.type).toBe('text');
    //     // click again -> back to password
    //     fireEvent.click(span);
    //     expect(passwordInput.type).toBe('password');
    //   });
    it('submits on Enter key in password input and does NOT submit on other keys', async () => {
        const mockLogin = vi.fn().mockResolvedValue(undefined);
        const auth = makeAuth({ login: mockLogin });
        render(_jsx(AuthContext.Provider, { value: auth, children: _jsx(LoginPage, {}) }));
        const pass = screen.getByLabelText('Password');
        fireEvent.keyDown(pass, { key: 'a', code: 'KeyA' });
        expect(mockLogin).not.toHaveBeenCalled();
        fireEvent.keyDown(pass, { key: 'Enter', code: 'Enter' });
        await waitFor(() => expect(mockLogin).toHaveBeenCalled());
    });
    it('shows loading / disables button while login promise is pending and then enables after resolve', async () => {
        // create a deferred promise so we can assert "pending" state
        let resolveLogin;
        const loginPromise = new Promise((res) => { resolveLogin = res; });
        const mockLogin = vi.fn(() => loginPromise);
        const auth = makeAuth({ login: mockLogin });
        render(_jsx(AuthContext.Provider, { value: auth, children: _jsx(LoginPage, {}) }));
        const email = screen.getByLabelText('Email');
        const pass = screen.getByLabelText('Password');
        const btn = screen.getByRole('button', { name: /login/i });
        fireEvent.change(email, { target: { value: 'pending@test.com' } });
        fireEvent.change(pass, { target: { value: 'pwd' } });
        fireEvent.click(btn);
        // while pending - loading prop true -> button disabled
        await waitFor(() => expect(btn).toBeDisabled());
        // resolve login
        resolveLogin();
        await waitFor(() => {
            // after resolve button should not be disabled
            expect(btn).not.toBeDisabled();
        });
    });
    it('on successful login, saveEmail is called and localStorage.setItem stores email list (new list)', async () => {
        const mockLogin = vi.fn().mockResolvedValue(undefined);
        const auth = makeAuth({ login: mockLogin });
        // simulate empty history
        getItemSpy.mockImplementation((k) => (k === STORAGE_KEY ? null : null));
        render(_jsx(AuthContext.Provider, { value: auth, children: _jsx(LoginPage, {}) }));
        const email = screen.getByLabelText('Email');
        const pass = screen.getByLabelText('Password');
        const btn = screen.getByRole('button', { name: /login/i });
        fireEvent.change(email, { target: { value: 'newuser@example.com' } });
        fireEvent.change(pass, { target: { value: 'pwd' } });
        fireEvent.click(btn);
        await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('newuser@example.com', 'pwd'));
        // setItem should be called to save history
        expect(setItemSpy).toHaveBeenCalled();
        // assert the first saved value contains our email at 0
        const savedArg = setItemSpy.mock.calls[0][1];
        const parsed = JSON.parse(savedArg);
        expect(parsed[0]).toBe('newuser@example.com');
        expect(parsed.length).toBe(1);
    });
    it('when localStorage contains the same email it moves it to front and does not duplicate', async () => {
        const mockLogin = vi.fn().mockResolvedValue(undefined);
        const auth = makeAuth({ login: mockLogin });
        // pre-existing history contains 'dup@example.com' not at front
        const existing = ['a@a.com', 'dup@example.com', 'c@c.com'];
        getItemSpy.mockImplementation((k) => (k === STORAGE_KEY ? JSON.stringify(existing) : null));
        render(_jsx(AuthContext.Provider, { value: auth, children: _jsx(LoginPage, {}) }));
        const email = screen.getByLabelText('Email');
        const pass = screen.getByLabelText('Password');
        fireEvent.change(email, { target: { value: 'dup@example.com' } });
        fireEvent.change(pass, { target: { value: 'pwd' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));
        await waitFor(() => expect(mockLogin).toHaveBeenCalled());
        // Inspect setItem call
        const saved = JSON.parse(setItemSpy.mock.calls[0][1]);
        expect(saved[0]).toBe('dup@example.com');
        // ensure no duplicates
        const occurrences = saved.filter((s) => s === 'dup@example.com').length;
        expect(occurrences).toBe(1);
    });
    it('trims email history to 5 entries after saving new email', async () => {
        const mockLogin = vi.fn().mockResolvedValue(undefined);
        const auth = makeAuth({ login: mockLogin });
        // prepopulate 5 emails
        const existing = ['1@a.com', '2@a.com', '3@a.com', '4@a.com', '5@a.com'];
        getItemSpy.mockImplementation((k) => (k === STORAGE_KEY ? JSON.stringify(existing) : null));
        render(_jsx(AuthContext.Provider, { value: auth, children: _jsx(LoginPage, {}) }));
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@a.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pwd' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));
        await waitFor(() => expect(mockLogin).toHaveBeenCalled());
        const saved = JSON.parse(setItemSpy.mock.calls[0][1]);
        expect(saved.length).toBeLessThanOrEqual(5);
        expect(saved[0]).toBe('new@a.com');
    });
    it('handles invalid JSON in localStorage gracefully (getItem parse error)', async () => {
        const mockLogin = vi.fn().mockResolvedValue(undefined);
        const auth = makeAuth({ login: mockLogin });
        // invalid JSON stored
        getItemSpy.mockImplementation((k) => (k === STORAGE_KEY ? '{ invalid json' : null));
        render(_jsx(AuthContext.Provider, { value: auth, children: _jsx(LoginPage, {}) }));
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'errorcase@a.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pwd' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));
        // Should not throw — login called and setItem called with new array
        await waitFor(() => expect(mockLogin).toHaveBeenCalled());
        expect(setItemSpy).toHaveBeenCalled();
        const saved = JSON.parse(setItemSpy.mock.calls[0][1]);
        expect(saved[0]).toBe('errorcase@a.com');
    });
    it('displays error message when login rejects', async () => {
        const mockLogin = vi.fn().mockRejectedValue(new Error('Bad credentials'));
        const auth = makeAuth({ login: mockLogin });
        render(_jsx(AuthContext.Provider, { value: auth, children: _jsx(LoginPage, {}) }));
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bad@a.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));
        await waitFor(() => expect(screen.getByText('Bad credentials')).toBeInTheDocument());
    });
    it('changes inline styles on mouseOver and mouseOut for the submit button', () => {
        render(_jsx(AuthContext.Provider, { value: makeAuth(), children: _jsx(LoginPage, {}) }));
        const btn = screen.getByRole('button', { name: /login/i });
        // initial transform is empty
        expect(btn.style.transform).toBe('');
        fireEvent.mouseOver(btn);
        expect(btn.style.transform).toBe('translateY(-2px)');
        // color changed by handler (should set to '#0b3b63')
        expect(btn.style.backgroundColor || btn.style.background).toBeTruthy();
        fireEvent.mouseOut(btn);
        expect(btn.style.transform).toBe('translateY(0)');
    });
});
