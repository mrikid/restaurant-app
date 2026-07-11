const express = require('express');
const router = express.Router();

// Get all orders
router.get('/', async (req, res) => {
  const db = req.app.get('db');
  try {
    const result = await db.query(`
      SELECT o.*, t.table_number
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order by ID with items
router.get('/:id', async (req, res) => {
  const db = req.app.get('db');
  try {
    const orderResult = await db.query(`
      SELECT o.*, t.table_number
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      WHERE o.id = $1
    `, [req.params.id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const itemsResult = await db.query(`
      SELECT oi.*, mi.name, mi.price
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = $1
    `, [req.params.id]);

    const order = orderResult.rows[0];
    order.items = itemsResult.rows;
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get orders by status
router.get('/status/:status', async (req, res) => {
  const db = req.app.get('db');
  try {
    const result = await db.query(`
      SELECT o.*, t.table_number
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      WHERE o.status = $1
      ORDER BY o.created_at ASC
    `, [req.params.status]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new order
router.post('/', async (req, res) => {
  const db = req.app.get('db');
  const io = req.app.get('io');
  const { table_id, items, notes } = req.body;

  try {
    await db.query('BEGIN');

    // Calculate total
    let total = 0;
    for (const item of items) {
      const menuResult = await db.query('SELECT price FROM menu_items WHERE id = $1', [item.menu_item_id]);
      total += menuResult.rows[0].price * item.quantity;
    }

    // Create order
    const orderResult = await db.query(
      'INSERT INTO orders (table_id, total, notes, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [table_id, total, notes || '', 'pending']
    );

    const order = orderResult.rows[0];

    // Add order items
    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, notes) VALUES ($1, $2, $3, $4)',
        [order.id, item.menu_item_id, item.quantity, item.notes || '']
      );
    }

    // Get complete order with items
    const itemsResult = await db.query(`
      SELECT oi.*, mi.name, mi.price
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = $1
    `, [order.id]);

    const tableResult = await db.query('SELECT table_number FROM tables WHERE id = $1', [table_id]);
    order.items = itemsResult.rows;
    order.table_number = tableResult.rows[0].table_number;

    await db.query('COMMIT');

    // Emit to kitchen and cashier
    io.to('kitchen').emit('new-order', order);
    io.to('cashier').emit('new-order', order);

    res.status(201).json(order);
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  const db = req.app.get('db');
  const io = req.app.get('io');
  const { status } = req.body;

  try {
    const result = await db.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    const order = result.rows[0];

    // Get table number
    const tableResult = await db.query('SELECT table_number FROM tables WHERE id = $1', [order.table_id]);
    order.table_number = tableResult.rows[0].table_number;

    // Get items
    const itemsResult = await db.query(`
      SELECT oi.*, mi.name, mi.price
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = $1
    `, [order.id]);
    order.items = itemsResult.rows;

    // Emit to all relevant parties
    io.to('kitchen').emit('order-updated', order);
    io.to('cashier').emit('order-updated', order);
    io.to('waiter').emit('order-updated', order);

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order item status (for kitchen)
router.patch('/items/:itemId/status', async (req, res) => {
  const db = req.app.get('db');
  const io = req.app.get('io');
  const { status } = req.body;

  try {
    const result = await db.query(
      'UPDATE order_items SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.itemId]
    );

    const item = result.rows[0];

    // Check if all items in order are done
    const checkResult = await db.query(
      'SELECT COUNT(*) as pending FROM order_items WHERE order_id = $1 AND status != $2',
      [item.order_id, 'ready']
    );

    if (parseInt(checkResult.rows[0].pending) === 0) {
      await db.query('UPDATE orders SET status = $1 WHERE id = $2', ['ready', item.order_id]);
    }

    io.to('kitchen').emit('item-updated', item);
    io.to('waiter').emit('item-updated', item);

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  const db = req.app.get('db');
  try {
    await db.query('DELETE FROM order_items WHERE order_id = $1', [req.params.id]);
    await db.query('DELETE FROM orders WHERE id = $1', [req.params.id]);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
