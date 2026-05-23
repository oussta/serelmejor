<?php
// Never display errors as HTML — always return JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Catch fatal errors and return JSON instead of HTML


set_error_handler(function($severity, $message, $file, $line) {
    error_log("PHP ERROR: $message in $file on line $line");
    header("Content-Type: application/json");
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'detail' => "$message in $file:$line"]);
    exit();
});

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        header("Content-Type: application/json");
        http_response_code(500);
        echo json_encode(['error' => 'Fatal server error', 'detail' => $error['message']]);
        exit();
    }
});

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/vendor/autoload.php';

// Load .env only in local development
if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
    foreach ($_ENV as $key => $value) {
        putenv("$key=$value");
    }
}

require_once __DIR__ . '/routes/api.php';