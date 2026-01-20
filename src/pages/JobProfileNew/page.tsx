import React from 'react';
import  JobProfileTable from './components/jobProfileNewTable';

const JobProfileNew: React.FC = () => {
  return (
    <div className="p-2" style={{display: "flex", flexDirection: "column", flex: 1, overflow: "hidden"}}>
      <JobProfileTable />
    </div>
  );
};

export default JobProfileNew;
