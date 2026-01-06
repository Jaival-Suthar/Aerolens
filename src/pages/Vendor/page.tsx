import React from "react";
import VendorTable from "./components/vendorTable"

const Page: React.FC = () => {
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
      <VendorTable />
    </div>
  );
};

export default Page;
