import { api } from "./client";

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

export interface ChatReply {
  reply: string;
}

export const chatApi = {
  send: (message: string, history: ChatTurn[]) =>
    api.post<ChatReply>("/chat", { message, history }),
};