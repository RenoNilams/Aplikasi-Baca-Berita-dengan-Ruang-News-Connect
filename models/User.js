const mongoose = require("mongoose");

// Nonaktifkan strictQuery
mongoose.set("strictQuery", false);

const userSchema = new mongoose.Schema(
  {
    namaLengkap: {
      type: String,
      required: [true, "Nama lengkap harus diisi"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email harus diisi"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    kataSandi: {
      type: String,
      required: [true, "Kata sandi harus diisi"],
    },
  },
  {
    timestamps: true,
  }
);

// Tambahkan index untuk email
userSchema.index({ email: 1 }, { unique: true });

const Pengguna = mongoose.model("Pengguna", userSchema);

module.exports = Pengguna;
