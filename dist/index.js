"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const createNewMessage_1 = __importDefault(require("./createNewMessage"));
const ws_1 = __importDefault(require("ws"));
const http_1 = __importDefault(require("http"));
const sqlAPI_1 = __importDefault(require("./sqlAPI"));
const poolConnectionDB_1 = __importDefault(require("./poolConnectionDB"));
const app = (0, express_1.default)();
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3003;
app.use(express_1.default.json());
// Only for DEV.
app.use((0, cors_1.default)({ credentials: true, origin: true }));
// COOKIES
// app.use(cookieParser());
//WebSocket - send new/updated message to all clients
var myServer = http_1.default.createServer(app);
const wsConnection = new ws_1.default.Server({
    port: 3008,
});
wsConnection.on("connection", (ws) => {
    ws.on("message", (payload) => {
        // Because of blob
        let wsPayload = JSON.parse(payload.toString());
        const messageID = wsPayload.id;
        const regex = /(.*)\_/;
        const fetchTarget = regex.exec(messageID);
        const sqlString = `SELECT * FROM ${fetchTarget[1]} 
    WHERE id = '${messageID}'`;
        const sendToAllClients = (results, errDB) => {
            results[0].type = wsPayload.type;
            wsConnection.clients.forEach(function each(client) {
                client.send(JSON.stringify(results));
            });
        };
        (0, poolConnectionDB_1.default)(sqlString, null, sendToAllClients);
    });
});
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
    sqlAPI_1.default.users.checkLogin(userData, res);
});
app.get("/users/:login", (req, res) => {
    const searchByLogin = req.params.login;
    sqlAPI_1.default.users.searchUsers(searchByLogin, res);
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
    const { target, id } = req.params;
    const { user, textContainer, type } = req.body;
    switch (type) {
        case "delete":
            sqlAPI_1.default.messages.updateMessageMethods.deleteMessage(id, target, textContainer, res);
            break;
        case "return":
            sqlAPI_1.default.messages.updateMessageMethods.returnMessage(id, target, textContainer, res);
            break;
        case "like":
            sqlAPI_1.default.messages.updateMessageMethods.likeMessage(id, user, target, res);
            break;
        default:
        //will never execute
    }
});
app.listen(port, () => {
    console.log(`Port: ${port}`);
});
