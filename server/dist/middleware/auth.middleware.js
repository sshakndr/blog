"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const secretKey = 'rip8';
module.exports = (req, res, next) => {
    var _a;
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token)
            return res.status(401).send('no token');
        const decoded = (0, jsonwebtoken_1.verify)(token, secretKey);
        req.body.user = decoded;
        next();
    }
    catch (e) {
        return res.status(401).send('server error');
    }
};
