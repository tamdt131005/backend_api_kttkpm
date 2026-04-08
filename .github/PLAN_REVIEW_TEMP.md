# PLAN REVIEW TEMP

## 1) Thong tin yeu cau

- Yeu cau: Tich hop server MoMo cho thanh toan chuyen khoan trong luong don hang hien tai
- Nguoi de xuat: User
- Thoi diem lap plan: 2026-04-03

## 2) Muc tieu thay doi

- [x] Muc tieu 1: Chuyen `src/services/momo.service.js` thanh service dung, co `createPayment` va `verifyIpnSignature`
- [x] Muc tieu 2: Rang buoc tao link MoMo chi cho don hang thanh toan chuyen khoan

## 3) Danh sach file du kien sua

| STT | File | Noi dung thay doi | Ly do | Trang thai duyet |
| --- | --- | --- | --- | --- |
| 1 | src/services/momo.service.js | Viet lai service MoMo dung env config, ky request, goi HTTPS, verify chu ky IPN | File hien tai la script demo, khong export API de service order su dung | Da duyet theo yeu cau chat |
| 2 | src/dao/order.dao.js | Bo sung `phuongthuc_thanhtoan` trong truy van tom tat don cho payment | Service can biet don co phai chuyen khoan hay khong | Da duyet theo yeu cau chat |
| 3 | src/services/order.service.js | Chan tao link MoMo neu don khong phai chuyen khoan | Tranh thanh toan lech phuong thuc | Da duyet theo yeu cau chat |

## 4) Danh sach file du kien xoa/doi ten/di chuyen (CAN DUYET RO RANG)

| STT | Hanh dong | File | Ly do | Tac dong | Trang thai duyet |
| --- | --- | --- | --- | --- | --- |
| 1 | Khong co | - | - | Khong tac dong | Khong can |

## 5) Danh sach thay doi du lieu quan trong (CAN DUYET RO RANG)

| STT | Loai thay doi | Pham vi | Ly do | Rui ro/Tac dong | Ke hoach rollback | Trang thai duyet |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Khong co thay doi schema/data | Database | Khong can migration | Rui ro thap | Revert code | Khong can |

## 6) Rui ro tong the va cach giam thieu

- Rui ro: Sai config env MoMo dan den tao payment that bai
- Cach giam thieu: Dat gia tri fallback sandbox, thong bao loi ro rang tu response MoMo
- Rui ro: Signature IPN khong dung format du lieu
- Cach giam thieu: Verify theo dung chuoi signature callback v2 cua MoMo

## 7) Xac nhan cua nguoi dung

- [x] Dong y toan bo
- [ ] Dong y mot phan (ghi ro STT duoc phep)
- [ ] Khong dong y
- Ghi chu phe duyet: User da yeu cau thuc hien truc tiep trong chat

## 8) Pham vi duoc phep thuc thi

- Chi thuc thi cac file neu o muc 3.
- Khong doi schema DB, khong doi ten/xoa file.
