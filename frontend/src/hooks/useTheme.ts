import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if theme is stored in localStorage
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    
    // If theme is in localStorage, use it
    if (savedTheme) {
      return savedTheme;
    }
    
    // Otherwise, check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return "dark";
    }
    
    // Default to light theme
    return "light";
  });

  // Function to update the theme
  const updateTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    // Save to localStorage
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  // Apply the theme when component mounts
  useEffect(() => {
    updateTheme(theme);
  }, [theme]);

  return { theme, setTheme: updateTheme };
}
