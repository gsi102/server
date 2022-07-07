import { v4 as uuidv4 } from "uuid";

interface NewMessageFactory {
  (
    flag: string,
    userID: string,
    userLogin: string,
    messageInput: string,
    postfixForId: number
  ): NewMessage;
}

interface NewMessage {
  id: string;
  dateHh: string;
  dateMm: string;
  dateFull: string;
  userID: string;
  user: string;
  messageBody: string;
  deletedText: string;
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
  function dateTransform(dateValue: number): string {
    return ((dateValue < 10 ? "0" : "") + dateValue).toString();
  }
  let newMessage: NewMessage = {
    id: uuidv4(),
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
  if (flag.search(/^[d]/) === 0) newMessage.likes = 0;

  return newMessage;
};

export default createNewMessage;
