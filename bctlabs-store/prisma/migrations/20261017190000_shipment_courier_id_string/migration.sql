-- Partner API v2 identifies couriers by a 24-char hex id, not a small integer.
ALTER TABLE `bctlabs_shipments`
  MODIFY COLUMN `courier_id` VARCHAR(64) NULL;
