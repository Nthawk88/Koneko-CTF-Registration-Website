<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';
require_once 'utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input: ' . json_last_error_msg());
    }
    
    // Get user from session or token
    $user = getCurrentUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
    
    $userId = $user['id'];
    
    // Validate and prepare updates
    $params = [':user_id' => $userId];
    $updates = [];
    
    if (isset($input['full_name'])) {
        $fullName = trim($input['full_name']);
        if (empty($fullName) || strlen($fullName) > 100) {
            throw new Exception('Full name must be between 1-100 characters');
        }
        $updates[] = "full_name = :full_name";
        $params[':full_name'] = $fullName;
    }
    
    if (isset($input['email'])) {
        $email = trim($input['email']);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format');
        }
        // Check if email already exists for another user
        $pdo = get_pdo();
        $checkEmail = $pdo->prepare("SELECT id FROM users WHERE email = :email AND id != :user_id");
        $checkEmail->execute([':email' => $email, ':user_id' => $userId]);
        if ($checkEmail->fetch()) {
            throw new Exception('Email already exists');
        }
        $updates[] = "email = :email";
        $params[':email'] = $email;
    }
    
    if (isset($input['location'])) {
        $location = trim($input['location']);
        if (strlen($location) > 100) {
            throw new Exception('Location must be less than 100 characters');
        }
        $updates[] = "location = :location";
        $params[':location'] = $location;
    }
    
    if (isset($input['bio'])) {
        $bio = trim($input['bio']);
        if (strlen($bio) > 500) {
            throw new Exception('Bio must be less than 500 characters');
        }
        $updates[] = "bio = :bio";
        $params[':bio'] = $bio;
    }
    
    if (empty($updates)) {
        throw new Exception('No valid fields to update');
    }
    
    // Add updated_at
    $updates[] = "updated_at = NOW()";
    
    // Execute update
    $pdo = get_pdo();
    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :user_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Get updated user data
    $updatedUser = getUserById($userId);
    
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user' => $updatedUser
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage(), 'debug' => [
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]]);
}
?>
