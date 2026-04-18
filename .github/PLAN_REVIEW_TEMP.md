# PLAN REVIEW TEMP

## 1) Thong tin yeu cau

- Yeu cau: (1) Them upload anh trong quan ly san pham admin, (2) doi wording "Quan ly ton kho" vi man hien tai chi de xem, (3) bo buoc "Da xac nhan" trong quy trinh trang thai don hang admin (chuyen sang "Dang xu ly" luon), (4) fix loi ngay sinh khi user cap nhat profile
- Nguoi de xuat: User
- Thoi diem lap plan: 2026-04-19

## 2) Muc tieu thay doi

- [x] Muc tieu 1: Bo sung API upload anh san pham cho admin va tao duong dan anh luu vao truong `hinhanh`
- [x] Muc tieu 2: Cap nhat form them/sua san pham de upload anh va preview anh truoc khi luu
- [x] Muc tieu 3: Doi nhan "Quan ly ton kho" thanh "Theo doi ton kho" de dung nghia man hinh
- [x] Muc tieu 4: Bo buoc `daxacnhan` trong flow trang thai don hang admin, dong bo backend + frontend admin
- [x] Muc tieu 5: Sua luong update profile de luu `ngaysinh` theo dinh dang ngay-thang (`YYYY-MM-DD`) va tranh lech ngay do timezone

## 3) Danh sach file du kien sua

| STT | File | Noi dung thay doi | Ly do | Trang thai duyet |
| --- | --- | --- | --- | --- |
| 1 | src/routes/admin.route.js | Them middleware multer + endpoint upload anh san pham admin | Ho tro upload file anh thay vi chi nhap chuoi ten anh | Da duyet theo yeu cau chat |
| 2 | src/controller/admin/admin.product.controller.js | Them action `uploadAnhSanPham` tra ve `hinhanh` + URL xem anh | Dong bo response upload theo format API hien tai | Da duyet theo yeu cau chat |
| 3 | src/services/admin/admin.shared.js | Cap nhat thu tu trang thai: bo `daxacnhan`, map gia tri cu sang `dangxuly` | Dap ung yeu cau bo buoc da xac nhan | Da duyet theo yeu cau chat |
| 4 | src/dao/admin/admin.order.dao.js | Gom thong ke `daxacnhan` vao `dangxuly` | Tranh tach so lieu theo trang thai da bo | Da duyet theo yeu cau chat |
| 5 | fontend/pages/admin/js/admin.common.js | Them `adminApi.upload`, cap nhat text/flow trang thai don hang | Frontend admin goi upload API va flow trang thai moi | Da duyet theo yeu cau chat |
| 6 | fontend/pages/admin/js/donhang_list.js | Bo hien thi thong ke `daxacnhan` | Dong bo UI voi flow trang thai moi | Da duyet theo yeu cau chat |
| 7 | fontend/pages/admin/js/donhang_detail.js | Cap nhat progress step bo `daxacnhan` | Dong bo tien trinh trang thai tren trang chi tiet | Da duyet theo yeu cau chat |
| 8 | fontend/pages/admin/view/donhang_all.html | Bo tab + box thong ke `Da xac nhan` | Dong bo UI voi flow trang thai moi | Da duyet theo yeu cau chat |
| 9 | fontend/pages/admin/view/donhang_choxacnhan.html | Bo tab + box thong ke `Da xac nhan` | Dong bo UI voi flow trang thai moi | Da duyet theo yeu cau chat |
| 10 | fontend/pages/admin/view/donhang_daxacnhan.html | Doi thanh trang alias `dangxuly`, cap nhat tab/stats | Tuong thich link cu, khong can xoa file | Da duyet theo yeu cau chat |
| 11 | fontend/pages/admin/view/donhang_dangxuly.html | Bo tab + box thong ke `Da xac nhan` | Dong bo UI voi flow trang thai moi | Da duyet theo yeu cau chat |
| 12 | fontend/pages/admin/view/donhang_danggiao.html | Bo tab + box thong ke `Da xac nhan` | Dong bo UI voi flow trang thai moi | Da duyet theo yeu cau chat |
| 13 | fontend/pages/admin/view/donhang_dagiao.html | Bo tab + box thong ke `Da xac nhan` | Dong bo UI voi flow trang thai moi | Da duyet theo yeu cau chat |
| 14 | fontend/pages/admin/view/sanpham_add.html | Them input file/upload button/preview anh | Ho tro upload anh trong form them san pham | Da duyet theo yeu cau chat |
| 15 | fontend/pages/admin/view/sanpham_edit.html | Them input file/upload button/preview anh | Ho tro upload anh trong form sua san pham | Da duyet theo yeu cau chat |
| 16 | fontend/pages/admin/js/sanpham_add.js | Xu ly upload anh + cap nhat `hinhanh` + preview | Ket noi frontend voi upload API moi | Da duyet theo yeu cau chat |
| 17 | fontend/pages/admin/js/sanpham_edit.js | Xu ly upload anh + cap nhat `hinhanh` + preview | Ket noi frontend voi upload API moi | Da duyet theo yeu cau chat |
| 18 | fontend/pages/admin/css/sanpham_add.css | Them style cho khu upload/preview anh | Dam bao UI de su dung tren desktop/mobile | Da duyet theo yeu cau chat |
| 19 | fontend/pages/admin/css/sanpham_edit.css | Them style cho khu upload/preview anh | Dam bao UI de su dung tren desktop/mobile | Da duyet theo yeu cau chat |
| 20 | fontend/pages/admin/index.html | Doi wording menu card ton kho thanh "Theo doi ton kho" | Dung nghia man hinh chi xem | Da duyet theo yeu cau chat |
| 21 | fontend/pages/admin/tonkho_list.html | Doi title/h1 theo wording "Theo doi ton kho" | Dung nghia man hinh chi xem | Da duyet theo yeu cau chat |
| 22 | fontend/pages/profile/profile.js | Sua xu ly truong `ngaysinh` khi load/update profile de tranh lech ngay | Khac phuc loi ngay sinh khi user cap nhat profile | Da duyet theo yeu cau chat |

## 4) Danh sach file du kien xoa/doi ten/di chuyen (CAN DUYET RO RANG)

| STT | Hanh dong | File | Ly do | Tac dong | Trang thai duyet |
| --- | --- | --- | --- | --- | --- |
| 1 | Khong co | - | - | Khong tac dong | Khong can |

## 5) Danh sach thay doi du lieu quan trong (CAN DUYET RO RANG)

| STT | Loai thay doi | Pham vi | Ly do | Rui ro/Tac dong | Ke hoach rollback | Trang thai duyet |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Khong doi schema DB | Database | Chi thay doi logic API/UI | Rui ro thap | Revert code | Khong can |

## 6) Rui ro tong the va cach giam thieu

- Rui ro: Upload file khong hop le hoac qua dung luong
- Cach giam thieu: Gioi han MIME `image/*`, dung luong 2MB, thong bao loi ro rang tren API va frontend
- Rui ro: Don cu dang o trang thai `daxacnhan` bi hien thi khac
- Cach giam thieu: Map `daxacnhan -> dangxuly` trong chuan hoa backend va thong ke
- Rui ro: UI admin bi lech do bo cot/thong ke da xac nhan
- Cach giam thieu: Cap nhat dong bo tab, thong ke, progress bar trong cac trang don hang admin
- Rui ro: Ngay sinh bi lech 1 ngay do frontend chuyen `input[type=date]` thanh ISO datetime
- Cach giam thieu: Gui len backend theo dang date-only `YYYY-MM-DD`, va parse hien thi uu tien date-only

## 7) Xac nhan cua nguoi dung

- [x] Dong y toan bo
- [ ] Dong y mot phan (ghi ro STT duoc phep)
- [ ] Khong dong y
- Ghi chu phe duyet: User da xac nhan "vang" cho pham vi fix profile ngay sinh bo sung

## 8) Pham vi duoc phep thuc thi

- Chi thuc thi cac file neu o muc 3.
- Khong doi schema DB, khong doi ten/xoa file.
