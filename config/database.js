const mongoose = require("mongoose");

const hubungkanDatabase = async () => {
  try {
    // Gunakan connection string yang lebih spesifik
    const koneksiDatabase = "mongodb://127.0.0.1:27017/chat_app";

    // Tambahkan opsi koneksi yang lebih komprehensif
    const opsi = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout yang lebih pendek
      retryWrites: true,
    };
    // Tambahkan event listener
    mongoose.connection.on("connected", () => {
      console.log("✅ Terhubung ke MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Kesalahan koneksi MongoDB:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("❗ Terputus dari MongoDB");
    });

    // Lakukan koneksi
    await mongoose.connect(koneksiDatabase, opsi);

    return mongoose.connection;
  } catch (error) {
    console.error("❌ Gagal terhubung ke database:", error);
    process.exit(1);
  }
};
// Di database.js
mongoose.set("debug", true); // Aktifkan logging query
module.exports = hubungkanDatabase;
