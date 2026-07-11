import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import toast from 'react-hot-toast'
import {
  FiHome,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiSend,
  FiShoppingCart,
  FiCheck
} from 'react-icons/fi'

function WaiterPage() {
  const { socket, connected } = useSocket()
  const [tables, setTables] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [cart, setCart] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [orderNotes, setOrderNotes] = useState('')

  useEffect(() => {
    if (socket) {
      socket.emit('join', 'waiter')

      socket.on('order-updated', (order) => {
        toast.success(`Pesanan meja ${order.table_number} ${order.status}!`)
      })
    }

    fetchTables()
    fetchMenuItems()
  }, [socket])

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables')
      const data = await res.json()
      setTables(data)
    } catch (error) {
      toast.error('Gagal memuat data meja')
    }
  }

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('/api/menu')
      const data = await res.json()
      setMenuItems(data)
    } catch (error) {
      toast.error('Gagal memuat data menu')
    }
  }

  const addToCart = (item) => {
    const existing = cart.find(c => c.menu_item_id === item.id)
    if (existing) {
      setCart(cart.map(c =>
        c.menu_item_id === item.id
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ))
    } else {
      setCart([...cart, {
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }])
    }
  }

  const removeFromCart = (menuItemId) => {
    setCart(cart.filter(c => c.menu_item_id !== menuItemId))
  }

  const updateQuantity = (menuItemId, delta) => {
    setCart(cart.map(c => {
      if (c.menu_item_id === menuItemId) {
        const newQty = c.quantity + delta
        return newQty > 0 ? { ...c, quantity: newQty } : c
      }
      return c
    }))
  }

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const submitOrder = async () => {
    if (!selectedTable) {
      toast.error('Pilih meja terlebih dahulu')
      return
    }
    if (cart.length === 0) {
      toast.error('Keranjang masih kosong')
      return
    }

    try {
      const orderData = {
        table_id: selectedTable.id,
        items: cart.map(c => ({
          menu_item_id: c.menu_item_id,
          quantity: c.quantity
        })),
        notes: orderNotes
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (res.ok) {
        toast.success('Pesanan berhasil dikirim ke dapur!')
        setCart([])
        setSelectedTable(null)
        setOrderNotes('')
        fetchTables()
      }
    } catch (error) {
      toast.error('Gagal mengirim pesanan')
    }
  }

  const categories = ['all', ...new Set(menuItems.map(item => item.category))]

  const filteredMenu = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory)

  const categoryLabels = {
    all: 'Semua',
    makanan: 'Makanan',
    minuman: 'Minuman',
    dessert: 'Dessert'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white hover:text-blue-200">
              <FiHome size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">🍽️ Waiter - Pemesanan</h1>
              <div className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                {connected ? 'Terhubung' : 'Tidak terhubung'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {/* Table Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">Pilih Meja</h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {tables.map(table => (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`p-3 rounded-lg font-bold transition-all ${
                  selectedTable?.id === table.id
                    ? 'bg-blue-500 text-white ring-4 ring-blue-300'
                    : table.status === 'available'
                      ? 'bg-white text-gray-700 hover:bg-blue-50'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={table.status !== 'available'}
              >
                {table.table_number}
              </button>
            ))}
          </div>
          {selectedTable && (
            <p className="mt-2 text-gray-600">
              Meja {selectedTable.table_number} dipilih (Kapasitas: {selectedTable.capacity} orang)
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Menu</h2>
                <div className="flex gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        activeCategory === cat
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {categoryLabels[cat] || cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredMenu.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    disabled={!item.is_available}
                    className="p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500 truncate">{item.description}</div>
                    <div className="text-blue-600 font-bold mt-1">
                      Rp {item.price.toLocaleString('id-ID')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cart */}
          <div>
            <div className="card sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FiShoppingCart /> Keranjang
                </h2>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  {cart.length} item
                </span>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Keranjang kosong</p>
              ) : (
                <>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.menu_item_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            Rp {item.price.toLocaleString('id-ID')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.menu_item_id, -1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.menu_item_id, 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <FiPlus size={14} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.menu_item_id)}
                            className="w-8 h-8 rounded-full bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <textarea
                    placeholder="Catatan tambahan (opsional)"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="input mt-4 text-sm"
                    rows="2"
                  />

                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between items-center text-lg font-bold mb-4">
                      <span>Total</span>
                      <span className="text-blue-600">
                        Rp {getTotal().toLocaleString('id-ID')}
                      </span>
                    </div>
                    <button
                      onClick={submitOrder}
                      className="btn btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <FiSend /> Kirim Pesanan
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WaiterPage
