<?php

function json_response(int $statusCode, array $data): void {
	http_response_code($statusCode);
	header('Content-Type: application/json');
	header('Cache-Control: no-store');
	echo json_encode($data);
	exit;
}

function get_json_input(): array {
	$raw = file_get_contents('php://input');
	if ($raw === false || $raw === '') {
		return [];
	}
	$decoded = json_decode($raw, true);
	return is_array($decoded) ? $decoded : [];
}

function sanitize_string(?string $value): string {
	return htmlspecialchars(trim($value ?? ''), ENT_QUOTES, 'UTF-8');
}

function validate_email(string $email): bool {
	return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function start_secure_session(): void {
	if (session_status() !== PHP_SESSION_ACTIVE) {
		$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] === '443');
		if (PHP_VERSION_ID >= 70300) {
			session_set_cookie_params([
				'lifetime' => 0,
				'path' => '/',
				'domain' => '',
				'secure' => $secure,
				'httponly' => true,
				'samesite' => 'Lax',
			]);
		} else {
			session_set_cookie_params(0, '/; samesite=Lax', '', $secure, true);
		}
		session_start();
	}
}

function getCurrentUser(): ?array {
	start_secure_session();
	
	// Check if session is valid and has user_id
	if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
		return null;
	}
	
	$pdo = get_pdo();
	$stmt = $pdo->prepare("SELECT id, full_name, email, username, avatar_url, bio, location, role, created_at, updated_at FROM users WHERE id = ?");
	$stmt->execute([$_SESSION['user_id']]);
	$user = $stmt->fetch(PDO::FETCH_ASSOC);
	
	// If user not found in database, clear session
	if (!$user) {
		$_SESSION = array();
		return null;
	}
	
	return $user;
}

function getUserById(int $userId): ?array {
	$pdo = get_pdo();
	$stmt = $pdo->prepare("SELECT id, full_name, email, username, avatar_url, bio, location, role, created_at, updated_at FROM users WHERE id = ?");
	$stmt->execute([$userId]);
	$user = $stmt->fetch(PDO::FETCH_ASSOC);
	
	return $user ?: null;
}

function loginUser(int $userId): void {
	start_secure_session();
	$_SESSION['user_id'] = $userId;
}

function logoutUser(): void {
	start_secure_session();
	
	// Clear all session variables
	$_SESSION = array();
	
	// Delete the session cookie
	if (ini_get("session.use_cookies")) {
		$params = session_get_cookie_params();
		setcookie(session_name(), '', time() - 42000,
			$params["path"], $params["domain"],
			$params["secure"], $params["httponly"]
		);
	}
	
	// Destroy the session
	session_destroy();
}
