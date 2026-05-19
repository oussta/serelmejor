<?php
// Path: backend/controllers/OrderController.php

require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class OrderController {

    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    // GET /orders
    public function getAll(): void {
        $user = AuthMiddleware::authenticate();
        $stmt = $this->db->prepare("
            SELECT po.*,
                   s.name         as supplier_name,
                   s.email        as supplier_email,
                   p.name         as product_name,
                   p.current_stock,
                   p.min_stock
            FROM purchase_orders po
            JOIN suppliers s ON s.id = po.supplier_id
            JOIN products  p ON p.id = po.product_id
            WHERE po.business_id = :business_id
            ORDER BY po.created_at DESC
        ");
        $stmt->execute([':business_id' => $user['business_id']]);
        Response::json($stmt->fetchAll());
    }

    // GET /orders/:id
    public function getOne(int $id): void {
        $user = AuthMiddleware::authenticate();
        $stmt = $this->db->prepare("
            SELECT po.*,
                   s.name         as supplier_name,
                   s.email        as supplier_email,
                   s.contact_name as supplier_contact,
                   p.name         as product_name,
                   p.current_stock,
                   p.min_stock
            FROM purchase_orders po
            JOIN suppliers s ON s.id = po.supplier_id
            JOIN products  p ON p.id = po.product_id
            WHERE po.id = :id AND po.business_id = :business_id
        ");
        $stmt->execute([':id' => $id, ':business_id' => $user['business_id']]);
        $order = $stmt->fetch();
        if (!$order) {
            Response::json(['error' => 'Pedido no encontrado'], 404);
            return;
        }
        Response::json($order);
    }

    // POST /orders
    public function create(array $body): void {
        $user = AuthMiddleware::authenticate();

        $supplierId = (int)($body['supplier_id'] ?? 0);
        $productId  = (int)($body['product_id']  ?? 0);
        $quantity   = (int)($body['quantity']     ?? 0);
        $note       = trim($body['note']          ?? '');

        if (!$supplierId || !$productId || $quantity <= 0) {
            Response::json(['error' => 'supplier_id, product_id y quantity son obligatorios'], 422);
            return;
        }

        // Verify supplier belongs to business
        $stmt = $this->db->prepare("
            SELECT id FROM suppliers
            WHERE id = :id AND business_id = :business_id
        ");
        $stmt->execute([':id' => $supplierId, ':business_id' => $user['business_id']]);
        if (!$stmt->fetch()) {
            Response::json(['error' => 'Proveedor no encontrado'], 404);
            return;
        }

        // Verify product belongs to business and get stock info
        $stmt = $this->db->prepare("
            SELECT id, current_stock, name FROM products
            WHERE id = :id AND business_id = :business_id
        ");
        $stmt->execute([':id' => $productId, ':business_id' => $user['business_id']]);
        $product = $stmt->fetch();
        if (!$product) {
            Response::json(['error' => 'Producto no encontrado'], 404);
            return;
        }

        // Validate quantity does not exceed current stock
        if ($quantity > $product['current_stock']) {
            Response::json([
                'error' => "Cantidad máxima permitida: {$product['current_stock']} unidades (stock actual)"
            ], 422);
            return;
        }

        $stmt = $this->db->prepare("
            INSERT INTO purchase_orders (business_id, supplier_id, product_id, quantity, note)
            VALUES (:business_id, :supplier_id, :product_id, :quantity, :note)
            RETURNING *
        ");
        $stmt->execute([
            ':business_id' => $user['business_id'],
            ':supplier_id' => $supplierId,
            ':product_id'  => $productId,
            ':quantity'    => $quantity,
            ':note'        => $note,
        ]);
        Response::json($stmt->fetch(), 201);
    }

    // PUT /orders/:id
    public function update(int $id, array $body): void {
        $user = AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("
            SELECT id FROM purchase_orders
            WHERE id = :id AND business_id = :business_id
        ");
        $stmt->execute([':id' => $id, ':business_id' => $user['business_id']]);
        if (!$stmt->fetch()) {
            Response::json(['error' => 'Pedido no encontrado'], 404);
            return;
        }

        $quantity = (int)($body['quantity'] ?? 0);
        $note     = trim($body['note']      ?? '');

        if ($quantity <= 0) {
            Response::json(['error' => 'La cantidad debe ser mayor que 0'], 422);
            return;
        }

        $stmt = $this->db->prepare("
            UPDATE purchase_orders
            SET quantity = :quantity, note = :note
            WHERE id = :id AND business_id = :business_id
            RETURNING *
        ");
        $stmt->execute([
            ':quantity'    => $quantity,
            ':note'        => $note,
            ':id'          => $id,
            ':business_id' => $user['business_id'],
        ]);
        Response::json($stmt->fetch());
    }

    // DELETE /orders/:id
    public function delete(int $id): void {
        $user = AuthMiddleware::authenticate();
        $stmt = $this->db->prepare("
            DELETE FROM purchase_orders
            WHERE id = :id AND business_id = :business_id
            RETURNING id
        ");
        $stmt->execute([':id' => $id, ':business_id' => $user['business_id']]);
        if (!$stmt->fetch()) {
            Response::json(['error' => 'Pedido no encontrado'], 404);
            return;
        }
        Response::json(['success' => true, 'message' => 'Pedido eliminado']);
    }

    // POST /orders/:id/send
    public function send(int $id): void {
        $user = AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("
            SELECT po.*,
                   s.name         as supplier_name,
                   s.email        as supplier_email,
                   s.contact_name as supplier_contact,
                   p.name         as product_name
            FROM purchase_orders po
            JOIN suppliers s ON s.id = po.supplier_id
            JOIN products  p ON p.id = po.product_id
            WHERE po.id = :id AND po.business_id = :business_id
        ");
        $stmt->execute([':id' => $id, ':business_id' => $user['business_id']]);
        $order = $stmt->fetch();

        if (!$order) {
            Response::json(['error' => 'Pedido no encontrado'], 404);
            return;
        }
        if ($order['status'] === 'sent' || $order['status'] === 'confirmed') {
            Response::json(['error' => 'Este pedido ya fue enviado'], 422);
            return;
        }

        $emailSent = $this->sendOrderEmail($order);

        $stmt = $this->db->prepare("
            UPDATE purchase_orders SET status = 'sent'
            WHERE id = :id
            RETURNING *
        ");
        $stmt->execute([':id' => $id]);
        $updated = $stmt->fetch();

        Response::json([
            'success'    => true,
            'order'      => $updated,
            'email_sent' => $emailSent,
        ]);
    }

    // PUT /orders/:id/confirm
    public function confirm(int $id): void {
        $user = AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("
            SELECT id FROM purchase_orders
            WHERE id = :id AND business_id = :business_id
        ");
        $stmt->execute([':id' => $id, ':business_id' => $user['business_id']]);
        if (!$stmt->fetch()) {
            Response::json(['error' => 'Pedido no encontrado'], 404);
            return;
        }

        $stmt = $this->db->prepare("
            UPDATE purchase_orders SET status = 'confirmed'
            WHERE id = :id
            RETURNING *
        ");
        $stmt->execute([':id' => $id]);
        Response::json($stmt->fetch());
    }

    // PUT /orders/:id/deliver
    public function deliver(int $id): void {
        $user = AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("
            SELECT po.*, p.name as product_name
            FROM purchase_orders po
            JOIN products p ON p.id = po.product_id
            WHERE po.id = :id AND po.business_id = :business_id
        ");
        $stmt->execute([':id' => $id, ':business_id' => $user['business_id']]);
        $order = $stmt->fetch();

        if (!$order) {
            Response::json(['error' => 'Pedido no encontrado'], 404);
            return;
        }

        $stmt = $this->db->prepare("
            UPDATE purchase_orders SET status = 'delivered'
            WHERE id = :id
            RETURNING *
        ");
        $stmt->execute([':id' => $id]);
        $updated = $stmt->fetch();

        // Restock the product
        $stmt = $this->db->prepare("
            UPDATE products
            SET current_stock = current_stock + :quantity
            WHERE id = :product_id
        ");
        $stmt->execute([
            ':quantity'   => $order['quantity'],
            ':product_id' => $order['product_id'],
        ]);

        // Record stock movement
        $stmt = $this->db->prepare("
            INSERT INTO stock_movements (product_id, type, quantity, note)
            VALUES (:product_id, 'restock', :quantity, :note)
        ");
        $stmt->execute([
            ':product_id' => $order['product_id'],
            ':quantity'   => $order['quantity'],
            ':note'       => 'Restock automático — Pedido #' . $id,
        ]);

        Response::json(['success' => true, 'order' => $updated]);
    }

    // ── Private: send order email via SendGrid ────────────
    private function sendOrderEmail(array $order): bool {
        $apiKey    = $_ENV['SENDGRID_KEY']  ?? '';
        $fromEmail = $_ENV['SENDGRID_FROM'] ?? '';

        if (!$apiKey || !$fromEmail) {
            error_log('SendGrid not configured');
            return false;
        }

        $contactLine = $order['supplier_contact']
            ? "<p>Atención: <strong>{$order['supplier_contact']}</strong></p>"
            : '';

        $noteLine = $order['note']
            ? "<p><strong>Nota:</strong> {$order['note']}</p>"
            : '';

        $payload = json_encode([
            'personalizations' => [[
                'to'      => [['email' => $order['supplier_email']]],
                'subject' => "Orden de compra #{$order['id']} — serElMejor",
            ]],
            'from'    => ['email' => $fromEmail, 'name' => 'serElMejor'],
            'content' => [[
                'type'  => 'text/html',
                'value' => "
                    <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto;'>
                        <div style='background: #2563EB; padding: 24px; border-radius: 12px 12px 0 0;'>
                            <h2 style='color: white; margin: 0;'>Orden de Compra #{$order['id']}</h2>
                            <p style='color: rgba(255,255,255,0.8); margin: 8px 0 0;'>serElMejor</p>
                        </div>
                        <div style='background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;'>
                            <p>Estimado/a <strong>{$order['supplier_name']}</strong>,</p>
                            {$contactLine}
                            <p>Le enviamos la siguiente orden de compra:</p>
                            <table style='width: 100%; border-collapse: collapse; margin: 16px 0;'>
                                <tr style='background: #2563EB; color: white;'>
                                    <th style='padding: 10px; text-align: left;'>Producto</th>
                                    <th style='padding: 10px; text-align: center;'>Cantidad</th>
                                    <th style='padding: 10px; text-align: left;'>Estado</th>
                                </tr>
                                <tr style='background: white;'>
                                    <td style='padding: 10px; border: 1px solid #e2e8f0;'>{$order['product_name']}</td>
                                    <td style='padding: 10px; border: 1px solid #e2e8f0; text-align: center;'>{$order['quantity']}</td>
                                    <td style='padding: 10px; border: 1px solid #e2e8f0;'>Pendiente de confirmación</td>
                                </tr>
                            </table>
                            {$noteLine}
                            <p style='color: #64748B; font-size: 13px; margin-top: 24px;'>
                                Por favor confirme la recepción de este pedido respondiendo a este email.<br/>
                                Gracias por su colaboración.
                            </p>
                        </div>
                    </div>
                ",
            ]],
        ]);

        $ch = curl_init('https://api.sendgrid.com/v3/mail/send');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json',
            ],
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) return true;
        error_log('SendGrid order email error ' . $httpCode . ': ' . $response);
        return false;
    }
}