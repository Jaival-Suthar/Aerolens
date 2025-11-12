import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePagination } from "./usePagination";
// Mocks for React Router and localStorage
vi.mock("react-router-dom", () => ({
    useSearchParams: vi.fn()
}));
const mockSearchParams = {
    get: vi.fn(),
    forEach: vi.fn((cb) => { }),
    set: vi.fn()
};
const mockSetSearchParams = vi.fn();
import { useSearchParams } from "react-router-dom";
useSearchParams.mockImplementation(() => [mockSearchParams, mockSetSearchParams]);
describe("usePagination hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });
    it("returns initial pagination using URL params", () => {
        mockSearchParams.get.mockImplementation((key) => {
            if (key === "page")
                return "3";
            if (key === "limit")
                return "25";
            return null;
        });
        const { result } = renderHook(() => usePagination());
        expect(result.current.pagination.currentPage).toBe(3);
        expect(result.current.pagination.limit).toBe(25);
        expect(result.current.pagination.totalPages).toBe(1);
        expect(result.current.pagination.totalRecords).toBe(0);
    });
    it("returns initial pagination using localStorage if URL empty", () => {
        mockSearchParams.get.mockReturnValue(null);
        localStorage.setItem("clientTablePagination", JSON.stringify({ currentPage: 2, limit: 5 }));
        const { result } = renderHook(() => usePagination());
        expect(result.current.pagination.currentPage).toBe(2);
        expect(result.current.pagination.limit).toBe(5);
    });
    it("returns default pagination if URL/localStorage unset", () => {
        mockSearchParams.get.mockReturnValue(null);
        const { result } = renderHook(() => usePagination());
        expect(result.current.pagination.currentPage).toBe(1);
        expect(result.current.pagination.limit).toBe(10);
    });
    it("updateUrlParams only updates page and limit in URL", () => {
        mockSearchParams.forEach.mockImplementation((cb) => cb("xyz", "other"));
        const { result } = renderHook(() => usePagination());
        act(() => {
            result.current.updateUrlParams(4, 12);
        });
        expect(mockSetSearchParams).toHaveBeenCalled();
        const search = mockSetSearchParams.mock.calls[0][0];
        expect(search.get("page")).toBe("4");
        expect(search.get("limit")).toBe("12");
        expect(search.get("other")).toBe("xyz");
    });
    it("savePaginationPreferences stores page+limit in localStorage", () => {
        const { result } = renderHook(() => usePagination());
        act(() => {
            result.current.savePaginationPreferences(6, 13);
        });
        const data = JSON.parse(localStorage.getItem("clientTablePagination"));
        expect(data.currentPage).toBe(6);
        expect(data.limit).toBe(13);
    });
    it("updatePaginationFromResponse sets pagination from response.pagination", () => {
        const { result } = renderHook(() => usePagination());
        const apiResp = {
            pagination: {
                currentPage: 2,
                totalPages: 10,
                totalRecords: 100,
                limit: 7
            }
        };
        act(() => {
            result.current.updatePaginationFromResponse(apiResp, 5, 25);
        });
        expect(result.current.pagination).toMatchObject({
            currentPage: 2,
            totalPages: 10,
            totalRecords: 100,
            limit: 7
        });
    });
    it("updatePaginationFromResponse sets fallback values if pagination missing", () => {
        const { result } = renderHook(() => usePagination());
        const apiResp = {
            data: Array(15).fill({})
        };
        act(() => {
            result.current.updatePaginationFromResponse(apiResp, 5, 10);
        });
        expect(result.current.pagination.currentPage).toBe(5);
        expect(result.current.pagination.limit).toBe(10);
        expect(result.current.pagination.totalPages).toBe(2); // 15 entries, 10 per page
        expect(result.current.pagination.totalRecords).toBe(15);
    });
    it("resetPaginationOnError resets state to passed values", () => {
        const { result } = renderHook(() => usePagination());
        act(() => {
            result.current.resetPaginationOnError(9, 15);
        });
        expect(result.current.pagination).toEqual({
            currentPage: 9,
            limit: 15,
            totalPages: 1,
            totalRecords: 0
        });
    });
    // Edge: updatePaginationFromResponse fallback, with no data
    it("updatePaginationFromResponse fallback uses defaults if no data present", () => {
        const { result } = renderHook(() => usePagination());
        act(() => {
            result.current.updatePaginationFromResponse({}, 2, 20);
        });
        expect(result.current.pagination.currentPage).toBe(2);
        expect(result.current.pagination.limit).toBe(20);
        expect(result.current.pagination.totalPages).toBe(1);
        expect(result.current.pagination.totalRecords).toBe(0);
    });
});
