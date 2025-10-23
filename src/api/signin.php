<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	json_response(405, ['error' => 'Method Not Allowed']);
}

try {
	$input = get_json_input();
} catch (InvalidArgumentException $e) {
	json_response(400, ['error' => $e->getMessage()]);
}

$identifier = sanitize_string($input['identifier'] ?? '');
$password = (string) ($input['password'] ?? '');

if ($identifier === '' || $password === '') {
	json_response(400, ['error' => 'Email/username and password are required']);
}

if (strlen($password) > 128) {
	json_response(400, ['error' => 'Password too long']);
}

try {
	$pdo = get_pdo();
	$stmt = $pdo->prepare('SELECT id, full_name, email, username, password_hash, avatar_url, bio, location, role, created_at, updated_at
		FROM users WHERE email = :identifier OR username = :identifier LIMIT 1');
	$stmt->execute([':identifier' => $identifier]);
	$user = $stmt->fetch();

	if (!$user || !password_verify($password, $user['password_hash'])) {
		json_response(401, ['error' => 'Invalid credentials']);
	}

	loginUser((int) $user['id']);

	json_response(200, [
		'message' => 'Signed in successfully',
		'user' => format_user_response($user),
	]);
} catch (Throwable $e) {
	json_response(500, ['error' => 'Server error']);
}
