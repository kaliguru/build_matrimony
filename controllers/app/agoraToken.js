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
var { RtcTokenBuilder } = require('agora-access-token');
let connection = mysql.createConnection({
    host: config_1.default.mysql.host,
    user: config_1.default.mysql.user,
    password: config_1.default.mysql.password,
    database: config_1.default.mysql.database
});
const query = util.promisify(connection.query).bind(connection);
const NAMESPACE = 'AgoraToken';
var expirationTimeInSeconds = 3600;
const getAgoraToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Users AgoraToken');
        let requiredFields = ['channelName', 'uid'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                var currentTimestamp = Math.floor(Date.now() / 1000);
                var privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
                var channelName = req.body.channelName;
                // use 0 if uid is not specified
                var uid = req.body.uid || 0;
                let sql = `SELECT * FROM systemflags WHERE flagGroupId = 7 AND VALUE IS NOT NULL;`;
                let agora = yield query(sql);
                let appid = agora[0].value;
                console.log(appid);
                let appcerti = agora[1].value;
                console.log(appcerti);
                var key = RtcTokenBuilder.buildTokenWithUid(agora[0].value, agora[1].value, channelName, uid, privilegeExpiredTs);
                let result = key;
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Access Token', result, 1, "");
                return res.status(200).send(successResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'agoraToken.getAgoraToken() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getAgoraToken };
