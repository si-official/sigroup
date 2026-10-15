-- 013_explain_indexes
-- Indexes added after auditing real query plans (tests/explain_check.php).
-- Each one fixes a plan that was reaching a full table scan.

-- 1. Inbox filter chips aggregate every conversation a tenant owns. The
--    existing idx_conv_inbox stops at last_message_at, so unread_count and
--    is_starred forced a row lookup and the optimiser scanned instead.
--    This index covers the whole aggregate — index-only, no table reads.
ALTER TABLE conversations
  ADD INDEX idx_conv_counts (tenant_id, status, unread_count, is_starred);

-- 2. "Top products by revenue" joins order_items -> orders and sums subtotal.
--    idx_oi_product (tenant_id, product_id) could not supply order_id,
--    subtotal or qty, so every row needed a lookup. Covering index.
ALTER TABLE order_items
  ADD INDEX idx_oi_revenue (tenant_id, order_id, product_id, qty, subtotal);

-- 3. REAL BUG, not a size artefact: the token-health cron filters on
--    is_active + token_expires_at, but idx_channel_expiry starts with
--    `status`, so it was unusable and the cron scanned every channel on the
--    platform every day. At 500 tenants that is the kind of thing that
--    quietly makes a nightly cron overrun its window.
ALTER TABLE channels
  ADD INDEX idx_channel_token_health (is_active, token_expires_at);

-- 4. REAL BUG: the courier sync filters `status NOT IN (...) OR status IS
--    NULL` — a negative condition no index can serve — so idx_ship_sync
--    (status, status_updated_at) never applied. Leading with the time column
--    lets the 15-minute window drive the scan instead, and the status filter
--    becomes a cheap residual.
ALTER TABLE courier_shipments
  ADD INDEX idx_ship_pending (status_updated_at, status);

-- 5. Low-stock alerts compare two columns (stock <= low_stock_at), which no
--    B-tree can satisfy directly. idx_prod_stock still narrows to the
--    tenant's active tracked products before the comparison runs; this
--    narrower index makes that prefix cheaper.
ALTER TABLE products
  ADD INDEX idx_prod_lowstock (tenant_id, status, track_stock, stock);
