"use strict";
//#region Notification Code
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};
var admin = require("firebase-admin");
var serviceAccount = require("../../matrimony-firebase-adminsdk.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const sendMultipleNotification = (fcmTokens, id, title, message, json, dateTime, ImageUrl, type) => __awaiter(void 0, void 0, void 0, function* () {
    var result = null;
    try {
        var dataBody = {
            id: id,
            title: title,
            message: message,
            type: type,
            json: json,
            dateTime: dateTime
        };
        const messaging = admin.messaging();
        var payload = {
            notification: ImageUrl ? {
                title: title,
                body: message,
                imageUrl: ImageUrl,
            } : {
                title: title,
                body: message
            },
            data: {
                click_action: "FLUTTER_NOTIFICATION_CLICK",
                body: JSON.stringify(dataBody),
            },
            android: {
                priority: 'high',
            },
            tokens: fcmTokens,
        };
        result = yield messaging.sendMulticast(payload);
        console.log(result);
    }
    catch (e) {
        console.log(e);
        result = e;
    }
    return result;
});
exports.default = { sendMultipleNotification };
