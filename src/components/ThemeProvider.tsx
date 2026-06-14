import { createContext, useContext, useEffect, useState } from 'react';
import { useSettings } from '@/hooks/useSettings';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings } = useSettings();
  const [theme, setTheme] = useState<'light' | 'dark'>(settings.darkMode ? 'dark' : 'light');

  // هەر کاتێک settings.darkMode بگۆڕێت، کلاسی HTMLـەکە نوێ بکەرەوە
  useEffect(() => {
    const newTheme = settings.darkMode ? 'dark' : 'light';
    setTheme(newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const toggleTheme = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}