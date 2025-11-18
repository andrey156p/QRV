import React, { useState, useEffect, useCallback } from 'react';
import { getVideos, addVideo, updateVideo } from '../services/videoService';
import type { Video } from '../types';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useLocalization } from '../hooks/useLocalization';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { ProgressBar } from '../components/ProgressBar';
import { PLACEHOLDER_VIDEO_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../config';


// Этап 5: Создание Панели Администратора
// Это основной экран для управления вашими видео.
// Что здесь происходит:
// 1. Отображается список всех видео, загруженных из нашего "сервиса" (localStorage).
// 2. Форма для "загрузки" нового видео. Мы не загружаем файл на самом деле,
//    а просто добавляем запись с названием и ссылкой на стоковое видео для примера.
// 3. Для каждого видео есть переключатель "Активно/Неактивно".
// 4. Кнопка "Получить QR-код", которая открывает окно с QR-кодом.
//    Этот QR-код содержит ссылку на страницу плеера с ID этого видео.

// Отдельный компонент для модального окна с QR-кодом, чтобы не загромождать основной.
const QRCodeModal: React.FC<{ video: Video; onClose: () => void }> = ({ video, onClose }) => {
    const { t } = useLocalization();
    const playerUrl = `${window.location.origin}${window.location.pathname}#/player/${video.id}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md text-center">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{video.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('scanQRCode')}</p>
                <div className="p-4 bg-white inline-block rounded-lg">
                     <QRCode value={playerUrl} size={256} />
                </div>
                <div className="mt-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('videoLink')}</p>
                    <input 
                        type="text" 
                        readOnly 
                        value={playerUrl} 
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm text-center"
                        onFocus={(e) => e.target.select()}
                    />
                </div>
                <button
                    onClick={onClose}
                    className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {t('close')}
                </button>
            </div>
        </div>
    );
};

// Основной компонент админ-панели
const AdminPanel: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [newVideoName, setNewVideoName] = useState('');
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedQrVideo, setSelectedQrVideo] = useState<Video | null>(null);
    const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
    const { t, dir } = useLocalization();

    const fetchVideos = useCallback(async () => {
        setIsLoading(true);
        const videosData = await getVideos();
        setVideos(videosData);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const handleAddVideo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVideoName.trim()) {
            alert('Please enter a video name.');
            return;
        }
        setIsUploading(true);
        setUploadProgress(uploadMode === 'file' ? 0 : null);
        
        try {
            let videoUrl = '';
            if (uploadMode === 'file') {
                if (!selectedFile) {
                    alert(t('noFileSelected'));
                    setIsUploading(false);
                    return;
                }
                 videoUrl = await uploadToCloudinary(selectedFile, (progress) => {
                    setUploadProgress(progress);
                });

            } else { // url mode
                videoUrl = newVideoUrl.trim() || PLACEHOLDER_VIDEO_URL;
            }

            await addVideo(newVideoName, videoUrl);

            setNewVideoName('');
            setSelectedFile(null);
            setNewVideoUrl('');
            await fetchVideos();

        } catch (error) {
            console.error("Upload failed:", error);
            alert(t('uploadFailed'));
        } finally {
            setIsUploading(false);
            setUploadProgress(null);
        }
    };

    const uploadToCloudinary = (file: File, onProgress: (progress: number) => void): Promise<string> => {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`, true);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentCompleted = Math.round((event.loaded * 100) / event.total);
                    onProgress(percentCompleted);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response.secure_url);
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
                }
            };

            xhr.onerror = () => {
                reject(new Error('Network error during upload.'));
            };
            
            xhr.send(formData);
        });
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        await updateVideo(id, { isActive: !currentStatus });
        await fetchVideos();
    };
    
    return (
        <div className="container mx-auto p-4 md:p-8" dir={dir}>
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('adminPanelTitle')}</h1>
                <div className="flex items-center gap-4">
                  <LanguageSelector />
                  <ThemeToggle />
                </div>
            </header>
            
            <div className="bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500 text-blue-700 dark:text-blue-200 p-4 rounded-md mb-8" role="alert">
                <p className="font-bold">Info</p>
                <p>{t('cloudHostingTip')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">{t('uploadVideo')}</h2>
                        <form onSubmit={handleAddVideo}>
                            <div className="mb-4">
                                <label htmlFor="videoName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('videoName')}</label>
                                <input
                                    type="text"
                                    id="videoName"
                                    value={newVideoName}
                                    onChange={(e) => setNewVideoName(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="e.g., My Awesome Video"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('uploadMethod')}</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <button type="button" onClick={() => setUploadMode('file')} className={`px-4 py-2 text-sm font-medium rounded-l-md w-1/2 ${uploadMode === 'file' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'}`}>
                                        {t('fromFile')}
                                    </button>
                                    <button type="button" onClick={() => setUploadMode('url')} className={`px-4 py-2 text-sm font-medium rounded-r-md w-1/2 -ml-px ${uploadMode === 'url' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'}`}>
                                        {t('fromURL')}
                                    </button>
                                </div>
                            </div>
                            
                            {uploadMode === 'file' ? (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('selectFile')}</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{selectedFile ? selectedFile.name : 'MP4, MOV, WebM, etc.'}</p>
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="video/*" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('videoURL')}</label>
                                    <input
                                        type="url"
                                        id="videoUrl"
                                        value={newVideoUrl}
                                        onChange={(e) => setNewVideoUrl(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="https://example.com/video.mp4"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isUploading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-800"
                            >
                                {isUploading ? t('uploading') : t('upload')}
                            </button>
                            {isUploading && uploadProgress !== null && (
                                <div className="mt-4">
                                     <ProgressBar progress={uploadProgress} />
                                     <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">{t('uploadProgress')}: {uploadProgress}%</p>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">{t('manageVideos')}</h2>
                        <div className="overflow-x-auto">
                            {isLoading ? <p>Loading...</p> : (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('videoName')}</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('status')}</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {videos.map((video) => (
                                            <tr key={video.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{video.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button onClick={() => handleToggleActive(video.id, video.isActive)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${video.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${video.isActive ? 'translate-x-6' : 'translate-x-1'}`}/>
                                                    </button>
                                                    <span className="ml-2 text-sm">{video.isActive ? t('active') : t('inactive')}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button onClick={() => setSelectedQrVideo(video)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">{t('getQRCode')}</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {selectedQrVideo && <QRCodeModal video={selectedQrVideo} onClose={() => setSelectedQrVideo(null)} />}
        </div>
    );
};

export default AdminPanel;