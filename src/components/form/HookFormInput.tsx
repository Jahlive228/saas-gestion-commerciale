import React from "react";
import { useController, Control, FieldPath, FieldValues } from "react-hook-form";
import Input from "./input/InputField";
import Label from "./Label";

interface HookFormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
  control: Control<TFieldValues>;
  label?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function HookFormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  label,
  required,
  type = "text",
  placeholder,
  className,
  disabled,
}: HookFormInputProps<TFieldValues, TName>) {
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <div>
      {label && (
        <Label>
          {label}
          {required && <span className="text-error-500"> *</span>}
        </Label>
      )}
      <Input
        ref={ref}
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        error={!!error}
        hint={error?.message}
      />
    </div>
  );
}

export default HookFormInput;
