"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const createNewMessage = (flag, userID, userLogin, messageInput) => {
    const date = new Date();
    function dateTransform(dateValue) {
        return ((dateValue < 10 ? "0" : "") + dateValue).toString();
    }
    let newMessage = {
        id: (0, uuid_1.v4)(),
        dateHh: dateTransform(date.getHours()),
        dateMm: dateTransform(date.getMinutes()),
        dateFull: date.toString(),
        userID: userID,
        user: userLogin,
        messageBody: messageInput,
        deletedText: "",
        wasDeleted: false,
        likes: null,
    };
    // Setting likes only for disputeMessages
    if (flag.search(/^[d]/) === 0)
        newMessage.likes = 0;
    return newMessage;
};
exports.default = createNewMessage;
