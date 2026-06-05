import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem("ms_theme") || "light");
  const [elderly, setElderly] = useState(() => localStorage.getItem("ms_elderly") === "1");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("ms_theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (elderly) root.classList.add("elderly");
    else root.classList.remove("elderly");
    localStorage.setItem("ms_elderly", elderly ? "1" : "0");
  }, [elderly]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, elderly, setElderly }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
