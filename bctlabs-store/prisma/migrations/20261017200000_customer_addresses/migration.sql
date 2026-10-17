-- Saved billing/shipping addresses for returning customers.
CREATE TABLE IF NOT EXISTS `bctlabs_customer_addresses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_id` BIGINT UNSIGNED NOT NULL,
  `label` VARCHAR(60) NOT NULL DEFAULT 'Home',
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `company` VARCHAR(191) NOT NULL DEFAULT '',
  `address_1` VARCHAR(191) NOT NULL,
  `address_2` VARCHAR(191) NOT NULL DEFAULT '',
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `postcode` VARCHAR(20) NOT NULL,
  `country` VARCHAR(2) NOT NULL DEFAULT 'IN',
  `phone` VARCHAR(32) NOT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customer_address_customer` (`customer_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
