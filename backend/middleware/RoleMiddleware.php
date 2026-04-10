<?php
require_once __DIR__ . '/../utils/Response.php';

class RoleMiddleware {
    
    // Check if the user has the required role
    public static function require($user, $allowedRoles) {
        if (!in_array($user['role'], $allowedRoles)) {
            Response::error("Access denied. Insufficient permissions.", 403);
        }
    }
}