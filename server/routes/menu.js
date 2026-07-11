const express = require('express');
const router = express.Router();

// Get all menu items
router.get('/', async (req, res) => {
  const db = req.app.get('db');
  try {
    const result = await db.query('SELECT * FROM menu_items ORDER BY category, name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get menu by category
router.get('/category/:category', async (req, res) => {
  const db = req.app.get('db');
  try {
    const result = await db.query('SELECT * FROM menu_items WHERE category = $1 ORDER BY name', [req.params.category]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new menu item
router.post('/', async (req, res) => {
  const db = req.app.get('db');
  const { name, description, price, category, image_url } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO menu_items (name, description, price, category, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, category, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update menu item
router.put('/:id', async (req, res) => {
  const db = req.app.get('db');
  const { name, description, price, category, image_url, is_available } = req.body;
  try {
    const result = await db.query(
      'UPDATE menu_items SET name = $1, description = $2, price = $3, category = $4, image_url = $5, is_available = $6 WHERE id = $7 RETURNING *',
      [name, description, price, category, image_url, is_available, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete menu item
router.delete('/:id', async (req, res) => {
  const db = req.app.get('db');
  try {
    await db.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
