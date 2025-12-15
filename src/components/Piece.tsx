import React from 'react';
import { PIECE_CHARS } from '../utils/constants';
import './Piece.css';

interface PieceProps {
    piece: string;
    isSelected: boolean;
    onClick: () => void;
}

const Piece: React.FC<PieceProps> = ({ piece, isSelected, onClick }) => {
    const isRed = piece === piece.toUpperCase();
    const char = PIECE_CHARS[piece] || piece;

    return (
        <div
            className={`piece ${isRed ? 'red' : 'black'} ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <span className="piece-char">{char}</span>
        </div>
    );
};

export default Piece;
