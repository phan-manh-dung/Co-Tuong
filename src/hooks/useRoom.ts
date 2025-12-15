import { useState, useEffect, useCallback } from 'react';
import { database, createRoomRef, createGameRef, set, onValue, update, remove } from '../firebase';
import { ref } from 'firebase/database';
import type { BoardType, Player, Position } from '../utils/constants';
import { INITIAL_BOARD } from '../utils/constants';

export interface RoomData {
    roomId: string;
    status: 'waiting' | 'playing' | 'finished';
    players: {
        red?: { name: string; joinedAt: number };
        black?: { name: string; joinedAt: number };
    };
    game: GameState;
    createdAt: number;
}

export interface GameState {
    board: BoardType;
    currentPlayer: Player;
    lastMove: { from: Position; to: Position } | null;
    winner: Player | null;
}

interface UseRoomReturn {
    roomId: string | null;
    roomData: RoomData | null;
    playerColor: Player | null;
    isLoading: boolean;
    error: string | null;
    createRoom: (playerName: string) => Promise<string>;
    joinRoom: (roomId: string, playerName: string) => Promise<boolean>;
    leaveRoom: () => Promise<void>;
    makeMove: (from: Position, to: Position, newBoard: BoardType, nextPlayer: Player, winner?: Player) => Promise<void>;
    resetGame: () => Promise<void>;
}

// Generate 6-character room code
const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

export const useRoom = (): UseRoomReturn => {
    const [roomId, setRoomId] = useState<string | null>(null);
    const [roomData, setRoomData] = useState<RoomData | null>(null);
    const [playerColor, setPlayerColor] = useState<Player | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Parse board from JSON string (stored as string to preserve array format)
    const parseBoard = (boardData: unknown): BoardType => {
        if (!boardData) return INITIAL_BOARD;

        // If it's a string, parse it
        if (typeof boardData === 'string') {
            try {
                return JSON.parse(boardData) as BoardType;
            } catch {
                return INITIAL_BOARD;
            }
        }

        // Fallback: try to use as-is if it's an array
        if (Array.isArray(boardData) && boardData.length === 10) {
            const isValid = boardData.every(row => Array.isArray(row) && row.length === 9);
            if (isValid) return boardData as BoardType;
        }

        return INITIAL_BOARD;
    };

    // Subscribe to room changes
    useEffect(() => {
        if (!roomId) return;

        const roomRef = createRoomRef(roomId);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();

                // Convert lastMove from Firebase format
                let lastMove: { from: Position; to: Position } | null = null;
                if (data.game?.lastMove) {
                    const lm = data.game.lastMove;
                    lastMove = {
                        from: Array.isArray(lm.from) ? lm.from : [lm.from?.[0] || 0, lm.from?.[1] || 0],
                        to: Array.isArray(lm.to) ? lm.to : [lm.to?.[0] || 0, lm.to?.[1] || 0]
                    };
                }

                // Convert board from Firebase format
                const roomData: RoomData = {
                    roomId,
                    status: data.status,
                    players: data.players || {},
                    game: {
                        board: parseBoard(data.game?.boardJson || data.game?.board),
                        currentPlayer: data.game?.currentPlayer || 'red',
                        lastMove: lastMove,
                        winner: data.game?.winner || null
                    },
                    createdAt: data.createdAt
                };
                setRoomData(roomData);
            } else {
                setRoomData(null);
                setError('Room not found or deleted');
            }
        });

        return () => unsubscribe();
    }, [roomId]);

    // Create a new room
    const createRoom = useCallback(async (playerName: string): Promise<string> => {
        setIsLoading(true);
        setError(null);

        try {
            const newRoomId = generateRoomCode();
            const roomRef = createRoomRef(newRoomId);

            // Store board as JSON string to preserve array format
            const initialGameData = {
                status: 'waiting',
                players: {
                    red: { name: playerName, joinedAt: Date.now() }
                },
                game: {
                    boardJson: JSON.stringify(INITIAL_BOARD),
                    currentPlayer: 'red',
                    lastMove: null,
                    winner: null
                },
                createdAt: Date.now()
            };

            await set(roomRef, initialGameData);
            setRoomId(newRoomId);
            setPlayerColor('red');
            setIsLoading(false);
            return newRoomId;
        } catch (err) {
            setError('Failed to create room');
            setIsLoading(false);
            throw err;
        }
    }, []);

    // Join an existing room
    const joinRoom = useCallback(async (joinRoomId: string, playerName: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const roomRef = createRoomRef(joinRoomId);

            // Check if room exists and has space
            return new Promise((resolve) => {
                onValue(roomRef, async (snapshot) => {
                    if (!snapshot.exists()) {
                        setError('Room not found');
                        setIsLoading(false);
                        resolve(false);
                        return;
                    }

                    const data = snapshot.val() as Omit<RoomData, 'roomId'>;

                    if (data.players.black) {
                        setError('Room is full');
                        setIsLoading(false);
                        resolve(false);
                        return;
                    }

                    // Join as black player
                    await update(roomRef, {
                        'players/black': { name: playerName, joinedAt: Date.now() },
                        status: 'playing'
                    });

                    setRoomId(joinRoomId);
                    setPlayerColor('black');
                    setIsLoading(false);
                    resolve(true);
                }, { onlyOnce: true });
            });
        } catch (err) {
            setError('Failed to join room');
            setIsLoading(false);
            return false;
        }
    }, []);

    // Leave room
    const leaveRoom = useCallback(async (): Promise<void> => {
        if (!roomId || !playerColor) return;

        try {
            const roomRef = createRoomRef(roomId);

            if (playerColor === 'red') {
                // Host leaves - delete room
                await remove(roomRef);
            } else {
                // Guest leaves - update room
                await update(roomRef, {
                    'players/black': null,
                    status: 'waiting'
                });
            }

            setRoomId(null);
            setRoomData(null);
            setPlayerColor(null);
        } catch (err) {
            setError('Failed to leave room');
        }
    }, [roomId, playerColor]);

    // Make a move
    const makeMove = useCallback(async (
        from: Position,
        to: Position,
        newBoard: BoardType,
        nextPlayer: Player,
        winner?: Player
    ): Promise<void> => {
        if (!roomId) return;

        const gameRef = createGameRef(roomId);
        const roomRef = createRoomRef(roomId);

        const updates = {
            boardJson: JSON.stringify(newBoard),
            currentPlayer: nextPlayer,
            lastMove: { from, to }
        };

        if (winner) {
            await update(gameRef, { ...updates, winner });
            await update(roomRef, { status: 'finished' });
        } else {
            await update(gameRef, updates);
        }
    }, [roomId]);

    // Reset game
    const resetGame = useCallback(async (): Promise<void> => {
        if (!roomId) return;

        const gameRef = createGameRef(roomId);
        const roomRef = createRoomRef(roomId);

        await update(gameRef, {
            boardJson: JSON.stringify(INITIAL_BOARD),
            currentPlayer: 'red',
            lastMove: null,
            winner: null
        });

        await update(roomRef, { status: 'playing' });
    }, [roomId]);

    return {
        roomId,
        roomData,
        playerColor,
        isLoading,
        error,
        createRoom,
        joinRoom,
        leaveRoom,
        makeMove,
        resetGame
    };
};
