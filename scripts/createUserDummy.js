// scripts/tambah-pengguna.js
const mongoose = require("mongoose");
const Pengguna = require("../models/User");
const bcrypt = require("bcrypt");

async function tambahPengguna() {
  try {
    // Hubungkan ke database
    await mongoose.connect("mongodb://127.0.0.1:27017/chat_app", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Buat beberapa pengguna uji
    const pengguna = [
      {
        namaLengkap: "John Doe",
        email: "john@example.com",
        kataSandi: await bcrypt.hash("password123", 10),
      },
      {
        namaLengkap: "Jane Smith",
        email: "jane@example.com",
        kataSandi: await bcrypt.hash("password456", 10),
      },
    ];

    // Simpan pengguna
    await Pengguna.insertMany(pengguna);
    console.log("Pengguna berhasil ditambahkan");

    // Tutup koneksi
    await mongoose.connection.close();
  } catch (error) {
    console.error("Gagal menambahkan pengguna:", error);
  }
}

tambahPengguna();
