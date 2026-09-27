import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:5000", {
      transports: ["websocket", "polling"],
      auth: { token: localStorage.getItem("token") },
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join_room", `user_${user.id}`);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const joinRoom = (room) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("join_room", room);
    } else {
      console.log("[Socket] Not connected yet, joining room on connect:", room);
      socketRef.current?.once("connect", () => {
        socketRef.current?.emit("join_room", room);
      });
    }
  };

  const sendMessage = (data) => {
    if (!socketRef.current?.connected) {
      console.log("[Socket] Not connected, cannot send message");
      return;
    }
    socketRef.current?.emit("send_message", data);
  };

  const sendTyping = (data) => {
    socketRef.current?.emit("typing", data);
  };

  const stopTyping = (data) => {
    socketRef.current?.emit("stop_typing", data);
  };

  const sendNotification = (data) => {
    socketRef.current?.emit("notification", data);
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        joinRoom,
        sendMessage,
        sendTyping,
        stopTyping,
        sendNotification,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);