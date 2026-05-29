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

        $stmt = $pdo->prepare("SELECT COUNT(*) as total_users FROM users WHERE business_id = ?");
        $stmt->execute([$user['business_id']]);
        $users = $stmt->fetch();

        $stmt = $pdo->prepare("SELECT COUNT(*) as total_leads FROM leads WHERE business_id = ?");
        $stmt->execute([$user['business_id']]);
        $leads = $stmt->fetch();

        $stmt = $pdo->prepare("SELECT COUNT(*) as total_products FROM products WHERE business_id = ?");
        $stmt->execute([$user['business_id']]);
        $products = $stmt->fetch();

        Response::json([
            "total_users"    => (int) $users['total_users'],
            "total_leads"    => (int) $leads['total_leads'],
            "total_products" => (int) $products['total_products'],
        ]);
    }

    // PUT /business/subscription
    public static function updateSubscription() {
        $user = AuthMiddleware::handle();
        RoleMiddleware::require($user, ['owner', 'admin']);

        $data  = json_decode(file_get_contents("php://input"), true);
        $error = Validator::required($data, ['plan']);
        if ($error) Response::error($error, 400);

        $plan = Validator::sanitize($data['plan']);

        if (!in_array($plan, ['salesflow', 'stockflow', 'full'])) {
            Response::error("Invalid plan", 400);
        }

        $price = match($plan) {
            'salesflow' => 29.00,
            'stockflow' => 29.00,
            'full'      => 49.00,
        };

        $pdo = getDB();

        // Update business plan
        $stmt = $pdo->prepare("UPDATE businesses SET subscription_plan = ? WHERE id = ?");
        $stmt->execute([$plan, $user['business_id']]);

        // Update or insert subscription
        $stmt = $pdo->prepare("SELECT id FROM subscriptions WHERE business_id = ?");
        $stmt->execute([$user['business_id']]);
        $sub = $stmt->fetch();

        if ($sub) {
            $stmt = $pdo->prepare("UPDATE subscriptions SET plan = ?, price = ?, status = 'active' WHERE business_id = ?");
            $stmt->execute([$plan, $price, $user['business_id']]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO subscriptions (business_id, plan, price, status) VALUES (?, ?, ?, 'active')");
            $stmt->execute([$user['business_id'], $plan, $price]);
        }

        Response::json([
            "message" => "Plan updated successfully",
            "plan"    => $plan,
            "price"   => $price
        ]);
    }
}
