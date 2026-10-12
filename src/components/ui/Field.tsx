import type { InputHTMLAttributes, ReactNode } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  trailing?: ReactNode;
}

export function Field({
  id,
  label,
  hint,
  error,
  optional = false,
  trailing,
  className = "",
  ...props
}: FieldProps) {
  const descriptionId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">(optional)</span>}
      </label>
      {hint && (
        <p id={descriptionId} className="mb-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
      <div className="flex items-center gap-2">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`field-control ${className}`.trim()}
          {...props}
        />
        {trailing}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-[#a32929]">
          {error}
        </p>
      )}
    </div>
  );
}
