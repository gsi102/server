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
app.post("/sign-up", (req, res) => {
    const userData = req.body;
    const { id, role, tempRole, login, name, surname, email, password, location, occupation, rating: { disputesWin, disputesLose, disputesRatio }, } = (0, createNewUser_1.default)(userData);
    poolConnectionDB.getConnection((err, connection) => {
        if (err)
            console.log(err);
        connection.query(`INSERT INTO users(id, role, tempRole, login, name, surName, email, password, location, occupation, disputesWin, disputesLose, disputesRatio) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`, [
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
        ], function (err, results, fields) {
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
    poolConnectionDB.getConnection((err, connection) => {
        if (err)
            console.log(err);
        // create a func for ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        connection.query(`INSERT INTO ${flag}
      (
      id, dateHh, dateMm, 
      dateSs, dateMs, dateFull, 
      userID, user, messageBody, 
      deletedText, isDeleted, wasDeleted, 
      likes
      )
      VALUES 
      (
        ?, ?, ?, 
        ?, ?, ?, 
        ?, ?, ?, 
        ?, ?, ?, 
        ?
      );`, [
            newMessage.id,
            newMessage.dateHh,
            newMessage.dateMm,
            newMessage.dateSs,
            newMessage.dateMs,
            newMessage.dateFull,
            newMessage.userID,
            newMessage.user,
            newMessage.messageBody,
            newMessage.deletedText,
            newMessage.isDeleted,
            newMessage.wasDeleted,
            newMessage.likes,
        ], function (err, results, fields) {
            if (err)
                console.log(err);
            res.status(200).json(newMessage);
            connection.release();
        });
    });
});
// Edit message
app.patch("/messages/:target/:id", (req, res) => {
    const patchTarget = req.params.target;
    const messageID = req.params.id;
    // const element =
    const updateMessage = function (patchTarget, messageID) {
        // 1 check if it is deleted and send deleted text
        // poolConnectionDB.getConnection((err, connection) => {
        //   if (err) console.log(err);
        //   connection.query(
        //     `UPDATE ${patchTarget}
        //     SET likes = likes + 1
        //     WHERE id = '${messageID}'`,
        //     function (err, results, fields) {
        //       if (err) console.log(err);
        //       res.status(200).json(results);
        //       connection.release();
        //     }
        //   );
        // });
        // 2
        // poolConnectionDB.getConnection((err, connection) => {
        //   if (err) console.log(err);
        //   connection.query(
        //     `UPDATE ${patchTarget} SET deletedText = "???",
        //     messageBody = "Message has been deleted by moderator",
        //     wasDeleted = 1,
        //     isDeleted = 1
        //     WHERE id = '${messageID}'`,
        //     function (err, results, fields) {
        //       if (err) console.log(err);
        //       res.status(200).json(results);
        //       connection.release();
        //     }
        //   );
        // });
        // 3
        // poolConnectionDB.getConnection((err, connection) => {
        //   if (err) console.log(err);
        //   connection.query(
        //     `UPDATE ${patchTarget}
        //     SET messageBody = "Some previous text",
        //       isDeleted = 0
        //     WHERE id = '${messageID}'`,
        //     function (err, results, fields) {
        //       if (err) console.log(err);
        //       res.status(200).json(results);
        //       connection.release();
        //     }
        //   );
        // });
    };
    switch (req.body.type) {
        case "delete":
            {
                // ДОРАБОТАТЬ
                poolConnectionDB.getConnection((err, connection) => {
                    if (err)
                        console.log(err);
                    connection.query(`UPDATE ${patchTarget} 
            SET deletedText = "???",
              messageBody = "Message has been deleted by moderator",
              wasDeleted = 1,
              isDeleted = 1
            WHERE id = '${messageID}'`, function (err, results, fields) {
                        if (err)
                            console.log(err);
                        res.status(200).json(results);
                        connection.release();
                    });
                });
                // if (!element.deletedText) element.deletedText = element.text;
                // if (!element.deleted) {
                //   element.deleted = !element.deleted;
                //   element.wasDeleted = true;
                // }
                // element.text = "Message has been deleted by moderator";
            }
            break;
        case "return":
            // ДОРАБОТАТЬ
            poolConnectionDB.getConnection((err, connection) => {
                if (err)
                    console.log(err);
                connection.query(`UPDATE ${patchTarget} 
          SET messageBody = "Some previous text",
            isDeleted = 0
          WHERE id = '${messageID}'`, function (err, results, fields) {
                    if (err)
                        console.log(err);
                    res.status(200).json(results);
                    connection.release();
                });
            });
            //   {
            //     if (element.deletedText) element.text = element.deletedText;
            //     if (element.deleted) element.deleted = !element.deleted;
            //   }
            break;
        case "like":
            {
                poolConnectionDB.getConnection((err, connection) => {
                    if (err)
                        console.log(err);
                    connection.query(`UPDATE ${patchTarget} 
            SET likes = likes + 1 
            WHERE id = '${messageID}'`, function (err, results, fields) {
                        if (err)
                            console.log(err);
                        res.status(200).json(results);
                        connection.release();
                    });
                });
            }
            break;
        default:
        //will never execute
    }
});
app.listen(port, () => {
    console.log(`Port: ${port}`);
});
