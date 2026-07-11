# Restaurant App - Sistem Pemesanan Restoran Realtime

Aplikasi restoran dengan fitur realtime untuk pemesanan makanan yang terkoneksi antara waiter, dapur, dan kasir.

## Fitur

- **Halaman Waiter**: Pemesanan makanan dengan pemilihan meja dan menu
- **Halaman Kitchen**: Tampilan pesanan untuk diproses dapur dengan update realtime
- **Halaman Cashier**: Proses pembayaran dengan struk digital
- **Realtime Communication**: Semua perubahan langsung terupdate di semua halaman

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Realtime**: Socket.io

## Struktur Project

```
restaurant-app/
├── server/
│   ├── index.js           # Entry point server
│   ├── routes/
│   │   ├── menu.js        # API menu
│   │   ├── orders.js      # API pesanan
│   │   └── tables.js      # API meja
│   └── database/
│       └── schema.sql     # Schema database
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # Halaman utama
│   │   │   ├── WaiterPage.jsx    # Halaman waiter
│   │   │   ├── KitchenPage.jsx   # Halaman dapur
│   │   │   └── CashierPage.jsx   # Halaman kasir
│   │   ├── context/
│   │   │   └── SocketContext.jsx # Socket.io context
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── package.json
└── .env
```

## Instalasi

### 1. Setup PostgreSQL Database

```bash
# Buat database
createdb restaurant_db

# Atau menggunakan psql
psql -U postgres
CREATE DATABASE restaurant_db;
\q

# Import schema
psql -U postgres -d restaurant_db -f server/database/schema.sql
```

### 2. Install Dependencies

```bash
# Install semua dependencies (server + client)
npm run install-all
```

### 3. Konfigurasi Environment

Edit file `.env` sesuai konfigurasi database Anda:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=restaurant_db
PORT=5000
NODE_ENV=development
```

### 4. Jalankan Aplikasi

```bash
# Jalankan server dan client secara bersamaan
npm run dev
```

Aplikasi akan berjalan di:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Penggunaan

1. Buka http://localhost:5173 di browser
2. Pilih halaman sesuai peran:
   - **Waiter**: Untuk memasukkan pesanan
   - **Kitchen**: Untuk memproses pesanan
   - **Cashier**: Untuk memproses pembayaran

### Alur Pemesanan

1. **Waiter** memilih meja dan menambahkan menu ke keranjang
2. Pesanan dikirim ke **Kitchen** secara realtime
3. **Kitchen** memproses pesanan dan mengupdate status
4. Setelah selesai, pesanan siap untuk **Cashier**
5. **Cashier** memproses pembayaran dan mencetak struk

## API Endpoints

### Menu
- `GET /api/menu` - Mendapatkan semua menu
- `GET /api/menu/category/:category` - Mendapatkan menu per kategori
- `POST /api/menu` - Menambah menu baru
- `PUT /api/menu/:id` - Update menu
- `DELETE /api/menu/:id` - Hapus menu

### Orders
- `GET /api/orders` - Mendapatkan semua pesanan
- `GET /api/orders/:id` - Mendapatkan detail pesanan
- `GET /api/orders/status/:status` - Mendapatkan pesanan per status
- `POST /api/orders` - Membuat pesanan baru
- `PATCH /api/orders/:id/status` - Update status pesanan
- `PATCH /api/orders/items/:itemId/status` - Update status item

### Tables
- `GET /api/tables` - Mendapatkan semua meja
- `GET /api/tables/:id` - Mendapatkan detail meja
- `POST /api/tables` - Menambah meja baru
- `PATCH /api/tables/:id/status` - Update status meja
- `DELETE /api/tables/:id` - Hapus meja

## Socket Events

### Client to Server
- `join` - Bergabung ke room berdasarkan peran (waiter, kitchen, cashier)

### Server to Client
- `new-order` - Pesanan baru diterima
- `order-updated` - Status pesanan diperbarui
- `item-updated` - Status item diperbarui
- `table-updated` - Status meja diperbarui

## Development

```bash
# Jalankan server saja
npm run server

# Jalankan client saja
npm run client

# Build untuk production
npm run build
```

## License

MIT
