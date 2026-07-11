Ringkasan Aplikasi

  Saya telah membuat aplikasi restoran lengkap dengan fitur:

  Struktur

  - Server (Node.js + Express)
    - API untuk menu, pesanan, dan meja
    - Socket.io untuk komunikasi realtime
    - PostgreSQL sebagai database
  - Client (React + Vite)
    - Halaman Waiter (Pemesanan)
    - Halaman Kitchen (Dapur)
    - Halaman Cashier (Kasir)

  Fitur Realtime

  - Pesanan baru langsung muncul di Kitchen dan Cashier
  - Update status pesanan langsung terlihat di semua halaman
  - Notifikasi toast untuk setiap perubahan

  Cara Menjalankan

  1. Setup Database PostgreSQL

  Pastikan PostgreSQL sudah terinstall, lalu buat database dan import schema:

  # Buat database
  psql -U postgres -c "CREATE DATABASE restaurant_db;"

  # Import schema
  psql -U postgres -d restaurant_db -f C:\Users\LENOVO\restaurant-app\server\database\schema.sql

  2. Install Dependencies

  cd C:\Users\LENOVO\restaurant-app
  npm run install-all

  3. Sesuaikan konfigurasi database di .env

  Edit file C:\Users\LENOVO\restaurant-app\.env jika kredensial PostgreSQL berbeda.

  4. Jalankan Aplikasi

  npm run dev

  Aplikasi akan berjalan di:
  - Frontend: http://localhost:5173
  - Backend: http://localhost:5000

  Alur Penggunaan

  1. Buka browser ke http://localhost:5173
  2. Pilih halaman sesuai peran:
    - Waiter → Pilih meja, tambahkan menu ke keranjang, kirim pesanan
    - Kitchen → Lihat pesanan, proses dan update status
    - Cashier → Proses pembayaran, cetak struk

  Data menu dan meja sudah tersedia dari sample data di schema.sql.

✻ Brewed for 9m 45s

※ recap: Kamu sedang membuat aplikasi restoran dengan Node.js, React, dan PostgreSQL. Aplikasi sudah selesai dibuat dengan tiga halaman realtime: Waiter, Kitchen, dan Cashier. Sekarang tinggal setup database 
  dan jalankan aplikasi. (disable recaps in /config)