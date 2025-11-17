
import type { Video } from '../types';

// Этап 3: Создание сервиса для управления данными (имитация бэкенда)
// Так как у нас нет настоящего сервера, мы будем хранить все данные в localStorage браузера.
// Это позволяет данным сохраняться даже после перезагрузки страницы.
// Мы создаем функции, которые имитируют запросы к серверу: получить все видео, добавить новое и т.д.

const STORAGE_KEY = 'qr-video-player-videos';

// Пример видео по умолчанию, чтобы при первом запуске что-то было
const initialVideos: Video[] = [
  {
    id: 'example-1',
    name: 'Sample Nature Video',
    // Это ссылка на бесплатное стоковое видео для примера
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    isActive: true,
    createdAt: Date.now() - 10000,
  },
  {
    id: 'example-2',
    name: 'Sample Animation',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    isActive: false,
    createdAt: Date.now(),
  },
];


// Инициализация хранилища: если в localStorage ничего нет, добавляем примеры
const initializeStorage = () => {
  const storedVideos = localStorage.getItem(STORAGE_KEY);
  if (!storedVideos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialVideos));
  }
};

initializeStorage();

// Получить все видео из localStorage
export const getVideos = async (): Promise<Video[]> => {
  const storedVideos = localStorage.getItem(STORAGE_KEY);
  if (!storedVideos) {
    return [];
  }
  try {
    const videos = JSON.parse(storedVideos) as Video[];
    if (!Array.isArray(videos)) {
      console.error("Stored data is not an array, resetting.");
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    // Сортируем по дате создания, чтобы новые были сверху
    return videos.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Failed to parse videos from localStorage. Corrupted data will be cleared.', error);
    // Очищаем поврежденные данные, чтобы предотвратить сбои в будущем
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

// Получить одно видео по его ID
export const getVideoById = async (id: string): Promise<Video | null> => {
  const videos = await getVideos();
  return videos.find(video => video.id === id) || null;
};

// Добавить новое видео
export const addVideo = async (name: string, url: string): Promise<Video> => {
  const videos = await getVideos();
  const newVideo: Video = {
    id: `video-${Date.now()}`,
    name,
    url,
    isActive: true,
    createdAt: Date.now(),
  };
  const updatedVideos = [newVideo, ...videos];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVideos));
  return newVideo;
};

// Обновить видео (например, изменить статус активности)
export const updateVideo = async (id: string, updates: Partial<Video>): Promise<Video | null> => {
  const videos = await getVideos();
  let updatedVideo: Video | null = null;
  const updatedVideos = videos.map(video => {
    if (video.id === id) {
      updatedVideo = { ...video, ...updates };
      return updatedVideo;
    }
    return video;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVideos));
  return updatedVideo;
};
