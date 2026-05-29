<?php
// Path: backend/controllers/AdminController.php

require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class AdminController {

    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    // ── Check admin role ──────────────────────────────────
    private function requireAdmin(): array {
        $user = AuthMiddleware::authenticate();
        if ($user['role'] !== 'admin' && $user['role'] !== 'owner') {
            Response::json(['error' => 'Acceso denegado'], 403);
            exit();
        }
        return $user;
    }

    // GET /admin/stats
    public function getStats(): void {
        $this->requireAdmin();

        // Total businesses
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM businesses");
        $businesses = (int) $stmt->fetch()['count'];

        // Total users
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM users");
        $users = (int) $stmt->fetch()['count'];

        // Total leads
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM leads");
        $leads = (int) $stmt->fetch()['count'];

        // Won leads
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM leads WHERE status = 'won'");
        $wonLeads = (int) $stmt->fetch()['count'];

        // Total products
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM products");
        $products = (int) $stmt->fetch()['count'];

        // Total orders
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM purchase_orders");
        $orders = (int) $stmt->fetch()['count'];

        // Total suppliers
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM suppliers");
        $suppliers = (int) $stmt->fetch()['count'];

        // Low stock products
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM products WHERE current_stock <= min_stock");
        $lowStock = (int) $stmt->fetch()['count'];

        // Revenue estimate (won leads * avg close probability)
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM leads WHERE status = 'won'");
        $wonCount = (int) $stmt->fetch()['count'];

        // Subscriptions revenue
        $stmt = $this->db->query("SELECT COALESCE(SUM(price), 0) as total FROM subscriptions WHERE status = 'active'");
        $revenue = (float) $stmt->fetch()['total'];

        // Plans distribution
        $stmt = $this->db->query("
            SELECT subscription_plan, COUNT(*) as count
            FROM businesses
            GROUP BY subscription_plan
        ");
        $plans = $stmt->fetchAll();

        Response::json([
            'businesses' => $businesses,
            'users'      => $users,
            'leads'      => $leads,
            'won_leads'  => $wonLeads,
            'products'   => $products,
            'orders'     => $orders,
            'suppliers'  => $suppliers,
            'low_stock'  => $lowStock,
            'revenue'    => $revenue,
            'plans'      => $plans,
        ]);
    }

    // GET /admin/businesses
    public function getBusinesses(): void {
        $this->requireAdmin();

        $stmt = $this->db->query("
            SELECT
                b.*,
                COUNT(DISTINCT u.id)  as user_count,
                COUNT(DISTINCT l.id)  as lead_count,
                COUNT(DISTINCT p.id)  as product_count,
                s.plan                as subscription_plan,
                s.price               as subscription_price,
                s.status              as subscription_status
            FROM businesses b
            LEFT JOIN users              u ON u.business_id = b.id
            LEFT JOIN leads              l ON l.business_id = b.id
            LEFT JOIN products           p ON p.business_id = b.id
            LEFT JOIN subscriptions      s ON s.business_id = b.id
            GROUP BY b.id, s.plan, s.price, s.status
            ORDER BY b.created_at DESC
        ");

        Response::json($stmt->fetchAll());
    }

    // GET /admin/businesses/:id
    public function getBusiness(int $id): void {
        $this->requireAdmin();

        $stmt = $this->db->prepare("
            SELECT b.*,
                   s.plan, s.price, s.status as sub_status
            FROM businesses b
            LEFT JOIN subscriptions s ON s.business_id = b.id
            WHERE b.id = :id
        ");
        $stmt->execute([':id' => $id]);
        $business = $stmt->fetch();

        if (!$business) {
            Response::json(['error' => 'Negocio no encontrado'], 404);
            return;
        }

        // Get users
        $stmt = $this->db->prepare("SELECT id, name, email, role, created_at FROM users WHERE business_id = :id");
        $stmt->execute([':id' => $id]);
        $business['users'] = $stmt->fetchAll();

        Response::json($business);
    }

    // GET /admin/users
    public function getUsers(): void {
        $this->requireAdmin();

        $stmt = $this->db->query("
            SELECT u.*, b.name as business_name
            FROM users u
            LEFT JOIN businesses b ON b.id = u.business_id
            ORDER BY u.created_at DESC
        ");

        Response::json($stmt->fetchAll());
    }

    // DELETE /admin/businesses/:id
    public function deleteBusiness(int $id): void {
        $this->requireAdmin();

        $stmt = $this->db->prepare("DELETE FROM businesses WHERE id = :id RETURNING id");
        $stmt->execute([':id' => $id]);

        if (!$stmt->fetch()) {
            Response::json(['error' => 'Negocio no encontrado'], 404);
            return;
        }

        Response::json(['success' => true, 'message' => 'Negocio eliminado']);
    }
}
