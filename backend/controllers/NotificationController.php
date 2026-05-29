<?php
// Path: backend/controllers/NotificationController.php

require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class NotificationController {

    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    // GET /notifications
    public function getAll(): void {
        $user   = AuthMiddleware::authenticate();
        $userId = $user['user_id'] ?? $user['id'] ?? 0;

        $stmt = $this->db->prepare("
            SELECT * FROM notifications
            WHERE user_id = :user_id
            ORDER BY created_at DESC
            LIMIT 50
        ");
        $stmt->execute([':user_id' => $userId]);
        $notifications = $stmt->fetchAll();

        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count FROM notifications
            WHERE user_id = :user_id AND read = false
        ");
        $stmt->execute([':user_id' => $userId]);
        $unread = $stmt->fetch();

        Response::json([
            'notifications' => $notifications,
            'unread_count'  => (int) $unread['count'],
        ]);
    }

    // PUT /notifications/:id/read
    public function markRead(int $id): void {
        $user   = AuthMiddleware::authenticate();
        $userId = $user['user_id'] ?? $user['id'] ?? 0;

        $stmt = $this->db->prepare("
            UPDATE notifications
            SET read = true
            WHERE id = :id AND user_id = :user_id
            RETURNING *
        ");
        $stmt->execute([':id' => $id, ':user_id' => $userId]);
        $notif = $stmt->fetch();

        if (!$notif) {
            Response::json(['error' => 'Notificación no encontrada'], 404);
            return;
        }

        Response::json($notif);
    }

    // PUT /notifications/read-all
    public function markAllRead(): void {
        $user   = AuthMiddleware::authenticate();
        $userId = $user['user_id'] ?? $user['id'] ?? 0;

        $stmt = $this->db->prepare("
            UPDATE notifications
            SET read = true
            WHERE user_id = :user_id AND read = false
        ");
        $stmt->execute([':user_id' => $userId]);

        Response::json(['success' => true, 'message' => 'Todas las notificaciones marcadas como leídas']);
    }

    // DELETE /notifications/:id
    public function delete(int $id): void {
        $user   = AuthMiddleware::authenticate();
        $userId = $user['user_id'] ?? $user['id'] ?? 0;

        $stmt = $this->db->prepare("
            DELETE FROM notifications
            WHERE id = :id AND user_id = :user_id
            RETURNING id
        ");
        $stmt->execute([':id' => $id, ':user_id' => $userId]);

        if (!$stmt->fetch()) {
            Response::json(['error' => 'Notificación no encontrada'], 404);
            return;
        }

        Response::json(['success' => true, 'message' => 'Notificación eliminada']);
    }
}
