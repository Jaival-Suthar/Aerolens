import React from 'react';
import { Card } from 'primereact/card';
import ResumeTable from './components/resumeTable';
//Parent component for Resume section
const Resume = () => {
    return (
        <div className="p-2">
            <Card title="Welcome to the Resume" className="mb-3">
                <ResumeTable/>
                {/* <p className="m-0">Resume component will be implemented here.</p> */}
            </Card>
            </div>
    );
}

export default Resume;
  