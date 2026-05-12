export const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};
