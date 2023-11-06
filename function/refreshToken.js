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
const config_1 = __importDefault(require("../config/config"));
const logging_1 = __importDefault(require("../config/logging"));
const { uuid } = require('uuidv4');
const NAMESPACE = 'Refresh Token';
const createRefreshToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, `Creating Refresh Token`);
        let expiredDate = new Date();
        expiredDate.setSeconds(expiredDate.getSeconds() + Number(config_1.default.server.token.refreshExpirationTime));
        let _token = uuid();
        let refreshToken = {
            "token": _token,
            "userId": userId,
            "expireAt": expiredDate,
        };
        return refreshToken;
    }
    catch (error) {
        logging_1.default.error(NAMESPACE, error.message, error);
        return error;
    }
});
exports.default = createRefreshToken;
