import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdvisorControlPage } from './pages/AdvisorControlPage'
import { AdvisorApplyPage } from './pages/AdvisorApplyPage'
import { PartnerDashboardPage } from './pages/PartnerDashboardPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { VerificationRoomPage } from './pages/VerificationRoomPage'
import { AuthPage } from './pages/AuthPage'
import { ConsultationRoomPage } from './pages/ConsultationRoomPage'
import { DiscoveryAiPage, DiscoveryPage } from './pages/DiscoveryPage'
import { IncomingCallPage } from './pages/IncomingCallPage'
import { WalletPage } from './pages/WalletPage'
import { useSocket } from './context/SocketContext'
import { useAuth } from './context/AuthContext'
import type { IncomingCallDispatchPayload, SessionReadyPayload } from '@shared/contracts/socket.events'

export default function App() {
  const { socket } = useSocket()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ringingSessionId, setRingingSessionId] = useState<string | null>(null)

  useEffect(() => {
    if (!socket || !user || user.role !== 'advisor') return

    const handleIncomingCall = (payload: IncomingCallDispatchPayload) => {
      navigate(
        `/incoming-call?sessionId=${encodeURIComponent(payload.sessionId)}&clientName=${encodeURIComponent(payload.clientName)}&duration=${payload.durationMinutes}`,
      )
    }

    socket.on('incoming_call_dispatch', handleIncomingCall)
    return () => {
      socket.off('incoming_call_dispatch', handleIncomingCall)
    }
  }, [socket, user, navigate])

  useEffect(() => {
    if (!socket || !user || user.role !== 'client') return

    const onSessionReady = (payload: SessionReadyPayload) => {
      setRingingSessionId(null)
      navigate(`/consultation?sessionId=${encodeURIComponent(payload.sessionId)}`)
    }

    const onCallProcessing = (payload: { sessionId?: string; status?: string }) => {
      if (payload.status === 'ringing' && payload.sessionId) {
        setRingingSessionId(payload.sessionId)
      }
    }

    socket.on('session_ready', onSessionReady)
    socket.on('call_processing', onCallProcessing)
    return () => {
      socket.off('session_ready', onSessionReady)
      socket.off('call_processing', onCallProcessing)
    }
  }, [socket, user, navigate])

  return (
    <>
      {ringingSessionId && (
        <div className="fixed inset-0 z-[100] bg-[#121d24]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 max-w-md w-full text-center shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Calling advisor…</h2>
            <p className="font-body-md text-on-surface-variant mb-6">
              Waiting for them to accept. Coins are held in escrow until the call starts.
            </p>
            <button
              type="button"
              onClick={() => setRingingSessionId(null)}
              className="text-on-surface-variant font-label-md text-sm hover:underline"
            >
              Dismiss (call continues in background)
            </button>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/advisor-apply" element={<AdvisorApplyPage />} />

        <Route path="/discover" element={<ProtectedRoute roles={['client']}><DiscoveryPage /></ProtectedRoute>} />
        <Route path="/discover/ai" element={<ProtectedRoute roles={['client']}><DiscoveryAiPage /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute roles={['client']}><WalletPage /></ProtectedRoute>} />
        <Route path="/advisor" element={<ProtectedRoute roles={['advisor', 'admin']}><AdvisorControlPage /></ProtectedRoute>} />
        <Route path="/partner" element={<ProtectedRoute roles={['partner_doctor', 'admin']}><PartnerDashboardPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />

        <Route path="/consultation" element={<ProtectedRoute><ConsultationRoomPage /></ProtectedRoute>} />
        <Route path="/verification/:interviewId" element={<ProtectedRoute><VerificationRoomPage /></ProtectedRoute>} />
        <Route path="/incoming-call" element={<ProtectedRoute roles={['advisor', 'admin']}><IncomingCallPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </>
  )
}
