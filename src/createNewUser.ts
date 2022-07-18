import { v4 as uuidv4 } from "uuid";
import * as Types from "./types/types";

const mainRoles: Array<string> = ["admin", "user"];
const tempRoles: Array<string> = [
  "admin",
  "moderator",
  "participant ",
  "spectator",
];

const createNewUser: Types.NewUserFactory = (userData) => {
  const newUser: Types.NewUser = {
    id: uuidv4(),
    role: mainRoles[1],
    tempRole: tempRoles[3],
    login: userData.login,
    firstName: "",
    lastName: "",
    email: userData.email,
    password: userData.password,
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

export default createNewUser;
