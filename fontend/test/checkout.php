<?php

require_once __DIR__ . '/../init.php';
require_once __DIR__ . '/../controllers/giohangController.php';
require_once __DIR__ . '/../dao/AddressDAO.php';


if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

$userId = (int)$_SESSION['user_id'];
$username = $_SESSION['username'] ?? 'Khách hàng';


$cartItems = giohangController::layDanhSachGioHang($userId) ?? [];
$cartTotal = giohangController::tinhTongTien($userId);
$cartCount = count($cartItems);


$shippingFee = 30000;
$totalWithShipping = $cartTotal + $shippingFee;


function formatPrice($price) {
    return number_format($price, 0, ',', '.');
}


$addressDAO = new AddressDAO();
$savedAddresses = $addressDAO->layDanhSachDiaChi($userId);


$defaultAddress = null;
foreach ($savedAddresses as $addr) {
    if ($addr->macdinh) {
        $defaultAddress = $addr;
        break;
    }
}
if (!$defaultAddress && !empty($savedAddresses)) {
    $defaultAddress = $savedAddresses[0];
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thanh Toán - bTap Shop</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/btap_web/src/public/css/base.css">
    <link rel="stylesheet" href="/btap_web/src/public/css/header.css">
    <link rel="stylesheet" href="/btap_web/src/public/css/checkout.css">
</head>
<body>
    <header>
        <?php require __DIR__ . '/partials/header.php'; ?>
    </header>

    <main>
        <div class="checkout-container">
            <h1 class="checkout-title">
                <i class="fas fa-credit-card"></i> Thanh Toán
            </h1>

            <?php if (empty($cartItems)): ?>
            <!-- Giỏ hàng trống -->
            <div class="empty-checkout">
                <i class="fas fa-shopping-cart"></i>
                <h3>Giỏ hàng của bạn đang trống</h3>
                <p>Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
                <a href="index.php" class="btn-primary"><i class="fas fa-shopping-bag"></i> Mua sắm ngay</a>
            </div>
            <?php else: ?>
            <form id="checkout-form" action="/btap_web/src/api/order/create.php" method="POST">
                <div class="checkout-content">
                    <!-- Cột trái: Sản phẩm & Thông tin -->
                    <div class="checkout-main">
                        <!-- Địa chỉ nhận hàng -->
                        <div class="checkout-section">
                            <h3 class="section-title">
                                <i class="fas fa-map-marker-alt"></i> Địa Chỉ Nhận Hàng
                            </h3>
                            <div class="address-content" id="address-display">
                                <?php if ($defaultAddress): ?>
                                <div class="address-card">
                                    <div class="address-main">
                                        <strong class="recipient-name"><?= htmlspecialchars($defaultAddress->tennguoinhan) ?></strong>
                                        <span class="recipient-phone"><?= htmlspecialchars($defaultAddress->sodienthoai) ?></span>
                                        <?php if ($defaultAddress->macdinh): ?>
                                        <span class="badge-default">Mặc Định</span>
                                        <?php endif; ?>
                                    </div>
                                    <p class="recipient-address">
                                        <?= htmlspecialchars($defaultAddress->diachichitiet) ?>, 
                                        <?= htmlspecialchars($defaultAddress->phuong) ?>, 
                                        <?= htmlspecialchars($defaultAddress->tinh) ?>
                                    </p>
                                </div>
                                <!-- Hidden inputs để submit -->
                                <input type="hidden" name="tennguoinhan" id="tennguoinhan" value="<?= htmlspecialchars($defaultAddress->tennguoinhan) ?>">
                                <input type="hidden" name="sodienthoai" id="sodienthoai" value="<?= htmlspecialchars($defaultAddress->sodienthoai) ?>">
                                <input type="hidden" name="diachichitiet" id="diachichitiet" value="<?= htmlspecialchars($defaultAddress->diachichitiet) ?>">
                                <input type="hidden" name="phuong" id="phuong" value="<?= htmlspecialchars($defaultAddress->phuong) ?>">
                                <input type="hidden" name="tinh" id="tinh" value="<?= htmlspecialchars($defaultAddress->tinh) ?>">
                                <?php else: ?>
                                <div class="no-address">
                                    <p>Bạn chưa có địa chỉ. <a href="address.php">Thêm địa chỉ mới</a></p>
                                </div>
                                <?php endif; ?>
                            </div>
                            <?php if (!empty($savedAddresses)): ?>
                            <button type="button" class="btn-change" onclick="openAddressModal()">
                                <i class="fas fa-edit"></i> Thay Đổi
                            </button>
                            <?php endif; ?>
                        </div>

                        <!-- Danh sách sản phẩm -->
                        <div class="checkout-section">
                            <h3 class="section-title">
                                <i class="fas fa-box"></i> Sản Phẩm Đặt Mua (<?= $cartCount ?>)
                            </h3>
                            <div class="order-items">
                                <?php foreach ($cartItems as $item):
                                    $tensanpham = $item['tensanpham'] ?? '';
                                    $soluong = (int)($item['soluong'] ?? 1);
                                    $giaban = (float)($item['giaban'] ?? 0);
                                    $giakhuyenmai = (float)($item['giakhuyenmai'] ?? 0);
                                    $kichthuoc = $item['kichthuoc'] ?? '';
                                    $mausac = $item['mausac'] ?? '';
                                    $hinhanh = $item['hinhanh_bienthe'] ?? $item['hinhanh'] ?? '';
                                    
                                    $imgSrc = $hinhanh ? '/btap_web/src/public/img/sanpham/' . $hinhanh : '/btap_web/src/public/img/sanpham/default.png';
                                    $hasDiscount = $giakhuyenmai > 0 && $giakhuyenmai < $giaban;
                                    $displayPrice = $hasDiscount ? $giakhuyenmai : $giaban;
                                    $itemTotal = $displayPrice * $soluong;
                                ?>
                                <div class="order-item">
                                    <img src="<?= htmlspecialchars($imgSrc) ?>" alt="<?= htmlspecialchars($tensanpham) ?>" class="order-item-img">
                                    <div class="order-item-info">
                                        <p class="order-item-name"><?= htmlspecialchars($tensanpham) ?></p>
                                        <?php if ($kichthuoc || $mausac): ?>
                                        <p class="order-item-variant">
                                            <?php if ($mausac): ?>Màu: <?= htmlspecialchars($mausac) ?><?php endif; ?>
                                            <?php if ($kichthuoc): ?><?= $mausac ? ' | ' : '' ?>Size: <?= htmlspecialchars($kichthuoc) ?><?php endif; ?>
                                        </p>
                                        <?php endif; ?>
                                        <div class="order-item-price">
                                            <span class="price-value"><?= formatPrice($displayPrice) ?>₫</span>
                                            <span class="price-qty">x<?= $soluong ?></span>
                                        </div>
                                    </div>
                                    <div class="order-item-total"><?= formatPrice($itemTotal) ?>₫</div>
                                </div>
                                <?php endforeach; ?>
                            </div>
                        </div>

                        <!-- Ghi chú -->
                        <div class="checkout-section">
                            <h3 class="section-title">
                                <i class="fas fa-sticky-note"></i> Ghi Chú
                            </h3>
                            <textarea name="ghichu" class="note-input" placeholder="Nhập ghi chú cho đơn hàng (không bắt buộc)..."></textarea>
                        </div>
                    </div>

                    <!-- Cột phải: Tóm tắt đơn hàng -->
                    <div class="checkout-summary">
                        <h3>Tóm Tắt Đơn Hàng</h3>
                        
                        <div class="summary-row">
                            <span>Tạm tính (<?= $cartCount ?> sản phẩm):</span>
                            <span class="value"><?= formatPrice($cartTotal) ?>₫</span>
                        </div>
                        
                        <div class="summary-row">
                            <span>Phí vận chuyển:</span>
                            <span class="value"><?= formatPrice($shippingFee) ?>₫</span>
                        </div>

                        <!-- Phương thức thanh toán -->
                        <div class="payment-method">
                            <span>Phương thức:</span>
                            <div class="payment-option">
                                <input type="radio" name="phuongthucthanhtoan" value="tienmat" id="cod" checked>
                                <label for="cod">
                                    <i class="fas fa-money-bill-wave"></i> Thanh toán khi nhận hàng
                                </label>
                            </div>
                        </div>
                        
                        <div class="summary-row total">
                            <span>Tổng cộng:</span>
                            <span class="value"><?= formatPrice($totalWithShipping) ?>₫</span>
                        </div>
                        
                        <button type="submit" class="btn-place-order">
                            <i class="fas fa-check"></i> Đặt Hàng
                        </button>
                        
                        <a href="cart.php" class="back-to-cart">
                            <i class="fas fa-arrow-left"></i> Quay lại giỏ hàng
                        </a>
                    </div>
                </div>
            </form>

            <!-- Modal chọn địa chỉ -->
            <div class="address-modal" id="addressModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Chọn Địa Chỉ Nhận Hàng</h3>
                        <button type="button" class="close-modal" onclick="closeAddressModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <?php foreach ($savedAddresses as $addr):
                            $addrData = htmlspecialchars(json_encode($addr), ENT_QUOTES, 'UTF-8');
                        ?>
                        <div class="address-option" onclick="selectAddress(this)" data-address='<?= $addrData ?>'>
                            <input type="radio" name="modal_address" value="<?= $addr->diachi_id ?>" 
                                <?= ($defaultAddress && $defaultAddress->diachi_id == $addr->diachi_id) ? 'checked' : '' ?>>
                            <div class="address-detail">
                                <div class="address-name-phone">
                                    <strong><?= htmlspecialchars($addr->tennguoinhan) ?></strong>
                                    <span><?= htmlspecialchars($addr->sodienthoai) ?></span>
                                    <?php if ($addr->macdinh): ?>
                                    <span class="badge-default">Mặc Định</span>
                                    <?php endif; ?>
                                </div>
                                <p><?= htmlspecialchars($addr->diachichitiet) ?>, <?= htmlspecialchars($addr->phuong) ?>, <?= htmlspecialchars($addr->tinh) ?></p>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-cancel" onclick="closeAddressModal()">Hủy</button>
                        <button type="button" class="btn-confirm" onclick="confirmAddress()">Xác Nhận</button>
                    </div>
                </div>
            </div>
            <?php endif; ?>
        </div>
    </main>

    <footer class="site-footer">
        <div class="footer-bottom">
            <p>&copy; 2025 bTap Shop. Developed by <strong>Nhóm 74DCTT21</strong></p>
        </div>
    </footer>

    <div class="loading-overlay" id="loadingOverlay">
        <div class="spinner"></div>
    </div>

    <script src="/btap_web/src/public/js/header.js" defer></script>
    <script src="/btap_web/src/public/js/checkout-actions.js" defer></script>
    <script>

    let selectedAddressData = null;


    function openAddressModal() {
        document.getElementById('addressModal').classList.add('active');
    }


    function closeAddressModal() {
        document.getElementById('addressModal').classList.remove('active');
    }


    function selectAddress(element) {

        document.querySelectorAll('.address-option').forEach(el => el.classList.remove('selected'));

        element.classList.add('selected');
        element.querySelector('input[type="radio"]').checked = true;
        selectedAddressData = JSON.parse(element.dataset.address);
    }


    function confirmAddress() {
        if (!selectedAddressData) {
            const checkedRadio = document.querySelector('.address-option input:checked');
            if (checkedRadio) {
                selectedAddressData = JSON.parse(checkedRadio.closest('.address-option').dataset.address);
            }
        }
        
        if (selectedAddressData) {

            const addressCard = document.querySelector('.address-card');
            if (addressCard) {
                addressCard.querySelector('.recipient-name').textContent = selectedAddressData.tennguoinhan;
                addressCard.querySelector('.recipient-phone').textContent = selectedAddressData.sodienthoai;
                addressCard.querySelector('.recipient-address').textContent = 
                    selectedAddressData.diachichitiet + ', ' + selectedAddressData.phuong + ', ' + selectedAddressData.tinh;
                

                let badge = addressCard.querySelector('.badge-default');
                if (selectedAddressData.macdinh) {
                    if (!badge) {
                        const mainDiv = addressCard.querySelector('.address-main');
                        mainDiv.innerHTML += '<span class="badge-default">Mặc Định</span>';
                    }
                } else {
                    if (badge) badge.remove();
                }
            }
            

            document.getElementById('tennguoinhan').value = selectedAddressData.tennguoinhan;
            document.getElementById('sodienthoai').value = selectedAddressData.sodienthoai;
            document.getElementById('diachichitiet').value = selectedAddressData.diachichitiet;
            document.getElementById('phuong').value = selectedAddressData.phuong;
            document.getElementById('tinh').value = selectedAddressData.tinh;
        }
        
        closeAddressModal();
    }
    </script>
</body>
</html>
