<?php
// Path: backend/services/BridgeService.php

require_once __DIR__ . '/../utils/Response.php';

class BridgeService {

    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    // ── Main trigger — called when lead is marked as Won ──
    public function trigger(int $leadId, int $productId, int $quantity, int $businessId, int $userId): array {

        $result = [
            'triggered'     => true,
            'stock_deducted'=> false,
            'low_stock'     => false,
            'order_created' => false,
            'order_id'      => null,
        ];;

        // 1. Get product
        $stmt = $this->db->prepare("
            SELECT * FROM products
            WHERE id = :id AND business_id = :business_id
        ");
        $stmt->execute([':id' => $productId, ':business_id' => $businessId]);
        $product = $stmt->fetch();

        if (!$product) return $result;

        // 2. Deduct stock
        $newStock = max(0, $product['current_stock'] - $quantity);
        $stmt = $this->db->prepare("
            UPDATE products
            SET current_stock = :stock
            WHERE id = :id
        ");
        $stmt->execute([':stock' => $newStock, ':id' => $productId]);
        $result['stock_deducted'] = true;

        // 3. Record stock movement
        $stmt = $this->db->prepare("
            INSERT INTO stock_movements (product_id, type, quantity, note)
            VALUES (:product_id, 'sale', :quantity, :note)
        ");
        $stmt->execute([
            ':product_id' => $productId,
            ':quantity'   => $quantity,
            ':note'       => 'Venta automática — Lead #' . $leadId,
        ]);

        // 4. Check if stock is now below minimum
        if ($newStock <= $product['min_stock']) {
            $result['low_stock'] = true;

            // 5. Find a supplier for this business
            $stmt = $this->db->prepare("
                SELECT * FROM suppliers
                WHERE business_id = :business_id
                LIMIT 1
            ");
            $stmt->execute([':business_id' => $businessId]);
            $supplier = $stmt->fetch();

            if ($supplier) {
                // 6. Auto-create purchase order
                $orderQty = $product['min_stock'] * 3 - $newStock;
                $stmt = $this->db->prepare("
                    INSERT INTO purchase_orders
                    (business_id, supplier_id, product_id, quantity, status, note)
                    VALUES (:business_id, :supplier_id, :product_id, :quantity, 'pending', :note)
                    RETURNING id
                ");
                $stmt->execute([
                    ':business_id' => $businessId,
                    ':supplier_id' => $supplier['id'],
                    ':product_id'  => $productId,
                    ':quantity'    => $orderQty,
                    ':note'        => 'Pedido automático — The Bridge — Lead #' . $leadId,
                ]);
                $order = $stmt->fetch();
                $result['order_created'] = true;
                $result['order_id']      = $order['id'];

                // 7. Send email to supplier
                $this->sendSupplierEmail($supplier, $product, $orderQty, $order['id']);

                // 8. Save low stock notification
                $this->saveNotification(
                    $userId,
                    'low_stock',
                    "⚠️ Stock bajo en {$product['name']}. Pedido automático #{$order['id']} creado al proveedor {$supplier['name']}."
                );

                // 9. Send email to owner
                $this->sendOwnerEmail($userId, $product, $newStock, $supplier, $order['id']);

            } else {
                // No supplier — just notify
                $this->saveNotification(
                    $userId,
                    'low_stock',
                    "⚠️ Stock bajo en {$product['name']} ({$newStock} unidades). Añade un proveedor para automatizar el reabastecimiento."
                );
            }
        } else {
            // Stock is fine — just notify lead won
            $this->saveNotification(
                $userId,
                'lead_won',
                "✅ Lead #{$leadId} ganado. Stock de {$product['name']} actualizado: {$newStock} unidades restantes."
            );
        }

        return $result;
    }

    // ── Save notification to DB ───────────────────────────
    private function saveNotification(int $userId, string $type, string $message): void {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO notifications (user_id, type, message)
                VALUES (:user_id, :type, :message)
            ");
            $stmt->execute([
                ':user_id' => $userId,
                ':type'    => $type,
                ':message' => $message,
            ]);
        } catch (PDOException $e) {
            error_log('BridgeService notification error: ' . $e->getMessage());
        }
    }

    // ── Email to supplier ─────────────────────────────────
    private function sendSupplierEmail(array $supplier, array $product, int $qty, int $orderId): void {
        $apiKey    = $_ENV['SENDGRID_KEY']  ?? '';
        $fromEmail = $_ENV['SENDGRID_FROM'] ?? '';
        if (!$apiKey || !$fromEmail) return;

        $contactLine = $supplier['contact_name']
            ? "<p>Atención: <strong>{$supplier['contact_name']}</strong></p>"
            : '';

        $payload = json_encode([
            'personalizations' => [[
                'to'      => [['email' => $supplier['email']]],
                'subject' => "Orden de compra automática #{$orderId} — serElMejor",
            ]],
            'from'    => ['email' => $fromEmail, 'name' => 'serElMejor'],
            'content' => [[
                'type'  => 'text/html',
                'value' => "
                    <div style='font-family:sans-serif;max-width:600px;margin:0 auto'>
                        <div style='background:#2563EB;padding:24px;border-radius:12px 12px 0 0'>
                            <h2 style='color:white;margin:0'>Orden de Compra Automática #{$orderId}</h2>
                            <p style='color:rgba(255,255,255,0.8);margin:8px 0 0'>serElMejor — The Bridge</p>
                        </div>
                        <div style='background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px'>
                            <p>Estimado/a <strong>{$supplier['name']}</strong>,</p>
                            {$contactLine}
                            <p>Se ha generado automáticamente una orden de compra:</p>
                            <table style='width:100%;border-collapse:collapse;margin:16px 0'>
                                <tr style='background:#2563EB;color:white'>
                                    <th style='padding:10px;text-align:left'>Producto</th>
                                    <th style='padding:10px;text-align:center'>Cantidad</th>
                                </tr>
                                <tr style='background:white'>
                                    <td style='padding:10px;border:1px solid #e2e8f0'>{$product['name']}</td>
                                    <td style='padding:10px;border:1px solid #e2e8f0;text-align:center'>{$qty}</td>
                                </tr>
                            </table>
                            <p style='color:#64748B;font-size:13px'>
                                Este pedido fue generado automáticamente por el sistema The Bridge de serElMejor.<br/>
                                Por favor confirme la recepción respondiendo a este email.
                            </p>
                        </div>
                    </div>
                ",
            ]],
        ]);

        $this->sendGrid($payload);
    }

    // ── Email to owner ────────────────────────────────────
    private function sendOwnerEmail(int $userId, array $product, int $newStock, array $supplier, int $orderId): void {
        $apiKey    = $_ENV['SENDGRID_KEY']  ?? '';
        $fromEmail = $_ENV['SENDGRID_FROM'] ?? '';
        if (!$apiKey || !$fromEmail) return;

        // Get owner email
        $stmt = $this->db->prepare("SELECT email, name FROM users WHERE id = :id");
        $stmt->execute([':id' => $userId]);
        $owner = $stmt->fetch();
        if (!$owner) return;

        $payload = json_encode([
            'personalizations' => [[
                'to'      => [['email' => $owner['email']]],
                'subject' => "⚠️ Stock bajo — Pedido automático creado | serElMejor",
            ]],
            'from'    => ['email' => $fromEmail, 'name' => 'serElMejor'],
            'content' => [[
                'type'  => 'text/html',
                'value' => "
                    <div style='font-family:sans-serif;max-width:600px;margin:0 auto'>
                        <div style='background:#F59E0B;padding:24px;border-radius:12px 12px 0 0'>
                            <h2 style='color:white;margin:0'>⚠️ Alerta de Stock Bajo</h2>
                            <p style='color:rgba(255,255,255,0.9);margin:8px 0 0'>The Bridge ha actuado automáticamente</p>
                        </div>
                        <div style='background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px'>
                            <p>Hola <strong>{$owner['name']}</strong>,</p>
                            <p>El sistema The Bridge ha detectado stock bajo y ha actuado automáticamente:</p>
                            <ul style='line-height:2'>
                                <li><strong>Producto:</strong> {$product['name']}</li>
                                <li><strong>Stock actual:</strong> {$newStock} unidades</li>
                                <li><strong>Stock mínimo:</strong> {$product['min_stock']} unidades</li>
                                <li><strong>Pedido creado:</strong> #{$orderId} a {$supplier['name']}</li>
                            </ul>
                            <p style='color:#64748B;font-size:13px;margin-top:16px'>
                                Puedes ver el estado del pedido en tu panel de serElMejor.
                            </p>
                        </div>
                    </div>
                ",
            ]],
        ]);

        $this->sendGrid($payload);
    }

    // ── SendGrid helper ───────────────────────────────────
    private function sendGrid(string $payload): void {
        $apiKey = $_ENV['SENDGRID_KEY'] ?? '';
        if (!$apiKey) return;

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

        if ($httpCode < 200 || $httpCode >= 300) {
            error_log('BridgeService SendGrid error ' . $httpCode . ': ' . $response);
        }
    }
}