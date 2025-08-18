import { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "outline" | "ghost";
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg h-10 px-4 text-sm font-medium transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none";
  const styles =
    variant === "primary"
      ? "bg-primary text-white"
      : variant === "outline"
      ? "border border-border bg-card"
      : "bg-transparent hover:bg-card/60";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
