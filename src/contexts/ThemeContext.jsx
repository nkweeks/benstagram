import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Default to dark mode as requested
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });

  const updateFavicon = (currentTheme) => {
    const faviconLink = document.querySelector("link[rel~='icon']");
    if (faviconLink) {
      // Assuming assets are in /public folder
      // In Vite, public assets are served at root path
      faviconLink.href = currentTheme === 'dark' 
        ? '/favicon-dark.png' 
        : '/favicon-light.png';
    }
  };

  useEffect(() => {
    // Update HTML attribute for CSS selectors
    document.documentElement.setAttribute('data-theme', theme);
    
    // Save to local storage
    localStorage.setItem('theme', theme);

    // Update Favicon
    updateFavicon(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const value = {
    theme,
    toggleTheme,
    // Helper to get the correct logo path based on theme
    // Assuming 'main_dark.jpeg' is the logo intended for Dark Mode (likely light text)
    // and 'main.jpeg' is the default/light mode logo
    logoPath: theme === 'dark' ? '/main_dark.jpeg' : '/main.jpeg'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
