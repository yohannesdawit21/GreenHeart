import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MaterialIcon } from '../components/MaterialIcon';
import { btnOutline, btnPrimary, btnTextDanger } from '../components/layout/buttonStyles';
import { DashboardAlert } from '../components/layout/dashboard-ui';
import { ConfirmDialog } from '../components/layout/ConfirmDialog';
import { sessionService } from '../api/session.service';
import { useSocket } from '../context/SocketContext';
import type { CallProcessingPayload, SessionReadyPayload } from '@shared/contracts/socket.events';

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function WaitingSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const { socket } = useSocket();
  const [error, setError] = useState('');
  const [coinAmount, setCoinAmount] = useState<number | null>(null);
  const [advisorName, setAdvisorName] = useState<string>('your advisor');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [elapsed, setElapsed] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showBrowseConfirm, setShowBrowseConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      navigate('/discover');
      return;
    }

    sessionService
      .getSessionStatus(sessionId)
      .then((status) => {
        setCoinAmount(status.coinAmount);
        if (status.advisorName) setAdvisorName(status.advisorName);
        setDurationMinutes(status.durationMinutes);
      })
      .catch(() => setCoinAmount(null));

    const goToRoom = () => navigate(`/consultation?sessionId=${sessionId}`);

    const onReady = (payload: SessionReadyPayload) => {
      if (payload.sessionId === sessionId) goToRoom();
    };

    const onCallProcessing = (payload: CallProcessingPayload) => {
      if (payload.sessionId !== sessionId) return;
      if (payload.status === 'declined') {
        setError('The advisor declined this session. Your coins were refunded.');
      }
    };

    socket?.on('session_ready', onReady);
    socket?.on('call_processing', onCallProcessing);

    const poll = setInterval(async () => {
      try {
        const status = await sessionService.getSessionStatus(sessionId);
        setCoinAmount(status.coinAmount);
        if (status.advisorName) setAdvisorName(status.advisorName);
        setDurationMinutes(status.durationMinutes);
        if (status.status === 'active') goToRoom();
        if (status.status === 'declined' || status.status === 'cancelled') {
          setError(
            status.status === 'declined'
              ? 'The advisor declined this session. Your coins were refunded.'
              : 'This request was cancelled. Your coins were refunded.',
          );
          clearInterval(poll);
        }
      } catch {
        /* ignore transient errors while ringing */
      }
    }, 2000);

    return () => {
      socket?.off('session_ready', onReady);
      socket?.off('call_processing', onCallProcessing);
      clearInterval(poll);
    };
  }, [sessionId, socket, navigate]);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCancel = async () => {
    if (!sessionId) return;
    setCancelling(true);
    try {
      await sessionService.endSession(sessionId);
      navigate('/discover');
    } catch {
      navigate('/discover');
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  const waitingPath = sessionId ? `/waiting?sessionId=${encodeURIComponent(sessionId)}` : '/discover';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-margin-mobile">
      <ConfirmDialog
        open={showCancelConfirm}
        title="Cancel this request?"
        message={`${coinAmount ?? 'Your'} coins in escrow will be refunded. ${advisorName} will stop seeing the incoming call.`}
        confirmLabel={cancelling ? 'Cancelling…' : 'Yes, cancel'}
        cancelLabel="Keep waiting"
        variant="danger"
        icon="cancel"
        onConfirm={() => void handleCancel()}
        onCancel={() => setShowCancelConfirm(false)}
      />

      <ConfirmDialog
        open={showBrowseConfirm}
        title="Browse other advisors?"
        message={`Your request to ${advisorName} stays active — coins remain in escrow and they still see the incoming call until you cancel or they respond.`}
        confirmLabel="Browse anyway"
        cancelLabel="Stay on waiting screen"
        variant="primary"
        icon="explore"
        onConfirm={() => {
          setShowBrowseConfirm(false);
          navigate('/discover');
        }}
        onCancel={() => setShowBrowseConfirm(false)}
      />

      <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg text-center shadow-lg">
        {error ? (
          <>
            <MaterialIcon name="error" filled className="text-error text-5xl mb-stack-md" />
            <p className="font-body-lg text-body-lg text-on-surface mb-stack-lg">{error}</p>
            <button type="button" onClick={() => navigate('/discover')} className={`${btnPrimary} px-6 py-3`}>
              Back to Discover
            </button>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-primary mx-auto mb-stack-md" />
            <h1 className="font-headline-md text-headline-md text-on-background mb-stack-sm">
              Waiting for {advisorName}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-2">
              Ringing the advisor — they need to accept on Advisor Hub.
            </p>
            <p className="text-sm text-on-surface-variant mb-stack-md">
              Waiting {formatElapsed(elapsed)} · Up to {durationMinutes} min session
            </p>
            {coinAmount != null && (
              <DashboardAlert variant="info" icon="lock" title="Coins in escrow">
                {coinAmount} coins are held until the session starts or you cancel.
              </DashboardAlert>
            )}
            <div className="flex flex-col gap-2 items-center mt-stack-lg">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelling}
                className={btnTextDanger}
              >
                Cancel request
              </button>
              <Link
                to="/wallet"
                state={{ returnTo: waitingPath }}
                className="text-sm text-primary hover:underline"
              >
                View wallet balance
              </Link>
              <p className="text-xs text-on-surface-variant max-w-xs">
                Wallet opens in place — escrow stays locked and this request keeps ringing until you cancel or the
                advisor responds. Use your browser back button to return here.
              </p>
              <button
                type="button"
                onClick={() => setShowBrowseConfirm(true)}
                className={`${btnOutline} text-sm px-4 py-2 mt-1`}
              >
                Browse other advisors
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
