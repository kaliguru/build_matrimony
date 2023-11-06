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
const NAMESPACE = 'System Flags';
const getAdminSystemFlag = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting SystemFlags');
        let sql = `SELECT * FROM flaggroup WHERE parentFlagGroupId IS NULL`;
        let result = yield query(sql);
        if (result && result.length > 0) {
            for (let i = 0; i < result.length; i++) {
                result[i].group = [];
                let innerSql = `SELECT * FROM flaggroup WHERE parentFlagGroupId = ` + result[i].id;
                let innerResult = yield query(innerSql);
                if (innerResult && innerResult.length > 0) {
                    result[i].group = innerResult;
                    for (let j = 0; j < result[i].group.length; j++) {
                        result[i].group[j].systemFlag = [];
                        let sysSql = `SELECT * FROM systemflags WHERE isActive = 1 AND flagGroupId = ` + result[i].group[j].id;
                        let sysresult = yield query(sysSql);
                        result[i].group[j].systemFlag = sysresult;
                    }
                }
                result[i].systemFlag = [];
                let sysSql = `SELECT * FROM systemflags WHERE  isActive = 1 AND flagGroupId = ` + result[i].id;
                let sysresult = yield query(sysSql);
                result[i].systemFlag = sysresult;
            }
        }
        if (result && result.length > 0) {
            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get System flag successfully', result, result.length, '');
            return res.status(200).send(successResult);
        }
        else {
            let errorResult = new resulterror_1.ResultError(400, true, "systemflags.getAdminSystemFlag() Error", new Error('Error While Updating Data'), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'systemflags.getAdminSystemFlag() Exception', error, '');
        next(errorResult);
    }
});
const updateSystemFlagByName = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let requiredFields = ['valueList', 'nameList'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let result;
                for (let i = 0; i < req.body.nameList.length; i++) {
                    let sql = "UPDATE systemflags SET value = ? WHERE name = ?";
                    result = yield query(sql, [req.body.valueList[i], req.body.nameList[i]]);
                }
                if (result.affectedRows > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update System Flag', result, 1, authorizationResult.token);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "systemflags.updateSystemFlagByName() Error", new Error('Error While Updating Data'), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'systemflags.updateSystemFlagByName() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getAdminSystemFlag, updateSystemFlagByName };
