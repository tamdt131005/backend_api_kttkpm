import pool from "../config/db.js";

class UserProductsDAO {
    async getAllProducts() {
        const [rows] = await pool.query(`SELECT 
                sp.id,
            sp.tensanpham,
            sp.giaban,
            sp.giakhuyenmai,
            sp.hinhanh,
            COALESCE(SUM(bt.soluong), 0) AS tong_soluong,
            COALESCE(AVG(dg.sao), 0) AS diem_danhgia,
            COUNT(dg.id) AS luot_danhgia
                FROM sanpham sp
                LEFT JOIN bienthesp bt ON sp.id = bt.sanpham_id
                LEFT JOIN danhgia dg ON sp.id = dg.sanpham_id
                WHERE sp.an_hien = 1 AND sp.deleted_at IS NULL
                GROUP BY sp.id
                ORDER BY sp.createdAt DESC 
                LIMIT 8`);
        return rows;
    }

    async searchProducts(keyword, limit) {
        const q = `%${keyword}%`;
        const qStart = `${keyword}%`;
        const limitNumber = Number.isInteger(limit) && limit > 0 ? limit : 6;
        const [rows] = await pool.execute(`
            SELECT
                sp.id AS sanpham_id,
                sp.tensanpham,
                sp.giaban,
                COALESCE(sp.giakhuyenmai, 0) AS giakhuyenmai,
                sp.hinhanh
            FROM sanpham sp
            WHERE sp.an_hien = 1
              AND sp.deleted_at IS NULL
              AND (
                sp.tensanpham LIKE ?
                OR sp.slug LIKE ?
                OR COALESCE(sp.thuonghieu, '') LIKE ?
              )
            ORDER BY
                CASE WHEN sp.tensanpham LIKE ? THEN 0 ELSE 1 END,
                sp.updatedAt DESC,
                sp.id DESC
            LIMIT ${limitNumber}
        `, [q, q, q, qStart]);

        return rows;
    }

    async getProductById(id) {
        const [rows] = await pool.execute(`
            SELECT
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
                dm.tendanhmuc,
                dm.slug AS danhmuc_slug,
                COALESCE(AVG(dg.sao), 0)  AS diem_danhgia,
                COUNT(DISTINCT dg.id)      AS luot_danhgia,
                COALESCE(SUM(bt.soluong), 0) AS tong_soluong
            FROM sanpham sp
            LEFT JOIN danhmuc dm ON sp.danhmuc_id = dm.id
            LEFT JOIN bienthesp bt ON sp.id = bt.sanpham_id
            LEFT JOIN danhgia dg  ON sp.id = dg.sanpham_id AND dg.trang_thai = 'duyety'
            WHERE sp.id = ? AND sp.an_hien = 1 AND sp.deleted_at IS NULL
            GROUP BY sp.id, dm.tendanhmuc, dm.slug
        `, [id]);

        if (rows.length === 0) return null;
        const product = rows[0];

        const [bienthe] = await pool.execute(`
            SELECT id, ma_sku, kichthuoc, mausac, soluong, hinhanh
            FROM bienthesp
            WHERE sanpham_id = ?
            ORDER BY mausac, kichthuoc
        `, [id]);

        const [hinhanhPhu] = await pool.execute(`
            SELECT ten_file, thu_tu
            FROM hinhanh_sanpham
            WHERE sanpham_id = ?
            ORDER BY thu_tu ASC
        `, [id]);

        product.bienthe = bienthe;
        product.hinhanh_phu = hinhanhPhu.map(h => h.ten_file);

        return product;
    }
    async getProductsByCategoryId(categoryId) {
        const [rows] = await pool.execute('SELECT * FROM sanpham WHERE danhmuc_id = ?', [categoryId]);
        return rows;
    }
}

export default new UserProductsDAO();