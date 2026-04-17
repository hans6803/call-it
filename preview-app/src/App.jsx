import WatchFace from './WatchFace';

function App() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#1a1a2e',
      padding: 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {/* Phone frame */}
      <div style={{
        width: 390,
        height: 844,
        borderRadius: 44,
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.8), inset 0 0 0 2px #444',
        background: '#002554',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Status bar */}
        <div style={{
          height: 44,
          background: '#002554',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>9:41</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ color: '#fff', fontSize: 11 }}>●●●</span>
            <span style={{ color: '#fff', fontSize: 11 }}>WiFi</span>
            <span style={{ color: '#fff', fontSize: 11 }}>🔋</span>
          </div>
        </div>
        {/* Component fills rest */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <WatchFace />
        </div>
      </div>
    </div>
  );
}

export default App;
