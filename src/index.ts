import express from "express";
import path, { resolve } from "path";
import cors from "cors";
import { userInfo } from "os";
import cookieParser from "cookie-parser";
import mysql from "mysql";
import createNewUser from "./createNewUser";
import createNewMessage from "./createNewMessage";

const app = express();
const port = process.env.PORT ?? 3003;

app.use(express.json());
// Only for DEV.
app.use(cors({ credentials: true, origin: true }));

// COOKIES
// app.use(cookieParser());

let MESSAGES = {
  DISPUTE: [
    {
      dateFull: "Thu Jun 23 2022 17:25:37 GMT+0300 (Москва, стандартное время)",
      dateHh: "17",
      dateMm: "25",
      deleted: false,
      wasDeleted: false,
      id: "disputeMessages_0",
      likes: 0,
      name: "someName1",
      text: "message - 1",
      deletedText: "",
    },
    {
      dateFull: "Thu Jun 23 2022 17:30:37 GMT+0300 (Москва, стандартное время)",
      dateHh: "17",
      dateMm: "30",
      deleted: false,
      wasDeleted: false,
      id: "disputeMessages_1",
      likes: 0,
      name: "someName2",
      text: "message - 2",
      deletedText: "",
    },
    {
      dateFull: "Thu Jun 23 2022 17:40:37 GMT+0300 (Москва, стандартное время)",
      dateHh: "17",
      dateMm: "40",
      deleted: false,
      wasDeleted: false,
      id: "disputeMessages_2",
      likes: 0,
      name: "someName3",
      text: "message - 3",
      deletedText: "",
    },
  ],
  SPEC: [
    {
      dateFull: "Thu Jun 24 2022 18:25:37 GMT+0300 (Москва, стандартное время)",
      dateHh: "18",
      dateMm: "25",
      deleted: false,
      wasDeleted: false,
      id: "specMessages_0",
      name: "spec1",
      text: "specmessage - 1",
      deletedText: "",
      likes: null,
    },
    {
      dateFull: "Thu Jun 24 2022 18:30:37 GMT+0300 (Москва, стандартное время)",
      dateHh: "18",
      dateMm: "30",
      deleted: false,
      wasDeleted: false,
      id: "specMessages_1",
      name: "spec2",
      text: "specmessage - 2",
      deletedText: "",
      likes: null,
    },
    {
      dateFull: "Thu Jun 24 2022 18:40:37 GMT+0300 (Москва, стандартное время)",
      dateHh: "18",
      dateMm: "40",
      deleted: false,
      wasDeleted: false,
      id: "specMessages_2",
      name: "spec3",
      text: "specmessage - 3",
      deletedText: "",
      likes: null,
    },
  ],
};

const poolConnectionDB = mysql.createPool({
  connectionLimit: 10,
  host: "91.236.136.231",
  user: "u170175_admin",
  password: "admin323",
  database: "u170175_db",
});

// USERS
app.post("/sign-in", (req, res) => {
  const [userLogin, userPassword] = [req.body.login, req.body.password];
  const compareLogin = userLogin.toString().toLowerCase();

  poolConnectionDB.getConnection((err, connection) => {
    if (err) console.log(err);
    connection.query(
      `SELECT * FROM users WHERE login = ?`,
      compareLogin,
      (err2, response) => {
        if (err2) console.log(err2);
        if (response.length === 1) {
          const compareUser = response[0];
          const sendUser = { ...compareUser };
          // Prevent sending password in response
          delete sendUser.password;

          userPassword === compareUser.password
            ? res.status(200).send(sendUser)
            : res.status(401).send(compareUser);
        } else res.status(401).send("user not found");
        connection.release();
      }
    );
  });
});

app.post("/sign-up", (req, res) => {
  const userData = req.body;
  const {
    id,
    role,
    tempRole,
    login,
    name,
    surname,
    email,
    password,
    location,
    occupation,
    rating: { disputesWin, disputesLose, disputesRatio },
  } = createNewUser(userData);

  poolConnectionDB.getConnection((err, connection) => {
    if (err) console.log(err);
    connection.query(
      `INSERT INTO users(id, role, tempRole, login, name, surName, email, password, location, occupation, disputesWin, disputesLose, disputesRatio) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        role,
        tempRole,
        login,
        name,
        surname,
        email,
        password,
        location,
        occupation,
        disputesWin,
        disputesLose,
        disputesRatio,
      ],
      function (err, results, fields) {
        if (err) console.log(err);
        connection.release();
      }
    );
  });

  res.status(200).send("OK");
});

// MESSAGES
// Messages first load
app.get("/messages/:target", (req, res) => {
  const fetchTarget = req.params.target;

  poolConnectionDB.getConnection((err, connection) => {
    if (err) console.log(err);
    connection.query(
      `SELECT * FROM ${fetchTarget}`,
      function (err, results, fields) {
        if (err) console.log(err);
        res.status(200).json(results);
        connection.release();
      }
    );
  });
});

//New message
app.post("/messages/:target", (req, res) => {
  const [flag, userID, userLogin, messageInput, postfixForId] = req.body;
  const newMessage = createNewMessage(
    flag,
    userID,
    userLogin,
    messageInput,
    postfixForId
  );

  poolConnectionDB.getConnection((err, connection) => {
    if (err) console.log(err);

    connection.query(
      `INSERT INTO ${flag}(id, dateHh, dateMm, dateFull, user_id, user, message_body, deleted_text, was_deleted, likes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        newMessage.id,
        newMessage.dateHh,
        newMessage.dateMm,
        newMessage.dateFull,
        newMessage.userID,
        newMessage.user,
        newMessage.messageBody,
        newMessage.deletedText,
        newMessage.wasDeleted,
        newMessage.likes,
      ],
      function (err, results, fields) {
        if (err) console.log(err);
        connection.release();
      }
    );
  });

  // res.status(200).json(MESSAGES[pushTarget as keyof typeof MESSAGES]);
});

// Edit message
app.patch("/messages/:target/:id", (req, res) => {
  const patchTarget = req.params.target;
  const messageId = Number(req.params.id);
  const element = MESSAGES[patchTarget as keyof typeof MESSAGES][messageId];

  switch (req.body.type) {
    case "delete":
      {
        if (!element.deletedText) element.deletedText = element.text;
        if (!element.deleted) {
          element.deleted = !element.deleted;
          element.wasDeleted = true;
        }
        element.text = "Message has been deleted by moderator";
      }
      break;
    case "return":
      {
        if (element.deletedText) element.text = element.deletedText;
        if (element.deleted) element.deleted = !element.deleted;
      }
      break;
    case "like":
      {
        element.likes !== null ? ++element.likes : "";
      }
      break;
    default:
    //will never execute
  }

  res.status(200).json(MESSAGES[patchTarget as keyof typeof MESSAGES]);
});

app.listen(port, () => {
  console.log(`Port: ${port}`);
});
