<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';

// Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	json_response(405, ['error' => 'Method Not Allowed']);
}

$input = get_json_input();
$identifier = sanitize_string($input['identifier'] ?? ''); // email or username
$password = (string)($input['password'] ?? '');

if ($identifier === '' || $password === '') {
	json_response(400, ['error' => 'Email/username and password are required']);
}

try {
	$pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT id, full_name, email, username, password_hash FROM users WHERE email = :email OR username = :username LIMIT 1');
    $stmt->execute([':email' => $identifier, ':username' => $identifier]);
	$user = $stmt->fetch();
	if (!$user || !password_verify($password, $user['password_hash'])) {
		json_response(401, ['error' => 'Invalid credentials']);
	}

    // Return user info without creating a PHP session to avoid header issues
    $responseUser = [
        'id' => (int)$user['id'],
        'fullName' => $user['full_name'],
        'email' => $user['email'],
        'username' => $user['username'],
    ];

    json_response(200, ['message' => 'Signed in successfully', 'user' => $responseUser]);
} catch (Throwable $e) {
	json_response(500, [
		'error' => 'Server error',
		'exception' => get_class($e),
		'message' => $e->getMessage(),
	]);
}
