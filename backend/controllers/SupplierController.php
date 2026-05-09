<?php
// Path: backend/controllers/SupplierController.php

require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class SupplierController {

    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    // GET /suppliers
    public function getAll(): void {
        $user = AuthMiddleware::authenticate();
        $stmt = $this->db->prepare("
            SELECT s.*,
                   COUNT(po.id) as total_orders
            FROM suppliers s
            LEFT JOIN purchase_orders po ON po.supplier_id = s.id
            WHERE s.business_id = :business_id
            GROUP BY s.id
            ORDER BY s.created_at DESC
        ");
        $stmt->execute([':business_id' => $user['business_id']]);
        Response::json($stmt->fetchAll());
    }

    // GET /suppliers/:id
    public function getOne(int $id): void {
        $user = AuthMiddleware::authenticate();
        $stmt = $this->db->prepare("
            SELECT * FROM suppliers
            WHERE id = :id AND business_id = :business_id
        ");
        $stmt->execute([':id' => $id, ':business_id' => $user['business_id']]);
        $supplier = $stmt->fetch();
        if (!$supplier) {
            Response::json(['error' => 'Proveedor no encontrado'], 404);
            return;
        }
        Response::json($supplier);
    }

    // POST /suppliers
    public function create(array $body): void {
        $user = AuthMiddleware::authenticate();

        $name        = trim($body['name']         ?? '');
        $email       = trim($body['email']        ?? '');
        $contactName = trim($body['contact_name'] ?? '');
        $phone       = trim($body['phone']        ?? '');

        if (!$name) {
            Response::json(['error' => 'El nombre es obligatorio'], 422);
            return;
        }
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(['error' => 'Email inválido'], 422);
            return;
        }

        $stmt = $this->db->prepare("
            INSERT INTO suppliers (business_id, name, email, contact_name, phone)
            VALUES (:business_id, :name, :email, :contact_name, :phone)
            RETURNING *
        ");
        $stmt->execute([
            ':business_id'  => $user['business_id'],
            ':name'         => $name,
            ':email'        => $email,
            ':contact_name' => $contactName,
            ':phone'        => $phone,
        ]);
        Response::json($stmt->fetch(), 201);
    }

    // PUT /suppliers/:id
    public function update(int $id, array $body): void {
        $user = AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("SELECT id FROM suppliers WHERE id = :id AND business_id = :business_id");
        $stmt->execute([':id' => $id, ':business_id' => $user['business_id']]);
        if (!$stmt->fetch()) {
            Response::json(['error' => 'Proveedor no encontrado'], 404);
            return;
        }

        $name        = trim($body['name']         ?? '');
        $email       = trim($body['email']        ?? '');
        $contactName = trim($body['contact_name'] ?? '');
        $phone       = trim($body['phone']        ?? '');

        if (!$name) {
            Response::json(['error' => 'El nombre es obligatorio'], 422);
            return;
        }
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(['error' => 'Email inválido'], 422);
            return;
        }

        $stmt = $this->db->prepare("
            UPDATE suppliers
            SET name = :name, email = :email,
                contact_name = :contact_name, phone = :phone
            WHERE id = :id AND business_id = :business_id
            RETURNING *
        ");
        $stmt->execute([
            ':name'         => $name,
            ':email'        => $email,
            ':contact_name' => $contactName,
            ':phone'        => $phone,
            ':id'           => $id,
            ':business_id'  => $user['business_id'],
        ]);
        Response::json($stmt->fetch());
    }

    // DELETE /suppliers/:id
    public function delete(int $id): void {
        $user = AuthMiddleware::authenticate();
        $stmt = $this->db->prepare("
            DELETE FROM suppliers
            WHERE id = :id AND business_id = :business_id
            RETURNING id
        ");
        $stmt->execute([':id' => $id, ':business_id' => $user['business_id']]);
        if (!$stmt->fetch()) {
            Response::json(['error' => 'Proveedor no encontrado'], 404);
            return;
        }
        Response::json(['success' => true, 'message' => 'Proveedor eliminado']);
    }

    // GET /suppliers/:id/orders
    public function getOrders(int $id): void {
        $user = AuthMiddleware::authenticate();

        // Verify ownership
        $stmt = $this->db->prepare("SELECT id FROM suppliers WHERE id = :id AND business_id = :business_id");
        $stmt->execute([':id' => $id, ':business_id' => $user['business_id']]);
        if (!$stmt->fetch()) {
            Response::json(['error' => 'Proveedor no encontrado'], 404);
            return;
        }

        $stmt = $this->db->prepare("
            SELECT po.*,
                   p.name  as product_name,
                   p.current_stock,
                   p.min_stock
            FROM purchase_orders po
            JOIN products p ON p.id = po.product_id
            WHERE po.supplier_id = :supplier_id
            ORDER BY po.created_at DESC
        ");
        $stmt->execute([':supplier_id' => $id]);
        Response::json($stmt->fetchAll());
    }
}