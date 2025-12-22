// pages/interview/page.tsx
import React from "react";
import InterviewTable from './components/interviewTable';

const InterviewPage: React.FC = () => {
  return (
    <div
      className="p-2"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
      }}
    >
      <InterviewTable />
    </div>
  );
};

export default InterviewPage;
