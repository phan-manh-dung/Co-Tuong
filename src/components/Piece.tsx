import React from 'react';
import { PIECE_CHARS } from '../utils/constants';
import './Piece.css';

interface PieceProps {
    piece: string;
    isSelected: boolean;
    isInCheck?: boolean;  // For highlighting general when in check
    onClick: () => void;
}

const Piece: React.FC<PieceProps> = ({ piece, isSelected, isInCheck = false, onClick }) => {
    const isRed = piece === piece.toUpperCase();
    const char = PIECE_CHARS[piece] || piece;

    const classNames = [
        'piece',
        isRed ? 'red' : 'black',
        isSelected ? 'selected' : '',
        isInCheck ? 'in-check' : ''
    ].filter(Boolean).join(' ');

    return (
        <div className={classNames} onClick={onClick}>
            <span className="piece-char">{char}</span>
        </div>
    );
};

export default Piece;
