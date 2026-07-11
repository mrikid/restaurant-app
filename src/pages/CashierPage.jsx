import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import toast from 'react-hot-toast'
import {
  FiHome,
  FiDollarSign,
  FiPrinter,
  FiCreditCard,
  FiCheck
} from 'react-icons/fi'

function CashierPage() {
  const { socket, connected } = useSocket()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountReceived, setAmountReceived] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)

  useEffect(() => {
    if (socket) {
      socket.emit('join', 'cashier')

      socket.on('new-order', (order) => {
        setOrders(prev => [order, ...prev])
      })

      socket.on('order-updated', (updatedOrder) => {
        setOrders(prev => prev.map(o =>
          o.id === updatedOrder.id ? updatedOrder : o
        ))
        if (selectedOrder?.id === updatedOrder.id) {
          setSelectedOrder(updatedOrder)
        }
      })
    }

    fetchOrders()

    return () => {
      if (socket) {
        socket.off('new-order')
        socket.off('order-updated')
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

  const fetchOrderDetails = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      const data = await res.json()
      setSelectedOrder(data)
    } catch (error) {
      toast.error('Gagal memuat detail pesanan')
    }
  }

  const processPayment = async () => {
    if (!selectedOrder) return

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' })
      })

      if (res.ok) {
        toast.success('Pembayaran berhasil!')
        setShowReceipt(true)
      }
    } catch (error) {
      toast.error('Gagal memproses pembayaran')
    }
  }

  const printReceipt = () => {
    // In real app, this would trigger actual printer
    window.print()
    toast.success('Struk dicetak')
  }

  const getChange = () => {
    if (!amountReceived) return 0
    return parseInt(amountReceived) - selectedOrder.total
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Orders that need payment
  const unpaidOrders = orders.filter(o =>
    o.status === 'ready' || o.status === 'served'
  )

  const paidOrders = orders.filter(o => o.status === 'paid')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-purple-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white hover:text-purple-200">
              <FiHome size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">💰 Cashier - Kasir</h1>
              <div className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                {connected ? 'Terhubung' : 'Tidak terhubung'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-lg font-bold mb-4">Pesanan Menunggu Pembayaran</h2>

              {unpaidOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🧾</div>
                  <p>Tidak ada pesanan menunggu pembayaran</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {unpaidOrders.map(order => (
                    <button
                      key={order.id}
                      onClick={() => fetchOrderDetails(order.id)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedOrder?.id === order.id
                          ? 'bg-purple-100 border-2 border-purple-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold">Meja {order.table_number}</div>
                          <div className="text-sm text-gray-500">
                            {formatTime(order.created_at)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-600">
                            Rp {order.total.toLocaleString('id-ID')}
                          </div>
                          <span className={`badge text-xs ${
                            order.status === 'ready' ? 'badge-ready' : 'badge-served'
                          }`}>
                            {order.status === 'ready' ? 'Siap' : 'Terlayani'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Paid Orders */}
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Riwayat Pembayaran</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {paidOrders.slice(0, 5).map(order => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                    >
                      <div>
                        <span className="font-medium">Meja {order.table_number}</span>
                        <span className="text-gray-500 ml-2">
                          {formatTime(order.created_at)}
                        </span>
                      </div>
                      <span className="text-green-600 font-medium">
                        Rp {order.total.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Panel */}
          <div className="lg:col-span-2">
            {!selectedOrder ? (
              <div className="card h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">💳</div>
                  <p className="text-lg">Pilih pesanan untuk diproses</p>
                </div>
              </div>
            ) : showReceipt ? (
              // Receipt View
              <div className="card">
                <div className="text-center border-b pb-4 mb-4">
                  <h2 className="text-2xl font-bold">🍽️ RESTAURANT APP</h2>
                  <p className="text-gray-500">Jl. Contoh No. 123</p>
                  <p className="text-gray-500">Telp: 021-1234567</p>
                </div>

                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>No. Meja:</span>
                    <span className="font-medium">{selectedOrder.table_number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tanggal:</span>
                    <span>{formatDate(selectedOrder.created_at)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Waktu:</span>
                    <span>{formatTime(selectedOrder.created_at)}</span>
                  </div>
                </div>

                <div className="border-b pb-4 mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Item</th>
                        <th className="text-center py-2">Qty</th>
                        <th className="text-right py-2">Harga</th>
                        <th className="text-right py-2">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map(item => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2">{item.name}</td>
                          <td className="text-center py-2">{item.quantity}</td>
                          <td className="text-right py-2">
                            {item.price.toLocaleString('id-ID')}
                          </td>
                          <td className="text-right py-2 font-medium">
                            {(item.price * item.quantity).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-right mb-6">
                  <div className="text-2xl font-bold text-purple-600">
                    TOTAL: Rp {selectedOrder.total.toLocaleString('id-ID')}
                  </div>
                  <div className="text-sm text-gray-500">
                    Pembayaran: {paymentMethod === 'cash' ? 'Tunai' : 'Kartu'}
                  </div>
                  {paymentMethod === 'cash' && amountReceived && (
                    <>
                      <div className="text-sm text-gray-500">
                        Diterima: Rp {parseInt(amountReceived).toLocaleString('id-ID')}
                      </div>
                      <div className="text-sm text-gray-500">
                        Kembalian: Rp {getChange().toLocaleString('id-ID')}
                      </div>
                    </>
                  )}
                </div>

                <div className="text-center text-gray-500 text-sm mb-6">
                  <p>Terima kasih atas kunjungan Anda!</p>
                  <p>Selamat menikmati 😊</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowReceipt(false)
                      setSelectedOrder(null)
                      setAmountReceived('')
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Selesai
                  </button>
                  <button
                    onClick={printReceipt}
                    className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <FiPrinter /> Cetak Struk
                  </button>
                </div>
              </div>
            ) : (
              // Payment Form
              <div className="card">
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">Meja {selectedOrder.table_number}</h2>
                      <p className="text-gray-500">
                        {formatDate(selectedOrder.created_at)} - {formatTime(selectedOrder.created_at)}
                      </p>
                    </div>
                    <span className={`badge ${
                      selectedOrder.status === 'ready' ? 'badge-ready' : 'badge-served'
                    }`}>
                      {selectedOrder.status === 'ready' ? 'Siap' : 'Terlayani'}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-b pb-4 mb-4">
                  <h3 className="font-medium mb-2">Detail Pesanan</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500 ml-2">x{item.quantity}</span>
                        </div>
                        <span className="font-medium">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="border-b pb-4 mb-4">
                  <h3 className="font-medium mb-3">Metode Pembayaran</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'cash'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">💵</div>
                      <div className="font-medium">Tunai</div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">💳</div>
                      <div className="font-medium">Kartu</div>
                    </button>
                  </div>
                </div>

                {/* Cash Payment */}
                {paymentMethod === 'cash' && (
                  <div className="border-b pb-4 mb-4">
                    <h3 className="font-medium mb-2">Jumlah Uang Diterima</h3>
                    <input
                      type="number"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      placeholder="Masukkan jumlah uang"
                      className="input text-xl font-medium"
                    />
                    {amountReceived && parseInt(amountReceived) >= selectedOrder.total && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-600">Kembalian:</div>
                        <div className="text-2xl font-bold text-green-600">
                          Rp {getChange().toLocaleString('id-ID')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Total */}
                <div className="bg-purple-50 p-4 rounded-lg mb-6">
                  <div className="text-sm text-gray-600">Total Pembayaran</div>
                  <div className="text-3xl font-bold text-purple-600">
                    Rp {selectedOrder.total.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="btn btn-secondary flex-1"
                  >
                    Batal
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={paymentMethod === 'cash' && (!amountReceived || parseInt(amountReceived) < selectedOrder.total)}
                    className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <FiCheck /> Proses Pembayaran
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CashierPage
