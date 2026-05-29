<?php
class Validator {

    // Check required fields exist and are not empty
    public static function required($data, $fields) {
        foreach ($fields as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                return "Field '$field' is required";
            }
        }
        return null;
    }

    // Check email format is valid
    public static function email($email) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return "Invalid email format";
        }
        return null;
    }

    // Check password is long enough
    public static function password($password) {
        if (strlen($password) < 8) {
            return "Password must be at least 8 characters";
        }
        return null;
    }

    // Sanitize string to prevent XSS
    public static function sanitize($value) {
        return htmlspecialchars(strip_tags(trim($value)));
    }
}
