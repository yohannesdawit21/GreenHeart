import { useNavigate } from 'react-router-dom'
import { MaterialIcon } from '../components/MaterialIcon'

export function ConsultationRoomPage() {
  const navigate = useNavigate()

  return (
    <div className="bg-midnight h-screen w-screen overflow-hidden text-on-primary font-body-md">
      <div className="absolute inset-0 z-0">
        <img
          alt="Doctor consulting via video"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCagZ7I1Hkz3g7MYw-KCuSaLGukmCFRtTUojgF4MSweEMneyBajd2eBwEVZ9KOV5TrnwbkUYkD0qn-_fcZHAjVZTx4AJ7DOc4E5AshvgYbzryP3bVtQ6c158f3P2SjeI2neKA4tsxIgy0FbNlGKZlAgtTuIa5vM4J2hbc-gdHqmWMfC3p6JCGorqcNXagC4btKrYCtr1RVxUMAgVuvsmIwHeaBTDr-PWdR4-QNJrt5Jbw1lorcjgjIe7HYGDzPr39_-JmRe9aoHwghn"
        />
      </div>

      <div className="absolute top-0 w-full z-20 flex justify-between items-center px-margin-desktop py-stack-md glass-panel-dark">
        <div className="flex items-center gap-stack-sm">
          <MaterialIcon name="videocam" className="text-tertiary-fixed" />
          <span className="font-label-md text-label-md text-on-primary">Dr. Sarah Jenkins</span>
        </div>
        <div className="bg-tertiary text-on-tertiary px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
          <MaterialIcon name="schedule" className="text-sm" />
          <span className="font-label-md text-label-md font-bold">29:45 Remaining</span>
        </div>
        <div className="flex items-center gap-stack-sm">
          <button type="button" className="p-2 rounded-full hover:bg-surface-variant/20 transition-colors">
            <MaterialIcon name="more_vert" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-32 right-margin-desktop w-32 md:w-48 aspect-3/4 z-20 rounded-lg overflow-hidden border-2 border-secondary-container shadow-2xl transition-transform hover:scale-105 cursor-pointer">
        <img
          alt="Patient self-view"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBEflxb_Mav4qKy3GwgKXXhWfw6AdX6bUC-ZVTvplcOHSrNu4Gf5Oin1gz2HmMxUJksaPaW8MGF3yGAwg7ycZD62PPoQVZ5clkos8g4aNV-yQPoWR30_waBdDI7N7xyRn2dAedHg4W1gTGgtmGa7hbN-P2pozDWfpZZzcKvTqHKT4KfOAWUXEwwJx0_dKjvYqFEIiaOXILxYthHEu7nbeIJKd5EtQIOit02hrhNX2FjnYDbhjCdE8EMFCXgNc0Qb3gOiooXUVnqecR"
        />
        <div className="absolute bottom-2 left-2 flex gap-1">
          <div className="bg-black/50 p-1 rounded backdrop-blur-sm">
            <MaterialIcon name="mic" className="text-[16px] text-on-primary" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-stack-lg left-1/2 transform -translate-x-1/2 z-30">
        <div className="glass-panel-dark rounded-full px-stack-md py-stack-sm flex items-center gap-stack-md shadow-2xl">
          <button type="button" className="w-12 h-12 rounded-full bg-surface-variant/20 flex items-center justify-center hover:bg-surface-variant/40 transition-colors border border-outline/30">
            <MaterialIcon name="mic" className="text-on-primary" />
          </button>
          <button type="button" className="w-12 h-12 rounded-full bg-surface-variant/20 flex items-center justify-center hover:bg-surface-variant/40 transition-colors border border-outline/30">
            <MaterialIcon name="videocam" className="text-on-primary" />
          </button>
          <button type="button" className="w-12 h-12 rounded-full bg-surface-variant/20 items-center justify-center hover:bg-surface-variant/40 transition-colors border border-outline/30 hidden md:flex">
            <MaterialIcon name="settings" className="text-on-primary" />
          </button>
          <div className="w-px h-8 bg-outline/30 mx-2" />
          <button
            type="button"
            onClick={() => navigate('/discover')}
            className="bg-tertiary hover:bg-tertiary-container text-on-tertiary font-label-md text-label-md px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
          >
            <MaterialIcon name="call_end" />
            END CONSULTATION
          </button>
        </div>
      </div>
    </div>
  )
}
