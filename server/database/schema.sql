-- Create tables
CREATE TABLE tables (
  id SERIAL PRIMARY KEY,
  table_number INTEGER NOT NULL UNIQUE,
  capacity INTEGER DEFAULT 4,
  status VARCHAR(20) DEFAULT 'available', -- available, occupied, reserved
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100), -- makanan, minuman, dessert, dll
  image_url VARCHAR(500),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  table_id INTEGER REFERENCES tables(id),
  total DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, preparing, ready, served, paid
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, preparing, ready, served
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO tables (table_number, capacity, status) VALUES
(1, 4, 'available'),
(2, 4, 'available'),
(3, 6, 'available'),
(4, 2, 'available'),
(5, 8, 'available'),
(6, 4, 'available'),
(7, 4, 'available'),
(8, 6, 'available');

INSERT INTO menu_items (name, description, price, category) VALUES
-- Makanan
('Nasi Goreng Spesial', 'Nasi goreng dengan telur, ayam, dan sayuran', 25000, 'makanan'),
('Mie Goreng', 'Mie goreng dengan telur dan sayuran', 20000, 'makanan'),
('Ayam Bakar', 'Ayam bakar dengan sambal dan lalapan', 35000, 'makanan'),
('Sate Ayam', '10 tusuk sate ayam dengan bumbu kacang', 30000, 'makanan'),
('Ikan Bakar', 'Ikan bakar dengan sambal dan lalapan', 45000, 'makanan'),
('Soto Ayam', 'Soto ayam dengan nasi dan emping', 22000, 'makanan'),
('Bakso Malang', 'Bakso dengan mie, tahu, dan siomay', 25000, 'makanan'),
('Gado-Gado', 'Sayuran dengan bumbu kacang dan kerupuk', 18000, 'makanan'),
('Nasi Padang', 'Nasi dengan rendang dan ayam pop', 40000, 'makanan'),
('Capcay', 'Capcay sayuran dengan saus tiram', 20000, 'makanan'),

-- Minuman
('Es Teh Manis', 'Teh manis dengan es batu', 5000, 'minuman'),
('Es Jeruk', 'Jeruk segar dengan es batu', 8000, 'minuman'),
('Jus Alpukat', 'Jus alpukat segar', 12000, 'minuman'),
('Jus Mangga', 'Jus mangga segar', 12000, 'minuman'),
('Es Kelapa Muda', 'Kelapa muda dengan es batu', 10000, 'minuman'),
('Kopi Susu', 'Kopi dengan susu', 10000, 'minuman'),
('Teh Tarik', 'Teh susu khas Malaysia', 12000, 'minuman'),
('Air Mineral', 'Air mineral botol', 5000, 'minuman'),

-- Dessert
('Es Krim', 'Es krim vanilla/coklat/strawberry', 10000, 'dessert'),
('Pisang Goreng', 'Pisang goreng dengan madu', 8000, 'dessert'),
('Es Campur', 'Es campur dengan berbagai topping', 15000, 'dessert'),
('Klepon', 'Kue klepon kelapa', 5000, 'dessert');

-- Create index for better performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);
