<?php
/**
 * Trang chủ Admin Panel
 * Dashboard với các link đến các chức năng quản trị
 */
?>
<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - Quản lý Shop</title>
    <link rel="stylesheet" href="css/admin.css">
    <style>
        /* Dashboard specific styles */
        .dashboard-header {
            text-align: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, var(--admin-primary) 0%, #7c3aed 100%);
            border-radius: 16px;
            color: white;
            margin-bottom: 32px;
        }

        .dashboard-header h1 {
            font-size: 36px;
            margin-bottom: 8px;
        }

        .dashboard-header p {
            opacity: 0.9;
            font-size: 16px;
        }

        .menu-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
        }

        .menu-card {
            background: var(--admin-card);
            border-radius: 16px;
            padding: 28px;
            text-decoration: none;
            color: var(--admin-text);
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            border: 1px solid var(--admin-border);
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .menu-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(79, 70, 229, 0.15);
            border-color: var(--admin-primary);
        }

        .menu-card .icon {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            margin-bottom: 16px;
        }

        .menu-card h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .menu-card p {
            font-size: 14px;
            color: var(--admin-text-muted);
            line-height: 1.5;
        }

        /* Icon backgrounds */
        .icon-order {
            background: #dbeafe;
            color: #2563eb;
        }

        .icon-import {
            background: #dcfce7;
            color: #16a34a;
        }

        .icon-stock {
            background: #fef3c7;
            color: #d97706;
        }

        .icon-product {
            background: #ede9fe;
            color: #7c3aed;
        }

        .icon-user {
            background: #fce7f3;
            color: #db2777;
        }

        .icon-report {
            background: #cffafe;
            color: #0891b2;
        }

        /* Footer */
        .dashboard-footer {
            text-align: center;
            margin-top: 48px;
            padding: 24px;
            color: var(--admin-text-muted);
            font-size: 14px;
        }
    </style>
</head>

<body>

    <div class="admin-container">

        <!-- Header -->
        <div class="dashboard-header">
            <h1>🏪 Admin Panel</h1>
            <p>Hệ thống quản trị cửa hàng thời trang</p>
        </div>

        <!-- Menu Grid -->
        <div class="menu-grid">

            <!-- Quản lý đơn hàng -->
            <a href="view/donhang_list.php" class="menu-card">
                <div class="icon icon-order">📦</div>
                <h3>Quản lý đơn hàng</h3>
                <p>Xem, xét duyệt và quản lý tất cả đơn hàng của khách hàng</p>
            </a>

            <!-- Nhập hàng -->
            <a href="nhaphang_list.php" class="menu-card">
                <div class="icon icon-import">📥</div>
                <h3>Quản lý nhập hàng</h3>
                <p>Xem danh sách phiếu nhập và thêm phiếu nhập mới</p>
            </a>

            <!-- Tồn kho -->
            <a href="tonkho_list.php" class="menu-card">
                <div class="icon icon-stock">📊</div>
                <h3>Quản lý tồn kho</h3>
                <p>Theo dõi số lượng tồn kho của từng sản phẩm</p>
            </a>

            <!-- Quản lý sản phẩm -->
            <a href="view/sanpham_list.php" class="menu-card">
                <div class="icon icon-product">👕</div>
                <h3>Quản lý sản phẩm</h3>
                <p>Thêm, sửa, xóa sản phẩm trong cửa hàng</p>
            </a>

            <!-- Quản lý danh mục -->
            <a href="view/danhmuc_list.php" class="menu-card">
                <div class="icon icon-user">📁</div>
                <h3>Quản lý danh mục</h3>
                <p>Thêm, sửa, xóa danh mục sản phẩm</p>
            </a>
        </div>
    </div>

</body>

</html>