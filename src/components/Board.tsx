import React from 'react';
import type { BoardType, Position, Player } from '../utils/constants';
import { getPieceOwner } from '../utils/gameLogic';
import Piece from './Piece';
import './Board.css';

interface BoardProps {
    board: BoardType;
    selectedPos: Position | null;
    validMoves: Position[];
    currentPlayer: Player;
    lastMove: { from: Position; to: Position } | null;
    onCellClick: (row: number, col: number) => void;
}

const Board: React.FC<BoardProps> = ({
    board,
    selectedPos,
    validMoves,
    currentPlayer,
    lastMove,
    onCellClick,
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

    return (
        <div className="board-container">
            <div className="board">
                {/* River text */}
                <div className="river-text river-text-left">楚 河</div>
                <div className="river-text river-text-right">漢 界</div>

                {/* Board grid */}
                <div className="board-grid">
                    {board.flatMap((row, rowIndex) =>
                        row.map((piece, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`cell 
                                    ${isValidMove(rowIndex, colIndex) ? 'valid-move' : ''} 
                                    ${isLastMoveFrom(rowIndex, colIndex) ? 'last-move-from' : ''}
                                    ${isLastMoveTo(rowIndex, colIndex) ? 'last-move-to' : ''}
                                `}
                                onClick={() => onCellClick(rowIndex, colIndex)}
                            >
                                {piece && (
                                    <Piece
                                        piece={piece}
                                        isSelected={isSelected(rowIndex, colIndex)}
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
                        ))
                    )}
                </div>

                {/* Board lines overlay - lines connect intersection centers */}
                <svg className="board-lines" viewBox="0 0 9 10" preserveAspectRatio="none">
                    {/* Horizontal lines - 10 lines from y=0.5 to y=9.5 */}
                    {Array.from({ length: 10 }, (_, i) => (
                        <line
                            key={`h-${i}`}
                            x1="0.5"
                            y1={i + 0.5}
                            x2="8.5"
                            y2={i + 0.5}
                            stroke="#5c3317"
                            strokeWidth="0.04"
                        />
                    ))}

                    {/* Vertical lines (top half - rows 0-4) */}
                    {Array.from({ length: 9 }, (_, i) => (
                        <line
                            key={`v-top-${i}`}
                            x1={i + 0.5}
                            y1="0.5"
                            x2={i + 0.5}
                            y2="4.5"
                            stroke="#5c3317"
                            strokeWidth="0.04"
                        />
                    ))}

                    {/* Vertical lines (bottom half - rows 5-9) */}
                    {Array.from({ length: 9 }, (_, i) => (
                        <line
                            key={`v-bottom-${i}`}
                            x1={i + 0.5}
                            y1="5.5"
                            x2={i + 0.5}
                            y2="9.5"
                            stroke="#5c3317"
                            strokeWidth="0.04"
                        />
                    ))}

                    {/* Left and right border lines through river */}
                    <line x1="0.5" y1="4.5" x2="0.5" y2="5.5" stroke="#5c3317" strokeWidth="0.04" />
                    <line x1="8.5" y1="4.5" x2="8.5" y2="5.5" stroke="#5c3317" strokeWidth="0.04" />

                    {/* Palace diagonals - top (black side) */}
                    <line x1="3.5" y1="0.5" x2="5.5" y2="2.5" stroke="#5c3317" strokeWidth="0.04" />
                    <line x1="5.5" y1="0.5" x2="3.5" y2="2.5" stroke="#5c3317" strokeWidth="0.04" />

                    {/* Palace diagonals - bottom (red side) */}
                    <line x1="3.5" y1="7.5" x2="5.5" y2="9.5" stroke="#5c3317" strokeWidth="0.04" />
                    <line x1="5.5" y1="7.5" x2="3.5" y2="9.5" stroke="#5c3317" strokeWidth="0.04" />
                </svg>
            </div>
        </div>
    );
};

export default Board;
