import { io } from "socket.io-client";

export const socket = io(
  "http://localhost:8000",
  //"ws://localhost:8000/socket.io/?EIO=3&transport=websocket",
  {
    forceNew: true,
    reconnection: true,
  }
);
