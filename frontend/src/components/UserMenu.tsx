import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MaterialIcon } from './MaterialIcon';

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

  const initial = user?.profile?.username?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center border border-outline-variant hover:ring-2 hover:ring-primary/30 transition-all"
        aria-label="Account menu"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl py-2 z-50">
          <div className="px-4 py-2 border-b border-outline-variant/50">
            <p className="font-label-md text-label-md font-bold truncate">{user?.profile?.username}</p>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm truncate">{user?.email}</p>
            <p className="font-label-md text-[10px] uppercase tracking-wider text-primary mt-1">{user?.role}</p>
          </div>
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container text-on-surface font-body-md text-body-md"
          >
            <MaterialIcon name="settings" className="text-[18px]" />
            Settings
          </Link>
          {user?.role === 'client' && (
            <Link
              to="/wallet"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container text-on-surface font-body-md text-body-md"
            >
              <MaterialIcon name="account_balance_wallet" className="text-[18px]" />
              Wallet
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-error-container/20 text-error font-body-md text-body-md"
          >
            <MaterialIcon name="logout" className="text-[18px]" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
