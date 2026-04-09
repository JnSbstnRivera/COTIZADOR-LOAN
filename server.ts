import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const db = new Database('quotes.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT,
    inputs TEXT,
    results TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/quotes', (req, res) => {
    const { clientName, inputs, results } = req.body;
    const stmt = db.prepare('INSERT INTO quotes (client_name, inputs, results) VALUES (?, ?, ?)');
    const info = stmt.run(clientName, JSON.stringify(inputs), JSON.stringify(results));
    res.json({ id: info.lastInsertRowid });
  });

  app.get('/api/quotes', (req, res) => {
    const quotes = db.prepare('SELECT * FROM quotes ORDER BY created_at DESC').all();
    res.json(quotes.map(q => ({
      ...q,
      inputs: JSON.parse(q.inputs as string),
      results: JSON.parse(q.results as string)
    })));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
