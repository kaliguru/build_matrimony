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
const NAMESPACE = 'Feedbacks';
const insertFeedback = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting Users Feedback');
        let requiredFields = ['userId', 'description', 'title'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let userId = currentUser.id;
                req.body.description = req.body.description ? req.body.description : '';
                req.body.title = req.body.title ? req.body.title : '';
                let sql = `INSERT INTO feedback (userId, description, title, createdBy, modifiedBy) VALUES(` + userId + `,'` + req.body.description + `'` + `,'` + req.body.title + `',` + userId + `,` + userId + `)`;
                let result = yield query(sql);
                if (result && result.affectedRows > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert User FeedBack', result, 1, authorizationResult.token);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "feedback.insertFeedback() Error", new Error('Error While Updating Data'), '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", new Error(authorizationResult.message), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'feedback.insertFeedback() Exception', error, '');
        next(errorResult);
    }
});
// const getFeedback = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         logging.info(NAMESPACE, 'Getting Users Feedback');
//         let authorizationResult = await header.validateAuthorization(req, res, next);
//         if (authorizationResult.statusCode == 200) {
//             let startIndex = req.body.startIndex ? req.body.startIndex : (req.body.startIndex === 0 ? 0 : null);
//             let fetchRecord = req.body.fetchRecord ? req.body.fetchRecord : null;
//             let countSql = "SELECT COUNT(*) as totalCount  FROM feedback";
//             let countResult = await query(countSql);
//             let sql = `SELECT * FROM feedback WHERE isDelete = 0 ORDER BY id DESC`;
//             if (startIndex != null && fetchRecord != null) {
//                 sql += " LIMIT " + fetchRecord + " OFFSET " + startIndex + "";
//             }
//             let result = await query(sql);
//             if (result && result.length > 0) {
//                 let successResult = new ResultSuccess(200, true, 'Get Feedback Successfully', result, countResult[0].totalCount, authorizationResult.token);
//                 return res.status(200).send(successResult);
//             } else {
//                 let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
//                 next(errorResult);
//             }
//         } else {
//             let errorResult = new ResultError(401, true, "Unauthorized request", new Error(authorizationResult.message), '');
//             next(errorResult);
//         }
//     } catch (error: any) {
//         let errorResult = new ResultError(500, true, 'feedback.getFeedback() Exception', error, '');
//         next(errorResult);
//     }
// };
exports.default = { insertFeedback };
