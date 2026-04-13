import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { useLookupData } from './useLookupData';
import { lookupService } from '../services/lookupService';
import type { LookupEntry, LookupApiResponse } from '../types/lookupTypes';

const authState = { accessToken: 'mock-token-123' as string | null };

vi.mock('../../../shared/auth/AuthContext', () => ({
  useAuth: () => ({ accessToken: authState.accessToken }),
}));

vi.mock('../services/lookupService', () => ({
  lookupService: {
    getAll: vi.fn(),
  },
}));

const mockData: LookupEntry[] = [
  { lookupKey: 1, tag: 'tag1', value: 'value1' },
  { lookupKey: 2, tag: 'tag2', value: 'value2' },
];

const mockApiResponse: LookupApiResponse = {
  success: true,
  data: mockData,
  message: 'Data fetched successfully',
};

describe('useLookupData', { timeout: 10000 }, () => {
  const mockGetAll = lookupService.getAll as Mock;
  const token = 'mock-token-123';

  beforeEach(() => {
    vi.clearAllMocks();
    authState.accessToken = 'mock-token-123';
  });

  it('loads lookups with access token', async () => {
    mockGetAll.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useLookupData());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAll).toHaveBeenCalledWith(token);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it('handles API error correctly', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useLookupData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAll).toHaveBeenCalledWith(token);
    expect(result.current.error).toBe('Network error');
    expect(result.current.data).toEqual([]);
  });

  it('handles invalid API response', async () => {
    mockGetAll.mockResolvedValue({ success: false, message: 'Invalid data' });

    const { result } = renderHook(() => useLookupData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAll).toHaveBeenCalledWith(token);
    expect(result.current.error).toBe('Invalid data');
    expect(result.current.data).toEqual([]);
  });

  it('triggers refetch with refetch function', async () => {
    mockGetAll.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useLookupData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAll).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAll).toHaveBeenCalledTimes(2);
    expect(mockGetAll).toHaveBeenLastCalledWith(token);
  });

  it('triggers refetch when externalRefresh changes', async () => {
    mockGetAll.mockResolvedValue(mockApiResponse);

    const { rerender } = renderHook(
      ({ externalRefresh }) => useLookupData(externalRefresh),
      { initialProps: { externalRefresh: 0 } }
    );

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalledTimes(1);
    });

    rerender({ externalRefresh: 1 });

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalledTimes(2);
    });

    expect(mockGetAll).toHaveBeenLastCalledWith(token);
  });

  it('handles empty data response', async () => {
    mockGetAll.mockResolvedValue({ success: true, data: [] });

    const { result } = renderHook(() => useLookupData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAll).toHaveBeenCalledWith(token);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('does not fetch when access token is missing', () => {
    authState.accessToken = null;

    const { result } = renderHook(() => useLookupData());

    expect(mockGetAll).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true);
  });

  it('avoids state updates after unmount', async () => {
    mockGetAll.mockImplementation(
      () =>
        new Promise<LookupApiResponse>((resolve) => {
          setTimeout(() => resolve(mockApiResponse), 80);
        })
    );

    const { unmount } = renderHook(() => useLookupData());

    expect(mockGetAll).toHaveBeenCalledWith(token);
    unmount();

    await new Promise((r) => setTimeout(r, 150));
  });
});
