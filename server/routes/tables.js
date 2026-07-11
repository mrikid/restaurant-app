const express = require('express');
const router = express.Router();

// Get all tables
router.get('/', async (req, res) => {
  const db = req.app.get('db');
  try {
    const result = await db.query('SELECT * FROM tables ORDER BY table_number');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get table by ID
router.get('/:id', async (req, res) => {
  const db = req.app.get('db');
  try {
    const result = await db.query('SELECT * FROM tables WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new table
router.post('/', async (req, res) => {
  const db = req.app.get('db');
  const { table_number, capacity } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO tables (table_number, capacity, status) VALUES ($1, $2, $3) RETURNING *',
      [table_number, capacity, 'available']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update table status
router.patch('/:id/status', async (req, res) => {
  const db = req.app.get('db');
  const io = req.app.get('io');
  const { status } = req.body;

  try {
    const result = await db.query(
      'UPDATE tables SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    io.to('waiter').emit('table-updated', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete table
router.delete('/:id', async (req, res) => {
  const db = req.app.get('db');
  try {
    await db.query('DELETE FROM tables WHERE id = $1', [req.params.id]);
    res.json({ message: 'Table deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
