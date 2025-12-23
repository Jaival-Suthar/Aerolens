import React, { useState } from "react";
import LookupTable from "./components/lookupTable";
import LocationTable from "./components/locationLookupTable";

import { useLookupData } from "./hooks/useLookupData";
import { useLocationData } from "./hooks/useLocationData";

import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

const LookupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"LOOKUP" | "LOCATION">("LOOKUP");

  const lookup = useLookupData();      // data, loading, error, refetch
  const location = useLocationData();  // separate hook (you will create)

  // Error render
  const currentError =
    activeTab === "LOOKUP" ? lookup.error : location.error;

  if (currentError) {
    return (
      <div className="p-4">
        <Message severity="error" text={currentError} />
      </div>
    );
  }

  return (
    <div className="p-4"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
      }}
    >
      {/* MINI HEADER TABS */}
      <div className="flex gap-3 mb-4 border-bottom pb-2">
        <button
          className={`p-button p-button-text ${activeTab === "LOOKUP" ? "font-bold border-bottom-2 border-primary" : ""}`}
          onClick={() => setActiveTab("LOOKUP")}
        >
          Lookup
        </button>

        <button
          className={`p-button p-button-text ${activeTab === "LOCATION" ? "font-bold border-bottom-2 border-primary" : ""}`}
          onClick={() => setActiveTab("LOCATION")}
        >
          Location Lookup
        </button>
      </div>

      {/* TAB CONTENT */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >

      {activeTab === "LOOKUP" ? (
        lookup.loading && lookup.data.length === 0 ? (
          <div className="flex justify-content-center align-items-center">
            <ProgressSpinner />
          </div>
        ) : (
          <LookupTable
            data={lookup.data}
            loading={lookup.loading}
            onDataChange={lookup.refetch}
          />
        )
      ) : (
        location.loading && location.data.length === 0 ? (
          <div className="flex justify-content-center align-items-center">
            <ProgressSpinner />
          </div>
        ) : (
          <LocationTable
            data={location.data}
            loading={location.loading}
            onDataChange={location.refetch}
          />
        )
      )}
    </div>
    </div>
  );
};

export default LookupPage;
