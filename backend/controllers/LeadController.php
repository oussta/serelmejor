<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';

class LeadController {

    // GET /leads
    public static function getAll() {
        $user   = AuthMiddleware::authenticate();
        $pdo    = getDB();
        $status = $_GET['status'] ?? null;

        if ($status) {
            $stmt = $pdo->prepare("SELECT * FROM leads WHERE business_id = ? AND status = ? ORDER BY created_at DESC");
            $stmt->execute([$user['business_id'], $status]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM leads WHERE business_id = ? ORDER BY created_at DESC");
            $stmt->execute([$user['business_id']]);
        }

        Response::json($stmt->fetchAll());
    }

    // POST /leads
    public static function create() {
        $user  = AuthMiddleware::authenticate();
        $data  = json_decode(file_get_contents("php://input"), true);
        $error = Validator::required($data, ['client_name']);
        if ($error) Response::error($error, 400);

        $client_name       = Validator::sanitize($data['client_name']);
        $inquiry_text      = isset($data['inquiry_text'])      ? Validator::sanitize($data['inquiry_text']) : null;
        $close_probability = isset($data['close_probability']) ? (int)$data['close_probability']           : 0;

        $pdo  = getDB();
        $stmt = $pdo->prepare("INSERT INTO leads (business_id, client_name, inquiry_text, close_probability) VALUES (?, ?, ?, ?) RETURNING *");
        $stmt->execute([$user['business_id'], $client_name, $inquiry_text, $close_probability]);

        Response::json($stmt->fetch(), 201);
    }

    // GET /leads/stats
    public static function stats() {
        $user = AuthMiddleware::authenticate();
        $pdo  = getDB();

        $stmt = $pdo->prepare("SELECT status, COUNT(*) as count FROM leads WHERE business_id = ? GROUP BY status");
        $stmt->execute([$user['business_id']]);
        $rows = $stmt->fetchAll();

        $stats = ['new' => 0, 'contacted' => 0, 'negotiating' => 0, 'won' => 0, 'lost' => 0];
        foreach ($rows as $row) {
            $stats[$row['status']] = (int)$row['count'];
        }

        Response::json($stats);
    }

    // GET /leads/:id
    public static function getOne($id) {
    $user = AuthMiddleware::authenticate();
    $pdo  = getDB();
    
    // TEMP DEBUG
    Response::json([
        'debug_user' => $user,
        'debug_id' => $id,
        'debug_business_id' => $user['business_id'] ?? 'NOT SET'
    ]);
    return;

    $stmt = $pdo->prepare("SELECT * FROM leads WHERE id = ? AND business_id = ?");
    $stmt->execute([$id, $user['business_id']]);
    $lead = $stmt->fetch();

    if (!$lead) Response::error("Lead not found", 404);

    Response::json($lead);
}

    // PUT /leads/:id
    public static function update($id) {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);
        $pdo  = getDB();

        $stmt = $pdo->prepare("SELECT id FROM leads WHERE id = ? AND business_id = ?");
        $stmt->execute([$id, $user['business_id']]);
        if (!$stmt->fetch()) Response::error("Lead not found", 404);

        $client_name       = isset($data['client_name'])       ? Validator::sanitize($data['client_name'])  : null;
        $inquiry_text      = isset($data['inquiry_text'])      ? Validator::sanitize($data['inquiry_text']) : null;
        $close_probability = isset($data['close_probability']) ? (int)$data['close_probability']            : null;

        $stmt = $pdo->prepare("UPDATE leads SET
            client_name       = COALESCE(?, client_name),
            inquiry_text      = COALESCE(?, inquiry_text),
            close_probability = COALESCE(?, close_probability)
            WHERE id = ? RETURNING *");
        $stmt->execute([$client_name, $inquiry_text, $close_probability, $id]);

        Response::json($stmt->fetch());
    }

    // DELETE /leads/:id
    public static function delete($id) {
        $user = AuthMiddleware::authenticate();
        $pdo  = getDB();

        $stmt = $pdo->prepare("SELECT id FROM leads WHERE id = ? AND business_id = ?");
        $stmt->execute([$id, $user['business_id']]);
        if (!$stmt->fetch()) Response::error("Lead not found", 404);

        $pdo->prepare("DELETE FROM leads WHERE id = ?")->execute([$id]);

        Response::json(["message" => "Lead deleted"]);
    }

    // PUT /leads/:id/status
    public static function updateStatus($id) {
        $user  = AuthMiddleware::authenticate();
        $data  = json_decode(file_get_contents("php://input"), true);
        $error = Validator::required($data, ['status']);
        if ($error) Response::error($error, 400);

        $validStatuses = ['new', 'contacted', 'negotiating', 'won', 'lost'];
        if (!in_array($data['status'], $validStatuses)) {
            Response::error("Invalid status", 400);
        }

        $pdo  = getDB();
        $stmt = $pdo->prepare("SELECT id FROM leads WHERE id = ? AND business_id = ?");
        $stmt->execute([$id, $user['business_id']]);
        if (!$stmt->fetch()) Response::error("Lead not found", 404);

        $stmt = $pdo->prepare("UPDATE leads SET status = ? WHERE id = ? RETURNING *");
        $stmt->execute([$data['status'], $id]);
        $lead = $stmt->fetch();

        $bridge = null;

        // ── The Bridge — triggers when lead is marked as Won ──
        if ($data['status'] === 'won') {
            $productId = isset($data['product_id']) ? (int)$data['product_id'] : null;
            $quantity  = isset($data['quantity'])   ? (int)$data['quantity']   : 1;
            $userId    = $user['user_id'] ?? $user['id'] ?? 0;

            if ($productId) {
                require_once __DIR__ . '/../services/BridgeService.php';
                $bridgeService = new BridgeService($pdo);
                $bridge = $bridgeService->trigger(
                    (int)$id,
                    $productId,
                    $quantity,
                    (int)$user['business_id'],
                    (int)$userId
                );
            }
        }

        Response::json([
            'lead'   => $lead,
            'bridge' => $bridge,
        ]);
    }

    // GET /leads/:id/messages
    public static function getMessages($id) {
        $user = AuthMiddleware::authenticate();
        $pdo  = getDB();

        $stmt = $pdo->prepare("SELECT id FROM leads WHERE id = ? AND business_id = ?");
        $stmt->execute([$id, $user['business_id']]);
        if (!$stmt->fetch()) Response::error("Lead not found", 404);

        $stmt = $pdo->prepare("SELECT lm.*, u.name as sender_name FROM lead_messages lm LEFT JOIN users u ON u.id = lm.sent_by WHERE lm.lead_id = ? ORDER BY lm.sent_at ASC");
        $stmt->execute([$id]);

        Response::json($stmt->fetchAll());
    }

    // POST /leads/:id/messages
    public static function addMessage($id) {
        $user  = AuthMiddleware::authenticate();
        $data  = json_decode(file_get_contents("php://input"), true);
        $error = Validator::required($data, ['content']);
        if ($error) Response::error($error, 400);

        $pdo  = getDB();
        $stmt = $pdo->prepare("SELECT id FROM leads WHERE id = ? AND business_id = ?");
        $stmt->execute([$id, $user['business_id']]);
        if (!$stmt->fetch()) Response::error("Lead not found", 404);

        $content      = Validator::sanitize($data['content']);
        $ai_generated = isset($data['ai_generated']) && $data['ai_generated'] ? 'true' : 'false';

        $stmt = $pdo->prepare("INSERT INTO lead_messages (lead_id, content, sent_by, ai_generated) VALUES (?, ?, ?, ?) RETURNING *");
        $stmt->execute([$id, $content, $user['user_id'], $ai_generated]);

        Response::json($stmt->fetch(), 201);
    }

    // PUT /leads/:id/messages/:msgId
    public static function updateMessage($id, $msgId) {
        $user  = AuthMiddleware::authenticate();
        $data  = json_decode(file_get_contents("php://input"), true);
        $error = Validator::required($data, ['content']);
        if ($error) Response::error($error, 400);

        $pdo     = getDB();
        $content = Validator::sanitize($data['content']);

        $stmt = $pdo->prepare("UPDATE lead_messages SET content = ? WHERE id = ? AND lead_id = ? RETURNING *");
        $stmt->execute([$content, $msgId, $id]);
        $msg = $stmt->fetch();

        if (!$msg) Response::error("Message not found", 404);

        Response::json($msg);
    }

    // DELETE /leads/:id/messages/:msgId
    public static function deleteMessage($id, $msgId) {
        AuthMiddleware::authenticate();
        $pdo  = getDB();

        $stmt = $pdo->prepare("SELECT id FROM lead_messages WHERE id = ? AND lead_id = ?");
        $stmt->execute([$msgId, $id]);
        if (!$stmt->fetch()) Response::error("Message not found", 404);

        $pdo->prepare("DELETE FROM lead_messages WHERE id = ?")->execute([$msgId]);

        Response::json(["message" => "Message deleted"]);
    }

    // GET /leads/:id/followups
    public static function getFollowups($id) {
        $user = AuthMiddleware::authenticate();
        $pdo  = getDB();

        $stmt = $pdo->prepare("SELECT id FROM leads WHERE id = ? AND business_id = ?");
        $stmt->execute([$id, $user['business_id']]);
        if (!$stmt->fetch()) Response::error("Lead not found", 404);

        $stmt = $pdo->prepare("SELECT * FROM followups WHERE lead_id = ? ORDER BY scheduled_at ASC");
        $stmt->execute([$id]);

        Response::json($stmt->fetchAll());
    }

    // POST /leads/:id/followups
    public static function createFollowup($id) {
        $user  = AuthMiddleware::authenticate();
        $data  = json_decode(file_get_contents("php://input"), true);
        $error = Validator::required($data, ['scheduled_at']);
        if ($error) Response::error($error, 400);

        $pdo  = getDB();
        $stmt = $pdo->prepare("SELECT id FROM leads WHERE id = ? AND business_id = ?");
        $stmt->execute([$id, $user['business_id']]);
        if (!$stmt->fetch()) Response::error("Lead not found", 404);

        $stmt = $pdo->prepare("INSERT INTO followups (lead_id, scheduled_at) VALUES (?, ?) RETURNING *");
        $stmt->execute([$id, $data['scheduled_at']]);

        Response::json($stmt->fetch(), 201);
    }

    // PUT /leads/:id/followups/:fId
    public static function updateFollowup($id, $fId) {
        AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);
        $pdo  = getDB();

        $sent    = isset($data['sent'])    ? (bool)$data['sent']                   : null;
        $outcome = isset($data['outcome']) ? Validator::sanitize($data['outcome']) : null;

        $stmt = $pdo->prepare("UPDATE followups SET
            sent    = COALESCE(?, sent),
            outcome = COALESCE(?, outcome)
            WHERE id = ? AND lead_id = ? RETURNING *");
        $stmt->execute([$sent, $outcome, $fId, $id]);
        $followup = $stmt->fetch();

        if (!$followup) Response::error("Followup not found", 404);

        Response::json($followup);
    }
}