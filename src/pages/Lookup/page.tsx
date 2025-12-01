import React from 'react';
import LookupTable from './components/lookupTable';
import { useLookupData } from './hooks/useLookupData';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';

const LookupPage: React.FC = () => {
  // ← REMOVE all pagination state and URL params logic
  const { data, loading, error, refetch } = useLookupData();

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
          loading={loading}
          onDataChange={refetch}  
        />
      )}
    </div>
  );
};

export default LookupPage;