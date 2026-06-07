import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { appShellMainClass, DashboardAlert, FormError, LoadingSpinner } from '../components/layout/dashboard-ui';
import { btnPrimary } from '../components/layout/buttonStyles';
import { MaterialIcon } from '../components/MaterialIcon';
import { userService } from '../api/user.service';
import { sessionService } from '../api/session.service';
import { useAuth } from '../context/AuthContext';
import { getApiErrorCode, getApiErrorMessage } from '../utils/apiError';
import { parseAdvisorApplicationBio } from '../utils/advisorApplicationBio';
import {
  getAdvisorCredentialSummary,
  getAdvisorFocusLabel,
  getAdvisorLanguagesSummary,
} from '@shared/advisor/discoverUtils';
import { getProfessionLabel } from '@shared/advisor/credentialOptions';
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
    } catch (err: unknown) {
      const code = getApiErrorCode(err)
      if (code === 'INSUFFICIENT_FUNDS') setConnectError('Insufficient coins — visit your wallet first.')
      else if (code === 'ADVISOR_OFFLINE') setConnectError('Advisor is offline.')
      else if (code === 'ADVISOR_NOT_VERIFIED') setConnectError('This advisor is not verified yet.')
      else setConnectError(getApiErrorMessage(err, 'Could not connect.'))
    }
  };

  const parsed = advisor ? parseAdvisorApplicationBio(advisor.bio, advisor.credentials) : null;
  const headline = parsed?.professionalTitle ?? parsed?.professionType ?? advisor?.bio.split('.')[0] ?? '';
  const approachText = parsed?.approach ?? advisor?.bio ?? '';
  const focusLabel = advisor ? getAdvisorFocusLabel(advisor) : undefined;
  const credentialSummary = advisor ? getAdvisorCredentialSummary(advisor) : undefined;
  const languagesSummary = advisor ? getAdvisorLanguagesSummary(advisor) : undefined;

  if (loading) {
    return (
      <AppShell activeNav="discover" showSearch={false}>
        <LoadingSpinner label="Loading advisor profile..." />
      </AppShell>
    );
  }

  if (!advisor || error) {
    return (
      <AppShell showSearch={false}>
      <main className={`${appShellMainClass} max-w-2xl text-center`}>
          <DashboardAlert variant="error" icon="error">{error || 'Advisor not found'}</DashboardAlert>
          <Link to="/discover" className="text-primary hover:underline inline-block mt-stack-md">Back to Discover</Link>
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
            {advisor.avatarUrl ? (
              <img
                src={advisor.avatarUrl}
                alt={`${advisor.username} profile`}
                className="w-20 h-20 rounded-full object-cover border-2 border-surface-container-low shadow-sm shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                <MaterialIcon name="person" className="text-4xl text-on-surface-variant" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 className="font-display-md text-display-md">{advisor.username}</h1>
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-1 shrink-0 ${
                    advisor.isOnline
                      ? 'bg-secondary-container/40 border border-secondary/30'
                      : 'bg-surface-container-low border border-outline-variant'
                  }`}
                >
                  {advisor.isOnline && <span className="w-2 h-2 rounded-full bg-vibrant-coral pulse-dot" />}
                  <span className={`text-[10px] uppercase tracking-wider font-label-md ${advisor.isOnline ? 'text-secondary' : 'text-on-surface-variant'}`}>
                    {advisor.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <p className="text-on-surface-variant font-body-md">{headline}</p>
              {(credentialSummary || advisor.credentials?.professionType) && (
                <p className="text-xs text-outline mt-1">
                  {credentialSummary ??
                    (advisor.credentials?.professionType
                      ? getProfessionLabel(advisor.credentials.professionType)
                      : '')}
                </p>
              )}
              {focusLabel && (
                <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                  <MaterialIcon name="medical_services" className="text-[14px] text-primary" />
                  {focusLabel}
                </p>
              )}
              {languagesSummary && (
                <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                  <MaterialIcon name="translate" className="text-[14px] text-primary" />
                  {languagesSummary}
                </p>
              )}
              {parsed?.yearsExperience && (
                <p className="text-xs text-on-surface-variant mt-1">
                  {parsed.yearsExperience} years experience
                </p>
              )}
              {parsed?.issuingRegion && (
                <p className="text-xs text-outline mt-1">Licensed in {parsed.issuingRegion}</p>
              )}
              <div className="flex items-center gap-1 mt-2">
                <MaterialIcon name="star" className="text-primary text-sm" />
                <span className="text-sm text-on-surface-variant">
                  {(advisor.rating ?? 5.0).toFixed(1)} rating
                  {advisor.reviewCount != null && ` · ${advisor.reviewCount} reviews`}
                </span>
              </div>
            </div>
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant mb-stack-md whitespace-pre-line">{approachText}</p>

          {advisor.tags.length > 0 && (
            <div className="mb-stack-md">
              <p className="font-label-md text-xs uppercase tracking-wide text-outline mb-2">Specialties</p>
              <div className="flex flex-wrap gap-2">
                {advisor.tags.map((tag) => (
                  <span key={tag} className="bg-surface-container px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {parsed?.additionalCertifications && (
            <p className="text-sm text-on-surface-variant mb-stack-md">
              <span className="font-label-md text-outline">Certifications: </span>
              {parsed.additionalCertifications}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-stack-md border-t border-outline-variant pt-stack-md">
            <div className="min-w-0">
              <span className="font-bold text-lg">{advisor.coinRatePerSession}</span>
              <span className="text-on-surface-variant ml-1">coins / session</span>
            </div>
            {user?.role === 'client' && (
              <button
                type="button"
                onClick={handleConnect}
                disabled={!advisor.isOnline}
                className={`w-full sm:w-auto px-6 py-3 font-label-md ${
                  advisor.isOnline
                    ? `${btnPrimary}`
                    : 'cursor-not-allowed bg-surface-container text-outline rounded-lg opacity-70'
                }`}
              >
                {advisor.isOnline ? 'Connect Now' : 'Advisor offline'}
              </button>
            )}
          </div>

          {connectError && <FormError>{connectError}</FormError>}
        </div>
      </main>
    </AppShell>
  );
}
