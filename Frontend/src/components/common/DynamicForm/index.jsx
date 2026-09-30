/**
 * DynamicForm — Memoized
 *
 * Renders a dynamic form from a config array. Wired with validation,
 * touched state, keyboard shortcuts (Enter submits on last field,
 * Escape resets/closes) and loading/disabled handling.
 */
import React, { memo, useEffect, useState } from "react";
import FormField from "../../../features/clients/common/FormField";
import CustomTimePicker from "../CustomTimePicker";
import CustomDatePicker from "../CutomDatePicker";
import CustomCheckbox from "../CustomCheckbox";
import CustomTextArea from "../CustomTextArea";
import InputField from "../InputField";
import useValidation from "../../../hooks/useValidation";

const DynamicForm = memo(({
  error_message,
  formConfig,
  className = "",
  footer,
  onSubmit,
  initialData = {},
  onClose,
  loading = false,
}) => {
  const [formState, setFormState] = useState(
    formConfig.reduce((acc, field) => {
      acc[field.name] = initialData[field.name] || "";
      return acc;
    }, {})
  );

  const rules = React.useMemo(() => {
    return formConfig.reduce((acc, field) => {
      if (field.required) {
        acc[field.name] = { required: true, label: field.label, requiredMessage: `${field.label} is required.` };
      }
      return acc;
    }, {});
  }, [formConfig]);

  const { errors, touched, handleBlur, validateForm, setErrors, resetValidation } =
    useValidation(rules);

  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormState((prev) => ({
        ...prev,
        ...formConfig.reduce((acc, field) => {
          if (
            initialData[field.name] !== undefined ||
            initialData[field.name] !== null
          )
            acc[field.name] = initialData[field.name];
          return acc;
        }, {}),
      }));
    }
  }, [initialData, formConfig]);

  const handleChange = (name, value, field) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (field.onChange) {
      field.onChange?.(value);
    }
  };

  const handleBlurField = (field) => {
    handleBlur(field.name, formState[field.name]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm(formState)) return;
    onSubmit(formState);
  };

  const handleReset = () => {
    setFormState(
      formConfig.reduce((acc, field) => {
        acc[field.name] = initialData[field.name] || "";
        return acc;
      }, {})
    );
    resetValidation();
  };

  const lastFieldName = formConfig.length > 0 ? formConfig[formConfig.length - 1].name : null;

  const handleFormKeyDown = (e) => {
    if (e.key === "Enter") {
      const target = e.target;
      const isField = target && target.name === lastFieldName;
      if (isField && typeof handleSubmit === "function") {
        e.preventDefault();
        handleSubmit(e);
      }
    } else if (e.key === "Escape") {
      if (onClose) onClose();
      else handleReset();
    }
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} noValidate>
      {error_message && (
        <div role="alert" className="text-red py-4 px-1 text-lg text-center font-medium bg-[#F6F6F6] rounded-lg shadow-sm">
          {error_message}
        </div>
      )}
      <div className={`grid ${className} gap-4`}>
        {formConfig.map((field) => {
          const gridClass = field.colSpan || "col-span-1";
          // FIX for [object Object]: Ensure we pass a string, never an object
          const fieldValue = formState[field.name] || "";

          return (
            <div key={field.name} className={gridClass}>
              {(() => {
                switch (field.fieldType) {
                  case "input":
                    return (
                      <InputField
                        id={field.name}
                        name={field.name}
                        label={field.label}
                        value={fieldValue}
                        type={field.type}
                        placeholder={field.placeholder}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value, field)
                        }
                        onBlur={() => handleBlurField(field)}
                        error={errors[field.name]}
                        touched={touched[field.name]}
                        disabled={field.disabled || loading}
                      />
                    );

                  case "textarea":
                    return (
                      <CustomTextArea
                        id={field.name}
                        name={field.name}
                        label={field.label}
                        placeholder={field.placeholder}
                        value={formState[field.name]}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value, field)
                        }
                        onBlur={() => handleBlurField(field)}
                        error={errors[field.name]}
                        touched={touched[field.name]}
                        disabled={field.disabled || loading}
                      />
                    );

                  // ADDED: Case for file upload
                  case "file":
                    return (
                      <FormField
                        type="select"
                        label={field.label}
                        name={field.name}
                        options={field.options}
                        placeholder={field.placeholder}
                        value={formState[field.name]}
                        onChange={(value) =>
                          handleChange(field.name, value, field)
                        }
                        error={errors[field.name]}
                      />
                    );

                  case "select":
                  case "search-select":
                    return (
                      <FormField
                        type={field.fieldType}
                        label={field.label}
                        name={field.name}
                        options={field.options}
                        placeholder={field.placeholder}
                        value={formState[field.name]}
                        onChange={(value) =>
                          handleChange(field.name, value, field)
                        }
                        error={errors[field.name]}
                        disabled={field.disabled || loading}
                      />
                    );
                  case "checkbox":
                    return (
                      <CustomCheckbox
                        label={field.label}
                        name={field.name}
                        checked={!!formState[field.name]}
                        onChange={(e) =>
                          handleChange(field.name, e.target.checked, field)
                        }
                        onBlur={() => handleBlurField(field)}
                        error={errors[field.name]}
                        disabled={field.disabled || loading}
                      />
                    );
                  case "radio":
                    return (
                      <FormField
                        type="radio"
                        label={field.label}
                        name={field.name}
                        options={field.options}
                        value={formState[field.name]}
                        onChange={(value) =>
                          handleChange(field.name, value, field)
                        }
                        error={errors[field.name]}
                        className={field.className}
                      />
                    );
                  case "datePicker":
                    return (
                      <CustomDatePicker
                        label={field.label}
                        name={field.name}
                        value={formState[field.name]}
                        onChange={(date) =>
                          handleChange(field.name, date, field)
                        }
                        onBlur={() => handleBlurField(field)}
                        error={errors[field.name]}
                        touched={touched[field.name]}
                        disabled={field.disabled || loading}
                      />
                    );
                  case "timePicker":
                    return (
                      <CustomTimePicker
                        label={field.label}
                        name={field.name}
                        value={formState[field.name]}
                        onChange={(value) =>
                          handleChange(field.name, value, field)
                        }
                        onBlur={() => handleBlurField(field)}
                        error={errors[field.name]}
                        touched={touched[field.name]}
                        disabled={field.disabled || loading}
                      />
                    );
                  default:
                    return <>{field.children}</>;
                }
              })()}
            </div>
          );
        })}
      </div>
      {footer && <div style={{ marginTop: "1rem" }}>{footer}</div>}
    </form>
  );
});

export default DynamicForm;