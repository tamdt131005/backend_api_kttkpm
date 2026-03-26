const IMAGE_BASE = 'http://localhost:8000/assets/images';

const imageUtil = {
    product(filename) {
        if (!filename) return `${IMAGE_BASE}/placeholder.jpg`;
        if (filename.startsWith('http')) return filename;
        return `${IMAGE_BASE}/product/${filename}`;
    },
    avatar(filename) {
        if (!filename) return `${IMAGE_BASE}/user.webp`;
        if (filename.startsWith('http')) return filename;
        return `${IMAGE_BASE}/${filename}`;
    }
};
