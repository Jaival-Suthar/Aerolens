import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export const usePagination = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get pagination from URL parameters or localStorage defaults
  const getInitialPagination = useCallback(() => {
    // First try URL params
    const urlPage = parseInt(searchParams.get('page')) || null;
    const urlLimit = parseInt(searchParams.get('limit')) || null;
    
    // Then try localStorage
    const savedPagination = localStorage.getItem('clientTablePagination');
    const saved = savedPagination ? JSON.parse(savedPagination) : {};
    
    return {
      currentPage: urlPage || saved.currentPage || 1,
      limit: urlLimit || saved.limit || 10,
      totalPages: 1,
      totalRecords: 0,
    };
  }, [searchParams]);

  const [pagination, setPagination] = useState(getInitialPagination);

  // Update URL params when pagination changes
  const updateUrlParams = useCallback((newPage, newLimit) => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    params.set('limit', newLimit.toString());
    
    // Preserve other search params if any
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'limit') {
        params.set(key, value);
      }
    });
    
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  // Save pagination preferences to localStorage
  const savePaginationPreferences = useCallback((page, limit) => {
    const preferences = { currentPage: page, limit };
    localStorage.setItem('clientTablePagination', JSON.stringify(preferences));
  }, []);

  // Update pagination state with API response
  const updatePaginationFromResponse = useCallback((response, page, limit) => {
    if (response && response.pagination) {
      setPagination(prev => ({
        ...prev,
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalRecords: response.pagination.totalRecords,
        limit: response.pagination.limit,
      }));
    } else {
      // Fallback if no pagination in response
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        limit: limit,
        totalPages: response?.data ? Math.ceil(response.data.length / limit) : 1,
        totalRecords: response?.data ? response.data.length : 0,
      }));
    }
  }, []);

  // Reset pagination on error
  const resetPaginationOnError = useCallback((page, limit) => {
    setPagination(prev => ({ 
      ...prev, 
      currentPage: page,
      limit: limit,
      totalRecords: 0,
      totalPages: 1
    }));
  }, []);

  return {
    pagination,
    setPagination,
    getInitialPagination,
    updateUrlParams,
    savePaginationPreferences,
    updatePaginationFromResponse,
    resetPaginationOnError,
    searchParams
  };
};