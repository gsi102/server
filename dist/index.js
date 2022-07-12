"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mysql_1 = __importDefault(require("mysql"));
const createNewUser_1 = __importDefault(require("./createNewUser"));
const createNewMessage_1 = __importDefault(require("./createNewMessage"));
const sqlRequests_1 = require("./sqlRequests");
const app = (0, express_1.default)();
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3003;
app.use(express_1.default.json());
// Only for DEV.
app.use((0, cors_1.default)({ credentials: true, origin: true }));
// COOKIES
// app.use(cookieParser());
const poolConnectionDB = mysql_1.default.createPool({
    connectionLimit: 10,
    host: "91.236.136.231",
    user: "u170175_admin",
    password: "admin323",
    database: "u170175_db",
});
// USERS
// Sign-in
app.post("/sign-in", (req, res) => {
    const [userLogin, userPassword] = [req.body.login, req.body.password];
    const compareLogin = userLogin.toString().toLowerCase();
    poolConnectionDB.getConnection((err, connection) => {
        if (err)
            console.log(err);
        connection.query(`SELECT * FROM users WHERE login = ?`, compareLogin, (err2, response) => {
            if (err2)
                console.log(err2);
            if (response.length === 1) {
                const compareUser = response[0];
                const sendUser = Object.assign({}, compareUser);
                // Prevent sending password in response
                delete sendUser.password;
                userPassword === compareUser.password
                    ? res.status(200).send(sendUser)
                    : res.status(401).send(compareUser);
            }
            else
                res.status(401).send("user not found");
            connection.release();
        });
    });
});
// Sign-up
app.post("/sign-up", (req, res) => {
    const userData = req.body;
    const newUser = (0, createNewUser_1.default)(userData);
    const sqlColumnNames = [
        "id",
        "role",
        "tempRole",
        "login",
        "firstName",
        "lastName",
        "email",
        "password",
        "location",
        "occupation",
        "disputesWin",
        "disputesLose",
        "disputesRatio",
    ];
    poolConnectionDB.getConnection((err, connection) => {
        if (err)
            console.log(err);
        connection.query(`INSERT INTO users(${sqlColumnNames}) 
      VALUES 
      (
        ${sqlRequests_1.sqlRequests.sqlInsertSynthax(sqlColumnNames)}
      );`, sqlRequests_1.sqlRequests.sqlColumnValues(newUser), function (err, results, fields) {
            if (err)
                console.log(err);
            connection.release();
        });
    });
    res.status(200).send("OK");
});
// MESSAGES
// Fetching messages
app.get("/messages/:target", (req, res) => {
    const fetchTarget = req.params.target;
    poolConnectionDB.getConnection((err, connection) => {
        if (err)
            console.log(err);
        connection.query(`SELECT * FROM ${fetchTarget} ORDER BY dateHh, dateMm, dateSs, dateMs ASC`, function (err, results, fields) {
            if (err)
                console.log(err);
            res.status(200).json(results);
            connection.release();
        });
    });
});
//New message
app.post("/messages/:target", (req, res) => {
    const flag = req.params.target;
    const { userID, userLogin, messageInput } = req.body;
    const newMessage = (0, createNewMessage_1.default)(flag, userID, userLogin, messageInput);
    const sqlColumnNames = [
        "id",
        "dateHh",
        "dateMm",
        "dateSs",
        "dateMs",
        "dateFull",
        "userID",
        "user",
        "messageBody",
        "deletedText",
        "isDeleted",
        "wasDeleted",
        "likes",
    ];
    poolConnectionDB.getConnection((err, connection) => {
        if (err)
            console.log(err);
        connection.query(`INSERT INTO ${flag}
      (
        ${sqlColumnNames}
      )
      VALUES 
      (
        ${sqlRequests_1.sqlRequests.sqlInsertSynthax(sqlColumnNames)}
      );`, sqlRequests_1.sqlRequests.sqlColumnValues(newMessage), function (err, results, fields) {
            if (err)
                console.log(err);
            res.status(200).json(newMessage);
            connection.release();
        });
    });
});
// Edit message
app.patch("/messages/:target/:id", (req, res) => {
    const { id, target } = req.params;
    const textContainer = req.body.textContainer;
    let sqlRequest = "";
    const updateMessage = function (sqlRequest) {
        poolConnectionDB.getConnection((err, connection) => {
            if (err)
                console.log(err);
            connection.query(sqlRequest, function (err, results, fields) {
                if (err)
                    console.log(err);
                res.status(200).json(results);
                connection.release();
            });
        });
    };
    switch (req.body.type) {
        case "delete":
            {
                sqlRequest = `UPDATE ${target} 
        SET deletedText = '${textContainer}',
          messageBody = "Message has been deleted by moderator",
          wasDeleted = 1,
          isDeleted = 1
        WHERE id = '${id}'`;
                updateMessage(sqlRequest);
            }
            break;
        case "return":
            sqlRequest = `UPDATE ${target} 
      SET messageBody = '${textContainer}',
        isDeleted = 0
      WHERE id = '${id}'`;
            updateMessage(sqlRequest);
            break;
        case "like":
            {
                sqlRequest = `UPDATE ${target} 
        SET likes = likes + 1 
        WHERE id = '${id}'`;
                updateMessage(sqlRequest);
            }
            break;
        default:
        //will never execute
    }
});
app.listen(port, () => {
    console.log(`Port: ${port}`);
});
