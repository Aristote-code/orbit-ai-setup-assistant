// AlignUI Textarea v1.2
import * as React from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
  simple?: boolean;
};

const TextareaRoot = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError = false, simple = false, ...rest }, forwardedRef) => (
    <textarea
      ref={forwardedRef}
      className={`align-textarea${simple ? " align-textarea--simple" : ""}${hasError ? " has-error" : ""}${className ? ` ${className}` : ""}`}
      {...rest}
    />
  ),
);
TextareaRoot.displayName = "TextareaRoot";

export { TextareaRoot as Root };
