import type { ButtonHTMLAttributes } from "react";

type Variante = "primary" | "secondary" | "outline" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variante;
}

const variantes: Record<Variante, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover",
  secondary: "bg-stone-800 text-white hover:bg-stone-700",
  outline: "border border-stone-300 bg-white text-stone-700 hover:bg-stone-100",
  danger: "bg-error text-white hover:opacity-90",
  ghost: "text-stone-600 hover:bg-stone-100",
};

export default function Button({
  variant = "primary",
  type = "button",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold transition active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${variantes[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
