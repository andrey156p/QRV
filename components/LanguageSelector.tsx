
import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import type { Language } from '../types';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLocalization();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="language-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('language')}:
      </label>
      <select
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="en">English</option>
        <option value="ru">Русский</option>
        <option value="he">עברית</option>
      </select>
    </div>
  );
};
