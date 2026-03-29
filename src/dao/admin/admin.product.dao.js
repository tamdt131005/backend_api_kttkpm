import pool from "../../config/db.js";

class AdminProductDAO {
    async laySanPham(keyword = "") {
        const key = `%${String(keyword || "").trim()}%`;
        const [rows] = await pool.execute(
            `
                SELECT
                    sp.id AS sanpham_id,
                    sp.tensanpham,
                    sp.slug,
                    sp.thuonghieu,
                    sp.mota,
                    sp.giaban,
                    sp.giakhuyenmai,
                    sp.hinhanh,
                    sp.an_hien,
                    sp.createdAt AS ngaytao,
                    dm.tendanhmuc,
                    COALESCE(SUM(bt.soluong), 0) AS tonkho
                FROM sanpham sp
                LEFT JOIN danhmuc dm ON sp.danhmuc_id = dm.id
                LEFT JOIN bienthesp bt ON sp.id = bt.sanpham_id
                WHERE sp.deleted_at IS NULL AND sp.tensanpham LIKE ?
                GROUP BY
                    sp.id,
                    sp.tensanpham,
                    sp.slug,
                    sp.thuonghieu,
                    sp.mota,
                    sp.giaban,
                    sp.giakhuyenmai,
                    sp.hinhanh,
                    sp.an_hien,
                    sp.createdAt,
                    dm.tendanhmuc
                ORDER BY sp.createdAt DESC
            `,
            [key]
        );
        return rows;
    }

    async layThongKeSanPham() {
        const [rows] = await pool.execute(
            `
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN COALESCE(bt_sum.tonkho, 0) <= 0 THEN 1 ELSE 0 END) AS hethang,
                    SUM(CASE WHEN COALESCE(bt_sum.tonkho, 0) > 0 THEN 1 ELSE 0 END) AS conhang
                FROM sanpham sp
                LEFT JOIN (
                    SELECT sanpham_id, SUM(soluong) AS tonkho
                    FROM bienthesp
                    GROUP BY sanpham_id
                ) bt_sum ON sp.id = bt_sum.sanpham_id
                WHERE sp.deleted_at IS NULL
            `
        );

        return {
            total: Number(rows[0]?.total || 0),
            hethang: Number(rows[0]?.hethang || 0),
            conhang: Number(rows[0]?.conhang || 0)
        };
    }

    async laySanPhamById(id) {
        const [rows] = await pool.execute(
            `
                SELECT
                    sp.id AS sanpham_id,
                    sp.danhmuc_id,
                    sp.tensanpham,
                    sp.slug,
                    sp.thuonghieu,
                    sp.mota,
                    sp.giaban,
                    sp.giakhuyenmai,
                    sp.hinhanh,
                    sp.an_hien,
                    sp.deleted_at,
                    sp.createdAt,
                    sp.updatedAt
                FROM sanpham sp
                WHERE sp.id = ? AND sp.deleted_at IS NULL
                LIMIT 1
            `,
            [id]
        );

        if (!rows.length) {
            return null;
        }

        const sanpham = rows[0];
        const skuMacDinh = `SP${id}-DEFAULT`;
        const [rowsBienThe] = await pool.execute(
            "SELECT id AS bienthe_id, soluong FROM bienthesp WHERE sanpham_id = ? AND ma_sku = ? LIMIT 1",
            [id, skuMacDinh]
        );

        sanpham.soluong = Number(rowsBienThe[0]?.soluong || 0);
        return sanpham;
    }

    async themSanPham({
        danhmuc_id,
        tensanpham,
        slug,
        thuonghieu,
        mota,
        giaban,
        giakhuyenmai,
        hinhanh,
        an_hien
    }) {
        const [result] = await pool.execute(
            `
                INSERT INTO sanpham
                (danhmuc_id, tensanpham, slug, thuonghieu, mota, giaban, giakhuyenmai, hinhanh, an_hien)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                danhmuc_id,
                tensanpham,
                slug,
                thuonghieu || null,
                mota || null,
                giaban,
                giakhuyenmai,
                hinhanh,
                an_hien
            ]
        );

        return result.insertId;
    }

    async capNhatSanPham(
        id,
        { danhmuc_id, tensanpham, slug, thuonghieu, mota, giaban, giakhuyenmai, hinhanh, an_hien }
    ) {
        const [result] = await pool.execute(
            `
                UPDATE sanpham
                SET
                    danhmuc_id = ?,
                    tensanpham = ?,
                    slug = ?,
                    thuonghieu = ?,
                    mota = ?,
                    giaban = ?,
                    giakhuyenmai = ?,
                    hinhanh = ?,
                    an_hien = ?
                WHERE id = ? AND deleted_at IS NULL
            `,
            [
                danhmuc_id,
                tensanpham,
                slug,
                thuonghieu || null,
                mota || null,
                giaban,
                giakhuyenmai,
                hinhanh,
                an_hien,
                id
            ]
        );

        return result.affectedRows;
    }

    async xoaSanPham(id) {
        const [result] = await pool.execute(
            "UPDATE sanpham SET deleted_at = CURRENT_TIMESTAMP, an_hien = 0 WHERE id = ? AND deleted_at IS NULL",
            [id]
        );
        return result.affectedRows;
    }

    async upsertBienTheMacDinh(sanphamId, soluong) {
        const skuMacDinh = `SP${sanphamId}-DEFAULT`;
        const soLuongSauCapNhat = Number(soluong) > 0 ? Number(soluong) : 0;

        const [rows] = await pool.execute(
            "SELECT id FROM bienthesp WHERE sanpham_id = ? AND ma_sku = ? LIMIT 1",
            [sanphamId, skuMacDinh]
        );

        if (rows.length) {
            const bientheId = rows[0].id;
            await pool.execute(
                "UPDATE bienthesp SET soluong = ?, mausac = 'Mac dinh', kichthuoc = NULL WHERE id = ?",
                [soLuongSauCapNhat, bientheId]
            );
            return bientheId;
        }

        const [result] = await pool.execute(
            `
                INSERT INTO bienthesp (sanpham_id, ma_sku, kichthuoc, mausac, soluong, gia_nhap, hinhanh)
                VALUES (?, ?, NULL, 'Mac dinh', ?, NULL, NULL)
            `,
            [sanphamId, skuMacDinh, soLuongSauCapNhat]
        );

        return result.insertId;
    }
}

export default new AdminProductDAO();
