// src/pages/Department/services/departmentService.js
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
export default API_BASE_URL;

// ✅ Get all departments for a client
export const getDepartments = async (clientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/client/${clientId}`);
    if (!response.ok) throw new Error("Failed to fetch departments");

    const result = await response.json();
    return result?.data || { departments: [], clientName: "" };
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

// ✅ Add a department (moved from page.tsx)
export const addDepartment = async ({ clientId, departmentName, departmentDescription }) => {
  try {
    const payload = { clientId, departmentName, departmentDescription };

    const response = await fetch(`${API_BASE_URL}/department`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Failed to add department");

    return await response.json();
  } catch (error) {
    console.error("Error adding department:", error);
    throw error;
  }
};

// ✅ Update an existing department
export const updateDepartment = async (selectedDepartment) => {
  try {
    const response = await fetch(`${API_BASE_URL}/department/${selectedDepartment.departmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedDepartment),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Failed to update department");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating department:", error);
    throw error;
  }
};

// ✅ Delete department by ID
export const deleteDepartment = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/department/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Failed to delete department");
    }

    return true;
  } catch (error) {
    console.error("Error deleting department:", error);
    throw error;
  }
};
