// import React from "react";
// import { PlusIcon } from "../../../assets/data/icons";

// const Button = ({ onClick, label }) => {
//   return (
//     <button
//       className="text-white font-medium py-2 px-2 flex items-center rounded  border-none"
//       onClick={onClick}
//     >
//       {label && <PlusIcon />}
//       <span>{label}</span>
//     </button>
//   );
// };

// const PrimaryButton = ({ onClick, label, type, icon }) => {
//   return (
//     <button
//       type={type}
//       className="text-white text-sm bg-primary font-medium py-2 px-2 flex items-center rounded  border-none"
//       onClick={onClick}
//     >
//       {icon && icon}
//       <span className="ml-2">{label}</span>
//     </button>
//   );
// };

// const SecondaryButton = ({ type = "submit", onClick, label, icon }) => {
//   return (
//     <button
//       type={type}
//       className="text-primary text-sm font-medium py-2 px-2 flex items-center rounded border-2 border-primary"
//       onClick={onClick}
//     >
//       {icon && icon}
//       <span className="ml-2">{label}</span>
//     </button>
//   );
// };

// const OutlineButton = ({ label, type = "submit", onClick, icon }) => {
//   return (
//     <button
//     type={type}
//     className="text-[#1F2635] text-sm font-medium py-2 px-2 flex items-center rounded border-2 border-[#D0D5DD]"
//     onClick={onClick}
//   >
//     {icon && icon}
//     <span className="ml-2">{label}</span>
//   </button>
//   );
// };

// export { Button, PrimaryButton, SecondaryButton, OutlineButton };

import { useRef } from "react";
import { CircularLoader } from "../SkletonLoader";

// Common Button Component
const Button = ({
  hasAccess = true,
  onClick,
  label,
  type = "button",
  icon: Icon,
  variant = "primary", // 'primary', 'secondary', 'outline'
  iconPosition = "left", // 'left', 'right'
  className = "", // Custom className
  loading = false,
  disabled = false,
}) => {
  if (!hasAccess) return null;
  const buttonClasses = {
    primary: "text-white bg-primary border-none",
    danger: "text-white bg-red",
    secondary: "text-primary border-2 border-primary",
    outline: "text-[#1F2635] border-2 border-[#D0D5DD]",
  };

  const isDisabled = disabled || loading;

  const iconElement = Icon ? <Icon /> : null;
  const content =
    label && iconPosition === "left" ? (
      <>
        {iconElement}
        <span className="ml-1">{label}</span>
      </>
    ) : (
      <>
        <span>{label}</span>
        {iconElement}
      </>
    );

  const handleKeyDown = (e) => {
    if (type === "submit" && e.key === "Enter" && !isDisabled && onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <button
      type={type}

      className={`text-sm font-medium py-2 px-8 flex items-center rounded-lg ${buttonClasses[variant]} ${className} ${
        isDisabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      aria-disabled={isDisabled ? true : undefined}
      aria-busy={loading ? true : undefined}
    >
      {loading ? <CircularLoader variant="primary" /> : content}
    </button>
  );
};

const FileUpload = ({
  hasAccess = true,
  onFileSelect,
  label,
  type = "file",
  icon: Icon,
  variant = "primary", // 'primary', 'secondary', 'outline'
  iconPosition = "left", // 'left', 'right'
  className = "", // Custom className
  loading = false,
  disabled = false,
}) => {
  if (!hasAccess) return null;
  const fileInputRef = useRef(null); // Create a reference for the file input field

  const handleFileClick = () => {
    if (disabled || loading) return;
    fileInputRef.current.click();
  };

  const buttonClasses = {
    primary: "text-white bg-primary border-none",
    secondary: "text-primary border-2 border-primary",
    outline: "text-primary border-[1px] border-[#D0D5DD] rounded-lg",
  };

  const isDisabled = disabled || loading;

  const iconElement = Icon ? <Icon /> : null;
  const content =
    label && iconPosition === "left" ? (
      <>
        {iconElement}
        <span className="ml-1">{label}</span>
      </>
    ) : (
      <>
        <span>{label}</span>
        {iconElement}
      </>
    );

  return (
    <div
      onClick={handleFileClick}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-disabled={isDisabled ? true : undefined}
      className={`cursor-pointer py-2 px-4 flex items-center text-sm font-medium  ${buttonClasses[variant]} ${className} ${
        isDisabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef} // Attach the ref
        type={type}
        className="hidden" // Hide the input
        onChange={onFileSelect} // Trigger when a file is selected
        disabled={isDisabled}
      />
      {loading ? <CircularLoader variant="secondary" /> : content}
    </div>
  );
};

// Exporting default Button with different variants for flexibility
const PrimaryButton = (props) => <Button {...props} variant="primary" />;
const DangerButton = (props) => <Button {...props} variant="danger" />;

const SecondaryButton = (props) => <Button {...props} variant="secondary" />;
const OutlineButton = (props) => <Button {...props} variant="outline" />;
const FileUploadButton = (props) => <FileUpload {...props} variant="outline" />;

export {
  Button,
  DangerButton,
  FileUploadButton,
  OutlineButton,
  PrimaryButton,
  SecondaryButton,
};