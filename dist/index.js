"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3003;
app.use(express_1.default.json());
// Vulnerability?
app.use((0, cors_1.default)());
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
        },
    ],
};
const userRoles = ["spectator", "user", "moderator", "admin"];
let USERS = [
    {
        id: 0,
        role: userRoles[3],
        tempRole: null,
        login: "a",
        name: "jack",
        surname: "brown",
        email: "124qqqqqqvcbv@ya.ru",
        password: "1",
        location: "Russia",
        occupation: "",
        rating: {
            disputesWin: 5,
            disputesLose: 2,
            ratio() {
                return this.disputesWin / this.disputesLose;
            },
        },
    },
    {
        id: 1,
        role: userRoles[1],
        tempRole: null,
        login: "user",
        name: "sergey",
        surname: "fedunov",
        email: "testtestsvcbv@ya.ru",
        password: "1",
        location: "Russia",
        occupation: "enterpreneur",
        rating: {
            disputesWin: 5,
            disputesLose: 2,
            ratio() {
                return this.disputesWin / this.disputesLose;
            },
        },
    },
    {
        id: 2,
        role: userRoles[0],
        tempRole: "",
        login: "spec",
        password: "1",
        name: "Masha",
        surname: "Ivanova",
        email: "mashzxvnwgwe@ya.ru",
        location: "Kazakhstan",
        occupation: "baker",
        rating: {
            disputesWin: 0,
            disputesLose: 0,
            ratio() {
                return this.disputesWin / this.disputesLose;
            },
        },
    },
];
// USERS
app.post("/users/:id", (req, res) => {
    const userId = req.params.id;
    const userPassword = req.body.password;
    const user = USERS.filter((el) => {
        const compareLogin = userId.toString().toLowerCase();
        if (el.email.toString().toLowerCase() === compareLogin ||
            el.login.toString().toLowerCase() === compareLogin)
            return el;
    });
    console.log(user);
    if (user[0] && user[0].password === userPassword) {
        res.status(200).send("Success!");
    }
    else {
        res.status(401).send("Invalid Request");
    }
});
// MESSAGES
app.get("/messages/:target", (req, res) => {
    const fetchTarget = req.params.target;
    res.status(200).json(MESSAGES[fetchTarget]);
});
app.post("/messages/:target", (req, res) => {
    const newMessage = req.body;
    const pushTarget = req.params.target;
    MESSAGES[pushTarget].push(newMessage);
    res.status(200).json(MESSAGES[pushTarget]);
});
app.patch("/messages/:target/:id", (req, res) => {
    const patchTarget = req.params.target;
    const messageId = Number(req.params.id);
    const element = MESSAGES[patchTarget][messageId];
    switch (req.body.type) {
        case "delete":
            {
                if (!element.deletedText)
                    element.deletedText = element.text;
                if (!element.deleted) {
                    element.deleted = !element.deleted;
                    element.wasDeleted = true;
                }
                element.text = "Message has been deleted by moderator";
            }
            break;
        case "return":
            {
                if (element.deletedText)
                    element.text = element.deletedText;
                if (element.deleted)
                    element.deleted = !element.deleted;
            }
            break;
        case "like":
            {
                element.likes++;
            }
            break;
        default:
        //will never execute
    }
    res.status(200).json(MESSAGES[patchTarget]);
});
// app.use(express.static(path.resolve(__dirname, "/messages")));
// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "dist", "index.js"));
// });
app.listen(port, () => {
    console.log(`Example app listening to port: ${port}`);
});
