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
		// Configure cookie params before session_start
		if (PHP_VERSION_ID >= 70300) {
			// SameSite support with array syntax (PHP 7.3+)
			session_set_cookie_params([
				'lifetime' => 0,
				'path' => '/',
				'domain' => '',
				'secure' => $secure,
				'httponly' => true,
				'samesite' => 'Lax',
			]);
		} else {
			// Best-effort fallback for older PHP versions
			session_set_cookie_params(0, '/; samesite=Lax', '', $secure, true);
		}
		session_start();
	}
}
