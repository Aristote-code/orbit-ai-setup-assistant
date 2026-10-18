import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

export type IconData = IconSvgElement;

type IconProps = {
  icon: IconData;
  size?: number;
  strokeWidth?: number;
  className?: string;
  "aria-hidden"?: boolean;
};

export function Icon({
  icon,
  size = 16,
  strokeWidth = 1.5,
  className,
  "aria-hidden": ariaHidden = true,
}: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      color="currentColor"
      className={className}
      aria-hidden={ariaHidden}
    />
  );
}
