import type { Socket } from "socket.io";
import type { PlayerInfoDTO } from "models/DTOs/signup";

export type PoolId = string;
export type PlayerId = string;
export type GameSessionId = string;

export const enum GAME_STATE {
    END,
    START,
    PAUSED,
    PLAYING,
};

export const enum EPLAY_ITEM {
    EMPTY = "empty",
    CHECK = "check",
    CIRCLE = "circle"
};

export const enum EGAME_RESULT {
    NONE = "none",
    WON = "won",
    DRAW = "draw"
};

export type Player = {
    username: string,
    playerId: PlayerId,
}

export type GameRequestPlayer = Player & {
    boardSize: number,
}

export type PlayerWithSocket = Player & {
    playerSocket: Socket,
}

export type ReconnectionRequestType = {
    playerId: PlayerId,
    gameSessionId: string,
    otherPlayerUsername: string,
}

export type BoardUpdateServer = {
    playerId: PlayerId,
    coords: BoardCoords,
    gameSessionId: GameSessionId,
}

export type BoardUpdateClient = Omit<BoardUpdateServer, "playerId" | "gameSessionId"> & {
    playerTurn: PlayerId,
    playItem: EPLAY_ITEM,
}

export type RequesteePlayer = Omit<Player, "playerSocket">;

export type MultiPlayerConfig = Omit<RequesteePlayer, "username"> & {
    playItem: EPLAY_ITEM,
}

export type MultiPlayerGameInfo = {
    boardSize: number,
    board: EPLAY_ITEM[][],
    playerTurnId: PlayerId,
    playersItems: MultiPlayerItemMap[],
}

export type MultiPlayerItemMap = {
    [playerId: string]: EPLAY_ITEM,
}

// export type GameSessionInfo = MultiPlayerGameInfo & {
// }

export type ServerResponse<T> = {
    status: number,
    payload: T,
};

export type AcceptedJwtTypes = string | Buffer | object;

export type JwtPayload = {
    createdAt: string,
    usernameOrEmail: string,
}

export type ClientRequest<T> = {
    payload: T,
    token?: string,
}

export type LoginSuccessPayload = {
    playerInfo: PlayerInfoDTO,
    token: string,
}

export class RuntimeError extends Error {
    statusCode: number | undefined;
    constructor(errorMsg: string, statusCode?: number) {
        super();
        this.message = errorMsg;
        this.statusCode = statusCode;
    }
}

export type BoardCoords = {
    x: number,
    y: number
}

export type MGameData = {
    coords: BoardCoords,
    playerId: PlayerId,
    gameSessionId: string,
}

export type MultiPlayerSessionConfig = {
    boardSize: number
    playerTurn: PlayerId,
    gameSessionId: GameSessionId,
    otherPlayerUsername: string,
}

export type VerificationCredential = {
    otp: number,
    sessionId: string,
}

export type RateLimit = {
    lastVisit: string,
    visitCount: number,
}