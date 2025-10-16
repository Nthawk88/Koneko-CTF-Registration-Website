<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	json_response(405, ['error' => 'Method Not Allowed']);
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
start_secure_session();

$input = get_json_input();
$identifier = sanitize_string($input['identifier'] ?? '');
$password = (string)($input['password'] ?? '');

if ($identifier === '' || $password === '') {
	json_response(400, ['error' => 'Email/username and password are required']);
}

if (strlen($password) > 128) {
	json_response(400, ['error' => 'Password too long']);
}

try {
	$pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT id, full_name, email, username, password_hash, avatar_url, bio, location FROM users WHERE email = :email OR username = :username LIMIT 1');
    $stmt->execute([':email' => $identifier, ':username' => $identifier]);
	$user = $stmt->fetch();
	if (!$user || !password_verify($password, $user['password_hash'])) {
		json_response(401, ['error' => 'Invalid credentials']);
	}

    loginUser((int)$user['id']);

    if (function_exists('session_regenerate_id')) {
        session_regenerate_id(true);
    }

    $responseUser = [
        'id' => (int)$user['id'],
        'fullName' => $user['full_name'],
        'email' => $user['email'],
        'username' => $user['username'],
        'avatarUrl' => $user['avatar_url'],
        'bio' => $user['bio'],
        'location' => $user['location'],
    ];

    json_response(200, ['message' => 'Signed in successfully', 'user' => $responseUser]);
} catch (Throwable $e) {
	json_response(500, ['error' => 'Server error']);
}
