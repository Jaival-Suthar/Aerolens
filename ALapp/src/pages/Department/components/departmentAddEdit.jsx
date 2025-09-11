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
    //input field states that will be used for edit and add department
    const [departmentName, setDepartmentName] = useState("");
    const [departmentDescription, setDepartmentDescription] = useState("");
    const [submitted, setSubmitted] = useState(false); // <-- track if user tried to save

    // const [loading, setLoading] = useState(false);
    const isEditMode = selectedDepartment !== null;
    console.log(isEditMode)

    useEffect(() => {
        if (isEditMode) {
            setDepartmentName(selectedDepartment.departmentName || "");
            //this will prefill the form with existing data when in edit mode from the selected department from the component departmentTable.jsx
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
        setSubmitted(true); // 👈 turn on validation
        // this state is used to conditionally apply the "p-invalid" class to the input fields and show error messages if they are empty when the user tries to save.
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
//       // {
//   clientId, //primary key from parent component departmentTable.jsx
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
                // disabled={loading}
            />
            <Button
                label={isEditMode ? "Update" : "Save"}
                icon={isEditMode ? "pi pi-check" : "pi pi-plus"}
                onClick={handleSave}
                // loading={loading}
                disabled={!departmentName.trim()&& !departmentDescription.trim()}
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
  <InputTextarea
    id="departmentName"
    value={departmentName}
    onChange={(e) => setDepartmentName(e.target.value)}
    placeholder="Enter department name"
    required
    className={submitted && !departmentName ? "p-invalid" : ""}
    //this will add a red border to the input field if the user has tried to submit the form without filling it out and the departmnetName is empty
  />
  { submitted &&!departmentName && (
    <small className="p-error">Department Name is required.</small>
  )}
</div>

<div className="field">
  <label htmlFor="departmentDescription" className="font-bold">
    Department Description *
  </label>
  <InputTextarea
    id="departmentDescription"
    value={departmentDescription}
    onChange={(e) => setDepartmentDescription(e.target.value)}
    placeholder="Enter department description"
    required
    className={submitted && !departmentDescription ? "p-invalid" : ""}
    //this will add a red border to the input field if the user has tried to submit the form without filling it out and the departmnetDescription is empty
  />
  { submitted && !departmentDescription && (
    <small className="p-error">Department Description is required.</small>
  )}
</div>
   {/* this will check the asme condition as classname and will make sure the actual message prints. Or else only a red border will show. */}

        </Dialog>
    );
};

export default DepartmentAddEdit;