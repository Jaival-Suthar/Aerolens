import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { lookupService } from './lookupService';
import type { LookupApiResponse, LookupEntry, PaginationMeta } from '../types/lookupTypes';

// Helper to force global fetch to type any
global.fetch = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('lookupService', () => {
  describe('getAll', () => {
    it('should fetch all lookup entries with default pagination', async () => {
      const mockResponse: LookupApiResponse = {
        success: true,
        message: 'Operation successful',
        data: [
          { lookupKey: 1, tag: 'STATUS', value: 'ACTIVE' },
          { lookupKey: 2, tag: 'STATUS', value: 'INACTIVE' },
        ],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalRecords: 2,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await lookupService.getAll();

      expect(global.fetch).toHaveBeenCalledWith(
        `${import.meta.env.VITE_BASE_URL}/lookup?page=1&limit=10`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch all lookup entries with custom pagination', async () => {
      const mockResponse: LookupApiResponse = {
        success: true,
        message: 'Operation successful',
        data: [
          { lookupKey: 1, tag: 'STATUS', value: 'ACTIVE' },
        ],
        meta: {
          currentPage: 2,
          totalPages: 5,
          totalRecords: 50,
          limit: 20,
          hasNextPage: true,
          hasPrevPage: true,
          nextPage: 3,
          prevPage: 1,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await lookupService.getAll(2, 20);

      expect(global.fetch).toHaveBeenCalledWith(
        `${import.meta.env.VITE_BASE_URL}/lookup?page=2&limit=20`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object),
        })
      );
      expect(result.meta?.currentPage).toBe(2);
      expect(result.meta?.limit).toBe(20);
    });

    it('should return empty data array when no records exist', async () => {
      const mockResponse: LookupApiResponse = {
        success: true,
        message: 'No records found',
        data: [],
        meta: {
          currentPage: 1,
          totalPages: 0,
          totalRecords: 0,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await lookupService.getAll();

      expect(result.data).toEqual([]);
      expect(result.meta?.totalRecords).toBe(0);
    });

    it('should throw error when response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue('Server error'),
      });

      await expect(lookupService.getAll()).rejects.toThrow(
        /HTTP error! status: 500, body: Server error/
      );
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(lookupService.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getByKey', () => {
    it('should fetch a single lookup entry by key', async () => {
      const mockResponse: LookupApiResponse = {
        success: true,
        message: 'Lookup retrieved successfully',
        data: { lookupKey: 1, tag: 'STATUS', value: 'ACTIVE' },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await lookupService.getByKey(1);

      expect(global.fetch).toHaveBeenCalledWith(
        `${import.meta.env.VITE_BASE_URL}/lookup/1`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error for invalid lookupKey (zero)', async () => {
      await expect(lookupService.getByKey(0)).rejects.toThrow(
        /Invalid lookupKey provided/
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw error for invalid lookupKey (negative)', async () => {
      await expect(lookupService.getByKey(-1)).rejects.toThrow(
        /Invalid lookupKey provided/
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw error when lookup not found (404)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue('Lookup not found'),
      });

      await expect(lookupService.getByKey(999)).rejects.toThrow(
        /HTTP error! status: 404, body: Lookup not found/
      );
    });
  });

  describe('create', () => {
    it('should create a new lookup entry with valid payload', async () => {
      const payload = { tag: 'TYPE', value: 'NEW' };
      const mockResponse: LookupApiResponse = {
        success: true,
        message: 'Lookup created successfully',
        data: { lookupKey: 3, tag: 'TYPE', value: 'NEW' },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await lookupService.create(payload);

      expect(global.fetch).toHaveBeenCalledWith(
        `${import.meta.env.VITE_BASE_URL}/lookup`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: JSON.stringify(payload),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when tag is empty', async () => {
      await expect(
        lookupService.create({ tag: '', value: 'VALUE' })
      ).rejects.toThrow(/Payload validation failed: tag and value are required/);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw error when tag is whitespace only', async () => {
      await expect(
        lookupService.create({ tag: '   ', value: 'VALUE' })
      ).rejects.toThrow(/Payload validation failed: tag and value are required/);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw error when value is empty', async () => {
      await expect(
        lookupService.create({ tag: 'TAG', value: '' })
      ).rejects.toThrow(/Payload validation failed: tag and value are required/);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw error when value is whitespace only', async () => {
      await expect(
        lookupService.create({ tag: 'TAG', value: '   ' })
      ).rejects.toThrow(/Payload validation failed: tag and value are required/);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw error when both tag and value are empty', async () => {
      await expect(
        lookupService.create({ tag: '', value: '' })
      ).rejects.toThrow(/Payload validation failed: tag and value are required/);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle duplicate entry error (409)', async () => {
      const payload = { tag: 'TYPE', value: 'DUPLICATE' };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        text: vi.fn().mockResolvedValue('Duplicate entry'),
      });

      await expect(lookupService.create(payload)).rejects.toThrow(
        /HTTP error! status: 409, body: Duplicate entry/
      );
    });

    it('should handle validation error from server (400)', async () => {
      const payload = { tag: 'TAG', value: 'VALUE' };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue('Invalid data format'),
      });

      await expect(lookupService.create(payload)).rejects.toThrow(
        /HTTP error! status: 400, body: Invalid data format/
      );
    });

    it('should handle server error (500)', async () => {
      const payload = { tag: 'TAG', value: 'VALUE' };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue('Internal server error'),
      });

      await expect(lookupService.create(payload)).rejects.toThrow(
        /HTTP error! status: 500, body: Internal server error/
      );
    });
  });

  describe('delete', () => {
    it('should delete a lookup entry by key', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          message: 'Lookup deleted successfully',
        }),
      });

      const result = await lookupService.delete(1);

      expect(global.fetch).toHaveBeenCalledWith(
        `${import.meta.env.VITE_BASE_URL}/lookup/1`,
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result.success).toBe(true);
    });

    it('should throw error for invalid lookupKey (zero)', async () => {
      await expect(lookupService.delete(0)).rejects.toThrow(
        /Invalid lookupKey provided/
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw error for invalid lookupKey (negative)', async () => {
      await expect(lookupService.delete(-5)).rejects.toThrow(
        /Invalid lookupKey provided/
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle not found error (404)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue('Lookup not found'),
      });

      await expect(lookupService.delete(999)).rejects.toThrow(
        /HTTP error! status: 404, body: Lookup not found/
      );
    });

    it('should handle unauthorized deletion (403)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: vi.fn().mockResolvedValue('Forbidden'),
      });

      await expect(lookupService.delete(1)).rejects.toThrow(
        /HTTP error! status: 403, body: Forbidden/
      );
    });

    it('should handle server error during deletion (500)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue('Internal server error'),
      });

      await expect(lookupService.delete(1)).rejects.toThrow(
        /HTTP error! status: 500, body: Internal server error/
      );
    });
  });

  describe('Edge cases and integration scenarios', () => {
    it('should handle very large page numbers', async () => {
      const mockResponse: LookupApiResponse = {
        success: true,
        message: 'No records on this page',
        data: [],
        meta: {
          currentPage: 9999,
          totalPages: 10,
          totalRecords: 100,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: true,
          nextPage: null,
          prevPage: 9998,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await lookupService.getAll(9999, 10);

      expect(global.fetch).toHaveBeenCalledWith(
        `${import.meta.env.VITE_BASE_URL}/lookup?page=9999&limit=10`,
        expect.any(Object)
      );
      expect(result.data).toEqual([]);
      expect(result.meta?.currentPage).toBe(9999);
    });

    it('should handle very large limit values', async () => {
      const mockResponse: LookupApiResponse = {
        success: true,
        message: 'Operation successful',
        data: [],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalRecords: 0,
          limit: 1000,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      await lookupService.getAll(1, 1000);

      expect(global.fetch).toHaveBeenCalledWith(
        `${import.meta.env.VITE_BASE_URL}/lookup?page=1&limit=1000`,
        expect.any(Object)
      );
    });

    it('should handle special characters in tag and value', async () => {
      const payload = {
        tag: 'TYPE&SPECIAL',
        value: 'Value with <html> & "quotes"',
      };

      const mockResponse: LookupApiResponse = {
        success: true,
        message: 'Created with special characters',
        data: {
          lookupKey: 1,
          tag: payload.tag,
          value: payload.value,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await lookupService.create(payload);

      expect(global.fetch).toHaveBeenCalledWith(
        `${import.meta.env.VITE_BASE_URL}/lookup`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: JSON.stringify(payload),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle timeout errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Request timeout'));

      await expect(lookupService.getAll()).rejects.toThrow('Request timeout');
    });

    it('should handle malformed JSON response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      await expect(lookupService.getAll()).rejects.toThrow('Invalid JSON');
    });

    it('should handle empty error response body', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue(''),
      });

      await expect(lookupService.getAll()).rejects.toThrow(
        /HTTP error! status: 500, body: /
      );
    });
  });
});