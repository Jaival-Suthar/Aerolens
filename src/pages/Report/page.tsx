// pages/interview/page.tsx
import React from "react";
import InterviewReportsPage from "./components/InterviewReportsPage";
import { useAuth } from "../../shared/auth/AuthContext";

const ReportPage: React.FC = () => {
  const { accessToken } = useAuth();

  return (
    <div className="p-2" style={{flex: 1, minHeight: 0, overflowY: "auto"}}>
      <InterviewReportsPage accessToken={accessToken} />
    </div>
  );
};

export default ReportPage;
