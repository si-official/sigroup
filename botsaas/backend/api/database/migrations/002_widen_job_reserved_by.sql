-- 002_widen_job_reserved_by
-- reserved_by holds a per-batch claim token ("<workerId>:<rand>"), not just a
-- worker id, because the queue claims rows with a portable UPDATE stamp rather
-- than SELECT ... FOR UPDATE SKIP LOCKED (unsupported before MariaDB 10.6).
ALTER TABLE jobs MODIFY COLUMN reserved_by VARCHAR(64) NULL;
ALTER TABLE jobs ADD INDEX idx_job_reserved (reserved_by, status);
