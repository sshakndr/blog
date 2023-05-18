"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = require("./routes/user.routes");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const fs_1 = require("fs");
const app = (0, express_1.default)();
const port = 5000;
app.use(express_1.default.json());
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
});
app.use((0, express_fileupload_1.default)());
app.use('/api', user_routes_1.router);
app.listen(port, () => {
    if (!(0, fs_1.existsSync)('./media'))
        (0, fs_1.mkdirSync)('./media');
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
