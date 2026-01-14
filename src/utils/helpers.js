export const formatYear = (dateString) => {
    if (!dateString) return '';
    return dateString.split('-')[0];
};

export const truncateText = (text, length = 100) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};
