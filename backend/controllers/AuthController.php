<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/JWT.php';
require_once __DIR__ . '/../utils/Validator.php';

class AuthController {

    // POST /register
    public static function register() {
        $data = json_decode(file_get_contents("php://input"), true);

        $error = Validator::required($data, ['name', 'email', 'password', 'business_name', 'plan']);
        if ($error) Response::error($error, 400);

        $error = Validator::email($data['email']);
        if ($error) Response::error($error, 400);

        $error = Validator::password($data['password']);
        if ($error) Response::error($error, 400);

        $name          = Validator::sanitize($data['name']);
        $email         = Validator::sanitize($data['email']);
        $business_name = Validator::sanitize($data['business_name']);
        $plan          = Validator::sanitize($data['plan']);

        $price = match($plan) {
            'salesflow'  => 29.00,
            'stockflow'  => 29.00,
            'full'       => 49.00,
            default      => 49.00
        };

        $pdo = getDB();

        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            Response::error("Email already registered", 409);
        }

        $hash = password_hash($data['password'], PASSWORD_BCRYPT);

        $stmt = $pdo->prepare("INSERT INTO businesses (name, subscription_plan) VALUES (?, ?) RETURNING id");
        $stmt->execute([$business_name, $plan]);
        $business_id = $stmt->fetch()['id'];

        $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, business_id) VALUES (?, ?, ?, 'owner', ?) RETURNING id");
        $stmt->execute([$name, $email, $hash, $business_id]);
        $user_id = $stmt->fetch()['id'];

        $stmt = $pdo->prepare("INSERT INTO subscriptions (business_id, plan, price) VALUES (?, ?, ?)");
        $stmt->execute([$business_id, $plan, $price]);

        $token = JWTHelper::generate([
            'user_id'     => $user_id,
            'role'        => 'owner',
            'business_id' => $business_id
        ]);

        Response::json([
            "token" => $token,
            "user"  => [
                "id"          => $user_id,
                "name"        => $name,
                "email"       => $email,
                "role"        => "owner",
                "business_id" => $business_id,
                "plan"        => $plan
            ]
        ], 201);
    }

    // POST /login
    public static function login() {
        $data = json_decode(file_get_contents("php://input"), true);

        $error = Validator::required($data, ['email', 'password']);
        if ($error) Response::error($error, 400);

        $email = Validator::sanitize($data['email']);

        $pdo  = getDB();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($data['password'], $user['password_hash'])) {
            Response::error("Invalid email or password", 401);
        }

        $token = JWTHelper::generate([
            'user_id'     => $user['id'],
            'role'        => $user['role'],
            'business_id' => $user['business_id']
        ]);

        Response::json([
            "token" => $token,
            "user"  => [
                "id"          => $user['id'],
                "name"        => $user['name'],
                "email"       => $user['email'],
                "role"        => $user['role'],
                "business_id" => $user['business_id']
            ]
        ]);
    }

    // GET /me
    public static function me() {
        require_once __DIR__ . '/../middleware/AuthMiddleware.php';
        $current = AuthMiddleware::handle();

        $pdo  = getDB();
        $stmt = $pdo->prepare("SELECT id, name, email, role, business_id, created_at FROM users WHERE id = ?");
        $stmt->execute([$current['user_id']]);
        $user = $stmt->fetch();

        if (!$user) Response::error("User not found", 404);

        Response::json($user);
    }

    // POST /logout
    public static function logout() {
        Response::json(["message" => "Logged out successfully"]);
    }

    // POST /forgot-password
    public static function forgotPassword() {
        $data  = json_decode(file_get_contents("php://input"), true);
        $error = Validator::required($data, ['email']);
        if ($error) Response::error($error, 400);

        $email = Validator::sanitize($data['email']);
        $pdo   = getDB();

        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::json(["message" => "If this email exists you will receive a reset link"]);
        }

        $token  = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', time() + 3600);

        $stmt = $pdo->prepare("UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?");
        $stmt->execute([$token, $expiry, $user['id']]);

        Response::json([
            "message" => "Reset token generated",
            "token"   => $token
        ]);
    }

    // POST /reset-password
    public static function resetPassword() {
        $data  = json_decode(file_get_contents("php://input"), true);
        $error = Validator::required($data, ['token', 'password']);
        if ($error) Response::error($error, 400);

        $error = Validator::password($data['password']);
        if ($error) Response::error($error, 400);

        $pdo  = getDB();
        $stmt = $pdo->prepare("SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()");
        $stmt->execute([$data['token']]);
        $user = $stmt->fetch();

        if (!$user) Response::error("Invalid or expired reset token", 400);

        $hash = password_hash($data['password'], PASSWORD_BCRYPT);

        $stmt = $pdo->prepare("UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?");
        $stmt->execute([$hash, $user['id']]);

        Response::json(["message" => "Password reset successfully"]);
    }
}