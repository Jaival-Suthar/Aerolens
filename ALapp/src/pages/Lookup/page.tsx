import React, { useState, useEffect, useCallback } from 'react';
import LookupTable  from './components/lookupTable';
import { useLookupData } from './hooks/useLookupData';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { useSearchParams } from 'react-router-dom';

const LookupPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchParams, setSearchParams] = useSearchParams();
  // Fetch data with current page and limit
  const { data, loading, error, meta } = useLookupData(page, limit);
  useEffect(() => {
  const urlPage = searchParams.get('page');
  const urlLimit = searchParams.get('limit');
  const saved = localStorage.getItem('lookupPagination');
  
  if (urlPage && urlLimit) {
    setPage(parseInt(urlPage));
    setLimit(parseInt(urlLimit));
  } else if (saved) {
    const { page: savedPage, limit: savedLimit } = JSON.parse(saved);
    setPage(savedPage);
    setLimit(savedLimit);
    setSearchParams({ page: String(savedPage), limit: String(savedLimit) });
  }
}, []);
  
const handlePageChange = useCallback((newPage: number, newLimit: number) => {
  setPage(newPage);
  setLimit(newLimit);
  setSearchParams({ page: String(newPage), limit: String(newLimit) });
  
  // Save to localStorage
  localStorage.setItem('lookupPagination', JSON.stringify({ page: newPage, limit: newLimit }));
}, [setSearchParams]);

  const handleDataChange = () => {
    // Trigger refetch - you can force refetch by resetting to page 1
    setPage(1);
  };

  if (error) {
    return (
      <div className="p-4">
        <Message severity="error" text={error} />
      </div>
    );
  }
  
  return (
    <div className="p-4">
      {loading && data.length === 0 ? (
        <div className="flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <ProgressSpinner />
        </div>
      ) : (
        <LookupTable
          data={data}
          meta={meta}
          loading={loading}
          onPageChange={handlePageChange}
          onDataChange={handleDataChange}
        />
      )}
    </div>
  );
};

export default LookupPage;