// Piece types
export const PIECES = {
    // Red pieces (uppercase)
    R_GENERAL: 'K',    // Tướng đỏ (帥)
    R_ADVISOR: 'A',    // Sĩ đỏ (仕)
    R_ELEPHANT: 'E',   // Tượng đỏ (相)
    R_HORSE: 'H',      // Mã đỏ (馬)
    R_CHARIOT: 'R',    // Xe đỏ (車)
    R_CANNON: 'C',     // Pháo đỏ (炮)
    R_SOLDIER: 'P',    // Tốt đỏ (兵)

    // Black pieces (lowercase)
    B_GENERAL: 'k',    // Tướng đen (將)
    B_ADVISOR: 'a',    // Sĩ đen (士)
    B_ELEPHANT: 'e',   // Tượng đen (象)
    B_HORSE: 'h',      // Mã đen (馬)
    B_CHARIOT: 'r',    // Xe đen (車)
    B_CANNON: 'c',     // Pháo đen (砲)
    B_SOLDIER: 'p',    // Tốt đen (卒)
} as const;

// Chinese characters for pieces
export const PIECE_CHARS: Record<string, string> = {
    'K': '帥', 'A': '仕', 'E': '相', 'H': '馬', 'R': '車', 'C': '炮', 'P': '兵',
    'k': '將', 'a': '士', 'e': '象', 'h': '馬', 'r': '車', 'c': '砲', 'p': '卒',
};

// Board dimensions
export const BOARD_COLS = 9;
export const BOARD_ROWS = 10;

// Initial board setup (10 rows x 9 cols)
// Row 0 is top (black side), Row 9 is bottom (red side)
export const INITIAL_BOARD: (string | null)[][] = [
    ['r', 'h', 'e', 'a', 'k', 'a', 'e', 'h', 'r'],  // Row 0: Black back row
    [null, null, null, null, null, null, null, null, null],
    [null, 'c', null, null, null, null, null, 'c', null],  // Row 2: Black cannons
    ['p', null, 'p', null, 'p', null, 'p', null, 'p'],  // Row 3: Black soldiers
    [null, null, null, null, null, null, null, null, null],  // Row 4: River
    [null, null, null, null, null, null, null, null, null],  // Row 5: River
    ['P', null, 'P', null, 'P', null, 'P', null, 'P'],  // Row 6: Red soldiers
    [null, 'C', null, null, null, null, null, 'C', null],  // Row 7: Red cannons
    [null, null, null, null, null, null, null, null, null],
    ['R', 'H', 'E', 'A', 'K', 'A', 'E', 'H', 'R'],  // Row 9: Red back row
];

export type PieceType = string | null;
export type BoardType = PieceType[][];
export type Position = [number, number]; // [row, col]
export type Player = 'red' | 'black';
