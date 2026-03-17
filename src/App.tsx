import { useState } from 'react';
import { Header } from './components/Header';
import { SpeedGauge } from './components/SpeedGauge';
import { ResultCard } from './components/ResultCard';
import { CesiumGlobe } from './components/CesiumGlobe';
import { Leaderboard } from './components/Leaderboard';
import { Footer } from './components/Footer';
import { useSpeedTest } from './hooks/useSpeedTest';

function App() {
  const { state, startTest, reset } = useSpeedTest();
  const [newResultId, setNewResultId] = useState<string | undefined>();

  const isTesting = state.phase !== 'idle' && state.phase !== 'complete' && state.phase !== 'error';
  const showResult = state.phase === 'complete' && state.result !== null;

  const handleRunTest = () => {
    reset();
    setNewResultId(undefined);
    void startTest();
  };

  const handleRetry = () => {
    reset();
  };

  const buttonLabel = isTesting
    ? `TESTING... ${Math.round(state.progress)}%`
    : state.phase === 'error'
    ? 'RETRY TEST'
    : 'RUN SPEED TEST';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-void)' }}>
      <Header />

      {/* Hero Section */}
      <main style={{ flex: 1 }}>
        <section style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px 40px',
          gap: '24px',
        }}>
          {/* Gauge */}
          <div className="opacity-0-init animate-fade-in-up animate-delay-200">
            <SpeedGauge
              phase={state.phase}
              progress={state.progress}
              currentMbps={state.currentMbps}
              statusMessage={state.statusMessage}
              finalResult={state.result?.downloadMbps}
            />
          </div>

          {/* Run button */}
          <div className="opacity-0-init animate-fade-in-up animate-delay-400">
            <button
              onClick={handleRunTest}
              disabled={isTesting}
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '16px 48px',
                background: isTesting
                  ? `linear-gradient(90deg, #00FFB215 ${state.progress}%, transparent ${state.progress}%)`
                  : 'transparent',
                color: 'var(--accent-signal)',
                border: '2px solid var(--accent-signal)',
                borderRadius: '4px',
                cursor: isTesting ? 'not-allowed' : 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'background 0.1s linear, box-shadow 0.3s ease',
                minWidth: '260px',
              }}
              onMouseEnter={(e) => {
                if (!isTesting) {
                  (e.currentTarget as HTMLButtonElement).style.background = '#00FFB210';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px #00FFB240';
                }
              }}
              onMouseLeave={(e) => {
                if (!isTesting) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                }
              }}
              onMouseDown={(e) => {
                if (!isTesting) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)';
                }
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
            >
              {buttonLabel}
            </button>
          </div>

          {/* Error state */}
          {state.phase === 'error' && state.error && (
            <div style={{
              background: '#FF444415',
              border: '1px solid #FF444430',
              borderRadius: '10px',
              padding: '14px 20px',
              maxWidth: '500px',
              textAlign: 'center',
            }}>
              <p style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '0.85rem',
                color: 'var(--accent-danger)',
              }}>
                {state.error}
              </p>
            </div>
          )}

          {/* Result Card */}
          {showResult && state.result && (
            <div style={{ width: '100%', maxWidth: '640px' }}>
              <ResultCard
                result={state.result}
                ispInfo={state.ispInfo}
                townInfo={state.townInfo}
                detectedCarrier={state.detectedCarrier}
                onRetry={handleRetry}
                onSubmitted={(id) => setNewResultId(id)}
              />
            </div>
          )}
        </section>

        {/* Map + Leaderboard Section */}
        <section
          className="opacity-0-init animate-fade-in animate-delay-600 map-lb-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '60% 40%',
            gap: '0',
            height: '600px',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div className="map-panel" style={{
            borderRight: '1px solid var(--border-subtle)',
            padding: '16px',
            height: '100%',
          }}>
            <CesiumGlobe newResultId={newResultId} />
          </div>

          <div
            className="opacity-0-init animate-fade-in animate-delay-800 lb-panel"
            style={{ padding: '16px', height: '100%', overflow: 'hidden' }}
          >
            <Leaderboard />
          </div>
        </section>

        <style>{`
          @media (max-width: 768px) {
            .map-lb-grid {
              grid-template-columns: 1fr !important;
              height: auto !important;
            }
            .map-panel {
              height: 360px !important;
              border-right: none !important;
              border-bottom: 1px solid var(--border-subtle);
            }
            .lb-panel {
              height: 500px !important;
            }
          }
        `}</style>
      </main>

      <Footer />
    </div>
  );
}

export default App;
