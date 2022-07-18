"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HTTP_CODES_1 = __importDefault(require("./HTTP_CODES"));
const sqlColumnsTemplates_1 = require("./sqlColumnsTemplates");
const poolConnectionDB_1 = __importDefault(require("./poolConnectionDB"));
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
                    responseToClient.status(HTTP_CODES_1.default.OK_200).json(response);
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
                    responseToClient.status(HTTP_CODES_1.default.OK_200).json(newMessage);
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
                        responseToClient.status(HTTP_CODES_1.default.OK_200).json(response);
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
            likeMessage(id, target, responseToClient) {
                const sqlRequest = `UPDATE ${target} 
        SET likes = likes + 1 
        WHERE id = '${id}'`;
                this.updateMessage(sqlRequest, responseToClient);
            },
        },
    },
};
exports.default = sqlAPI;
