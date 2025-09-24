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
	return trim(filter_var($value ?? '', FILTER_UNSAFE_RAW));
}

function validate_email(string $email): bool {
	return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function start_secure_session(): void {
	if (session_status() !== PHP_SESSION_ACTIVE) {
		session_start();
	}
}
