"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MYSQL_HOST = process.env.MYSQL_HOST || '89.117.27.1'; //'127.0.0.1'
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'u643975107_matrimony'; //'admin_matrimony'
const MYSQL_USER = process.env.MYSQL_USER || 'u643975107_matrimony'; //'astroguru_user'
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'Mm@123rock'; //'Ns@#2022'
const MYSQL = {
    host: MYSQL_HOST,
    database: MYSQL_DATABASE,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD
};
const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
const SERVER_PORT = process.env.SERVER_PORT || 8083; //8083 //process.env.PORT;
const SERVER_TOKEN_EXPIRETIME = process.env.SERVER_TOKEN_EXPIRETIME || 3600;
const SERVER_REFRESH_TOKEN_EXPIRETIME = process.env.SERVER_REFRESH_TOKEN_EXPIRETIME || 86400;
//For Testing
// const SERVER_TOKEN_EXPIRETIME = process.env.SERVER_TOKEN_EXPIRETIME || 60; //3600
// const SERVER_REFRESH_TOKEN_EXPIRETIME = process.env.SERVER_REFRESH_TOKEN_EXPIRETIME || 300; //86400
const SERVER_TOKEN_ISSUER = process.env.SERVER_TOKEN_ISSUER || 'coolIssuer';
const SERVER_TOKEN_SECRET = process.env.SERVER_TOKEN_SECRET || 'superencryptedsecret';
const SERVER = {
    hostname: SERVER_HOSTNAME,
    port: SERVER_PORT,
    token: {
        expireTime: SERVER_TOKEN_EXPIRETIME,
        issuer: SERVER_TOKEN_ISSUER,
        secret: SERVER_TOKEN_SECRET,
        refreshExpirationTime: SERVER_REFRESH_TOKEN_EXPIRETIME,
    }
};
const BASEREQUST = [
    '/api/app/users/login',
    '/api/app/users/signUp'
];
const EMAILMATRIMONYSETPASSWORD = {
    fromName: "Native Software Team",
    fromEmail: "admin@native.software",
    subject: "link to reset password",
    html: '<span>Hi [NAME],</span> \n\n <p>Below is the link to verify your account and new Password of your login</p>\
    \n\n <span style="font-weight:bolder; font-size:x-large; color:grey"><a href ="https://matrimonyadmin.native.software/reset-password/[VERIFICATION_TOKEN]">Click to Verify</a></span><br>  <span>Thank You, <br> Native Software Team</span>'
};
// const KEY_ID = process.env.KEY_ID || 'rzp_test_QsDMPb9jLx9EbE';
// const SECRET_KEY = process.env.SECRET_KEY || 'mZk44Ei1HtdmkqE3KxlMC5zz';
// const KEY = {
//     keyId: KEY_ID,
//     secretKey: SECRET_KEY
// }
const APP_ID = process.env.APP_ID || '32cc47360e134c6fa4c2a683f0fc5425';
const APP_CERTIFICATE = process.env.APP_CERTIFICATE || '817c8f56e7da4f748208f4804a503f9f';
const AGORA = {
    appId: APP_ID,
    appCertificate: APP_CERTIFICATE
};
const config = {
    mysql: MYSQL,
    server: SERVER,
    baseRequests: BASEREQUST,
    emailMatrimonySetPassword: EMAILMATRIMONYSETPASSWORD,
    // key:KEY
    // key:KEY,
    agora: AGORA
};
exports.default = config;
// <rewrite>
// <rules>
//     <rule name="nodejs" >
//         <match url="(.*)" >
//         <conditions>
//             <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
//         </conditions>
//         <action type="Rewrite" url="build/server.js" />
//     </rule>
// </rules>
// </rewrite>
