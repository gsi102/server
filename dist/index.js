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
const ws_1 = __importDefault(require("ws"));
const http_1 = __importDefault(require("http"));
const sqlAPI_1 = __importDefault(require("./sqlAPI"));
const app = (0, express_1.default)();
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3003;
app.use(express_1.default.json());
// Only for DEV.
app.use((0, cors_1.default)({ credentials: true, origin: true }));
// COOKIES
// app.use(cookieParser());
// MySQL db
const poolConnectionDB = mysql_1.default.createPool({
    connectionLimit: 10,
    host: "91.236.136.231",
    user: "u170175_admin",
    password: "admin323",
    database: "u170175_db",
});
//WebSocket - send new message to all clients
var myServer = http_1.default.createServer(app);
const wsConnection = new ws_1.default.Server({
    port: 3008,
});
wsConnection.on("connection", (ws) => {
    ws.on("message", (data) => {
        const newMessageID = data.toString();
        const regex = /(.*)\_/;
        const fetchTarget = regex.exec(newMessageID);
        poolConnectionDB.getConnection((err, connection) => {
            if (err)
                console.log(err);
            if (fetchTarget)
                connection.query(`SELECT * FROM ${fetchTarget[1]} WHERE id = '${newMessageID}'`, function (err, results, fields) {
                    if (err)
                        console.log(err);
                    wsConnection.clients.forEach(function each(client) {
                        client.send(JSON.stringify(results));
                    });
                    connection.release();
                });
        });
    });
});
///////////////////////////////
// USERS
// Sign-in
app.post("/sign-in", (req, res) => {
    const [userLogin, userPassword] = [req.body.login, req.body.password];
    const compareLogin = userLogin.toString().toLowerCase();
    sqlAPI_1.default.users.signIn(compareLogin, userPassword, res);
});
// Sign-up
app.post("/sign-up", (req, res) => {
    const userData = req.body;
    const newUser = (0, createNewUser_1.default)(userData);
    sqlAPI_1.default.users.signUp(newUser, res);
});
// MESSAGES
// Fetching ALL messages
app.get("/messages/:target", (req, res) => {
    const fetchTarget = req.params.target;
    sqlAPI_1.default.messages.getAllMessages(fetchTarget, res);
});
//New message
app.post("/messages/:target", (req, res) => {
    const flag = req.params.target;
    const { userID, userLogin, messageInput } = req.body;
    const newMessage = (0, createNewMessage_1.default)(flag, userID, userLogin, messageInput);
    sqlAPI_1.default.messages.sendNewMessage(flag, newMessage, res);
});
// delete/return/like message
app.patch("/messages/:target/:id", (req, res) => {
    const { id, target } = req.params;
    const textContainer = req.body.textContainer;
    switch (req.body.type) {
        case "delete":
            sqlAPI_1.default.messages.updateMessageMethods.deleteMessage(id, target, textContainer, res);
            break;
        case "return":
            sqlAPI_1.default.messages.updateMessageMethods.returnMessage(id, target, textContainer, res);
            break;
        case "like":
            sqlAPI_1.default.messages.updateMessageMethods.likeMessage(id, target, res);
            break;
        default:
        //will never execute
    }
});
app.listen(port, () => {
    console.log(`Port: ${port}`);
});
