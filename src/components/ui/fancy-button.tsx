// AlignUI FancyButton v1.2
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import type { PolymorphicComponentProps } from "@/utils/polymorphic";
import { recursiveCloneChildren } from "@/utils/recursive-clone-children";
import { tv, type VariantProps } from "@/utils/tv";

const FANCY_BUTTON_ROOT_NAME = "FancyButtonRoot";
const FANCY_BUTTON_ICON_NAME = "FancyButtonIcon";

export const fancyButtonVariants = tv({
  slots: {
    root: "fancy-button",
    icon: "fancy-button__icon",
  },
  variants: {
    variant: {
      neutral: {
        root: "fancy-button--neutral",
      },
      primary: {
        root: "fancy-button--primary",
      },
      destructive: {
        root: "fancy-button--destructive",
      },
      basic: {
        root: "fancy-button--basic",
      },
      // Product extension: AlignUI anatomy with Zemo's Figma success token.
      success: {
        root: "fancy-button--success",
      },
    },
    size: {
      medium: {
        root: "fancy-button--medium",
        icon: "fancy-button__icon--medium",
      },
      small: {
        root: "fancy-button--small",
        icon: "fancy-button__icon--small",
      },
      xsmall: {
        root: "fancy-button--xsmall",
        icon: "fancy-button__icon--xsmall",
      },
    },
  },
  compoundVariants: [
    {
      variant: ["neutral", "primary", "destructive", "success"],
      class: {
        root: "fancy-button--filled",
      },
    },
  ],
  defaultVariants: {
    variant: "neutral",
    size: "medium",
  },
});

type FancyButtonSharedProps = VariantProps<typeof fancyButtonVariants>;

type FancyButtonProps = FancyButtonSharedProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  };

const FancyButtonRoot = React.forwardRef<HTMLButtonElement, FancyButtonProps>(
  ({ asChild, children, variant, size, className, ...rest }, forwardedRef) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : "button";
    const { root } = fancyButtonVariants({ variant, size });

    const sharedProps: FancyButtonSharedProps = {
      variant,
      size,
    };

    const extendedChildren = recursiveCloneChildren(
      children,
      sharedProps,
      [FANCY_BUTTON_ICON_NAME],
      uniqueId,
      asChild,
    );

    return (
      <Component
        ref={forwardedRef}
        className={root({ class: className })}
        data-alignui="fancy-button"
        {...rest}
      >
        {extendedChildren}
      </Component>
    );
  },
);
FancyButtonRoot.displayName = FANCY_BUTTON_ROOT_NAME;

function FancyButtonIcon<T extends React.ElementType>({
  className,
  variant,
  size,
  as,
  ...rest
}: PolymorphicComponentProps<T, FancyButtonSharedProps>) {
  const Component = as || "span";
  const { icon } = fancyButtonVariants({ variant, size });

  return <Component className={icon({ class: className })} {...rest} />;
}
FancyButtonIcon.displayName = FANCY_BUTTON_ICON_NAME;

export { FancyButtonRoot as Root, FancyButtonIcon as Icon };
