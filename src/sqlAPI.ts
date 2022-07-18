import HTTP_CODES from "./HTTP_CODES";
import { sqlColumnsTemplates } from "./sqlColumnsTemplates";
import * as Types from "./types/types";
import poolConnectionDB from "./poolConnectionDB";

const sqlAPI = {
  users: {
    signIn(compareLogin: string, userPassword: string, responseToClient: any) {
      const sqlRequest = `SELECT * FROM users WHERE login = ?`;
      const getUserFromDB = (response: any, errDB: any) => {
        if (response.length === 1) {
          const compareUser = response[0];
          const sendUser = { ...compareUser };
          // Prevent sending password in response - temp.
          delete sendUser.password;
          userPassword === compareUser.password
            ? responseToClient.status(HTTP_CODES.OK_200).json(sendUser)
            : responseToClient
                .status(HTTP_CODES.BAD_REQUEST_400)
                .json("Wrong password");
        } else
          responseToClient
            .status(HTTP_CODES.BAD_REQUEST_400)
            .json("Something wrong. Possibly user not found");
      };
      poolConnectionDB(sqlRequest, compareLogin, getUserFromDB);
    },
    signUp(newUser: any, responseToClient: any) {
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
          (${sqlColumnsTemplates.sqlInsertSynthax(sqlColumnNames)});`;
      const sqlOptions = sqlColumnsTemplates.sqlUserColumnValues(newUser);
      const sendNewUserToDB = (response: any, errDB: any) => {
        if (errDB) {
          console.log(errDB);
          responseToClient
            .status(HTTP_CODES.BAD_REQUEST_400)
            .json("Something wrong. Resp from DB: " + errDB);
        } else {
          responseToClient.status(HTTP_CODES.CREATED_201).json("User created");
        }
      };
      poolConnectionDB(sqlRequest, sqlOptions, sendNewUserToDB);
    },
  },
  messages: {
    getAllMessages(fetchTarget: string, responseToClient: any) {
      const sqlRequest = `
      SELECT * FROM ${fetchTarget} 
      ORDER BY dateFull ASC`;
      const fetchMessages = (response: any, errDB: any) => {
        if (errDB) {
          console.log(errDB);
          responseToClient
            .status(HTTP_CODES.BAD_REQUEST_400)
            .json("Something wrong. Resp from DB: " + errDB);
        } else {
          responseToClient.status(HTTP_CODES.OK_200).json(response);
        }
      };
      poolConnectionDB(sqlRequest, null, fetchMessages);
    },
    sendNewMessage(
      flag: string,
      newMessage: Types.NewMessage,
      responseToClient: any
    ) {
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
        (${sqlColumnsTemplates.sqlInsertSynthax(sqlColumnNames)});`;
      const sqlOptions =
        sqlColumnsTemplates.sqlMessagesColumnValues(newMessage);
      const sendNewMessageToDB = (response: any, errDB: any) => {
        if (errDB) {
          console.log(errDB);
          responseToClient
            .status(HTTP_CODES.BAD_REQUEST_400)
            .json("Something wrong. Resp from DB: " + errDB);
        } else {
          responseToClient.status(HTTP_CODES.OK_200).json(newMessage);
        }
      };
      poolConnectionDB(sqlRequest, sqlOptions, sendNewMessageToDB);
    },
    updateMessageMethods: {
      // This func is used below in the three updates: delete, return, like
      updateMessage(sqlRequest: string, responseToClient: any) {
        const updateFunc = (response: any, errDB: any) => {
          if (errDB) {
            console.log(errDB);
            responseToClient
              .status(HTTP_CODES.BAD_REQUEST_400)
              .json("Something wrong. Resp from DB: " + errDB);
          } else {
            responseToClient.status(HTTP_CODES.OK_200).json(response);
          }
        };
        poolConnectionDB(sqlRequest, null, updateFunc);
      },
      deleteMessage(
        id: string,
        target: string,
        textContainer: string,
        responseToClient: any
      ) {
        const sqlRequest = `UPDATE ${target} 
        SET deletedText = '${textContainer}',
          messageBody = "Message has been deleted by moderator",
          wasDeleted = 1,
          isDeleted = 1
        WHERE id = '${id}'`;
        this.updateMessage(sqlRequest, responseToClient);
      },
      returnMessage(
        id: string,
        target: string,
        textContainer: string,
        responseToClient: any
      ) {
        const sqlRequest = `UPDATE ${target} 
        SET messageBody = '${textContainer}',
          isDeleted = 0
        WHERE id = '${id}'`;
        this.updateMessage(sqlRequest, responseToClient);
      },
      likeMessage(id: string, target: string, responseToClient: any) {
        const sqlRequest = `UPDATE ${target} 
        SET likes = likes + 1 
        WHERE id = '${id}'`;
        this.updateMessage(sqlRequest, responseToClient);
      },
    },
  },
};

export default sqlAPI;
