import React, { useState, useCallback, useRef } from 'react';
import type { BoardType, Position, Player } from '../utils/constants';
import {
    initializeBoard,
    getSafeMoves,
    movePiece,
    getPieceOwner,
    isInCheck,
    isCheckmate
} from '../utils/gameLogic';
import Board from './Board';
import './Game.css';

interface Move {
    from: Position;
    to: Position;
    piece: string;
    captured: string | null;
}

interface AnimatingPiece {
    piece: string;
    from: Position;
    to: Position;
}

const Game: React.FC = () => {
    const [board, setBoard] = useState<BoardType>(initializeBoard);
    const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
    const [selectedPos, setSelectedPos] = useState<Position | null>(null);
    const [validMoves, setValidMoves] = useState<Position[]>([]);
    const [moveHistory, setMoveHistory] = useState<Move[]>([]);
    const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
    const [gameStatus, setGameStatus] = useState<'playing' | 'red_win' | 'black_win'>('playing');
    const [animatingPiece, setAnimatingPiece] = useState<AnimatingPiece | null>(null);
    const isAnimating = useRef(false);

    const handleCellClick = useCallback((row: number, col: number) => {
        if (gameStatus !== 'playing' || isAnimating.current) return;

        const clickedPiece = board[row][col];

        if (selectedPos) {
            const [selectedRow, selectedCol] = selectedPos;
            const isValidDestination = validMoves.some(([r, c]) => r === row && c === col);

            if (isValidDestination) {
                const movingPiece = board[selectedRow][selectedCol]!;
                const capturedPiece = board[row][col];

                // Update lastMove and history immediately (so green dot appears right away)
                setLastMove({ from: selectedPos, to: [row, col] });
                setMoveHistory(prev => [...prev, {
                    from: selectedPos,
                    to: [row, col],
                    piece: movingPiece,
                    captured: capturedPiece
                }]);

                // Start animation
                isAnimating.current = true;
                setAnimatingPiece({
                    piece: movingPiece,
                    from: selectedPos,
                    to: [row, col]
                });

                // Create intermediate board (remove piece from source, remove captured piece)
                const tempBoard = board.map(r => [...r]);
                tempBoard[selectedRow][selectedCol] = null;
                tempBoard[row][col] = null; // Also remove captured piece so animation looks cleaner
                setBoard(tempBoard);
                setSelectedPos(null);
                setValidMoves([]);

                // After animation completes, update final board state
                setTimeout(() => {
                    const newBoard = movePiece(board, selectedPos, [row, col]);
                    setBoard(newBoard);
                    setAnimatingPiece(null);
                    isAnimating.current = false;

                    const nextPlayer = currentPlayer === 'red' ? 'black' : 'red';

                    if (isCheckmate(newBoard, nextPlayer)) {
                        setGameStatus(currentPlayer === 'red' ? 'red_win' : 'black_win');
                    } else {
                        setCurrentPlayer(nextPlayer);
                    }
                }, 350); // Animation duration

                return;
            }

            if (clickedPiece && getPieceOwner(clickedPiece) === currentPlayer) {
                setSelectedPos([row, col]);
                setValidMoves(getSafeMoves(board, [row, col], currentPlayer));
                return;
            }

            setSelectedPos(null);
            setValidMoves([]);
            return;
        }

        if (clickedPiece && getPieceOwner(clickedPiece) === currentPlayer) {
            setSelectedPos([row, col]);
            setValidMoves(getSafeMoves(board, [row, col], currentPlayer));
        }
    }, [board, selectedPos, validMoves, currentPlayer, gameStatus]);

    const handleNewGame = () => {
        setBoard(initializeBoard());
        setCurrentPlayer('red');
        setSelectedPos(null);
        setValidMoves([]);
        setMoveHistory([]);
        setLastMove(null);
        setGameStatus('playing');
        setAnimatingPiece(null);
    };

    const handleUndo = () => {
        if (moveHistory.length === 0 || isAnimating.current) return;

        const lastMoveRecord = moveHistory[moveHistory.length - 1];
        const newBoard = board.map(row => [...row]);

        newBoard[lastMoveRecord.from[0]][lastMoveRecord.from[1]] = lastMoveRecord.piece;
        newBoard[lastMoveRecord.to[0]][lastMoveRecord.to[1]] = lastMoveRecord.captured;

        setBoard(newBoard);
        setMoveHistory(prev => prev.slice(0, -1));
        setCurrentPlayer(currentPlayer === 'red' ? 'black' : 'red');
        setSelectedPos(null);
        setValidMoves([]);
        setGameStatus('playing');

        if (moveHistory.length > 1) {
            const prevMove = moveHistory[moveHistory.length - 2];
            setLastMove({ from: prevMove.from, to: prevMove.to });
        } else {
            setLastMove(null);
        }
    };

    const isRedInCheck = isInCheck(board, 'red');
    const isBlackInCheck = isInCheck(board, 'black');

    return (
        <div className="game">
            <div className="game-layout">
                {/* Left panel - Red player */}
                <div className="player-panel left">
                    <div className={`player-indicator red ${currentPlayer === 'red' ? 'active' : ''}`}>
                        <div className="player-label">Quân Đỏ</div>
                        <div className="player-name">🔴 Đỏ</div>
                        {isRedInCheck && gameStatus === 'playing' && currentPlayer === 'red' && (
                            <div className="check-warning">⚠️ Chiếu!</div>
                        )}
                    </div>

                    <div className="game-controls">
                        <button className="control-btn new-game" onClick={handleNewGame}>
                            🔄 Ván mới
                        </button>
                        <button
                            className="control-btn undo"
                            onClick={handleUndo}
                            disabled={moveHistory.length === 0}
                        >
                            ↩️ Đi lại
                        </button>
                    </div>

                    <div className="move-counter">
                        Nước: {moveHistory.length}
                    </div>
                </div>

                {/* Center - Board */}
                <div className="board-wrapper">
                    {gameStatus !== 'playing' && (
                        <div className="game-over-banner">
                            <span className="winner-text">
                                {gameStatus === 'red_win' ? '🏆 Đỏ thắng!' : '🏆 Đen thắng!'}
                            </span>
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
                    />
                </div>

                {/* Right panel - Black player */}
                <div className="player-panel right">
                    <div className={`player-indicator black ${currentPlayer === 'black' ? 'active' : ''}`}>
                        <div className="player-label">Quân Đen</div>
                        <div className="player-name">⚫ Đen</div>
                        {isBlackInCheck && gameStatus === 'playing' && currentPlayer === 'black' && (
                            <div className="check-warning">⚠️ Chiếu!</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Game;
