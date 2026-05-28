<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/JWT.php';
require_once __DIR__ . '/../utils/Validator.php';

class AuthController {

    // ── Private: Send email via SendGrid ─────────────────
    private static function sendEmail(string $to, string $subject, string $html): bool {
        $apiKey  = $_ENV['SENDGRID_KEY']  ?? getenv('SENDGRID_KEY')  ?? '';
        $fromEmail = $_ENV['SENDGRID_FROM'] ?? getenv('SENDGRID_FROM') ?? '';

        if (!$apiKey || !$fromEmail) {
            error_log('SendGrid not configured');
            return false;
        }

        $payload = json_encode([
            'personalizations' => [[
                'to'      => [['email' => $to]],
                'subject' => $subject,
            ]],
            'from'    => ['email' => $fromEmail, 'name' => 'Salesek'],
            'content' => [['type' => 'text/html', 'value' => $html]],
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
        error_log('SendGrid error ' . $httpCode . ': ' . $response);
        return false;
    }

    // ── Email templates ───────────────────────────────────
    private static function emailWrapper(string $title, string $content): string {
        return "
        <div style='font-family: Plus Jakarta Sans, sans-serif; max-width: 600px; margin: 0 auto; background: #F8FAFC;'>
            <div style='background: linear-gradient(135deg, #2563EB, #0EA5E9); padding: 32px 40px; border-radius: 16px 16px 0 0;'>
                <h1 style='color: white; margin: 0; font-size: 24px; font-weight: 800;'>Salesek</h1>
                <p style='color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;'>La plataforma todo-en-uno para pymes</p>
            </div>
            <div style='background: white; padding: 40px; border-radius: 0 0 16px 16px; border: 1px solid #E2E8F0; border-top: none;'>
                <h2 style='color: #0F172A; font-size: 20px; font-weight: 700; margin-bottom: 16px;'>{$title}</h2>
                {$content}
                <hr style='border: none; border-top: 1px solid #E2E8F0; margin: 32px 0 24px;'>
                <p style='color: #94A3B8; font-size: 12px; margin: 0;'>
                    © 2026 Salesek · <a href='https://serelmejor.vercel.app' style='color: #2563EB;'>serelmejor.vercel.app</a>
                </p>
            </div>
        </div>";
    }

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
            'salesflow' => 29.00,
            'stockflow' => 29.00,
            'full'      => 49.00,
            default     => 49.00
        };

        $planName = match($plan) {
            'salesflow' => 'SalesFlow',
            'stockflow' => 'StockFlow',
            'full'      => 'Suite Completa',
            'free'      => '14 días gratis',
            default     => 'Suite Completa'
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

        // ── Send welcome email ────────────────────────────
        $content = "
            <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
                Hola <strong style='color: #0F172A;'>{$name}</strong>, bienvenido/a a Salesek 🎉
            </p>
            <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
                Tu cuenta ha sido creada correctamente. Aquí tienes un resumen:
            </p>
            <div style='background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 20px 0;'>
                <div style='display: flex; justify-content: space-between; margin-bottom: 10px;'>
                    <span style='color: #64748B; font-size: 14px;'>Empresa</span>
                    <strong style='color: #0F172A; font-size: 14px;'>{$business_name}</strong>
                </div>
                <div style='display: flex; justify-content: space-between; margin-bottom: 10px;'>
                    <span style='color: #64748B; font-size: 14px;'>Email</span>
                    <strong style='color: #0F172A; font-size: 14px;'>{$email}</strong>
                </div>
                <div style='display: flex; justify-content: space-between;'>
                    <span style='color: #64748B; font-size: 14px;'>Plan</span>
                    <strong style='color: #2563EB; font-size: 14px;'>{$planName}</strong>
                </div>
            </div>
            <a href='https://serelmejor.vercel.app/login' style='display: inline-block; background: linear-gradient(135deg, #2563EB, #0EA5E9); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; margin-top: 8px;'>
                Acceder a Salesek →
            </a>
            <p style='color: #94A3B8; font-size: 13px; margin-top: 20px;'>
                Si no has creado esta cuenta, ignora este email.
            </p>";

        self::sendEmail(
            $email,
            '¡Bienvenido/a a Salesek! Tu cuenta está lista',
            self::emailWrapper('¡Cuenta creada con éxito! 🚀', $content)
        );

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
        $stmt = $pdo->prepare("SELECT u.*, s.plan FROM users u LEFT JOIN subscriptions s ON s.business_id = u.business_id ORDER BY s.id DESC LIMIT 1");
        $stmt->execute();

        $stmt = $pdo->prepare("SELECT u.*, COALESCE(s.plan, 'pending') as plan FROM users u LEFT JOIN subscriptions s ON s.business_id = u.business_id AND s.id = (SELECT MAX(id) FROM subscriptions WHERE business_id = u.business_id) WHERE u.email = ?");
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
                "business_id" => $user['business_id'],
                "plan"        => $user['plan'] ?? 'pending',
            ]
        ]);
    }

    // GET /me
    public static function me() {
        require_once __DIR__ . '/../middleware/AuthMiddleware.php';
        $current = AuthMiddleware::authenticate();

        $pdo  = getDB();
        $stmt = $pdo->prepare("SELECT u.*, COALESCE(s.plan, 'pending') as plan FROM users u LEFT JOIN subscriptions s ON s.business_id = u.business_id AND s.id = (SELECT MAX(id) FROM subscriptions WHERE business_id = u.business_id) WHERE u.id = ?");
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

        $stmt = $pdo->prepare("SELECT id, name FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        // Always return success to prevent email enumeration
        if (!$user) {
            Response::json(["message" => "If this email exists you will receive a reset link"]);
            return;
        }

        $token  = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', time() + 3600);

        $stmt = $pdo->prepare("UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?");
        $stmt->execute([$token, $expiry, $user['id']]);

        $resetUrl = "https://serelmejor.vercel.app/reset-password?token={$token}";

        $content = "
            <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
                Hola <strong style='color: #0F172A;'>{$user['name']}</strong>,
            </p>
            <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta Salesek.
            </p>
            <a href='{$resetUrl}' style='display: inline-block; background: linear-gradient(135deg, #2563EB, #0EA5E9); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; margin: 20px 0;'>
                Restablecer contraseña →
            </a>
            <p style='color: #64748B; font-size: 14px; line-height: 1.7;'>
                O copia este enlace en tu navegador:<br>
                <span style='color: #2563EB; word-break: break-all;'>{$resetUrl}</span>
            </p>
            <div style='background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 10px; padding: 14px; margin-top: 20px;'>
                <p style='color: #92400E; font-size: 13px; margin: 0;'>
                    ⏱️ Este enlace expira en <strong>1 hora</strong>.
                    Si no solicitaste este cambio, ignora este email.
                </p>
            </div>";

        self::sendEmail(
            $email,
            'Restablece tu contraseña de Salesek',
            self::emailWrapper('Solicitud de restablecimiento de contraseña', $content)
        );

        Response::json(["message" => "If this email exists you will receive a reset link"]);
    }

    // POST /reset-password
    public static function resetPassword() {
        $data  = json_decode(file_get_contents("php://input"), true);
        $error = Validator::required($data, ['token', 'password']);
        if ($error) Response::error($error, 400);

        $error = Validator::password($data['password']);
        if ($error) Response::error($error, 400);

        $pdo  = getDB();
        $stmt = $pdo->prepare("SELECT id, email, name FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()");
        $stmt->execute([$data['token']]);
        $user = $stmt->fetch();

        if (!$user) Response::error("Invalid or expired reset token", 400);

        $hash = password_hash($data['password'], PASSWORD_BCRYPT);

        $stmt = $pdo->prepare("UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?");
        $stmt->execute([$hash, $user['id']]);

        // ── Send password changed confirmation ────────────
        $content = "
            <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
                Hola <strong style='color: #0F172A;'>{$user['name']}</strong>,
            </p>
            <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
                Tu contraseña ha sido restablecida correctamente.
            </p>
            <a href='https://serelmejor.vercel.app/login' style='display: inline-block; background: linear-gradient(135deg, #2563EB, #0EA5E9); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; margin: 20px 0;'>
                Iniciar sesión →
            </a>
            <div style='background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 10px; padding: 14px; margin-top: 8px;'>
                <p style='color: #9F1239; font-size: 13px; margin: 0;'>
                    🔒 Si no realizaste este cambio, contacta con nosotros inmediatamente.
                </p>
            </div>";

        self::sendEmail(
            $user['email'],
            'Tu contraseña de Salesek ha sido cambiada',
            self::emailWrapper('Contraseña actualizada correctamente ✓', $content)
        );

        Response::json(["message" => "Password reset successfully"]);
    }

    // POST /cancel-subscription
    public static function cancelSubscription() {
        require_once __DIR__ . '/../middleware/AuthMiddleware.php';
        $current = AuthMiddleware::authenticate();

        $pdo  = getDB();
        $stmt = $pdo->prepare("SELECT u.name, u.email, s.plan FROM users u JOIN subscriptions s ON s.business_id = u.business_id WHERE u.id = ? ORDER BY s.id DESC LIMIT 1");
        $stmt->execute([$current['user_id']]);
        $data = $stmt->fetch();

        if (!$data) Response::error("User not found", 404);

        // Update subscription status
        $stmt = $pdo->prepare("UPDATE subscriptions SET status = 'cancelled' WHERE business_id = ? AND status = 'active'");
        $stmt->execute([$current['business_id']]);

        $planName = match($data['plan']) {
            'salesflow' => 'SalesFlow',
            'stockflow' => 'StockFlow',
            'full'      => 'Suite Completa',
            default     => $data['plan']
        };

        // ── Send cancellation email ───────────────────────
        $content = "
            <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
                Hola <strong style='color: #0F172A;'>{$data['name']}</strong>,
            </p>
            <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
                Hemos procesado la cancelación de tu suscripción <strong>{$planName}</strong>.
                Seguirás teniendo acceso hasta el final del período facturado.
            </p>
            <div style='background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 20px 0;'>
                <p style='color: #64748B; font-size: 14px; margin: 0 0 8px;'>Plan cancelado: <strong style='color: #0F172A;'>{$planName}</strong></p>
                <p style='color: #64748B; font-size: 14px; margin: 0;'>Estado: <strong style='color: #F43F5E;'>Cancelado</strong></p>
            </div>
            <p style='color: #64748B; font-size: 14px; line-height: 1.7;'>
                ¿Has cancelado por error o quieres volver? Puedes reactivar tu plan en cualquier momento.
            </p>
            <a href='https://serelmejor.vercel.app/pricing' style='display: inline-block; background: linear-gradient(135deg, #2563EB, #0EA5E9); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; margin-top: 8px;'>
                Reactivar suscripción →
            </a>";

        self::sendEmail(
            $data['email'],
            'Tu suscripción de Salesek ha sido cancelada',
            self::emailWrapper('Suscripción cancelada', $content)
        );

        Response::json(["message" => "Subscription cancelled successfully"]);
    }
}