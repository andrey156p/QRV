
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from './pages/AdminPanel';
import VideoPlayer from './pages/VideoPlayer';

// Этап 1: Структура приложения и маршрутизация
// Это главный компонент вашего приложения. Мы используем HashRouter для навигации.
// HashRouter использует символ '#' в URL (например, site.com/#/admin).
// Это хорошо работает для простых приложений и на хостингах, таких как GitHub Pages.
// У нас два основных маршрута:
// 1. `/admin` - для панели администратора, где вы будете управлять видео.
// 2. `/player/:id` - для страницы плеера, которая будет открываться по QR-коду. `:id` - это уникальный идентификатор видео.
function App() {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <HashRouter>
        <Routes>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/player/:id" element={<VideoPlayer />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
