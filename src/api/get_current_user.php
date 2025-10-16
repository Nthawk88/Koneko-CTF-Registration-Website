<?php
require_once 'db.php';
require_once 'utils.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    // Debug: Check session state
    start_secure_session();
    $sessionId = session_id();
    $userId = $_SESSION['user_id'] ?? null;
    
    $user = getCurrentUser();
    
    if (!$user) {
        json_response(401, [
            'error' => 'Not authenticated',
            'debug' => [
                'session_id' => $sessionId,
                'user_id_in_session' => $userId,
                'session_status' => session_status()
            ]
        ]);
    }
    
    // Remove sensitive data
    unset($user['password_hash']);
    
    json_response(200, [
        'user' => [
            'id' => (int)$user['id'],
            'fullName' => $user['full_name'],
            'email' => $user['email'],
            'username' => $user['username'],
            'avatarUrl' => $user['avatar_url'],
            'bio' => $user['bio'],
            'location' => $user['location'],
            'role' => $user['role'],
            'createdAt' => $user['created_at'],
            'updatedAt' => $user['updated_at']
        ]
    ]);
    
} catch (Exception $e) {
    json_response(500, ['error' => 'Server error']);
}
?>
