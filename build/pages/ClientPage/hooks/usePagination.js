import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
export const usePagination = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const getInitialPagination = useCallback(() => {
        const urlPage = Number(searchParams.get("page")) || null;
        const urlLimit = Number(searchParams.get("limit")) || null;
        const savedPagination = localStorage.getItem("clientTablePagination");
        const saved = savedPagination ? JSON.parse(savedPagination) : {};
        return {
            currentPage: urlPage || saved.currentPage || 1,
            limit: urlLimit || saved.limit || 10,
            totalPages: 1,
            totalRecords: 0,
        };
    }, [searchParams]);
    const [pagination, setPagination] = useState(getInitialPagination);
    const updateUrlParams = useCallback((newPage, newLimit) => {
        const params = new URLSearchParams();
        params.set("page", newPage.toString());
        params.set("limit", newLimit.toString());
        searchParams.forEach((value, key) => {
            if (key !== "page" && key !== "limit") {
                params.set(key, value);
            }
        });
        setSearchParams(params, { replace: true });
    }, [searchParams, setSearchParams]);
    const savePaginationPreferences = useCallback((page, limit) => {
        localStorage.setItem("clientTablePagination", JSON.stringify({ currentPage: page, limit }));
    }, []);
    const updatePaginationFromResponse = useCallback((response, page, limit) => {
        if (response?.pagination) {
            setPagination((prev) => ({
                ...prev,
                currentPage: response.pagination.currentPage ?? page,
                totalPages: response.pagination.totalPages ?? prev.totalPages,
                totalRecords: response.pagination.totalRecords ?? prev.totalRecords,
                limit: response.pagination.limit ?? limit,
            }));
        }
        else {
            setPagination((prev) => ({
                ...prev,
                currentPage: page,
                limit: limit,
                totalPages: response?.data ? Math.ceil(response.data.length / limit) : 1,
                totalRecords: response?.data ? response.data.length : 0,
            }));
        }
    }, []);
    const resetPaginationOnError = useCallback((page, limit) => {
        setPagination({
            currentPage: page,
            limit: limit,
            totalRecords: 0,
            totalPages: 1,
        });
    }, []);
    //console.log("Pagination Hook:", pagination);
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
