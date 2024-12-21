const Pengguna = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Tampilkan halaman login
exports.tampilkanLogin = (req, res) => {
  // Render halaman login
  res.render("login", { pesan: null });
};

// Proses login
exports.prosesLogin = async (req, res) => {
  try {
    const { email, kataSandi } = req.body;

    console.log("Login attempt:", email); // Tambahkan logging

    // Cari pengguna berdasarkan email
    const pengguna = await Pengguna.findOne({ email });

    if (!pengguna) {
      console.log("User not found"); // Logging
      return res.status(400).json({
        success: false,
        pesan: "Email tidak ditemukan",
      });
    }

    // Validasi kata sandi
    const cocok = await bcrypt.compare(kataSandi, pengguna.kataSandi);

    if (!cocok) {
      console.log("Password not match"); // Logging
      return res.status(400).json({
        success: false,
        pesan: "Kata sandi salah",
      });
    }

    // Buat token JWT
    const token = jwt.sign({ id: pengguna._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // customisasi masa berlaku token
    });

    // Log token yang dibuat
    console.log("Token created:", token);

    // Kirim response JSON dengan token
    res.status(200).json({
      success: true,
      token: token,
      redirect: "/chat",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      pesan: "Terjadi kesalahan: " + error.message,
    });
  }
};

// Tampilkan halaman register
exports.tampilkanRegister = (req, res) => {
  res.render("register", { pesan: null });
};

// Proses register
exports.prosesRegister = async (req, res) => {
  try {
    const { namaLengkap, email, kataSandi } = req.body;

    // Cek apakah email sudah terdaftar
    const emailAda = await Pengguna.findOne({ email });

    if (emailAda) {
      return res.render("register", { pesan: "Email sudah terdaftar" });
    }

    // Hash kata sandi
    const salt = await bcrypt.genSalt(10);
    const hashedKataSandi = await bcrypt.hash(kataSandi, salt);

    // Buat pengguna baru
    const pengguna = new Pengguna({
      namaLengkap,
      email,
      kataSandi: hashedKataSandi,
    });

    await pengguna.save();

    // Redirect ke halaman login
    res.redirect("/login");
  } catch (error) {
    console.error("Kesalahan register:", error);
    res.render("register", { pesan: "Terjadi kesalahan" });
  }
};

// Logout
exports.logout = (req, res) => {
  // Hapus token dari cookie
  res.clearCookie("token");

  // Redirect ke halaman login
  res.redirect("/login");
};
