import { v4 as uuidv4 } from "uuid";

interface NewMessageFactory {
  (
    flag: string,
    userID: string,
    userLogin: string,
    messageInput: string
  ): NewMessage;
}

interface NewMessage {
  id: string;
  dateHh: number;
  dateMm: number;
  dateSs: number;
  dateMs: number;
  dateFull: string;
  userID: string;
  user: string;
  messageBody: string;
  deletedText: string;
  isDeleted: boolean;
  wasDeleted: boolean;
  likes: number | null;
}

const createNewMessage: NewMessageFactory = (
  flag,
  userID,
  userLogin,
  messageInput
) => {
  const date: Date = new Date();
  let newMessage: NewMessage = {
    id: flag + "_" + uuidv4(),
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
  if (flag.search(/^[d]/) === 0) newMessage.likes = 0;

  return newMessage;
};

export default createNewMessage;
