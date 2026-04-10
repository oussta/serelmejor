<?php
require_once __DIR__ . '/../utils/JWT.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthMiddleware {
    
    // Runs on every protected route
    public static function handle() {
        // Get the Authorization header from the request
        $headers = getallheaders();
        $auth    = $headers['Authorization'] ?? '';
        
        // Check it starts with "Bearer "
        if (!str_starts_with($auth, 'Bearer ')) {
            Response::error("No token provided", 401);
        }
        
        // Extract the token (remove "Bearer " prefix)
        $token = substr($auth, 7);
        
        // Verify the token
        $decoded = JWTHelper::verify($token);
        
        if (!$decoded) {
            Response::error("Invalid or expired token", 401);
        }
        
        // Return the user data from the token
        return $decoded;
    }
}