import React, { useState, useCallback, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceMs?: number; // optional debounce to avoid rapid calls
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
      <span className="p-input-icon-left flex-1">
        <i className="pi pi-search" />
        <InputText
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={placeholder}
          className="w-full"
          aria-label="Search"
        />
      </span>
      {searchValue && (
        <Button
          icon="pi pi-times"
          className="p-button-text"
          onClick={clearSearch}
          aria-label="Clear search"
        />
      )}
    </div>
  );
};

export default SearchBar;
