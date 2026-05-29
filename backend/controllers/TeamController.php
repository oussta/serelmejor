<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';

class TeamController {

    // GET /team
    public static function getAll() {
        $user = AuthMiddleware::handle();
        $pdo  = getDB();

        $stmt = $pdo->prepare("SELECT id, name, email, role, created_at FROM users WHERE business_id = ?");
        $stmt->execute([$user['business_id']]);
        $team = $stmt->fetchAll();

        Response::json($team);
    }

    // POST /team/invite
    public static function invite() {
        $user = AuthMiddleware::handle();
        RoleMiddleware::require($user, ['owner', 'admin']);

        $data  = json_decode(file_get_contents("php://input"), true);
        $error = Validator::required($data, ['name', 'email', 'password', 'role']);
        if ($error) Response::error($error, 400);

        $error = Validator::email($data['email']);
        if ($error) Response::error($error, 400);

        $name  = Validator::sanitize($data['name']);
        $email = Validator::sanitize($data['email']);
        $role  = Validator::sanitize($data['role']);

        // Only valid roles allowed
        if (!in_array($role, ['employee', 'supplier'])) {
            Response::error("Invalid role. Allowed: employee, supplier", 400);
        }

        $pdo  = getDB();
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) Response::error("Email already registered", 409);

        $hash = password_hash($data['password'], PASSWORD_BCRYPT);

        $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, business_id) VALUES (?, ?, ?, ?, ?) RETURNING id, name, email, role");
        $stmt->execute([$name, $email, $hash, $role, $user['business_id']]);
        $newUser = $stmt->fetch();

        Response::json($newUser, 201);
    }

    // PUT /team/:id/role
    public static function updateRole($id) {
        $user = AuthMiddleware::handle();
        RoleMiddleware::require($user, ['owner', 'admin']);

        $data  = json_decode(file_get_contents("php://input"), true);
        $error = Validator::required($data, ['role']);
        if ($error) Response::error($error, 400);

        $role = Validator::sanitize($data['role']);

        if (!in_array($role, ['employee', 'supplier'])) {
            Response::error("Invalid role", 400);
        }

        $pdo  = getDB();

        // Make sure the user belongs to the same business
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND business_id = ?");
        $stmt->execute([$id, $user['business_id']]);
        if (!$stmt->fetch()) Response::error("User not found", 404);

        $stmt = $pdo->prepare("UPDATE users SET role = ? WHERE id = ? RETURNING id, name, email, role");
        $stmt->execute([$role, $id]);
        $updated = $stmt->fetch();

        Response::json($updated);
    }

    // DELETE /team/:id
    public static function delete($id) {
        $user = AuthMiddleware::handle();
        RoleMiddleware::require($user, ['owner', 'admin']);

        $pdo  = getDB();

        // Make sure the user belongs to the same business
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND business_id = ?");
        $stmt->execute([$id, $user['business_id']]);
        if (!$stmt->fetch()) Response::error("User not found", 404);

        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);

        Response::json(["message" => "User removed from team"]);
    }
}
