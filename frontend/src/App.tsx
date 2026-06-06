import { useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AdvisorControlPage } from './pages/AdvisorControlPage'
import { AdvisorApplyPage } from './pages/AdvisorApplyPage'
import { AdvisorProfilePage } from './pages/AdvisorProfilePage'
import { PartnerDashboardPage } from './pages/PartnerDashboardPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { VerificationRoomPage } from './pages/VerificationRoomPage'
import { WaitingSessionPage } from './pages/WaitingSessionPage'
import { SettingsPage } from './pages/SettingsPage'
import { AuthPage } from './pages/AuthPage'
import { ConsultationRoomPage } from './pages/ConsultationRoomPage'
import { DiscoveryAiPage, DiscoveryPage } from './pages/DiscoveryPage'
import { IncomingCallPage } from './pages/IncomingCallPage'
import { WalletPage } from './pages/WalletPage'
import { ClientAreaRoute, GuestAuthRoute, ProtectedRoute } from './components/ProtectedRoute'
import { useSocket } from './context/SocketContext'
import { useAuth } from './context/AuthContext'
import { getRoleHome } from './utils/roleAccess'
import type { IncomingCallDispatchPayload } from '@shared/contracts/socket.events'

export default function App() {
  const { socket } = useSocket()
  const { user } = useAuth()
  const navigate = useNavigate()

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

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? getRoleHome(user.role) : '/discover'} replace />} />

      <Route
        path="/auth"
        element={
          <GuestAuthRoute>
            <AuthPage />
          </GuestAuthRoute>
        }
      />
      <Route
        path="/auth/advisor-apply"
        element={
          <GuestAuthRoute>
            <AdvisorApplyPage />
          </GuestAuthRoute>
        }
      />

      <Route
        path="/discover"
        element={
          <ClientAreaRoute>
            <DiscoveryPage />
          </ClientAreaRoute>
        }
      />
      <Route
        path="/discover/ai"
        element={
          <ClientAreaRoute>
            <DiscoveryAiPage />
          </ClientAreaRoute>
        }
      />
      <Route
        path="/advisors/:id"
        element={
          <ClientAreaRoute>
            <AdvisorProfilePage />
          </ClientAreaRoute>
        }
      />

      <Route
        path="/wallet"
        element={
          <ProtectedRoute roles={['client']}>
            <WalletPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute roles={['client', 'advisor', 'partner_doctor', 'admin']}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/advisor"
        element={
          <ProtectedRoute roles={['advisor']}>
            <AdvisorControlPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/partner"
        element={
          <ProtectedRoute roles={['partner_doctor']}>
            <PartnerDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/waiting"
        element={
          <ProtectedRoute roles={['client']}>
            <WaitingSessionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/consultation"
        element={
          <ProtectedRoute roles={['client', 'advisor']}>
            <ConsultationRoomPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verification/:interviewId"
        element={
          <ProtectedRoute roles={['advisor', 'partner_doctor']}>
            <VerificationRoomPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incoming-call"
        element={
          <ProtectedRoute roles={['advisor']}>
            <IncomingCallPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={user ? getRoleHome(user.role) : '/discover'} replace />} />
    </Routes>
  )
}
