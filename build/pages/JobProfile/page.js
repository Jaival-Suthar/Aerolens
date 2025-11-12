import { jsx as _jsx } from "react/jsx-runtime";
import JobProfileMain from './components/jobProfileTable';
const JobProfile = () => {
    return (_jsx("div", { className: "p-2", children: _jsx(JobProfileMain, {}) }));
};
export default JobProfile;
