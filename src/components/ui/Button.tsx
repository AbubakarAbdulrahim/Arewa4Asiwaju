import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "quiet";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: "button-primary",
  secondary: "button-secondary",
  quiet: "button-quiet",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={`${variants[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
