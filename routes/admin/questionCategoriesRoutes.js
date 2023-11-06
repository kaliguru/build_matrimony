"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const questionCategories_1 = __importDefault(require("../../controllers/admin/questionCategories"));
const router = express_1.default.Router();
router.post('/getQuestion', questionCategories_1.default.getQuestion);
router.post('/insertUpdateQuestionCategories', questionCategories_1.default.insertUpdateQuestionCategories);
router.post('/activeInactiveQuestionCategories', questionCategories_1.default.activeInactiveQuestionCategories);
router.post('/deleteQuestionCategories', questionCategories_1.default.deleteQuestionCategories);
router.post('/insertUpdateQuestion', questionCategories_1.default.insertUpdateQuestion);
router.post('/activeInactiveQuestion', questionCategories_1.default.activeInactiveQuestion);
router.post('/deleteQuestion', questionCategories_1.default.deleteQuestion);
module.exports = router;
