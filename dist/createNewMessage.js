"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const createNewMessage = (flag, userID, userLogin, messageInput) => {
    const date = new Date();
    let newMessage = {
        id: flag + "_" + (0, uuid_1.v4)(),
        dateHh: date.getHours(),
        dateMm: date.getMinutes(),
        dateSs: date.getSeconds(),
        dateMs: date.getMilliseconds(),
        dateFull: date.toString(),
        userID: userID,
        user: userLogin,
        messageBody: messageInput,
        deletedText: "",
        isDeleted: false,
        wasDeleted: false,
        likes: null,
    };
    // Setting likes only for disputeMessages
    if (flag.search(/^[d]/) === 0)
        newMessage.likes = 0;
    return newMessage;
};
exports.default = createNewMessage;
