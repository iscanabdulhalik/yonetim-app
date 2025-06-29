import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, type, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    // Number input için özel handler
    const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "number") {
        // Başındaki 0'ları temizle ama değer 0 ise koru
        let value = e.target.value;
        if (value.length > 1 && value.startsWith("0") && value[1] !== ".") {
          value = value.replace(/^0+/, "");
          e.target.value = value || "0";
        }
      }
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-secondary-700"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "block w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-secondary-50 disabled:text-secondary-500",
            error &&
              "border-danger-300 focus:border-danger-500 focus:ring-danger-500",
            className
          )}
          onChange={type === "number" ? handleNumberInput : props.onChange}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-danger-600">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-secondary-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
