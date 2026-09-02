import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

const fieldBase =
  "w-full rounded-sm border border-line bg-white px-3.5 h-11 text-sm text-ink placeholder:text-ink/40 focus:border-ink outline-none transition-colors";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={clsx(fieldBase, error && "border-brick", className)}
        aria-invalid={!!error}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
      {error && <p className="mt-1 text-xs text-brick">{error}</p>}
    </div>
  ),
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={clsx(fieldBase, "h-auto min-h-28 py-2.5 resize-y", error && "border-brick", className)}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-brick">{error}</p>}
    </div>
  ),
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className, children, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={clsx(fieldBase, "appearance-none bg-white", error && "border-brick", className)}
        aria-invalid={!!error}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-brick">{error}</p>}
    </div>
  ),
);
Select.displayName = "Select";
