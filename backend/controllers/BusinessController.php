<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';

class BusinessController {

    // GET /business
    public static function get() {
        $user = AuthMiddleware::handle();
        $pdo  = getDB();

        $stmt = $pdo->prepare("
            SELECT b.*, s.plan, s.price, s.status as subscription_status
            FROM businesses b
            LEFT JOIN subscriptions s ON s.business_id = b.id
            WHERE b.id = ?
        ");
        $stmt->execute([$user['business_id']]);
        $business = $stmt->fetch();

        if (!$business) Response::error("Business not found", 404);

        Response::json($business);
    }

    // PUT /business
    public static function update() {
        $user = AuthMiddleware::handle();
        RoleMiddleware::require($user, ['owner', 'admin']);

        $data = json_decode(file_get_contents("php://input"), true);
        $pdo  = getDB();

        $name   = isset($data['name'])   ? Validator::sanitize($data['name'])   : null;
        $sector = isset($data['sector']) ? Validator::sanitize($data['sector']) : null;

        $stmt = $pdo->prepare("UPDATE businesses SET 
            name   = COALESCE(?, name),
            sector = COALESCE(?, sector)
            WHERE id = ? RETURNING *");
        $stmt->execute([$name, $sector, $user['business_id']]);
        $business = $stmt->fetch();

        Response::json($business);
    }

    // GET /business/stats
    public static function stats() {
        $user = AuthMiddleware::handle();
        $pdo  = getDB();

        // Count team members
        $stmt = $pdo->prepare("SELECT COUNT(*) as total_users FROM users WHERE business_id = ?");
        $stmt->execute([$user['business_id']]);
        $users = $stmt->fetch();

        // Count leads
        $stmt = $pdo->prepare("SELECT COUNT(*) as total_leads FROM leads WHERE business_id = ?");
        $stmt->execute([$user['business_id']]);
        $leads = $stmt->fetch();

        // Count products
        $stmt = $pdo->prepare("SELECT COUNT(*) as total_products FROM products WHERE business_id = ?");
        $stmt->execute([$user['business_id']]);
        $products = $stmt->fetch();

        Response::json([
            "total_users"    => (int) $users['total_leads'],
            "total_leads"    => (int) $leads['total_leads'],
            "total_products" => (int) $products['total_products'],
        ]);
    }
}