import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import AddButton from '../../../shared/AddButton';
import EditButton from '../../../shared/EditButton';
import DeleteButton from '../../../shared/DeleteButton';
import { FaArrowLeft } from "react-icons/fa";
const ContactViewHeader = ({ onBackClick, onAddContact, selectedContact, onEditContact, onDeleteContact }) => {
    return (_jsxs("div", { className: "flex justify-content-between align-items-center mb-4 w-full", children: [_jsx("div", { className: "flex align-items-center gap-3", children: _jsxs("button", { onClick: onBackClick, className: "flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-400 rounded-lg hover:bg-gray-100 transition", children: [_jsx(FaArrowLeft, {}), "Back to Clients"] }) }), _jsxs("div", { className: "flex gap-2 mr-6", children: [_jsx(AddButton, { onClick: onAddContact }), _jsx(EditButton, { onClick: onEditContact, disabled: !selectedContact?.clientContactId }), _jsx(DeleteButton, { onClick: onDeleteContact, disabled: !selectedContact?.clientContactId })] })] }));
};
export default ContactViewHeader;
