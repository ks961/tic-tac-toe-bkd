import { hashify } from "utils";
import type { Server, Socket } from "socket.io";
import { evaluateBoard, generateBoardNxN } from "services/board";
import { EPLAY_ITEM,
    type PlayerWithSocket, 
    type BoardUpdateClient, 
    type BoardUpdateServer, 
    type MultiPlayerItemMap,  
    type MultiPlayerGameInfo, 
    type MultiPlayerSessionConfig,
    type GameRequestPlayer,
    EGAME_RESULT,
    type BoardCoords,
    type ReconnectionRequestType, 
} from "typing/typing";
import { redisClient } from "models/redis";
import type { SessionId } from "services/Identity";

const BOARD_SIZES_KEY: string = "BOARD_SIZES";
const ONGOING_MULTIPLAYER_POOL_PREFIX = "ONGOING_MULTIPLAYER_POOL";

export async function socket(io: Server) {

    const matchingPoolMap = new Map<number, PlayerWithSocket[]>();
    await redisClient.set(BOARD_SIZES_KEY, JSON.stringify([]));

    io.on("connection", (socket: Socket) => {

        // socket.on("game-session-re-connect", async(data) => {
        //     const connreq: ReconnectionRequestType = data;

        //     console.log("here");
            
        //     const onGoingGameSessionKey = `${ONGOING_MULTIPLAYER_POOL_PREFIX}-${connreq.gameSessionId}`;
        //     const gameSessionStr = await redisClient.get(onGoingGameSessionKey);

        //     if(!gameSessionStr) 
        //         throw new Error("Game session not found.") // send event to close multiplayer session, since it no more exists.
        
        //     const gameSession: MultiPlayerGameInfo = JSON.parse(gameSessionStr);

        //     const gameConfig: MultiPlayerSessionConfig = {
        //         boardSize: gameSession.boardSize,
        //         playerTurn: gameSession.playerTurnId,
        //         gameSessionId: connreq.gameSessionId,
        //         otherPlayerUsername: connreq.otherPlayerUsername,
        //     }

        //     socket.join(connreq.gameSessionId);
            
        //     socket.emit("re-game-config-data", JSON.stringify(gameConfig));
        // });
    
        socket.on("multiplayer-game-request", async(data) => {
            const requesteePlayer: GameRequestPlayer = JSON.parse(data);

            // const key = `${MATCH_POOL_PREFIX}-${requesteePlayer.boardSize}`;
            // const pool = await redisClient.get(key);
            const pool = matchingPoolMap.get(requesteePlayer.boardSize);

            const player: PlayerWithSocket = {
                playerSocket: socket,
                playerId: requesteePlayer.playerId,
                username: requesteePlayer.username,
            }
           
            if(!Array.isArray(pool) && requesteePlayer.boardSize !== 0) { // waiting..
                const newPool: PlayerWithSocket[] = [player];
                matchingPoolMap.set(requesteePlayer.boardSize, newPool);                    
                return;
            }

            if(Array.isArray(pool)) {
                const index = pool.filter(player => player.playerId === requesteePlayer.playerId);
                if(index.length > 0) {
                    matchingPoolMap.set(requesteePlayer.boardSize, pool);
                }
            }

            let secondPlayer: PlayerWithSocket;

            if(typeof pool === "undefined" && requesteePlayer.boardSize === 0) {

                const firstKey = matchingPoolMap.keys().next().value;
                const firstValuePool = matchingPoolMap.get(firstKey)!;

                secondPlayer = firstValuePool.pop()!;
            } else {
                secondPlayer = pool!.pop()!;
            }

            if(!secondPlayer)
                throw new Error("Second Player not found");

            (pool!.length > 0) ?  matchingPoolMap.set(requesteePlayer.boardSize, pool!)
                : matchingPoolMap.delete(requesteePlayer.boardSize); // cleanup
            

            const gameSessionId = hashify(`${secondPlayer.playerId}${requesteePlayer.playerId}`);

            /* Joining same room */
            socket.join(gameSessionId)
            secondPlayer.playerSocket.join(gameSessionId);

            const boardSize = requesteePlayer.boardSize;
            const board = generateBoardNxN(boardSize);

            const currentPlayerItemMap: MultiPlayerItemMap = {
                [requesteePlayer.playerId]: EPLAY_ITEM.CHECK
            }

            const secondPlayerItemMap: MultiPlayerItemMap = {
                [secondPlayer.playerId]: EPLAY_ITEM.CIRCLE,
            }

            const playerTurn = [requesteePlayer.playerId, secondPlayer.playerId][(Math.floor(Math.random() * 10)) % 2];

            const multiplayerGameInfo: MultiPlayerGameInfo = {
                board,
                boardSize,
                playerTurnId: playerTurn,
                playersItems: [currentPlayerItemMap, secondPlayerItemMap],
            }

            const onGoingGameSessionKey = `${ONGOING_MULTIPLAYER_POOL_PREFIX}-${gameSessionId}`;
            await redisClient.set(onGoingGameSessionKey, JSON.stringify(multiplayerGameInfo));

            const gameConfig: MultiPlayerSessionConfig = {
                boardSize,
                playerTurn,
                gameSessionId,
                otherPlayerUsername: requesteePlayer.username,
            }

            socket.to(secondPlayer.playerSocket.id)
            .emit("game-config-data", JSON.stringify(gameConfig));
            
            const gameConfigForRequestee: MultiPlayerSessionConfig = {
                ...gameConfig,
                otherPlayerUsername: secondPlayer.username,
            }
            
            secondPlayer.playerSocket.to(socket.id)
                .emit("game-config-data", JSON.stringify(gameConfigForRequestee));
        });

        async function handleGameWon(gameSessionId: SessionId, currentPlayerItem: EPLAY_ITEM, playerId: string, coords: BoardCoords) {
            const boardUpdateInfoForClient: BoardUpdateClient = {
                playItem: currentPlayerItem,
                playerTurn: playerId,
                coords: coords,
            }

            io.to(gameSessionId)
                .emit("board-update", JSON.stringify(boardUpdateInfoForClient));

            io.to(gameSessionId).emit("player-won", JSON.stringify({
                playerId: playerId,
            }));

            const key = `${ONGOING_MULTIPLAYER_POOL_PREFIX}-${gameSessionId}`;
            await redisClient.del(key);
        }

        async function handleGameDraw(gameSessionId: SessionId, currentPlayerItem: EPLAY_ITEM, playerId: string, coords: BoardCoords) {
            const boardUpdateInfoForClient: BoardUpdateClient = {
                playItem: currentPlayerItem,
                playerTurn: playerId,
                coords: coords,
            }

            io.to(gameSessionId)
                .emit("board-update", JSON.stringify(boardUpdateInfoForClient));

            io.to(gameSessionId).emit("game-draw");

            const key = `${ONGOING_MULTIPLAYER_POOL_PREFIX}-${gameSessionId}`;
            await redisClient.del(key)
        }
    
        socket.on("board-update", async(data) => {
            
            const boardUpdate: BoardUpdateServer = JSON.parse(data);
    
            const onGoingGameSessionKey = `${ONGOING_MULTIPLAYER_POOL_PREFIX}-${boardUpdate.gameSessionId}`;
            const gameSessionStr = await redisClient.get(onGoingGameSessionKey);

            if(!gameSessionStr) 
                throw new Error("Game session not found.") // send event to close multiplayer session, since it no more exists.
           
            const gameSession: MultiPlayerGameInfo = JSON.parse(gameSessionStr);
            const playItem: EPLAY_ITEM = gameSession.board[boardUpdate.coords.x][boardUpdate.coords.y];
            
            if(playItem !== EPLAY_ITEM.EMPTY) return; // send event saying `Illegal move`;
            if(gameSession.playerTurnId !== boardUpdate.playerId) {
                throw new Error("Player turn does match")
            }
            
            const currentPlayerItemObj = gameSession.playersItems.filter(item => item.hasOwnProperty(boardUpdate.playerId))[0];
    
            if(!currentPlayerItemObj) {
                throw new Error("Play item is not found for current player");
            }
    
            const currentPlayerItem = currentPlayerItemObj[boardUpdate.playerId];
    
            gameSession.board[boardUpdate.coords.x][boardUpdate.coords.y] = currentPlayerItem;
    
            const result = evaluateBoard(gameSession.board, gameSession.boardSize);
            
            switch(result) {
                case EGAME_RESULT.WON:
                    handleGameWon(boardUpdate.gameSessionId, currentPlayerItem, boardUpdate.playerId, {
                        x: boardUpdate.coords.x,
                        y: boardUpdate.coords.y,
                    });
                    return;
                    
                case EGAME_RESULT.DRAW:
                    handleGameDraw(boardUpdate.gameSessionId, currentPlayerItem, boardUpdate.playerId, {
                        x: boardUpdate.coords.x,
                        y: boardUpdate.coords.y,
                    });
                    return;
            }
            
            const otherPlayerId = Object.keys(gameSession.playersItems.filter(item => !item.hasOwnProperty(boardUpdate.playerId))[0])[0];
            
            gameSession.playerTurnId = otherPlayerId;
    
            const boardUpdateInfoForClient: BoardUpdateClient = {
                playItem: currentPlayerItem,
                playerTurn: otherPlayerId,
                coords: {
                    x: boardUpdate.coords.x,
                    y: boardUpdate.coords.y,
                }
            }

            await redisClient.set(onGoingGameSessionKey, JSON.stringify(gameSession));
            
            io.to(boardUpdate.gameSessionId)
                .emit("board-update", JSON.stringify(boardUpdateInfoForClient));
        });
    })
}