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
const NAMESPACE = 'Visitors';
const getVisitors = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Visitors');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let currentUser = authorizationResult.currentUser;
            let userId = currentUser.id;
            let startIndex = req.body.startIndex ? req.body.startIndex : (req.body.startIndex === 0 ? 0 : null);
            let fetchRecord = req.body.fetchRecord ? req.body.fetchRecord : null;
            let countSql = `select COUNT(*) as totalCount from (SELECT up.id , up.proposalUserId  as visitorId, up.status, u.firstName, u.lastName, u.gender, u.email, u.contactNo, img.imageUrl as image, o.name as occupation, upd.birthDate, 
                addr.cityName, DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(), upd.birthDate)), '%Y') + 0 AS age, 
                up.proposalUserId IN (select userBlockId from userblock where userId =` + userId + `)  as isBlockByMe , 
                                up.proposalUserId IN (select userId from userblock where userBlockId =` + userId + `)  as isBlockByOther,
                                u.id IN (select proposalUserId from userproposals where userId = ` + userId + `) as isProposed,
                                u.id IN (select favUserId from userfavourites where userId = ` + userId + `) as isFavourite
                                 FROM userproposals up 
                                 LEFT JOIN users u ON u.id = up.proposalUserId
                                 LEFT JOIN images img ON img.id = u.imageId
                                 LEFT JOIN userpersonaldetail upd ON upd.userId = u.id
                                 LEFT JOIN occupation o ON o.id = upd.occupationId
                                 LEFT JOIN addresses addr ON addr.id = upd.addressId WHERE up.userId =` + userId + ` and up.proposalUserId IN (select userBlockId from userblock where userId = ` + userId + `) = 0   and up.proposalUserId IN (select userId from userblock where userBlockId =` + userId + `) = 0
                                 union 
                                 SELECT up.id , up.userId  as visitorId, up.status, u.firstName, u.lastName, u.gender, u.email, u.contactNo, img.imageUrl as image, o.name as occupation, upd.birthDate, 
                                 addr.cityName, DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(), upd.birthDate)), '%Y') + 0 AS age,
                                 up.proposalUserId IN (select userBlockId from userblock where userId = ` + userId + `)  as isBlockByMe , 
                                up.proposalUserId IN (select userId from userblock where userBlockId = ` + userId + `)  as isBlockByOther,
                                u.id IN (select proposalUserId from userproposals where userId = ` + userId + `) as isProposed,
                                u.id IN (select favUserId from userfavourites where userId = ` + userId + `) as isFavourite
                                 FROM userproposals up 
                                 LEFT JOIN users u ON u.id = up.userId
                                 LEFT JOIN images img ON img.id = u.imageId
                                 LEFT JOIN userpersonaldetail upd ON upd.userId = u.id
                                 LEFT JOIN occupation o ON o.id = upd.occupationId
                                 LEFT JOIN addresses addr ON addr.id = upd.addressId WHERE up.proposalUserId = ` + userId + ` and up.proposalUserId IN (select userBlockId from userblock where userId = ` + userId + `) = 0  and up.proposalUserId IN (select userId from userblock where userBlockId = ` + userId + `) = 0)  as t1 WHERE t1.status = true`;
            let countResult = yield query(countSql);
            let sql = `select * from (SELECT up.id , up.proposalUserId  as visitorId, up.status, u.firstName, u.lastName, u.gender, u.email, u.contactNo, img.imageUrl as image, o.name as occupation, upd.birthDate, 
                addr.cityName, DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(), upd.birthDate)), '%Y') + 0 AS age, 
                up.proposalUserId IN (select userBlockId from userblock where userId =` + userId + `)  as isBlockByMe , 
                                up.proposalUserId IN (select userId from userblock where userBlockId =` + userId + `)  as isBlockByOther,
                                u.id IN (select proposalUserId from userproposals where userId = ` + userId + `) as isProposed,
                                u.id IN (select favUserId from userfavourites where userId = ` + userId + `) as isFavourite
                                 FROM userproposals up 
                                 LEFT JOIN users u ON u.id = up.proposalUserId
                                 LEFT JOIN images img ON img.id = u.imageId
                                 LEFT JOIN userpersonaldetail upd ON upd.userId = u.id
                                 LEFT JOIN occupation o ON o.id = upd.occupationId
                                 LEFT JOIN addresses addr ON addr.id = upd.addressId WHERE up.userId =` + userId + ` and up.proposalUserId IN (select userBlockId from userblock where userId = ` + userId + `) = 0   and up.proposalUserId IN (select userId from userblock where userBlockId =` + userId + `) = 0
                                 union 
                                 SELECT up.id , up.userId  as visitorId, up.status, u.firstName, u.lastName, u.gender, u.email, u.contactNo, img.imageUrl as image, o.name as occupation, upd.birthDate, 
                                 addr.cityName, DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(), upd.birthDate)), '%Y') + 0 AS age,
                                 up.proposalUserId IN (select userBlockId from userblock where userId = ` + userId + `)  as isBlockByMe , 
                                up.proposalUserId IN (select userId from userblock where userBlockId = ` + userId + `)  as isBlockByOther,
                                u.id IN (select proposalUserId from userproposals where userId = ` + userId + `) as isProposed,
                                u.id IN (select favUserId from userfavourites where userId = ` + userId + `) as isFavourite
                                 FROM userproposals up 
                                 LEFT JOIN users u ON u.id = up.userId
                                 LEFT JOIN images img ON img.id = u.imageId
                                 LEFT JOIN userpersonaldetail upd ON upd.userId = u.id
                                 LEFT JOIN occupation o ON o.id = upd.occupationId
                                 LEFT JOIN addresses addr ON addr.id = upd.addressId WHERE up.proposalUserId = ` + userId + ` and up.proposalUserId IN (select userBlockId from userblock where userId = ` + userId + `) = 0  and up.proposalUserId IN (select userId from userblock where userBlockId = ` + userId + `) = 0)  as t1 WHERE t1.status = true`;
            if (startIndex != null && fetchRecord != null) {
                sql += " LIMIT " + fetchRecord + " OFFSET " + startIndex + " ";
            }
            let result = yield query(sql);
            if (result) {
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Visitors', result, countResult[0].totalCount, authorizationResult.token);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "visitors.getVisitors() Error", new Error('Error While Getting Data'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", new Error(authorizationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'visitors.getVisitors() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getVisitors };
