import React, { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_TRIGGER_CLASS =
  "w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18] text-left flex items-center justify-between gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

const normalizeOptions = (options) =>
  (options || []).map((opt) =>
    typeof opt === "string" || typeof opt === "number"
      ? { value: String(opt), label: String(opt), disabled: false }
      : {
          value: opt.value,
          label: opt.label ?? opt.value,
          disabled: Boolean(opt.disabled),
        }
  );

/**
 * A custom-styled dropdown that replaces the native <select>.
 *
 * Native <select> popups are sized/positioned by the browser (to fit the
 * widest option) and can't be forced to match the trigger's width via CSS —
 * that's what makes native dropdowns look misaligned next to each other.
 * This component renders its own popup absolutely positioned to exactly the
 * trigger's width instead.
 *
 * `onChange` is called with a `{ target: { name, value } }` shape so it's a
 * drop-in replacement for existing `onChange={handleChange}` /
 * `onChange={(e) => setX(e.target.value)}` handlers written for a native
 * <select> — no handler changes needed at call sites.
 */
export default function StyledSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  required = false,
  className,
  triggerClassName,
  fullWidth = true,
}) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const typeaheadRef = useRef("");
  const typeaheadTimerRef = useRef(null);

  const normalized = useMemo(() => normalizeOptions(options), [options]);

  const selectedIndex = normalized.findIndex(
    (opt) => String(opt.value) === String(value ?? "")
  );
  const selectedOption = selectedIndex >= 0 ? normalized[selectedIndex] : null;

  useEffect(() => {
    if (!open) return undefined;

    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const emitChange = (nextValue) => {
    if (onChange) {
      onChange({ target: { name, value: nextValue } });
    }
  };

  const openList = () => {
    if (disabled) return;
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const closeList = () => setOpen(false);

  const commitHighlighted = (index) => {
    const opt = normalized[index];
    if (!opt || opt.disabled) return;
    emitChange(opt.value);
    closeList();
    triggerRef.current?.focus();
  };

  const moveHighlight = (delta) => {
    if (normalized.length === 0) return;
    let next = highlightedIndex;
    for (let i = 0; i < normalized.length; i++) {
      next = (next + delta + normalized.length) % normalized.length;
      if (!normalized[next]?.disabled) break;
    }
    setHighlightedIndex(next);
  };

  const handleTypeahead = (char) => {
    typeaheadRef.current += char.toLowerCase();
    clearTimeout(typeaheadTimerRef.current);
    typeaheadTimerRef.current = setTimeout(() => {
      typeaheadRef.current = "";
    }, 600);

    const startFrom = open ? highlightedIndex + 1 : selectedIndex + 1;
    const match = normalized.findIndex(
      (opt, i) =>
        i >= startFrom &&
        !opt.disabled &&
        opt.label.toLowerCase().startsWith(typeaheadRef.current)
    );
    const fallbackMatch =
      match === -1
        ? normalized.findIndex(
            (opt) =>
              !opt.disabled && opt.label.toLowerCase().startsWith(typeaheadRef.current)
          )
        : match;

    if (fallbackMatch !== -1) {
      if (open) {
        setHighlightedIndex(fallbackMatch);
      } else {
        emitChange(normalized[fallbackMatch].value);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openList();
        else moveHighlight(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openList();
        else moveHighlight(-1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!open) openList();
        else commitHighlighted(highlightedIndex);
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          closeList();
        }
        break;
      case "Tab":
        closeList();
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          handleTypeahead(e.key);
        }
    }
  };

  const displayLabel = selectedOption?.label || placeholder || "";

  return (
    <div
      ref={wrapperRef}
      className={`relative ${fullWidth ? "w-full" : "inline-block"} ${className || ""}`}
    >
      <button
        id={id}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-required={required}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={handleKeyDown}
        className={triggerClassName || DEFAULT_TRIGGER_CLASS}
      >
        <span
          className={`truncate ${!selectedOption ? "text-gray-400" : ""}`}
        >
          {displayLabel}
        </span>
        <svg
          className={`w-4 h-4 flex-shrink-0 text-[#DC6D18] transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 z-50 max-h-60 overflow-y-auto rounded-xl border-2 border-[#DC6D18] bg-white shadow-lg py-1"
        >
          {normalized.length === 0 && (
            <li className="px-4 py-2 text-sm text-gray-400 italic">No options</li>
          )}

          {normalized.map((opt, index) => {
            const isSelected = index === selectedIndex;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={`${opt.value}-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(e) => {
                  // prevent the trigger's blur/outside-click handler from
                  // firing before the click registers
                  e.preventDefault();
                }}
                onClick={() => !opt.disabled && commitHighlighted(index)}
                className={`px-4 py-2 text-sm cursor-pointer truncate ${
                  opt.disabled
                    ? "text-gray-300 cursor-not-allowed"
                    : isHighlighted
                    ? "bg-[#FFEFE1] text-[#DC6D18]"
                    : "text-gray-700"
                } ${isSelected ? "font-semibold" : ""}`}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
