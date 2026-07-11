import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import toast from 'react-hot-toast'
import {
  FiHome,
  FiClock,
  FiCheckCircle,
  FiPlay,
  FiCheck
} from 'react-icons/fi'

function KitchenPage() {
  const { socket, connected } = useSocket()
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    if (socket) {
      socket.emit('join', 'kitchen')

      socket.on('new-order', (order) => {
        toast.success(`Pesanan baru dari Meja ${order.table_number}!`)
        setOrders(prev => [order, ...prev])
      })

      socket.on('order-updated', (updatedOrder) => {
        setOrders(prev => prev.map(o =>
          o.id === updatedOrder.id ? updatedOrder : o
        ))
      })

      socket.on('item-updated', (updatedItem) => {
        setOrders(prev => prev.map(order => {
          if (order.id === updatedItem.order_id) {
            return {
              ...order,
              items: order.items.map(item =>
                item.id === updatedItem.id ? updatedItem : item
              )
            }
          }
          return order
        }))
      })
    }

    fetchOrders()

    return () => {
      if (socket) {
        socket.off('new-order')
        socket.off('order-updated')
        socket.off('item-updated')
      }
    }
  }, [socket])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data)
    } catch (error) {
      toast.error('Gagal memuat data pesanan')
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      toast.success('Status pesanan diperbarui')
    } catch (error) {
      toast.error('Gagal memperbarui status')
    }
  }

  const updateItemStatus = async (itemId, status) => {
    try {
      await fetch(`/api/orders/items/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
    } catch (error) {
      toast.error('Gagal memperbarui item')
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit lalu`

    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours} jam lalu`
  }

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true
    return order.status === activeTab
  })

  const statusConfig = {
    pending: { label: 'Menunggu', color: 'bg-yellow-500', icon: FiClock },
    preparing: { label: 'Diproses', color: 'bg-blue-500', icon: FiPlay },
    ready: { label: 'Siap', color: 'bg-green-500', icon: FiCheck },
    served: { label: 'Terlayani', color: 'bg-purple-500', icon: FiCheckCircle },
    paid: { label: 'Dibayar', color: 'bg-gray-500', icon: FiCheckCircle }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white hover:text-green-200">
              <FiHome size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">👨‍🍳 Kitchen - Dapur</h1>
              <div className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                {connected ? 'Terhubung' : 'Tidak terhubung'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-200'
            }`}
          >
            Menunggu ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('preparing')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'preparing'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-200'
            }`}
          >
            Diproses ({orders.filter(o => o.status === 'preparing').length})
          </button>
          <button
            onClick={() => setActiveTab('ready')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'ready'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-200'
            }`}
          >
            Siap ({orders.filter(o => o.status === 'ready').length})
          </button>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍳</div>
            <p className="text-gray-500 text-lg">Tidak ada pesanan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                className={`card border-l-4 ${
                  order.status === 'pending' ? 'border-yellow-500' :
                  order.status === 'preparing' ? 'border-blue-500' :
                  order.status === 'ready' ? 'border-green-500' :
                  'border-gray-500'
                }`}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">Meja {order.table_number}</span>
                      <span className={`badge ${
                        order.status === 'pending' ? 'badge-pending' :
                        order.status === 'preparing' ? 'badge-preparing' :
                        'badge-ready'
                      }`}>
                        {statusConfig[order.status]?.label}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {getTimeAgo(order.created_at)}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.items?.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2 rounded ${
                        item.status === 'ready' ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.status === 'ready' && (
                          <FiCheck className="text-green-500" />
                        )}
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            x{item.quantity}
                            {item.notes && (
                              <span className="ml-2 text-orange-500">
                                ({item.notes})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {order.status !== 'ready' && order.status !== 'served' && order.status !== 'paid' && (
                        <select
                          value={item.status || 'pending'}
                          onChange={(e) => updateItemStatus(item.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="pending">Menunggu</option>
                          <option value="preparing">Diproses</option>
                          <option value="ready">Siap</option>
                        </select>
                      )}
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="bg-orange-50 p-2 rounded text-sm mb-4">
                    <span className="font-medium">Catatan:</span> {order.notes}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <FiPlay /> Proses
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="btn btn-success flex-1 flex items-center justify-center gap-2"
                    >
                      <FiCheck /> Selesai
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'served')}
                      className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle /> Terlayani
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default KitchenPage
