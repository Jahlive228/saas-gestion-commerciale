"use client";

import React, { forwardRef } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  hint?: string;
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(({
  options,
  placeholder = "Sélectionner...",
  value,
  onValueChange,
  disabled = false,
  className = "",
  error = false,
  hint,
}, ref) => {
  const triggerClasses = [
    "h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30",
    "flex items-center justify-between",
    error
      ? "border-error-500 focus:ring-error-500/10 dark:border-error-500"
      : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800",
    disabled && "cursor-not-allowed opacity-50",
    className
  ].filter(Boolean).join(" ");

  const itemClasses = [
    "relative flex h-9 select-none items-center rounded-md px-3 py-1.5 text-sm outline-none",
    "focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-white",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    "cursor-pointer"
  ].filter(Boolean).join(" ");

  return (
    <div className="relative">
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          ref={ref}
          className={triggerClasses}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="z-9999 max-h-60 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <SelectPrimitive.ScrollUpButton className="flex h-6 cursor-default items-center justify-center bg-white dark:bg-gray-900">
              <ChevronUpIcon className="h-4 w-4 text-gray-400" />
            </SelectPrimitive.ScrollUpButton>

            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={itemClasses}
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute left-2 flex items-center justify-center">
                    <CheckIcon className="h-4 w-4 text-brand-500" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>

            <SelectPrimitive.ScrollDownButton className="flex h-6 cursor-default items-center justify-center bg-white dark:bg-gray-900">
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {/* Optional Hint Text */}
      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;