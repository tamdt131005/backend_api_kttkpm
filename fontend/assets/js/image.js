const IMAGE_BASE = 'http://localhost:3000/upload/img';
const FRONTEND_IMAGE_BASE = '/assets/images';

function normalizeImagePath(filename) {
    return String(filename || '').trim().replace(/^\/+/, '');
}

const imageUtil = {
    product(filename) {
        const normalized = normalizeImagePath(filename);
        if (!normalized) return `${IMAGE_BASE}/product/anh1.jpg`;
        if (normalized.startsWith('http')) return normalized;
        if (normalized.startsWith('product/')) return `${IMAGE_BASE}/${normalized}`;
        return `${IMAGE_BASE}/product/${normalized}`;
    },
    avatar(filename) {
        const normalized = normalizeImagePath(filename);
        if (!normalized || normalized === 'user.webp' || normalized.endsWith('/user.webp')) {
            return `${FRONTEND_IMAGE_BASE}/user.webp`;
        }
        if (normalized.startsWith('http')) return normalized;
        if (normalized.startsWith('avatar/')) return `${IMAGE_BASE}/${normalized}`;
        if (normalized.startsWith('avatar_')) return `${IMAGE_BASE}/avatar/${normalized}`;
        return `${IMAGE_BASE}/${normalized}`;
    },
    logo() {
        return `${FRONTEND_IMAGE_BASE}/logo.svg`;
    }
};
