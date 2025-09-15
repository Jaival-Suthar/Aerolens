import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Pagination, ApiResponseWithPagination } from "../types/clientTypes";

export const usePagination = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialPagination = useCallback((): Pagination => {
    const urlPage = Number(searchParams.get("page")) || null;
    const urlLimit = Number(searchParams.get("limit")) || null;

    const savedPagination = localStorage.getItem("clientTablePagination");
    const saved: Partial<Pagination> = savedPagination ? JSON.parse(savedPagination) : {};

    return {
      currentPage: urlPage || saved.currentPage || 1,
      limit: urlLimit || saved.limit || 10,
      totalPages: 1,
      totalRecords: 0,
    };
  }, [searchParams]);

  const [pagination, setPagination] = useState<Pagination>(getInitialPagination);

  const updateUrlParams = useCallback(
    (newPage: number, newLimit: number): void => {
      const params = new URLSearchParams();

      params.set("page", newPage.toString());
      params.set("limit", newLimit.toString());

      searchParams.forEach((value, key) => {
        if (key !== "page" && key !== "limit") {
          params.set(key, value);
        }
      });

      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const savePaginationPreferences = useCallback(
    (page: number, limit: number): void => {
      localStorage.setItem("clientTablePagination", JSON.stringify({ currentPage: page, limit }));
    },
    []
  );

  const updatePaginationFromResponse = useCallback(
    <T = unknown>(response: ApiResponseWithPagination<T>, page: number, limit: number): void => {
      if (response?.pagination) {
        setPagination((prev) => ({
          ...prev,
          currentPage: response.pagination!.currentPage ?? page,
          totalPages: response.pagination!.totalPages ?? prev.totalPages,
          totalRecords: response.pagination!.totalRecords ?? prev.totalRecords,
          limit: response.pagination!.limit ?? limit,
        }));
      } else {
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          limit: limit,
          totalPages: response?.data ? Math.ceil(response.data.length / limit) : 1,
          totalRecords: response?.data ? response.data.length : 0,
        }));
      }
    },
    []
  );

  const resetPaginationOnError = useCallback((page: number, limit: number): void => {
    setPagination({
      currentPage: page,
      limit: limit,
      totalRecords: 0,
      totalPages: 1,
    });
  }, []);

  return {
    pagination,
    setPagination,
    getInitialPagination,
    updateUrlParams,
    savePaginationPreferences,
    updatePaginationFromResponse,
    resetPaginationOnError,
    searchParams,
  };
};
