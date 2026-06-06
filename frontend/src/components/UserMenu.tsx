import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MaterialIcon } from './MaterialIcon';
import { getNavLinksForRole } from '../utils/roleAccess';

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  if (!user) return null;

  const initial = user.profile?.username?.[0]?.toUpperCase() ?? '?';
  const navLinks = getNavLinksForRole(user.role).filter((l) => l.id !== 'settings');

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center border border-outline-variant hover:ring-2 hover:ring-primary/30 hover:shadow-md transition-all shrink-0"
        aria-label="Account menu"
        aria-expanded={open}
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(16rem,calc(100vw-2rem))] bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl py-2 z-[60]">
          <div className="px-4 py-2 border-b border-outline-variant/50">
            <p className="font-label-md text-label-md font-bold truncate">{user.profile?.username}</p>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm truncate">{user.email}</p>
            <p className="font-label-md text-[10px] uppercase tracking-wider text-primary mt-1">{user.role.replace('_', ' ')}</p>
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.id}
              to={link.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 hover:bg-surface-container text-on-surface font-body-md text-body-md transition-colors"
            >
              <MaterialIcon name={link.icon} className="text-[18px]" />
              {link.label}
            </Link>
          ))}
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 hover:bg-surface-container text-on-surface font-body-md text-body-md"
          >
            <MaterialIcon name="settings" className="text-[18px]" />
            Settings
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-error-container/20 text-error font-body-md text-body-md border-t border-outline-variant/30 mt-1 transition-colors"
          >
            <MaterialIcon name="logout" className="text-[18px]" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
