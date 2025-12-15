import React from 'react';
import type { BoardType, Position, Player } from '../utils/constants';
import { getPieceOwner } from '../utils/gameLogic';
import { motion, AnimatePresence } from 'framer-motion';
import Piece from './Piece';
import './Board.css';

interface AnimatingPiece {
    piece: string;
    from: Position;
    to: Position;
}

interface BoardProps {
    board: BoardType;
    selectedPos: Position | null;
    validMoves: Position[];
    currentPlayer: Player;
    lastMove: { from: Position; to: Position } | null;
    checkedPlayer: Player | null;
    animatingPiece: AnimatingPiece | null;
    onCellClick: (row: number, col: number) => void;
    isFlipped?: boolean;
}

// Fixed pixel sizes matching CSS variables
const CELL_SIZE = 52;
const PADDING = 16;

const Board: React.FC<BoardProps> = ({
    board,
    selectedPos,
    validMoves,
    currentPlayer,
    lastMove,
    checkedPlayer,
    animatingPiece,
    onCellClick,
    isFlipped = false,
}) => {
    const isValidMove = (row: number, col: number): boolean => {
        return validMoves.some(([r, c]) => r === row && c === col);
    };

    const isSelected = (row: number, col: number): boolean => {
        return selectedPos !== null && selectedPos[0] === row && selectedPos[1] === col;
    };

    const isLastMoveFrom = (row: number, col: number): boolean => {
        if (!lastMove) return false;
        return lastMove.from[0] === row && lastMove.from[1] === col;
    };

    const isLastMoveTo = (row: number, col: number): boolean => {
        if (!lastMove) return false;
        return lastMove.to[0] === row && lastMove.to[1] === col;
    };

    const canClickPiece = (piece: string | null): boolean => {
        if (!piece) return false;
        return getPieceOwner(piece) === currentPlayer;
    };

    const isGeneralInCheck = (piece: string | null): boolean => {
        if (!piece || !checkedPlayer) return false;
        const isGeneral = piece.toUpperCase() === 'K';
        const owner = getPieceOwner(piece);
        return isGeneral && owner === checkedPlayer;
    };

    return (
        <div className="board-container">
            <div className={`board ${isFlipped ? 'flipped' : ''}`}>
                {/* River text */}
                <div className="river-text river-text-left">楚 河</div>
                <div className="river-text river-text-right">漢 界</div>

                {/* Board grid */}
                <div className="board-grid">
                    {board.flatMap((row, rowIndex) =>
                        row.map((piece, colIndex) => {
                            // Hide piece at source position during animation
                            const isAnimatingFrom = animatingPiece &&
                                animatingPiece.from[0] === rowIndex &&
                                animatingPiece.from[1] === colIndex;

                            return (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`cell 
                                        ${isValidMove(rowIndex, colIndex) ? 'valid-move' : ''} 
                                        ${isLastMoveFrom(rowIndex, colIndex) ? 'last-move-from' : ''}
                                        ${isLastMoveTo(rowIndex, colIndex) ? 'last-move-to' : ''}
                                    `}
                                    onClick={() => onCellClick(rowIndex, colIndex)}
                                >
                                    {piece && !isAnimatingFrom && (
                                        <Piece
                                            piece={piece}
                                            isSelected={isSelected(rowIndex, colIndex)}
                                            isInCheck={isGeneralInCheck(piece)}
                                            onClick={() => onCellClick(rowIndex, colIndex)}
                                        />
                                    )}
                                    {isValidMove(rowIndex, colIndex) && !piece && (
                                        <div className="move-indicator" />
                                    )}
                                    {isValidMove(rowIndex, colIndex) && piece && !canClickPiece(piece) && (
                                        <div className="capture-indicator" />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Animating piece overlay */}
                <AnimatePresence>
                    {animatingPiece && (
                        <motion.div
                            className="animating-piece"
                            initial={{
                                left: PADDING + animatingPiece.from[1] * CELL_SIZE + CELL_SIZE / 2,
                                top: PADDING + animatingPiece.from[0] * CELL_SIZE + CELL_SIZE / 2,
                                x: '-50%',
                                y: '-50%',
                            }}
                            animate={{
                                left: PADDING + animatingPiece.to[1] * CELL_SIZE + CELL_SIZE / 2,
                                top: PADDING + animatingPiece.to[0] * CELL_SIZE + CELL_SIZE / 2,
                                x: '-50%',
                                y: '-50%',
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                        >
                            <Piece
                                piece={animatingPiece.piece}
                                isSelected={false}
                                isInCheck={false}
                                onClick={() => { }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Board lines overlay */}
                <svg className="board-lines" viewBox="0 0 9 10" preserveAspectRatio="none">
                    {/* Horizontal lines */}
                    {Array.from({ length: 10 }, (_, i) => (
                        <line
                            key={`h-${i}`}
                            x1="0.5"
                            y1={i + 0.5}
                            x2="8.5"
                            y2={i + 0.5}
                            stroke="#c49a6c"
                            strokeWidth="0.03"
                        />
                    ))}

                    {/* Vertical lines (top half) */}
                    {Array.from({ length: 9 }, (_, i) => (
                        <line
                            key={`v-top-${i}`}
                            x1={i + 0.5}
                            y1="0.5"
                            x2={i + 0.5}
                            y2="4.5"
                            stroke="#c49a6c"
                            strokeWidth="0.03"
                        />
                    ))}

                    {/* Vertical lines (bottom half) */}
                    {Array.from({ length: 9 }, (_, i) => (
                        <line
                            key={`v-bottom-${i}`}
                            x1={i + 0.5}
                            y1="5.5"
                            x2={i + 0.5}
                            y2="9.5"
                            stroke="#c49a6c"
                            strokeWidth="0.03"
                        />
                    ))}

                    {/* Left and right border through river */}
                    <line x1="0.5" y1="4.5" x2="0.5" y2="5.5" stroke="#c49a6c" strokeWidth="0.03" />
                    <line x1="8.5" y1="4.5" x2="8.5" y2="5.5" stroke="#c49a6c" strokeWidth="0.03" />

                    {/* Palace diagonals - top */}
                    <line x1="3.5" y1="0.5" x2="5.5" y2="2.5" stroke="#c49a6c" strokeWidth="0.03" />
                    <line x1="5.5" y1="0.5" x2="3.5" y2="2.5" stroke="#c49a6c" strokeWidth="0.03" />

                    {/* Palace diagonals - bottom */}
                    <line x1="3.5" y1="7.5" x2="5.5" y2="9.5" stroke="#c49a6c" strokeWidth="0.03" />
                    <line x1="5.5" y1="7.5" x2="3.5" y2="9.5" stroke="#c49a6c" strokeWidth="0.03" />
                </svg>
            </div>
        </div>
    );
};

export default Board;
