const mongoose = require("mongoose");

const pesanSchema = new mongoose.Schema({
  pengirim: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pengguna",
    required: true,
  },
  penerima: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pengguna",
    required: true,
  },
  pesan: {
    type: String,
    required: true,
  },
  dibaca: {
    type: Boolean,
    default: false,
  },
  dibuat: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Pesan", pesanSchema);
