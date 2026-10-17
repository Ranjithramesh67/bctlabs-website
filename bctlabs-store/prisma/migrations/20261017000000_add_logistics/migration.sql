-- Logistics (NimbusPost) storage.
--
-- Shipments live in their own table rather than in WooCommerce post meta so the
-- tracking status can be a real ENUM and queried by the admin/warehouse UI.
-- `order_id` is a one-to-one link to `wp_wc_orders.id`.

CREATE TABLE IF NOT EXISTS `bctlabs_shipments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `awb_number` VARCHAR(64) NULL,
  `courier_id` INT NULL,
  `courier_name` VARCHAR(191) NULL,
  `nimbuspost_shipment_id` VARCHAR(64) NULL,
  `status` ENUM(
    'CREATED',
    'PICKUP_SCHEDULED',
    'PICKED_UP',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'RTO_IN_TRANSIT',
    'RTO_DELIVERED',
    'CANCELLED',
    'EXCEPTION',
    'UNKNOWN'
  ) NOT NULL DEFAULT 'CREATED',
  `status_code` VARCHAR(64) NULL,
  `status_updated_at` DATETIME NULL,
  `freight_amount` DECIMAL(10, 2) NULL,
  `cod_amount` DECIMAL(10, 2) NULL,
  `payment_type` ENUM('COD', 'PREPAID') NOT NULL DEFAULT 'PREPAID',
  `weight_grams` INT UNSIGNED NULL,
  `manifest_url` VARCHAR(512) NULL,
  `manifest_generated_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_shipment_order` (`order_id`),
  UNIQUE KEY `uniq_shipment_awb` (`awb_number`),
  KEY `idx_shipment_status` (`status`),
  KEY `idx_shipment_courier` (`courier_name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- One row per manifest PDF handed to the courier for a day's pickup.
CREATE TABLE IF NOT EXISTS `bctlabs_manifests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `courier_name` VARCHAR(191) NOT NULL,
  `awb_numbers` JSON NOT NULL,
  `pdf_url` VARCHAR(512) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_manifest_courier` (`courier_name`),
  KEY `idx_manifest_created` (`created_at`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
