import React from "react";
import OfferTable from "./components/OfferTable";

const Offer: React.FC = () => {
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
      <OfferTable />
    </div>
  );
};

export default Offer;
