import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import { v4 as uuidv4 } from 'uuid'; // You might need to install uuid on backend too or generate on client

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

// --- Health Check ---
app.get('/', (req, res) => {
    res.send('DTH Store API is running');
});

// --- Leads API ---

app.get('/api/leads', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/leads', async (req, res) => {
    const lead = req.body;
    try {
        await pool.query(
            'INSERT INTO leads (id, name, mobile, location, service_type, operator, status, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [lead.id, lead.name, lead.mobile, lead.location, lead.serviceType, lead.operator, lead.status, lead.source, lead.createdAt]
        );
        res.json(lead);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save lead' });
    }
});

app.put('/api/leads/:id', async (req, res) => {
    const { id } = req.params;
    const lead = req.body;
    try {
        await pool.query(
            'UPDATE leads SET status = ?, order_id = ? WHERE id = ?',
            [lead.status, lead.orderId, id]
        );
        // Return updated list or just success
        const [rows] = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update lead' });
    }
});

app.delete('/api/leads/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM leads WHERE id = ?', [id]);
        const [rows] = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete lead' });
    }
});

// --- Products API ---

app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        // Parse JSON features back to array
        const products = rows.map(p => ({
            ...p,
            features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
            originalPrice: p.original_price, // map back to frontend camelCase
            isBestSeller: p.is_best_seller
        }));
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/products', async (req, res) => {
    const p = req.body;
    try {
        await pool.query(
            'INSERT INTO products (id, title, price, original_price, type, features, image, color, is_best_seller) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [p.id, p.title, p.price, p.originalPrice, p.type, JSON.stringify(p.features), p.image, p.color, p.isBestSeller]
        );
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows.map(r => ({ ...r, features: typeof r.features === 'string' ? JSON.parse(r.features) : r.features, originalPrice: r.original_price })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save product' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM products WHERE id = ?', [id]);
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows.map(r => ({ ...r, features: typeof r.features === 'string' ? JSON.parse(r.features) : r.features, originalPrice: r.original_price })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// --- Site Config API ---
app.get('/api/config', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT config_json FROM site_config WHERE id = 1');
        if (rows.length > 0) {
            res.json(rows[0].config_json);
        } else {
            res.status(404).json({ message: 'Config not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/config', async (req, res) => {
    const config = req.body;
    try {
        await pool.query(
            'INSERT INTO site_config (id, config_json) VALUES (1, ?) ON DUPLICATE KEY UPDATE config_json = ?',
            [JSON.stringify(config), JSON.stringify(config)]
        );
        res.json(config);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save config' });
    }
});


// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
