/**
 * CustomCheckboxDropdown — Styled like CustomSelectField
 * 
 * BEHAVIOR:
 * - Multi-select with checkboxes
 * - Trigger looks like SelectField (gray bg, rounded, arrow)
 * - Dropdown panel matches SelectField's style
 * - Options highlight on hover/selection
 * - Display shows count only (e.g., "3") when items selected
 */
import React, { memo, useState } from 'react';
import { DownArrow } from "../../../assets/data/icons";
import useClickOutside from '../../../hooks/useClickOutside';
import CustomCheckbox from '../CustomCheckbox';

const CustomCheckboxDropdown = memo(({
  options,
  value,
  onChange,
  placeholder = "Select options",
  className = "",
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useClickOutside(() => setIsOpen(false));

  const allSelected = options.length > 0 && value.length === options.length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onChange(options.map(opt => opt.value));
    } else {
      onChange([]);
    }
  };

  const handleOptionChange = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  // ✅ Display only the count (e.g., "3") when items selected
  const getDisplayValue = () => {
    if (value.length === 0) return placeholder;
    return `${value.length}`;
  };

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef} {...rest}>
      {/* Trigger — styled like SelectField input */}
      <div
        className="relative w-full cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <input
          type="text"
          readOnly
          value={getDisplayValue()}
          placeholder={placeholder}
          className="w-full text-sm text-gray-700 bg-[#F6F6F6] px-3 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <DownArrow />
        </div>
      </div>

      {/* Dropdown Panel — matches SelectField */}
      {isOpen && (
        <div className="absolute w-full mt-1 bg-white shadow-lg text-gray-700 border-gray-200 border-2 rounded-lg z-[2147483647] max-h-60 overflow-y-auto">
          <div className="py-1">
            {/* "All" option */}
            <div
              className={`px-3 py-2 text-sm flex items-center ${
                allSelected
                  ? "bg-gray-100 font-medium text-primary"
                  : "hover:bg-gray-100"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <CustomCheckbox
                label="All"
                checked={allSelected}
                onChange={handleSelectAll}
                className="w-full"
                tickColor="text-white"
              />
            </div>

            <div className="border-t border-gray-200 my-1" />

            {/* Individual options */}
            {options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <div
                  key={option.value}
                  className={`px-3 py-2 text-sm flex items-center ${
                    isSelected
                      ? "bg-gray-100 font-medium text-primary"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <CustomCheckbox
                    label={option.label}
                    checked={isSelected}
                    onChange={() => handleOptionChange(option.value)}
                    className="w-full"
                    tickColor="text-white"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

export default CustomCheckboxDropdown;
