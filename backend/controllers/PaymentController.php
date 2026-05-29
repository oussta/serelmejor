<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class PaymentController {

    // POST /payment/create-intent
    public static function createIntent() {
        \Stripe\Stripe::setApiKey(getenv('STRIPE_SECRET'));
        
        $user  = AuthMiddleware::handle();
        $data  = json_decode(file_get_contents("php://input"), true);
        $error = Validator::required($data, ['plan']);
        if ($error) Response::error($error, 400);

        $plan = Validator::sanitize($data['plan']);

        $prices = [
            'salesflow' => 2900,
            'stockflow' => 2900,
            'full'      => 4900,
        ];

        if (!isset($prices[$plan])) {
            Response::error("Invalid plan", 400);
        }

        try {
            $intent = \Stripe\PaymentIntent::create([
                'amount'   => $prices[$plan],
                'currency' => 'eur',
                'metadata' => [
                    'user_id'     => $user['user_id'],
                    'business_id' => $user['business_id'],
                    'plan'        => $plan,
                ]
            ]);

            Response::json([
                'client_secret' => $intent->client_secret,
                'amount'        => $prices[$plan],
                'plan'          => $plan,
            ]);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    // POST /payment/confirm
    public static function confirm() {
        \Stripe\Stripe::setApiKey(getenv('STRIPE_SECRET'));

        $user  = AuthMiddleware::handle();
        $data  = json_decode(file_get_contents("php://input"), true);
        $error = Validator::required($data, ['plan', 'payment_intent_id']);
        if ($error) Response::error($error, 400);

        $plan              = Validator::sanitize($data['plan']);
        $payment_intent_id = Validator::sanitize($data['payment_intent_id']);

        try {
            $intent = \Stripe\PaymentIntent::retrieve($payment_intent_id);

            if ($intent->status !== 'succeeded') {
                Response::error("Payment not completed", 400);
            }

            $price = match($plan) {
                'salesflow' => 29.00,
                'stockflow' => 29.00,
                'full'      => 49.00,
                default     => 0.00,
            };

            $pdo = getDB();

            $stmt = $pdo->prepare("UPDATE businesses SET subscription_plan = ? WHERE id = ?");
            $stmt->execute([$plan, $user['business_id']]);

            $stmt = $pdo->prepare("SELECT id FROM subscriptions WHERE business_id = ?");
            $stmt->execute([$user['business_id']]);
            $sub = $stmt->fetch();

            if ($sub) {
                $stmt = $pdo->prepare("UPDATE subscriptions SET plan = ?, price = ?, status = 'active' WHERE business_id = ?");
                $stmt->execute([$plan, $price, $user['business_id']]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO subscriptions (business_id, plan, price, status) VALUES (?, ?, ?, 'active')");
                $stmt->execute([$user['business_id'], $plan, $price]);
            }

            Response::json([
                "message" => "Plan activated successfully",
                "plan"    => $plan,
                "price"   => $price
            ]);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            Response::error($e->getMessage(), 500);
        }
    }
}
