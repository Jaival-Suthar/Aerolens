import React from 'react';
import JobProfileMain from './components/jobProfileTable';

const JobProfile: React.FC = () => {
  return (
    <div className="p-2" style={{display: "flex", flexDirection: "column", flex: 1, overflow: "hidden"}}>
      <JobProfileMain />
    </div>
  );
};

export default JobProfile;
