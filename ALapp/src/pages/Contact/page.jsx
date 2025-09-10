import React, { useState } from 'react';
import ClientTable from '../Dashboard/components/clientTable';
import ClientContactsView from './components/clientContactsView';
import { VIEW_MODES, getMenuItems } from './constants/contactConstants';
import { SplitButton } from 'primereact/splitbutton';

const Page = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeView, setActiveView] = useState(VIEW_MODES.TABLE);

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    // Do not auto-switch view on client select here
  };

  const handleBackToClients = () => {
    setActiveView(VIEW_MODES.TABLE);
    setSelectedClient(null);
  };

  const menuItems = getMenuItems((view) => {
    if (view === VIEW_MODES.CONTACTS && !selectedClient) {
      // Block navigation if no client selected
      alert('Please select a client first.');
      return;
    }
    setActiveView(view);
  });

  return (
    <>
      {activeView === VIEW_MODES.TABLE && (
        <>
          <div className="mb-4">
            <SplitButton
              icon="pi pi-cog"
              model={menuItems}
              tooltip="Settings"
              tooltipOptions={{ position: 'bottom' }}
              disabled={!selectedClient}
              aria-label="Settings"
            />
          </div>
          <ClientTable 
            selectedClient={selectedClient} 
            onSelectionChange={handleClientSelect} 
          />
        </>
      )}

      {activeView === VIEW_MODES.CONTACTS && selectedClient && (
        <ClientContactsView selectedClient={selectedClient} onBackClick={handleBackToClients} />
      )}

      {activeView === VIEW_MODES.DEPARTMENT && (
        <div>
          <button onClick={handleBackToClients} className="mb-3 p-button p-button-secondary">
            &larr; Back to Clients
          </button>
          <h3>Department view under construction</h3>
        </div>
      )}
    </>
  );
};

export default Page;
