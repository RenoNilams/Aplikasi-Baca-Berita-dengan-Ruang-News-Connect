const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Route Login
router.get("/login", authController.tampilkanLogin);
router.post("/login", authController.prosesLogin);

// Route Register
router.get("/register", authController.tampilkanRegister);
router.post("/register", authController.prosesRegister);

// Route Logout
router.get("/logout", authController.logout);

module.exports = router;
