import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import type { Language } from '../types';

// Этап 4: Система перевода (Интернационализация)
// Чтобы приложение работало на разных языках, мы создаем систему переводов.
// Все тексты хранятся в одном месте.
// Приложение автоматически определяет язык браузера пользователя и показывает тексты на этом языке.

const translations = {
  en: {
    adminPanelTitle: 'Admin Panel - Video Management',
    cloudHostingTip: 'Tip: Videos are uploaded to Cloudinary. You can manage them in your Cloudinary account.',
    uploadVideo: 'Upload New Video',
    videoName: 'Video Name',
    selectFile: 'Select a video file',
    uploading: 'Uploading...',
    upload: 'Upload',
    manageVideos: 'Manage Videos',
    status: 'Status',
    actions: 'Actions',
    active: 'Active',
    inactive: 'Inactive',
    getQRCode: 'Get QR Code',
    scanQRCode: 'Scan this QR code on a mobile device',
    videoLink: 'Video Link:',
    close: 'Close',
    playerLoading: 'Loading video...',
    playerNotFound: 'Video not found or is inactive.',
    tapToPlay: 'Tap to Play',
    replayVideo: 'Tap to Replay',
    language: 'Language',
    uploadMethod: 'Upload Method',
    fromFile: 'From File',
    fromURL: 'From URL',
    videoURL: 'Video URL',
    noFileSelected: 'Please select a file first.',
    uploadFailed: 'Upload failed. Please check the console for details.',
    uploadProgress: 'Upload Progress',

  },
  ru: {
    adminPanelTitle: 'Админ-панель - Управление видео',
    cloudHostingTip: 'Совет: Видео загружаются в Cloudinary. Вы можете управлять ими в своем аккаунте Cloudinary.',
    uploadVideo: 'Загрузить новое видео',
    videoName: 'Название видео',
    selectFile: 'Выберите видеофайл',
    uploading: 'Загрузка...',
    upload: 'Загрузить',
    manageVideos: 'Управление видео',
    status: 'Статус',
    actions: 'Действия',
    active: 'Активно',
    inactive: 'Неактивно',
    getQRCode: 'Получить QR-код',
    scanQRCode: 'Отсканируйте этот QR-код на мобильном устройстве',
    videoLink: 'Ссылка на видео:',
    close: 'Закрыть',
    playerLoading: 'Загрузка видео...',
    playerNotFound: 'Видео не найдено или неактивно.',
    tapToPlay: 'Нажмите для воспроизведения',
    replayVideo: 'Нажмите для повтора',
    language: 'Язык',
    uploadMethod: 'Способ загрузки',
    fromFile: 'Из файла',
    fromURL: 'По ссылке',
    videoURL: 'Ссылка на видео',
    noFileSelected: 'Пожалуйста, сначала выберите файл.',
    uploadFailed: 'Ошибка загрузки. Проверьте консоль для деталей.',
    uploadProgress: 'Прогресс загрузки',
  },
  he: {
    adminPanelTitle: 'פאנל ניהול - ניהול וידאו',
    cloudHostingTip: 'טיפ: סרטונים מועלים ל-Cloudinary. תוכל לנהל אותם בחשבון Cloudinary שלך.',
    uploadVideo: 'העלאת וידאו חדש',
    videoName: 'שם הוידאו',
    selectFile: 'בחר קובץ וידאו',
    uploading: 'מעלה...',
    upload: 'העלאה',
    manageVideos: 'ניהול וידאו',
    status: 'סטטוס',
    actions: 'פעולות',
    active: 'פעיל',
    inactive: 'לא פעיל',
    getQRCode: 'קבל קוד QR',
    scanQRCode: 'סרוק את קוד ה-QR הזה במכשיר נייד',
    videoLink: 'קישור לוידאו:',
    close: 'סגור',
    playerLoading: 'טוען וידאו...',
    playerNotFound: 'הוידאו לא נמצא או לא פעיל.',
    tapToPlay: 'לחץ להפעלה',
    replayVideo: 'לחץ להפעלה מחדש',
    language: 'שפה',
    uploadMethod: 'שיטת העלאה',
    fromFile: 'מקובץ',
    fromURL: 'מכתובת URL',
    videoURL: 'כתובת הוידאו',
    noFileSelected: 'אנא בחר קובץ תחילה.',
    uploadFailed: 'ההעלאה נכשלה. בדוק את הקונסולה לפרטים.',
    uploadProgress: 'התקדמות ההעלאה',
  },
};

type LocalizationContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  dir: 'ltr' | 'rtl';
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0] as Language;
    if (['en', 'ru', 'he'].includes(browserLang)) {
      setLanguage(browserLang);
    }
  }, []);
  
  const dir: 'ltr' | 'rtl' = useMemo(() => (language === 'he' ? 'rtl' : 'ltr'), [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const t = useCallback((key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key];
  }, [language]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
    dir,
  }), [language, t, dir]);

  return React.createElement(LocalizationContext.Provider, { value: contextValue }, children);
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};