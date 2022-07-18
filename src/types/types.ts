export interface sqlRequestsTemplates {
  sqlInsertSynthax: (arr: Array<string>) => Array<string>;
  sqlUserColumnValues: (obj: any) => Array<string>;
  sqlMessagesColumnValues: (obj: any) => Array<string>;
}

export interface UserData {
  login: string;
  password: string;
  email: string | null;
}

export interface NewUserFactory {
  (val: UserData): NewUser;
}

export interface NewUser {
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

// MESSAGES
export interface NewMessageFactory {
  (
    flag: string,
    userID: string,
    userLogin: string,
    messageInput: string
  ): NewMessage;
}

export interface NewMessage {
  id: string;
  dateHh: number;
  dateMm: number;
  dateSs: number;
  dateFull: number;
  userID: string;
  user: string;
  messageBody: string;
  deletedText: string;
  isDeleted: boolean;
  wasDeleted: boolean;
  likes: number | null;
}
