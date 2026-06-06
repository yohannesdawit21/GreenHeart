import { Navigate, Route, Routes } from 'react-router-dom'
import { AdvisorControlPage } from './pages/AdvisorControlPage'
import { AuthPage } from './pages/AuthPage'
import { ConsultationRoomPage } from './pages/ConsultationRoomPage'
import { DiscoveryAiPage, DiscoveryPage } from './pages/DiscoveryPage'
import { IncomingCallPage } from './pages/IncomingCallPage'
import { WalletPage } from './pages/WalletPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/discover" element={<DiscoveryPage />} />
      <Route path="/discover/ai" element={<DiscoveryAiPage />} />
      <Route path="/wallet" element={<WalletPage />} />
      <Route path="/advisor" element={<AdvisorControlPage />} />
      <Route path="/consultation" element={<ConsultationRoomPage />} />
      <Route path="/incoming-call" element={<IncomingCallPage />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  )
}
