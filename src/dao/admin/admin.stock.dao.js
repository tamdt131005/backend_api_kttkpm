import pool from "../../config/db.js";

class AdminStockDAO {
    async layTonKho(keyword = "", order = "asc", status = "") {
        const huong = String(order).toLowerCase() === "desc" ? "DESC" : "ASC";
        const key = `%${String(keyword || "").trim()}%`;

        let sql = `
            SELECT
                sp.id AS sanpham_id,
                sp.tensanpham,
                sp.hinhanh,
                dm.tendanhmuc,
                COALESCE(SUM(bt.soluong), 0) AS tonkho
            FROM sanpham sp
            LEFT JOIN bienthesp bt ON sp.id = bt.sanpham_id
            LEFT JOIN danhmuc dm ON sp.danhmuc_id = dm.id
            WHERE sp.deleted_at IS NULL AND sp.tensanpham LIKE ?
            GROUP BY sp.id, sp.tensanpham, sp.hinhanh, dm.tendanhmuc
            HAVING 1 = 1
        `;

        const params = [key];

        if (status === "hethang") {
            sql += " AND tonkho <= 0";
        } else if (status === "saphet") {
            sql += " AND tonkho > 0 AND tonkho < 20";
        } else if (status === "conhang") {
            sql += " AND tonkho >= 20";
        }

        sql += ` ORDER BY tonkho ${huong}, sp.tensanpham ASC`;

        const [rows] = await pool.execute(sql, params);
        return rows;
    }

    async layThongKeTonKho() {
        const [rows] = await pool.execute(
            `
                SELECT
                    SUM(CASE WHEN tonkho <= 0 THEN 1 ELSE 0 END) AS hethang,
                    SUM(CASE WHEN tonkho > 0 AND tonkho < 20 THEN 1 ELSE 0 END) AS saphet,
                    SUM(CASE WHEN tonkho >= 20 THEN 1 ELSE 0 END) AS conhang,
                    COUNT(*) AS total
                FROM (
                    SELECT sp.id, COALESCE(SUM(bt.soluong), 0) AS tonkho
                    FROM sanpham sp
                    LEFT JOIN bienthesp bt ON sp.id = bt.sanpham_id
                    WHERE sp.deleted_at IS NULL
                    GROUP BY sp.id
                ) AS stats
            `
        );

        return {
            hethang: Number(rows[0]?.hethang || 0),
            saphet: Number(rows[0]?.saphet || 0),
            conhang: Number(rows[0]?.conhang || 0),
            total: Number(rows[0]?.total || 0)
        };
    }

    async layDanhSachBienThe(keyword = "") {
        let sql = `
            SELECT
                bt.id AS bienthe_id,
                bt.sanpham_id,
                bt.ma_sku,
                bt.kichthuoc,
                bt.mausac,
                bt.soluong,
                sp.tensanpham,
                CONCAT(
                    sp.tensanpham,
                    ' - Size ',
                    COALESCE(CAST(bt.kichthuoc AS CHAR), 'N/A'),
                    ' - ',
                    bt.mausac
                ) AS tenbienthe
            FROM bienthesp bt
            JOIN sanpham sp ON bt.sanpham_id = sp.id
            WHERE sp.deleted_at IS NULL
        `;

        const params = [];

        if (keyword && String(keyword).trim() !== "") {
            const key = `%${String(keyword).trim()}%`;
            sql += " AND (sp.tensanpham LIKE ? OR bt.ma_sku LIKE ? OR bt.mausac LIKE ?)";
            params.push(key, key, key);
        }

        sql += " ORDER BY sp.tensanpham ASC, bt.kichthuoc ASC, bt.mausac ASC";

        const [rows] = await pool.execute(sql, params);
        return rows;
    }
}

export default new AdminStockDAO();
