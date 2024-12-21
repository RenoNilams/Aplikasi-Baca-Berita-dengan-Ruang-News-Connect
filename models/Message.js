const mongoose = require("mongoose");

// Skema pesan untuk riwayat chat
const messageSchema = new mongoose.Schema({
  pengirim: { type: mongoose.Schema.Types.ObjectId, ref: "Pengguna" },
  penerima: { type: mongoose.Schema.Types.ObjectId, ref: "Pengguna" },
  isi: { type: String, required: true },
  waktu: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Pesan", messageSchema);
