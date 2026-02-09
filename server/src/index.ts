import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "node:crypto";

interface User {
  id: string;
  name: string;
  ws: WebSocket;
  typing: boolean;
}

const users: User[] = [];

const wss = new WebSocketServer({ port: 8080 });

console.log("Group chat server running on ws://localhost:8080");

wss.on("connection", (ws: WebSocket) => {
  const userId = randomUUID();
  let userName = `User-${userId.slice(0, 4)}`;
  const user: User = { id: userId, name: userName, ws, typing: false };
  users.push(user);

  console.log(`${userName} connected`);

  ws.send(
    JSON.stringify({
      type: "users",
      users: users.map((u) => ({ id: u.id, name: u.name })),
    }),
  );

  ws.send(
    JSON.stringify({
      type: "info",
      user: {
        name: userName,
        id: userId,
      },
    }),
  );

  broadcast(
    { type: "user:joined", user: { id: user.id, name: user.name } },
    ws,
  );

  ws.on("message", (data) => {
    const message = data.toString();
    try {
      const parsed = JSON.parse(message);

      switch (parsed.type) {
        case "message":
          broadcast({
            type: "message",
            user: { id: user.id, name: user.name },
            message: parsed.message,
            date: new Date(),
          });
          break;

        case "typing":
          user.typing = parsed.typing;
          broadcast(
            {
              type: "typing",
              user: { id: user.id, name: user.name },
              typing: user.typing,
            },
            ws,
          );
          break;

        case "setName":
          const oldName = user.name;
          user.name = parsed.name;
          userName = parsed.name;
          broadcast({
            type: "user:rename",
            user: { id: user.id, oldName, newName: user.name },
          });
          break;
      }
    } catch (err) {
      console.error("Invalid message", message);
    }
  });

  ws.on("close", () => {
    console.log(`${userName} disconnected`);
    users.splice(users.indexOf(user), 1);
    broadcast({ type: "user:left", user: { id: user.id, name: user.name } });
  });
});

function broadcast(payload: any, excludeWs?: WebSocket) {
  const data = JSON.stringify(payload);
  users.forEach((u) => {
    if (u.ws.readyState === WebSocket.OPEN && u.ws !== excludeWs) {
      u.ws.send(data);
    }
  });
}
