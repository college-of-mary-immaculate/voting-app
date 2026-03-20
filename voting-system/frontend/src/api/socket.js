import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost", {
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
  }

  return socket;
};

export const emitWhenConnected = (event, data = {}) => {
  const s = getSocket();
  if (!s.connected) {
    s.once("connect", () => s.emit(event, data));
  } else {
    s.emit(event, data);
  }
};