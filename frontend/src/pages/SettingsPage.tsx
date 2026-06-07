import { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { appShellMainClass, DashboardHeader, DashboardAlert, FormError } from '../components/layout/dashboard-ui';
import { btnPrimary } from '../components/layout/buttonStyles';
import { MaterialIcon } from '../components/MaterialIcon';
import { userService } from '../api/user.service';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/apiError';
import { buildAdvisorBio } from '../utils/advisorApplicationBio';
import type { AdvisorCredentials } from '@shared/contracts/models.advisor';
import { EMPTY_ADVISOR_CREDENTIALS } from '@shared/contracts/models.advisor';
import {
  ALL_REGIONS,
  DEGREE_OPTIONS,
  getCredentialTypesForProfession,
  getIssuingBodiesForCredential,
  LANGUAGE_OPTIONS,
  PROFESSION_TYPES,
  SPECIALTY_CATEGORIES,
} from '@shared/advisor/credentialOptions';

const inputClass =
  'w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const selectClass = `${inputClass} appearance-none cursor-pointer`;

const labelClass = 'block font-label-md text-on-surface-variant mb-unit';

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [approach, setApproach] = useState('');
  const [tags, setTags] = useState('');
  const [coinRate, setCoinRate] = useState(0);
  const [credentials, setCredentials] = useState<AdvisorCredentials>({ ...EMPTY_ADVISOR_CREDENTIALS });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isAdvisor = user?.role === 'advisor';
  const credentialOptions = getCredentialTypesForProfession(credentials.professionType);
  const issuingBodyOptions = credentials.credentialType
    ? getIssuingBodiesForCredential(credentials.credentialType)
    : [];

  useEffect(() => {
    if (!user?.profile) return;
    setUsername(user.profile.username);
    setTags((user.profile.tags ?? []).join(', '));
    setCoinRate(user.profile.coinRatePerSession ?? 0);

    if (user.profile.credentials) {
      setCredentials({ ...EMPTY_ADVISOR_CREDENTIALS, ...user.profile.credentials });
    }

    const bio = user.profile.bio ?? '';
    const approachPart = bio.includes('\n---\n') ? bio.split('\n---\n').slice(1).join('\n---\n') : bio;
    setApproach(approachPart);
  }, [user]);

  const setCredentialField = <K extends keyof AdvisorCredentials>(key: K, value: AdvisorCredentials[K]) => {
    setCredentials((prev) => ({ ...prev, [key]: value }));
  };

  const toggleLanguage = (lang: string) => {
    setCredentials((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload: Parameters<typeof userService.updateProfile>[0] = {
        username,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        coinRatePerSession: isAdvisor ? coinRate : undefined,
      };

      if (isAdvisor) {
        payload.bio = buildAdvisorBio(credentials, approach);
        payload.credentials = credentials;
      } else {
        payload.bio = approach;
      }

      await userService.updateProfile(payload);
      await refreshUser();
      setMessage('Profile updated successfully.');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell activeNav="settings" showSearch={false}>
      <main className={`${appShellMainClass} max-w-2xl flex flex-col gap-stack-lg`}>
        <DashboardHeader
          title="Settings"
          description="Manage your profile and account preferences."
        />

        {message && (
          <DashboardAlert variant="success" icon="check_circle">{message}</DashboardAlert>
        )}

        <form onSubmit={handleSave} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg flex flex-col gap-stack-md">
          <div>
            <label className={labelClass}>Email</label>
            <input className={`${inputClass} opacity-70`} value={user?.email ?? ''} disabled />
          </div>
          <div>
            <label className={labelClass}>Display name</label>
            <input className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          {isAdvisor && (
            <>
              <div className="pt-stack-sm border-t border-outline-variant/40">
                <h3 className="font-label-md text-sm uppercase tracking-wide text-on-surface mb-stack-sm flex items-center gap-2">
                  <MaterialIcon name="badge" className="text-secondary text-base" />
                  Professional credentials
                </h3>
                <div className="grid sm:grid-cols-2 gap-stack-md">
                  <div>
                    <label className={labelClass}>Profession type</label>
                    <select
                      className={selectClass}
                      value={credentials.professionType}
                      onChange={(e) =>
                        setCredentials((prev) => ({
                          ...prev,
                          professionType: e.target.value,
                          credentialType: '',
                          issuingBody: '',
                        }))
                      }
                    >
                      <option value="">Select…</option>
                      {PROFESSION_TYPES.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Credential type</label>
                    <select
                      className={selectClass}
                      value={credentials.credentialType}
                      disabled={!credentials.professionType}
                      onChange={(e) =>
                        setCredentials((prev) => ({
                          ...prev,
                          credentialType: e.target.value,
                          issuingBody: '',
                        }))
                      }
                    >
                      <option value="">Select…</option>
                      {credentialOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Issuing body</label>
                    <select
                      className={selectClass}
                      value={credentials.issuingBody}
                      disabled={!credentials.credentialType}
                      onChange={(e) => setCredentialField('issuingBody', e.target.value)}
                    >
                      <option value="">Select…</option>
                      {issuingBodyOptions.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Region</label>
                    <select
                      className={selectClass}
                      value={credentials.issuingRegion}
                      onChange={(e) => setCredentialField('issuingRegion', e.target.value)}
                    >
                      <option value="">Select…</option>
                      {ALL_REGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>License number</label>
                    <input
                      className={inputClass}
                      value={credentials.licenseNumber}
                      onChange={(e) => setCredentialField('licenseNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Professional title</label>
                    <input
                      className={inputClass}
                      value={credentials.professionalTitle}
                      onChange={(e) => setCredentialField('professionalTitle', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Years of experience</label>
                    <input
                      className={inputClass}
                      type="number"
                      min={0}
                      max={60}
                      value={credentials.yearsExperience || ''}
                      onChange={(e) => setCredentialField('yearsExperience', Number(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Degree</label>
                    <select
                      className={selectClass}
                      value={credentials.degree ?? ''}
                      onChange={(e) => setCredentialField('degree', e.target.value)}
                    >
                      <option value="">Optional</option>
                      {DEGREE_OPTIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Languages</label>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGE_OPTIONS.map((lang) => {
                        const active = credentials.languages.includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => toggleLanguage(lang)}
                            className={`text-xs px-2 py-1 rounded-full border ${
                              active
                                ? 'bg-secondary-container border-secondary'
                                : 'border-outline-variant'
                            }`}
                          >
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Primary focus area</label>
                    <select
                      className={selectClass}
                      value={credentials.specialtyCategory ?? ''}
                      onChange={(e) => setCredentialField('specialtyCategory', e.target.value)}
                    >
                      <option value="">Optional</option>
                      {SPECIALTY_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Approach & who you help</label>
                <textarea
                  className={`${inputClass} min-h-[100px]`}
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Specialties (comma-separated)</label>
                <input className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Coins per session</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={coinRate}
                  onChange={(e) => setCoinRate(Number(e.target.value))}
                />
              </div>
              {user.profile?.verificationStatus && (
                <div className="flex items-center gap-2 text-on-surface-variant font-body-md">
                  <MaterialIcon name="verified" />
                  Verification: <strong>{user.profile.verificationStatus}</strong>
                </div>
              )}
            </>
          )}

          {!isAdvisor && (
            <div>
              <label className={labelClass}>Bio</label>
              <textarea
                className={`${inputClass} min-h-[100px]`}
                value={approach}
                onChange={(e) => setApproach(e.target.value)}
              />
            </div>
          )}

          <button type="submit" disabled={saving} className={`${btnPrimary} py-3 w-full`}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {error && <FormError>{error}</FormError>}
        </form>
      </main>
    </AppShell>
  );
}
