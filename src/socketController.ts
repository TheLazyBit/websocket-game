import {
  createPlayer,
  GAME_STATE,
  getGameState,
  removePlayer,
  getWaitingTime,
  getWhoWon,
} from "./gameController";
import { getGameMap } from "./mapController";
import { Server, Socket } from "socket.io";
import { LIMIT_IP, GAME_LENGTH } from "./constants";

let io;
const controlsMap = {};
const playerSocketMap = {};
const ipSet = new Set<string>();
const socketMap = {};

export const getControlsForPlayer = (playerId: string) => {
  return controlsMap[playerId] ?? {};
};

export const emitPlayers = (players: any) => {
  io.emit("players", players);
};

export const emitGameState = (gameState: GAME_STATE) => {
  io.emit("gameState", gameState);
};

export const emitMidGameTime = (time: number) => {
  io.emit("waitingTime", time);
};

export const emitWonMessage = (message: string) => {
  io.emit("wonMessage", message);
};

export const emitTimeLeft = (time: number) => {
  io.emit("timeLeft", time);
};

export const startSocketController = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connect", (socket: Socket) => {
    console.log("a user connected");

    const ipAddress = (socket.handshake.headers["x-forwarded-for"] ??
      socket.handshake.headers["x-real-ip"] ??
      socket.handshake.address) as string;

    if (LIMIT_IP && ipSet.has(ipAddress)) {
      socket.disconnect();
      return;
    }
    ipSet.add(ipAddress);

    socket.emit("map", getGameMap());
    socket.emit("gameState", getGameState());
    // socket.emit("timeLeft", getTimeLeft());
    if (getGameState() === GAME_STATE.MidGame) {
      socket.emit("waitingTime", getWaitingTime());
    }
    socket.emit("wonMessage", getWhoWon());

    const player = createPlayer(socket.id);
    playerSocketMap[socket.id] = player;
    socketMap[socket.id] = socket;

    socket.on("disconnect", () => {
      console.log("a user disconnected");
      ipSet.delete(ipAddress);
      delete playerSocketMap[socket.id];
      removePlayer(socket.id);
    });

    socket.on("controls", (controls) => {
      controlsMap[socket.id] = controls;
    });
    
    socket.on("requestPingTime", (dateMs) => {
      socket.emit("ping", Date.now() - dateMs);
    });
  });
};
