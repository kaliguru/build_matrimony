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
const fs = require('fs');
const sharp = require('sharp');
let connection = mysql.createConnection({
    host: config_1.default.mysql.host,
    user: config_1.default.mysql.user,
    password: config_1.default.mysql.password,
    database: config_1.default.mysql.database
});
const query = util.promisify(connection.query).bind(connection);
const NAMESPACE = 'Package';
const getpackage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Package');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : (req.body.startIndex === 0 ? 0 : null);
            let fetchRecord = req.body.fetchRecord ? req.body.fetchRecord : null;
            let result;
            let countSql = "SELECT COUNT(*) as totalCount  FROM timeduration";
            let countResult = yield query(countSql);
            let sql = `SELECT * FROM timeduration WHERE isDelete = 0 ORDER BY value ASC`;
            result = yield query(sql);
            if (result) {
                if (result && result.length > 0) {
                    for (let y = 0; y < result.length; y++) {
                        sql = `SELECT p.* , pd.id as packageDurationId, pd.timeDurationId, td.value, pd.discount FROM package p
                        LEFT JOIN packageduration pd ON pd.packageId = p.id
                        LEFT JOIN timeduration td ON td.id = pd.timeDurationId
                        WHERE pd.timeDurationId = ` + result[y].id;
                        if (startIndex != null && fetchRecord != null) {
                            sql += " LIMIT " + fetchRecord + " OFFSET " + startIndex + "";
                        }
                        result[y].package = yield query(sql);
                        let packageData = result[y].package;
                        if (packageData) {
                            if (packageData && packageData.length > 0) {
                                for (let index = 0; index < packageData.length; index++) {
                                    sql = `SELECT packagefacility.*, pf.name FROM packagefacility
                                    LEFT JOIN premiumfacility pf ON pf.id = packagefacility.premiumFacilityId
                                     WHERE packageId = ` + packageData[index].id;
                                    result[y].package[index].facility = yield query(sql);
                                    // sql = `SELECT * FROM packageduration WHERE packageId = ` + result[index].id;
                                    // result[index].duration = await query(sql);
                                }
                            }
                        }
                    }
                }
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Package Successfully', result, countResult[0].totalCount, authorizationResult.token);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "package.getpackage() Error", new Error('Error While Getting Data'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", new Error(authorizationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'package.getpackage() Exception', error, '');
        next(errorResult);
    }
});
const savePremiumAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting Proposals');
        // let requiredFields = ['packageId'];
        // let validationResult = header.validateRequiredFields(req, requiredFields);
        // if (validationResult && validationResult.statusCode == 200) {
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let currentUser = authorizationResult.currentUser;
            let userId = currentUser.id;
            let sql = `INSERT INTO userpackage (packageId, packageDurationId, startDate, endDate, netAmount, purchaseDate, userId, paymentId, signature,originalJson,purchaseToken, createdBy, modifiedBy) 
                VALUES (` + req.body.packageId + `,` + req.body.packageDurationId + `,'` + req.body.startDate + `','` + req.body.endDate + `',` + req.body.netAmount + `,'` + req.body.purchaseDate + `',` + userId + `,` + req.body.paymentId + `,'` + req.body.signature + `','` + req.body.originalJson + `','` + req.body.purchaseToken + `',` + userId + `,` + userId + `)`;
            let result = yield query(sql);
            if (result && result.affectedRows > 0) {
                let id = result.insertId;
                sql = `SELECT up.*,p.name as packageName,pd.timeDurationId,t.value FROM userpackage up
                        LEFT JOIN package p on p.id= up.packageId
                        LEFT JOIN packageduration pd on pd.packageId = up.packageId
                        LEFT JOIN timeduration t on  t.id = pd.timedurationId
                         WHERE up.id = ` + id;
                let userPackage = yield query(sql);
                if (userPackage && userPackage.length > 0) {
                    let packageFacility = yield query(`SELECT  pff.name  FROM packagefacility pf
                              LEFT JOIN premiumfacility pff ON pff.id = pf.premiumFacilityId
                               WHERE pf.packageId = ` + userPackage[0].packageId);
                    userPackage[0].packageFacility = packageFacility;
                }
                result[0] = userPackage[0];
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Save Premium Account', result[0], 1, authorizationResult.token);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "package.savePremiumAccount() Error", new Error('Error While Updating Data'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", new Error(authorizationResult.message), '');
            next(errorResult);
        }
    }
    // else {
    //     let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
    //     next(errorResult);
    // }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'package.savePremiumAccount() Exception', error, '');
        next(errorResult);
    }
});
const getPackageByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting Proposals');
        let requiredFields = ['userId'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let userId = currentUser.id;
                let sql = `SELECT up.packageId,p.name as packageName,up.packageDurationId,up.startDate,up.endDate,up.netAmount,pay.paymentMode
                ,t.value   FROM  userpackage up
                LEFT JOIN package p on p.id= up.packageId
                LEFT join payment pay on pay.id= up.paymentId
                left join packageduration pd on pd.id = up.packageDurationId
                left join timeduration t on t.id = pd.timeDurationId
                WHERE up.userId = ` + req.body.userId + ` order by up.createdDate desc`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    // let id = result.insertId;
                    //  sql = `SELECT * From userpackage WHERE id = ` + id;
                    //  result = await query(sql);
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Package of Users', result, 1, authorizationResult.token);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "package.getPackageByUserId() Error", new Error('Error While Updating Data'), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'package.getPackageByUserId() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getpackage, savePremiumAccount, getPackageByUserId };
