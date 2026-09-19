require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { requireAuth, requireBranchAdmin } = require('./middleware');

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 3002;

app.get('/', (req, res) => {
  res.send('Café Doux backend is running!');
});

// ---------- AUTH ROUTES ----------

app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // New signups are always customers; branch admins are created separately (see below)
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, branch_id',
      [name, email, passwordHash, 'customer']
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, role: user.role, branchId: user.branch_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, branchId: user.branch_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, branch_id: user.branch_id },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});


// ---------- PUBLIC BRANCH & MENU ROUTES ----------

app.get('/api/branches', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches ORDER BY city');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

app.get('/api/branches/:branchId/menu', async (req, res) => {
  const { branchId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE branch_id = $1 AND available = true ORDER BY category, name',
      [branchId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});


app.post('/api/orders', requireAuth, async (req, res) => {
  const { branchId, orderType, deliveryAddress, items } = req.body;
  // items is expected to be: [{ menuItemId: 1, quantity: 2 }, ...]

  if (!branchId || !orderType || !items || items.length === 0) {
    return res.status(400).json({ error: 'branchId, orderType, and at least one item are required' });
  }

  if (orderType === 'delivery' && !deliveryAddress) {
    return res.status(400).json({ error: 'Delivery address is required for delivery orders' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Look up current prices for all items, and calculate the total
    let total = 0;
    const itemsWithPrices = [];

    for (const item of items) {
      const menuResult = await client.query(
        'SELECT price FROM menu_items WHERE id = $1 AND branch_id = $2 AND available = true',
        [item.menuItemId, branchId]
      );

      if (menuResult.rows.length === 0) {
        throw new Error(`Menu item ${item.menuItemId} not found or unavailable at this branch`);
      }

      const price = parseFloat(menuResult.rows[0].price);
      total += price * item.quantity;
      itemsWithPrices.push({ ...item, price });
    }

    // Create the order itself
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, branch_id, order_type, delivery_address, total)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, branchId, orderType, deliveryAddress || null, total]
    );
    const order = orderResult.rows[0];

    // Create each order_item, linked to this order
    for (const item of itemsWithPrices) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_order)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.menuItemId, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ order, itemCount: items.length });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to place order' });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`Café Doux backend running on http://localhost:${PORT}`);
});