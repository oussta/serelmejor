<?php
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/BusinessController.php';
require_once __DIR__ . '/../controllers/TeamController.php';

$method = $_SERVER['REQUEST_METHOD'];
$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$path  = trim($path, '/');
$parts = explode('/', $path);

// Auth routes
if ($path === 'register' && $method === 'POST') {
    AuthController::register();
}
elseif ($path === 'login' && $method === 'POST') {
    AuthController::login();
}
elseif ($path === 'me' && $method === 'GET') {
    AuthController::me();
}
elseif ($path === 'logout' && $method === 'POST') {
    AuthController::logout();
}
elseif ($path === 'forgot-password' && $method === 'POST') {
    AuthController::forgotPassword();
}
elseif ($path === 'reset-password' && $method === 'POST') {
    AuthController::resetPassword();
}

// Business routes
elseif ($path === 'business' && $method === 'GET') {
    BusinessController::get();
}
elseif ($path === 'business' && $method === 'PUT') {
    BusinessController::update();
}
elseif ($path === 'business/stats' && $method === 'GET') {
    BusinessController::stats();
}
elseif ($path === 'business/subscription' && $method === 'PUT') {
    BusinessController::updateSubscription();
}

// Team routes
elseif ($path === 'team' && $method === 'GET') {
    TeamController::getAll();
}
elseif ($path === 'team/invite' && $method === 'POST') {
    TeamController::invite();
}
elseif ($parts[0] === 'team' && isset($parts[1]) && isset($parts[2]) && $parts[2] === 'role' && $method === 'PUT') {
    TeamController::updateRole($parts[1]);
}
elseif ($parts[0] === 'team' && isset($parts[1]) && $method === 'DELETE') {
    TeamController::delete($parts[1]);
}

// Payment routes
elseif ($path === 'payment/create-intent' && $method === 'POST') {
    require_once __DIR__ . '/../controllers/PaymentController.php';
    PaymentController::createIntent();
}
elseif ($path === 'payment/confirm' && $method === 'POST') {
    require_once __DIR__ . '/../controllers/PaymentController.php';
    PaymentController::confirm();
}

// Lead routes
elseif ($path === 'leads' && $method === 'GET') {
    require_once __DIR__ . '/../controllers/LeadController.php';
    LeadController::getAll();
}
elseif ($path === 'leads' && $method === 'POST') {
    require_once __DIR__ . '/../controllers/LeadController.php';
    LeadController::create();
}
elseif ($path === 'leads/stats' && $method === 'GET') {
    require_once __DIR__ . '/../controllers/LeadController.php';
    LeadController::stats();
}
elseif ($parts[0] === 'leads' && isset($parts[1]) && !isset($parts[2]) && $method === 'GET') {
    require_once __DIR__ . '/../controllers/LeadController.php';
    LeadController::getOne($parts[1]);
}
elseif ($parts[0] === 'leads' && isset($parts[1]) && !isset($parts[2]) && $method === 'PUT') {
    require_once __DIR__ . '/../controllers/LeadController.php';
    LeadController::update($parts[1]);
}
elseif ($parts[0] === 'leads' && isset($parts[1]) && !isset($parts[2]) && $method === 'DELETE') {
    require_once __DIR__ . '/../controllers/LeadController.php';
    LeadController::delete($parts[1]);
}
elseif ($parts[0] === 'leads' && isset($parts[1]) && isset($parts[2]) && $parts[2] === 'status' && $method === 'PUT') {
    require_once __DIR__ . '/../controllers/LeadController.php';
    LeadController::updateStatus($parts[1]);
}
elseif ($parts[0] === 'leads' && isset($parts[1]) && isset($parts[2]) && $parts[2] === 'messages' && !isset($parts[3]) && $method === 'GET') {
    require_once __DIR__ . '/../controllers/LeadController.php';
    LeadController::getMessages($parts[1]);
}
elseif ($parts[0] === 'leads' && isset($parts[1]) && isset($parts[2]) && $parts[2] === 'messages' && !isset($parts[3]) && $method === 'POST') {
    require_once __DIR__ . '/../controllers/LeadController.php';
    LeadController::addMessage($parts[1]);
}
elseif ($parts[0] === 'leads' && isset($parts[1]) && isset($parts[2]) && $parts[2] === 'messages' && isset($parts[3]) && $method === 'PUT') {
    require_once __DIR__ . '/../controllers/LeadController.php';
    LeadController::updateMessage($parts[1], $parts[3]);
}
elseif ($parts[0] === 'leads' && isset($parts[1]) && isset($parts[2]) && $parts[2] === 'messages' && isset($parts[3]) && $method === 'DELETE') {
    require_once __DIR__ . '/../controllers/LeadController.php';
    LeadController::deleteMessage($parts[1], $parts[3]);
}
elseif ($parts[0] === 'leads' && isset($parts[1]) && isset($parts[2]) && $parts[2] === 'followups' && !isset($parts[3]) && $method === 'GET') {
    require_once __DIR__ . '/../controllers/LeadController.php';
    LeadController::getFollowups($parts[1]);
}
elseif ($parts[0] === 'leads' && isset($parts[1]) && isset($parts[2]) && $parts[2] === 'followups' && !isset($parts[3]) && $method === 'POST') {
    require_once __DIR__ . '/../controllers/LeadController.php';
    LeadController::createFollowup($parts[1]);
}
elseif ($parts[0] === 'leads' && isset($parts[1]) && isset($parts[2]) && $parts[2] === 'followups' && isset($parts[3]) && $method === 'PUT') {
    require_once __DIR__ . '/../controllers/LeadController.php';
    LeadController::updateFollowup($parts[1], $parts[3]);
}

// No route matched
else {
    http_response_code(404);
    echo json_encode(["error" => "Route not found", "path" => $path]);
}