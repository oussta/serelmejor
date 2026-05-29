<?php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTHelper {

    // Creates a token when user logs in
    public static function generate($payload) {
           $secret = getenv('JWT_SECRET');
    error_log("JWT_SECRET value: " . var_export($secret, true));
        $secret  = getenv('JWT_SECRET');
        $expiry  = getenv('JWT_EXPIRY');

        $payload['iat'] = time();
        $payload['exp'] = time() + (int)$expiry;

        return JWT::encode($payload, $secret, 'HS256');
    }

    // Verifies and decodes a token on every protected request
    public static function verify($token) {
        try {
            $secret  = getenv('JWT_SECRET');
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
            return (array) $decoded;
        } catch (Exception $e) {
            return null;
        }
    }
}
