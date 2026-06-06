import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { appShellMainClass, LoadingSpinner } from '../components/layout/dashboard-ui';
import { MaterialIcon } from '../components/MaterialIcon';
import { userService } from '../api/user.service';
import { sessionService } from '../api/session.service';
import { useAuth } from '../context/AuthContext';
import type { AdvisorCardDto } from '@shared/contracts/users.api';

export function AdvisorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [advisor, setAdvisor] = useState<AdvisorCardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectError, setConnectError] = useState('');

  useEffect(() => {
    if (!id) return;
    userService
      .getAdvisorDetail(id)
      .then((data) => setAdvisor(data.advisor))
      .catch(() => setError('Advisor not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConnect = async () => {
    if (!advisor || user?.role !== 'client') {
      navigate('/auth');
      return;
    }
    setConnectError('');
    try {
      const data = await sessionService.initiateSession({ advisorId: advisor.id });
      navigate(`/waiting?sessionId=${data.sessionId}`);
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      if (code === 'INSUFFICIENT_FUNDS') setConnectError('Insufficient coins — visit your wallet first.');
      else if (code === 'ADVISOR_OFFLINE') setConnectError('Advisor is offline.');
      else setConnectError(err.response?.data?.error?.message || 'Could not connect.');
    }
  };

  if (loading) {
    return (
      <AppShell activeNav="discover" showSearch={false}>
        <LoadingSpinner />
      </AppShell>
    );
  }

  if (!advisor || error) {
    return (
      <AppShell showSearch={false}>
      <main className={`${appShellMainClass} max-w-2xl text-center`}>
          <p className="text-on-surface-variant mb-4">{error || 'Not found'}</p>
          <Link to="/discover" className="text-primary hover:underline">Back to Discover</Link>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell showSearch={false}>
      <main className={`${appShellMainClass} max-w-2xl`}>
        <Link to="/discover" className="text-primary flex items-center gap-1 font-label-md mb-stack-md hover:underline">
          <MaterialIcon name="arrow_back" className="text-sm" />
          Back to Discover
        </Link>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
          <div className="flex items-start gap-stack-md mb-stack-md">
            <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center">
              <MaterialIcon name="person" className="text-4xl text-on-surface-variant" />
            </div>
            <div>
              <h1 className="font-display-md text-display-md">{advisor.username}</h1>
              <p className="text-on-surface-variant font-body-md">{advisor.bio.split('.')[0]}</p>
              <div className="flex items-center gap-1 mt-1">
                <MaterialIcon name="star" className="text-primary text-sm" />
                <span className="text-sm text-on-surface-variant">{advisor.rating ?? 5.0} rating</span>
              </div>
            </div>
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant mb-stack-md">{advisor.bio}</p>

          <div className="flex flex-wrap gap-2 mb-stack-lg">
            {advisor.tags.map((tag) => (
              <span key={tag} className="bg-surface-container px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-stack-md border-t border-outline-variant pt-stack-md">
            <div className="min-w-0">
              <span className="font-bold text-lg">{advisor.coinRatePerSession}</span>
              <span className="text-on-surface-variant ml-1">coins / session</span>
              <div className="text-sm text-on-surface-variant mt-1">
                {advisor.isOnline ? (
                  <span className="text-secondary flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary shrink-0" /> Online now
                  </span>
                ) : (
                  'Currently offline'
                )}
              </div>
            </div>
            {user?.role === 'client' && (
              <button
                type="button"
                onClick={handleConnect}
                disabled={!advisor.isOnline}
                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-label-md transition-colors ${
                  advisor.isOnline
                    ? 'bg-primary text-on-primary hover:bg-on-primary-fixed-variant'
                    : 'bg-surface-container text-outline cursor-not-allowed'
                }`}
              >
                {advisor.isOnline ? 'Connect' : 'Advisor offline'}
              </button>
            )}
          </div>

          {connectError && <p className="text-error text-sm mt-stack-md">{connectError}</p>}
        </div>
      </main>
    </AppShell>
  );
}
