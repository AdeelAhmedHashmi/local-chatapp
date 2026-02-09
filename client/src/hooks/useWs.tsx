import { useEffect, useRef, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

export interface User {
  id: string;
  name: string;
}

interface BaseEvent {
  type: string;
}

export interface MessageEvent extends BaseEvent {
  type: "message";
  user: User;
  message: string;
}

export interface TypingEvent extends BaseEvent {
  type: "typing";
  user: User;
  typing: boolean;
}

export interface UsersEvent extends BaseEvent {
  type: "users";
  users: Array<User>;
}

export interface UserJoinedEvent extends BaseEvent {
  type: "user:joined";
  user: User;
}

export interface UserLeftEvent extends BaseEvent {
  type: "user:left";
  user: User;
}

export interface UserRenameEvent extends BaseEvent {
  type: "user:rename";
  user: User;
  oldName: string;
  newName: string;
}

export type ServerEvent =
  | MessageEvent
  | TypingEvent
  | UsersEvent
  | UserJoinedEvent
  | UserLeftEvent
  | UserRenameEvent;

export enum DataTypes {
  MESSAGE = "message",
  USERS = "users",
  JOINED = "user:joined",
  LEFT = "user:left",
  TYPING = "typing",
  RENAME = "user:rename",
}

export function useWS(url: string) {
  const wsRef = useRef<ReconnectingWebSocket | null>(null);

  const [messages, setMessages] = useState<Array<MessageEvent>>([]);
  const [users, setUsers] = useState<Array<User>>([]);
  const [typingUsers, setTypingUsers] = useState<Array<User>>([]);

  useEffect(() => {
    const ws = new ReconnectingWebSocket(url, [], {
      maxRetries: 10,
      reconnectionDelayGrowFactor: 2000,
    });
    wsRef.current = ws;

    ws.addEventListener("open", () => console.log("WS connected"));

    ws.addEventListener("message", (event) => {
      const data: ServerEvent = JSON.parse(event.data);

      switch (data.type) {
        case DataTypes.MESSAGE:
          setMessages((prev) => [...prev, data]);
          break;

        case DataTypes.USERS:
          setUsers(data.users)
          break;

        case DataTypes.JOINED:
          setUsers((prev) => [...prev, data.user]);
          break;

        case DataTypes.LEFT:
          setUsers((prev) => prev.filter((u) => u.id !== data.user.id));
          break;

        case DataTypes.TYPING:
          if (data.typing) {
            setTypingUsers((prev) => [
              ...prev.filter((u) => u.id !== data.user.id),
              data.user,
            ]);
          } else {
            setTypingUsers((prev) =>
              prev.filter((u) => u.id !== data.user.id)
            );
          }
          break;

        case DataTypes.RENAME:
          setUsers((prev) =>
            prev.map((u) =>
              u.id === data.user.id ? { ...u, name: data.newName } : u
            )
          );
          break;
      }
    });

    ws.addEventListener("close", () => console.log("WS disconnected"));
    ws.addEventListener("error", (err) => console.error("WS error:", err));

    return () => ws.close();
  }, [url]);

  const sendMessage = (message: string) => {
    wsRef.current?.send(JSON.stringify({ type: DataTypes.MESSAGE, message }));
  };

  const setTyping = (typing: boolean) => {
    wsRef.current?.send(JSON.stringify({ type: DataTypes.TYPING, typing }));
  };

  const setName = (name: string) => {
    wsRef.current?.send(JSON.stringify({ type: "setName", name }));
  };

  return { messages, users, typingUsers, sendMessage, setTyping, setName };
}
