
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getVideoById } from '../services/videoService';
import type { Video } from '../types';
import { useLocalization } from '../hooks/useLocalization';

// Этап 6: Создание Страницы Видеоплеера
// Эта страница открывается, когда пользователь сканирует QR-код.
// Что здесь происходит:
// 1. Мы получаем ID видео из URL (например, из `.../#/player/video-12345`).
// 2. По этому ID мы запрашиваем информацию о видео из нашего "сервиса".
// 3. Если видео найдено и оно активно, мы показываем его в полноэкранном режиме.
// 4. Браузеры блокируют автоматическое воспроизведение видео со звуком. Поэтому сначала мы показываем
//    кнопку "Нажмите для воспроизведения".
// 5. После окончания видео появляется кнопка "Повторить".

// Иконки для кнопок плеера
const PlayIcon: React.FC = () => (
    <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);

const ReplayIcon: React.FC = () => (
    <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
);


const VideoPlayer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useLocalization();
    const [video, setVideo] = useState<Video | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasEnded, setHasEnded] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const fetchVideo = async () => {
            if (!id) {
                setError(t('playerNotFound'));
                setIsLoading(false);
                return;
            }
            try {
                const videoData = await getVideoById(id);
                if (videoData && videoData.isActive) {
                    setVideo(videoData);
                } else {
                    setError(t('playerNotFound'));
                }
            } catch (err) {
                setError(t('playerNotFound'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideo();
    }, [id, t]);

    const handlePlay = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
            setHasEnded(false);
        }
    };

    const handleReplay = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
            setIsPlaying(true);
            setHasEnded(false);
        }
    };
    
    if (isLoading) {
        return <div className="fixed inset-0 bg-black flex items-center justify-center text-white text-xl">{t('playerLoading')}</div>;
    }

    if (error || !video) {
        return <div className="fixed inset-0 bg-black flex items-center justify-center text-white text-xl p-4 text-center">{error}</div>;
    }

    return (
        <div className="fixed inset-0 bg-black">
            <video
                ref={videoRef}
                src={video.url}
                className="w-full h-full object-contain"
                onEnded={() => {
                    setIsPlaying(false);
                    setHasEnded(true);
                }}
                playsInline // Важно для iOS
            />

            {!isPlaying && !hasEnded && (
                 <div onClick={handlePlay} className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-50">
                    <div className="text-center">
                        <PlayIcon />
                        <p className="mt-4 text-white text-2xl font-semibold">{t('tapToPlay')}</p>
                    </div>
                </div>
            )}

            {hasEnded && (
                <div onClick={handleReplay} className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-50">
                     <div className="text-center">
                        <ReplayIcon />
                        <p className="mt-4 text-white text-2xl font-semibold">{t('replayVideo')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;