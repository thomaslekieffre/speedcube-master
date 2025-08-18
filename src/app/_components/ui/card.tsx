import { PropsWithChildren } from "react";

export function Card({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`rounded-xl border border-border bg-card shadow-[var(--shadow-soft)] ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return <div className={`px-6 pt-6 ${className}`}>{children}</div>;
}

export function CardContent({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return <div className={`px-6 pb-6 ${className}`}>{children}</div>;
}
