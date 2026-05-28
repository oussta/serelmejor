<?php



// DEBUG — remove after testing
$debugPath = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
if ($debugPath === 'debug') {
    echo json_encode([
        'DB_HOST' => getenv('DB_HOST') ?: 'NOT SET',
        'DB_NAME' => getenv('DB_NAME') ?: 'NOT SET',
        'DB_USER' => getenv('DB_USER') ?: 'NOT SET',
        'APP_ENV' => getenv('APP_ENV') ?: 'NOT SET',
    ]);
    exit;
}

// rest of your existing code below...
require_once __DIR__ . '/../controllers/AuthController.php';

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/BusinessController.php';
require_once __DIR__ . '/../controllers/TeamController.php';
require_once __DIR__ . '/../controllers/ContactController.php';
require_once __DIR__ . '/../controllers/ProductController.php';
require_once __DIR__ . '/../controllers/SupplierController.php';
require_once __DIR__ . '/../controllers/OrderController.php';
require_once __DIR__ . '/../controllers/NotificationController.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/AdminController.php';

$method = $_SERVER['REQUEST_METHOD'];
$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path   = trim($path, '/');
$parts  = explode('/', $path);

// Parse request body once
$body = json_decode(file_get_contents('php://input'), true) ?? [];
// ── Auth ──────────────────────────────────────────────────


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
elseif ($path === 'cancel-subscription' && $method === 'POST') {
    AuthController::cancelSubscription();
}

// ── Business ──────────────────────────────────────────────
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

// ── Team ──────────────────────────────────────────────────
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

// ── Payment ───────────────────────────────────────────────
elseif ($path === 'payment/create-intent' && $method === 'POST') {
    require_once __DIR__ . '/../controllers/PaymentController.php';
    PaymentController::createIntent();
}
elseif ($path === 'payment/confirm' && $method === 'POST') {
    require_once __DIR__ . '/../controllers/PaymentController.php';
    PaymentController::confirm();
}


// ── Leads ─────────────────────────────────────────────────
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

// ── AI ────────────────────────────────────────────────────
elseif ($path === 'ai/draft-response' && $method === 'POST') {
    require_once __DIR__ . '/../controllers/AIController.php';
    AIController::draftResponse();
}

// ── Contact ───────────────────────────────────────────────
elseif ($path === 'contact' && $method === 'POST') {
   
   
    $db         = getDB();
    $controller = new ContactController($db);
    $controller->store($body);
}
// ── Products ──────────────────────────────────────────────
elseif ($path === 'products' && $method === 'GET') {
   
   
    $controller = new ProductController(getDB());
    $controller->getAll();
}
elseif ($path === 'products' && $method === 'POST') {
    
  
    $controller = new ProductController(getDB());
    $controller->create($body);
}
elseif ($path === 'products/low-stock' && $method === 'GET') {
  
   
    $controller = new ProductController(getDB());
    $controller->getLowStock();
}
elseif ($parts[0] === 'products' && isset($parts[1]) && !isset($parts[2]) && $method === 'GET') {
   
    $controller = new ProductController(getDB());
    $controller->getOne((int)$parts[1]);
}
elseif ($parts[0] === 'products' && isset($parts[1]) && !isset($parts[2]) && $method === 'PUT') {
   
    
    $controller = new ProductController(getDB());
    $controller->update((int)$parts[1], $body);
}
elseif ($parts[0] === 'products' && isset($parts[1]) && !isset($parts[2]) && $method === 'DELETE') {
  
    
    $controller = new ProductController(getDB());
    $controller->delete((int)$parts[1]);
}
elseif ($parts[0] === 'products' && isset($parts[1]) && isset($parts[2]) && $parts[2] === 'sale' && $method === 'POST') {
   
   
    $controller = new ProductController(getDB());
    $controller->sale((int)$parts[1], $body);
}
elseif ($parts[0] === 'products' && isset($parts[1]) && isset($parts[2]) && $parts[2] === 'restock' && $method === 'POST') {
   
   
    $controller = new ProductController(getDB());
    $controller->restock((int)$parts[1], $body);
}
elseif ($parts[0] === 'products' && isset($parts[1]) && isset($parts[2]) && $parts[2] === 'movements' && $method === 'GET') {
   
  
    $controller = new ProductController(getDB());
    $controller->getMovements((int)$parts[1]);
}

// ── Suppliers ─────────────────────────────────────────────
elseif ($path === 'suppliers' && $method === 'GET') {
   
   
    $controller = new SupplierController(getDB());
    $controller->getAll();
}
elseif ($path === 'suppliers' && $method === 'POST') {
   
   
    $controller = new SupplierController(getDB());
    $controller->create($body);
}
elseif ($parts[0] === 'suppliers' && isset($parts[1]) && !isset($parts[2]) && $method === 'GET') {
    
   
    $controller = new SupplierController(getDB());
    $controller->getOne((int)$parts[1]);
}
elseif ($parts[0] === 'suppliers' && isset($parts[1]) && !isset($parts[2]) && $method === 'PUT') {
   
    
    $controller = new SupplierController(getDB());
    $controller->update((int)$parts[1], $body);
}
elseif ($parts[0] === 'suppliers' && isset($parts[1]) && !isset($parts[2]) && $method === 'DELETE') {
    
    
    $controller = new SupplierController(getDB());
    $controller->delete((int)$parts[1]);
}
elseif ($parts[0] === 'suppliers' && isset($parts[1]) && isset($parts[2]) && $parts[2] === 'orders' && $method === 'GET') {
   
  
    $controller = new SupplierController(getDB());
    $controller->getOrders((int)$parts[1]);
}

// ── Orders ────────────────────────────────────────────────
elseif ($path === 'orders' && $method === 'GET') {
   
   
    $controller = new OrderController(getDB());
    $controller->getAll();
}
elseif ($path === 'orders' && $method === 'POST') {
    
    
    $controller = new OrderController(getDB());
    $controller->create($body);
}
elseif ($parts[0] === 'orders' && isset($parts[1]) && !isset($parts[2]) && $method === 'GET') {
    
 
    $controller = new OrderController(getDB());
    $controller->getOne((int)$parts[1]);
}
elseif ($parts[0] === 'orders' && isset($parts[1]) && !isset($parts[2]) && $method === 'PUT') {
    
   
    $controller = new OrderController(getDB());
    $controller->update((int)$parts[1], $body);
}
elseif ($parts[0] === 'orders' && isset($parts[1]) && !isset($parts[2]) && $method === 'DELETE') {
    
    
    $controller = new OrderController(getDB());
    $controller->delete((int)$parts[1]);
}
elseif ($parts[0] === 'orders' && isset($parts[1]) && isset($parts[2]) && $parts[2] === 'send' && $method === 'POST') {
    
   
    $controller = new OrderController(getDB());
    $controller->send((int)$parts[1]);
}
elseif ($parts[0] === 'orders' && isset($parts[1]) && isset($parts[2]) && $parts[2] === 'confirm' && $method === 'PUT') {
    
  
    $controller = new OrderController(getDB());
    $controller->confirm((int)$parts[1]);
}
elseif ($parts[0] === 'orders' && isset($parts[1]) && isset($parts[2]) && $parts[2] === 'deliver' && $method === 'PUT') {
    
    
    $controller = new OrderController(getDB());
    $controller->deliver((int)$parts[1]);
}
// ── Notifications ─────────────────────────────────────────
elseif ($path === 'notifications' && $method === 'GET') {
    
    $controller = new NotificationController(getDB());
    $controller->getAll();
}
elseif ($path === 'notifications/read-all' && $method === 'PUT') {
   
    $controller = new NotificationController(getDB());
    $controller->markAllRead();
}
elseif ($parts[0] === 'notifications' && isset($parts[1]) && isset($parts[2]) && $parts[2] === 'read' && $method === 'PUT') {
   
    $controller = new NotificationController(getDB());
    $controller->markRead((int)$parts[1]);
}
elseif ($parts[0] === 'notifications' && isset($parts[1]) && !isset($parts[2]) && $method === 'DELETE') {
  
   
    $controller = new NotificationController(getDB());
    $controller->delete((int)$parts[1]);
}
// ── Admin ─────────────────────────────────────────────────
elseif ($path === 'admin/stats' && $method === 'GET') {
    $controller = new AdminController(getDB());
    $controller->getStats();
}
elseif ($path === 'admin/businesses' && $method === 'GET') {
    $controller = new AdminController(getDB());
    $controller->getBusinesses();
}
elseif ($path === 'admin/users' && $method === 'GET') {
    $controller = new AdminController(getDB());
    $controller->getUsers();
}
elseif ($parts[0] === 'admin' && isset($parts[1]) && $parts[1] === 'businesses' && isset($parts[2]) && !isset($parts[3]) && $method === 'GET') {
    $controller = new AdminController(getDB());
    $controller->getBusiness((int)$parts[2]);
}
elseif ($parts[0] === 'admin' && isset($parts[1]) && $parts[1] === 'businesses' && isset($parts[2]) && !isset($parts[3]) && $method === 'DELETE') {
    $controller = new AdminController(getDB());
    $controller->deleteBusiness((int)$parts[2]);
}

// ── 404 ───────────────────────────────────────────────────
else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found', 'path' => $path]);
}