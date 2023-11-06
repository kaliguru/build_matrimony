"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const employmentType_1 = __importDefault(require("../../controllers/admin/employmentType"));
const router = express_1.default.Router();
// #region /api/admin/employmentType/getEmploymentType apidoc
/**
 * @api {post} /api/admin/employmentType/getEmploymentType Get Employment Type
 * @apiVersion 1.0.0
 * @apiName Get Employment Type
 * @apiDescription Get Employment Type
 * @apiGroup Employment Type - Admin
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "status": 200,
 *         "isDisplayMessage": true,
 *         "message": "Get Employment Type Successfully",
 *         "recordList": [
 *             {
 *                 "id": 1,
 *                 "name": "salaried",
 *                 "parentId": null,
 *                 "isActive": 1,
 *                 "isDelete": 0,
 *                 "createdDate": "2023-03-02T04:56:58.000Z",
 *                 "modifiedDate": "2023-03-02T04:56:58.000Z",
 *                 "createdBy": 5,
 *                 "modifiedBy": 5
 *             },....
 *         ],
 *         "totalRecords": 1,
 *         "token": ""
 *     }
 * @apiError (500) {JSON} Result message, apiName, apiType, fileName, functionName, lineNumber, typeName, stack.
 * @apiErrorExample {json} Error-500-Response:
 *     HTTP/1.1 500 ERROR
 *     {
 *          status: <error status code>,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: <error message>,
 *          error: {
 *              apiName: <api name>,
 *              apiType: <api type>,
 *              fileName: <file name>,
 *              functionName: <function name>,
 *              lineNumber: <line number>,
 *              typeName: <type name>,
 *              stack: <stack>
 *          },
 *          value: <value if any>
 *     }
 */
// #endregion
router.post('/getEmploymentType', employmentType_1.default.getEmploymentType);
// #region /api/admin/employmentType/insertUpdateEmploymentType apidoc
/**
 * @api {post} /api/admin/employmentType/insertUpdateEmploymentType insert update Employment Type
 * @apiVersion 1.0.0
 * @apiName insert update Employment Type
 * @apiDescription insert update Employment Type
  * @apiGroup Employment Type - Admin
 * @apiParam  {String}          name                Requires name of Employment Type.
 * @apiParam  {String}          id                  Requires id of Employment Type only for Update.
 * @apiParamExample {json} Request-Example:
 *      {
 *           "id": 1  // Require When edit Employment Type else not send
 *           "name": "salaried"
 *      }
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "status": 200,
 *         "isDisplayMessage": true,
 *         "message": "Insert Employment Type",
 *         "recordList": {
 *             "fieldCount": 0,
 *             "affectedRows": 1,
 *             "insertId": 1,
 *             "serverStatus": 2,
 *             "warningCount": 0,
 *             "message": "",
 *             "protocol41": true,
 *             "changedRows": 0
 *         },
 *         "totalRecords": 1,
 *         "token": ""
 *     }
 * @apiError (500) {JSON} Result message, apiName, apiType, fileName, functionName, lineNumber, typeName, stack.
 * @apiErrorExample {json} Error-500-Response:
 *     HTTP/1.1 500 ERROR
 *     {
 *          status: <error status code>,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: <error message>,
 *          error: {
 *              apiName: <api name>,
 *              apiType: <api type>,
 *              fileName: <file name>,
 *              functionName: <function name>,
 *              lineNumber: <line number>,
 *              typeName: <type name>,
 *              stack: <stack>
 *          },
 *          value: <value if any>
 *     }
 */
// #endregion
router.post('/insertUpdateEmploymentType', employmentType_1.default.insertUpdateEmploymentType);
// #region /api/admin/employmentType/activeInactiveEmploymentType apidoc
/**
 * @api {post} /api/admin/employmentType/activeInactiveEmploymentType Change Employment Type Status
 * @apiVersion 1.0.0
 * @apiName Change Employment Type
 * @apiDescription Change Employment Type
 * @apiGroup Employment Type - Admin
 * @apiParam  {Number}          id                Requires id of Employment Type.
 * @apiParamExample {json} Request-Example:
 *    {
 *        "id": 3
 *    }
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "status": 200,
 *         "isDisplayMessage": true,
 *         "message": "Change Employment Type Status",
 *         "recordList": {
 *             "fieldCount": 0,
 *             "affectedRows": 1,
 *             "insertId": 0,
 *             "serverStatus": 2,
 *             "warningCount": 1,
 *             "message": "(Rows matched: 1  Changed: 1  Warnings: 1",
 *             "protocol41": true,
 *             "changedRows": 1
 *         },
 *         "totalRecords": 1,
 *         "token": ""
 *     }
 * @apiError (500) {JSON} Result message, apiName, apiType, fileName, functionName, lineNumber, typeName, stack.
 * @apiErrorExample {json} Error-500-Response:
 *     HTTP/1.1 500 ERROR
 *     {
 *          status: <error status code>,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: <error message>,
 *          error: {
 *              apiName: <api name>,
 *              apiType: <api type>,
 *              fileName: <file name>,
 *              functionName: <function name>,
 *              lineNumber: <line number>,
 *              typeName: <type name>,
 *              stack: <stack>
 *          },
 *          value: <value if any>
 *     }
 */
// #endregion
router.post('/activeInactiveEmploymentType', employmentType_1.default.activeInactiveEmploymentType);
module.exports = router;
