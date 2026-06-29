let addresses = [];
let editingAddressId = null;

function getUserId() {
    const id = Number(localStorage.getItem('user_id'));
    return Number.isInteger(id) && id > 0 ? id : null;
}

function formatAvatar(avatar) {
    return imageUtil.avatar(avatar || localStorage.getItem('avatar') || '');
}

async function loadSidebarUser() {
    const userId = getUserId();
    if (!userId) {
        window.location.href = '/pages/auth/login.html';
        return false;
    }

    try {
        const res = await api.get(`/profile/${userId}`);
        if (res.success && res.data) {
            const fullname = res.data.fullname || localStorage.getItem('fullname') || 'Người dùng';
            const avatarSrc = formatAvatar(res.data.avatar);
            document.getElementById('username').textContent = fullname;
            document.getElementById('avatar-img').src = avatarSrc;
            localStorage.setItem('fullname', fullname);
            if (res.data.avatar) {
                localStorage.setItem('avatar', res.data.avatar);
            }
            return true;
        }
    } catch (error) {
    }

    document.getElementById('username').textContent = localStorage.getItem('fullname') || 'Người dùng';
    document.getElementById('avatar-img').src = formatAvatar('');
    return true;
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
}

function clearAddForm() {
    document.getElementById('add-address-form').reset();
}

function fillEditForm(address) {
    editingAddressId = address.id;
    document.getElementById('edit-id').value = address.id;
    document.getElementById('edit-tennguoinhan').value = address.tennguoinhan || '';
    document.getElementById('edit-sodienthoai').value = address.sodienthoai || '';
    document.getElementById('edit-diachichitiet').value = address.diachichitiet || '';
    document.getElementById('edit-phuong').value = address.phuong || '';
    document.getElementById('edit-quan').value = address.quan || '';
    document.getElementById('edit-tinh').value = address.tinh || '';
    document.getElementById('edit-macdinh').checked = Number(address.macdinh) === 1;
}

function createAddressCard(address) {
    const isDefault = Number(address.macdinh) === 1;

    return `
        <div class="address-card">
            <div class="card-header">
                <div class="card-title">
                    <strong>${address.tennguoinhan || ''}</strong>
                    <span class="muted">| ${address.sodienthoai || ''}</span>
                </div>
                <div class="card-body">
                    <p class="mb-10">${address.diachichitiet || ''}</p>
                    <p class="muted">${address.phuong || ''}, ${address.quan || ''}, ${address.tinh || ''}</p>
                </div>
                ${isDefault ? '<span class="address-default">[Mặc định]</span>' : ''}
            </div>
            <div class="card-actions">
                <div class="action-group">
                    <button class="openModalEdit" data-address-id="${address.id}">Sửa</button>
                    ${isDefault ? '' : `<button class="btn-danger" data-delete-id="${address.id}">Xóa</button>`}
                </div>
                ${isDefault ? '' : `<button class="btn-link" data-default-id="${address.id}">Thiết lập mặc định</button>`}
            </div>
        </div>
    `;
}

function renderAddresses() {
    const list = document.getElementById('address-list');
    const empty = document.getElementById('address-empty');

    if (!addresses.length) {
        list.innerHTML = '';
        empty.style.display = '';
        return;
    }

    empty.style.display = 'none';
    list.innerHTML = addresses.map(createAddressCard).join('');
}

async function loadAddresses() {
    const userId = getUserId();
    if (!userId) return;

    try {
        const res = await api.get('/address');
        addresses = res.success && Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        addresses = [];
    }

    renderAddresses();
}

function getAddPayload() {
    return {
        tennguoinhan: document.getElementById('add-tennguoinhan').value.trim(),
        sodienthoai: document.getElementById('add-sodienthoai').value.trim(),
        diachichitiet: document.getElementById('add-diachichitiet').value.trim(),
        phuong: document.getElementById('add-phuong').value.trim(),
        quan: document.getElementById('add-quan').value.trim(),
        tinh: document.getElementById('add-tinh').value.trim(),
        macdinh: document.getElementById('add-macdinh').checked ? 1 : 0
    };
}

function getEditPayload() {
    return {
        tennguoinhan: document.getElementById('edit-tennguoinhan').value.trim(),
        sodienthoai: document.getElementById('edit-sodienthoai').value.trim(),
        diachichitiet: document.getElementById('edit-diachichitiet').value.trim(),
        phuong: document.getElementById('edit-phuong').value.trim(),
        quan: document.getElementById('edit-quan').value.trim(),
        tinh: document.getElementById('edit-tinh').value.trim(),
        macdinh: document.getElementById('edit-macdinh').checked ? 1 : 0
    };
}

async function createAddress(event) {
    event.preventDefault();
    const userId = getUserId();
    if (!userId) return;

    const payload = getAddPayload();

    try {
        const res = await api.post('/address', payload);
        if (!res.success) {
            alert(res.message || 'Thêm địa chỉ thất bại');
            return;
        }
        clearAddForm();
        closeModal('addressModal');
        await loadAddresses();
    } catch (error) {
        alert('Lỗi kết nối máy chủ');
    }
}

async function updateAddress(event) {
    event.preventDefault();
    const userId = getUserId();
    if (!userId || !editingAddressId) return;

    const payload = getEditPayload();

    try {
        const res = await api.put(`/address/${editingAddressId}`, payload);
        if (!res.success) {
            alert(res.message || 'Cập nhật địa chỉ thất bại');
            return;
        }

        closeModal('addressModalEdit');
        await loadAddresses();
    } catch (error) {
        alert('Lỗi kết nối máy chủ');
    }
}

async function removeAddress(addressId) {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;

    try {
        const res = await api.delete(`/address/${addressId}`);
        if (!res.success) {
            alert(res.message || 'Xóa địa chỉ thất bại');
            return;
        }
        await loadAddresses();
    } catch (error) {
        alert('Lỗi kết nối máy chủ');
    }
}

async function setDefaultAddress(addressId) {
    const userId = getUserId();
    if (!userId) return;

    try {
        const res = await api.patch('/address', { id: Number(addressId) });
        if (!res.success) {
            alert(res.message || 'Không thể đặt mặc định');
            return;
        }
        await loadAddresses();
    } catch (error) {
        alert('Lỗi kết nối máy chủ');
    }
}

function bindEvents() {
    document.getElementById('openModal')?.addEventListener('click', () => openModal('addressModal'));
    document.getElementById('closeModal')?.addEventListener('click', () => closeModal('addressModal'));
    document.getElementById('closeModalEdit')?.addEventListener('click', () => closeModal('addressModalEdit'));
    document.getElementById('add-address-form')?.addEventListener('submit', createAddress);
    document.getElementById('edit-address-form')?.addEventListener('submit', updateAddress);

    document.getElementById('address-list')?.addEventListener('click', async (event) => {
        const editBtn = event.target.closest('[data-address-id]');
        if (editBtn) {
            const addressId = Number(editBtn.getAttribute('data-address-id'));
            const address = addresses.find(item => Number(item.id) === addressId);
            if (!address) return;
            fillEditForm(address);
            openModal('addressModalEdit');
            return;
        }

        const deleteBtn = event.target.closest('[data-delete-id]');
        if (deleteBtn) {
            const addressId = Number(deleteBtn.getAttribute('data-delete-id'));
            await removeAddress(addressId);
            return;
        }

        const defaultBtn = event.target.closest('[data-default-id]');
        if (defaultBtn) {
            const addressId = Number(defaultBtn.getAttribute('data-default-id'));
            await setDefaultAddress(addressId);
        }
    });

    window.addEventListener('click', (event) => {
        const addModal = document.getElementById('addressModal');
        const editModal = document.getElementById('addressModalEdit');
        if (event.target === addModal) closeModal('addressModal');
        if (event.target === editModal) closeModal('addressModalEdit');
    });
}

async function init() {
    const loaded = await loadSidebarUser();
    if (!loaded) return;
    bindEvents();
    await loadAddresses();
}

document.addEventListener('DOMContentLoaded', init);
