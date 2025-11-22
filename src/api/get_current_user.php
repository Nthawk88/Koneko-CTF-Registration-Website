<?php

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';

try {
	start_secure_session();
	$user = getCurrentUser();

	if (!$user) {
		json_response(401, ['error' => 'Not authenticated']);
	}

	$response = ['user' => format_user_response($user)];
	if (!empty($_SESSION['csrf_token'])) {
		$response['csrf_token'] = $_SESSION['csrf_token'];
	}

	json_response(200, $response);
} catch (Throwable $e) {
	json_response(500, ['error' => 'Server error']);
}
