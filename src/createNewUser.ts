import { v4 as uuidv4 } from "uuid";

interface UserData {
  login: string;
  password: string;
  email: string | null;
}

interface NewUserFactory {
  (val: UserData): NewUser;
}

interface NewUser {
  id: string;
  role: string;
  tempRole: string;
  login: string;
  firstName: string;
  lastName: string;
  email: string | null;
  password: string;
  location: string;
  occupation: string;
  rating: Rating;
}

interface Rating {
  disputesWin: number;
  disputesLose: number;
  disputesRatio: number;
}
const mainRoles: Array<string> = ["admin", "user"];
const tempRoles: Array<string> = [
  "admin",
  "moderator",
  "participant ",
  "spectator",
];

const createNewUser: NewUserFactory = (userData) => {
  const newUser: NewUser = {
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
