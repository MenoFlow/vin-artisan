INSERT IGNORE INTO `order_items` (id, clientId, order_id, name, price, quantity, image) VALUES

(UUID(), (SELECT id FROM users WHERE name='Alice Dupont'), (SELECT id FROM orders WHERE clientName='Alice Dupont' AND total=120.50), 'Château Margaux', 50.00, 1, NULL),
(UUID(), (SELECT id FROM users WHERE name='Alice Dupont'), (SELECT id FROM orders WHERE clientName='Alice Dupont' AND total=120.50), 'Chablis', 35.00, 2, NULL),

(UUID(), (SELECT id FROM users WHERE name='Bob Martin'), (SELECT id FROM orders WHERE clientName='Bob Martin' AND total=60.00), 'Rosé de Provence', 20.00, 1, NULL),
(UUID(), (SELECT id FROM users WHERE name='Bob Martin'), (SELECT id FROM orders WHERE clientName='Bob Martin' AND total=60.00), 'Champagne Brut', 40.00, 1, NULL);

(UUID(), (SELECT id FROM users WHERE name='Claire Petit'), (SELECT id FROM orders WHERE clientName='Claire Petit' AND total=15.90), 'Rosé de Provence', 15.90, 1, NULL),

(UUID(), (SELECT id FROM users WHERE name='Emma Roche'), (SELECT id FROM orders WHERE clientName='Emma Roche' AND total=500.00), 'Château Margaux', 50.00, 4, NULL),
(UUID(), (SELECT id FROM users WHERE name='Emma Roche'), (SELECT id FROM orders WHERE clientName='Emma Roche' AND total=500.00), 'Chablis', 35.00, 3, NULL),
(UUID(), (SELECT id FROM users WHERE name='Emma Roche'), (SELECT id FROM orders WHERE clientName='Emma Roche' AND total=500.00), 'Champagne Brut', 40.00, 3, NULL),

(UUID(), (SELECT id FROM users WHERE name='Hugo Laurent'), (SELECT id FROM orders WHERE clientName='Hugo Laurent' AND total=30.00), 'Vin du Pays', 10.00, 1, NULL),
(UUID(), (SELECT id FROM users WHERE name='Hugo Laurent'), (SELECT id FROM orders WHERE clientName='Hugo Laurent' AND total=30.00), 'Rosé de Provence', 20.00, 1, NULL),


(UUID(), (SELECT id FROM users WHERE name='Grace Bernard'), (SELECT id FROM orders WHERE clientName='Grace Bernard' AND total=45.50), 'Chablis Premier Cru', 45.50, 1, NULL);

(UUID(), (SELECT id FROM users WHERE name='Isabelle Blanc'), (SELECT id FROM orders WHERE clientName='Isabelle Blanc' AND total=75.00), 'Champagne Brut', 40.00, 2, NULL),
(UUID(), (SELECT id FROM users WHERE name='Isabelle Blanc'), (SELECT id FROM orders WHERE clientName='Isabelle Blanc' AND total=75.00), 'Rosé de Provence', 35.00, 1, NULL),

(UUID(), (SELECT id FROM users WHERE name='Julien Faure'), (SELECT id FROM orders WHERE clientName='Julien Faure' AND total=120.00), 'Château Margaux', 60.00, 2, NULL),

(UUID(), (SELECT id FROM users WHERE name='Bob Martin'), (SELECT id FROM orders WHERE clientName='Bob Martin' AND total=25.00), 'Vin du Pays', 25.00, 2, NULL),




(UUID(), (SELECT id FROM users WHERE name='Alice Dupont'), (SELECT id FROM orders WHERE clientName='Alice Dupont' AND total=80.00), 'Rosé de Provence', 20.00, 2, NULL),
(UUID(), (SELECT id FROM users WHERE name='Alice Dupont'), (SELECT id FROM orders WHERE clientName='Alice Dupont' AND total=80.00), 'Chablis', 20.00, 2, NULL),

(UUID(), (SELECT id FROM users WHERE name='Emma Roche'), (SELECT id FROM orders WHERE clientName='Emma Roche' AND total=60.00), 'Vin du Pays', 20.00, 1, NULL),
(UUID(), (SELECT id FROM users WHERE name='Emma Roche'), (SELECT id FROM orders WHERE clientName='Emma Roche' AND total=60.00), 'Champagne Brut', 40.00, 2, NULL),

(UUID(), (SELECT id FROM users WHERE name='Claire Petit'), (SELECT id FROM orders WHERE clientName='Claire Petit' AND total=100.00), 'Château Margaux', 20.00, 5, NULL);

(UUID(), (SELECT id FROM users WHERE name='Frank Muller'), (SELECT id FROM orders WHERE clientName='Frank Muller' AND total=18.00), 'Vin du Pays', 9.00, 2, NULL),

(UUID(), (SELECT id FROM users WHERE name='Hugo Lauren'), (SELECT id FROM orders WHERE clientName='Hugo Laurent' AND total=160.00), 'Chablis', 40.00, 2, NULL),
(UUID(), (SELECT id FROM users WHERE name='Hugo Lauren'), (SELECT id FROM orders WHERE clientName='Hugo Laurent' AND total=160.00), 'Champagne Brut', 40.00, 2, NULL),

(UUID(), (SELECT id FROM users WHERE name='Grace Bernard'), (SELECT id FROM orders WHERE clientName='Grace Bernard' AND total=90.00), 'Rosé de Provence', 30.00, 1, NULL),
(UUID(), (SELECT id FROM users WHERE name='Grace Bernard'), (SELECT id FROM orders WHERE clientName='Grace Bernard' AND total=90.00), 'Château Margaux', 60.00, 1, NULL),




(UUID(), (SELECT id FROM users WHERE name='Alice Dupont'), (SELECT id FROM orders WHERE clientName='Alice Dupont' AND total=250.00), 'Château Margaux', 50.00, 5, NULL),

(UUID(), (SELECT id FROM users WHERE name='Bob Martin'), (SELECT id FROM orders WHERE clientName='Bob Martin' AND total=45.00), 'Chablis Premier Cru', 45.00, 1, NULL),

(UUID(), (SELECT id FROM users WHERE name='Emma Roche'), (SELECT id FROM orders WHERE clientName='Emma Roche' AND total=150.00), 'Champagne Brut', 50.00, 3, NULL),

(UUID(), (SELECT id FROM users WHERE name='Isabelle Blanc'), (SELECT id FROM orders WHERE clientName='Isabelle Blanc' AND total=33.00), 'Vin du Pays', 10.00, 1, NULL),




(UUID(), (SELECT id FROM users WHERE name='Isabelle Blanc'), (SELECT id FROM orders WHERE clientName='Isabelle Blanc' AND total=33.00), 'Rosé de Provence', 23.00, 1, NULL),

(UUID(), (SELECT id FROM users WHERE name='Julien Faure'), (SELECT id FROM orders WHERE clientName='Julien Faure' AND total=500.00), 'Château Margaux', 50.00, 5, NULL),
(UUID(), (SELECT id FROM users WHERE name='Julien Faure'), (SELECT id FROM orders WHERE clientName='Julien Faure' AND total=500.00), 'Champagne Brut', 50.00, 5, NULL);

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE facture_items;
TRUNCATE TABLE factures;
TRUNCATE TABLE orders;
TRUNCATE TABLE stocks;
TRUNCATE TABLE cuvees;
TRUNCATE TABLE users;
TRUNCATE TABLE partenaire;
TRUNCATE TABLE productions;
TRUNCATE TABLE production_steps;

SET FOREIGN_KEY_CHECKS = 1;


-- ========= TABLE users =========
INSERT INTO `users` (id, name, email, password, role) VALUES
(UUID(), 'Alice Dupont', 'alice@example.com', 'hashed_pw1', 'client'),
(UUID(), 'Bob Martin', 'bob@example.com', 'hashed_pw2', 'client'),
(UUID(), 'Claire Petit', 'claire@example.com', 'hashed_pw3', 'client'),
(UUID(), 'David Leroy', 'david@example.com', 'hashed_pw4', 'employee'),
(UUID(), 'Emma Roche', 'emma@example.com', 'hashed_pw5', 'client'),
(UUID(), 'Frank Muller', 'frank@example.com', 'hashed_pw6', 'employee'),
(UUID(), 'Grace Bernard', 'grace@example.com', 'hashed_pw7', 'client'),
(UUID(), 'Hugo Laurent', 'hugo@example.com', 'hashed_pw8', 'client'),
(UUID(), 'Isabelle Blanc', 'isabelle@example.com', 'hashed_pw9', 'client'),
(UUID(), 'Julien Faure', 'julien@example.com', 'hashed_pw10', 'admin');

-- ========= TABLE cuvees =========
INSERT INTO `cuvees` (id, nom, annee, type, cepage, description, prix, stock) VALUES
(UUID(), 'Château Margaux', 2015, 'rouge', 'Cabernet Sauvignon', 'Vin rouge prestigieux', 250.00, 12),
(UUID(), 'Chablis Premier Cru', 2018, 'blanc', 'Chardonnay', 'Vin blanc sec', 45.50, 40),
(UUID(), 'Rosé de Provence', 2021, 'rose', 'Grenache', 'Frais et fruité', 15.90, 100),
(UUID(), 'Champagne Brut', 2016, 'petillant', 'Pinot Noir', 'Bulles fines', 60.00, 30),
(UUID(), 'Vin du Pays', 2020, 'autre', 'Syrah', 'Vin simple mais agréable', 8.50, 200);

-- ========= TABLE orders =========
-- On suppose que les id users existent, on les reliera avec LAST_INSERT_ID ou UUID fixe en vrai
INSERT INTO `orders` (id, clientId, clientName, total, date, status, shippingAddress, country, quantity, items) VALUES
(UUID(), (SELECT id FROM users WHERE email='alice@example.com'), 'Alice Dupont', 120.50, '2025-01-15 10:30:00', 'pending', '12 Rue de Paris', 'France', 3, '["Château Margaux","Chablis"]'),
(UUID(), (SELECT id FROM users WHERE email='bob@example.com'), 'Bob Martin', 60.00, '2025-02-03 14:45:00', 'processing', '45 Avenue Victor Hugo', 'France', 2, '["Rosé de Provence","Champagne Brut"]'),
(UUID(), (SELECT id FROM users WHERE email='claire@example.com'), 'Claire Petit', 15.90, '2025-01-20 09:15:00', 'delivered', '5 Boulevard Pasteur', 'Belgique', 1, '["Rosé de Provence"]'),
(UUID(), (SELECT id FROM users WHERE email='emma@example.com'), 'Emma Roche', 500.00, '2025-03-01 11:00:00', 'shipped', '99 Chemin des Vignes', 'Suisse', 10, '["Château Margaux","Chablis","Champagne Brut"]'),
(UUID(), (SELECT id FROM users WHERE email='hugo@example.com'), 'Hugo Laurent', 30.00, '2025-02-10 16:20:00', 'canceled', '1 Place du Marché', 'France', 2, '["Vin du Pays","Rosé de Provence"]'),
(UUID(), (SELECT id FROM users WHERE email='grace@example.com'), 'Grace Bernard', 45.50, '2025-02-25 13:05:00', 'pending', '78 Rue Nationale', 'Luxembourg', 1, '["Chablis Premier Cru"]'),
(UUID(), (SELECT id FROM users WHERE email='isabelle@example.com'), 'Isabelle Blanc', 75.00, '2025-01-30 10:50:00', 'processing', '23 Rue Voltaire', 'France', 3, '["Champagne Brut","Rosé de Provence"]'),
(UUID(), (SELECT id FROM users WHERE email='julien@example.com'), 'Julien Faure', 120.00, '2025-03-05 12:30:00', 'delivered', '67 Quai des Chartrons', 'France', 2, '["Château Margaux"]'),
(UUID(), (SELECT id FROM users WHERE email='bob@example.com'), 'Bob Martin', 25.00, '2025-03-10 15:00:00', 'pending', '45 Avenue Victor Hugo', 'France', 2, '["Vin du Pays"]'),
(UUID(), (SELECT id FROM users WHERE email='alice@example.com'), 'Alice Dupont', 80.00, '2025-03-12 09:40:00', 'shipped', '12 Rue de Paris', 'France', 4, '["Rosé de Provence","Chablis"]'),
(UUID(), (SELECT id FROM users WHERE email='emma@example.com'), 'Emma Roche', 60.00, '2025-03-15 14:15:00', 'pending', '99 Chemin des Vignes', 'Suisse', 3, '["Vin du Pays","Champagne Brut"]'),
(UUID(), (SELECT id FROM users WHERE email='claire@example.com'), 'Claire Petit', 100.00, '2025-03-18 11:25:00', 'processing', '5 Boulevard Pasteur', 'Belgique', 5, '["Château Margaux"]'),
(UUID(), (SELECT id FROM users WHERE email='frank@example.com'), 'Frank Muller', 18.00, '2025-03-20 10:05:00', 'canceled', '10 Rue des Halles', 'France', 2, '["Vin du Pays"]'),
(UUID(), (SELECT id FROM users WHERE email='hugo@example.com'), 'Hugo Laurent', 160.00, '2025-03-22 16:40:00', 'pending', '1 Place du Marché', 'France', 4, '["Chablis","Champagne Brut"]'),
(UUID(), (SELECT id FROM users WHERE email='grace@example.com'), 'Grace Bernard', 90.00, '2025-03-25 12:10:00', 'shipped', '78 Rue Nationale', 'Luxembourg', 2, '["Rosé de Provence","Château Margaux"]'),
(UUID(), (SELECT id FROM users WHERE email='alice@example.com'), 'Alice Dupont', 250.00, '2025-03-28 10:00:00', 'delivered', '12 Rue de Paris', 'France', 6, '["Château Margaux"]'),
(UUID(), (SELECT id FROM users WHERE email='bob@example.com'), 'Bob Martin', 45.00, '2025-03-30 09:30:00', 'processing', '45 Avenue Victor Hugo', 'France', 1, '["Chablis Premier Cru"]'),
(UUID(), (SELECT id FROM users WHERE email='emma@example.com'), 'Emma Roche', 150.00, '2025-04-01 15:50:00', 'delivered', '99 Chemin des Vignes', 'Suisse', 3, '["Champagne Brut"]'),
(UUID(), (SELECT id FROM users WHERE email='isabelle@example.com'), 'Isabelle Blanc', 33.00, '2025-04-03 11:45:00', 'pending', '23 Rue Voltaire', 'France', 2, '["Vin du Pays","Rosé de Provence"]'),
(UUID(), (SELECT id FROM users WHERE email='julien@example.com'), 'Julien Faure', 500.00, '2025-04-05 14:30:00', 'shipped', '67 Quai des Chartrons', 'France', 10, '["Château Margaux","Champagne Brut"]');




-- ========= TABLE factures =========
INSERT INTO `factures` (id, orderId, customerName, customerEmail, totalAmount, status, items) VALUES
(UUID(), (SELECT id FROM orders LIMIT 1 OFFSET 0), 'Alice Dupont', 'alice@example.com', 120.50, 'paid', '["Château Margaux","Chablis"]'),
(UUID(), (SELECT id FROM orders LIMIT 1 OFFSET 1), 'Bob Martin', 'bob@example.com', 60.00, 'pending', '["Rosé de Provence","Champagne Brut"]'),
(UUID(), (SELECT id FROM orders LIMIT 1 OFFSET 2), 'Claire Petit', 'claire@example.com', 15.90, 'cancelled', '["Rosé de Provence"]'),
(UUID(), (SELECT id FROM orders LIMIT 1 OFFSET 3), 'Emma Roche', 'emma@example.com', 500.00, 'paid', '["Château Margaux","Champagne Brut"]');

-- ========= TABLE facture_items =========
INSERT INTO `facture_items` (facture_id, product, quantity, unitPrice, totalPrice) VALUES
((SELECT id FROM factures LIMIT 1 OFFSET 0), 'Château Margaux', 1, 100.00, 100.00),
((SELECT id FROM factures LIMIT 1 OFFSET 0), 'Chablis', 1, 20.50, 20.50),
((SELECT id FROM factures LIMIT 1 OFFSET 1), 'Rosé de Provence', 1, 15.00, 15.00),
((SELECT id FROM factures LIMIT 1 OFFSET 1), 'Champagne Brut', 1, 45.00, 45.00),
((SELECT id FROM factures LIMIT 1 OFFSET 3), 'Château Margaux', 2, 250.00, 500.00);

-- ========= TABLE partenaire =========
INSERT INTO `partenaire` (code, name) VALUES
('FR', 'Maison du Vin de Bordeaux'),
('IT', 'Cantina Toscana'),
('ES', 'Bodega Rioja'),
('DE', 'WeinGut Berlin'),
('US', 'California Wines');

-- ========= TABLE productions =========
INSERT INTO `productions` (id, startDate, endDate, status, description, currentStep, name, progress, steps) VALUES
(UUID(), '2025-01-01', '2025-02-01', 'terminé', 'Production de vin rouge', 'Embouteillage', 'Cuvée Prestige 2025', 100, '["Récolte","Fermentation","Vieillissement","Mise en bouteille"]'),
(UUID(), '2025-03-01', NULL, 'en cours', 'Production de champagne', 'Fermentation', 'Champagne Brut 2025', 50, '["Récolte","Fermentation","Vieillissement","Dégorgement"]');

-- ========= TABLE production_steps =========
INSERT INTO `production_steps` (id, production_id, name, status, startDate, endDate, duration) VALUES
(UUID(), (SELECT id FROM productions LIMIT 1 OFFSET 0), 'Récolte', 'completed', '2025-01-01', '2025-01-05', 4),
(UUID(), (SELECT id FROM productions LIMIT 1 OFFSET 0), 'Fermentation', 'completed', '2025-01-06', '2025-01-15', 9),
(UUID(), (SELECT id FROM productions LIMIT 1 OFFSET 0), 'Vieillissement', 'completed', '2025-01-16', '2025-01-25', 9),
(UUID(), (SELECT id FROM productions LIMIT 1 OFFSET 0), 'Embouteillage', 'completed', '2025-01-26', '2025-02-01', 6),
(UUID(), (SELECT id FROM productions LIMIT 1 OFFSET 1), 'Récolte', 'completed', '2025-03-01', '2025-03-07', 6),
(UUID(), (SELECT id FROM productions LIMIT 1 OFFSET 1), 'Fermentation', 'in-progress', '2025-03-08', '2025-03-20', 12);

-- ========= TABLE settings =========
INSERT INTO `settings` (maintenance, registration) VALUES
(0,1),
(1,0);


