/**
 * Checkout Actions - Form được xử lý bằng HTML thuần
 * Chỉ giữ lại chức năng validate và modal chọn địa chỉ (nếu cần)
 */

// Validate số điện thoại
function validatePhone(phone) {
    return /^[0-9]{10,11}$/.test(phone);
}

document.addEventListener('DOMContentLoaded', function () {
    const checkoutForm = document.getElementById('checkout-form');

    if (!checkoutForm) return;

    // Xử lý validate cơ bản trước khi submit
    checkoutForm.addEventListener('submit', function (e) {
        // Kiểm tra địa chỉ đã có chưa
        const tennguoinhan = document.getElementById('tennguoinhan')?.value;
        if (!tennguoinhan) {
            e.preventDefault();
            alert('Vui lòng thêm địa chỉ nhận hàng');
            return;
        }
    });
});
