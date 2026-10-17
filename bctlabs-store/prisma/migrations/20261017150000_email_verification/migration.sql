-- Short-lived hashed codes for email verification (signup / password reset).
CREATE TABLE IF NOT EXISTS `bctlabs_email_verifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(191) NOT NULL,
  `purpose` VARCHAR(32) NOT NULL DEFAULT 'signup',
  `code_hash` VARCHAR(191) NOT NULL,
  `payload` JSON NULL,
  `attempts` INT UNSIGNED NOT NULL DEFAULT 0,
  `expires_at` DATETIME NOT NULL,
  `consumed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email_verification_lookup` (`email`, `purpose`, `created_at`),
  KEY `idx_email_verification_expiry` (`expires_at`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
