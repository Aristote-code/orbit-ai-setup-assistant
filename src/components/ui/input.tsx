// AlignUI Input v1.2
import * as React from "react";

type InputSize = "medium" | "small" | "xsmall";

function InputRoot({
  className,
  size = "medium",
  hasError = false,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { size?: InputSize; hasError?: boolean }) {
  return (
    <div
      className={`align-input-root align-input-root--${size}${hasError ? " has-error" : ""}${className ? ` ${className}` : ""}`}
      {...rest}
    />
  );
}

function InputWrapper({ className, ...rest }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`align-input-wrapper${className ? ` ${className}` : ""}`} {...rest} />;
}

const InputElement = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...rest }, forwardedRef) => (
    <input ref={forwardedRef} type={type} className={`align-input${className ? ` ${className}` : ""}`} {...rest} />
  ),
);
InputElement.displayName = "InputElement";

function InputIcon({ className, ...rest }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={`align-input-icon${className ? ` ${className}` : ""}`} {...rest} />;
}

function InputAffix({ className, ...rest }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={`align-input-affix${className ? ` ${className}` : ""}`} {...rest} />;
}

export { InputRoot as Root, InputWrapper as Wrapper, InputElement as Input, InputIcon as Icon, InputAffix as Affix };
