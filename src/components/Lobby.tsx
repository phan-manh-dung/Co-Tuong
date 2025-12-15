import React, { useState } from 'react';
import './Lobby.css';

interface LobbyProps {
    onCreateRoom: (playerName: string) => void;
    onJoinRoom: (roomId: string, playerName: string) => void;
    isLoading: boolean;
    error: string | null;
}

const Lobby: React.FC<LobbyProps> = ({ onCreateRoom, onJoinRoom, isLoading, error }) => {
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');

    const handleCreate = () => {
        if (playerName.trim()) {
            onCreateRoom(playerName.trim());
        }
    };

    const handleJoin = () => {
        if (playerName.trim() && roomCode.trim()) {
            onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
        }
    };

    return (
        <div className="lobby">
            <div className="lobby-container">
                <h1 className="lobby-title">🏯 Cờ Tướng</h1>
                <p className="lobby-subtitle">Chinese Chess Online</p>

                {error && <div className="lobby-error">{error}</div>}

                {mode === 'menu' && (
                    <div className="lobby-menu">
                        <button
                            className="lobby-btn create"
                            onClick={() => setMode('create')}
                        >
                            🎮 Tạo phòng mới
                        </button>
                        <button
                            className="lobby-btn join"
                            onClick={() => setMode('join')}
                        >
                            🔗 Tham gia phòng
                        </button>
                    </div>
                )}

                {mode === 'create' && (
                    <div className="lobby-form">
                        <input
                            type="text"
                            placeholder="Tên của bạn"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            className="lobby-input"
                            maxLength={20}
                        />
                        <button
                            className="lobby-btn create"
                            onClick={handleCreate}
                            disabled={!playerName.trim() || isLoading}
                        >
                            {isLoading ? '⏳ Đang tạo...' : '✨ Tạo phòng'}
                        </button>
                        <button
                            className="lobby-btn back"
                            onClick={() => setMode('menu')}
                        >
                            ← Quay lại
                        </button>
                    </div>
                )}

                {mode === 'join' && (
                    <div className="lobby-form">
                        <input
                            type="text"
                            placeholder="Tên của bạn"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            className="lobby-input"
                            maxLength={20}
                        />
                        <input
                            type="text"
                            placeholder="Mã phòng (6 ký tự)"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            className="lobby-input room-code"
                            maxLength={6}
                        />
                        <button
                            className="lobby-btn join"
                            onClick={handleJoin}
                            disabled={!playerName.trim() || !roomCode.trim() || isLoading}
                        >
                            {isLoading ? '⏳ Đang tham gia...' : '🚀 Tham gia'}
                        </button>
                        <button
                            className="lobby-btn back"
                            onClick={() => setMode('menu')}
                        >
                            ← Quay lại
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Lobby;
