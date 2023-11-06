"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const payment_1 = __importDefault(require("../../controllers/app/payment"));
const router = express_1.default.Router();
router.post('/insertPayment', payment_1.default.insertPaymentRazorpay);
router.post('/insertPaymentStripe', payment_1.default.insertPaymentStripe);
module.exports = router;
