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
const NAMESPACE = 'Success Stories';
const getPartnerList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Partner List');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `SELECT sstory.*, CONCAT(u.firstName,' ',u.lastName) as userName, CONCAT(partner.firstName,' ',partner.lastName) as partnerName , img.imageUrl FROM successstories sstory
            LEFT JOIN users u ON u.id = sstory.userId
            LEFT JOIN users partner ON partner.id = sstory.partnerUserId
            LEFT JOIN images img ON img.id = sstory.imageId
            WHERE sstory.isDelete = 0 AND sstory.isActive = 1`;
            let result = yield query(sql);
            if (result) {
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Partner List', result, result.length, authorizationResult.token);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "successStories.getPartnerList() Error", new Error('Error While Getting Data'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", new Error(authorizationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'successStories.getPartnerList() Exception', error, '');
        next(errorResult);
    }
});
const getSuccessStories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Success Stories');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `SELECT s.*, img.imageUrl, u.firstName as userFName, u.lastName as userLName, u.gender as userGender, u.email as userEmail, img1.imageUrl as userImage, addr.cityName as userCity, u1.firstName as partnerFName, u1.lastName as partnerLName, u1.gender as partnerGender, u1.email as partnerEmail, img2.imageUrl as partnerImage, addr1.cityName as partnerCity FROM successstories s
                        LEFT JOIN images img ON img.id = s.imageId
                        LEFT JOIN users u ON u.id = s.userId
                        LEFT JOIN users u1 ON u1.id = s.partnerUserId 
                        LEFT JOIN images img1 ON img1.id = u.imageId
                        LEFT JOIN images img2 ON img2.id = u1.imageId
                        LEFT JOIN userpersonaldetail upd ON upd.userId = s.userId
                        LEFT JOIN addresses addr ON addr.id = upd.addressId
                        LEFT JOIN userpersonaldetail upd1 ON upd1.userId = s.partnerUserId
                        LEFT JOIN addresses addr1 ON addr1.id = upd1.addressId  ORDER BY s.createdDate DESC`;
            if (req.body.searchId) {
                if (!sql.includes(` WHERE `)) {
                    sql += ` WHERE `;
                }
                else {
                    sql += ` AND `;
                }
                sql += ` s.userId = ` + req.body.searchId + ` OR s.parentId = ` + req.body.searchId + ` `;
            }
            if (req.body.dateTo && req.body.dateFrom) {
                let toDate = new Date(req.body.dateTo).getFullYear() + "-" + ("0" + (new Date(req.body.dateTo).getMonth() + 1)).slice(-2) + "-" + ("0" + new Date(req.body.dateTo).getDate()).slice(-2);
                let fromDate = new Date(req.body.dateFrom).getFullYear() + "-" + ("0" + (new Date(req.body.dateFrom).getMonth() + 1)).slice(-2) + "-" + ("0" + new Date(req.body.dateFrom).getDate()).slice(-2);
                if (!sql.includes("WHERE")) {
                    sql += ` WHERE `;
                }
                else {
                    sql += ` AND `;
                }
                sql += ` DATE(s.createdDate) >= DATE('` + fromDate + `') AND DATE(s.createdDate) <= DATE('` + toDate + `') `;
            }
            let result = yield query(sql);
            if (result) {
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Success Stories Successfully', result, result.length, authorizationResult.token);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "successStories.getSuccessStories() Error", new Error('Error While Getting Data'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", new Error(authorizationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'successStories.getSuccessStories() Exception', error, '');
        next(errorResult);
    }
});
const insertSuccessStories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting Proposals');
        let requiredFields = ['partnerUserId', 'maritalStatus'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let userId = currentUser.id;
                let result;
                let imageId;
                let date = req.body.transactionDate ? new Date(req.body.transactionDate) : '';
                req.body.transactionDate = new Date(date).getFullYear().toString() + '-' + ("0" + (new Date(date).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(date).getDate()).slice(-2) + ' ' + ("0" + (new Date(date).getHours())).slice(-2) + ':' + ("0" + (new Date(date).getMinutes())).slice(-2) + ':' + ("0" + (new Date(date).getSeconds())).slice(-2);
                let sql = `INSERT INTO successstories (userId, partnerUserId, maritalStatus, transactionDate, createdby, modifiedBy) vALUES (` + req.body.userId + `,` + req.body.partnerUserId + `,'` + req.body.maritalStatus + `', '` + req.body.transactionDate + `' ,` + userId + `, ` + userId + `)`;
                result = yield query(sql);
                if (result && result.affectedRows > 0) {
                    let successstoriesId = result.insertId;
                    if (req.body.image && req.body.image.indexOf('content') == -1) {
                        let sql = `INSERT INTO images(createdBy, modifiedBy) VALUES (` + req.body.userId + `,` + req.body.userId + `)`;
                        result = yield query(sql);
                        if (result && result.affectedRows > 0) {
                            imageId = result.insertId;
                            let image = req.body.image;
                            let data = image.split(',');
                            if (data && data.length > 1) {
                                image = image.split(',')[1];
                            }
                            let dir = './content';
                            if (!fs.existsSync(dir)) {
                                fs.mkdirSync(dir);
                            }
                            let dir1 = './content/user';
                            if (!fs.existsSync(dir1)) {
                                fs.mkdirSync(dir1);
                            }
                            let dir2 = './content/user/' + req.body.userId;
                            if (!fs.existsSync(dir2)) {
                                fs.mkdirSync(dir2);
                            }
                            const fileContentsUser = new Buffer(image, 'base64');
                            let imgPath = "./content/user/" + req.body.userId + "/" + imageId + "-realImg.jpeg";
                            fs.writeFileSync(imgPath, fileContentsUser, (err) => {
                                if (err)
                                    return console.error(err);
                                console.log('file saved imagePath');
                            });
                            let imagePath = "./content/user/" + req.body.userId + "/" + imageId + ".jpeg";
                            sharp(imgPath).resize({
                                height: 100,
                                width: 100
                            }).toFile(imagePath)
                                .then(function (newFileInfo) {
                                console.log(newFileInfo);
                            });
                            let updateimagePathSql = `UPDATE images SET imageUrl='` + imagePath.substring(2) + `' WHERE id=` + imageId;
                            let updateimagePathResult = yield query(updateimagePathSql);
                            if (updateimagePathResult && updateimagePathResult.affectedRows > 0) {
                                let addUserImageId = `UPDATE successstories SET imageId = ` + imageId + ` WHERE id = ` + successstoriesId;
                                result = yield query(addUserImageId);
                                if (result && result.affectedRows > 0) {
                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert Success Stories Successfully', result, result.length, authorizationResult.token);
                                    return res.status(200).send(successResult);
                                }
                                else {
                                    let errorResult = new resulterror_1.ResultError(400, true, "successStories.insertSuccessStories() Error", new Error('Error While Updating Profile Pic'), '');
                                    next(errorResult);
                                }
                            }
                            else {
                                let errorResult = new resulterror_1.ResultError(400, true, "successStories.insertSuccessStories() Error", new Error('Error While Updating Profile Pic'), '');
                                next(errorResult);
                            }
                        }
                        else {
                            let errorResult = new resulterror_1.ResultError(400, true, "successStories.insertSuccessStories() Error", new Error('Error While Updating Profile Pic'), '');
                            next(errorResult);
                        }
                    }
                    else {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert Success Stories Successfully', result, result.length, authorizationResult.token);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "successStories.insertSuccessStories() Error", new Error('Error While Updating Data'), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'successStories.insertSuccessStories() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getPartnerList, getSuccessStories, insertSuccessStories };
