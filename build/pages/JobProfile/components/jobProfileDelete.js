import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Message } from 'primereact/message';
import DialogDeleteButton from '../../../shared/DialogDeleteButton';
const JobProfileDelete = ({ visible, onHide, onDelete, jobProfile, clients, loading = false, }) => {
    const [error, setError] = useState(null);
    const handleDelete = () => {
        onDelete();
    };
    const handleHide = () => {
        setError(null);
        onHide();
    };
    const footer = (_jsx("div", { className: "flex justify-content-end gap-2", children: _jsx(DialogDeleteButton, { onCancel: handleHide, onDelete: handleDelete, cancelDisabled: loading, deleteDisabled: loading }) }));
    if (!jobProfile)
        return null;
    // Look up clientName and departmentName from clients array
    const client = clients.find(c => c.clientId === jobProfile.clientId);
    const clientName = client?.clientName || jobProfile.clientName || '-';
    const departmentName = client?.departments.find(d => d.departmentId === jobProfile.departmentId)?.departmentName || jobProfile.departmentName || '-';
    return (_jsxs(Dialog, { visible: visible, header: "Delete Job Profile", style: { width: '30rem' }, modal: true, onHide: handleHide, footer: footer, draggable: false, resizable: false, children: [error && (_jsx(Message, { severity: "error", text: error, className: "mb-3 w-full" })), _jsx("div", { className: "bg-surface-50 p-3 border-round mb-4", children: _jsxs("div", { className: "grid", children: [_jsx("div", { className: "col-12", children: _jsx("strong", { children: "Job Profile Details:" }) }), _jsx("div", { className: "col-6", children: _jsx("span", { className: "text-color-secondary", children: "Job Profile ID:" }) }), _jsx("div", { className: "col-6", children: jobProfile.jobProfileId }), _jsx("div", { className: "col-6", children: _jsx("span", { className: "text-color-secondary", children: "Client:" }) }), _jsx("div", { className: "col-6", children: clientName }), _jsx("div", { className: "col-6", children: _jsx("span", { className: "text-color-secondary", children: "Department:" }) }), _jsx("div", { className: "col-6", children: departmentName }), _jsx("div", { className: "col-6", children: _jsx("span", { className: "text-color-secondary", children: "Role:" }) }), _jsx("div", { className: "col-6", children: jobProfile.jobRole }), _jsx("div", { className: "col-6", children: _jsx("span", { className: "text-color-secondary", children: "Positions:" }) }), _jsx("div", { className: "col-6", children: jobProfile.positions }), _jsx("div", { className: "col-6", children: _jsx("span", { className: "text-color-secondary", children: "Location:" }) }), _jsx("div", { className: "col-6", children: jobProfile.location || '-' }), _jsx("div", { className: "col-6", children: _jsx("span", { className: "text-color-secondary", children: "Status:" }) }), _jsx("div", { className: "col-6", children: _jsx("span", { className: `
              inline-flex align-items-center px-2 py-1 border-round text-sm
              ${jobProfile.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : ''}
              ${jobProfile.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${jobProfile.status === 'Closed' ? 'bg-green-100 text-green-800' : ''}
              ${jobProfile.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
            `, children: jobProfile.status }) })] }) }), _jsx("div", { className: "text-center", children: _jsx("p", { className: "m-0 text-color-secondary", children: "Are you sure you want to delete this job profile?" }) })] }));
};
export default JobProfileDelete;
