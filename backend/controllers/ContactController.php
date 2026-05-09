<?php
// Path: backend/controllers/ContactController.php

class ContactController {

    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    // POST /api/contact
    public function store(array $body): void {

        // ── Validate ──────────────────────────────────────────
        $name    = trim($body['name']    ?? '');
        $email   = trim($body['email']   ?? '');
        $company = trim($body['company'] ?? '');
        $message = trim($body['message'] ?? '');

        if (!$name || strlen($name) < 2) {
            Response::json(['error' => 'Nombre inválido'], 422);
            return;
        }
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(['error' => 'Email inválido'], 422);
            return;
        }
        if (!$message || strlen($message) < 20) {
            Response::json(['error' => 'Mensaje demasiado corto'], 422);
            return;
        }

        // ── Save to DB ────────────────────────────────────────
        try {
            $stmt = $this->db->prepare("
                INSERT INTO contact_messages (name, email, company, message, created_at)
                VALUES (:name, :email, :company, :message, NOW())
            ");
            $stmt->execute([
                ':name'    => $name,
                ':email'   => $email,
                ':company' => $company,
                ':message' => $message,
            ]);
        } catch (PDOException $e) {
            error_log('ContactController DB error: ' . $e->getMessage());
            Response::json(['error' => 'Error guardando el mensaje'], 500);
            return;
        }

        // ── Send email via SendGrid ───────────────────────────
        $emailSent = $this->sendEmail($name, $email, $company, $message);

        Response::json([
            'success' => true,
            'message' => 'Mensaje recibido. Te responderemos en menos de 24h.',
            'email_sent' => $emailSent,
        ], 201);
    }

    // ── Private: SendGrid email ───────────────────────────────
    private function sendEmail(
        string $name,
        string $email,
        string $company,
        string $message
    ): bool {

        $apiKey  = $_ENV['SENDGRID_KEY']  ?? '';
        $toEmail = $_ENV['SENDGRID_FROM'] ?? '';

        if (!$apiKey || !$toEmail) {
            error_log('SendGrid not configured — skipping email');
            return false;
        }

        $companyLine = $company ? "<p><strong>Empresa:</strong> {$company}</p>" : '';

        $payload = json_encode([
            'personalizations' => [[
                'to'      => [['email' => $toEmail]],
                'subject' => "Nuevo mensaje de contacto — {$name}",
            ]],
            'from'    => ['email' => $toEmail, 'name' => 'serElMejor'],
            'reply_to'=> ['email' => $email, 'name' => $name],
            'content' => [[
                'type'  => 'text/html',
                'value' => "
                    <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto;'>
                        <div style='background: #2563EB; padding: 24px; border-radius: 12px 12px 0 0;'>
                            <h2 style='color: white; margin: 0;'>Nuevo mensaje de contacto</h2>
                        </div>
                        <div style='background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;'>
                            <p><strong>Nombre:</strong> {$name}</p>
                            <p><strong>Email:</strong> <a href='mailto:{$email}'>{$email}</a></p>
                            {$companyLine}
                            <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;'>
                            <p><strong>Mensaje:</strong></p>
                            <p style='background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap;'>{$message}</p>
                            <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;'>
                            <p style='color: #64748B; font-size: 13px;'>
                                Recibido desde el formulario de contacto de serElMejor
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

        if ($httpCode >= 200 && $httpCode < 300) {
            return true;
        }

        error_log('SendGrid error ' . $httpCode . ': ' . $response);
        return false;
    }
}