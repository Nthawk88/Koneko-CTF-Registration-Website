<?php

function json_response(int $statusCode, array $data): void {
	http_response_code($statusCode);
	header('Content-Type: application/json');
	header('Cache-Control: no-store');
	echo json_encode($data, JSON_UNESCAPED_SLASHES);
	exit;
}

function get_json_input(): array {
	$raw = file_get_contents('php://input');
	if ($raw === false || $raw === '') {
		return [];
	}

	$decoded = json_decode($raw, true);
	if (!is_array($decoded) || json_last_error() !== JSON_ERROR_NONE) {
		throw new InvalidArgumentException('Invalid JSON payload.');
	}

	return $decoded;
}

function sanitize_string(?string $value): string {
	return trim($value ?? '');
}

function validate_email(string $email): bool {
	return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function start_secure_session(): void {
	if (session_status() === PHP_SESSION_ACTIVE) {
		return;
	}

	session_start([
		'use_strict_mode' => 1,
		'use_cookies' => 1,
		'use_only_cookies' => 1,
		'cookie_httponly' => 1,
		'cookie_secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] === '443') ? 1 : 0,
		'cookie_samesite' => 'Lax',
	]);
}

function getCurrentUser(): ?array {
	start_secure_session();

	$userId = $_SESSION['user_id'] ?? null;
	if (!$userId) {
		return null;
	}

	$pdo = get_pdo();
	$stmt = $pdo->prepare('SELECT id, full_name, email, username, avatar_url, bio, location, role, created_at, updated_at FROM users WHERE id = ?');
	$stmt->execute([$userId]);
	$user = $stmt->fetch(PDO::FETCH_ASSOC);

	if (!$user) {
		logoutUser();
		return null;
	}

	return $user;
}

function getUserById(int $userId): ?array {
	$pdo = get_pdo();
	$stmt = $pdo->prepare('SELECT id, full_name, email, username, avatar_url, bio, location, role, created_at, updated_at FROM users WHERE id = ?');
	$stmt->execute([$userId]);
	$user = $stmt->fetch(PDO::FETCH_ASSOC);

	return $user ?: null;
}

function loginUser(int $userId): void {
	start_secure_session();
	$_SESSION['user_id'] = $userId;
	session_regenerate_id(true);
}

function logoutUser(): void {
	start_secure_session();

	$_SESSION = [];

	if (ini_get('session.use_cookies')) {
		$params = session_get_cookie_params();
		setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
	}

	if (session_status() === PHP_SESSION_ACTIVE) {
		session_destroy();
	}
}

function format_user_response(array $user): array {
	return [
		'id' => (int)($user['id'] ?? 0),
		'fullName' => $user['full_name'] ?? $user['fullName'] ?? null,
		'email' => $user['email'] ?? null,
		'username' => $user['username'] ?? null,
		'avatarUrl' => $user['avatar_url'] ?? $user['avatarUrl'] ?? null,
		'bio' => $user['bio'] ?? null,
		'location' => $user['location'] ?? null,
		'role' => $user['role'] ?? null,
		'createdAt' => $user['created_at'] ?? $user['createdAt'] ?? null,
		'updatedAt' => $user['updated_at'] ?? $user['updatedAt'] ?? null,
	];
}
