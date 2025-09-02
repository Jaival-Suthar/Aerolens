import React from "react";
import ClientAccordion from "./component/DepartmentsFetch";

const Departments = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Departments</h1>
      <p>This is the Departments page. You can manage company departments here.</p>
      <ClientAccordion />
    
    </div>
  );
};

export default Departments;
