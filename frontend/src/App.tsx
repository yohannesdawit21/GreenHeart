import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { LoadingSpinner } from './components/layout/dashboard-ui'
import { AdvisorApplyPage } from './pages/AdvisorApplyPage'
import { AdvisorProfilePage } from './pages/AdvisorProfilePage'
import { DiscoveryAiPage, DiscoveryPage } from './pages/DiscoveryPage'
import { AuthPage } from './pages/AuthPage'
import { SettingsPage } from './pages/SettingsPage'
import { WalletPage } from './pages/WalletPage'
import { WorkflowGuidePage } from './pages/WorkflowGuidePage'

const AdvisorControlPage = lazy(() => import('./pages/AdvisorControlPage').then((m) => ({ default: m.AdvisorControlPage })))
const PartnerDashboardPage = lazy(() => import('./pages/PartnerDashboardPage').then((m) => ({ default: m.PartnerDashboardPage })))
const AdminPartnersPage = lazy(() => import('./pages/admin/AdminPartnersPage').then((m) => ({ default: m.AdminPartnersPage })))
const AdminAdvisorsPage = lazy(() => import('./pages/admin/AdminAdvisorsPage').then((m) => ({ default: m.AdminAdvisorsPage })))
const VerificationRoomPage = lazy(() => import('./pages/VerificationRoomPage').then((m) => ({ default: m.VerificationRoomPage })))
const WaitingSessionPage = lazy(() => import('./pages/WaitingSessionPage').then((m) => ({ default: m.WaitingSessionPage })))
const ConsultationRoomPage = lazy(() => import('./pages/ConsultationRoomPage').then((m) => ({ default: m.ConsultationRoomPage })))
const IncomingCallPage = lazy(() => import('./pages/IncomingCallPage').then((m) => ({ default: m.IncomingCallPage })))
const IncomingVerificationPage = lazy(() => import('./pages/IncomingVerificationPage').then((m) => ({ default: m.IncomingVerificationPage })))
import { ClientAreaRoute, GuestAuthRoute, ProtectedRoute } from './components/ProtectedRoute'
import { HomeRedirect, NotFoundRedirect, TrailingSlashRedirect } from './components/RouteRedirects'
import { useSocket } from './context/SocketContext'
import { useAuth } from './context/AuthContext'
import type { IncomingCallDispatchPayload } from '@shared/contracts/socket.events'
import { notifyIncomingCall, playIncomingCallChime } from './utils/notifications'

export default function App() {
  const { socket } = useSocket()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!socket || !user || user.role !== 'advisor') return

    const handleIncomingCall = (payload: IncomingCallDispatchPayload) => {
      playIncomingCallChime()
      notifyIncomingCall(payload.clientName, payload.durationMinutes)
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
    <>
      <TrailingSlashRedirect />
      <Suspense fallback={<LoadingSpinner label="Loading page…" />}>
      <Routes>
      <Route path="/" element={<HomeRedirect />} />

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
      <Route path="/workflow" element={<WorkflowGuidePage />} />

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
            <Navigate to="/admin/partners" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/partners"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminPartnersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/advisors"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminAdvisorsPage />
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
        path="/incoming-verification"
        element={
          <ProtectedRoute roles={['advisor']}>
            <IncomingVerificationPage />
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

      <Route path="*" element={<NotFoundRedirect />} />
      </Routes>
      </Suspense>
    </>
  )
}
