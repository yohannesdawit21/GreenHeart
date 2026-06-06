import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MaterialIcon } from '../components/MaterialIcon';
import { btnPrimary, btnTextDanger } from '../components/layout/buttonStyles';
import { sessionService } from '../api/session.service';
import { useSocket } from '../context/SocketContext';
import type { SessionReadyPayload } from '@shared/contracts/socket.events';

export function WaitingSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const { socket } = useSocket();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      navigate('/discover');
      return;
    }

    const goToRoom = () => navigate(`/consultation?sessionId=${sessionId}`);

    const onReady = (payload: SessionReadyPayload) => {
      if (payload.sessionId === sessionId) goToRoom();
    };

    socket?.on('session_ready', onReady);

    const poll = setInterval(async () => {
      try {
        const status = await sessionService.getSessionStatus(sessionId);
        if (status.status === 'active') goToRoom();
        if (status.status === 'declined' || status.status === 'cancelled') {
          setError('The advisor declined or the session was cancelled. Your coins were refunded.');
          clearInterval(poll);
        }
      } catch {
        /* ignore transient errors while ringing */
      }
    }, 2000);

    return () => {
      socket?.off('session_ready', onReady);
      clearInterval(poll);
    };
  }, [sessionId, socket, navigate]);

  const handleCancel = async () => {
    if (!sessionId) return;
    try {
      await sessionService.endSession(sessionId);
      navigate('/discover');
    } catch {
      navigate('/discover');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-margin-mobile">
      <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg text-center shadow-lg">
        {error ? (
          <>
            <MaterialIcon name="error" filled className="text-error text-5xl mb-stack-md" />
            <p className="font-body-lg text-body-lg text-on-surface mb-stack-lg">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/discover')}
              className={`${btnPrimary} px-6 py-3`}
            >
              Back to Discover
            </button>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-primary mx-auto mb-stack-md" />
            <h1 className="font-headline-md text-headline-md text-on-background mb-stack-sm">Waiting for Advisor</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-stack-lg">
              Connecting you with your advisor…
            </p>
            <p className="font-label-md text-label-md text-on-surface-variant mb-stack-lg">
              Session: <span className="font-mono text-xs">{sessionId}</span>
            </p>
            <button
              type="button"
              onClick={handleCancel}
              className={btnTextDanger}
            >
              Cancel request
            </button>
          </>
        )}
      </div>
    </div>
  );
}
