<?php
// One-time setup script — DELETE AFTER USE
// Access: https://api.sigroup.com.bd/setup.php?key=SI_SETUP_2024

if (($_GET['key'] ?? '') !== 'SI_SETUP_2024') {
    http_response_code(403);
    exit(json_encode(['error' => 'Forbidden']));
}

header('Content-Type: application/json');
$results = [];

// 1. Create .env file
$envPath = dirname(__DIR__) . '/.env';
if (!file_exists($envPath)) {
    $envContent = <<<ENV
APP_ENV=production
APP_URL=https://api.sigroup.com.bd

DB_HOST=localhost
DB_NAME=u494078466_sigroup
DB_USER=u494078466_sigroup
DB_PASS=Si2017.@@##**./DBS

JWT_SECRET=sigroup-jwt-2024-xK9mP3qR7vL2nB5wT8yH6jF1cA4eD0

SSLCZ_STORE_ID=your_sslcommerz_store_id
SSLCZ_STORE_PASS=your_sslcommerz_store_password
SSLCZ_IS_LIVE=true
ENV;
    file_put_contents($envPath, $envContent);
    $results['env'] = 'created';
} else {
    $results['env'] = 'already exists';
}

// 2. Import database schema
try {
    $pdo = new PDO(
        'mysql:host=localhost;dbname=u494078466_sigroup;charset=utf8mb4',
        'u494078466_sigroup',
        'Si2017.@@##**./DBS',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $sql = file_get_contents(dirname(__DIR__, 2) . '/database/schema.sql');
    // Split on semicolons, skip comments
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    $count = 0;
    foreach ($statements as $stmt) {
        if ($stmt && !str_starts_with($stmt, '--')) {
            $pdo->exec($stmt);
            $count++;
        }
    }
    $results['db'] = "imported $count statements";
} catch (Exception $e) {
    $results['db_error'] = $e->getMessage();
}

// 3. Test DB connection
try {
    $users = $pdo->query("SELECT id, name, email, role FROM users LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
    $results['users'] = $users;
} catch (Exception $e) {
    $results['users_error'] = $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT);
