// AlignUI Checkbox v1.2
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

function CheckboxVisual() {
  const filterId = React.useId();

  return (
    <span className="align-checkbox-visual" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect className="align-checkbox-outer" x="2" y="2" width="16" height="16" rx="4" />
        <g filter={`url(#${filterId})`}>
          <rect className="align-checkbox-inner" x="3.5" y="3.5" width="13" height="13" rx="2.6" />
        </g>
        <defs>
          <filter id={filterId} x="1.5" y="3.5" width="17" height="17" filterUnits="userSpaceOnUse">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.105882 0 0 0 0 0.109804 0 0 0 0 0.113725 0 0 0 0.12 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>
        </defs>
      </svg>
      <svg className="align-checkbox-check" width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 3.5L4 6.5L9 1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <svg className="align-checkbox-indeterminate" width="8" height="2" viewBox="0 0 8 2" fill="none">
        <path d="M0 1H8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </span>
  );
}

const CheckboxRoot = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...rest }, forwardedRef) => (
  <CheckboxPrimitive.Root
    ref={forwardedRef}
    className={`align-checkbox${className ? ` ${className}` : ""}`}
    {...rest}
  >
    <CheckboxVisual />
  </CheckboxPrimitive.Root>
));
CheckboxRoot.displayName = "CheckboxRoot";

export { CheckboxRoot as Root, CheckboxVisual as Visual };
