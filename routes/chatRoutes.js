const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");

router.get("/chat", authMiddleware, chatController.tampilkanHalamanChat);
router.get("/pesan/:penerima", authMiddleware, chatController.muatPesan);

module.exports = router;
