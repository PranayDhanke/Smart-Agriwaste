import { Chat } from "@/components/types/chats";
import mongoose, { Schema } from "mongoose";


const messsageSchema = new Schema<Chat>({
  messageId: { type: String, required: true },
  message: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
});

const Messages = mongoose.models.Messages || mongoose.model("Messages", messsageSchema);

export default Messages;