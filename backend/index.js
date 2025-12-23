// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Configuration de la connexion MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'bz8cqjkp3x42en6tapdf-mysql.services.clever-cloud.com',
  user: process.env.DB_USER || 'umjn4dkeatcrzzih',
  password: process.env.DB_PASSWORD || 'oyYxzda31kWXrofYwQvk',
  database: process.env.DB_NAME || 'bz8cqjkp3x42en6tapdf',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Tester la connexion à la base de données
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connexion à MySQL réussie !');
    connection.release();
  } catch (error) {
    console.error('Erreur de connexion à MySQL:', error);
  }
}

testDbConnection();

// Middlewares
app.use(cors({
  origin: ['https://vinexpert-management.vercel.app', 'http://localhost:8080']
}));
app.use(bodyParser.json());
app.use(express.static('public'));

// Middleware pour journaliser les requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ROUTES POUR LES CUVÉES
app.get('/api/cuvees', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cuvees');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des cuvées:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des cuvées" });
  }
});

app.get('/api/cuvees/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cuvees WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Cuvée introuvable" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de la cuvée:', error);
    res.status(500).json({ message: "Erreur lors de la récupération de la cuvée" });
  }
});

app.post('/api/cuvees', async (req, res) => {
  try {
    const { nom, annee, type, cepage, description, prix, stock } = req.body;
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO cuvees (id, nom, annee, type, cepage, description, prix, stock, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [id, nom, annee, type, cepage, description, prix, stock]
    );
    
    const [rows] = await pool.query('SELECT * FROM cuvees WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la création de la cuvée:', error);
    res.status(500).json({ message: "Erreur lors de la création de la cuvée" });
  }
});

app.put('/api/cuvees/:id', async (req, res) => {
  try {
    const { nom, annee, type, cepage, description, prix, stock } = req.body;
    
    // Vérifier si la cuvée existe
    const [existingCuvees] = await pool.query('SELECT * FROM cuvees WHERE id = ?', [req.params.id]);
    
    if (existingCuvees.length === 0) {
      return res.status(404).json({ message: "Cuvée introuvable" });
    }
    
    await pool.query(
      'UPDATE cuvees SET nom = ?, annee = ?, type = ?, cepage = ?, description = ?, prix = ?, stock = ?, updated_at = NOW() WHERE id = ?',
      [nom, annee, type, cepage, description, prix, stock, req.params.id]
    );
    
    const [rows] = await pool.query('SELECT * FROM cuvees WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la cuvée:', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la cuvée" });
  }
});

app.delete('/api/cuvees/:id', async (req, res) => {
  try {
    // Vérifier si la cuvée existe
    const [existingCuvees] = await pool.query('SELECT * FROM cuvees WHERE id = ?', [req.params.id]);
    
    if (existingCuvees.length === 0) {
      return res.status(404).json({ message: "Cuvée introuvable" });
    }
    
    const deletedCuvee = existingCuvees[0];
    
    await pool.query('DELETE FROM cuvees WHERE id = ?', [req.params.id]);
    
    res.json(deletedCuvee);
  } catch (error) {
    console.error('Erreur lors de la suppression de la cuvée:', error);
    res.status(500).json({ message: "Erreur lors de la suppression de la cuvée" });
  }
});

// ROUTES POUR LES ARTICLES DE COMMANDES

app.get('/api/order_items', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM order_items')
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des articles de commandes:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des articles de commandes" });
  }
});

app.post('/api/order_items/:clientId/:orderId', async (req, res) => {
  try {
    const { id, name, price, quantity } = req.body;
    const clientId = req.params.clientId;
    const order_id = req.params.orderId;

    const order_item_id = uuidv4();
    console.log(order_item_id);
    await pool.query(
      'INSERT INTO order_items (id, name, price, quantity, order_id, clientId) VALUES (?, ?, ?, ?, ?, ?)',
      [order_item_id, name, price, quantity, order_id, clientId]
    );
    
    res.json();
  } catch (error) {
    console.error('Erreur lors de la création des articles de commande:', error);
    res.status(500).json({ message: "Erreur lors de la création des articles de commande" });
  }
});

// ROUTES POUR LES COMMANDES


app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des commandes" });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { id, clientId, clientName, items, total, date, status, shippingAddress, country, quantity } = req.body;
    // const id = uuidv4();
    // return items;

    await pool.query(
      'INSERT INTO orders (id, clientId, clientName, total, date, status, shippingAddress, country, quantity) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)',
      [id, clientId, clientName, total, status, shippingAddress, country, quantity]
    );

    items.map((item) => {
      try{
        pool.query(
          'UPDATE cuvees SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.id]
        );
      } catch (error) {
        console.error('Erreur lors de la Mis à jour de la quantité de commande:', error);
        res.status(500).json({ message: "Erreur lors de la mis à jour de la quantité de commande" });
      }
    })

    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ message: "Erreur lors de la création de la commande" });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE clientId = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.json([]);
    }
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({ message: "Erreur lors de la récupération de la commande" });
  }
});

app.put('/api/orders', async (req, res) => {

  try {
    const { id, status } = req.body;
    
    // Vérifier si la commande existe
    const [existingOrder] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    
    if (existingOrder.length === 0) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    
    await pool.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la commande" });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    // Vérifier si la cuvée existe
    const [existingOrders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    
    if (existingOrders.length === 0) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    
    const deletedOrders = existingOrders[0];
    
    await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    
    res.json(deletedOrders);
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande:', error);
    res.status(500).json({ message: "Erreur lors de la suppression de la commande" });
  }
});

// ROUTES POUR LES PRODUCTIONS
app.get('/api/productions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productions');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des productions:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des productions" });
  }
});

app.get('/api/productions/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productions WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Production introuvable" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de la production:', error);
    res.status(500).json({ message: "Erreur lors de la récupération de la production" });
  }
});

app.post('/api/productions', async (req, res) => {
  try {
    const { currentStep, description, endDate, id, name, progress, startDate, status, steps } = req.body;
    
    await pool.query(
      'INSERT INTO productions (id, startDate, endDate, status, description, currentStep, name, progress, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [id, startDate, endDate, status, description, currentStep, name, progress]
    );
    
    const [rows] = await pool.query('SELECT * FROM productions WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la création de la production:', error);
    res.status(500).json({ message: "Erreur lors de la création de la production" });
  }
});

app.put('/api/productions/:id', async (req, res) => {
  try {

    const {  name,status, startDate, endDate, description } = req.body;
    
    // Vérifier si la production existe
    const [existingProductions] = await pool.query('SELECT * FROM productions WHERE id = ?', [req.params.id]);
    
    if (existingProductions.length === 0) {
      return res.status(404).json({ message: "Production introuvable" });
    }
    
    await pool.query(
      'UPDATE productions SET startDate = ?, endDate = ?, status = ?, description = ?, name = ?, updated_at = NOW() WHERE id = ?',
      [startDate, endDate, status, description, name, req.params.id]
    );

    const [rows] = await pool.query('SELECT * FROM productions WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la production:', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la production" });
  }
});

app.delete('/api/productions/:id', async (req, res) => {
  try {
    // Vérifier si la production existe
    const [existingProductions] = await pool.query('SELECT * FROM productions WHERE id = ?', [req.params.id]);

    if (existingProductions.length === 0) {
      return res.status(404).json({ message: "Production introuvable" });
    }
    
    const deletedProduction = existingProductions[0];
    
    await pool.query('DELETE FROM productions WHERE id = ?', [req.params.id]);
    
    res.json(deletedProduction);
  } catch (error) {
    console.error('Erreur lors de la suppression de la production:', error);
    res.status(500).json({ message: "Erreur lors de la suppression de la production" });
  }
});

// Routes pour les étapes de production
app.get('/api/productions/:id/steps', async (req, res) => {
  try {
    // Vérifier si la production existe
    const [productions] = await pool.query('SELECT * FROM productions WHERE id = ?', [req.params.id]);
    
    if (productions.length === 0) {
      return res.status(404).json({ message: "Production introuvable" });
    }
    
    const [steps] = await pool.query('SELECT * FROM production_steps WHERE production_id = ? ORDER BY date ASC', [req.params.id]);
    res.json(steps);
  } catch (error) {
    console.error('Erreur lors de la récupération des étapes de production:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des étapes de production" });
  }
});

// Routes pour les étapes de production
app.get('/api/production/steps', async (req, res) => {
  try {
    // Vérifier si la production existe
    const [productions] = await pool.query('SELECT * FROM production_steps');
    
    res.json(productions);
  } catch (error) {
    console.error('Erreur lors de la récupération des étapes de production:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des étapes de production" });
  }
});

app.post('/api/productions/:id/steps', async (req, res) => {
  try {
    const { name, status, startDate, endDate, duration, id } = req.body;
    
    // Vérifier si la production existe
    const [productions] = await pool.query('SELECT * FROM productions WHERE id = ?', [req.params.id]);
    
    if (productions.length === 0) {
      return res.status(404).json({ message: "Production introuvable" });
    }
    
    const id_prod = req.params.id;
    
    await pool.query(
      'INSERT INTO production_steps (id, production_id, name, status, startDate, endDate, duration, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [id, id_prod, name, status, startDate, endDate, duration]
    );
    
    const [rows] = await pool.query('SELECT * FROM production_steps WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la création de l\'étape de production:', error);
    res.status(500).json({ message: "Erreur lors de la création de l'étape de production" });
  }
});

app.put('/api/productions/:id/steps/:stepId', async (req, res) => {
  try {
    const { name, status, startDate, endDate, duration } = req.body;
    
    const step_id = req.params.stepId;
    const prod_id = req.params.id;
    // Vérifier si l'étape existe
    const [existingSteps] = await pool.query(
      'SELECT * FROM production_steps WHERE id = ? AND production_id = ?',
      [step_id, prod_id]
    );
    
    if (existingSteps.length === 0) {
      return res.status(404).json({ message: "Étape de production introuvable" });
    }
    
    await pool.query(
      'UPDATE production_steps SET name = ?, status = ?, duration = ?, updated_at = NOW() WHERE id = ?',
      [name, status, duration, step_id]
    );
    
    const [rows] = await pool.query('SELECT * FROM production_steps WHERE id = ?', [step_id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'étape de production:', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'étape de production" });
  }
});

app.delete('/api/productions/:id/steps/:stepId', async (req, res) => {
  try {
    // Vérifier si l'étape existe
    const [existingSteps] = await pool.query(
      'SELECT * FROM production_steps WHERE id = ? AND production_id = ?',
      [req.params.stepId, req.params.id]
    );
    
    if (existingSteps.length === 0) {
      return res.status(404).json({ message: "Étape de production introuvable" });
    }
    
    const deletedStep = existingSteps[0];
    
    await pool.query('DELETE FROM production_steps WHERE id = ?', [req.params.stepId]);
    
    res.json(deletedStep);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'étape de production:', error);
    res.status(500).json({ message: "Erreur lors de la suppression de l'étape de production" });
  }
});

// ROUTES POUR LES STOCKS
app.get('/api/stocks', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, c.nom as cuvee_nom 
      FROM stocks s
      JOIN cuvees c ON s.cuvee_id = c.id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des stocks:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des stocks" });
  }
});

app.get('/api/stocks/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, c.nom as cuvee_nom 
      FROM stocks s
      JOIN cuvees c ON s.cuvee_id = c.id
      WHERE s.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Stock introuvable" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du stock:', error);
    res.status(500).json({ message: "Erreur lors de la récupération du stock" });
  }
});

app.post('/api/stocks', async (req, res) => {
  try {
    const { cuvee_id, quantite, emplacement } = req.body;
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO stocks (id, cuvee_id, quantite, emplacement, created_at) VALUES (?, ?, ?, ?, NOW())',
      [id, cuvee_id, quantite, emplacement]
    );
    
    const [rows] = await pool.query(`
      SELECT s.*, c.nom as cuvee_nom 
      FROM stocks s
      JOIN cuvees c ON s.cuvee_id = c.id
      WHERE s.id = ?
    `, [id]);
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la création du stock:', error);
    res.status(500).json({ message: "Erreur lors de la création du stock" });
  }
});

app.put('/api/stocks/:id', async (req, res) => {
  try {
    const { quantite, emplacement } = req.body;
    
    // Vérifier si le stock existe
    const [existingStocks] = await pool.query('SELECT * FROM stocks WHERE id = ?', [req.params.id]);
    
    if (existingStocks.length === 0) {
      return res.status(404).json({ message: "Stock introuvable" });
    }
    
    await pool.query(
      'UPDATE stocks SET quantite = ?, emplacement = ?, updated_at = NOW() WHERE id = ?',
      [quantite, emplacement, req.params.id]
    );
    
    const [rows] = await pool.query(`
      SELECT s.*, c.nom as cuvee_nom 
      FROM stocks s
      JOIN cuvees c ON s.cuvee_id = c.id
      WHERE s.id = ?
    `, [req.params.id]);
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du stock:', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du stock" });
  }
});

app.delete('/api/stocks/:id', async (req, res) => {
  try {
    // Vérifier si le stock existe
    const [existingStocks] = await pool.query(`
      SELECT s.*, c.nom as cuvee_nom 
      FROM stocks s
      JOIN cuvees c ON s.cuvee_id = c.id
      WHERE s.id = ?
    `, [req.params.id]);
    
    if (existingStocks.length === 0) {
      return res.status(404).json({ message: "Stock introuvable" });
    }
    
    const deletedStock = existingStocks[0];
    
    await pool.query('DELETE FROM stocks WHERE id = ?', [req.params.id]);
    
    res.json(deletedStock);
  } catch (error) {
    console.error('Erreur lors de la suppression du stock:', error);
    res.status(500).json({ message: "Erreur lors de la suppression du stock" });
  }
});

// ROUTES POUR LES UTILISATEURS
app.get('/api/users', async (req, res) => {
  try {
    // Ne pas renvoyer les mots de passe dans la réponse
    const [rows] = await pool.query('SELECT id, name, email, password, role, created_at FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    // Ne pas renvoyer les mots de passe dans la réponse
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur" });
  }
});

app.post('/api/users', async (req, res) => {
  console.log(req.body)
  try {
    const { name, email, password, role } = req.body;
    const id = uuidv4();
    
    // Dans une application réelle, vous devriez hacher le mot de passe avec bcrypt
    await pool.query(
      'INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [id, name, email, password, role || 'client']
    );
    
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ message: "Erreur lors de la création de l'utilisateur" });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Vérifier si l'utilisateur existe
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    
    if (existingUsers.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    
    await pool.query(
      'UPDATE users SET name = ?, email = ?, updated_at = NOW() WHERE id = ?',
      [name, email, req.params.id]
    );
    
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
});

app.put('/api/password/:id', async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    // Vérifier si l'utilisateur existe
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    
    if (existingUsers.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    
    await pool.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [newPassword, req.params.id]
    );
    
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du mot de passe" });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    // Vérifier si l'utilisateur existe
    const [existingUsers] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (existingUsers.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    
    const deletedUser = existingUsers[0];
    
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    
    res.json(deletedUser);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
  }
});

// ROUTES POUR LES PARTENAIRES
app.get('/api/partenaire', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT code, name FROM partenaire');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des pays partenaires', error);
    res.status(500).json({ message: "Erreur lors de la récupération des pays partenaires" });
  }
});

app.post('/api/partenaire', async (req, res) => {
  console.log(req.body)
  try {
    const { code, name } = req.body;

    const [existingPays] = await pool.query(
      'SELECT * FROM partenaire WHERE code = ? or name = ?',
      [code, name]
    );
    if (existingPays.length > 0) {
      return res.status(201).json({ message: "Ce pays fait déja partie des partenaires", status: "201" });
    }
    
    await pool.query(
      'INSERT INTO partenaire (code, name) VALUES (?, ?)',
      [code, name]
    );
    
    res.status(201).json({message: "Creation du pays partenaire avec succès"});
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ message: "Erreur lors de la création de l'utilisateur" });
  }
});

app.delete('/api/partenaire/:code', async (req, res) => {
  try {

    const [existingPays] = await pool.query(
      'SELECT code, name FROM partenaire WHERE code = ?',
      [req.params.code]
    );
    
    if (existingPays.length === 0) {
      return res.status(404).json({ message: "Pays partenaire introuvable" });
    }
    
    const deletedPays = existingPays[0];
    
    await pool.query('DELETE FROM partenaire WHERE code = ?', [req.params.code]);
    
    res.json(deletedPays);
  } catch (error) {
    console.error('Erreur lors de la suppression du pays partenaire', error);
    res.status(500).json({ message: "Erreur lors de la suppression du pays partenaire" });
  }
});

// Routes pour la connexion et l'authentification
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Récupérer l'utilisateur par email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }
    
    const user = users[0];
    
    // Dans une application réelle, vous devriez comparer avec bcrypt.compare
    if (password !== user.password) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }
    
    // Créer un token JWT (simulé ici, utilisez jwt pour un vrai token)
    const token = `simulated-jwt-token-${user.id}`;
    
    res.json({
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, nom } = req.body;
    
    // Vérifier si l'email existe déjà
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }
    
    const id = uuidv4();
    
    // Dans une application réelle, vous devriez hacher le mot de passe avec bcrypt
    await pool.query(
      'INSERT INTO users (id, nom, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [id, nom, email, password, 'client']
    );
    
    const [users] = await pool.query(
      'SELECT id, nom, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    
    res.status(201).json({
      user: users[0]
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
});

// ROUTES POUR LES FACTURES
app.get('/api/invoices', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM factures
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des factures" });
  }
});

app.get('/api/invoices/:id', async (req, res) => {
  try {
    // const [rows] = await pool.query(`
    //   SELECT f.*, u.nom as client_nom, u.email as client_email
    //   FROM factures f
    //   JOIN users u ON f.user_id = u.id
    //   WHERE f.id = ?
    // `, [req.params.id]);
    
    // if (rows.length === 0) {
    //   return res.status(404).json({ message: "Facture introuvable" });
    // }
    
    // Récupérer également les articles de la facture
    const [items] = await pool.query('SELECT * FROM facture_items WHERE facture_id = ?', [req.params.id]);
    // rows[0].items = items;
    
    res.json(items);
  } catch (error) {
    console.error('Erreur lors de la récupération des articles de la facture:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des articles de la facture" });
  }
});

app.post('/api/invoices', async (req, res) => {
  const { id, orderId, customerName, customerEmail, totalAmount, status, items } = req.body;
  
  // Utilisation d'une transaction pour s'assurer que tous les éléments sont ajoutés correctement
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Créer la facture
    await connection.query(
      'INSERT INTO factures (id, orderId, customerName, customerEmail, date, dueDate, totalAmount, status) VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), ?, ?)',
      [id, orderId, customerName, customerEmail, totalAmount, status]
    );
    
    // Ajouter les articles de la facture si fournis
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await connection.query(
          'INSERT INTO facture_items (facture_id, product, quantity, unitPrice, totalPrice) VALUES (?, ?, ?, ?, ?)',
          [id, item.product, item.quantity, item.unitPrice, item.totalPrice]
        );
      }
    }
    
    await connection.commit();

  } catch (error) {
    await connection.rollback();
    console.error('Erreur lors de la création de la facture:', error);
    res.status(500).json({ message: "Erreur lors de la création de la facture" });
  } finally {
    connection.release();
  }
});

app.put('/api/invoices/:id', async (req, res) => {
  const { montant, statut } = req.body;
  
  try {
    // Vérifier si la facture existe
    const [existingInvoices] = await pool.query('SELECT * FROM factures WHERE id = ?', [req.params.id]);
    
    if (existingInvoices.length === 0) {
      return res.status(404).json({ message: "Facture introuvable" });
    }
    
    await pool.query(
      'UPDATE factures SET montant = ?, statut = ?, updated_at = NOW() WHERE id = ?',
      [montant, statut, req.params.id]
    );
    
    const [rows] = await pool.query(`
      SELECT f.*, u.nom as client_nom, u.email as client_email
      FROM factures f
      JOIN users u ON f.user_id = u.id
      WHERE f.id = ?
    `, [req.params.id]);
    
    // Récupérer également les articles de la facture
    const [items] = await pool.query('SELECT * FROM facture_items WHERE facture_id = ?', [req.params.id]);
    rows[0].items = items;
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la facture:', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la facture" });
  }
});

app.patch('/api/invoices/:id/status', async (req, res) => {
  const { status } = req.body;
  
  try {
    // Vérifier si la facture existe
    const [existingInvoices] = await pool.query('SELECT * FROM factures WHERE id = ?', [req.params.id]);
    
    if (existingInvoices.length === 0) {
      return res.status(404).json({ message: "Facture introuvable" });
    }
    
    await pool.query(
      'UPDATE factures SET statut = ?, updated_at = NOW() WHERE id = ?',
      [status, req.params.id]
    );
    
    if (status === 'paid') {
      // Si le statut passe à "payé", enregistrer la date de paiement
      await pool.query(
        'UPDATE factures SET paid_at = NOW() WHERE id = ?',
        [req.params.id]
      );
    }
    
    const [rows] = await pool.query(`
      SELECT f.*, u.nom as client_nom
      FROM factures f
      JOIN users u ON f.user_id = u.id
      WHERE f.id = ?
    `, [req.params.id]);
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de la facture:', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut de la facture" });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  // Utilisation d'une transaction pour s'assurer que la facture et ses articles sont supprimés
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Vérifier si la facture existe
    const [existingInvoices] = await connection.query(`
      SELECT f.*, u.nom as client_nom
      FROM factures f
      JOIN users u ON f.user_id = u.id
      WHERE f.id = ?
    `, [req.params.id]);
    
    if (existingInvoices.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Facture introuvable" });
    }
    
    const deletedInvoice = existingInvoices[0];
    
    // Récupérer les articles de la facture avant de les supprimer
    const [items] = await connection.query('SELECT * FROM facture_items WHERE facture_id = ?', [req.params.id]);
    deletedInvoice.items = items;
    
    // Supprimer les articles de la facture
    await connection.query('DELETE FROM facture_items WHERE facture_id = ?', [req.params.id]);
    
    // Supprimer la facture
    await connection.query('DELETE FROM factures WHERE id = ?', [req.params.id]);
    
    await connection.commit();
    
    res.json(deletedInvoice);
  } catch (error) {
    await connection.rollback();
    console.error('Erreur lors de la suppression de la facture:', error);
    res.status(500).json({ message: "Erreur lors de la suppression de la facture" });
  } finally {
    connection.release();
  }
});

// ROUTES POUR LES FACTURES
app.get('/api/invoice/items', async (req, res) => {

  try {
    const [rows] = await pool.query(`
      select * from facture_items
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des articles des factures:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des articles des factures" });
  }
});

// ROUTES POUR LES VIGNOBLES
app.get('/api/vineyards', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vignobles');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des vignobles:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des vignobles" });
  }
});

app.get('/api/vineyards/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vignobles WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Vignoble introuvable" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du vignoble:', error);
    res.status(500).json({ message: "Erreur lors de la récupération du vignoble" });
  }
});

app.post('/api/vineyards', async (req, res) => {
  try {
    const { nom, localisation, superficie, cepages, description, image } = req.body;
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO vignobles (id, nom, localisation, superficie, cepages, description, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [id, nom, localisation, superficie, JSON.stringify(cepages), description, image]
    );
    
    const [rows] = await pool.query('SELECT * FROM vignobles WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la création du vignoble:', error);
    res.status(500).json({ message: "Erreur lors de la création du vignoble" });
  }
});

app.put('/api/vineyards/:id', async (req, res) => {
  try {
    const { nom, localisation, superficie, cepages, description, image } = req.body;
    
    // Vérifier si le vignoble existe
    const [existingVineyards] = await pool.query('SELECT * FROM vignobles WHERE id = ?', [req.params.id]);
    
    if (existingVineyards.length === 0) {
      return res.status(404).json({ message: "Vignoble introuvable" });
    }
    
    await pool.query(
      'UPDATE vignobles SET nom = ?, localisation = ?, superficie = ?, cepages = ?, description = ?, image = ?, updated_at = NOW() WHERE id = ?',
      [nom, localisation, superficie, JSON.stringify(cepages), description, image, req.params.id]
    );
    
    const [rows] = await pool.query('SELECT * FROM vignobles WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du vignoble:', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du vignoble" });
  }
});

app.delete('/api/vineyards/:id', async (req, res) => {
  try {
    // Vérifier si le vignoble existe
    const [existingVineyards] = await pool.query('SELECT * FROM vignobles WHERE id = ?', [req.params.id]);
    
    if (existingVineyards.length === 0) {
      return res.status(404).json({ message: "Vignoble introuvable" });
    }
    
    const deletedVineyard = existingVineyards[0];
    
    await pool.query('DELETE FROM vignobles WHERE id = ?', [req.params.id]);
    
    res.json(deletedVineyard);
  } catch (error) {
    console.error('Erreur lors de la suppression du vignoble:', error);
    res.status(500).json({ message: "Erreur lors de la suppression du vignoble" });
  }
});

// ROUTES POUR LES PARAMÈTRES
app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings');
    
    if (rows.length === 0) {
      // Si aucun paramètre n'est trouvé, renvoyer un objet vide
      return res.json({});
    }

    const settings = rows[0];
    res.json(settings);
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des paramètres" });
  }
});

app.post('/api/settings/:userId', async (req, res) => {
  try {
    const settings = req.body;
    
    // Convertir l'objet en JSON pour le stockage
    const settingsJson = JSON.stringify(settings);
    
    // Vérifier si des paramètres existent déjà pour cet utilisateur
    const [existingSettings] = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [req.params.userId]
    );
    
    if (existingSettings.length > 0) {
      // Mettre à jour les paramètres existants
      await pool.query(
        'UPDATE user_settings SET settings = ?, updated_at = NOW() WHERE user_id = ?',
        [settingsJson, req.params.userId]
      );
    } else {
      // Créer de nouveaux paramètres
      await pool.query(
        'INSERT INTO user_settings (user_id, settings, created_at) VALUES (?, ?, NOW())',
        [req.params.userId, settingsJson]
      );
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des paramètres:', error);
    res.status(500).json({ message: "Erreur lors de la sauvegarde des paramètres" });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const newSettings = req.body;
    console.log(newSettings);
    
    await pool.query(
      'UPDATE settings SET maintenance = ?, registration = ?',
      [newSettings.maintenance, newSettings.registration]
    )
    res.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour des paramètres" });
  }
});

//API pour les messages
// ------------------- GET : récupérer les messages -------------------
// Récupérer tous les messages admin
app.get("/api/admin_messages", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, user_id, email, message, status, created_at FROM admin_messages ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des messages admin :", err);
    res.status(500).json({ message: "Erreur interne lors de la récupération des messages" });
  }
});

// Marquer un message admin comme lu
app.patch("/api/admin_messages/:id/read", async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query(
      "UPDATE admin_messages SET status = 'read', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );
    res.json({ message: "Message marqué comme lu" });
  } catch (err) {
    console.error("Erreur lors du marquage du message comme lu :", err);
    res.status(500).json({ message: "Erreur interne lors du marquage du message" });
  }
});

// Marquer tous les messages admin comme lus
app.patch("/api/admin_messages/read_all", async (req, res) => {
  try {
    await pool.query(
      "UPDATE admin_messages SET status = 'read', updated_at = CURRENT_TIMESTAMP WHERE status = 'new'"
    );
    res.json({ message: "Tous les messages marqués comme lus" });
  } catch (err) {
    console.error("Erreur lors du marquage de tous les messages :", err);
    res.status(500).json({ message: "Erreur interne lors du marquage des messages" });
  }
});

app.post("/api/admin_messages/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null; // optionnel
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ message: "Email et message sont obligatoires." });
    }

    // insertion dans la BDD
    await pool.query(
      `INSERT INTO admin_messages (user_id, email, message) VALUES (?, ?, ?)`,
      [userId, email, message]
    );

    res.status(201).json({ message: "Message envoyé avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message admin :", error);
    res.status(500).json({ message: "Erreur interne lors de l'envoi du message" });
  }
});

// DELETE: supprimer un message
app.delete("/api/admin_messages/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query("DELETE FROM admin_messages WHERE id=?", [id]);
    res.json({ message: "Message supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
});

// DELETE: supprimer tous les messages
app.delete("/api/admin_messages", async (req, res) => {
  try {
    await pool.query("DELETE FROM admin_messages");
    res.json({ message: "Tous les messages supprimés" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la suppression globale" });
  }
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Une erreur est survenue sur le serveur",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
  console.log(`http://localhost:${port}`);
});

module.exports = app;

