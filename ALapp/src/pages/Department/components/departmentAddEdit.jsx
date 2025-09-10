// src/pages/Department/components/DepartmentAddEdit.jsx
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { addDepartment, updateDepartment } from "../services/useDepartment";

const DepartmentAddEdit = ({
    visible,
    onHide,
    selectedDepartment,
    clientId,
    onSuccess
}) => {
    const [departmentName, setDepartmentName] = useState("");
    const [departmentDescription, setDepartmentDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const isEditMode = selectedDepartment !== null;
    console.log(isEditMode)

    useEffect(() => {
        if (isEditMode) {
            setDepartmentName(selectedDepartment.departmentName || "");
            setDepartmentDescription(selectedDepartment.departmentDescription || "");
        } else {
            // Reset form for add mode
            setDepartmentName("");
            setDepartmentDescription("");
        }
    }, [selectedDepartment, visible]);
    // the effect re-runs whenever:

    // A new department is selected (selectedDepartment changes).
    
    // Or the dialog/modal opens/closes (visible changes).
    const handleSave = async () => {
        if (!departmentName.trim()) {
            // You can add toast notification here if needed
            return;
        }

        setLoading(true);
        try {
            if (isEditMode ) {
              
                await updateDepartment({
                    ...selectedDepartment,
                    departmentName: departmentName.trim(),
                    departmentDescription: departmentDescription.trim()
                });
                console.log(`Department "${departmentName}" updated successfully`);
            } else {
                await addDepartment({
                    clientId,
                    departmentName,
                    departmentDescription
                });
                console.log("Adding new department for clientId:", clientId);
            }
//             // {
//   clientId,
//   departmentName,           // comes directly from state
//   departmentDescription     // comes directly from state connecting to the adddepartment function in useDepartment.js
// }

                //That happens when you submit/save the form in your <Dialog>. Typically, you’ll have something like:
            onSuccess(); // Reload departments
            onHide(); // Close dialog

            // Reset form
            setDepartmentName("");
            setDepartmentDescription("");
        } catch (error) {
            console.error("Error saving department:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setDepartmentName("");
        setDepartmentDescription("");
        onHide();
    };

    const dialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button
                label="Cancel"
                icon="pi pi-times"
                outlined
                onClick={handleCancel} // Reset form on cancel
                disabled={loading}
            />
            <Button
                label={isEditMode ? "Update" : "Save"}
                icon={isEditMode ? "pi pi-check" : "pi pi-plus"}
                onClick={handleSave}
                loading={loading}
                disabled={!departmentName.trim()}
            />
        </div>


    );
    return (
        <Dialog
            visible={visible}
            onHide={handleCancel}
            header={isEditMode ? "Edit Department" : "Add New Department"}
            footer={dialogFooter}
            style={{ width: "450px" }}
            modal
            className="p-fluid"
        >
            <div className="field">
                <label htmlFor="departmentName" className="font-bold">
                    Department Name *
                </label>

                <input
                    type="text"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                />
                   {/* will store in departmentsname state that has been passed */}
            </div>

            <div className="field">
                <label htmlFor="departmentDescription" className="font-bold">
                    Department Description
                </label>
                <InputTextarea
                    id="departmentDescription"
                    value={departmentDescription}
                    onChange={(e) =>setDepartmentDescription(e.target.value)}
                    placeholder="Enter department description (optional)"
                    rows={4}
                />
            </div>
        </Dialog>
    );
};

export default DepartmentAddEdit;