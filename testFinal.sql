-- Désactiver les vérifications de clés étrangères
SET FOREIGN_KEY_CHECKS = 0;

-- Vider les tables enfants avant les parents
TRUNCATE TABLE `facture_items`;
TRUNCATE TABLE `order_items`;
TRUNCATE TABLE `production_steps`;

-- Puis vider les tables parentes
TRUNCATE TABLE `factures`;
TRUNCATE TABLE `orders`;
TRUNCATE TABLE `productions`;

-- Ensuite les tables indépendantes
TRUNCATE TABLE `cuvees`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `partenaire`;
TRUNCATE TABLE `settings`;

-- Réactiver les vérifications de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;


-- =======================
-- Données pour la table users
-- =======================

-- Utilisateurs fixes
INSERT INTO `users` (id, name, email, password, role) VALUES
('11111111-1111-1111-1111-111111111111', 'Alice Dupont', 'alice@example.com', 'hashed_password_1', 'client'),
('22222222-2222-2222-2222-222222222222', 'Jean Martin', 'jean@example.com', 'hashed_password_2', 'client'),
('33333333-3333-3333-3333-333333333333', 'Admin User', 'admin@example.com', 'hashed_admin_password', 'admin');


-- =======================
-- Données pour la table cuvees
-- =======================

INSERT INTO `cuvees` (id, nom, annee, type, cepage, description, prix, stock) VALUES
('cuv001', 'Château Margaux', 2018, 'rouge', 'Cabernet Sauvignon, Merlot', 'Un grand cru élégant avec des arômes de fruits noirs et une finale longue.', 250.00, 12),
('cuv002', 'Sancerre Blanc', 2021, 'blanc', 'Sauvignon Blanc', 'Vin frais et minéral avec des notes d’agrumes et de fleurs blanches.', 18.50, 60),
('cuv003', 'Rosé de Provence', 2022, 'rose', 'Grenache, Cinsault', 'Rosé léger et fruité, parfait pour l’été.', 12.90, 100),
('cuv004', 'Crémant d’Alsace', 2020, 'petillant', 'Pinot Blanc', 'Bulles fines et délicates avec des arômes de pomme verte.', 15.00, 50),
('cuv005', 'Vin de l’Amitié', 2023, 'autre', 'Assemblage secret', 'Cuvée spéciale artisanale pour partager entre amis.', 9.90, 30),
('cuv006', 'Chablis Premier Cru', 2019, 'blanc', 'Chardonnay', 'Vin raffiné avec des notes minérales et une belle acidité.', 32.00, 20),
('cuv007', 'Côtes-du-Rhône', 2020, 'rouge', 'Syrah, Grenache', 'Vin rond et généreux avec des notes épicées.', 14.50, 40);

INSERT INTO `orders` (id, clientId, clientName, total, date, status, shippingAddress, country, quantity) VALUES
('ord001', '11111111-1111-1111-1111-111111111111', 'Alice Dupont', 287.00, '2025-01-15 10:30:00', 'delivered', '10 rue de Paris, Lyon', 'France', 3),
('ord002', '11111111-1111-1111-1111-111111111111', 'Alice Dupont', 25.80, '2025-01-20 15:45:00', 'pending', '12 avenue Victor Hugo, Paris', 'France', 2),
('ord003', '11111111-1111-1111-1111-111111111111', 'Alice Dupont', 262.90, '2025-02-02 09:10:00', 'shipped', '5 rue Lafayette, Lyon', 'France', 2),
('ord004', '11111111-1111-1111-1111-111111111111', 'Alice Dupont', 41.40, '2025-02-05 18:20:00', 'shipped', '8 rue Montmartre, Paris', 'France', 3),
('ord005', '11111111-1111-1111-1111-111111111111', 'Alice Dupont', 41.90, '2025-02-10 13:00:00', 'pending', '14 rue de Rennes, Paris', 'France', 2),
('ord006', '22222222-2222-2222-2222-222222222222', 'Jean Martin', 64.50, '2025-01-18 11:00:00', 'shipped', '20 avenue des Champs, Paris', 'France', 4),
('ord007', '22222222-2222-2222-2222-222222222222', 'Jean Martin', 37.50, '2025-01-22 14:10:00', 'shipped', '3 rue Saint-Honoré, Paris', 'France', 2),
('ord008', '22222222-2222-2222-2222-222222222222', 'Jean Martin', 49.50, '2025-01-25 16:45:00', 'pending', '11 rue de Lille, Paris', 'France', 2),
('ord009', '22222222-2222-2222-2222-222222222222', 'Jean Martin', 30.00, '2025-01-28 10:00:00', 'canceled', '9 rue de Rivoli, Paris', 'France', 2),
('ord010', '22222222-2222-2222-2222-222222222222', 'Jean Martin', 265.00, '2025-02-01 17:30:00', 'shipped', '15 rue de la Paix, Paris', 'France', 4),
('ord011', '11111111-1111-1111-1111-111111111111', 'Alice Dupont', 56.00, '2025-02-03 11:45:00', 'pending', '6 rue de la République, Lyon', 'France', 3),
('ord012', '11111111-1111-1111-1111-111111111111', 'Alice Dupont', 78.00, '2025-02-04 12:30:00', 'shipped', '7 rue du Faubourg, Paris', 'France', 2),
('ord013', '11111111-1111-1111-1111-111111111111', 'Alice Dupont', 31.80, '2025-02-07 20:15:00', 'shipped', '8 rue de la Liberté, Lyon', 'France', 2),
('ord014', '11111111-1111-1111-1111-111111111111', 'Alice Dupont', 55.00, '2025-02-09 09:30:00', 'shipped', '10 rue Gambetta, Paris', 'France', 3),
('ord015', '11111111-1111-1111-1111-111111111111', 'Alice Dupont', 39.60, '2025-02-11 18:45:00', 'shipped', '12 rue Lafayette, Lyon', 'France', 3),
('ord016', '22222222-2222-2222-2222-222222222222', 'Jean Martin', 46.00, '2025-02-06 19:00:00', 'pending', '20 rue Saint Denis, Paris', 'France', 4),
('ord017', '22222222-2222-2222-2222-222222222222', 'Jean Martin', 90.00, '2025-02-08 14:00:00', 'shipped', '22 avenue Victor Hugo, Paris', 'France', 3),
('ord018', '22222222-2222-2222-2222-222222222222', 'Jean Martin', 33.00, '2025-02-12 15:10:00', 'pending', '18 rue du Bac, Paris', 'France', 2),
('ord019', '22222222-2222-2222-2222-222222222222', 'Jean Martin', 100.00, '2025-02-14 11:50:00', 'shipped', '25 avenue de la République, Paris', 'France', 4),
('ord020', '22222222-2222-2222-2222-222222222222', 'Jean Martin', 30.00, '2025-02-15 16:40:00', 'shipped', '5 rue de Lyon, Paris', 'France', 2);


INSERT INTO `order_items` (id, clientId, order_id, name, price, quantity) VALUES
('ord001-1', '11111111-1111-1111-1111-111111111111', 'ord001', 'Château Margaux 2018', 120.00, 1),
('ord001-2', '11111111-1111-1111-1111-111111111111', 'ord001', 'Côtes-du-Rhône 2020', 167.00, 1),

('ord002-1', '11111111-1111-1111-1111-111111111111', 'ord002', 'Rosé de Provence 2022', 12.90, 1),
('ord002-2', '11111111-1111-1111-1111-111111111111', 'ord002', 'Crémant d’Alsace 2020', 12.90, 1),

('ord003-1', '11111111-1111-1111-1111-111111111111', 'ord003', 'Chablis Premier Cru 2019', 32.00, 2),
('ord003-2', '11111111-1111-1111-1111-111111111111', 'ord003', 'Château Margaux 2018', 198.90, 1),

('ord004-1', '11111111-1111-1111-1111-111111111111', 'ord004', 'Sancerre Blanc 2021', 18.50, 1),
('ord004-2', '11111111-1111-1111-1111-111111111111', 'ord004', 'Rosé de Provence 2022', 22.90, 1),

('ord005-1', '11111111-1111-1111-1111-111111111111', 'ord005', 'Vin de l’Amitié 2023', 9.90, 2),
('ord005-2', '11111111-1111-1111-1111-111111111111', 'ord005', 'Côtes-du-Rhône 2020', 22.10, 1),

('ord006-1', '22222222-2222-2222-2222-222222222222', 'ord006', 'Crémant d’Alsace 2020', 15.00, 2),
('ord006-2', '22222222-2222-2222-2222-222222222222', 'ord006', 'Rosé de Provence 2022', 12.90, 3),

('ord007-1', '22222222-2222-2222-2222-222222222222', 'ord007', 'Sancerre Blanc 2021', 18.50, 2),
('ord007-2', '22222222-2222-2222-2222-222222222222', 'ord007', 'Vin de l’Amitié 2023', 0.50, 1),

('ord008-1', '22222222-2222-2222-2222-222222222222', 'ord008', 'Chablis Premier Cru 2019', 16.50, 1),
('ord008-2', '22222222-2222-2222-2222-222222222222', 'ord008', 'Côtes-du-Rhône 2020', 33.00, 1),

('ord009-1', '22222222-2222-2222-2222-222222222222', 'ord009', 'Rosé de Provence 2022', 12.00, 1),
('ord009-2', '22222222-2222-2222-2222-222222222222', 'ord009', 'Vin de l’Amitié 2023', 18.00, 1),

('ord010-1', '22222222-2222-2222-2222-222222222222', 'ord010', 'Château Margaux 2018', 150.00, 1),
('ord010-2', '22222222-2222-2222-2222-222222222222', 'ord010', 'Chablis Premier Cru 2019', 115.00, 1);

('ord011-1', '11111111-1111-1111-1111-111111111111', 'ord011', 'Sancerre Blanc 2021', 18.50, 2),
('ord011-2', '11111111-1111-1111-1111-111111111111', 'ord011', 'Rosé de Provence 2022', 19.00, 1),

('ord012-1', '11111111-1111-1111-1111-111111111111', 'ord012', 'Chablis Premier Cru 2019', 32.00, 2),
('ord012-2', '11111111-1111-1111-1111-111111111111', 'ord012', 'Vin de l’Amitié 2023', 14.00, 1),

('ord013-1', '11111111-1111-1111-1111-111111111111', 'ord013', 'Rosé de Provence 2022', 12.90, 1),
('ord013-2', '11111111-1111-1111-1111-111111111111', 'ord013', 'Côtes-du-Rhône 2020', 18.90, 1),

('ord014-1', '11111111-1111-1111-1111-111111111111', 'ord014', 'Château Margaux 2018', 30.00, 1),
('ord014-2', '11111111-1111-1111-1111-111111111111', 'ord014', 'Crémant d’Alsace 2020', 25.00, 1),

('ord015-1', '11111111-1111-1111-1111-111111111111', 'ord015', 'Sancerre Blanc 2021', 18.50, 1),
('ord015-2', '11111111-1111-1111-1111-111111111111', 'ord015', 'Rosé de Provence 2022', 21.10, 1),

('ord016-1', '22222222-2222-2222-2222-222222222222', 'ord016', 'Vin de l’Amitié 2023', 9.90, 2),
('ord016-2', '22222222-2222-2222-2222-222222222222', 'ord016', 'Côtes-du-Rhône 2020', 26.20, 1),

('ord017-1', '22222222-2222-2222-2222-222222222222', 'ord017', 'Château Margaux 2018', 50.00, 1),
('ord017-2', '22222222-2222-2222-2222-222222222222', 'ord017', 'Chablis Premier Cru 2019', 40.00, 1),

('ord018-1', '22222222-2222-2222-2222-222222222222', 'ord018', 'Rosé de Provence 2022', 12.00, 1),
('ord018-2', '22222222-2222-2222-2222-222222222222', 'ord018', 'Crémant d’Alsace 2020', 21.00, 1),

('ord019-1', '22222222-2222-2222-2222-222222222222', 'ord019', 'Château Margaux 2018', 60.00, 1),
('ord019-2', '22222222-2222-2222-2222-222222222222', 'ord019', 'Côtes-du-Rhône 2020', 40.00, 1),

('ord020-1', '22222222-2222-2222-2222-222222222222', 'ord020', 'Rosé de Provence 2022', 12.00, 1),
('ord020-2', '22222222-2222-2222-2222-222222222222', 'ord020', 'Vin de l’Amitié 2023', 18.00, 1);


-- Factures
INSERT INTO `factures` (id, orderId, customerName, customerEmail, date, dueDate, totalAmount, status) VALUES
('FAC001', 'ord001', 'Alice Dupont', 'alice@example.com', '2025-01-15 10:30:00', '2025-01-30 10:30:00', 287.00, 'paid'),
('FAC002', 'ord002', 'Alice Dupont', 'alice@example.com', '2025-01-20 15:45:00', '2025-02-04 15:45:00', 25.80, 'pending'),
('FAC003', 'ord003', 'Alice Dupont', 'alice@example.com', '2025-02-02 09:10:00', '2025-02-17 09:10:00', 262.90, 'paid'),
('FAC004', 'ord004', 'Alice Dupont', 'alice@example.com', '2025-02-05 18:20:00', '2025-02-20 18:20:00', 41.40, 'paid'),
('FAC005', 'ord005', 'Alice Dupont', 'alice@example.com', '2025-02-10 13:00:00', '2025-02-25 13:00:00', 41.90, 'pending'),
('FAC006', 'ord006', 'Jean Martin', 'jean@example.com', '2025-01-18 11:00:00', '2025-02-02 11:00:00', 64.50, 'paid'),
('FAC007', 'ord007', 'Jean Martin', 'jean@example.com', '2025-01-22 14:10:00', '2025-02-06 14:10:00', 37.50, 'paid'),
('FAC008', 'ord008', 'Jean Martin', 'jean@example.com', '2025-01-25 16:45:00', '2025-02-09 16:45:00', 49.50, 'pending'),
('FAC009', 'ord009', 'Jean Martin', 'jean@example.com', '2025-01-28 10:00:00', '2025-02-11 10:00:00', 30.00, 'cancelled'),
('FAC010', 'ord010', 'Jean Martin', 'jean@example.com', '2025-02-01 17:30:00', '2025-02-16 17:30:00', 265.00, 'paid'),
('FAC011', 'ord011', 'Alice Dupont', 'alice@example.com', '2025-02-03 11:45:00', '2025-02-18 11:45:00', 56.00, 'pending'),
('FAC012', 'ord012', 'Alice Dupont', 'alice@example.com', '2025-02-04 12:30:00', '2025-02-19 12:30:00', 78.00, 'paid'),
('FAC013', 'ord013', 'Alice Dupont', 'alice@example.com', '2025-02-07 20:15:00', '2025-02-22 20:15:00', 31.80, 'paid'),
('FAC014', 'ord014', 'Alice Dupont', 'alice@example.com', '2025-02-09 09:30:00', '2025-02-24 09:30:00', 55.00, 'paid'),
('FAC015', 'ord015', 'Alice Dupont', 'alice@example.com', '2025-02-11 18:45:00', '2025-02-26 18:45:00', 39.60, 'paid'),
('FAC016', 'ord016', 'Jean Martin', 'jean@example.com', '2025-02-06 19:00:00', '2025-02-21 19:00:00', 46.00, 'pending'),
('FAC017', 'ord017', 'Jean Martin', 'jean@example.com', '2025-02-08 14:00:00', '2025-02-23 14:00:00', 90.00, 'paid'),
('FAC018', 'ord018', 'Jean Martin', 'jean@example.com', '2025-02-12 15:10:00', '2025-02-27 15:10:00', 33.00, 'pending'),
('FAC019', 'ord019', 'Jean Martin', 'jean@example.com', '2025-02-14 11:50:00', '2025-03-01 11:50:00', 100.00, 'paid'),
('FAC020', 'ord020', 'Jean Martin', 'jean@example.com', '2025-02-15 16:40:00', '2025-03-02 16:40:00', 30.00, 'paid');

-- Facture Items
INSERT INTO `facture_items` (facture_id, product, quantity, unitPrice, totalPrice) VALUES
('FAC001', 'Château Margaux 2018', 1, 120.00, 120.00),
('FAC001', 'Côtes-du-Rhône 2020', 1, 167.00, 167.00),

('FAC002', 'Rosé de Provence 2022', 1, 12.90, 12.90),
('FAC002', 'Crémant d’Alsace 2020', 1, 12.90, 12.90),

('FAC003', 'Chablis Premier Cru 2019', 2, 32.00, 64.00),
('FAC003', 'Château Margaux 2018', 1, 198.90, 198.90),

('FAC004', 'Sancerre Blanc 2021', 1, 18.50, 18.50),
('FAC004', 'Rosé de Provence 2022', 1, 22.90, 22.90),

('FAC005', 'Vin de l’Amitié 2023', 2, 9.90, 19.80),
('FAC005', 'Côtes-du-Rhône 2020', 1, 22.10, 22.10),

('FAC006', 'Crémant d’Alsace 2020', 2, 15.00, 30.00),
('FAC006', 'Rosé de Provence 2022', 3, 11.50, 34.50),

('FAC007', 'Sancerre Blanc 2021', 2, 18.50, 37.00),
('FAC007', 'Vin de l’Amitié 2023', 1, 0.50, 0.50),

('FAC008', 'Chablis Premier Cru 2019', 1, 16.50, 16.50),
('FAC008', 'Côtes-du-Rhône 2020', 1, 33.00, 33.00),

('FAC009', 'Rosé de Provence 2022', 1, 12.00, 12.00),
('FAC009', 'Vin de l’Amitié 2023', 1, 18.00, 18.00),

('FAC010', 'Château Margaux 2018', 1, 150.00, 150.00),
('FAC010', 'Chablis Premier Cru 2019', 1, 115.00, 115.00),

('FAC011', 'Sancerre Blanc 2021', 2, 18.50, 37.00),
('FAC011', 'Rosé de Provence 2022', 1, 19.00, 19.00),

('FAC012', 'Chablis Premier Cru 2019', 2, 32.00, 64.00),
('FAC012', 'Vin de l’Amitié 2023', 1, 14.00, 14.00),

('FAC013', 'Rosé de Provence 2022', 1, 12.90, 12.90),
('FAC013', 'Côtes-du-Rhône 2020', 1, 18.90, 18.90),

('FAC014', 'Château Margaux 2018', 1, 30.00, 30.00),
('FAC014', 'Crémant d’Alsace 2020', 1, 25.00, 25.00),

('FAC015', 'Sancerre Blanc 2021', 1, 18.50, 18.50),
('FAC015', 'Rosé de Provence 2022', 1, 21.10, 21.10),

('FAC016', 'Vin de l’Amitié 2023', 2, 9.90, 19.80),
('FAC016', 'Côtes-du-Rhône 2020', 1, 26.20, 26.20),

('FAC017', 'Château Margaux 2018', 1, 50.00, 50.00),
('FAC017', 'Chablis Premier Cru 2019', 1, 40.00, 40.00),

('FAC018', 'Rosé de Provence 2022', 1, 12.00, 12.00),
('FAC018', 'Crémant d’Alsace 2020', 1, 21.00, 21.00),

('FAC019', 'Château Margaux 2018', 1, 60.00, 60.00),
('FAC019', 'Côtes-du-Rhône 2020', 1, 40.00, 40.00),

('FAC020', 'Rosé de Provence 2022', 1, 12.00, 12.00),
('FAC020', 'Vin de l’Amitié 2023', 1, 18.00, 18.00);



INSERT INTO `productions` (id, startDate, endDate, status, description, currentStep, name, progress) VALUES
('PROD-001','2025-08-01','2025-08-15','en cours','Production de cuvée spéciale rouge','Etape 3','Cuvée Rouge Prestige',40),
('PROD-002','2025-08-05','2025-08-20','planifié','Production de vin blanc léger','Etape 2','Blanc Légende',25),
('PROD-003','2025-08-03','2025-08-18','en cours','Production de rosé fruité pour l’été','Etape 4','Rosé Estival',60),
('PROD-004','2025-08-07','2025-08-25','planifié','Production de vin pétillant d’Alsace','Etape 1','Crémant Alsace',10);



-- PROD-001
INSERT INTO `production_steps` (id, production_id, name, status, startDate, endDate, duration) VALUES
('PROD-001-1692283200000','PROD-001','Réception des raisins','completed','2025-08-01','2025-08-02',1),
('PROD-001-1692369600000','PROD-001','Éraflage et foulage','completed','2025-08-03','2025-08-04',1),
('PROD-001-1692456000000','PROD-001','Fermentation','in-progress','2025-08-05','2025-08-10',5),
('PROD-001-1692801600000','PROD-001','Pressurage','pending','2025-08-11','2025-08-12',1),
('PROD-001-1692888000000','PROD-001','Mise en cuve','pending','2025-08-13','2025-08-15',2);

-- PROD-002
INSERT INTO `production_steps` (id, production_id, name, status, startDate, endDate, duration) VALUES
('PROD-002-1692650400000','PROD-002','Réception des raisins','pending','2025-08-05','2025-08-06',1),
('PROD-002-1692736800000','PROD-002','Éraflage','pending','2025-08-07','2025-08-08',1),
('PROD-002-1692823200000','PROD-002','Pressurage','pending','2025-08-09','2025-08-10',1),
('PROD-002-1692909600000','PROD-002','Débourbage','pending','2025-08-11','2025-08-13',2),
('PROD-002-1693072800000','PROD-002','Mise en cuve','pending','2025-08-14','2025-08-20',6);

-- PROD-003
INSERT INTO `production_steps` (id, production_id, name, status, startDate, endDate, duration) VALUES
('PROD-003-1692463200000','PROD-003','Réception des raisins','completed','2025-08-03','2025-08-04',1),
('PROD-003-1692549600000','PROD-003','Foulage','completed','2025-08-05','2025-08-06',1),
('PROD-003-1692636000000','PROD-003','Fermentation','in-progress','2025-08-07','2025-08-12',5),
('PROD-003-1692991200000','PROD-003','Pressurage','pending','2025-08-13','2025-08-14',1),
('PROD-003-1693077600000','PROD-003','Mise en cuve','pending','2025-08-15','2025-08-18',3);

-- PROD-004
INSERT INTO `production_steps` (id, production_id, name, status, startDate, endDate, duration) VALUES
('PROD-004-1693332000000','PROD-004','Réception des raisins','pending','2025-08-07','2025-08-08',1),
('PROD-004-1693418400000','PROD-004','Éraflage et foulage','pending','2025-08-09','2025-08-10',1),
('PROD-004-1693504800000','PROD-004','Fermentation','pending','2025-08-11','2025-08-16',5),
('PROD-004-1693860000000','PROD-004','Pressurage','pending','2025-08-17','2025-08-20',3),
('PROD-004-1694119200000','PROD-004','Mise en cuve','pending','2025-08-21','2025-08-25',4);



INSERT INTO `partenaire` (code, name) VALUES
('MG', 'Madagascar'),
('FR', 'France'),
('IT', 'Italie'),
('ES', 'Espagne'),
('US', 'États-Unis'),
('DE', 'Allemagne'),
('PT', 'Portugal'),
('BR', 'Brésil'),
('AR', 'Argentine'),
('AU', 'Australie'),
('ZA', 'Afrique du Sud'),
('CN', 'Chine'),
('JP', 'Japon'),
('KR', 'Corée du Sud'),
('RU', 'Russie'),
('IN', 'Inde'),
('EG', 'Égypte'),
('NG', 'Nigeria'),
('KE', 'Kenya'),
('CO', 'Colombie'),
('CL', 'Chili'),
('SE', 'Suède');



INSERT INTO `settings` (maintenance, registration) VALUES
(1, 1);
