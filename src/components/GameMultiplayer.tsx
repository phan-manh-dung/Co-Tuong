import React, { useState, useCallback, useRef } from 'react';
import type { BoardType, Position, Player } from '../utils/constants';
import {
    getSafeMoves,
    movePiece,
    getPieceOwner,
    isInCheck,
    isCheckmate
} from '../utils/gameLogic';
import type { RoomData } from '../hooks/useRoom';
import Board from './Board';
import './Game.css';

interface GameMultiplayerProps {
    roomData: RoomData;
    playerColor: Player;
    onMakeMove: (from: Position, to: Position, newBoard: BoardType, nextPlayer: Player, winner?: Player) => Promise<void>;
    onLeave: () => void;
    onRematch: () => void;
}

const GameMultiplayer: React.FC<GameMultiplayerProps> = ({
    roomData,
    playerColor,
    onMakeMove,
    onLeave,
    onRematch
}) => {
    const { game, players, roomId, status } = roomData;
    const { board, currentPlayer, lastMove, winner } = game;

    const [selectedPos, setSelectedPos] = useState<Position | null>(null);
    const [validMoves, setValidMoves] = useState<Position[]>([]);
    const [animatingPiece, setAnimatingPiece] = useState<{
        piece: string;
        from: Position;
        to: Position;
    } | null>(null);
    const isAnimating = useRef(false);

    const isMyTurn = currentPlayer === playerColor;

    const handleCellClick = useCallback(async (row: number, col: number) => {
        if (status !== 'playing' || !isMyTurn || isAnimating.current) return;

        const clickedPiece = board[row][col];

        if (selectedPos) {
            const [selectedRow, selectedCol] = selectedPos;
            const isValidDestination = validMoves.some(([r, c]) => r === row && c === col);

            if (isValidDestination) {
                const movingPiece = board[selectedRow][selectedCol]!;

                // Start animation - hide source piece, show moving piece
                isAnimating.current = true;
                setAnimatingPiece({
                    piece: movingPiece,
                    from: selectedPos,
                    to: [row, col]
                });

                setSelectedPos(null);
                setValidMoves([]);

                // After animation, send move to Firebase
                setTimeout(async () => {
                    const newBoard = movePiece(board, selectedPos, [row, col]);
                    const nextPlayer: Player = currentPlayer === 'red' ? 'black' : 'red';

                    let gameWinner: Player | undefined;
                    if (isCheckmate(newBoard, nextPlayer)) {
                        gameWinner = currentPlayer;
                    }

                    await onMakeMove(selectedPos, [row, col], newBoard, nextPlayer, gameWinner);

                    setAnimatingPiece(null);
                    isAnimating.current = false;
                }, 250);

                return;
            }

            if (clickedPiece && getPieceOwner(clickedPiece) === playerColor) {
                setSelectedPos([row, col]);
                setValidMoves(getSafeMoves(board, [row, col], playerColor));
                return;
            }

            setSelectedPos(null);
            setValidMoves([]);
            return;
        }

        if (clickedPiece && getPieceOwner(clickedPiece) === playerColor) {
            setSelectedPos([row, col]);
            setValidMoves(getSafeMoves(board, [row, col], playerColor));
        }
    }, [board, selectedPos, validMoves, playerColor, currentPlayer, status, isMyTurn, onMakeMove]);

    const isRedInCheck = isInCheck(board, 'red');
    const isBlackInCheck = isInCheck(board, 'black');

    const getOpponentName = () => {
        if (playerColor === 'red') {
            return players.black?.name || 'Đối thủ';
        }
        return players.red?.name || 'Đối thủ';
    };

    const getMyName = () => {
        if (playerColor === 'red') {
            return players.red?.name || 'Bạn';
        }
        return players.black?.name || 'Bạn';
    };

    return (
        <div className="game">
            <div className="game-layout">
                {/* Left panel - Red player */}
                <div className="player-panel left">
                    <div className={`player-indicator red ${currentPlayer === 'red' ? 'active' : ''}`}>
                        <div className="player-label">Quân Đỏ</div>
                        <div className="player-name">
                            🔴 {playerColor === 'red' ? `${getMyName()} (Bạn)` : getOpponentName()}
                        </div>
                        {isRedInCheck && status === 'playing' && (
                            <div className="check-warning">⚠️ Chiếu!</div>
                        )}
                    </div>

                    <div className="game-controls">
                        <div className="room-code-small">
                            Phòng: <span>{roomId}</span>
                        </div>
                        <button className="control-btn leave" onClick={onLeave}>
                            🚪 Thoát
                        </button>
                    </div>

                    {!isMyTurn && status === 'playing' && (
                        <div className="turn-indicator opponent">
                            ⏳ Đợi đối thủ...
                        </div>
                    )}
                    {isMyTurn && status === 'playing' && (
                        <div className="turn-indicator your-turn">
                            🎯 Lượt của bạn!
                        </div>
                    )}
                </div>

                {/* Center - Board */}
                <div className={`board-wrapper ${playerColor === 'black' ? 'flipped' : ''}`}>
                    {winner && (
                        <div className="game-over-banner">
                            <span className="winner-text">
                                {winner === playerColor ? '🎉 Bạn thắng!' : '😢 Bạn thua!'}
                            </span>
                            <button className="rematch-btn" onClick={onRematch}>
                                🔄 Chơi lại
                            </button>
                        </div>
                    )}

                    <Board
                        board={board}
                        selectedPos={selectedPos}
                        validMoves={validMoves}
                        currentPlayer={currentPlayer}
                        lastMove={lastMove}
                        checkedPlayer={isRedInCheck ? 'red' : (isBlackInCheck ? 'black' : null)}
                        animatingPiece={animatingPiece}
                        onCellClick={handleCellClick}
                        isFlipped={playerColor === 'black'}
                    />
                </div>

                {/* Right panel - Black player */}
                <div className="player-panel right">
                    <div className={`player-indicator black ${currentPlayer === 'black' ? 'active' : ''}`}>
                        <div className="player-label">Quân Đen</div>
                        <div className="player-name">
                            ⚫ {playerColor === 'black' ? `${getMyName()} (Bạn)` : getOpponentName()}
                        </div>
                        {isBlackInCheck && status === 'playing' && (
                            <div className="check-warning">⚠️ Chiếu!</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameMultiplayer;
