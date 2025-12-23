import React from 'react';
import MembersTable from './components/MembersTable';

// Parent component for Resume section
const Members = () => {
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
            <MembersTable />
        </div>
    );
};

export default Members;
