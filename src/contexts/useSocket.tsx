import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "../api/client";
import { useQueryClient, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinProgram: (programId: string, workspaceId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinProgram: () => {},
});

export const useSocket = () => useContext(SocketContext);

let sharedSocket: Socket | null = null;

function getSocket(): Socket {
  if (!sharedSocket) {
    const socketUrl = API_BASE_URL.replace("/api/v1", "");
    sharedSocket = io(socketUrl, {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return sharedSocket;
}

let listenersBound = false;

function bindSocketListeners(socket: Socket, queryClient: QueryClient) {
  if (listenersBound) return;
  listenersBound = true;

  socket.on("vote:broadcast", (data: any) => {
    console.log("vote:broadcast event received:", data);
    if (data && data.candidate) {
      toast(`${data.candidate.name} got one vote.`, {
        position: "bottom-left",
      });

      queryClient.invalidateQueries({
        queryKey: ["votes", "program", data.candidate.program_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["candidates", "program", data.candidate.program_id],
      });
    }
  });

  socket.on("leaderboard:update", (data: any) => {
    console.log("leaderboard:update event received:", data);
    if (data && data.program_id) {
      queryClient.invalidateQueries({
        queryKey: ["votes", "program", data.program_id],
      });
    }
  });

  socket.on("program:start", (data: any) => {
    console.log("program:start event received:", data);
    if (data && data.program_id) {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["programs", data.program_id] });
    }
  });

  socket.on("program:stop", (data: any) => {
    console.log("program:stop event received:", data);
    if (data && data.program_id) {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["programs", data.program_id] });
    }
  });

  socket.on("error", (err: any) => {
    console.error("Socket.IO error event:", err);
    toast.error(err.message || "Socket error occurred");
  });
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket>(getSocket());
  const [socket, setSocket] = useState<Socket | null>(socketRef.current);
  const [isConnected, setIsConnected] = useState(socketRef.current.connected);
  const queryClient = useQueryClient();

  useEffect(() => {
    const s = socketRef.current;
    bindSocketListeners(s, queryClient);
    setSocket(s);

    const onConnect = () => {
      setIsConnected(true);
      console.log("Socket.IO connected:", s.id);
    };
    const onDisconnect = () => {
      setIsConnected(false);
      // console.log("Socket.IO disconnected");
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    // Sync state immediately in case the socket connected before this
    // mount ran (e.g. on a StrictMode remount).
    setIsConnected(s.connected);

    return () => {
      // Only remove THIS mount's connection-state listeners. Never call
      // s.disconnect() here — that's what tears down the shared session
      // out from under a sibling/remounted provider.
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
    };
  }, [queryClient]);

  const joinProgram = (programId: string, workspaceId: string) => {
    const token = localStorage.getItem("token");
    if (socket && token && programId && workspaceId) {
      socket.emit("join", {
        token,
        program_id: programId,
        workspace_id: workspaceId,
      });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinProgram }}>
      {children}
    </SocketContext.Provider>
  );
};
