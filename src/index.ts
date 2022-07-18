import express from "express";
import path, { resolve } from "path";
import cors from "cors";
import { userInfo } from "os";
import cookieParser from "cookie-parser";
import mysql from "mysql";
import createNewUser from "./createNewUser";
import createNewMessage from "./createNewMessage";
import { sqlRequestsTemplates } from "./sqlRequests";
import Websocket from "ws";
import http from "http";
import { Blob } from "buffer";
import HTTP_CODES from "./HTTP_CODES";
import sqlAPI from "./sqlAPI";

const app = express();
const port = process.env.PORT ?? 3003;

app.use(express.json());
// Only for DEV.
app.use(cors({ credentials: true, origin: true }));

// COOKIES
// app.use(cookieParser());

// MySQL db
const poolConnectionDB = mysql.createPool({
  connectionLimit: 10,
  host: "91.236.136.231",
  user: "u170175_admin",
  password: "admin323",
  database: "u170175_db",
});

//WebSocket - send new message to all clients
var myServer = http.createServer(app);
const wsConnection = new Websocket.Server({
  port: 3008,
});
wsConnection.on("connection", (ws) => {
  ws.on("message", (data) => {
    const newMessageID = data.toString();
    const regex = /(.*)\_/;
    const fetchTarget = regex.exec(newMessageID);

    poolConnectionDB.getConnection((err, connection) => {
      if (err) console.log(err);
      if (fetchTarget)
        connection.query(
          `SELECT * FROM ${fetchTarget[1]} WHERE id = '${newMessageID}'`,
          function (err, results, fields) {
            if (err) console.log(err);
            wsConnection.clients.forEach(function each(client) {
              client.send(JSON.stringify(results));
            });
            connection.release();
          }
        );
    });
  });
});
///////////////////////////////

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
  const newUser = createNewUser(userData);
  sqlAPI.users.signUp(newUser, res);
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
  const { id, target } = req.params;
  const textContainer = req.body.textContainer;

  switch (req.body.type) {
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
      sqlAPI.messages.updateMessageMethods.likeMessage(id, target, res);
      break;
    default:
    //will never execute
  }
});

app.listen(port, () => {
  console.log(`Port: ${port}`);
});
