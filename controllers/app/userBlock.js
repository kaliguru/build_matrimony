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
const notifications_1 = __importDefault(require("./../notifications"));
const mysql = require('mysql');
const util = require('util');
let connection = mysql.createConnection({
    host: config_1.default.mysql.host,
    user: config_1.default.mysql.user,
    password: config_1.default.mysql.password,
    database: config_1.default.mysql.database
});
const query = util.promisify(connection.query).bind(connection);
const NAMESPACE = 'Block User';
const getBlockUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Block User');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let currentUser = authorizationResult.currentUser;
            let userId = currentUser.id;
            let startIndex = req.body.startIndex ? req.body.startIndex : (req.body.startIndex === 0 ? 0 : null);
            let fetchRecord = req.body.fetchRecord ? req.body.fetchRecord : null;
            let sql = `SELECT ub.*, u.firstName, u.middleName, u.lastName, u.gender, u.email, u.contactNo, img.imageUrl,o.name as occupation FROM userblock ub
                LEFT JOIN users u ON u.id = ub.userBlockId
                LEFT JOIN images img ON img.id = u.imageId
                left join userpersonaldetail upd on upd.userId = u.id
                left join occupation o on upd.occupationId = o.id
                WHERE ub.userId = ` + userId + ` AND ub.isDelete = 0`;
            if (startIndex != null && fetchRecord != null) {
                sql += " LIMIT " + fetchRecord + " OFFSET " + startIndex + "";
            }
            let result = yield query(sql);
            if (result) {
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Block User', result, result.length, authorizationResult.token);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "block.getBlockUser() Error", new Error('Error While Getting Data'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", new Error(authorizationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'block.getBlockUser() Exception', error, '');
        next(errorResult);
    }
});
const addRemoveBlock = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting block user');
        let requiredFields = ['userBlockId', "isBlockUser"];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let userId = currentUser.id;
                if (req.body.isBlockUser == true) {
                    let sql = `INSERT INTO userblock(userId, userBlockId, createdBy, modifiedBy) VALUES(` + userId + `,` + req.body.userBlockId + `,` + userId + `,` + userId + `)`;
                    let result = yield query(sql);
                    if (result && result.affectedRows > 0) {
                        let userBlockInsertedId = result.insertId;
                        let user = yield query(`SELECT * FROM users where id = ` + userId);
                        user[0].lastName = user[0].lastName ? user[0].lastName : '';
                        let title = user[0].firstName + ' ' + user[0].lastName + ' blocked you.';
                        let description = user[0].firstName + ' ' + user[0].lastName + ' blocked you.';
                        let fcmToken = "";
                        let dataBody = {
                            type: 4,
                            id: req.body.userBlockId,
                            title: title,
                            message: description,
                            json: null,
                            dateTime: null,
                        };
                        let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + req.body.userBlockId + " ORDER BY id DESC LIMIT 1";
                        let customerFcmResult = yield query(customerFcmSql);
                        if (customerFcmResult && customerFcmResult.length > 0) {
                            fcmToken = customerFcmResult[0].fcmToken;
                        }
                        let notificationSql = `INSERT INTO usernotifications(userId, title, message, bodyJson, imageUrl, createdBy, modifiedBy) VALUES(` + req.body.userBlockId + `,'` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                        let notificationResult = yield query(notificationSql);
                        let check = `SELECT uf.id as userflagId , ufv.userId FROM userflags uf
                        LEFT JOIN userflagvalues ufv ON ufv.userId = ` + req.body.userBlockId + `
                        WHERE uf.flagName = 'pushNotification' AND ufv.userFlagValue = 1`;
                        let checkResult = yield query(check);
                        if (checkResult && checkResult.length > 0) {
                            yield notifications_1.default.sendMultipleNotification([fcmToken], userBlockInsertedId, title, description, '', null, null, 4);
                        }
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Block user', result, 1, authorizationResult.token);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, "block.addRemoveBlock() Error", new Error('Error While Updating Data'), '');
                        next(errorResult);
                    }
                }
                else {
                    if (req.body.isBlockUser == false) {
                        let sql = `DELETE FROM userblock WHERE userBlockId = ` + req.body.userBlockId + ` AND userId = ` + userId + ``;
                        let result = yield query(sql);
                        if (result && result.affectedRows > 0) {
                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Unblock user', result, 1, authorizationResult.token);
                            return res.status(200).send(successResult);
                        }
                        else {
                            let errorResult = new resulterror_1.ResultError(400, true, "block.addRemoveBlock() Error", new Error('Error While Deleting Data'), '');
                            next(errorResult);
                        }
                    }
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
        let errorResult = new resulterror_1.ResultError(500, true, 'block.addRemoveBlock() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getBlockUser, addRemoveBlock };
