"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const mainRoles = ["admin", "user"];
const tempRoles = [
    "admin",
    "moderator",
    "participant ",
    "spectator",
];
const createNewUser = (userData) => {
    const newUser = {
        id: (0, uuid_1.v4)(),
        role: mainRoles[1],
        tempRole: tempRoles[3],
        login: userData.login,
        password: userData.password,
        name: "",
        surname: "",
        email: userData.email,
        location: "",
        occupation: "",
        rating: {
            disputesWin: 0,
            disputesLose: 0,
            disputesRatio: 0,
        },
    };
    return newUser;
};
exports.default = createNewUser;
