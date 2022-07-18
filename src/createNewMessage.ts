import { v4 as uuidv4 } from "uuid";
import * as Types from "./types/types";

const createNewMessage: Types.NewMessageFactory = (
  flag,
  userID,
  userLogin,
  messageInput
) => {
  const date: Date = new Date();
  let newMessage: Types.NewMessage = {
    id: flag + "_" + uuidv4(),
    dateHh: date.getHours(),
    dateMm: date.getMinutes(),
    dateSs: date.getSeconds(),
    dateFull: +date,
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
