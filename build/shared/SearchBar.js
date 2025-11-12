import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FaSearch, FaTimes } from "react-icons/fa";
const SearchBar = ({ placeholder = "Search...", onSearch, debounceMs = 400, }) => {
    const [searchValue, setSearchValue] = useState("");
    // Debounced search handler
    useEffect(() => {
        const handler = setTimeout(() => {
            onSearch(searchValue.trim());
        }, debounceMs);
        return () => clearTimeout(handler);
    }, [searchValue, debounceMs, onSearch]);
    const clearSearch = useCallback(() => {
        setSearchValue("");
        onSearch("");
    }, [onSearch]);
    return (_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsxs("span", { className: "p-input-icon-left flex-1", style: { position: "relative" }, children: [_jsx(FaSearch, { style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#a0a0a0" }, "aria-hidden": "true" }), _jsx(InputText, { value: searchValue, onChange: (e) => setSearchValue(e.target.value), placeholder: placeholder, className: "w-full pl-10" /* padding-left for icon space */, "aria-label": "Search" })] }), searchValue && (_jsx(Button, { onClick: clearSearch, "aria-label": "Clear search", text: true, className: "p-button-text", style: { minWidth: 32, padding: 0, display: "flex", justifyContent: "center", alignItems: "center" }, icon: _jsx(FaTimes, { style: { fontSize: 14, color: "#666" } }) }))] }));
};
export default SearchBar;
