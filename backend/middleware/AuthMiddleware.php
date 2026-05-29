<?php
require_once __DIR__ . '/../utils/JWT.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthMiddleware {

    // Used by existing controllers
    public static function handle(): array {
        return self::authenticate();
    }

    // Used by new controllers (ProductController, SupplierController, OrderController)
    public static function authenticate(): array {
        $headers = getallheaders();
        $auth    = $headers['Authorization'] ?? '';

        if (!str_starts_with($auth, 'Bearer ')) {
            Response::json(['error' => 'No token provided'], 401);
            exit();
        }

        $token   = substr($auth, 7);
        $decoded = JWTHelper::verify($token);

        if (!$decoded) {
            Response::json(['error' => 'Invalid or expired token'], 401);
            exit();
        }

        return $decoded;
    }
}
