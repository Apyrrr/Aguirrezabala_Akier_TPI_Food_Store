import type { InputHTMLAttributes } from "react";

export const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-ink placeholder:text-stone-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:bg-stone-100";

export default function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClass} ${className}`} {...props} />;
}
