import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const VARIANTS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "px-4 py-2.5 rounded-xl font-semibold text-sm transition-all bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 inline-flex items-center gap-2",
};

const SIZES = {
  sm: "!text-xs !px-3 !py-1.5",
  md: "",
  lg: "!text-base !px-7 !py-3.5",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(VARIANTS[variant], SIZES[size], "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none", className)}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />}
      {children}
    </button>
  );
}
