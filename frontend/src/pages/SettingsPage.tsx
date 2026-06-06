import { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { appShellMainClass, DashboardHeader, DashboardAlert } from '../components/layout/dashboard-ui';
import { btnPrimary } from '../components/layout/buttonStyles';
import { MaterialIcon } from '../components/MaterialIcon';
import { userService } from '../api/user.service';
import { useAuth } from '../context/AuthContext';

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [tags, setTags] = useState('');
  const [coinRate, setCoinRate] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.profile) {
      setUsername(user.profile.username);
      setBio(user.profile.bio ?? '');
      setTags((user.profile.tags ?? []).join(', '));
      setCoinRate(user.profile.coinRatePerSession ?? 0);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await userService.updateProfile({
        username,
        bio,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        coinRatePerSession: user?.role === 'advisor' ? coinRate : undefined,
      });
      await refreshUser();
      setMessage('Profile updated successfully.');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell activeNav="settings" showSearch={false}>
      <main className={`${appShellMainClass} max-w-xl flex flex-col gap-stack-lg`}>
        <DashboardHeader
          title="Settings"
          description="Manage your profile and account preferences."
        />

        {message && (
          <div className="mb-stack-md">
            <DashboardAlert variant="success" icon="check_circle">{message}</DashboardAlert>
          </div>
        )}
        {error && (
          <div className="mb-stack-md">
            <DashboardAlert variant="error" icon="error">{error}</DashboardAlert>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg flex flex-col gap-stack-md">
          <div>
            <label className="block font-label-md text-on-surface-variant mb-unit">Email</label>
            <input
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 opacity-70"
              value={user?.email ?? ''}
              disabled
            />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-unit">Display name</label>
            <input
              className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-unit">Bio</label>
            <textarea
              className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 min-h-[100px]"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          {user?.role === 'advisor' && (
            <>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-unit">Specialties (comma-separated)</label>
                <input
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-unit">Coins per session</label>
                <input
                  type="number"
                  min={0}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2"
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
          <button
            type="submit"
            disabled={saving}
            className={`${btnPrimary} py-3 w-full`}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </main>
    </AppShell>
  );
}
