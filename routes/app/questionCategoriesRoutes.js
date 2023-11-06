"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const questionCategories_1 = __importDefault(require("../../controllers/app/questionCategories"));
const router = express_1.default.Router();
router.post('/getQuestion', questionCategories_1.default.getQuestion);
module.exports = router;
