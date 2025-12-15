import React from 'react';
import './WaitingRoom.css';

interface WaitingRoomProps {
    roomId: string;
    playerName: string;
    onLeave: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ roomId, playerName, onLeave }) => {
    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomId);
    };

    return (
        <div className="waiting-room">
            <div className="waiting-container">
                <h2 className="waiting-title">⏳ Đang chờ đối thủ...</h2>

                <div className="room-info">
                    <p className="room-label">Mã phòng:</p>
                    <div className="room-code-display">
                        <span className="room-code">{roomId}</span>
                        <button className="copy-btn" onClick={copyRoomCode} title="Copy mã phòng">
                            📋
                        </button>
                    </div>
                </div>

                <p className="waiting-hint">
                    Chia sẻ mã phòng cho bạn bè để họ tham gia!
                </p>

                <div className="player-status">
                    <div className="player-card host">
                        <span className="player-icon">🔴</span>
                        <span className="player-name">{playerName} (Bạn)</span>
                        <span className="player-badge">Host</span>
                    </div>
                    <div className="player-card waiting">
                        <span className="player-icon">⚫</span>
                        <span className="player-name">Đang chờ...</span>
                    </div>
                </div>

                <div className="waiting-animation">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>

                <button className="leave-btn" onClick={onLeave}>
                    ❌ Hủy phòng
                </button>
            </div>
        </div>
    );
};

export default WaitingRoom;
