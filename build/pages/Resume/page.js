import { jsx as _jsx } from "react/jsx-runtime";
import ResumeTable from './components/resumeTable';
//Parent component for Resume section
const Resume = () => {
    return (_jsx("div", { className: "p-2", children: _jsx(ResumeTable, {}) }));
};
export default Resume;
