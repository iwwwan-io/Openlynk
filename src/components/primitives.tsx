import type { ButtonHTMLAttributes } from "react";

export function GradientButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center rounded-full bg-zinc-900 px-6 py-3 font-display text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
