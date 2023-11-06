"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const userChat_1 = __importDefault(require("../../controllers/app/userChat"));
const router = express_1.default.Router();
router.post('/userChat', userChat_1.default.insertUserChat);
router.post('/getUserChatList', userChat_1.default.getUserChatList);
module.exports = router;
