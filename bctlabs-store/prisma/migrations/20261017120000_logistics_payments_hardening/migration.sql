-- Label/origin tracking on shipments.
ALTER TABLE `bctlabs_shipments`
  ADD COLUMN IF NOT EXISTS `label_url` VARCHAR(512) NULL AFTER `manifest_url`,
  ADD COLUMN IF NOT EXISTS `origin_warehouse` VARCHAR(16) NULL AFTER `label_url`,
  ADD COLUMN IF NOT EXISTS `origin_pincode` VARCHAR(10) NULL AFTER `origin_warehouse`;

-- Append-only shipment timeline used by the customer tracking stepper.
CREATE TABLE IF NOT EXISTS `bctlabs_shipment_events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `shipment_id` BIGINT UNSIGNED NOT NULL,
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
  ) NOT NULL,
  `status_code` VARCHAR(64) NULL,
  `raw_status` VARCHAR(191) NULL,
  `occurred_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_shipment_event` (`shipment_id`, `status`, `occurred_at`),
  KEY `idx_shipment_event_shipment` (`shipment_id`, `occurred_at`),
  CONSTRAINT `fk_shipment_event_shipment` FOREIGN KEY (`shipment_id`)
    REFERENCES `bctlabs_shipments` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Idempotency ledger for gateway webhooks. `event_key` is unique per
-- (provider, payment, event type) so a retried delivery is a no-op.
CREATE TABLE IF NOT EXISTS `bctlabs_payment_events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_key` VARCHAR(191) NOT NULL,
  `order_id` BIGINT UNSIGNED NULL,
  `provider` VARCHAR(32) NOT NULL,
  `event_type` VARCHAR(64) NOT NULL,
  `cf_order_id` VARCHAR(64) NULL,
  `cf_payment_id` VARCHAR(64) NULL,
  `amount` DECIMAL(10, 2) NULL,
  `payload` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_payment_event_key` (`event_key`),
  KEY `idx_payment_event_order` (`order_id`),
  KEY `idx_payment_event_payment` (`cf_payment_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
