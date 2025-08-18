"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const initialLight = saved === "light";
    setIsLight(initialLight);
    if (initialLight) {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Basculer le thème"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:opacity-90"
    >
      {isLight ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
