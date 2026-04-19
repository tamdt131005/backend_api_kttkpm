# PLAN REVIEW TEMP

## 1) Thong tin yeu cau

- Yeu cau: Doc codebase va viet docs chi tiet hon, tuong tan hon cho cac chuc nang user.
- Nguoi de xuat: User
- Thoi diem lap plan: 2026-04-19

## 2) Muc tieu thay doi

- [ ] Muc tieu 1: Bo sung phan phan tich sau theo tung ham va tung nhanh loi trong phu luc line-by-line.
- [ ] Muc tieu 2: Cap nhat docs tung chuc nang voi cac ghi chu theo code hien tai (khong suy doan).
- [ ] Muc tieu 3: Dong bo README docs va tai lieu tong quan de chi ro muc do chi tiet moi.

## 3) Danh sach file du kien sua

| STT | File | Noi dung thay doi | Ly do | Trang thai duyet |
| --- | --- | --- | --- | --- |
| 1 | docs/chuc-nang/phu-luc-line-by-line-toan-bo-chuc-nang.md | Mo rong phan tich theo ham: route/controller/service/dao + frontend event flow + nhanh loi | Tang muc do chi tiet, phuc vu debug/onboarding | Da duyet theo phan hoi user |
| 2 | docs/chuc-nang/dang-ky-dang-nhap.md | Bo sung ghi chu thuc te theo code auth hien tai | Giam lech giua tai lieu va code | Da duyet theo phan hoi user |
| 3 | docs/chuc-nang/trang-chu-user.md | Bo sung ghi chu thuc te theo code main/product | Giam lech giua tai lieu va code | Da duyet theo phan hoi user |
| 4 | docs/chuc-nang/chi-tiet-san-pham.md | Bo sung ghi chu thuc te theo code product detail | Giam lech giua tai lieu va code | Da duyet theo phan hoi user |
| 5 | docs/chuc-nang/gio-hang.md | Bo sung ghi chu thuc te theo code cart | Giam lech giua tai lieu va code | Da duyet theo phan hoi user |
| 6 | docs/chuc-nang/header-user.md | Bo sung ghi chu thuc te theo code components/search | Giam lech giua tai lieu va code | Da duyet theo phan hoi user |
| 7 | docs/chuc-nang/profile-user.md | Bo sung ghi chu thuc te theo code profile | Giam lech giua tai lieu va code | Da duyet theo phan hoi user |
| 8 | docs/chuc-nang/dia-chi-user.md | Bo sung ghi chu thuc te theo code address | Giam lech giua tai lieu va code | Da duyet theo phan hoi user |
| 9 | docs/chuc-nang/trang-thai-don-hang-user.md | Bo sung ghi chu thuc te theo code orders/detail | Giam lech giua tai lieu va code | Da duyet theo phan hoi user |
| 10 | docs/chuc-nang/thanh-toan-user.md | Bo sung ghi chu thuc te theo code checkout/momo | Giam lech giua tai lieu va code | Da duyet theo phan hoi user |
| 11 | docs/chuc-nang/README.md | Cap nhat mo ta muc do phu luc sau cap nhat | Dieu huong tai lieu de hoc nhanh | Da duyet theo phan hoi user |
| 12 | docs/phan-tich-codebase-user-backend-frontend.md | Cap nhat thong tin pham vi phan tich sau hon | Dong bo tong quan voi tai lieu chuc nang | Da duyet theo phan hoi user |
| 13 | .github/PLAN_REVIEW_TEMP.md | Cap nhat plan task hien tai | Dung quy trinh duyet truoc khi trien khai | Da duyet theo phan hoi user |

## 4) Danh sach file du kien xoa/doi ten/di chuyen (CAN DUYET RO RANG)

| STT | Hanh dong | File | Ly do | Tac dong | Trang thai duyet |
| --- | --- | --- | --- | --- | --- |
| 1 | Khong co | - | - | Khong tac dong cau truc repo | Khong can |

## 5) Danh sach thay doi du lieu quan trong (CAN DUYET RO RANG)

| STT | Loai thay doi | Pham vi | Ly do | Rui ro/Tac dong | Ke hoach rollback | Trang thai duyet |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Khong doi schema DB, khong doi data runtime | Database + API runtime | Chi cap nhat tai lieu markdown | Rui ro rat thap | Revert docs | Khong can |

## 6) Rui ro tong the va cach giam thieu

- Rui ro: Tai lieu them qua nhieu thong tin gay kho doc.
- Cach giam thieu: Chia theo module, danh so ro rang, giu cau truc nhat quan.
- Rui ro: Mo ta sai lech so voi code khi bo sot nhanh loi.
- Cach giam thieu: Doi chieu truc tiep route/controller/service/dao/frontend script truoc khi ghi.
- Rui ro: Tai lieu nhac den hanh vi dang la "known issue" de gay nham la bug moi.
- Cach giam thieu: Danh dau ro la "ghi chu theo code hien tai" va tach voi de xuat cai tien.

## 7) Xac nhan cua nguoi dung

- [x] Dong y toan bo
- [ ] Dong y mot phan (ghi ro STT duoc phep)
- [ ] Khong dong y
- Ghi chu phe duyet: User da duyet toan bo pham vi chinh sua docs + plan.

## 8) Pham vi duoc phep thuc thi

- Chi chinh sua cac file neu trong muc 3.
- Khong sua code runtime backend/frontend trong task nay.
- Khong doi schema DB, khong xoa/doi ten/di chuyen file.
