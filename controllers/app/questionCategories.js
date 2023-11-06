"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = __importDefault(require("../../config/logging"));
const config_1 = __importDefault(require("../../config/config"));
const apiHeader_1 = __importDefault(require("../../middleware/apiHeader"));
const resultsuccess_1 = require("../../classes/response/resultsuccess");
const resulterror_1 = require("../../classes/response/resulterror");
const mysql = require('mysql');
const util = require('util');
let connection = mysql.createConnection({
    host: config_1.default.mysql.host,
    user: config_1.default.mysql.user,
    password: config_1.default.mysql.password,
    database: config_1.default.mysql.database
});
const query = util.promisify(connection.query).bind(connection);
const NAMESPACE = 'Question';
const getQuestion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Question');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : (req.body.startIndex === 0 ? 0 : null);
            let fetchRecord = req.body.fetchRecord ? req.body.fetchRecord : null;
            let startIndexCategories = req.body.startIndexCategories ? req.body.startIndexCategories : (req.body.startIndexCategories === 0 ? 0 : null);
            let fetchRecordCategories = req.body.fetchRecordCategories ? req.body.fetchRecordCategories : null;
            let countSql = `SELECT COUNT(*) as totalCount FROM questioncategories WHERE isDelete = 0`;
            let countResult = yield query(countSql);
            let sql = `SELECT * FROM questioncategories WHERE isDelete = 0 ORDER BY id DESC`;
            if (startIndexCategories != null && fetchRecordCategories != null) {
                sql += " LIMIT " + fetchRecordCategories + " OFFSET " + startIndexCategories + " ";
            }
            let result = yield query(sql);
            if (result) {
                if (result && result.length) {
                    for (let i = 0; i < result.length; i++) {
                        countSql = `SELECT COUNT(*) as Count from questions q 
                        left join questioncategories qc on qc.id = q.questionCategoriesId
                        where q.questionCategoriesId = ` + result[i].id + ` AND q.isDelete = 0 `;
                        let count = yield query(countSql);
                        result[i].questionCount = count[0].Count;
                        sql = `SELECT q.* from questions q 
                        left join questioncategories qc on qc.id = q.questionCategoriesId
                        where q.questionCategoriesId = ` + result[i].id + ` AND q.isDelete = 0 ORDER BY id DESC`;
                        if (startIndex != null && fetchRecord != null) {
                            sql += " LIMIT " + fetchRecord + " OFFSET " + startIndex + " ";
                        }
                        result[i].question = yield query(sql);
                    }
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'get question successfully', result, countResult[0].totalCount, authorizationResult.token);
                    return res.status(200).send(successResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data not Available'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", new Error(authorizationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'question.getQuestion() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getQuestion };
