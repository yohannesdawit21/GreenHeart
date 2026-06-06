import { useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
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
import type { IncomingCallDispatchPayload } from '@shared/contracts/socket.events'

export default function App() {
  const { socket } = useSocket()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!socket || !user || user.role !== 'advisor') return

    const handleIncomingCall = (payload: IncomingCallDispatchPayload) => {
      console.log('Incoming call dispatch received', payload)
      navigate(`/incoming-call?sessionId=${payload.sessionId}&clientName=${payload.clientName}&duration=${payload.durationMinutes}`)
    }

    socket.on('incoming_call_dispatch', handleIncomingCall)

    return () => {
      socket.off('incoming_call_dispatch', handleIncomingCall)
    }
  }, [socket, user, navigate])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/advisor-apply" element={<AdvisorApplyPage />} />
      <Route path="/discover" element={<DiscoveryPage />} />
      <Route path="/discover/ai" element={<DiscoveryAiPage />} />
      <Route path="/wallet" element={<WalletPage />} />
      <Route path="/advisor" element={<AdvisorControlPage />} />
      <Route path="/partner" element={<PartnerDashboardPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/consultation" element={<ConsultationRoomPage />} />
      <Route path="/verification/:interviewId" element={<VerificationRoomPage />} />
      <Route path="/incoming-call" element={<IncomingCallPage />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  )
}
