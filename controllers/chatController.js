const Pesan = require("../models/Pesan");
const Pengguna = require("../models/User");

exports.tampilkanHalamanChat = async (req, res) => {
  try {
    console.log("Memuat halaman chat");

    // Pastikan pengguna sudah login
    if (!req.user) {
      console.log("Pengguna belum login");
      return res.redirect("/login");
    }

    // Dapatkan ID pengguna yang sedang login
    const penggunaId = req.user._id;

    // Dapatkan daftar kontak (pengguna lain)
    const kontaks = await Pengguna.find({
      _id: { $ne: penggunaId },
    }).select("_id namaLengkap");

    console.log("Kontaks yang ditemukan:", kontaks);

    // Render halaman chat
    res.render("chat", {
      pengguna: req.user,
      kontaks: kontaks || [],
    });
  } catch (error) {
    console.error("Gagal memuat halaman chat:", error);
    res.status(500).send("Terjadi kesalahan");
  }
};

exports.muatPesan = async (req, res) => {
  try {
    const { penerima } = req.params;
    const pengirim = req.user._id;

    console.log(`Memuat pesan antara ${pengirim} dan ${penerima}`);

    // Ambil pesan antara pengirim dan penerima
    const pesan = await Pesan.find({
      $or: [
        { pengirim: pengirim, penerima: penerima },
        { pengirim: penerima, penerima: pengirim },
      ],
    }).sort({ dibuat: 1 });

    console.log("Pesan yang ditemukan:", pesan);

    res.json(pesan);
  } catch (error) {
    console.error("Gagal memuat pesan:", error);
    res.status(500).json({ error: "Gagal memuat pesan" });
  }
};

exports.kirimPesan = async (req, res) => {
  try {
    const { penerima, pesan } = req.body;
    const pengirim = req.user._id;

    console.log("Detail pengiriman pesan:", {
      pengirim: pengirim,
      penerima: penerima,
      isi_pesan: pesan,
    });

    // Validasi input
    if (!penerima || !pesan) {
      return res.status(400).json({
        error: "Penerima dan pesan harus diisi",
      });
    }

    // Cek apakah penerima valid
    const penerimaPengguna = await Pengguna.findById(penerima);
    if (!penerimaPengguna) {
      return res.status(404).json({
        error: "Penerima tidak ditemukan",
      });
    }

    // Buat pesan baru
    const pesanBaru = new Pesan({
      pengirim: pengirim,
      penerima: penerima,
      pesan: pesan,
    });

    // Simpan pesan
    await pesanBaru.save();

    console.log("Pesan berhasil disimpan:", pesanBaru);

    res.status(201).json({
      message: "Pesan berhasil dikirim",
      pesan: pesanBaru,
    });
  } catch (error) {
    console.error("Kesalahan saat mengirim pesan:", error);
    res.status(500).json({
      error: "Gagal mengirim pesan",
      detailError: error.message,
    });
  }
};
