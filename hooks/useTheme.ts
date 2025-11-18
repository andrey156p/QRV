import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

// Этап 8: Управление темой (Светлая/Темная)
// Создаем систему для переключения темы оформления.
// Это улучшает пользовательский опыт и делает приложение более современным.
// Система будет:
// 1. Определять предпочтения пользователя (из localStorage или системных настроек).
// 2. Позволять пользователю переключать тему.
// 3. Сохранять выбор пользователя.
// 4. Автоматически применять стили для темной темы.

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Пытаемся получить тему из localStorage. Если ее там нет,
    // проверяем системные настройки пользователя. По умолчанию — светлая.
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    // Применяем или убираем класс 'dark' у главного элемента <html>
    // TailwindCSS автоматически подхватит это и применит темные стили.
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    // Сохраняем выбор пользователя
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return React.createElement(ThemeContext.Provider, { value: contextValue }, children);
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
