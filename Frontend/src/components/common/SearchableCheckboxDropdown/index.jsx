import React, { memo, useState, useRef, useEffect } from 'react';
import { DownArrow, SearchIcon } from "../../../assets/data/icons";
import useClickOutside from '../../../hooks/useClickOutside';
import CustomCheckbox from '../CustomCheckbox';

const SearchableCheckboxDropdown = memo(({
  options,
  value,
  onChange,
  placeholder = "Search & select...",
  className = "",
  maxHeight = "280px",
  disabledValues = [],
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapperRef = useClickOutside(() => setIsOpen(false));
  const searchInputRef = useRef(null);
  const optionRefs = useRef([]);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 50);
    }
  }, [isOpen]);

  const allSelected = options.length > 0 && value.length === options.length;
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );
  const hasResults = filteredOptions.length > 0;
  const selectedCount = value.length;

  const disabledSet = new Set(disabledValues);
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allVals = options.map((opt) => opt.value);
      onChange([...new Set([...disabledValues, ...allVals])]);
    } else {
      onChange([...disabledValues]);
    }
  };

  const handleOptionChange = (optionValue) => {
    if (disabledSet.has(optionValue)) return;
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearch("");
      setFocusedIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          const option = filteredOptions[focusedIndex];
          handleOptionChange(option.value);
        }
        break;
      default:
        break;
    }
  };

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [focusedIndex]);

  const getDisplayText = () => {
    if (selectedCount === 0) return placeholder;
    if (selectedCount === 1) return `${selectedCount} item selected`;
    return `${selectedCount} items selected`;
  };

  return (
    <div 
      className={`relative w-full ${className}`} 
      ref={wrapperRef}
      {...rest}
    >
      {/* Dropdown Trigger with Integrated Search */}
      <div
        className="relative w-full cursor-pointer"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="relative w-full bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          {/* Search Icon */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <SearchIcon className="w-4 h-4" />
          </div>

          {/* Main Input */}
          <input
            ref={searchInputRef}
            type="text"
            value={isOpen ? search : getDisplayText()}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => {
              if (!isOpen) setIsOpen(true);
            }}
            placeholder={placeholder}
            className="w-full text-sm text-gray-700 bg-transparent pl-9 pr-20 py-2.5 rounded-lg focus:outline-none cursor-text"
            readOnly={!isOpen}
          />

          {/* Selection Badge + Arrow */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {selectedCount > 0 && !isOpen && (
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {selectedCount}
              </span>
            )}
            <div className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
              <DownArrow />
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute w-full mt-2 bg-white shadow-xl border border-gray-200 rounded-xl z-[2147483647] overflow-hidden animate-fadeIn">
          <div className="max-h-[280px] overflow-y-auto py-2">
            {/* "Select All" Option */}
            <div
              className={`px-4 py-2.5 text-sm flex items-center border-b border-gray-100 ${
                allSelected ? "bg-primary/5" : "hover:bg-gray-50"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <CustomCheckbox
                label={<span className="font-medium text-gray-700">Select All</span>}
                checked={allSelected}
                onChange={handleSelectAll}
                className="w-full"
                tickColor="text-white"
              />
            </div>

            {/* Options List */}
            {hasResults ? (
              <div className="py-1">
                {filteredOptions.map((option, index) => {
                  const isSelected = value.includes(option.value);
                  const isFocused = focusedIndex === index;
                  const isDisabled = disabledSet.has(option.value);
                  return (
                    <div
                      key={option.value}
                      ref={el => optionRefs.current[index] = el}
                      className={`px-4 py-2.5 text-sm flex items-center transition-colors ${
                        isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                      } ${isSelected ? "bg-primary/5" : ""} ${isFocused && !isDisabled ? "bg-gray-100" : !isDisabled ? "hover:bg-gray-50" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDisabled) handleOptionChange(option.value);
                      }}
                      onMouseEnter={() => setFocusedIndex(index)}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={isDisabled}
                    >
                      <CustomCheckbox
                        label={option.label}
                        checked={isSelected}
                        onChange={() => {}}
                        disabled={isDisabled}
                        className="w-full pointer-events-none"
                        tickColor="text-white"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                <p className="font-medium">No results found</p>
                <p className="text-xs mt-1">Try adjusting your search</p>
              </div>
            )}
          </div>

          {/* Footer with summary */}
          {selectedCount > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-600">
                {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange([...disabledValues]); }}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
});

SearchableCheckboxDropdown.displayName = 'SearchableCheckboxDropdown';

export default SearchableCheckboxDropdown;