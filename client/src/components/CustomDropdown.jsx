import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

const CustomDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  icon: Icon,
  label,
  className = "",
  renderButton,
  renderOption,
  buttonClassName = "",
  autoWidth = true, // New prop to enable/disable auto-width
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const dropdownHeight = Math.min(options.length * 44 + 16, 300);
        const shouldPlaceAbove =
          spaceBelow < dropdownHeight && rect.top > spaceBelow;

        // Calculate optimal width based on content if autoWidth is enabled
        let optimalWidth = rect.width;
        
        if (autoWidth) {
          // Create a temporary element to measure text width
          const tempDiv = document.createElement("div");
          tempDiv.style.position = "absolute";
          tempDiv.style.visibility = "hidden";
          tempDiv.style.whiteSpace = "nowrap";
          tempDiv.style.fontSize = "14px"; // text-sm
          tempDiv.style.fontWeight = "500"; // font-medium
          tempDiv.style.padding = "0 12px"; // Account for padding
          document.body.appendChild(tempDiv);

          let maxWidth = rect.width; // Start with button width as minimum

          options.forEach((option) => {
            tempDiv.textContent = option.label;
            // Add extra space for icon, padding, and check icon
            const textWidth = tempDiv.offsetWidth + 60; // 60px for icons and spacing
            if (textWidth > maxWidth) {
              maxWidth = textWidth;
            }
          });

          document.body.removeChild(tempDiv);
          optimalWidth = Math.max(maxWidth, rect.width);
        }

        setPosition({
          top: shouldPlaceAbove
            ? rect.top + window.scrollY - dropdownHeight - 8
            : rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: optimalWidth,
        });
      }
      setIsOpen(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    handleClose();
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={
          buttonClassName ||
          `w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 text-sm font-medium text-gray-700 ${
            isOpen ? "ring-2 ring-slate-900 border-slate-900" : ""
          }`
        }
      >
        {renderButton ? (
          renderButton(selectedOption, isOpen)
        ) : (
          <>
            <div className="flex items-center space-x-2">
              {Icon && <Icon className="w-4 h-4 text-gray-400" />}
              <span
                className={selectedOption ? "text-gray-900" : "text-gray-500"}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-300 ease-out ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </>
        )}
      </button>

      {isOpen &&
        createPortal(
          <>
            {/* Backdrop with fade animation */}
            <div
              className={`fixed inset-0 z-[9998] transition-opacity duration-200 ${
                isAnimating ? "opacity-100" : "opacity-0"
              }`}
              onClick={handleClose}
            />

            {/* Dropdown with slide + fade animation */}
            <div
              ref={dropdownRef}
              className={`fixed bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] max-h-[300px] overflow-hidden transition-all duration-200 ease-out ${
                isAnimating
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-2"
              }`}
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                width: `${position.width}px`,
                transformOrigin: "top center",
              }}
            >
              <div className="p-1.5 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {options.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 whitespace-nowrap ${
                      value === option.value
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                    }`}
                    style={{
                      animation: isAnimating
                        ? `slideIn 0.3s ease-out ${index * 30}ms both`
                        : "none",
                    }}
                  >
                    {renderOption ? (
                      renderOption(option, value === option.value)
                    ) : (
                      <>
                        <span className="font-medium">{option.label}</span>
                        {value === option.value && <Check className="w-4 h-4 ml-2 flex-shrink-0" />}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>,
          document.body
        )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Custom scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default CustomDropdown;
