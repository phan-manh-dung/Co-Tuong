import type { BoardType, Position, Player } from './constants';
import { BOARD_COLS, BOARD_ROWS, INITIAL_BOARD } from './constants';

// Helper to check if a piece belongs to a player
export const isRedPiece = (piece: string | null): boolean => {
    return piece !== null && piece === piece.toUpperCase();
};

export const isBlackPiece = (piece: string | null): boolean => {
    return piece !== null && piece === piece.toLowerCase();
};

export const getPieceOwner = (piece: string | null): Player | null => {
    if (!piece) return null;
    return isRedPiece(piece) ? 'red' : 'black';
};

// Check if position is within board bounds
export const isInBounds = (row: number, col: number): boolean => {
    return row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS;
};

// Check if position is in palace (cung)
export const isInPalace = (row: number, col: number, player: Player): boolean => {
    const colValid = col >= 3 && col <= 5;
    if (player === 'red') {
        return colValid && row >= 7 && row <= 9;
    } else {
        return colValid && row >= 0 && row <= 2;
    }
};

// Check if position has crossed the river
export const hasCrossedRiver = (row: number, player: Player): boolean => {
    if (player === 'red') {
        return row <= 4; // Red crosses to top half
    } else {
        return row >= 5; // Black crosses to bottom half
    }
};

// Get all valid moves for a piece at a given position
export const getValidMoves = (
    board: BoardType,
    pos: Position,
    currentPlayer: Player
): Position[] => {
    const [row, col] = pos;
    const piece = board[row][col];
    if (!piece) return [];

    const pieceType = piece.toUpperCase();
    const owner = getPieceOwner(piece);
    if (owner !== currentPlayer) return [];

    const moves: Position[] = [];

    switch (pieceType) {
        case 'K': // General/King (Tướng)
            moves.push(...getGeneralMoves(board, row, col, owner));
            break;
        case 'A': // Advisor (Sĩ)
            moves.push(...getAdvisorMoves(board, row, col, owner));
            break;
        case 'E': // Elephant (Tượng)
            moves.push(...getElephantMoves(board, row, col, owner));
            break;
        case 'H': // Horse (Mã)
            moves.push(...getHorseMoves(board, row, col, owner));
            break;
        case 'R': // Chariot (Xe)
            moves.push(...getChariotMoves(board, row, col, owner));
            break;
        case 'C': // Cannon (Pháo)
            moves.push(...getCannonMoves(board, row, col, owner));
            break;
        case 'P': // Soldier (Tốt/Binh)
            moves.push(...getSoldierMoves(board, row, col, owner));
            break;
    }

    // Filter out moves that capture own pieces
    return moves.filter(([r, c]) => {
        const targetPiece = board[r][c];
        return !targetPiece || getPieceOwner(targetPiece) !== owner;
    });
};

// General moves (1 step orthogonally within palace)
const getGeneralMoves = (board: BoardType, row: number, col: number, owner: Player): Position[] => {
    const moves: Position[] = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (isInBounds(newRow, newCol) && isInPalace(newRow, newCol, owner)) {
            moves.push([newRow, newCol]);
        }
    }

    // Flying general rule: can capture opposing general if no pieces between
    const enemyGeneralRow = owner === 'red' ? [0, 1, 2] : [7, 8, 9];
    for (const targetRow of enemyGeneralRow) {
        const targetPiece = board[targetRow][col];
        if (targetPiece && targetPiece.toUpperCase() === 'K') {
            // Check if path is clear
            let pathClear = true;
            const minRow = Math.min(row, targetRow);
            const maxRow = Math.max(row, targetRow);
            for (let r = minRow + 1; r < maxRow; r++) {
                if (board[r][col]) {
                    pathClear = false;
                    break;
                }
            }
            if (pathClear) {
                moves.push([targetRow, col]);
            }
        }
    }

    return moves;
};

// Advisor moves (1 step diagonally within palace)
const getAdvisorMoves = (board: BoardType, row: number, col: number, owner: Player): Position[] => {
    const moves: Position[] = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (isInBounds(newRow, newCol) && isInPalace(newRow, newCol, owner)) {
            moves.push([newRow, newCol]);
        }
    }

    return moves;
};

// Elephant moves (2 steps diagonally, cannot cross river)
const getElephantMoves = (board: BoardType, row: number, col: number, owner: Player): Position[] => {
    const moves: Position[] = [];
    const directions = [[2, 2], [2, -2], [-2, 2], [-2, -2]];
    const blocks = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

    for (let i = 0; i < directions.length; i++) {
        const [dr, dc] = directions[i];
        const [br, bc] = blocks[i];
        const newRow = row + dr;
        const newCol = col + dc;
        const blockRow = row + br;
        const blockCol = col + bc;

        // Check if blocked
        if (board[blockRow]?.[blockCol]) continue;

        // Check bounds and river crossing
        if (isInBounds(newRow, newCol) && !hasCrossedRiver(newRow, owner)) {
            moves.push([newRow, newCol]);
        }
    }

    return moves;
};

// Horse moves (L-shape: 1 step orthogonal + 1 step diagonal, can be blocked)
const getHorseMoves = (board: BoardType, row: number, col: number, _owner: Player): Position[] => {
    const moves: Position[] = [];
    // [target offset, blocking offset]
    const movePatterns = [
        [[2, 1], [1, 0]],
        [[2, -1], [1, 0]],
        [[-2, 1], [-1, 0]],
        [[-2, -1], [-1, 0]],
        [[1, 2], [0, 1]],
        [[1, -2], [0, -1]],
        [[-1, 2], [0, 1]],
        [[-1, -2], [0, -1]],
    ];

    for (const [[dr, dc], [br, bc]] of movePatterns) {
        const newRow = row + dr;
        const newCol = col + dc;
        const blockRow = row + br;
        const blockCol = col + bc;

        // Check if blocked (chặn chân mã)
        if (board[blockRow]?.[blockCol]) continue;

        if (isInBounds(newRow, newCol)) {
            moves.push([newRow, newCol]);
        }
    }

    return moves;
};

// Chariot moves (any distance orthogonally)
const getChariotMoves = (board: BoardType, row: number, col: number, _owner: Player): Position[] => {
    const moves: Position[] = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    for (const [dr, dc] of directions) {
        let newRow = row + dr;
        let newCol = col + dc;

        while (isInBounds(newRow, newCol)) {
            if (board[newRow][newCol]) {
                // Can capture enemy piece
                moves.push([newRow, newCol]);
                break;
            }
            moves.push([newRow, newCol]);
            newRow += dr;
            newCol += dc;
        }
    }

    return moves;
};

// Cannon moves (like chariot but must jump over exactly one piece to capture)
const getCannonMoves = (board: BoardType, row: number, col: number, _owner: Player): Position[] => {
    const moves: Position[] = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    for (const [dr, dc] of directions) {
        let newRow = row + dr;
        let newCol = col + dc;
        let foundPlatform = false;

        while (isInBounds(newRow, newCol)) {
            if (board[newRow][newCol]) {
                if (!foundPlatform) {
                    // Found platform to jump over
                    foundPlatform = true;
                } else {
                    // Can capture after jumping
                    moves.push([newRow, newCol]);
                    break;
                }
            } else {
                if (!foundPlatform) {
                    // Can move to empty squares before finding platform
                    moves.push([newRow, newCol]);
                }
            }
            newRow += dr;
            newCol += dc;
        }
    }

    return moves;
};

// Soldier moves (forward only, sideways after crossing river)
const getSoldierMoves = (board: BoardType, row: number, col: number, owner: Player): Position[] => {
    const moves: Position[] = [];
    const forward = owner === 'red' ? -1 : 1; // Red moves up, black moves down

    // Forward move
    const newRow = row + forward;
    if (isInBounds(newRow, col)) {
        moves.push([newRow, col]);
    }

    // Sideways moves after crossing river
    if (hasCrossedRiver(row, owner)) {
        if (isInBounds(row, col - 1)) moves.push([row, col - 1]);
        if (isInBounds(row, col + 1)) moves.push([row, col + 1]);
    }

    return moves;
};

// Initialize a new board
export const initializeBoard = (): BoardType => {
    return INITIAL_BOARD.map(row => [...row]);
};

// Move a piece on the board (returns new board)
export const movePiece = (
    board: BoardType,
    from: Position,
    to: Position
): BoardType => {
    const newBoard = board.map(row => [...row]);
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;

    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = null;

    return newBoard;
};

// Check if a player is in check
export const isInCheck = (board: BoardType, player: Player): boolean => {
    // Find the general's position
    let generalPos: Position | null = null;
    const generalPiece = player === 'red' ? 'K' : 'k';

    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            if (board[row][col] === generalPiece) {
                generalPos = [row, col];
                break;
            }
        }
        if (generalPos) break;
    }

    if (!generalPos) return true; // General captured

    // Check if any enemy piece can capture the general
    const enemy = player === 'red' ? 'black' : 'red';
    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            const piece = board[row][col];
            if (piece && getPieceOwner(piece) === enemy) {
                const moves = getValidMoves(board, [row, col], enemy);
                if (moves.some(([r, c]) => r === generalPos![0] && c === generalPos![1])) {
                    return true;
                }
            }
        }
    }

    return false;
};

// Check if a move is valid (doesn't leave own general in check)
export const isMoveSafe = (
    board: BoardType,
    from: Position,
    to: Position,
    player: Player
): boolean => {
    const newBoard = movePiece(board, from, to);
    return !isInCheck(newBoard, player);
};

// Get all valid and safe moves for a piece
export const getSafeMoves = (
    board: BoardType,
    pos: Position,
    currentPlayer: Player
): Position[] => {
    const validMoves = getValidMoves(board, pos, currentPlayer);
    return validMoves.filter(to => isMoveSafe(board, pos, to, currentPlayer));
};

// Check if a player is in checkmate
export const isCheckmate = (board: BoardType, player: Player): boolean => {
    // Must be in check first
    if (!isInCheck(board, player)) return false;

    // Check if any move can get out of check
    for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLS; col++) {
            const piece = board[row][col];
            if (piece && getPieceOwner(piece) === player) {
                const safeMoves = getSafeMoves(board, [row, col], player);
                if (safeMoves.length > 0) return false;
            }
        }
    }

    return true;
};
