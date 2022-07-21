"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HTTP_CODES_1 = __importDefault(require("./HTTP_CODES"));
const sqlColumnsTemplates_1 = require("./sqlColumnsTemplates");
const poolConnectionDB_1 = __importDefault(require("./poolConnectionDB"));
const uuid_1 = require("uuid");
const createNewUser_1 = __importDefault(require("./createNewUser"));
const sqlAPI = {
    users: {
        signIn(compareLogin, userPassword, responseToClient) {
            const sqlRequest = `SELECT * FROM users WHERE login = ?`;
            const getUserFromDB = (response, errDB) => {
                if (response.length === 1) {
                    const compareUser = response[0];
                    const sendUser = Object.assign({}, compareUser);
                    // Prevent sending password in response - temp.
                    delete sendUser.password;
                    userPassword === compareUser.password
                        ? responseToClient.status(HTTP_CODES_1.default.OK_200).json(sendUser)
                        : responseToClient
                            .status(HTTP_CODES_1.default.BAD_REQUEST_400)
                            .json("Wrong password");
                }
                else
                    responseToClient
                        .status(HTTP_CODES_1.default.BAD_REQUEST_400)
                        .json("Something wrong. Possibly user not found");
            };
            (0, poolConnectionDB_1.default)(sqlRequest, compareLogin, getUserFromDB);
        },
        checkLogin(userData, responseToClient) {
            const sqlRequest = `SELECT * FROM users WHERE login = '${userData.login}'`;
            const compareLogin = (response, errDB) => {
                if (errDB) {
                    console.log(errDB);
                    responseToClient
                        .status(HTTP_CODES_1.default.BAD_REQUEST_400)
                        .json("Something wrong. Resp from DB: " + errDB);
                }
                else {
                    if (response[0]) {
                        responseToClient
                            .status(HTTP_CODES_1.default.CONFLICT_409)
                            .json("Login is already exist");
                    }
                    else {
                        const newUser = (0, createNewUser_1.default)(userData);
                        this.signUp(newUser, responseToClient);
                    }
                }
            };
            (0, poolConnectionDB_1.default)(sqlRequest, null, compareLogin);
        },
        signUp(newUser, responseToClient) {
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
            const sqlRequest = `
        INSERT INTO 
          users(${sqlColumnNames}) 
        VALUES 
          (${sqlColumnsTemplates_1.sqlColumnsTemplates.sqlInsertSynthax(sqlColumnNames)});`;
            const sqlOptions = sqlColumnsTemplates_1.sqlColumnsTemplates.sqlUserColumnValues(newUser);
            const sendNewUserToDB = (response, errDB) => {
                if (errDB) {
                    console.log(errDB);
                    responseToClient
                        .status(HTTP_CODES_1.default.BAD_REQUEST_400)
                        .json("Something wrong. Resp from DB: " + errDB);
                }
                else {
                    responseToClient.status(HTTP_CODES_1.default.CREATED_201).json("User created");
                }
            };
            (0, poolConnectionDB_1.default)(sqlRequest, sqlOptions, sendNewUserToDB);
        },
        searchUsers(searchByLogin, responseToClient) {
            const sqlRequest = `SELECT * FROM users WHERE login LIKE '%${searchByLogin}%'`;
            const fetchUsers = (response, errDB) => {
                if (errDB) {
                    console.log(errDB);
                    responseToClient
                        .status(HTTP_CODES_1.default.BAD_REQUEST_400)
                        .json("Something wrong. Resp from DB: " + errDB);
                }
                else {
                    responseToClient.json(response);
                }
            };
            (0, poolConnectionDB_1.default)(sqlRequest, null, fetchUsers);
        },
    },
    messages: {
        getAllMessages(fetchTarget, responseToClient) {
            const sqlRequest = `
      SELECT * FROM ${fetchTarget} 
      ORDER BY dateFull ASC`;
            const fetchMessages = (response, errDB) => {
                if (errDB) {
                    console.log(errDB);
                    responseToClient
                        .status(HTTP_CODES_1.default.BAD_REQUEST_400)
                        .json("Something wrong. Resp from DB: " + errDB);
                }
                else {
                    responseToClient.json(response);
                }
            };
            (0, poolConnectionDB_1.default)(sqlRequest, null, fetchMessages);
        },
        sendNewMessage(flag, newMessage, responseToClient) {
            const sqlColumnNames = [
                "id",
                "dateHh",
                "dateMm",
                "dateSs",
                "dateFull",
                "userID",
                "user",
                "messageBody",
                "deletedText",
                "isDeleted",
                "wasDeleted",
                "likes",
            ];
            const sqlRequest = `
      INSERT INTO 
        ${flag}(${sqlColumnNames})
      VALUES 
        (${sqlColumnsTemplates_1.sqlColumnsTemplates.sqlInsertSynthax(sqlColumnNames)});`;
            const sqlOptions = sqlColumnsTemplates_1.sqlColumnsTemplates.sqlMessagesColumnValues(newMessage);
            const sendNewMessageToDB = (response, errDB) => {
                if (errDB) {
                    console.log(errDB);
                    responseToClient
                        .status(HTTP_CODES_1.default.BAD_REQUEST_400)
                        .json("Something wrong. Resp from DB: " + errDB);
                }
                else {
                    responseToClient.json(newMessage);
                }
            };
            (0, poolConnectionDB_1.default)(sqlRequest, sqlOptions, sendNewMessageToDB);
        },
        updateMessageMethods: {
            // This func is used below in the three updates: delete, return, like
            updateMessage(sqlRequest, responseToClient) {
                const updateFunc = (response, errDB) => {
                    if (errDB) {
                        console.log(errDB);
                        responseToClient
                            .status(HTTP_CODES_1.default.BAD_REQUEST_400)
                            .json("Something wrong. Resp from DB: " + errDB);
                    }
                    else {
                        responseToClient.json(response);
                    }
                };
                (0, poolConnectionDB_1.default)(sqlRequest, null, updateFunc);
            },
            deleteMessage(id, target, textContainer, responseToClient) {
                const sqlRequest = `UPDATE ${target} 
        SET deletedText = '${textContainer}',
          messageBody = "Message has been deleted by moderator",
          wasDeleted = 1,
          isDeleted = 1
        WHERE id = '${id}'`;
                this.updateMessage(sqlRequest, responseToClient);
            },
            returnMessage(id, target, textContainer, responseToClient) {
                const sqlRequest = `UPDATE ${target} 
        SET messageBody = '${textContainer}',
          isDeleted = 0
        WHERE id = '${id}'`;
                this.updateMessage(sqlRequest, responseToClient);
            },
            likeMessage(id, user, target, responseToClient) {
                const sqlRequest_checkIfLiked = `SELECT * FROM likes
        WHERE messageID = '${id}' AND userLogin = '${user}'`;
                (0, poolConnectionDB_1.default)(sqlRequest_checkIfLiked, null, (resp) => {
                    if (!resp[0]) {
                        const sqlRequest_updateLikes = `INSERT INTO likes(id, messageID, userLogin)
            VALUES('${(0, uuid_1.v4)()}', '${id}', '${user}')`;
                        (0, poolConnectionDB_1.default)(sqlRequest_updateLikes, null, (response, errDB) => {
                            // response handler
                        });
                        const sqlRequest_updateMessage = `UPDATE ${target}
            SET likes = likes + 1
            WHERE id = '${id}'`;
                        this.updateMessage(sqlRequest_updateMessage, responseToClient);
                    }
                    else {
                        const sqlRequest_updateLikes = `DELETE FROM likes
            WHERE messageID = '${id}' AND userLogin = '${user}'`;
                        (0, poolConnectionDB_1.default)(sqlRequest_updateLikes, null, (response, errDB) => {
                            // response handler
                        });
                        const sqlRequest_updateMessage = `UPDATE ${target}
            SET likes = likes - 1
            WHERE id = '${id}'`;
                        this.updateMessage(sqlRequest_updateMessage, responseToClient);
                    }
                });
            },
        },
    },
};
exports.default = sqlAPI;
