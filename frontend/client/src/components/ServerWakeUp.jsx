import { useState, useEffect, useRef, useCallback } from 'react';
import './ServerWakeUp.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const HEALTH_URL = `${API_BASE.replace(/\/api\/?$/, '')}/api/health`;

const MAX_RETRIES = 8;
const INITIAL_DELAY_MS = 3000;

/**
 * Pings the backend health endpoint on mount.
 * If the server is asleep, shows a friendly
 * "waking up" overlay with an animated progress bar and auto-retry
 * so recruiters know the site isn't broken.
 */
export default function ServerWakeUp({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'awake' | 'failed'
  const [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState('Connecting to server…');
  const retryTimer = useRef(null);

  const ping = useCallback(async (currentAttempt) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(HEALTH_URL, {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);

      if (res.ok) {
        setStatus('awake');
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch {
      if (currentAttempt >= MAX_RETRIES) {
        setStatus('failed');
        setMessage('Could not reach the server. Please try again later.');
        return;
      }

      const next = currentAttempt + 1;
      setAttempt(next);

      if (next <= 2) {
        setMessage('Server is waking up — this can take up to 30 seconds…');
      } else if (next <= 5) {
        setMessage('Almost there — the server is still starting…');
      } else {
        setMessage('Taking longer than usual — hang tight…');
      }

      retryTimer.current = setTimeout(() => ping(next), INITIAL_DELAY_MS);
    }
  }, []);

  useEffect(() => {
    ping(0);
    return () => clearTimeout(retryTimer.current);
  }, [ping]);

  const handleRetry = () => {
    setStatus('checking');
    setAttempt(0);
    setMessage('Reconnecting…');
    ping(0);
  };

  // Server is awake — render the app
  if (status === 'awake') return children;

  const progress = Math.min((attempt / MAX_RETRIES) * 100, 95);

  return (
    <div className="wakeup-overlay">
      <div className="wakeup-card">
        {/* Animated logo */}
        <div className="wakeup-logo">
          <div className="wakeup-logo-ring" />
          <span className="wakeup-logo-icon">🎓</span>
        </div>

        <h2 className="wakeup-title">CareerCove</h2>

        {status === 'checking' && (
          <>
            <p className="wakeup-message">{message}</p>

            {/* Progress bar */}
            <div className="wakeup-progress-track">
              <div
                className="wakeup-progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="wakeup-hint">
              Server is waking up...<br />
              Your data is safe — just a moment!
            </p>
          </>
        )}

        {status === 'failed' && (
          <>
            <p className="wakeup-message wakeup-message--error">{message}</p>
            <button className="wakeup-retry-btn" onClick={handleRetry}>
              Try Again
            </button>
            <p className="wakeup-hint">
              If this keeps happening, check the{' '}
              <a
                href="https://github.com/Vortex077/CareerCove"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub repo
              </a>{' '}
              for screenshots and details.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
