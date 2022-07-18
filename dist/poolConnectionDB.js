"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
const poolConnectionDB = mysql_1.default.createPool({
    connectionLimit: 10,
    host: "91.236.136.231",
    user: "u170175_admin",
    password: "admin323",
    database: "u170175_db",
});
exports.default = (sqlString, sqlOptions, sqlCb) => {
    poolConnectionDB.getConnection((err, connection) => {
        if (err)
            console.log(err);
        connection.query(sqlString, sqlOptions, (errDB, response) => {
            if (errDB)
                console.log(errDB);
            sqlCb(response, errDB);
            connection.release();
        });
    });
};
