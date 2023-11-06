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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logging_1 = __importDefault(require("../../config/logging"));
const config_1 = __importDefault(require("../../config/config"));
const apiHeader_1 = __importDefault(require("../../middleware/apiHeader"));
const signJTW_1 = __importDefault(require("../../function/signJTW"));
const resultsuccess_1 = require("../../classes/response/resultsuccess");
const resulterror_1 = require("../../classes/response/resulterror");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const refreshToken_1 = __importDefault(require("../../function/refreshToken"));
const mysql = require('mysql');
const util = require('util');
const fs = require('fs');
const sharp = require('sharp');
const crypto = require('crypto');
const nodemailer = require("nodemailer");
let connection = mysql.createConnection({
    host: config_1.default.mysql.host,
    user: config_1.default.mysql.user,
    password: config_1.default.mysql.password,
    database: config_1.default.mysql.database
});
const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);
const NAMESPACE = 'Users';
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Login');
        let requiredFields = ['email', 'password'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            yield beginTransaction();
            let userId;
            let insertRefTokenResult;
            let sql = `SELECT u.*, ur.roleId as roleId, roles.name as roleName, img.imageUrl as image FROM users u
                LEFT JOIN userroles ur ON ur.userId = u.id
                LEFT JOIN images img ON img.id =u.imageId
                LEFT jOIN roles ON roles.id = ur.roleId
                WHERE u.email = '` + req.body.email + `' AND u.isActive = true AND u.isDisable = false AND ur.roleId = 1`;
            let result = yield query(sql);
            let userResult = result;
            userId = result[0].id;
            if (result && result.length > 0) {
                yield bcryptjs_1.default.compare(req.body.password, result[0].password, (error, hashresult) => __awaiter(void 0, void 0, void 0, function* () {
                    if (hashresult == false) {
                        return res.status(401).json({
                            message: 'Password Mismatch'
                        });
                    }
                    else if (hashresult) {
                        let signJWTResult = yield (0, signJTW_1.default)(result[0]);
                        if (signJWTResult && signJWTResult.token) {
                            userResult[0].token = signJWTResult.token;
                            let refreshToken = yield (0, refreshToken_1.default)(userResult[0]);
                            //insert refresh token
                            let insertRefreshTokenSql = `INSERT INTO userrefreshtoken(userId, refreshToken, expireAt) VALUES(?,?,?)`;
                            insertRefTokenResult = yield query(insertRefreshTokenSql, [userResult[0].id, refreshToken.token, refreshToken.expireAt]);
                            if (insertRefTokenResult && insertRefTokenResult.affectedRows > 0) {
                                userResult[0].refreshToken = refreshToken.token;
                                yield commit();
                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Login User', userResult, 1, "");
                                return res.status(200).send(successResult);
                            }
                            else {
                                yield rollback();
                                let errorResult = new resulterror_1.ResultError(400, true, "users.signUp() Error", new Error('Error While Login'), '');
                                next(errorResult);
                                return res.status(400).send(errorResult);
                            }
                        }
                        else {
                            return res.status(401).json({
                                message: 'Unable to Sign JWT',
                                error: signJWTResult.error
                            });
                        }
                    }
                }));
            }
            else {
                yield rollback();
                let errorResult = new resulterror_1.ResultError(400, true, "users.login() Error", new Error('Error While Login'), '');
                next(errorResult);
            }
        }
        else {
            yield rollback();
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        yield rollback();
        let errorResult = new resulterror_1.ResultError(500, true, 'Users.login() Exception', error, '');
        next(errorResult);
    }
});
const addUserImageFiles = (req) => __awaiter(void 0, void 0, void 0, function* () {
    let result;
    let imageId;
    try {
        let sql = `INSERT INTO images(createdBy, modifiedBy) VALUES (` + req.userId + `,` + req.userId + `)`;
        result = yield query(sql);
        if (result.affectedRows > 0) {
            imageId = result.insertId;
            let dir = './content';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            let dir1 = './content/user';
            if (!fs.existsSync(dir1)) {
                fs.mkdirSync(dir1);
            }
            let dir2 = './content/user/' + req.userId;
            if (!fs.existsSync(dir2)) {
                fs.mkdirSync(dir2);
            }
            const fileContentsUser = new Buffer(req.imgData, 'base64');
            let imgPath = "./content/user/" + req.userId + "/" + result.insertId + "-realImg.jpeg";
            fs.writeFileSync(imgPath, fileContentsUser, (err) => {
                if (err)
                    return console.error(err);
                console.log('file saved imagePath');
            });
            let imagePath = "./content/user/" + req.userId + "/" + result.insertId + ".jpeg";
            sharp(imgPath).resize({
                height: 100,
                width: 100
            }).toFile(imagePath)
                .then(function (newFileInfo) {
                console.log(newFileInfo);
            });
            let updateimagePathSql = `UPDATE images SET imageUrl='` + imagePath.substring(2) + `' WHERE id=` + result.insertId;
            let updateimagePathResult = yield query(updateimagePathSql);
            result = JSON.parse(JSON.stringify(result));
        }
        else {
            result = JSON.parse(JSON.stringify(result));
        }
    }
    catch (err) {
        let imagePath = "./content/user/" + req.userId + "/" + imageId + ".jpeg";
        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err)
                    throw err;
                console.log(imagePath + ' was deleted');
            });
        }
        let dir = './content/user/' + req.userId;
        if (fs.existsSync(dir)) {
            fs.rmdir(dir, (err) => {
                if (err)
                    throw err;
                console.log(dir + ' was deleted');
            });
        }
        result = err;
    }
    return result;
});
const insertUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'SignUp');
        let requiredFields = ['firstName', 'lastName', 'email', 'password', 'contactNo', 'gender'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let result;
                req.body.middleName = req.body.middleName ? req.body.middleName : '';
                yield beginTransaction();
                bcryptjs_1.default.hash(req.body.password, 10, (hashError, hash) => __awaiter(void 0, void 0, void 0, function* () {
                    if (hashError) {
                        return res.status(401).json({
                            message: hashError.message,
                            error: hashError
                        });
                    }
                    let checkEmailSql = `SELECT * FROM users WHERE email = '` + req.body.email + `'`;
                    let checkEmailResult = yield query(checkEmailSql);
                    if (checkEmailResult && checkEmailResult.length > 0) {
                        yield rollback();
                        let errorResult = new resulterror_1.ResultError(400, true, "users.insertUser() Error", new Error('Email Already Inserted'), '');
                        next(errorResult);
                        // let successResult = new ResultSuccess(200, true, 'Email Already Inserted', [], 1, "");
                        // return res.status(200).send(successResult);
                    }
                    else {
                        let sql = `INSERT INTO users(firstName, middlename, lastName, contactNo, email, gender, password, isDisable) VALUES('` + req.body.firstName + `','` + req.body.middleName + `','` + req.body.lastName + `',` + req.body.contactNo + `,'` + req.body.email + `','` + req.body.gender + `','` + hash + `',0)`;
                        result = yield query(sql);
                        if (result && result.insertId > 0) {
                            let userId = result.insertId;
                            if (req.body.image && req.body.image.indexOf('content') == -1) {
                                if (req.body.image) {
                                    let image = req.body.image;
                                    let data = image.split(',');
                                    if (data && data.length > 1) {
                                        image = image.split(',')[1];
                                    }
                                    let imageData = {
                                        imgPath: '',
                                        imgData: image,
                                        description: image,
                                        alt: image.alt,
                                        userId: userId
                                    };
                                    let imageResult = yield addUserImageFiles(imageData);
                                    req.body.imageId = imageResult.insertId;
                                    if (req.body.imageId) {
                                        let sql1 = "UPDATE users SET imageId = " + req.body.imageId + " WHERE id =" + userId + "";
                                        result = yield query(sql1);
                                    }
                                }
                                else {
                                    req.body.imageId = null;
                                }
                            }
                            let userRoleSql = `INSERT INTO userroles(userId, roleId) VALUES (` + userId + `, 1) `;
                            result = yield query(userRoleSql);
                            if (result && result.affectedRows > 0) {
                                // await login(req.body, res, next);
                                yield commit();
                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert User', result, 1, "");
                                return res.status(200).send(successResult);
                            }
                            else {
                                yield rollback();
                                let errorResult = new resulterror_1.ResultError(400, true, "users.insertUser() Error", new Error('Error While Inserting Data'), '');
                                next(errorResult);
                            }
                        }
                        else {
                            yield rollback();
                            let errorResult = new resulterror_1.ResultError(400, true, "users.insertUser() Error", new Error('Error While Inserting Data'), '');
                            next(errorResult);
                        }
                    }
                }));
            }
            else {
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", new Error(authorizationResult.message), '');
                next(errorResult);
            }
        }
        else {
            yield rollback();
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        yield rollback();
        let errorResult = new resulterror_1.ResultError(500, true, 'users.insertUser() Exception', error, '');
        next(errorResult);
    }
});
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting All Users');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let currentUser = authorizationResult.currentUser;
            let userId = currentUser.id;
            let startIndex = req.body.startIndex ? req.body.startIndex : (req.body.startIndex === 0 ? 0 : null);
            let fetchRecord = req.body.fetchRecord ? req.body.fetchRecord : null;
            let countSql = `SELECT COUNT(*) as totalCount  FROM users
            LEFT JOIN userroles ur ON ur.userId = users.id
            WHERE users.isDelete = 0 AND ur.roleId = 1 AND users.id != ` + userId;
            if (req.body.searchString) {
                if (!countSql.includes(` WHERE `)) {
                    countSql += ` WHERE `;
                }
                else {
                    countSql += ` AND `;
                }
                countSql += ` (users.firstName LIKE '%` + req.body.searchString + `%' OR users.lastName LIKE '%` + req.body.searchString + `%' OR users.email LIKE '%` + req.body.searchString + `%' OR users.contactNo LIKE '%` + req.body.searchString + `%' OR users.gender LIKE '%` + req.body.searchString + `%')`;
            }
            let countResult = yield query(countSql);
            let sql = `SELECT users.*, img.imageUrl as image, ur.roleId as roleId FROM users
            LEFT JOIN images img ON img.id = users.imageId
            LEFT JOIN userroles ur ON ur.userId = users.id
            WHERE users.isDelete = 0 AND ur.roleId = 1  AND users.id != ` + userId;
            if (req.body.searchString) {
                if (!sql.includes(` WHERE `)) {
                    sql += ` WHERE `;
                }
                else {
                    sql += ` AND `;
                }
                sql += ` (users.firstName LIKE '%` + req.body.searchString + `%' OR users.lastName LIKE '%` + req.body.searchString + `%' OR users.email LIKE '%` + req.body.searchString + `%' OR users.contactNo LIKE '%` + req.body.searchString + `%' OR users.gender LIKE '%` + req.body.searchString + `%')`;
            }
            if (startIndex != null && fetchRecord != null) {
                sql += " LIMIT " + fetchRecord + " OFFSET " + startIndex + "";
            }
            let result = yield query(sql);
            if (result && result.length > 0) {
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Users Successfully', result, countResult[0].totalCount, authorizationResult.token);
                console.log(successResult);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", new Error(authorizationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'users.getAllUsers() Exception', error, '');
        next(errorResult);
    }
});
const getUserDetailById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting User Detail');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let currentUser = authorizationResult.currentUser;
            let userId = currentUser.id;
            let startIndex = req.body.startIndex ? req.body.startIndex : (req.body.startIndex === 0 ? 0 : null);
            let fetchRecord = req.body.fetchRecord ? req.body.fetchRecord : null;
            let sql = `SELECT users.*, img.imageUrl as image, ur.roleId as roleId, , roles.name as roleName FROM users
            LEFT JOIN images img ON img.id = users.imageId
            LEFT JOIN userroles ur ON ur.userId = users.id
            LEFT jOIN roles ON roles.id = ur.roleId
        WHERE users.isDelete = 0 AND ur.roleId = 1  AND users.id = ` + userId;
            let result = yield query(sql);
            if (result && result.length > 0) {
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get User Detail Successfully', result, result.totalCount, authorizationResult.token);
                console.log(successResult);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", new Error(authorizationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'users.getUserDetailById() Exception', error, '');
        next(errorResult);
    }
});
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Updating Users');
        let requiredFields = ['id', 'firstName', 'lastName', 'email', 'contactNo', 'gender'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                yield beginTransaction();
                req.body.firstName = req.body.firstName ? req.body.firstName : '';
                req.body.middleName = req.body.middleName ? req.body.middleName : '';
                req.body.lastName = req.body.lastName ? req.body.lastName : '';
                req.body.contactNo = req.body.contactNo ? req.body.contactNo : '';
                req.body.email = req.body.email ? req.body.email : '';
                req.body.gender = req.body.gender ? req.body.gender : '';
                let oldImageId;
                let userId = req.body.id;
                let checkEmailSql = `SELECT * FROM users WHERE email = '` + req.body.email + `' AND id != ` + req.body.id + ` AND isDelete = 0`;
                let checkEmailResult = yield query(checkEmailSql);
                if (checkEmailResult && checkEmailResult.length > 0) {
                    yield rollback();
                    let errorResult = new resulterror_1.ResultError(400, true, "users.insertUser() Error", new Error('Email Already Inserted'), '');
                    next(errorResult);
                }
                else {
                    let getImageIdSql = `select users.id, users.imageId from users where id = ` + req.body.id + ``;
                    let usersResult = yield query(getImageIdSql);
                    if (usersResult && usersResult.length > 0) {
                        oldImageId = usersResult[0].imageId;
                    }
                    if (req.body.image && req.body.image.indexOf('content') == -1) {
                        if (req.body.image) {
                            let image = req.body.image;
                            let data = image.split(',');
                            if (data && data.length > 1) {
                                image = image.split(',')[1];
                            }
                            let imageData = {
                                imgPath: '',
                                imgData: image,
                                description: image,
                                alt: image.alt,
                                userId: userId
                            };
                            let imageResult = yield addUserImageFiles(imageData);
                            if (imageResult && imageResult.insertId > 0) {
                                req.body.imageId = imageResult.insertId;
                            }
                            else {
                                yield rollback();
                                return imageResult;
                            }
                        }
                        else if (req.body.image == undefined || req.body.image == '') {
                            req.body.imageId = null;
                        }
                    }
                    else if (!req.body.image || req.body.image == undefined) {
                        req.body.imageId = null;
                    }
                    else if (req.body.image) {
                        req.body.imageId = oldImageId;
                    }
                    let sql = `UPDATE users SET firstName = '` + req.body.firstName + `', middleName = '` + req.body.middleName + `',lastName = '` + req.body.lastName + `',contactNo = '` + req.body.contactNo + `',email = '` + req.body.email + `',gender = '` + req.body.gender + `',imageId = ` + req.body.imageId + ` WHERE id = ` + req.body.id + ``;
                    // isPasswordSet = '` + req.body.isPasswordSet + `',isDisabled = '` + req.body.isDisabled + `',isVerified = '` + req.body.isVerified + `',imageId = ` + req.body.imageId + `
                    let result = yield query(sql);
                    if (result && result.affectedRows > 0) {
                        yield commit();
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update User Detail', result, 1, authorizationResult.token);
                        return res.status(200).send(successResult);
                    }
                    else {
                        yield rollback();
                        let errorResult = new resulterror_1.ResultError(400, true, "users.updateUSers() Error", new Error('Error While Updating Data'), '');
                        next(errorResult);
                    }
                }
            }
            else {
                yield rollback();
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", new Error(authorizationResult.message), '');
                next(errorResult);
            }
        }
        else {
            yield rollback();
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        yield rollback();
        let errorResult = new resulterror_1.ResultError(500, true, 'users.updateUSers() Exception', error, '');
        next(errorResult);
    }
});
const validateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Checking Token');
        let statusCode = 200;
        let message = '';
        if (req.body.token) {
            yield jsonwebtoken_1.default.verify(req.body.token, config_1.default.server.token.secret, (error, decoded) => __awaiter(void 0, void 0, void 0, function* () {
                if (error) {
                    statusCode = 400;
                    message = "UnAuthorize";
                }
                else {
                    let decodeVal = decoded;
                    if ((new Date().getTime() / 1000) <= decodeVal.exp) {
                        // console.log("Valid Live Token");
                        return true;
                    }
                    else {
                        // console.log("Valid Expire Token");
                        return false;
                    }
                }
            }));
        }
        else {
            // console.log('error');
            let err = 'error';
            return err;
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'users.updateUSers() Exception', error, '');
        next(errorResult);
    }
});
const activeInactiveUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Active Inactive Users');
        let requiredFields = ['id'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `UPDATE users set isActive = !isActive WHERE id = ` + req.body.id + ``;
                let result = yield query(sql);
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Change User Status', result, 1, authorizationResult.token);
                return res.status(200).send(successResult);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'users.activeInactiveUsers() Exception', error, '');
        next(errorResult);
    }
});
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Reset Password');
        let requiredFields = ['id', 'password', 'token'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            bcryptjs_1.default.hash(req.body.password, 10, (hashError, hash) => __awaiter(void 0, void 0, void 0, function* () {
                if (hashError) {
                    return res.status(401).json({
                        message: hashError.message,
                        error: hashError
                    });
                }
                let sql = `UPDATE users SET password = '` + hash + `' where id = ` + req.body.id + ``;
                let result = yield query(sql);
                if (result && result.affectedRows > 0) {
                    if (req.body.token) {
                        let userTokenUpdateSql = `UPDATE usertokens SET isUsed = 1 WHERE token = '` + req.body.token + `' AND userId = ` + req.body.id + ``;
                        result = yield query(userTokenUpdateSql);
                    }
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Password reset successfully!', result, 1, "null");
                    return res.status(200).send(successResult);
                }
                else {
                    yield rollback();
                    let errorResult = new resulterror_1.ResultError(400, true, "users.resetPassword() Error", new Error('Error While Reset Password'), '');
                    next(errorResult);
                }
            }));
        }
        else {
            yield rollback();
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        yield rollback();
        let errorResult = new resulterror_1.ResultError(500, true, 'users.resetPassword() Exception', error, '');
        next(errorResult);
    }
});
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Reset Password');
        let requiredFields = ['email'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            yield beginTransaction();
            let result;
            let sql = `SELECT * FROM users WHERE email = '` + req.body.email + `'`;
            let userData = yield query(sql);
            if (userData && userData.length > 0) {
                let token = crypto.randomBytes(48).toString('hex');
                let expireAtDate = new Date(new Date().toUTCString());
                expireAtDate.setDate(expireAtDate.getDate() + 1);
                let data = {
                    userId: userData[0].id,
                    token: token,
                    isUsed: 0,
                    expireAt: expireAtDate,
                    isActive: true,
                    isDelete: false,
                    createdDate: new Date(new Date().toUTCString()),
                    modifiedDate: new Date(new Date().toUTCString())
                };
                let sql = "INSERT INTO usertokens SET ?";
                result = yield query(sql, data);
                if (result.insertId > 0) {
                    let resultEmail = yield sendEmail(config_1.default.emailMatrimonySetPassword.fromName + ' <' + config_1.default.emailMatrimonySetPassword.fromEmail + '>', userData[0].email, config_1.default.emailMatrimonySetPassword.subject, "", config_1.default.emailMatrimonySetPassword.html.replace("[VERIFICATION_TOKEN]", token).replace("[NAME]", userData[0].firstName + ' ' + userData[0].lastName), null, null);
                    yield commit();
                    result = resultEmail;
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Send mail successfully!', result, 1, "");
                    return res.status(200).send(successResult);
                }
                else {
                    yield rollback();
                    result.length = 0;
                }
            }
            else {
                yield rollback();
                let errorResult = new resulterror_1.ResultError(400, true, 'User not found', new Error('Data Not Available'), '');
                next(errorResult);
            }
        }
        else {
            yield rollback();
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        yield rollback();
        let errorResult = new resulterror_1.ResultError(500, true, 'users.resetPassword() Exception', error, '');
        next(errorResult);
    }
});
const sendEmail = (from, to, subject, text, html, fileName, invoicePdf) => __awaiter(void 0, void 0, void 0, function* () {
    let result;
    try {
        // create reusable transporter object using the default SMTP transport
        let systemFlags = `SELECT * FROM systemflags where flagGroupId = 2`;
        let _systemFlags = yield query(systemFlags);
        let _host;
        let _port;
        let _secure;
        let _user;
        let _password;
        for (let i = 0; i < _systemFlags.length; i++) {
            if (_systemFlags[i].id == 4) {
                _host = _systemFlags[i].value;
            }
            else if (_systemFlags[i].id == 5) {
                _port = parseInt(_systemFlags[i].value);
            }
            else if (_systemFlags[i].id == 6) {
                if (_systemFlags[i].value == '1') {
                    _secure = true;
                }
                else {
                    _secure = false;
                }
            }
            else if (_systemFlags[i].id == 1) {
                _user = _systemFlags[i].value;
            }
            else if (_systemFlags[i].id == 2) {
                _password = _systemFlags[i].value;
            }
        }
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: _host,
            port: _port,
            secure: _secure,
            auth: {
                user: _user,
                pass: _password
            }
        });
        // setup email data with unicode symbols
        let mailOptions = {
            from: _user,
            to: to,
            subject: subject,
            html: html
        };
        // send mail with defined transport object
        result = yield transporter.sendMail(mailOptions);
        // console.log("Message sent: %s", result);
    }
    catch (error) {
        result = error;
    }
    return result;
});
const verifyforgotPasswordLink = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Verify Forgot Password Link');
        let requiredFields = ['token'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let result;
            let sql = `SELECT * FROM usertokens WHERE isDelete = 0 AND isUsed = 0  AND token = '` + req.body.token + `'`;
            result = yield query(sql);
            if (result && result.length > 0) {
                let expireDate = new Date(result[0].expireAt);
                let currentDate = new Date(new Date().toUTCString());
                let exTime = expireDate.getTime();
                let curTime = currentDate.getTime();
                if (exTime > curTime) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Token is valid!', result, 1, "null");
                    return res.status(200).send(successResult);
                }
                else {
                    let successResult = 'Token is expired!';
                    return res.status(200).send(successResult);
                }
            }
            else {
                let successResult = 'You have already used this token';
                return res.status(200).send(successResult);
            }
        }
        else {
            yield rollback();
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'users.verifyforgotPasswordLink() Exception', error, '');
        next(errorResult);
    }
});
const blockUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Block User');
        let requiredFields = ['id'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `UPDATE users set isDisable = !isDisable WHERE id = ` + req.body.id + ``;
                let result = yield query(sql);
                if (result && result.affectedRows > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'User Block Sucessfully', result, 1, authorizationResult.token);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "users.blockUser() Error", new Error('Error While Block User'), '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", new Error(authorizationResult.message), '');
                next(errorResult);
            }
        }
        else {
            yield rollback();
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'users.blockUser() Exception', error, '');
        next(errorResult);
    }
});
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Delete User');
        let requiredFields = ['id'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `DELETE FROM users WHERE id = ` + req.body.id + ``;
                let result = yield query(sql);
                if (result && result.affectedRows > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Delete User Sucessfully', result, 1, authorizationResult.token);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "users.deleteUser() Error", new Error('Error While Deleting Users'), '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", new Error(authorizationResult.message), '');
                next(errorResult);
            }
        }
        else {
            yield rollback();
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'users.deleteUser() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { insertUser, login, getAllUsers, getUserDetailById, updateUser, validateToken, resetPassword, activeInactiveUsers, forgotPassword, verifyforgotPasswordLink, blockUser, deleteUser };
