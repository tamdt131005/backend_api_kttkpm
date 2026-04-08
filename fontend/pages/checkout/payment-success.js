function getPaymentResult() {
    const params = new URLSearchParams(window.location.search);
    const orderCode = params.get('orderId') || params.get('order_code') || '';
    const parsedResultCode = Number(params.get('resultCode'));
    const resultCode = Number.isFinite(parsedResultCode) ? parsedResultCode : -1;
    const message = params.get('message') || '';

    return {
        orderCode,
        resultCode,
        message
    };
}

function getResultViewModel(resultCode, fallbackMessage) {
    if (resultCode === 0) {
        return {
            title: 'Thanh toán thành công',
            description: fallbackMessage || 'Đơn hàng của bạn đã được ghi nhận. Hệ thống đang đồng bộ trạng thái thanh toán.',
            pillText: 'MoMo Success',
            iconClass: 'fas fa-circle-check',
            stateClass: 'success'
        };
    }

    return {
        title: 'Thanh toán chưa thành công',
        description: fallbackMessage || 'Bạn có thể thử lại hoặc kiểm tra lại giao dịch trong danh sách đơn hàng.',
        pillText: 'MoMo Failed',
        iconClass: 'fas fa-circle-xmark',
        stateClass: 'failed'
    };
}

async function renderPaymentResult() {
    const result = getPaymentResult();
    const viewModel = getResultViewModel(result.resultCode, result.message);
    
    const resultCard = document.getElementById('payment-result-card');
    const resultTitle = document.getElementById('result-title');
    const payload = {
        orderId: result.orderCode,
        resultCode: result.resultCode
    }
    const resultDescription = document.getElementById('result-description');
    const resultPill = document.getElementById('result-pill');
    const resultIcon = document.getElementById('result-icon');
    const orderCode = document.getElementById('order-code');

    if (!resultCard || !resultTitle || !resultDescription || !resultPill || !resultIcon || !orderCode) {
        return;
    }
    await api.post("/orders/momo/ipn", payload);
    resultCard.classList.remove('success', 'failed');
    resultCard.classList.add(viewModel.stateClass);

    resultTitle.textContent = viewModel.title;
    resultDescription.textContent = viewModel.description;
    resultPill.textContent = viewModel.pillText;
    resultIcon.innerHTML = `<i class="${viewModel.iconClass}"></i>`;

    orderCode.textContent = result.orderCode || 'Không có mã đơn hàng';
}

document.addEventListener('DOMContentLoaded', renderPaymentResult);