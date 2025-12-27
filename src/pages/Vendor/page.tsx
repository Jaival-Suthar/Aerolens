import React from "react";
import VendorTable from "./components/VendorTable";

const Page: React.FC = () => {
  return (
    <div className="p-4 flex flex-col gap-4">
      <h2>Vendors</h2>
      <VendorTable />
    </div>
  );
};

export default Page;
