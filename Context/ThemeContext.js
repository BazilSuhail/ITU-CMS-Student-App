// ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load the theme preference from AsyncStorage when the app starts
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('darkMode');
        if (savedMode !== null) {
          setDarkMode(JSON.parse(savedMode));
        }
      } catch (e) {
        console.error('Failed to load theme:', e);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    try {
      await AsyncStorage.setItem('darkMode', JSON.stringify(newMode));
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
