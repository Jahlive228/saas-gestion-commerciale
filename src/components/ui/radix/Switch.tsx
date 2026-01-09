"use client";

import React, { forwardRef } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(({
  checked,
  onCheckedChange,
  disabled = false,
  className = "",
  size = "md",
}, ref) => {
  const sizeClasses = {
    sm: "h-5 w-9",
    md: "h-6 w-11",
  };

  const thumbSizeClasses = {
    sm: "h-4 w-4 data-[state=checked]:translate-x-4",
    md: "h-5 w-5 data-[state=checked]:translate-x-5",
  };

  return (
    <SwitchPrimitive.Root
      ref={ref}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={`
        relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent
        transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${checked ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <SwitchPrimitive.Thumb
        className={`
          pointer-events-none block rounded-full bg-white shadow-lg ring-0
          transition-transform duration-200 ease-in-out
          ${thumbSizeClasses[size]}
        `}
      />
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = SwitchPrimitive.Root.displayName;

export default Switch;