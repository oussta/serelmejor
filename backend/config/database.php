<?php
require_once __DIR__ . '/../utils/Response.php';

function getDB() {
    $host = $_ENV['DB_HOST'];
    $name = $_ENV['DB_NAME'];
    $user = $_ENV['DB_USER'];
    $pass = $_ENV['DB_PASS'];
    $port = $_ENV['DB_PORT'] ?? '5432';

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