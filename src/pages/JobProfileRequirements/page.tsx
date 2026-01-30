import React from 'react';
import JobProfileRequirementsTable from './components/jobProfileRequirementsTable';

const JobProfileRequirements: React.FC = () => {
  return (
    <div className="p-2" style={{display: "flex", flexDirection: "column", flex: 1, overflow: "hidden"}}>
      <JobProfileRequirementsTable />
    </div>
  );
};

export default JobProfileRequirements;
