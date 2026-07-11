import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { SocketProvider } from './context/SocketContext'
import HomePage from './pages/HomePage'
import WaiterPage from './pages/WaiterPage'
import KitchenPage from './pages/KitchenPage'
import CashierPage from './pages/CashierPage'

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/waiter" element={<WaiterPage />} />
          <Route path="/kitchen" element={<KitchenPage />} />
          <Route path="/cashier" element={<CashierPage />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  )
}

export default App
