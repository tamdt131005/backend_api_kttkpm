import pool from "../../config/db.js";

class AdminCategoryDAO {
    async layDanhMuc(keyword = "") {
        const key = `%${String(keyword || "").trim()}%`;
        const [rows] = await pool.execute(
            `
                SELECT
                    dm.id AS danhmuc_id,
                    dm.tendanhmuc,
                    dm.slug,
                    dm.mota,
                    COUNT(sp.id) AS sosanpham
                FROM danhmuc dm
                LEFT JOIN sanpham sp ON dm.id = sp.danhmuc_id AND sp.deleted_at IS NULL
                WHERE dm.tendanhmuc LIKE ?
                GROUP BY dm.id, dm.tendanhmuc, dm.slug, dm.mota
                ORDER BY dm.tendanhmuc ASC
            `,
            [key]
        );
        return rows;
    }

    async layThongKeDanhMuc() {
        const [rows] = await pool.execute("SELECT COUNT(*) AS total FROM danhmuc");
        return {
            total: Number(rows[0]?.total || 0)
        };
    }

    async layDanhMucById(id) {
        const [rows] = await pool.execute(
            "SELECT id AS danhmuc_id, tendanhmuc, slug, mota FROM danhmuc WHERE id = ? LIMIT 1",
            [id]
        );
        return rows[0] || null;
    }

    async kiemTraDanhMucTonTai(id) {
        const [rows] = await pool.execute("SELECT id FROM danhmuc WHERE id = ? LIMIT 1", [id]);
        return rows.length > 0;
    }

    async kiemTraTrungTenDanhMuc(tendanhmuc, idBoQua = null) {
        if (idBoQua) {
            const [rows] = await pool.execute(
                "SELECT id FROM danhmuc WHERE tendanhmuc = ? AND id <> ? LIMIT 1",
                [tendanhmuc, idBoQua]
            );
            return rows.length > 0;
        }

        const [rows] = await pool.execute(
            "SELECT id FROM danhmuc WHERE tendanhmuc = ? LIMIT 1",
            [tendanhmuc]
        );
        return rows.length > 0;
    }

    async themDanhMuc({ tendanhmuc, slug, mota }) {
        const [result] = await pool.execute(
            "INSERT INTO danhmuc (tendanhmuc, slug, mota) VALUES (?, ?, ?)",
            [tendanhmuc, slug, mota || null]
        );
        return result.insertId;
    }

    async capNhatDanhMuc(id, { tendanhmuc, slug, mota }) {
        const [result] = await pool.execute(
            "UPDATE danhmuc SET tendanhmuc = ?, slug = ?, mota = ? WHERE id = ?",
            [tendanhmuc, slug, mota || null, id]
        );
        return result.affectedRows;
    }

    async demSanPhamTheoDanhMuc(id) {
        const [rows] = await pool.execute(
            "SELECT COUNT(*) AS total FROM sanpham WHERE danhmuc_id = ? AND deleted_at IS NULL",
            [id]
        );
        return Number(rows[0]?.total || 0);
    }

    async xoaDanhMuc(id) {
        const [result] = await pool.execute("DELETE FROM danhmuc WHERE id = ?", [id]);
        return result.affectedRows;
    }
}

export default new AdminCategoryDAO();
