<?php
require_once __DIR__ . '/../utils/Response.php';

function getDB() {
    $host = getenv('DB_HOST') ?: $_ENV['DB_HOST'] ?? 'localhost';
    $name = getenv('DB_NAME') ?: $_ENV['DB_NAME'] ?? 'salesek';
    $user = getenv('DB_USER') ?: $_ENV['DB_USER'] ?? 'postgres';
    $pass = getenv('DB_PASS') ?: $_ENV['DB_PASS'] ?? '';
    $port = getenv('DB_PORT') ?: $_ENV['DB_PORT'] ?? '5432';

    try {
        $dsn = "pgsql:host=$host;dbname=$name;port=$port";
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        Response::error("Database connection failed: " . $e->getMessage(), 500);
    }
}
