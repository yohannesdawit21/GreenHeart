const INCOMING_CALL_PERMISSION_KEY = 'gh_incoming_call_permission_requested';

export async function requestAdvisorNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission;
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export function shouldRequestIncomingCallPermission(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'default') return false;
  return sessionStorage.getItem(INCOMING_CALL_PERMISSION_KEY) !== '1';
}

export function markIncomingCallPermissionRequested(): void {
  sessionStorage.setItem(INCOMING_CALL_PERMISSION_KEY, '1');
}

export function notifyIncomingCall(clientName: string, durationMinutes: number): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (document.hasFocus()) return;

  try {
    const notification = new Notification('Incoming consultation request', {
      body: `${clientName} is requesting a ${durationMinutes}-minute session.`,
      tag: 'greenheart-incoming-call',
      requireInteraction: true,
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch {
    /* ignore unsupported environments */
  }
}

export function playIncomingCallChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.value = 0.04;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.15);
    void ctx.close();
  } catch {
    /* audio optional */
  }
}
