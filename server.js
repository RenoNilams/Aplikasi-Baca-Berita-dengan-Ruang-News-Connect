const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

// Import model
const Pengguna = require("./models/User");
const Pesan = require("./models/Pesan");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
const authRoutes = require("./routes/authRoutes");
app.use(authRoutes);

const chatRoutes = require("./routes/chatRoutes");

const beritaRoutes = require("./routes/beritaRoutes");
app.use("/", beritaRoutes);

// Database connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

// Middleware untuk parsing JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Fungsi untuk memulai server
const mulaiServer = async () => {
  try {
    // Hubungkan database
    await mongoose.connect("mongodb://127.0.0.1:27017/chat_app", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Terhubung ke MongoDB");

    // Gunakan routes
    app.use(authRoutes);
    app.use(chatRoutes);

    // Logging route
    app.use((req, res, next) => {
      console.log(`Requested URL: ${req.method} ${req.url}`);
      next();
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send("Terjadi kesalahan pada server");
    });

    // Jalankan server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Gagal memulai server:", error);
    process.exit(1);
  }
};

// Error handler global
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    pesan: "Terjadi kesalahan internal",
    error: process.env.NODE_ENV === "development" ? err.message : "",
  });
});

// Konfigurasi Socket.IO dengan autentikasi

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    console.log("Token socket yang diterima di middleware:", token);

    if (!token) {
      return next(new Error("Authentication error: No token"));
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cari pengguna
    const pengguna = await Pengguna.findById(decoded.id);

    if (!pengguna) {
      return next(new Error("Authentication error: User not found"));
    }

    // Simpan informasi pengguna di socket
    socket.pengguna = pengguna;
    next();
  } catch (error) {
    console.error("Kesalahan autentikasi socket:", error);
    next(new Error("Authentication error"));
  }
});

// Global error handler untuk unhandled promises
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

// Konfigurasi Socket.IO
io.on("connection", (socket) => {
  try {
    if (!socket.pengguna) {
      console.error("Koneksi socket tanpa autentikasi");
      socket.disconnect(true);
      return;
    }

    console.log(
      `Pengguna terhubung: ${socket.pengguna.namaLengkap} (${socket.pengguna._id})`
    );

    // Gabung ke room pribadi berdasarkan ID
    socket.join(socket.pengguna._id.toString());

    socket.on("kirim-pesan", async (data) => {
      try {
        console.log("Data pesan diterima:", data);

        // Validasi data
        if (!data.penerima || !data.pesan) {
          console.error("Data pesan tidak lengkap:", data);
          socket.emit("error-pesan", {
            pesan: "Data pesan tidak lengkap",
          });
          return;
        }

        // Buat pesan baru
        const pesanBaru = new Pesan({
          pengirim: socket.pengguna._id,
          penerima: data.penerima,
          pesan: data.pesan,
        });

        // Simpan ke database
        await pesanBaru.save();
        console.log("Pesan tersimpan:", pesanBaru);

        // Kirim ke penerima spesifik
        socket.to(data.penerima).emit("pesan-baru", {
          pengirim: socket.pengguna._id,
          pengirimNama: socket.pengguna.namaLengkap,
          pesan: data.pesan,
          dibuat: pesanBaru.dibuat,
        });

        // Konfirmasi ke pengirim
        socket.emit("pesan-terkirim", pesanBaru);
      } catch (error) {
        console.error("Kesalahan mengirim pesan:", error);
        socket.emit("error-pesan", {
          pesan: "Gagal mengirim pesan",
          error: error.message,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Pengguna terputus: ${socket.pengguna.namaLengkap}`);
    });
  } catch (error) {
    console.error("Kesalahan di socket connection:", error);
  }
});
// Mulai server
mulaiServer();
