let profile = {};

function getUserId() {
    const id = Number(localStorage.getItem('user_id'));
    return Number.isInteger(id) && id > 0 ? id : null;
}

function toDateInput(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return raw;
    }

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function setAlert(type, message) {
    const alertBox = document.getElementById('profile-alert');
    if (!alertBox) return;
    const isSuccess = type === 'success';
    alertBox.className = `alert ${isSuccess ? 'alert-success' : 'alert-error'}`;
    alertBox.innerHTML = `<i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-xmark'}"></i> ${message}`;
    alertBox.style.display = '';
}

function clearAlert() {
    const alertBox = document.getElementById('profile-alert');
    if (!alertBox) return;
    alertBox.style.display = 'none';
    alertBox.className = '';
    alertBox.innerHTML = '';
}

function bindAvatarInput() {
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarButton = document.getElementById('avatarButton');
    if (!avatarInput || !avatarPreview || !avatarButton) return;

    avatarButton.addEventListener('click', (e) => {
        e.preventDefault();
        avatarInput.click();
    });

    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            avatarPreview.src = event.target?.result || avatarPreview.src;
        };
        reader.readAsDataURL(file);
    });
}

async function uploadAvatarIfNeeded() {
    const avatarInput = document.getElementById('avatarInput');
    const file = avatarInput?.files?.[0];
    if (!file) return profile.avatar || null;

    const formData = new FormData();
    formData.append('avatar', file);

    const uploadRes = await api.upload('/profile/avatar', formData);
    if (!uploadRes.success || !uploadRes.data?.avatar) {
        throw new Error(uploadRes.message || 'Upload avatar thất bại');
    }

    return uploadRes.data.avatar;
}

function renderProfile() {
    const sidebarName = document.getElementById('username');
    const sidebarAvatar = document.getElementById('avatar-img');
    const avatarPreview = document.getElementById('avatarPreview');
    const username = document.getElementById('username-value');
    const fullname = document.getElementById('name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const sexNam = document.getElementById('sex-nam');
    const sexNu = document.getElementById('sex-nu');
    const ngaysinh = document.getElementById('ngaysinh');

    const displayName = profile.fullname || 'Người dùng';
    const avatarSrc = imageUtil.avatar(profile.avatar || '');

    if (sidebarName) sidebarName.textContent = displayName;
    if (sidebarAvatar) sidebarAvatar.src = avatarSrc;
    if (avatarPreview) avatarPreview.src = avatarSrc;

    if (username) username.textContent = profile.username || '';
    if (fullname) fullname.value = profile.fullname || '';
    if (email) email.value = profile.email || '';
    if (phone) phone.value = profile.phone || '';
    if (sexNam) sexNam.checked = profile.sex === 'Nam';
    if (sexNu) sexNu.checked = profile.sex === 'Nữ';
    if (ngaysinh) ngaysinh.value = toDateInput(profile.ngaysinh);
}

function getSexValue() {
    const checked = document.querySelector('input[name="sex"]:checked');
    return checked ? checked.value : null;
}

function buildUpdatePayload(userId) {
    const fullname = document.getElementById('name')?.value.trim() || null;
    const email = document.getElementById('email')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || null;
    const ngaysinhRaw = document.getElementById('ngaysinh')?.value || null;

    return {
        id: userId,
        email,
        fullname,
        phone,
        sex: getSexValue(),
        ngaysinh: ngaysinhRaw || null,
        avatar: profile.avatar || null
    };
}

async function getUser() {
    const userId = getUserId();
    if (!userId) {
        window.location.href = '/pages/auth/login.html';
        return;
    }

    try {
        const res = await api.get(`/profile/${userId}`);
        if (!res.success || !res.data) {
            setAlert('error', res.message || 'Không thể tải thông tin tài khoản');
            return;
        }
        profile = res.data;
        renderProfile();
    } catch (error) {
        setAlert('error', 'Lỗi kết nối máy chủ');
    }
}

async function updateProfile(event) {
    event.preventDefault();
    clearAlert();

    const userId = getUserId();
    if (!userId) {
        window.location.href = '/pages/auth/login.html';
        return;
    }

    const submitBtn = document.getElementById('btn-save-profile');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.value = 'Đang lưu...';
    }

    try {
        const payload = buildUpdatePayload(userId);
        payload.avatar = await uploadAvatarIfNeeded();
        const res = await api.put('/profile', payload);

        if (!res.success) {
            setAlert('error', res.message || 'Cập nhật hồ sơ thất bại');
            return;
        }

        profile = { ...profile, ...payload };
        localStorage.setItem('fullname', profile.fullname || localStorage.getItem('username') || 'Người dùng');
        if (profile.avatar) {
            localStorage.setItem('avatar', profile.avatar);
        }

        const avatarInput = document.getElementById('avatarInput');
        if (avatarInput) {
            avatarInput.value = '';
        }

        renderProfile();
        setAlert('success', 'Cập nhật hồ sơ thành công');
    } catch (error) {
        setAlert('error', 'Lỗi kết nối máy chủ');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.value = 'Lưu thay đổi';
        }
    }
}

async function hienThiManHinh() {
    bindAvatarInput();
    document.getElementById('profile-form')?.addEventListener('submit', updateProfile);
    await getUser();
}

document.addEventListener('DOMContentLoaded', () => {
    hienThiManHinh();
});