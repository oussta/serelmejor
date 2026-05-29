<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/JWT.php';
require_once __DIR__ . '/../utils/Validator.php';

class AuthController {

    // ── Private: Send email via SendGrid ─────────────────
    private static function sendEmail(string $to, string $subject, string $html): bool {
        $apiKey    = $_ENV['SENDGRID_KEY']  ?? getenv('SENDGRID_KEY')  ?? '';
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

    // ── Email wrapper template ────────────────────────────
    private static function emailWrapper(string $title, string $content): string {
        return "
        <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #F8FAFC;'>
            <div style='background: linear-gradient(135deg, #2563EB, #0EA5E9); padding: 32px 40px; border-radius: 16px 16px 0 0;'>
                <h1 style='color: white; margin: 0; font-size: 24px; font-weight: 800;'>Salesek</h1>
                <p style='color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;'>La plataforma todo-en-uno para pymes</p>
            </div>
            <div style='background: white; padding: 40px; border-radius: 0 0 16px 16px; border: 1px solid #E2E8F0; border-top: none;'>
                <h2 style='color: #0F172A; font-size: 20px; font-weight: 700; margin-bottom: 16px;'>{$title}</h2>
                {$content}
                <hr style='border: none; border-top: 1px solid #E2E8F0; margin: 32px 0 24px;'>
                <p style='color: #94A3B8; font-size: 12px; margin: 0;'>
                    © 2026 Salesek · <a href='https://salsek.com' style='color: #2563EB;'>salsek.com</a>
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
            default     => 0.00
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

        $hash   = password_hash($data['password'], PASSWORD_BCRYPT);
        $code   = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiry = date('Y-m-d H:i:s', time() + 3600);

        $stmt = $pdo->prepare("INSERT INTO businesses (name, subscription_plan) VALUES (?, ?) RETURNING id");
        $stmt->execute([$business_name, $plan]);
        $business_id = $stmt->fetch()['id'];

        $stmt = $pdo->prepare("
            INSERT INTO users (name, email, password_hash, role, business_id, email_verified, verification_code, verification_code_expiry)
            VALUES (?, ?, ?, 'owner', ?, FALSE, ?, ?) RETURNING id
        ");
        $stmt->execute([$name, $email, $hash, $business_id, $code, $expiry]);
        $user_id = $stmt->fetch()['id'];

        $stmt = $pdo->prepare("INSERT INTO subscriptions (business_id, plan, price) VALUES (?, ?, ?)");
        $stmt->execute([$business_id, $plan, $price]);

        // Send verification code email
        $content = "
            <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
                Hola <strong style='color: #0F172A;'>{$name}</strong>, gracias por registrarte en Salesek.
            </p>
            <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
                Usa este código para verificar tu email:
            </p>
            <div style='text-align: center; margin: 32px 0;'>
                <div style='display: inline-block; background: linear-gradient(135deg, #2563EB, #0EA5E9); color: white; font-size: 40px; font-weight: 800; letter-spacing: 12px; padding: 20px 32px; border-radius: 16px; font-family: monospace;'>
                    {$code}
                </div>
            </div>
            <div style='background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 10px; padding: 14px;'>
                <p style='color: #92400E; font-size: 13px; margin: 0;'>
                    ⏱️ Este código expira en <strong>1 hora</strong>.
                    Si no creaste esta cuenta, ignora este email.
                </p>
            </div>";

        self::sendEmail(
            $email,
            'Tu código de verificación Salesek: ' . $code,
            self::emailWrapper('Verifica tu email 📧', $content)
        );

        $token = JWTHelper::generate([
            'user_id'        => $user_id,
            'role'           => 'owner',
            'business_id'    => $business_id,
            'email_verified' => false,
        ]);

        Response::json([
            "token"          => $token,
            "email_verified" => false,
            "user"           => [
                "id"             => $user_id,
                "name"           => $name,
                "email"          => $email,
                "role"           => "owner",
                "business_id"    => $business_id,
                "plan"           => $plan,
                "email_verified" => false,
            ]
        ], 201);
    }

    // POST /verify-email
    public static function verifyEmail() {
        $data  = json_decode(file_get_contents("php://input"), true);
        $error = Validator::required($data, ['email', 'code']);
        if ($error) Response::error($error, 400);

        $email = Validator::sanitize($data['email']);
        $code  = Validator::sanitize($data['code']);

        $pdo  = getDB();
        $stmt = $pdo->prepare("SELECT id, name, business_id, role, verification_code, verification_code_expiry FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) Response::error("Usuario no encontrado", 404);
        if ($user['verification_code'] !== $code) Response::error("Código incorrecto", 400);
        if (strtotime($user['verification_code_expiry']) < time()) {
            Response::error("El código ha expirado. Solicita uno nuevo.", 400);
        }

        $stmt = $pdo->prepare("UPDATE users SET email_verified = TRUE, verification_code = NULL, verification_code_expiry = NULL WHERE id = ?");
        $stmt->execute([$user['id']]);

        // Send welcome email
        $content = "
            <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
                Hola <strong style='color: #0F172A;'>{$user['name']}</strong>,
                tu email ha sido verificado correctamente. 🎉
            </p>
            <a href='https://salsek.com/login' style='display: inline-block; background: linear-gradient(135deg, #2563EB, #0EA5E9); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; margin-top: 8px;'>
                Acceder a Salesek →
            </a>";

        self::sendEmail(
            $email,
            '¡Email verificado! Bienvenido/a a Salesek',
            self::emailWrapper('¡Cuenta verificada! ✅', $content)
        );

        $token = JWTHelper::generate([
            'user_id'        => $user['id'],
            'role'           => $user['role'],
            'business_id'    => $user['business_id'],
            'email_verified' => true,
        ]);

        Response::json([
            "token"          => $token,
            "email_verified" => true,
            "user"           => [
                "id"             => $user['id'],
                "name"           => $user['name'],
                "email"          => $email,
                "role"           => $user['role'],
                "business_id"    => $user['business_id'],
                "email_verified" => true,
            ]
        ]);
    }

    // POST /resend-code
    public static function resendCode() {
        $data  = json_decode(file_get_contents("php://input"), true);
        $error = Validator::required($data, ['email']);
        if ($error) Response::error($error, 400);

        $email = Validator::sanitize($data['email']);
        $pdo   = getDB();

        $stmt = $pdo->prepare("SELECT id, name FROM users WHERE email = ? AND email_verified = FALSE");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) Response::error("Usuario no encontrado o ya verificado", 404);

        $code   = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiry = date('Y-m-d H:i:s', time() + 3600);

        $stmt = $pdo->prepare("UPDATE users SET verification_code = ?, verification_code_expiry = ? WHERE id = ?");
        $stmt->execute([$code, $expiry, $user['id']]);

        $content = "
            <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
                Hola <strong style='color: #0F172A;'>{$user['name']}</strong>,
                aquí tienes tu nuevo código:
            </p>
            <div style='text-align: center; margin: 32px 0;'>
                <div style='display: inline-block; background: linear-gradient(135deg, #2563EB, #0EA5E9); color: white; font-size: 40px; font-weight: 800; letter-spacing: 12px; padding: 20px 32px; border-radius: 16px; font-family: monospace;'>
                    {$code}
                </div>
            </div>
            <div style='background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 10px; padding: 14px;'>
                <p style='color: #92400E; font-size: 13px; margin: 0;'>
                    ⏱️ Este código expira en <strong>1 hora</strong>.
                </p>
            </div>";

        self::sendEmail(
            $email,
            'Tu nuevo código Salesek: ' . $code,
            self::emailWrapper('Nuevo código de verificación 🔄', $content)
        );

        Response::json(["message" => "Código reenviado correctamente"]);
    }

    // POST /login
    public static function login() {
        $data = json_decode(file_get_contents("php://input"), true);

        $error = Validator::required($data, ['email', 'password']);
        if ($error) Response::error($error, 400);

        $email = Validator::sanitize($data['email']);
        $pdo   = getDB();

        $stmt = $pdo->prepare("
            SELECT u.*, COALESCE(s.plan, 'pending') as sub_plan
            FROM users u
            LEFT JOIN subscriptions s ON s.business_id = u.business_id
            AND s.id = (SELECT MAX(id) FROM subscriptions WHERE business_id = u.business_id)
            WHERE u.email = ?
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($data['password'], $user['password_hash'])) {
            Response::error("Invalid email or password", 401);
        }

        $token = JWTHelper::generate([
            'user_id'        => $user['id'],
            'role'           => $user['role'],
            'business_id'    => $user['business_id'],
            'email_verified' => (bool)($user['email_verified'] ?? true),
        ]);

        Response::json([
            "token"          => $token,
            "email_verified" => (bool)($user['email_verified'] ?? true),
            "user"           => [
                "id"             => $user['id'],
                "name"           => $user['name'],
                "email"          => $user['email'],
                "role"           => $user['role'],
                "business_id"    => $user['business_id'],
                "plan"           => $user['sub_plan'] ?? 'pending',
                "email_verified" => (bool)($user['email_verified'] ?? true),
            ]
        ]);
    }

    // GET /me
    public static function me() {
        require_once __DIR__ . '/../middleware/AuthMiddleware.php';
        $current = AuthMiddleware::authenticate();

        $pdo  = getDB();
        $stmt = $pdo->prepare("
            SELECT u.*, COALESCE(s.plan, 'pending') as sub_plan
            FROM users u
            LEFT JOIN subscriptions s ON s.business_id = u.business_id
            AND s.id = (SELECT MAX(id) FROM subscriptions WHERE business_id = u.business_id)
            WHERE u.id = ?
        ");
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

    if (!$user) {
        Response::json(["message" => "If this email exists you will receive a reset code"]);
        return;
    }

    $code   = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $expiry = date('Y-m-d H:i:s', time() + 3600);

    $stmt = $pdo->prepare("UPDATE users SET reset_code = ?, reset_code_expiry = ? WHERE id = ?");
    $stmt->execute([$code, $expiry, $user['id']]);

    $content = "
        <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
            Hola <strong style='color: #0F172A;'>{$user['name']}</strong>,
        </p>
        <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
            Usa este código para restablecer tu contraseña:
        </p>
        <div style='text-align: center; margin: 32px 0;'>
            <div style='display: inline-block; background: linear-gradient(135deg, #2563EB, #0EA5E9); color: white; font-size: 40px; font-weight: 800; letter-spacing: 12px; padding: 20px 32px; border-radius: 16px; font-family: monospace;'>
                {$code}
            </div>
        </div>
        <div style='background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 10px; padding: 14px;'>
            <p style='color: #92400E; font-size: 13px; margin: 0;'>
                ⏱️ Este código expira en <strong>1 hora</strong>.
                Si no solicitaste este cambio, ignora este email.
            </p>
        </div>";

    self::sendEmail(
        $email,
        'Tu código para restablecer contraseña: ' . $code,
        self::emailWrapper('Restablece tu contraseña 🔑', $content)
    );

    Response::json(["message" => "If this email exists you will receive a reset code"]);
}
// POST /verify-reset-code
public static function verifyResetCode() {
    $data  = json_decode(file_get_contents("php://input"), true);
    $error = Validator::required($data, ['email', 'code']);
    if ($error) Response::error($error, 400);

    $email = Validator::sanitize($data['email']);
    $code  = Validator::sanitize($data['code']);
    $pdo   = getDB();

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND reset_code = ? AND reset_code_expiry > NOW()");
    $stmt->execute([$email, $code]);
    $user = $stmt->fetch();

    if (!$user) Response::error("Código incorrecto o expirado", 400);

    Response::json(["valid" => true, "message" => "Code verified"]);
}

    // POST /reset-password
    public static function resetPassword() {
    $data  = json_decode(file_get_contents("php://input"), true);
    $error = Validator::required($data, ['email', 'code', 'password']);
    if ($error) Response::error($error, 400);

    $error = Validator::password($data['password']);
    if ($error) Response::error($error, 400);

    $email = Validator::sanitize($data['email']);
    $code  = Validator::sanitize($data['code']);
    $pdo   = getDB();

    $stmt = $pdo->prepare("SELECT id, name FROM users WHERE email = ? AND reset_code = ? AND reset_code_expiry > NOW()");
    $stmt->execute([$email, $code]);
    $user = $stmt->fetch();

    if (!$user) Response::error("Código incorrecto o expirado", 400);

    $hash = password_hash($data['password'], PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ?, reset_code = NULL, reset_code_expiry = NULL WHERE id = ?");
    $stmt->execute([$hash, $user['id']]);

    $content = "
        <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
            Hola <strong style='color: #0F172A;'>{$user['name']}</strong>,
        </p>
        <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
            Tu contraseña ha sido restablecida correctamente.
        </p>
        <a href='https://salsek.com/login' style='display: inline-block; background: linear-gradient(135deg, #2563EB, #0EA5E9); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; margin: 20px 0;'>
            Iniciar sesión →
        </a>
        <div style='background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 10px; padding: 14px;'>
            <p style='color: #9F1239; font-size: 13px; margin: 0;'>
                🔒 Si no realizaste este cambio, contacta con nosotros inmediatamente.
            </p>
        </div>";

    self::sendEmail(
        $email,
        'Tu contraseña de Salesek ha sido cambiada',
        self::emailWrapper('Contraseña actualizada ✓', $content)
    );

    Response::json(["message" => "Password reset successfully"]);
}

    // POST /cancel-subscription
    public static function cancelSubscription() {
        require_once __DIR__ . '/../middleware/AuthMiddleware.php';
        $current = AuthMiddleware::authenticate();

        $pdo  = getDB();
        $stmt = $pdo->prepare("
            SELECT u.name, u.email, s.plan
            FROM users u
            JOIN subscriptions s ON s.business_id = u.business_id
            WHERE u.id = ?
            ORDER BY s.id DESC LIMIT 1
        ");
        $stmt->execute([$current['user_id']]);
        $data = $stmt->fetch();

        if (!$data) Response::error("User not found", 404);

        $stmt = $pdo->prepare("UPDATE subscriptions SET status = 'cancelled' WHERE business_id = ?");
        $stmt->execute([$current['business_id']]);

        $planName = match($data['plan']) {
            'salesflow' => 'SalesFlow',
            'stockflow' => 'StockFlow',
            'full'      => 'Suite Completa',
            default     => $data['plan']
        };

        $content = "
            <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
                Hola <strong style='color: #0F172A;'>{$data['name']}</strong>,
            </p>
            <p style='color: #64748B; font-size: 15px; line-height: 1.7;'>
                Tu suscripción <strong>{$planName}</strong> ha sido cancelada.
                Seguirás teniendo acceso hasta el final del período facturado.
            </p>
            <a href='https://salsek.com/pricing' style='display: inline-block; background: linear-gradient(135deg, #2563EB, #0EA5E9); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; margin-top: 8px;'>
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
