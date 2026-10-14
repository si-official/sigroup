#!/usr/bin/env bash
# Starts an isolated MariaDB for local testing WITHOUT touching the XAMPP
# instance (whose datadir is _mysql-owned and needs sudo to start).
#
#   ./scripts/dev-mysql.sh start | stop | status
#
# Listens on 127.0.0.1:3399 — set DB_PORT=3399 in backend/api/.env.
set -euo pipefail

XAMPP=/Applications/XAMPP/xamppfiles
DATA="${TMPDIR:-/tmp}/cc-mysqldata"
CNF="${TMPDIR:-/tmp}/cc-my.cnf"
SOCK=/tmp/cc3399.sock          # must stay short: macOS caps socket paths at ~104 bytes
PORT=3399
DB=chatcommerce_dev

write_cnf() {
  cat > "$CNF" <<CNF
[mysqld]
user=$(whoami)
datadir=$DATA
socket=$SOCK
port=$PORT
innodb_buffer_pool_size=64M
innodb_log_file_size=16M
lc-messages-dir=$XAMPP/share/mysql
pid-file=${TMPDIR:-/tmp}/cc-mysqld.pid
[client]
socket=$SOCK
port=$PORT
CNF
}

case "${1:-start}" in
  start)
    write_cnf
    if [ ! -d "$DATA/mysql" ]; then
      echo "Initialising datadir at $DATA ..."
      mkdir -p "$DATA"
      "$XAMPP/bin/mysql_install_db" --defaults-file="$CNF" --auth-root-authentication-method=normal >/dev/null
    fi
    nohup "$XAMPP/sbin/mysqld" --defaults-file="$CNF" > "${TMPDIR:-/tmp}/cc-mysqld.log" 2>&1 &
    for _ in $(seq 1 30); do nc -z 127.0.0.1 $PORT >/dev/null 2>&1 && break; done
    if nc -z 127.0.0.1 $PORT >/dev/null 2>&1; then
      "$XAMPP/bin/mysql" --protocol=TCP -h 127.0.0.1 -P $PORT -u root \
        -e "CREATE DATABASE IF NOT EXISTS $DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
      echo "MariaDB up on 127.0.0.1:$PORT, database '$DB' ready."
      echo "Set DB_PORT=$PORT in backend/api/.env"
    else
      echo "Failed to start. Log: ${TMPDIR:-/tmp}/cc-mysqld.log" >&2
      tail -20 "${TMPDIR:-/tmp}/cc-mysqld.log" >&2
      exit 1
    fi
    ;;
  stop)
    pkill -f "cc-my.cnf" && echo "Stopped." || echo "Not running."
    ;;
  status)
    nc -z 127.0.0.1 $PORT >/dev/null 2>&1 && echo "up on $PORT" || echo "down"
    ;;
  *)
    echo "usage: $0 {start|stop|status}" >&2; exit 1 ;;
esac
