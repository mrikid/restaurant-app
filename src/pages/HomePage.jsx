import { Link } from 'react-router-dom'
import {
  FiUser,
  FiClipboard,
  FiDollarSign
} from 'react-icons/fi'

function HomePage() {
  const cards = [
    {
      title: 'Waiter / Pemesanan',
      description: 'Halaman untuk memesan makanan dan minuman',
      icon: FiUser,
      path: '/waiter',
      color: 'bg-blue-500 hover:bg-blue-600',
      emoji: '🍽️'
    },
    {
      title: 'Kitchen / Dapur',
      description: 'Halaman untuk melihat dan memproses pesanan',
      icon: FiClipboard,
      path: '/kitchen',
      color: 'bg-green-500 hover:bg-green-600',
      emoji: '👨‍🍳'
    },
    {
      title: 'Cashier / Kasir',
      description: 'Halaman untuk pembayaran dan struk',
      icon: FiDollarSign,
      path: '/cashier',
      color: 'bg-purple-500 hover:bg-purple-600',
      emoji: '💰'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white mb-4">
            🍴 Restaurant App
          </h1>
          <p className="text-xl text-white/80">
            Sistem Pemesanan Restoran Realtime
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.path}
              to={card.path}
              className={`${card.color} rounded-2xl p-6 text-white transform transition-all duration-300 hover:scale-105 shadow-xl`}
            >
              <div className="text-5xl mb-4">{card.emoji}</div>
              <h2 className="text-2xl font-bold mb-2">{card.title}</h2>
              <p className="text-white/80">{card.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center text-white/60">
          <p>Pilih halaman sesuai peran Anda</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
