import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
const DepartmentTable = ({ clientId }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientName, setClientName] = useState("");

  const fetchDepartments = async () => {
    if (!clientId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://aerolens-backend.onrender.com/client/${clientId}`
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to fetch departments");
      }

      const result = await response.json();

      if (result.success && result.data?.departments) {
        setDepartments(result.data.departments);
        setClientName(result.data.clientName || "");
      } else {
        setDepartments([]);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [clientId]);

  if (loading) return <p>Loading departments...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
    <h3>Departments for Client {clientName}</h3>
    <DataTable value={departments} tableStyle={{ minWidth: "50rem" }}>
      <Column field="departmentId" header="Department ID" />
      <Column field="departmentName" header="Department Name" />
      <Column field="departmentDescription" header="Department Description" />
    </DataTable>
  </div>
  
  );
};

export default DepartmentTable;
