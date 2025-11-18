// Этап 7: Централизация конфигурации
// Чтобы сделать приложение более гибким и легким в поддержке,
// мы выносим все "магические" значения (например, URL-адреса, ключи API и т.д.)
// в один конфигурационный файл. Если нам понадобится изменить
// видео-заглушку, мы сделаем это только в одном месте.

export const PLACEHOLDER_VIDEO_URL = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';

// Конфигурация для Cloudinary
// Cloud Name можно найти на главной странице вашего аккаунта Cloudinary.
export const CLOUDINARY_CLOUD_NAME = 'dtk0vtx3q'; 
// Имя Upload Preset, который вы создали с режимом "Unsigned".
// ЕСЛИ ВЫ НАЗВАЛИ ПРЕСЕТ ПО-ДРУГОМУ, ИЗМЕНИТЕ ЭТУ СТРОКУ
export const CLOUDINARY_UPLOAD_PRESET = 'unsigned_uploads';