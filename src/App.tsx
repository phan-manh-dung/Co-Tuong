import { useRoom } from './hooks/useRoom';
import Lobby from './components/Lobby';
import WaitingRoom from './components/WaitingRoom';
import GameMultiplayer from './components/GameMultiplayer';
import Game from './components/Game';
import { useState } from 'react';

type AppMode = 'menu' | 'local' | 'online';

function App() {
  const [appMode, setAppMode] = useState<AppMode>('menu');
  const [playerName, setPlayerName] = useState<string>('');

  const {
    roomId,
    roomData,
    playerColor,
    isLoading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    makeMove,
    resetGame
  } = useRoom();

  const handleCreateRoom = async (name: string) => {
    setPlayerName(name);
    await createRoom(name);
  };

  const handleJoinRoom = async (code: string, name: string) => {
    setPlayerName(name);
    await joinRoom(code, name);
  };

  const handleLeave = async () => {
    await leaveRoom();
    setAppMode('menu');
  };

  // Main Menu
  if (appMode === 'menu') {
    return (
      <div className="main-menu" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d1321 50%, #1a1a2e 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          minWidth: '320px'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: '#fff',
            marginBottom: '8px',
            textShadow: '0 4px 20px rgba(255, 215, 0, 0.3)'
          }}>🏯 Cờ Tướng</h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '32px',
            fontSize: '1.1rem'
          }}>Chinese Chess</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={() => setAppMode('local')}
              style={{
                padding: '16px 32px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)'
              }}
            >
              🎮 Chơi 2 người (1 máy)
            </button>
            <button
              onClick={() => setAppMode('online')}
              style={{
                padding: '16px 32px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)'
              }}
            >
              🌐 Chơi Online (2 máy)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Local 2-player game
  if (appMode === 'local') {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setAppMode('menu')}
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: 1000,
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          ← Menu
        </button>
        <Game />
      </div>
    );
  }

  // Online mode
  if (appMode === 'online') {
    // Not in a room yet - show lobby
    if (!roomId) {
      return (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setAppMode('menu')}
            style={{
              position: 'fixed',
              top: '10px',
              left: '10px',
              zIndex: 1000,
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            ← Menu
          </button>
          <Lobby
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            isLoading={isLoading}
            error={error}
          />
        </div>
      );
    }

    // Waiting for opponent
    if (roomData && roomData.status === 'waiting') {
      return (
        <WaitingRoom
          roomId={roomId}
          playerName={playerName}
          onLeave={handleLeave}
        />
      );
    }

    // Game in progress or finished
    if (roomData && playerColor && (roomData.status === 'playing' || roomData.status === 'finished')) {
      return (
        <GameMultiplayer
          roomData={roomData}
          playerColor={playerColor}
          onMakeMove={makeMove}
          onLeave={handleLeave}
          onRematch={resetGame}
        />
      );
    }

    // Loading state - roomId exists but roomData not loaded yet
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d1321 50%, #1a1a2e 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        ⏳ Đang tải...
      </div>
    );
  }

  return null;
}

export default App;
