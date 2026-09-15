import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ORIGIN } from "../../config/api";

export type ViewCountUpdatedPayload = {
  videoId: string;
  views: number;
};

let socket: Socket | null = null;

export async function getViewSocket() {
  const token = await AsyncStorage.getItem("token");
  if (!token) return null;

  if (!socket) {
    socket = io(API_ORIGIN, {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
    });
  }

  if (!socket.connected) socket.connect();
  return socket;
}

export function closeViewSocket() {
  socket?.disconnect();
  socket = null;
}
