<?php
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AIController {

    // POST /ai/draft-response
    public static function draftResponse() {
        $user  = AuthMiddleware::authenticate();
        $data  = json_decode(file_get_contents("php://input"), true);
        $error = Validator::required($data, ['inquiry_text']);
        if ($error) Response::error($error, 400);

        $inquiry      = Validator::sanitize($data['inquiry_text']);
        $lead_name    = isset($data['lead_name'])    ? Validator::sanitize($data['lead_name'])    : 'el cliente';
        $lead_inquiry = isset($data['lead_inquiry']) ? Validator::sanitize($data['lead_inquiry']) : '';
        $apiKey       = $_ENV['GROQ_KEY'] ?? getenv('GROQ_KEY') ?? '';

        if (!$apiKey) Response::error("AI not configured", 503);

        $context = $lead_inquiry
            ? "El cliente ({$lead_name}) tiene esta consulta original: \"{$lead_inquiry}\"\n\n"
            : '';

        $prompt = "Eres un asistente profesional de ventas para pequeñas empresas.\n\n{$context}El usuario del CRM pregunta: \"{$inquiry}\"\n\nResponde de forma profesional, concisa y útil en español. Máximo 150 palabras.";

        $payload = json_encode([
            "model"      => "llama-3.3-70b-versatile",
            "max_tokens" => 300,
            "messages"   => [
                ["role" => "user", "content" => $prompt]
            ]
        ]);

        $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apiKey,
            ],
        ]);

        $response  = curl_exec($ch);
        $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) Response::error("Curl error: " . $curlError, 503);
        if ($httpCode !== 200) Response::error("AI error: " . $response, 503);

        $result = json_decode($response, true);
        $draft  = $result['choices'][0]['message']['content'] ?? '';

        Response::json(["draft" => $draft]);
    }

    // POST /ai/suggest-order
    public static function suggestOrder() {
        $user  = AuthMiddleware::authenticate();
        $data  = json_decode(file_get_contents("php://input"), true);
        $error = Validator::required($data, ['product_name', 'current_stock', 'min_stock']);
        if ($error) Response::error($error, 400);

        $apiKey = $_ENV['GROQ_KEY'] ?? getenv('GROQ_KEY') ?? '';
        if (!$apiKey) Response::error("AI not configured", 503);

        $product      = Validator::sanitize($data['product_name']);
        $currentStock = (int)$data['current_stock'];
        $minStock     = (int)$data['min_stock'];
        $salesHistory = isset($data['sales_history']) ? (int)$data['sales_history'] : 0;

        $prompt = "Eres un asistente de gestión de inventario para pequeñas empresas.\n\nProducto: {$product}\nStock actual: {$currentStock} unidades\nStock mínimo: {$minStock} unidades\nVentas últimos 30 días: {$salesHistory} unidades\n\nBasándote en estos datos, sugiere cuántas unidades pedir al proveedor y explica brevemente el razonamiento. Responde en español, máximo 100 palabras. Incluye el número exacto de unidades recomendadas al inicio.";

        $payload = json_encode([
            "model"      => "llama-3.3-70b-versatile",
            "max_tokens" => 200,
            "messages"   => [
                ["role" => "user", "content" => $prompt]
            ]
        ]);

        $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apiKey,
            ],
        ]);

        $response  = curl_exec($ch);
        $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) Response::error("Curl error: " . $curlError, 503);
        if ($httpCode !== 200) Response::error("AI error: " . $response, 503);

        $result     = json_decode($response, true);
        $suggestion = $result['choices'][0]['message']['content'] ?? '';

        Response::json(["suggestion" => $suggestion]);
    }
}