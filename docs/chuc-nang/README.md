# Bộ tài liệu theo từng chức năng

Mục tiêu của bộ tài liệu này là tách riêng từng nghiệp vụ để dễ đọc, dễ onboarding và dễ bảo trì.

## Danh sách tài liệu
- [Đăng ký và đăng nhập](dang-ky-dang-nhap.md)
- [Trang chủ user](trang-chu-user.md)
- [Chi tiết sản phẩm](chi-tiet-san-pham.md)
- [Giỏ hàng](gio-hang.md)
- [Header user](header-user.md)
- [Profile user](profile-user.md)
- [Địa chỉ user](dia-chi-user.md)
- [Trạng thái đơn hàng user](trang-thai-don-hang-user.md)
- [Thanh toán user (mua ngay, từ giỏ, COD, MoMo)](thanh-toan-user.md)

## Tài liệu admin
- [Trang quản trị admin](admin-trang-quan-tri.md)
- [Quản lý đơn hàng admin](admin-quan-ly-don-hang.md)
- [Quản lý sản phẩm admin](admin-quan-ly-san-pham.md)
- [Quản lý danh mục admin](admin-quan-ly-danh-muc.md)
- [Quản lý nhập hàng admin](admin-quan-ly-nhap-hang.md)
- [Theo dõi tồn kho admin](admin-theo-doi-ton-kho.md)

## Phụ lục phân tích sâu
- [Phụ lục line-by-line toàn bộ chức năng](phu-luc-line-by-line-toan-bo-chuc-nang.md)

Phụ lục hiện bao gồm thêm:
- trace function-level cho cả backend và frontend,
- ma trận nhánh lỗi thường gặp theo module,
- ghi chú theo code hiện tại để hỗ trợ debug/đối chiếu khi refactor.

## Gợi ý thứ tự đọc
1. Đăng ký và đăng nhập
2. Header user
3. Trang chủ user
4. Chi tiết sản phẩm
5. Giỏ hàng
6. Profile user
7. Địa chỉ user
8. Trạng thái đơn hàng user
9. Thanh toán user
10. Phụ lục line-by-line (đọc khi cần debug sâu)

## Phạm vi
- Tập trung vào luồng backend: route -> middleware/validation -> controller -> service -> dao.
- Tập trung vào frontend: file HTML, cấu trúc trang, hàm JS, render UI, API gọi đi và payload.
