import React from 'react';
import ClientTable from './components/clientTable';
import { Button } from 'primereact/button';

const Dashboard = () => {
  return (
    <div className="dashboard-container shadow-3 p-4" style={{ width: "100%", maxWidth: "100%" }}>
      <div className="flex justify-content-between align-items-center mb-4 w-full">
        {/* Left side: Add Client */}
        <Button
          label="Add Client"
          icon="pi pi-plus"
          severity="secondary"
          outlined
          size="medium"
          className="font-medium"
        />

        {/* Right side: Edit and Delete */}
        <div className="flex gap-2 mr-6">
          <Button
            icon="pi pi-pencil"
            rounded
            text
            severity="info"
            size="large"
            aria-label="Edit"
          />
          <Button
            icon="pi pi-trash"
            rounded
            text
            severity="danger"
            size="large"
            aria-label="Delete"
          />
        </div>
      </div>

      <div className="card">
        <ClientTable />
      </div>
    </div>
  );
};

export default Dashboard;
