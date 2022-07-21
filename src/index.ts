import express from "express";
import path, { resolve } from "path";
import cors from "cors";
import { userInfo } from "os";
import cookieParser from "cookie-parser";
import mysql from "mysql";
import createNewUser from "./createNewUser";
import createNewMessage from "./createNewMessage";
import Websocket from "ws";
import http from "http";
import sqlAPI from "./sqlAPI";
import poolConnectionDB from "./poolConnectionDB";

const app = express();
const port = process.env.PORT ?? 3003;

app.use(express.json());
// Only for DEV.
app.use(cors({ credentials: true, origin: true }));

// COOKIES
// app.use(cookieParser());

//WebSocket - send new/updated message to all clients
var myServer = http.createServer(app);
const wsConnection = new Websocket.Server({
  port: 3008,
});
wsConnection.on("connection", (ws) => {
  ws.on("message", (payload) => {
    // Because of blob
    let wsPayload: any = JSON.parse(payload.toString());

    const messageID = wsPayload.id;
    const regex = /(.*)\_/;
    const fetchTarget: any = regex.exec(messageID);

    const sqlString = `SELECT * FROM ${fetchTarget[1]} 
    WHERE id = '${messageID}'`;
    const sendToAllClients = (results: any, errDB: any) => {
      results[0].type = wsPayload.type;
      wsConnection.clients.forEach(function each(client) {
        client.send(JSON.stringify(results));
      });
    };
    poolConnectionDB(sqlString, null, sendToAllClients);
  });
});

// USERS
// Sign-in
app.post("/sign-in", (req, res) => {
  const [userLogin, userPassword] = [req.body.login, req.body.password];
  const compareLogin = userLogin.toString().toLowerCase();
  sqlAPI.users.signIn(compareLogin, userPassword, res);
});
// Sign-up
app.post("/sign-up", (req, res) => {
  const userData = req.body;
  sqlAPI.users.checkLogin(userData, res);
});
app.get("/users/:login", (req, res) => {
  const searchByLogin = req.params.login;
  sqlAPI.users.searchUsers(searchByLogin, res);
});

// MESSAGES
// Fetching ALL messages
app.get("/messages/:target", (req, res) => {
  const fetchTarget = req.params.target;
  sqlAPI.messages.getAllMessages(fetchTarget, res);
});
//New message
app.post("/messages/:target", (req, res) => {
  const flag = req.params.target;
  const { userID, userLogin, messageInput } = req.body;
  const newMessage = createNewMessage(flag, userID, userLogin, messageInput);
  sqlAPI.messages.sendNewMessage(flag, newMessage, res);
});

// delete/return/like message
app.patch("/messages/:target/:id", (req, res) => {
  const { target, id } = req.params;
  const { user, textContainer, type } = req.body;

  switch (type) {
    case "delete":
      sqlAPI.messages.updateMessageMethods.deleteMessage(
        id,
        target,
        textContainer,
        res
      );
      break;
    case "return":
      sqlAPI.messages.updateMessageMethods.returnMessage(
        id,
        target,
        textContainer,
        res
      );
      break;
    case "like":
      sqlAPI.messages.updateMessageMethods.likeMessage(id, user, target, res);
      break;
    default:
    //will never execute
  }
});

app.listen(port, () => {
  console.log(`Port: ${port}`);
});
