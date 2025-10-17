import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, Mock } from 'vitest'; // Explicitly import Mock type
import { useLookupData } from './useLookupData';
import { lookupService } from '../services/lookupService';
import { LookupEntry, LookupApiResponse } from '../types/lookupTypes';
import * as router from 'react-router-dom';

// Mock lookupService
vi.mock('../services/lookupService', () => ({
  lookupService: {
    getAll: vi.fn(),
  },
}));

// Mock useSearchParams
vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn(() => [new URLSearchParams()]),
}));

// Sample data
const mockData: LookupEntry[] = [
  { lookupKey: 1, tag: 'tag1', value: 'value1' },
  { lookupKey: 2, tag: 'tag2', value: 'value2' },
];

const mockMeta = {
  currentPage: 1,
  totalPages: 2,
  totalRecords: 20,
  limit: 10,
  hasNextPage: true,
  hasPrevPage: false,
  nextPage: 2,
  prevPage: null,
};

const mockApiResponse: LookupApiResponse = {
  success: true,
  data: mockData,
  meta: mockMeta,
    message: 'Data fetched successfully',
};

describe('useLookupData', () => {
  const mockGetAll = lookupService.getAll as Mock; // Cast with explicit Mock type
  const mockUseSearchParams = router.useSearchParams as Mock; // Cast with explicit Mock type

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue([new URLSearchParams()]);
  });

  it('fetches data with default page and limit', async () => {
    mockGetAll.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useLookupData(1, 10));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
    expect(result.current.meta).toBe(null);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAll).toHaveBeenCalledWith(1, 10);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.meta).toEqual(mockMeta);
    expect(result.current.error).toBe(null);
  });

  it('fetches data using URL search params', async () => {
    mockUseSearchParams.mockReturnValue([new URLSearchParams('page=2&limit=20')]);
    mockGetAll.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useLookupData(1, 10));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAll).toHaveBeenCalledWith(2, 20);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.meta).toEqual(mockMeta);
    expect(result.current.error).toBe(null);
  });

  it('handles API error correctly', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useLookupData(1, 10));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAll).toHaveBeenCalledWith(1, 10);
    expect(result.current.data).toEqual([]);
    expect(result.current.meta).toBe(null);
    expect(result.current.error).toBe('Network error');
  });

  it('handles invalid API response', async () => {
    mockGetAll.mockResolvedValue({ success: false, message: 'Invalid data' });

    const { result } = renderHook(() => useLookupData(1, 10));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAll).toHaveBeenCalledWith(1, 10);
    expect(result.current.data).toEqual([]);
    expect(result.current.meta).toBe(null);
    expect(result.current.error).toBe('Invalid data');
  });

  it('triggers refetch with refetch function', async () => {
    mockGetAll.mockResolvedValue(mockApiResponse);

    const { result } = renderHook(() => useLookupData(1, 10));

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
    expect(mockGetAll).toHaveBeenCalledWith(1, 10);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.meta).toEqual(mockMeta);
    expect(result.current.error).toBe(null);
  });

  it('triggers refetch with externalRefresh', async () => {
    mockGetAll.mockResolvedValue(mockApiResponse);

    const { result, rerender } = renderHook(({ externalRefresh }) => useLookupData(1, 10, externalRefresh), {
      initialProps: { externalRefresh: 0 },
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAll).toHaveBeenCalledTimes(1);

    rerender({ externalRefresh: 1 });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAll).toHaveBeenCalledTimes(2);
    expect(mockGetAll).toHaveBeenCalledWith(1, 10);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.meta).toEqual(mockMeta);
    expect(result.current.error).toBe(null);
  });

  it('handles empty data response', async () => {
    mockGetAll.mockResolvedValue({ success: true, data: [], meta: mockMeta });

    const { result } = renderHook(() => useLookupData(1, 10));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAll).toHaveBeenCalledWith(1, 10);
    expect(result.current.data).toEqual([]);
    expect(result.current.meta).toEqual(mockMeta);
    expect(result.current.error).toBe(null);
  });

  it('prevents state updates after unmount', async () => {
    mockGetAll.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockApiResponse), 100);
        })
    );

    const { unmount, result } = renderHook(() => useLookupData(1, 10));

    unmount();

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
      expect(result.current.meta).toBe(null);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
    });

    expect(mockGetAll).toHaveBeenCalledTimes(1);
  });

//   it('handles invalid URL params gracefully', async () => {
//     mockUseSearchParams.mockReturnValue([new URLSearchParams('page=invalid&limit=invalid')]);
//     mockGetAll.mockResolvedValue(mockApiResponse);

//     const { result } = renderHook(() => useLookupData(1, 10));

//     await waitFor(() => {
//       expect(result.current.loading).toBe(false);
//     });

//     expect(mockGetAll).toHaveBeenCalledWith(1, 10); // Falls back to defaults
//     expect(result.current.data).toEqual(mockData);
//     expect(result.current.meta).toEqual(mockMeta);
//     expect(result.current.error).toBe(null);
//   });
});