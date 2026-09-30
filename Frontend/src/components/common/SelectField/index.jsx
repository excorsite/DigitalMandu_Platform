/**
 * SelectField Component — Refactored
 *
 * CHANGES:
 * - Replaced manual click-outside with reusable useClickOutside hook
 * - Wrapped in React.memo for performance
 * - Same visual behavior as before
 */
import React, { memo, useCallback, useEffect, useId, useRef, useState } from "react";
import { DownArrow } from "../../../assets/data/icons";
import useClickOutside from "../../../hooks/useClickOutside";

const CustomSelectField = memo(({
  hasAccess = true,
  label,
  placeholder = "Select option",
  value,
  onChange,
  error,
  options = [],
  className = "",
  disabled = false,
  ...rest
}) => {
  const isDisabled = !hasAccess || disabled;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const inputRef = useRef(null);
  const selectRef = useRef(null);
  const generatedId = useId();
  const controlId = rest.id || rest.name || generatedId;
  const nativeSelectId = `${controlId}-native`;
  const listboxId = `${controlId}-listbox`;

  // Reusable hook replaces manual click-outside pattern
  const dropdownRef = useClickOutside(() => {
    setIsOpen(false);
    setSearchTerm("");
  });

  const getOptionLabel = useCallback(
    (val) => {
      const found = options.find((opt) => String(opt.value ?? opt) === String(val));
      if (!found) return "";
      const lab = found?.label ?? found;
      return typeof lab === 'object' ? String(lab?.label ?? lab?.value ?? '') : String(lab);
    },
    [options]
  );

  const filteredOptions = options.filter((option) =>
    String(option.label ?? option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (selected) => {
    if (selected?.disabled) {
      return;
    }
    const val = selected.value ?? selected;
    const label = getOptionLabel(val);

    // Update display and search
    setDisplayValue(label);
    setSearchTerm("");
    setIsOpen(false);

    // Call onChange directly with proper event structure
    if (onChange && selectRef.current) {
      selectRef.current.value = val;
      // Create a proper synthetic event object that matches what React expects
      const syntheticEvent = {
        target: {
          name: selectRef.current.name,
          value: val
        },
        currentTarget: {
          name: selectRef.current.name,
          value: val
        }
      };
      onChange(syntheticEvent);
    }
  };

  useEffect(() => {
    const selectedLabel = getOptionLabel(value);
    setDisplayValue(selectedLabel);
  }, [value, options, getOptionLabel]);

  const handleInputClick = (e) => {
    if (isDisabled) {
      return;
    }

    if (isOpen) {
      setIsOpen(false);
      setSearchTerm("");
    } else {
      setIsOpen(true);
      setSearchTerm("");
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (e) => {
    if (isDisabled) {
      return;
    }

    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  // Click-outside handling is now done by useClickOutside hook above

  return (
    <div className={`flex flex-col w-full ${className} ${isDisabled ? "pointer-events-none opacity-75" : ""}`.trim()} ref={dropdownRef}>
      {label && (
        <label htmlFor={controlId} className="text-sm font-normal text-primary mb-1">{label}</label>
      )}

      <div className="relative w-full">
        {/* Hidden native select for compatibility */}
        <select
          ref={selectRef}
          id={nativeSelectId}
          name={rest.name}
          value={typeof value === 'object' ? String(value?.value ?? '') : String(value ?? '')}
          onChange={onChange}
          disabled={isDisabled}
          className="hidden"
          aria-hidden="true"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option, index) => {
            const optVal = option.value ?? option;
            const optLabelRaw = option.label ?? option;
            const optLabel = typeof optLabelRaw === 'object' ? String(optLabelRaw?.label ?? optLabelRaw?.value ?? '') : String(optLabelRaw ?? '');
            const optValStr = typeof optVal === 'object' ? String(optVal?.value ?? '') : String(optVal ?? '');
            return (
            <option
              key={index}
              value={optValStr}
              id={optLabel}
              disabled={Boolean(option.disabled)}
            >
              {optLabel}
            </option>
            );
          })}
        </select>

        {/* Custom input styled as select */}
        <input
          ref={inputRef}
          id={controlId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          value={isOpen ? searchTerm : displayValue || ""}
          placeholder={placeholder}
          onChange={handleInputChange}
          onClick={handleInputClick}
          readOnly={!isOpen}
          disabled={isDisabled}
          className="w-full text-sm text-gray-700 bg-[#F6F6F6] px-3 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <DownArrow />
        </div>

        {isOpen && (
          <div
            id={listboxId}
            role="listbox"
            className="absolute w-full mt-1 bg-white  shadow-lg text-gray-700   border-gray-200 border-2 rounded-lg z-[2147483647] max-h-60 overflow-y-auto"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const val = option.value ?? option;
                const rawLabel = option.label ?? option;
                const label = typeof rawLabel === 'object' ? String(rawLabel?.label ?? rawLabel?.value ?? '') : String(rawLabel ?? '');
                const isSelected = String(value) === String(val);
                const isDisabled = Boolean(option.disabled);

                return (
                  <div
                    key={index}
                    className={`px-3 py-2 text-sm ${
                      isDisabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "cursor-pointer hover:bg-gray-100"
                    } ${
                      isSelected && !isDisabled
                        ? "bg-gray-100 font-medium text-primary"
                        : ""
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {label}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400">
                No options found
              </div>
            )}
          </div>
        )}
      </div>
      {error && <span className="text-red text-sm mt-1">{typeof error === 'object' ? String(error?.message ?? error?.label ?? '') : String(error)}</span>}
    </div>
  );
});

export default CustomSelectField;
