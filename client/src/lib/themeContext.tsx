import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme types
type ThemeMode = 'light' | 'dark';
type ThemeColor = 'blue' | 'indigo' | 'purple' | 'teal' | 'green';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  color: ThemeColor;
  setColor: (color: ThemeColor) => void;
  toggleMode: () => void;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get saved theme from localStorage
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as ThemeMode) || 'light';
  });

  // Get saved color from localStorage
  const [color, setColorState] = useState<ThemeColor>(() => {
    const savedColor = localStorage.getItem('themeColor');
    return (savedColor as ThemeColor) || 'blue';
  });

  // Update localStorage and document class when theme changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    
    // Add or remove class from document
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  // Update localStorage when color changes
  useEffect(() => {
    localStorage.setItem('themeColor', color);
    
    // Remove all color classes
    document.documentElement.classList.remove('theme-blue', 'theme-indigo', 'theme-purple', 'theme-teal', 'theme-green');
    
    // Add new color class
    document.documentElement.classList.add(`theme-${color}`);
  }, [color]);

  // Set theme function
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  // Set color function
  const setColor = (newColor: ThemeColor) => {
    setColorState(newColor);
  };

  // Toggle theme function
  const toggleMode = () => {
    setModeState(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, color, setColor, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};