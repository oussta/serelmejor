<?php
// Path: backend/controllers/ProductController.php

require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class ProductController {

    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    // GET /products
    public function getAll(): void {
        $user = AuthMiddleware::authenticate();
        $stmt = $this->db->prepare("
            SELECT p.*,
                   CASE WHEN p.current_stock <= p.min_stock THEN true ELSE false END as low_stock
            FROM products p
            WHERE p.business_id = :business_id
            ORDER BY p.created_at DESC
        ");
        $stmt->execute([':business_id' => $user['business_id']]);
        Response::json($stmt->fetchAll());
    }

    // GET /products/low-stock
    public function getLowStock(): void {
        $user = AuthMiddleware::authenticate();
        $stmt = $this->db->prepare("
            SELECT * FROM products
            WHERE business_id = :business_id
            AND current_stock <= min_stock
            ORDER BY current_stock ASC
        ");
        $stmt->execute([':business_id' => $user['business_id']]);
        Response::json($stmt->fetchAll());
    }

    // GET /products/:id
    public function getOne(int $id): void {
        $user = AuthMiddleware::authenticate();
        $stmt = $this->db->prepare("
            SELECT p.*,
                   CASE WHEN p.current_stock <= p.min_stock THEN true ELSE false END as low_stock
            FROM products p
            WHERE p.id = :id AND p.business_id = :business_id
        ");
        $stmt->execute([':id' => $id, ':business_id' => $user['business_id']]);
        $product = $stmt->fetch();
        if (!$product) {
            Response::json(['error' => 'Producto no encontrado'], 404);
            return;
        }
        Response::json($product);
    }

    // POST /products
    public function create(array $body): void {
        $user = AuthMiddleware::authenticate();

        $name     = trim($body['name']     ?? '');
        $category = trim($body['category'] ?? '');
        $stock    = (int)($body['current_stock'] ?? 0);
        $minStock = (int)($body['min_stock']     ?? 5);
        $price    = (float)($body['price']       ?? 0);

        if (!$name) {
            Response::json(['error' => 'El nombre es obligatorio'], 422);
            return;
        }

        $stmt = $this->db->prepare("
            INSERT INTO products (business_id, name, category, current_stock, min_stock, price)
            VALUES (:business_id, :name, :category, :stock, :min_stock, :price)
            RETURNING *
        ");
        $stmt->execute([
            ':business_id' => $user['business_id'],
            ':name'        => $name,
            ':category'    => $category,
            ':stock'       => $stock,
            ':min_stock'   => $minStock,
            ':price'       => $price,
        ]);
        Response::json($stmt->fetch(), 201);
    }

    // PUT /products/:id
    public function update(int $id, array $body): void {
        $user = AuthMiddleware::authenticate();

        // Check ownership
        $stmt = $this->db->prepare("SELECT id FROM products WHERE id = :id AND business_id = :business_id");
        $stmt->execute([':id' => $id, ':business_id' => $user['business_id']]);
        if (!$stmt->fetch()) {
            Response::json(['error' => 'Producto no encontrado'], 404);
            return;
        }

        $name     = trim($body['name']          ?? '');
        $category = trim($body['category']      ?? '');
        $minStock = (int)($body['min_stock']    ?? 5);
        $price    = (float)($body['price']      ?? 0);

        if (!$name) {
            Response::json(['error' => 'El nombre es obligatorio'], 422);
            return;
        }

        $stmt = $this->db->prepare("
            UPDATE products
            SET name = :name, category = :category, min_stock = :min_stock, price = :price
            WHERE id = :id AND business_id = :business_id
            RETURNING *
        ");
        $stmt->execute([
            ':name'        => $name,
            ':category'    => $category,
            ':min_stock'   => $minStock,
            ':price'       => $price,
            ':id'          => $id,
            ':business_id' => $user['business_id'],
        ]);
        Response::json($stmt->fetch());
    }

    // DELETE /products/:id
    public function delete(int $id): void {
        $user = AuthMiddleware::authenticate();
        $stmt = $this->db->prepare("
            DELETE FROM products
            WHERE id = :id AND business_id = :business_id
            RETURNING id
        ");
        $stmt->execute([':id' => $id, ':business_id' => $user['business_id']]);
        if (!$stmt->fetch()) {
            Response::json(['error' => 'Producto no encontrado'], 404);
            return;
        }
        Response::json(['success' => true, 'message' => 'Producto eliminado']);
    }

    // POST /products/:id/sale
    public function sale(int $id, array $body): void {
        $user     = AuthMiddleware::authenticate();
        $quantity = (int)($body['quantity'] ?? 1);
        $note     = trim($body['note']      ?? '');

        if ($quantity <= 0) {
            Response::json(['error' => 'La cantidad debe ser mayor que 0'], 422);
            return;
        }

        // Check product exists and has enough stock
        $stmt = $this->db->prepare("
            SELECT * FROM products
            WHERE id = :id AND business_id = :business_id
        ");
        $stmt->execute([':id' => $id, ':business_id' => $user['business_id']]);
        $product = $stmt->fetch();

        if (!$product) {
            Response::json(['error' => 'Producto no encontrado'], 404);
            return;
        }
        if ($product['current_stock'] < $quantity) {
            Response::json(['error' => 'Stock insuficiente'], 422);
            return;
        }

        // Deduct stock
        $stmt = $this->db->prepare("
            UPDATE products
            SET current_stock = current_stock - :quantity
            WHERE id = :id
            RETURNING *
        ");
        $stmt->execute([':quantity' => $quantity, ':id' => $id]);
        $updated = $stmt->fetch();

        // Record movement
        $stmt = $this->db->prepare("
            INSERT INTO stock_movements (product_id, type, quantity, note)
            VALUES (:product_id, 'sale', :quantity, :note)
        ");
        $stmt->execute([':product_id' => $id, ':quantity' => $quantity, ':note' => $note]);

        Response::json([
            'success' => true,
            'product' => $updated,
            'low_stock' => $updated['current_stock'] <= $updated['min_stock'],
        ]);
    }

    // POST /products/:id/restock
    public function restock(int $id, array $body): void {
        $user     = AuthMiddleware::authenticate();
        $quantity = (int)($body['quantity'] ?? 1);
        $note     = trim($body['note']      ?? '');

        if ($quantity <= 0) {
            Response::json(['error' => 'La cantidad debe ser mayor que 0'], 422);
            return;
        }

        $stmt = $this->db->prepare("SELECT id FROM products WHERE id = :id AND business_id = :business_id");
        $stmt->execute([':id' => $id, ':business_id' => $user['business_id']]);
        if (!$stmt->fetch()) {
            Response::json(['error' => 'Producto no encontrado'], 404);
            return;
        }

        // Add stock
        $stmt = $this->db->prepare("
            UPDATE products
            SET current_stock = current_stock + :quantity
            WHERE id = :id
            RETURNING *
        ");
        $stmt->execute([':quantity' => $quantity, ':id' => $id]);
        $updated = $stmt->fetch();

        // Record movement
        $stmt = $this->db->prepare("
            INSERT INTO stock_movements (product_id, type, quantity, note)
            VALUES (:product_id, 'restock', :quantity, :note)
        ");
        $stmt->execute([':product_id' => $id, ':quantity' => $quantity, ':note' => $note]);

        Response::json(['success' => true, 'product' => $updated]);
    }

    // GET /products/:id/movements
    public function getMovements(int $id): void {
        $user = AuthMiddleware::authenticate();

        // Verify ownership
        $stmt = $this->db->prepare("SELECT id FROM products WHERE id = :id AND business_id = :business_id");
        $stmt->execute([':id' => $id, ':business_id' => $user['business_id']]);
        if (!$stmt->fetch()) {
            Response::json(['error' => 'Producto no encontrado'], 404);
            return;
        }

        $stmt = $this->db->prepare("
            SELECT * FROM stock_movements
            WHERE product_id = :product_id
            ORDER BY created_at DESC
            LIMIT 50
        ");
        $stmt->execute([':product_id' => $id]);
        Response::json($stmt->fetchAll());
    }
}
