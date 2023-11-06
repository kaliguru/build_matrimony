"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serverHealthCheck = (req, res, next) => {
    // return res.status(200).json({
    //     message: 'pong'
    // });
    let message = "Welcome to our Website! PONG";
    return res.status(200).send(message);
};
exports.default = { serverHealthCheck };
