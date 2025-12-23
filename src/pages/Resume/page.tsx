import React from 'react';
import ResumeTable from './components/resumeTable';
//Parent component for Resume section
const Resume = () => {
    return (
        <div className="p-2" style={{display: "flex", flexDirection: "column", flex: 1, overflow: "hidden"}}>
           <ResumeTable/>
        </div>
    );
}

export default Resume;
  