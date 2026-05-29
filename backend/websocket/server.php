<?php
// Path: backend/websocket/server.php

require_once __DIR__ . '/../vendor/autoload.php';

// Load .env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Make env vars accessible via getenv()
foreach ($_ENV as $key => $value) {
    putenv("$key=$value");
}

require_once __DIR__ . '/../config/database.php';

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

class NotificationServer implements MessageComponentInterface {

    protected \SplObjectStorage $clients;
    protected array $userConnections = []; // user_id => [conn1, conn2]
    protected PDO $db;

    public function __construct() {
        $this->clients = new \SplObjectStorage();
        $this->db      = getDB();
        echo "✅ serElMejor WebSocket Server started on port 8080\n";
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "🔌 New connection #{$conn->resourceId}\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg, true);

        if (!$data || !isset($data['type'])) return;

        // ── Auth: client sends token to identify ──
        if ($data['type'] === 'auth') {
            $token = $data['token'] ?? '';
            $user  = $this->verifyToken($token);

            if ($user) {
                $userId = $user['user_id'] ?? $user['id'] ?? null;
                if ($userId) {
                    $this->userConnections[$userId][] = $from;
                    $from->userId = $userId;
                    $from->send(json_encode([
                        'type'    => 'auth_success',
                        'message' => 'Conectado al servidor de notificaciones',
                        'user_id' => $userId,
                    ]));

                    // Send unread notifications immediately
                    $this->sendPendingNotifications($from, $userId);

                    echo "👤 User #{$userId} authenticated on connection #{$from->resourceId}\n";
                }
            } else {
                $from->send(json_encode(['type' => 'auth_error', 'message' => 'Token inválido']));
            }
        }

        // ── Mark notification as read ──
        if ($data['type'] === 'mark_read' && isset($from->userId)) {
            $notifId = (int)($data['notification_id'] ?? 0);
            if ($notifId) {
                $stmt = $this->db->prepare("
                    UPDATE notifications SET read = true
                    WHERE id = :id AND user_id = :user_id
                ");
                $stmt->execute([':id' => $notifId, ':user_id' => $from->userId]);
                $from->send(json_encode(['type' => 'marked_read', 'notification_id' => $notifId]));
            }
        }

        // ── Mark all read ──
        if ($data['type'] === 'mark_all_read' && isset($from->userId)) {
            $stmt = $this->db->prepare("
                UPDATE notifications SET read = true
                WHERE user_id = :user_id AND read = false
            ");
            $stmt->execute([':user_id' => $from->userId]);
            $from->send(json_encode(['type' => 'all_marked_read']));
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);;

        // Remove from userConnections
        if (isset($conn->userId)) {
            $userId = $conn->userId;
            if (isset($this->userConnections[$userId])) {
                $this->userConnections[$userId] = array_filter(
                    $this->userConnections[$userId],
                    fn($c) => $c !== $conn
                );
                if (empty($this->userConnections[$userId])) {
                    unset($this->userConnections[$userId]);
                }
            }
        }

        echo "❌ Connection #{$conn->resourceId} closed\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "⚠️ Error: {$e->getMessage()}\n";
        $conn->close();
    }

    // ── Send pending notifications to a user ──────────────
    private function sendPendingNotifications(ConnectionInterface $conn, int $userId): void {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM notifications
                WHERE user_id = :user_id
                ORDER BY created_at DESC
                LIMIT 50
            ");
            $stmt->execute([':user_id' => $userId]);
            $notifications = $stmt->fetchAll();

            $unreadCount = count(array_filter($notifications, fn($n) => !$n['read']));

            $conn->send(json_encode([
                'type'          => 'notifications',
                'notifications' => $notifications,
                'unread_count'  => $unreadCount,
            ]));
        } catch (\Exception $e) {
            error_log('WebSocket sendPendingNotifications error: ' . $e->getMessage());
        }
    }

    // ── Broadcast notification to specific user ───────────
    public function broadcastToUser(int $userId, array $notification): void {
        if (!isset($this->userConnections[$userId])) return;

        $msg = json_encode([
            'type'         => 'new_notification',
            'notification' => $notification,
        ]);

        foreach ($this->userConnections[$userId] as $conn) {
            $conn->send($msg);
        }
    }

    // ── Verify JWT token ──────────────────────────────────
    private function verifyToken(string $token): ?array {
        try {
            require_once __DIR__ . '/../utils/JWT.php';
            $decoded = JWTHelper::verify($token);
            return $decoded ?: null;
        } catch (\Exception $e) {
            return null;
        }
    }
}

// ── Start server ──────────────────────────────────────────
$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new NotificationServer()
        )
    ),
    8080
);

echo "🚀 WebSocket server running on ws://localhost:8080\n";
$server->run();
