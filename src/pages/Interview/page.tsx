// pages/interview/page.tsx
import React from "react";
import InterviewTable from './components/interviewTable';

const InterviewPage: React.FC = () => {
  return (
    <div className="p-2">
      <InterviewTable />
    </div>
  );
};

export default InterviewPage;
