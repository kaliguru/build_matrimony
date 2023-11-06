"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultError = void 0;
class ResultError {
    constructor(status, isDisplayMessage, message, error, value) {
        this.status = status;
        this.isDisplayMessage = isDisplayMessage;
        this.message = message;
        this.error = error;
        this.value = value;
    }
}
exports.ResultError = ResultError;
