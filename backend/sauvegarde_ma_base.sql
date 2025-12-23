
DROP DATABASE IF EXISTS vinexpert;

CREATE DATABASE vinexpert;

USE vinexpert;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','client') NOT NULL DEFAULT 'client',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `cuvees`;
CREATE TABLE `cuvees` (
  `id` varchar(36) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `annee` int DEFAULT NULL,
  `type` enum('rouge','blanc','rose','petillant','autre') NOT NULL,
  `cepage` varchar(100) DEFAULT NULL,
  `description` text,
  `prix` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cuvees_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` varchar(36) NOT NULL,
  `clientId` varchar(36) NOT NULL,
  `clientName` varchar(36) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `date` timestamp,
  `status` enum('pending','processing','shipped','delivered','canceled') NOT NULL DEFAULT 'pending',
  `shippingAddress` text NOT NULL,
  `country` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `quantity` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `clientId` (`clientId`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`clientId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `clientId` varchar(36) NOT NULL,
  `order_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`clientId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `factures`;
CREATE TABLE `factures` (
  `id` varchar(36) NOT NULL,
  `orderId` varchar(36) NOT NULL,
  `customerName` varchar(36) NOT NULL,
  `customerEmail` varchar(36) NOT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `dueDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `totalAmount` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','cancelled') NOT NULL DEFAULT 'paid',
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  CONSTRAINT `factures_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `facture_items`;
CREATE TABLE `facture_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `facture_id` varchar(36) NOT NULL,
  `product` varchar(100) NOT NULL,
  `quantity` int NOT NULL,
  `unitPrice` decimal(10,2) NOT NULL,
  `totalPrice` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `facture_id` (`facture_id`),
  CONSTRAINT `facture_items_ibfk_1` FOREIGN KEY (`facture_id`) REFERENCES `factures` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `partenaire`;
CREATE TABLE `partenaire` (
  `code` varchar(2) DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `productions`;
CREATE TABLE `productions` (
  `id` varchar(36) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date DEFAULT NULL,
  `status` enum('planifié','en cours','terminé','annule') NOT NULL DEFAULT 'planifié',
  `description` text,
  `currentStep` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `progress` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `production_steps`;
CREATE TABLE `production_steps` (
  `id` varchar(50) NOT NULL,
  `production_id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `status` enum('pending','in-progress','completed') NOT NULL DEFAULT 'pending',
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `duration` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `production_id` (`production_id`),
  CONSTRAINT `production_steps_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `maintenance` tinyint(1) DEFAULT '0',
  `registration` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE admin_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,     -- identifiant unique
    user_id CHAR(45) NULL,                     -- l'utilisateur qui envoie le message (NULL si non connecté)
    email VARCHAR(255) NOT NULL,             -- email de l'expéditeur
    message TEXT NOT NULL,                   -- contenu du message
    status ENUM('new','read','responded') DEFAULT 'new', -- état du message
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      -- date de création
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- date de dernière mise à jour
);


ALTER TABLE admin_messages 
MODIFY COLUMN user_id CHAR(45) NULL;
