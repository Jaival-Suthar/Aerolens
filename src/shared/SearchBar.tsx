import React, { useState, useCallback, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FaSearch, FaTimes } from "react-icons/fa";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  onSearch,
  debounceMs = 400,
}) => {
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

  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="p-input-icon-left flex-1" style={{ position: "relative" }}>
        <FaSearch
          style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#a0a0a0" }}
          aria-hidden="true"
        />
        <InputText
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10"  /* padding-left for icon space */
          aria-label="Search"
        />
      </span>
      {searchValue && (
        <Button
          onClick={clearSearch}
          aria-label="Clear search"
          text
          className="p-button-text"
          style={{ minWidth: 32, padding: 0, display: "flex", justifyContent: "center", alignItems: "center" }}
          icon={<FaTimes style={{ fontSize: 14, color: "#666" }} />}
        />
      )}
    </div>
  );
};

export default SearchBar;
