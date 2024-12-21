const jwt = require("jsonwebtoken");
const Pengguna = require("../models/User");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  try {
    // Ambil token dari header atau cookie
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

    if (!token) {
      return res.redirect("/login");
    }

    // Verifikasi token menggunakan JWT_SECRET dari .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cari pengguna berdasarkan ID
    const pengguna = await Pengguna.findById(decoded.id);

    if (!pengguna) {
      return res.status(401).json({ error: "Pengguna tidak ditemukan" });
    }

    // Simpan informasi pengguna di request
    req.user = pengguna;
    next();
  } catch (error) {
    console.error("Kesalahan autentikasi:", error);
    res.status(401).json({
      error: "Tidak terautentikasi",
      detailError: error.message,
    });
  }
};

module.exports = authMiddleware;
