/**
 * ThemeCustomizer — Extracted sub-component
 * 
 * Renders the theme color picker modal content.
 * Previously inlined inside Header.js, now a standalone memoized component.
 * 
 * Reads/writes theme via Redux (useUI hook) instead of prop drilling
 * setShowModal, selectedTheme, handleThemeChange through Header → child.
 */
import React, { memo } from "react";
import useUI from "../../../hooks/useUI";
import Modal from "../Modal";

// Available theme colors — extracted as a constant to avoid re-creating on each render
const THEME_COLORS = [
  { label: "Dark", hsl: "240 5% 10%" },
  { label: "Red", hsl: "0 80% 50%" },
  { label: "Blue", hsl: "220 85% 55%" },
  { label: "Green", hsl: "140 70% 40%" },
  { label: "Orange", hsl: "25 95% 55%" },
  { label: "Navy", hsl: "210 90% 25%" },

  // Extra solid colors
  { label: "Purple", hsl: "270 70% 50%" },
  { label: "Teal", hsl: "180 60% 40%" },
  { label: "Pink", hsl: "330 75% 60%" },
  { label: "Yellow", hsl: "50 95% 55%" },
  { label: "Cyan", hsl: "190 90% 50%" },
];


const ThemeCustomizer = () => {
  const { themeColor, updateTheme, closeThemeModal } = useUI();

  const handleThemeChange = (color) => {
    updateTheme(color);
    closeThemeModal();
  };

  return (
    <Modal size="sm" title="Customization de temas" onClose={closeThemeModal}>
      <div className="px-6 py-4">
        <span className="block mb-4 text-sm font-medium">
          Choose your theme
        </span>
        <div className="flex gap-4">
          {THEME_COLORS.map((theme) => (
            <div
              key={theme.label}
              className={`w-8 h-7 rounded-full cursor-pointer border-2 flex items-center justify-center 
                ${
                  themeColor === theme.hsl
                    ? "ring-4 ring-gray-700 border-gray-700"
                    : "border-transparent"
                }
                hover:opacity-80`}
              style={{ backgroundColor: `hsl(${theme.hsl})` }}
              onClick={() => handleThemeChange(theme.hsl)}
            >
              {themeColor === theme.hsl && (
                <span className="text-white text-xs font-bold">✔</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default memo(ThemeCustomizer);
