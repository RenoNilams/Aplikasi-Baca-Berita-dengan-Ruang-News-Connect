const express = require("express");
const axios = require("axios");
const router = express.Router();

// Import endpoints dari file sebelumnya
const { endpoints } = require("../utils/endpoints");

router.get("/", async (req, res) => {
  try {
    // Konversi sumber menjadi array, dengan default
    const sumberDipilih = Array.isArray(req.query.sumber)
      ? req.query.sumber
      : req.query.sumber
      ? [req.query.sumber]
      : ["cnn", "antara", "jpnn", "okezone"];

    // Konversi kategori menjadi array, dengan default
    const kategoriDipilih = Array.isArray(req.query.kategori)
      ? req.query.kategori
      : req.query.kategori
      ? [req.query.kategori]
      : ["terbaru"];

    // Proses berita dari setiap sumber dan kategori
    const hasilBerita = {};
    const promises = [];

    sumberDipilih.forEach((sumber) => {
      kategoriDipilih.forEach((kategori) => {
        // Pastikan sumber dan kategori valid
        const sumberValid = endpoints.find((e) => e.primary === sumber);
        if (sumberValid && sumberValid.paths.includes(kategori)) {
          const promise = axios
            .get(
              `https://api-berita-indonesia.vercel.app/${sumber}/${kategori}`
            )
            .then((response) => ({
              sumber,
              kategori,
              berita: response.data.data.posts.slice(0, 9), // Batasi 3 berita
            }))
            .catch((error) => ({
              sumber,
              kategori,
              berita: [],
              error: error.message,
            }));

          promises.push(promise);
        }
      });
    });

    // Tunggu semua promise selesai
    const hasilSemuaBerita = await Promise.all(promises);

    // Susun hasil berita
    hasilSemuaBerita.forEach((hasil) => {
      if (!hasilBerita[hasil.sumber]) {
        hasilBerita[hasil.sumber] = {};
      }
      hasilBerita[hasil.sumber][hasil.kategori] = hasil.berita;
    });

    // Siapkan daftar sumber dan kategori untuk dropdown
    const daftarSumber = endpoints.map((e) => e.primary);
    const daftarKategori = {};
    endpoints.forEach((e) => {
      daftarKategori[e.primary] = e.paths;
    });

    // Render halaman
    res.render("beranda", {
      judul: "Beranda Berita",
      hasilBerita,
      daftarSumber,
      daftarKategori,
      sumberDipilih,
      kategoriDipilih,
    });
  } catch (error) {
    console.error("Gagal mengambil berita:", error);
    res.render("beranda", {
      judul: "Beranda Berita",
      hasilBerita: {},
      daftarSumber: endpoints.map((e) => e.primary),
      daftarKategori: {},
      error: "Gagal memuat berita",
      sumberDipilih: [],
      kategoriDipilih: [],
    });
  }
});

module.exports = router;
